/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.4.0
 * Lógica Multi-Release: Verifica todos os jogos lançados na janela de tempo.
 */

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// Intervalo que o bot considera "novo". 
// Como o GitHub Actions roda a cada 60 min, usamos 65 min para cobrir pequenos atrasos de inicialização.
const TIME_WINDOW_MINUTES = 65;

async function checkGamesAndNotify() {
  console.log("--- INICIANDO MONITORAMENTO MULTI-JOGOS ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("ERRO: ONESIGNAL_REST_API_KEY não configurada!");
    return;
  }

  try {
    const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&sort-by=date");
    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error("Erro: Resposta da API inválida.");
      return;
    }

    // 1. Filtrar apenas Steam e Epic que estão ativos
    const targetGames = games.filter(game => {
      const p = game.platforms.toLowerCase();
      return (p.includes('steam') || p.includes('epic')) && game.status === "Active";
    });

    // 2. Encontrar TODOS os jogos que entraram na loja na última hora
    const newGamesFound = targetGames.filter(game => {
      const publishedTime = new Date(game.published_date).getTime();
      const now = Date.now();
      const diffInMinutes = (now - publishedTime) / (1000 * 60);
      
      // Se o jogo foi postado entre 0 e 65 minutos atrás, ele é "Novo" para esta rodada
      return diffInMinutes >= 0 && diffInMinutes <= TIME_WINDOW_MINUTES;
    });

    if (newGamesFound.length > 0) {
      console.log(`🚀 Foram encontrados ${newGamesFound.length} novos jogos na janela de tempo!`);
      
      // 3. Notificar cada um deles
      for (const game of newGamesFound) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        console.log(`Enviando alerta para: ${game.title} (${store})`);
        await sendPushNotification(game, store);
        
        // Pequena pausa entre envios para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log("Nenhum lançamento novo de Steam/Epic detectado nesta hora.");
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
      console.log(`✅ Notificação enviada: ${game.title}`);
    } else {
      console.error(`❌ Falha no OneSignal para ${game.title}:`, result);
    }
  } catch (err) {
    console.error(`Erro ao conectar com OneSignal:`, err);
  }
}

checkGamesAndNotify();
