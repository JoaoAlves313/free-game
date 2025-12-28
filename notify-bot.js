/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.3.1
 * Adicionado filtro de tempo para evitar spam de notificações duplicadas.
 */

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// Intervalo em minutos que o bot considera um jogo como "novo"
// Como o cron roda a cada 60 min, usamos 70 min para ter uma margem de segurança
const TIME_WINDOW_MINUTES = 70;

async function checkGamesAndNotify() {
  console.log("--- INICIANDO MONITORAMENTO ANTI-SPAM ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("ERRO: ONESIGNAL_REST_API_KEY não configurada nos Secrets do GitHub!");
    return;
  }

  try {
    // 1. Buscar jogos ordenados por data (mais recentes primeiro)
    const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&sort-by=date");
    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error("Erro: Resposta da API inválida.");
      return;
    }

    // 2. Filtrar jogos de Steam/Epic que estão ativos
    const targetGames = games.filter(game => {
      const p = game.platforms.toLowerCase();
      return (p.includes('steam') || p.includes('epic')) && game.status === "Active";
    });

    if (targetGames.length === 0) {
      console.log("Nenhum jogo de Steam/Epic ativo.");
      return;
    }

    // 3. Verificar o jogo mais recente contra a janela de tempo
    const latestGame = targetGames[0];
    
    // Converter data da API para timestamp (A API GamerPower usa UTC)
    const publishedTime = new Date(latestGame.published_date).getTime();
    const now = Date.now();
    const diffInMinutes = (now - publishedTime) / (1000 * 60);

    console.log(`Jogo mais recente: "${latestGame.title}"`);
    console.log(`Postado há: ${Math.round(diffInMinutes)} minutos`);

    if (diffInMinutes <= TIME_WINDOW_MINUTES) {
      console.log(`🚀 Jogo dentro da janela de ${TIME_WINDOW_MINUTES}min! Preparando notificação...`);
      const store = latestGame.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
      await sendPushNotification(latestGame, store);
    } else {
      console.log(`😴 Jogo antigo (mais de ${TIME_WINDOW_MINUTES}min). Já deve ter sido notificado em rodadas anteriores.`);
    }

  } catch (e) {
    console.error("Erro fatal no bot:", e);
  }
}

async function sendPushNotification(game, store) {
  const message = {
    app_id: ONESIGNAL_APP_ID,
    headings: { "pt": `🎁 NOVO JOGO GRÁTIS: ${game.title}` },
    contents: { "pt": `Disponível na ${store}! Clique para resgatar antes que acabe.` },
    included_segments: ["All"],
    chrome_web_icon: game.thumbnail,
    url: game.open_giveaway_url,
    priority: 10
  };

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
    console.log(`✅ Notificação enviada! ID: ${result.id}`);
  } else {
    console.error(`❌ Erro OneSignal:`, result);
  }
}

checkGamesAndNotify();
