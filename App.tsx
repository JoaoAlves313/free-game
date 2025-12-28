import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import GameCard from './components/GameCard';
import HypothesisCard from './components/HypothesisCard';
import NotificationSettings from './components/NotificationSettings';
import Footer from './components/Footer';
import { fetchFreeGames } from './services/gameService';
import { Game } from './types';
import { Loader2, AlertCircle, ShoppingBag, MonitorSmartphone, Package, Gift, Bell, BellOff } from 'lucide-react';

const RAW_LEAK_DATA = [
  { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
  { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 },
  { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 },
  { day: 30 }, { day: 31 }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offers' | 'leaks'>('offers');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de UI
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Todos']);
  const [selectedStores, setSelectedStores] = useState<string[]>(['Steam', 'Epic Games']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Jogo']);

  // Notificações
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('notif_prefs');
    return saved ? JSON.parse(saved) : { platforms: ['PC'], stores: ['Epic Games', 'Steam'], enabled: true };
  });

  const platforms = ['Todos', 'PC', 'Android'];
  const stores = ['Todas', 'Steam', 'Epic Games', 'GOG', 'Extra'];
  const types = ['Todos', 'Jogo', 'DLC'];

  // Persistir preferências
  useEffect(() => {
    localStorage.setItem('notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  const checkAndNotify = useCallback((newGames: Game[]) => {
    if (!notifPrefs.enabled || permissionStatus !== 'granted') return;

    const lastSeenIds = JSON.parse(localStorage.getItem('last_seen_ids') || '[]');
    const newMatches = newGames.filter(game => {
      if (lastSeenIds.includes(game.id)) return false;

      // Filtro de plataforma do usuário para notificação
      const p = game.platforms.toLowerCase();
      const matchesPlatform = notifPrefs.platforms.some((pref: string) => {
        if (pref === 'PC') return p.includes('pc') || p.includes('steam') || p.includes('windows') || p.includes('epic');
        if (pref === 'Android') return p.includes('android');
        return false;
      });

      // Filtro de loja do usuário para notificação
      const instr = game.instructions.toLowerCase();
      const matchesStore = notifPrefs.stores.some((pref: string) => {
        if (pref === 'Epic Games') return p.includes('epic') || instr.includes('epic');
        if (pref === 'Steam') return p.includes('steam') || instr.includes('steam');
        if (pref === 'GOG') return p.includes('gog') || instr.includes('gog');
        if (pref === 'Extra') return !p.includes('epic') && !p.includes('steam') && !p.includes('gog');
        return false;
      });

      return matchesPlatform && matchesStore;
    });

    if (newMatches.length > 0) {
      newMatches.forEach(game => {
        new Notification(`Novo Jogo Grátis!`, {
          body: `${game.title} está disponível agora!`,
          icon: game.thumbnail
        });
      });
    }

    // Atualiza IDs vistos
    const allIds = Array.from(new Set([...lastSeenIds, ...newGames.map(g => g.id)]));
    localStorage.setItem('last_seen_ids', JSON.stringify(allIds.slice(-200)));
  }, [notifPrefs, permissionStatus]);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const data = await fetchFreeGames();
        setGames(data.games);
        setError(null);
        if (data.games.length > 0) {
          checkAndNotify(data.games);
        }
      } catch (err) {
        setError("Não foi possível carregar as ofertas.");
      } finally {
        setLoading(false);
      }
    };
    loadGames();

    // Polling a cada 10 minutos para novos jogos
    const interval = setInterval(() => {
      loadGames();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAndNotify]);

  const christmasPresents = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    return RAW_LEAK_DATA
      .filter(item => {
        if (currentMonth < 11) return true;
        if (currentMonth > 11) return false;
        return item.day >= currentDay;
      })
      .map(item => ({ title: "Presente Epic Games", day: item.day }));
  }, []);

  const toggleFilter = (currentList: string[], item: string, allValue: string) => {
    if (item === allValue) return [allValue];
    let newList = currentList.filter(i => i !== allValue);
    if (newList.includes(item)) {
      newList = newList.filter(i => i !== item);
      return newList.length === 0 ? [allValue] : newList;
    }
    return [...newList, item];
  };

  const handleToggleNotifPref = (type: 'platforms' | 'stores', value: string) => {
    setNotifPrefs((prev: any) => {
      const list = prev[type];
      const newList = list.includes(value) 
        ? list.filter((v: string) => v !== value)
        : [...list, value];
      return { ...prev, [type]: newList };
    });
  };

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const res = await Notification.requestPermission();
    setPermissionStatus(res);
  };

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const p = game.platforms.toLowerCase();
      const instr = game.instructions.toLowerCase();
      
      let platformMatch = selectedPlatforms.includes('Todos');
      if (!platformMatch) {
        if (selectedPlatforms.includes('PC')) {
          if (p.includes('pc') || p.includes('steam') || p.includes('windows') || p.includes('epic')) platformMatch = true;
        }
        if (selectedPlatforms.includes('Android')) {
          if (p.includes('android')) platformMatch = true;
        }
      }

      let storeMatch = selectedStores.includes('Todas');
      if (!storeMatch) {
        for (const store of selectedStores) {
          if (store === 'Extra') {
            const isMainStore = p.includes('steam') || p.includes('epic') || p.includes('gog') || 
                                instr.includes('steam') || instr.includes('epic') || instr.includes('gog');
            if (!isMainStore) { storeMatch = true; break; }
          } else {
            const storeLower = store.toLowerCase();
            if (p.includes(storeLower) || instr.includes(storeLower) || (store === 'Epic Games' && p.includes('epic'))) {
              storeMatch = true; break;
            }
          }
        }
      }

      let typeMatch = selectedTypes.includes('Todos');
      if (!typeMatch) {
        if (selectedTypes.includes('Jogo') && game.type === 'Game') typeMatch = true;
        if (selectedTypes.includes('DLC') && (game.type === 'DLC' || game.type === 'Expansion')) typeMatch = true;
      }

      return platformMatch && storeMatch && typeMatch;
    });
  }, [games, selectedPlatforms, selectedStores, selectedTypes]);

  return (
    <div className="min-h-screen bg-gaming-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <NotificationSettings 
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          preferences={notifPrefs}
          onTogglePreference={handleToggleNotifPref}
          onToggleEnabled={() => setNotifPrefs((p: any) => ({ ...p, enabled: !p.enabled }))}
          onRequestPermission={requestNotifPermission}
          permissionStatus={permissionStatus}
        />

        {activeTab === 'offers' && (
          <>
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-gaming-accent animate-spin mb-4" />
                <p className="text-gray-400">Carregando ofertas...</p>
              </div>
            )}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center max-w-2xl mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-red-200">{error}</h3>
              </div>
            )}
            {!loading && !error && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold text-[10px] uppercase tracking-wider">
                        <MonitorSmartphone className="w-4 h-4 text-gaming-accent" /> Plataforma
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map(p => (
                          <button key={p} onClick={() => setSelectedPlatforms(toggleFilter(selectedPlatforms, p, 'Todos'))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedPlatforms.includes(p) ? 'bg-gaming-accent text-white border-gaming-accent' : 'bg-gaming-900 text-gray-400 border-gaming-700 hover:text-white'}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold text-[10px] uppercase tracking-wider">
                        <Package className="w-4 h-4 text-green-400" /> Tipo
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {types.map(t => (
                          <button key={t} onClick={() => setSelectedTypes(toggleFilter(selectedTypes, t, 'Todos'))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedTypes.includes(t) ? 'bg-green-600 text-white border-green-500' : 'bg-gaming-900 text-gray-400 border-gaming-700 hover:text-white'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-2 mb-3 text-gray-300 font-bold text-[10px] uppercase tracking-wider">
                        <ShoppingBag className="w-4 h-4 text-gaming-highlight" /> Loja
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stores.map(s => (
                          <button key={s} onClick={() => setSelectedStores(toggleFilter(selectedStores, s, 'Todas'))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedStores.includes(s) ? 'bg-gaming-highlight text-gaming-900 font-bold border-gaming-highlight' : 'bg-gaming-900 text-gray-400 border-gaming-700 hover:text-white'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                    {/* Botão de Notificação integrado na barra de filtros */}
                    <div className="md:col-span-2 flex flex-col justify-end h-full">
                       <div className="hidden md:block mb-3 h-4"></div> {/* Spacer for grid alignment */}
                       <button 
                         onClick={() => setIsNotifModalOpen(true)}
                         className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs transition-all w-full shadow-lg ${
                           notifPrefs.enabled && permissionStatus === 'granted'
                             ? 'bg-gaming-accent border-gaming-accent text-white shadow-gaming-accent/20 hover:bg-gaming-accent/80'
                             : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:text-white hover:border-gaming-accent/50'
                         }`}
                       >
                         {notifPrefs.enabled && permissionStatus === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                         <span>Alertas</span>
                       </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span className="w-2 h-8 bg-gaming-accent rounded-full"></span> Resultados</h2>
                    <span className="text-sm text-gray-400 bg-gaming-800 px-3 py-1 rounded-full border border-gaming-700">{filteredGames.length} Itens</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredGames.map((game) => <GameCard key={game.id} game={game} />)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === 'leaks' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500 inline-flex items-center gap-3">
                <Gift className="w-8 h-8 text-red-500" /> 
                Calendário de Natal Epic Games 
                <Gift className="w-8 h-8 text-green-500" />
              </h2>
              <p className="text-gray-400 mt-2 max-w-2xl mx-auto italic font-bold">Resgate seus presentes diários</p>
            </div>
            {christmasPresents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {christmasPresents.map((leak, index) => <HypothesisCard key={index} title={leak.title} day={leak.day} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-gaming-800/30 rounded-2xl border border-gaming-700">
                 <p className="text-gray-500 font-medium">O calendário de Natal deste ano já se encerrou. Até o próximo!</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;