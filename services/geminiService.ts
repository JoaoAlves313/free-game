import { Game, GameDataResponse } from "../types";

const API_URL = "https://www.gamerpower.com/api/giveaways?type=game&sort-by=popularity";

// Helper function to try multiple proxies
const fetchWithProxy = async (targetUrl: string): Promise<any> => {
  const proxies = [
    // Primary: corsproxy.io (Reliable and fast)
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // Fallback: allorigins (Common alternative)
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // Fallback 2: CodeTabs (Another option if others fail)
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  for (const createProxyUrl of proxies) {
    try {
      const proxyUrl = createProxyUrl(targetUrl);
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        return await response.json();
      }
      console.warn(`Proxy failed: ${proxyUrl} - Status: ${response.status}`);
    } catch (e) {
      console.warn(`Proxy network error: ${createProxyUrl(targetUrl)}`, e);
    }
  }
  throw new Error("Todas as tentativas de conexão via proxy falharam.");
};

export const fetchFreeGames = async (): Promise<GameDataResponse> => {
  let games: Game[] = [];
  
  // Fetch real data from GamerPower API with fallback strategies
  try {
    const data = await fetchWithProxy(API_URL);
    
    if (Array.isArray(data)) {
      // Filter active games and limit to 60 to allow effective client-side filtering
      games = data.filter((g: Game) => g.status === "Active").slice(0, 60); 
    } else {
      console.error("Formato inesperado da API:", data);
    }

  } catch (error) {
    console.error("Error fetching from GamerPower:", error);
    return {
      games: [],
      summary: "",
      source: "Erro"
    };
  }

  return {
    games,
    summary: "",
    source: "GamerPower API"
  };
};