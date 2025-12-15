import React, { useEffect, useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import GameCard from './components/GameCard';
import HypothesisCard from './components/HypothesisCard';
import Footer from './components/Footer';
import { fetchFreeGames } from './services/geminiService';
import { Game } from './types';
import { Loader2, AlertCircle, Filter, ShoppingBag, MonitorSmartphone, Package, Sparkles } from 'lucide-react';

// Static Data for Leaks/Hypotheses
const LEAK_DATA = [
  { title: "Hogwarts Legacy", day: 11 },
  { title: "Jurassic World Evolution 2", day: 18 },
  { title: "Desperados 3", day: 19 },
  { title: "Total War: Warhammer", day: 20 },
  { title: "Tropico 5", day: 21 },
  { title: "Chicken Police: Paint It Red", day: 22 },
  { title: "Loop Hero", day: 23 },
  { title: "LEGO Batman", day: 24 },
  { title: "Commander Keen", day: 25 },
  { title: "Farming Simulator 2022", day: 26 },
  { title: "Slime Rancher 2", day: 27 },
  { title: "Terraria", day: 28 },
  { title: "Detroit: Become Human", day: 29 },
  { title: "Mortal Kombat 11", day: 30 },
  { title: "Red Dead Redemption 2", day: 31 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offers' | 'leaks'>('offers');
  
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Todos');
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const platforms = ['Todos', 'PC', 'Android'];
  const stores = ['Todas', 'Steam', 'Epic Games', 'GOG', 'Itch.io', 'Ubisoft'];
  const types = ['Todos', 'Jogo', 'DLC'];

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const data = await fetchFreeGames();
        setGames(data.games);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as ofertas no momento. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  // Filter Logic
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const p = game.platforms.toLowerCase();
      
      // Platform Check
      let platformMatch = true;
      if (selectedPlatform === 'PC') {
        platformMatch = p.includes('pc') || p.includes('steam') || p.includes('windows') || p.includes('epic');
      } else if (selectedPlatform === 'Android') {
        platformMatch = p.includes('android');
      }

      // Store Check
      let storeMatch = true;
      if (selectedStore !== 'Todas') {
        const storeLower = selectedStore.toLowerCase();
        // Check platform string or sometimes instruction text for store name
        storeMatch = p.includes(storeLower) || game.instructions.toLowerCase().includes(storeLower);
        
        // Edge case for "Epic Games" which might just appear as "Epic" in some contexts
        if (selectedStore === 'Epic Games' && !storeMatch) {
            storeMatch = p.includes('epic');
        }
      }

      // Type Check
      let typeMatch = true;
      if (selectedType !== 'Todos') {
        if (selectedType === 'Jogo') {
          typeMatch = game.type === 'Game';
        } else if (selectedType === 'DLC') {
          typeMatch = game.type === 'DLC' || game.type === 'Expansion';
        }
      }

      return platformMatch && storeMatch && typeMatch;
    });
  }, [games, selectedPlatform, selectedStore, selectedType]);

  const clearFilters = () => {
    setSelectedPlatform('Todos');
    setSelectedStore('Todas');
    setSelectedType('Todos');
  };

  return (
    <div className="min-h-screen bg-gaming-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* VIEW: LIVE OFFERS */}
        {activeTab === 'offers' && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-gaming-accent animate-spin mb-4" />
                <p className="text-gray-400 animate-pulse">Sincronizando com GamerPower API...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center max-w-2xl mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-red-200">Ops! Algo deu errado.</h3>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            )}

            {/* Content */}
            {!loading && !error && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Filter Section */}
                <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Platform Filter */}
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium text-sm uppercase tracking-wider">
                        <MonitorSmartphone className="w-4 h-4 text-gaming-accent" />
                        Plataforma
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map(platform => (
                          <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                              selectedPlatform === platform
                                ? 'bg-gaming-accent text-white border-gaming-accent shadow-lg shadow-gaming-accent/25'
                                : 'bg-gaming-900 text-gray-400 border-gaming-700 hover:bg-gaming-700 hover:text-white'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium text-sm uppercase tracking-wider">
                        <Package className="w-4 h-4 text-green-400" />
                        Tipo
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {types.map(type => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                              selectedType === type
                                ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-500/25'
                                : 'bg-gaming-900 text-gray-400 border-gaming-700 hover:bg-gaming-700 hover:text-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Store Filter */}
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-2 mb-3 text-gray-300 font-medium text-sm uppercase tracking-wider">
                        <ShoppingBag className="w-4 h-4 text-gaming-highlight" />
                        Loja / Distribuição
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stores.map(store => (
                          <button
                            key={store}
                            onClick={() => setSelectedStore(store)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                              selectedStore === store
                                ? 'bg-gaming-highlight text-gaming-900 font-bold border-gaming-highlight shadow-lg shadow-gaming-highlight/25'
                                : 'bg-gaming-900 text-gray-400 border-gaming-700 hover:bg-gaming-700 hover:text-white'
                            }`}
                          >
                            {store}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Games Grid */}
                <div id="offers">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-8 bg-gaming-accent rounded-full"></span>
                      Resultados
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gaming-highlight font-mono border border-gaming-highlight/30 px-2 py-1 rounded">
                        LIVE
                      </span>
                      <span className="text-sm text-gray-400 bg-gaming-800 px-3 py-1 rounded-full border border-gaming-700">
                        {filteredGames.length} de {games.length} Resultados
                      </span>
                    </div>
                  </div>
                  
                  {filteredGames.length === 0 ? (
                    <div className="text-center py-20 bg-gaming-800/30 rounded-xl border border-dashed border-gaming-700">
                      <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-300 text-lg font-medium">Nenhum item encontrado com esses filtros.</p>
                      <p className="text-gray-500 mt-2">Tente selecionar "Todos" nas opções.</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-6 px-6 py-2 bg-gaming-700 hover:bg-gaming-600 text-white rounded-lg transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {filteredGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

        {/* VIEW: HYPOTHESES / LEAKS */}
        {activeTab === 'leaks' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 inline-flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                Vazamentos & Hipóteses
                <Sparkles className="w-8 h-8 text-purple-400" />
              </h2>
              <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                Datas previstas para possíveis jogos misteriosos da Epic Games e outras distribuidoras. 
                <br /><span className="text-purple-400 font-bold text-xs uppercase tracking-widest">Não confirmado oficialmente</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {LEAK_DATA.map((leak, index) => (
                <HypothesisCard key={index} title={leak.title} day={leak.day} />
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default App;