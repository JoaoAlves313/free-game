import { Game, GameDataResponse } from "../types";

const API_URL = "https://www.gamerpower.com/api/giveaways?type=game&sort-by=popularity";
const CACHE_KEY = "fgh_api_cache_v2";

// Configuração solicitada: 5 minutos para imutabilidade e 5 minutos para atualização.
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

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
      const response = await fetch(proxyUrl, { cache: 'no-store' }); 
      
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
      console.warn(`[Proxy] Falha ao tentar: ${createProxyUrl(targetUrl)}`);
      continue;
    }
  }
  throw new Error("Conexão impossível com a API GamerPower através dos proxies.");
};

export const fetchFreeGames = async (): Promise<GameDataResponse> => {
  const now = Date.now();
  
  // 1. Tentar ler do Cache
  const cached = localStorage.getItem(CACHE_KEY);
  
  if (cached) {
    try {
      const cacheParsed: CacheData = JSON.parse(cached);
      const elapsed = now - cacheParsed.timestamp;

      // REGRA: Se passou menos de 5 minutos, mantém os dados (Imutabilidade)
      if (elapsed < CACHE_DURATION) {
        const remaining = Math.round((CACHE_DURATION - elapsed) / 1000);
        console.log(`[Cache Lock] Dados imutáveis por mais ${remaining}s. Usando cache local.`);
        return cacheParsed.data;
      }

      console.log(`[Cache Expired] Janela de 5 min atingida. Atualizando base de dados...`);
    } catch (e) {
      console.error("[Cache Corrupt] Resetando cache.");
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // 2. Buscar na API (se não houver cache ou se ele tiver mais de 5 min)
  try {
    const data = await fetchWithProxy(API_URL);
    if (Array.isArray(data)) {
      const result: GameDataResponse = {
        games: data.filter((g: Game) => g.status === "Active").slice(0, 60),
        summary: "",
        source: "GamerPower Live API"
      };

      // 3. Salvar no Cache com timestamp atual
      const cacheToSave: CacheData = {
        timestamp: Date.now(),
        data: result
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheToSave));
      
      console.log("[API] Sucesso! Novos dados travados pelos próximos 5 minutos.");
      return result;
    }
  } catch (error) {
    console.error("[Fetch Error] Erro ao buscar API. Tentando fallback para cache antigo.");
    
    if (cached) {
      const cacheParsed: CacheData = JSON.parse(cached);
      return cacheParsed.data;
    }
  }

  return { games: [], summary: "", source: "Error" };
};