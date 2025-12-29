
import { Game, GameDataResponse } from "../types";

const API_URL = "https://www.gamerpower.com/api/giveaways?type=game&sort-by=popularity";
const CACHE_KEY = "fgh_api_cache";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutos em milissegundos

interface CacheData {
  timestamp: number;
  data: GameDataResponse;
}

const fetchWithProxy = async (targetUrl: string): Promise<any> => {
  const proxies = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  for (const createProxyUrl of proxies) {
    try {
      const proxyUrl = createProxyUrl(targetUrl);
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          if (text.includes('"contents":')) {
             const wrapped = JSON.parse(text);
             return JSON.parse(wrapped.contents);
          }
          throw e;
        }
      }
    } catch (e) {
      console.warn(`Proxy attempt failed for ${targetUrl}`);
      continue;
    }
  }
  throw new Error("Conexão falhou em todos os proxies.");
};

export const fetchFreeGames = async (): Promise<GameDataResponse> => {
  const now = Date.now();
  
  // 1. Tentar ler do Cache primeiro
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const cacheParsed: CacheData = JSON.parse(cached);
      const isExpired = now - cacheParsed.timestamp > CACHE_TIME;

      if (!isExpired) {
        console.log(`[Cache] Usando dados locais. Próxima atualização em ${Math.round((CACHE_TIME - (now - cacheParsed.timestamp)) / 1000 / 60)} min.`);
        return cacheParsed.data;
      }
      console.log("[Cache] Expirado. Buscando novos dados na API...");
    } catch (e) {
      console.error("[Cache] Erro ao ler cache corrompido.");
    }
  }

  // 2. Se não houver cache ou estiver expirado, buscar na API
  try {
    const data = await fetchWithProxy(API_URL);
    if (Array.isArray(data)) {
      const result: GameDataResponse = {
        games: data.filter((g: Game) => g.status === "Active").slice(0, 60),
        summary: "",
        source: "GamerPower API"
      };

      // 3. Salvar no Cache
      const cacheToSave: CacheData = {
        timestamp: now,
        data: result
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheToSave));
      
      return result;
    }
  } catch (error) {
    console.error("Fetch error in fetchFreeGames:", error);
    
    // 4. Fallback: Se a API falhar mas tivermos cache (mesmo que expirado), usamos ele
    if (cached) {
      const cacheParsed: CacheData = JSON.parse(cached);
      console.warn("[Cache] API falhou, usando cache expirado como fallback.");
      return cacheParsed.data;
    }
  }

  return { games: [], summary: "", source: "Error" };
};
