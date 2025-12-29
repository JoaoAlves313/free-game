/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.4.1
 * Lógica Multi-Release: Verifica todos os jogos lançados na janela de tempo.
 */

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// Intervalo que o bot considera "novo". 
// Como o GitHub Actions roda a cada 60 min, usamos 65 min para cobrir pequenos atrasos de inicialização.
const TIME_WINDOW_MINUTES = 65;

async function checkGamesAndNotify() {
  console.log("--- [" + new Date().toISOString() + "] INICIANDO MONITORAMENTO ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("ERRO: ONESIGNAL_REST_API_KEY não configurada!");
    return;
  }

  try {
    const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&sort-by=date");
    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error("Erro: Resposta da API inválida ou offline.");
      return;
    }

    // 1. Filtrar apenas Steam e Epic que estão ativos
    const targetGames = games.filter(game => {
      const p = game.platforms.toLowerCase();
      return (p.includes('steam') || p.includes('epic')) && game.status === "Active";
    });

    console.log(`Total de jogos ativos em Steam/Epic: ${targetGames.length}`);

    // 2. Encontrar TODOS os jogos que entraram na loja na última hora
    const newGamesFound = targetGames.filter(game => {
      const publishedTime = new Date(game.published_date).getTime();
      const now = Date.now();
      const diffInMinutes = (now - publishedTime) / (1000 * 60);
      
      const isNew = diffInMinutes >= 0 && diffInMinutes <= TIME_WINDOW_MINUTES;
      if (isNew) {
        console.log(`[MATCH] Jogo detectado: "${game.title}" postado há ${Math.round(diffInMinutes)} min.`);
      }
      return isNew;
    });

    if (newGamesFound.length > 0) {
      console.log(`🚀 Iniciando disparos para ${newGamesFound.length} novos jogos...`);
      
      // 3. Notificar cada um deles
      for (const game of newGamesFound) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        await sendPushNotification(game, store);
        
        // Pausa entre envios para evitar rate limit do OneSignal
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } else {
      console.log("Dormindo... nenhum lançamento novo detectado na última hora.");
    }

  } catch (e) {
    console.error("Erro fatal no bot:", e);
  }
}

async function sendPushNotification(game, store) {
  const message = {
    app_id: ONESIGNAL_APP_ID,
    headings: { "pt": `🎁 JOGO GRÁTIS: ${game.title}` },
    contents: { "pt": `Novo drop na ${store}! Clique para resgatar agora.` },
    included_segments: ["All"],
    chrome_web_icon: game.thumbnail,
    url: game.open_giveaway_url,
    priority: 10
  };

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(message)
    });

    const result = await response.json();
    if (result.id) {
      console.log(`✅ SUCESSO: Notificação enviada para "${game.title}"`);
    } else {
      console.error(`❌ FALHA: OneSignal retornou erro para "${game.title}":`, result);
    }
  } catch (err) {
    console.error(`Erro de rede ao conectar com OneSignal:`, err);
  }
}

checkGamesAndNotify();
