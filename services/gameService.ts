import { Game, GameDataResponse } from "../types";

const API_URL = "https://www.gamerpower.com/api/giveaways?type=game&sort-by=popularity";

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
        return await response.json();
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error("Conexão falhou.");
};

export const fetchFreeGames = async (): Promise<GameDataResponse> => {
  try {
    const data = await fetchWithProxy(API_URL);
    if (Array.isArray(data)) {
      return {
        games: data.filter((g: Game) => g.status === "Active").slice(0, 60),
        summary: "",
        source: "GamerPower API"
      };
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
  return { games: [], summary: "", source: "Error" };
};