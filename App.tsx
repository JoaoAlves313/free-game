
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import GameCard from './components/GameCard';
import HypothesisCard from './components/HypothesisCard';
import NotificationSettings from './components/NotificationSettings';
import Footer from './components/Footer';
import { fetchFreeGames } from './services/gameService';
import { Game } from './types';
import { Loader2, ShoppingBag, MonitorSmartphone, Bell, BellOff } from 'lucide-react';

declare global {
  interface Window {
    OneSignal: any;
    OneSignalDeferred: any[];
  }
}

const RAW_LEAK_DATA = [
  { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
  { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 },
  { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 },
  { day: 30 }, { day: 31 }
];

const stores = ['Steam', 'Epic Games'];
const platformOptions = ['Todos', 'PC', 'Android'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offers' | 'leaks'>('offers');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStores, setSelectedStores] = useState<string[]>(['Steam', 'Epic Games']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Todos']);

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    return localStorage.getItem('notif_enabled') !== 'false';
  });

  const identifyStore = (game: Game) => {
    const p = game.platforms.toLowerCase();
    const i = game.instructions.toLowerCase();
    if (p.includes('steam') || i.includes('steam')) return 'Steam';
    if (p.includes('epic') || i.includes('epic')) return 'Epic Games';
    return 'Other';
  };

  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      setIsSubscribed(OneSignal.Notifications.permission);
      OneSignal.Notifications.addEventListener("permissionChange", (permission: boolean) => {
        setIsSubscribed(permission);
      });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('notif_enabled', String(notifEnabled));
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(function(OneSignal: any) {
      if (isSubscribed && OneSignal.User) {
        try {
          OneSignal.User.addTags({
            notifications_enabled: notifEnabled ? "true" : "false"
          });
        } catch (e) {}
      }
    });
  }, [notifEnabled, isSubscribed]);

  const handleSendTest = useCallback(() => {
    if (Notification.permission === "granted") {
      new Notification("FreeGameHunter", {
        body: "Teste de notificação ativo!",
        icon: "https://www.gamerpower.com/favicon.ico"
      });
    } else {
      alert("Por favor, autorize as notificações primeiro.");
    }
  }, []);

  const checkAndNotifyLocal = useCallback((newGames: Game[]) => {
    if (!notifEnabled || Notification.permission !== 'granted') return;

    let lastSeenIds: number[] = [];
    try {
      lastSeenIds = JSON.parse(localStorage.getItem('last_seen_ids') || '[]');
    } catch (e) { lastSeenIds = []; }

    const newMatches = newGames.filter(game => {
      const store = identifyStore(game);
      return (store === 'Steam' || store === 'Epic Games') && !lastSeenIds.includes(game.id);
    });

    if (newMatches.length > 0) {
      newMatches.forEach(game => {
        new Notification(`Novo Jogo: ${game.title}`, {
          body: `Disponível na ${identifyStore(game)}!`,
          icon: game.thumbnail
        });
      });
    }

    const allIds = Array.from(new Set([...lastSeenIds, ...newGames.map(g => g.id)]));
    localStorage.setItem('last_seen_ids', JSON.stringify(allIds.slice(-100)));
  }, [notifEnabled]);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const data = await fetchFreeGames();
        const filteredData = (data.games || []).filter(g => {
          const s = identifyStore(g);
          return s === 'Steam' || s === 'Epic Games';
        });
        
        setGames(filteredData);
        setError(null);
        if (filteredData.length > 0) {
          checkAndNotifyLocal(filteredData);
        }
      } catch (err) {
        setError("Falha ao carregar.");
      } finally {
        setLoading(false);
      }
    };
    loadGames();
    const interval = setInterval(loadGames, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAndNotifyLocal]);

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
      .map(item => ({ title: "Presente Misterioso", day: item.day }));
  }, []);

  const toggleStore = (store: string) => {
    setSelectedStores(prev => 
      prev.includes(store) 
        ? (prev.length > 1 ? prev.filter(s => s !== store) : prev) 
        : [...prev, store]
    );
  };

  const togglePlatform = (platform: string) => {
    if (platform === 'Todos') {
      setSelectedPlatforms(['Todos']);
      return;
    }
    setSelectedPlatforms(prev => {
      let next = prev.filter(p => p !== 'Todos');
      if (next.includes(platform)) {
        next = next.filter(p => p !== platform);
        return next.length === 0 ? ['Todos'] : next;
      }
      return [...next, platform];
    });
  };

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const storeMatch = selectedStores.includes(identifyStore(game));
      if (!storeMatch) return false;
      if (selectedPlatforms.includes('Todos')) return true;
      const p = game.platforms.toLowerCase();
      let platformMatch = false;
      if (selectedPlatforms.includes('PC')) {
        if (p.includes('pc') || p.includes('steam') || p.includes('windows') || p.includes('epic')) platformMatch = true;
      }
      if (selectedPlatforms.includes('Android')) {
        if (p.includes('android')) platformMatch = true;
      }
      return platformMatch;
    });
  }, [games, selectedStores, selectedPlatforms]);

  return (
    <div className="min-h-screen bg-gaming-900 flex flex-col font-sans text-slate-200">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <NotificationSettings 
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          enabled={notifEnabled}
          isCloudSynced={false}
          onToggleEnabled={() => setNotifEnabled(!notifEnabled)}
          onSendTest={handleSendTest}
          onRequestPermission={() => {
            window.OneSignalDeferred.push((OS: any) => OS.Notifications.requestPermission());
          }}
          permissionStatus={isSubscribed ? 'granted' : 'default'}
        />

        {activeTab === 'offers' && (
          <>
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-gaming-accent animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Buscando ofertas...</p>
              </div>
            )}
            
            {!loading && !error && (
              <div className="space-y-10 animate-fade-in">
                {/* Simplified Filter Bar */}
                <div className="bg-gaming-800/40 border border-gaming-700 rounded-3xl p-6 backdrop-blur-sm flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto">
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Lojas</span>
                      <div className="flex gap-2">
                        {stores.map(s => (
                          <button key={s} onClick={() => toggleStore(s)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedStores.includes(s) ? 'bg-gaming-accent text-white border-gaming-accent' : 'bg-gaming-900/50 text-gray-400 border-gaming-700 hover:border-gray-500'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Plataforma</span>
                      <div className="flex gap-2">
                        {platformOptions.map(p => (
                          <button key={p} onClick={() => togglePlatform(p)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedPlatforms.includes(p) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gaming-900/50 text-gray-400 border-gaming-700 hover:border-gray-500'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsNotifModalOpen(true)}
                    className={`flex items-center justify-center gap-3 px-8 py-3 rounded-2xl border font-bold text-sm transition-all w-full md:w-auto ${
                      isSubscribed && notifEnabled
                        ? 'bg-gaming-accent/10 border-gaming-accent/50 text-gaming-accent'
                        : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {isSubscribed && notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    <span>Notificações</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xl font-bold text-white">Jogos Gratuitos</h2>
                    <div className="h-px bg-gaming-700 flex-grow"></div>
                    <span className="text-xs text-gray-500 font-medium">{filteredGames.length} encontrados</span>
                  </div>
                  
                  {filteredGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                      {filteredGames.map((game) => <GameCard key={game.id} game={game} />)}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gaming-800/20 rounded-3xl border border-dashed border-gaming-700">
                      <p className="text-gray-500">Nenhum jogo disponível nestes filtros.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'leaks' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">Calendário de Dezembro</h2>
              <p className="text-gray-400 text-sm">Acompanhe as datas dos drops misteriosos da Epic Games durante o período de festas.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {christmasPresents.map((leak, index) => <HypothesisCard key={index} title={leak.title} day={leak.day} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
