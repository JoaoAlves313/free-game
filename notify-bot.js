/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.5.0
 * Lógica Baseada em Histórico: Garante que nenhum jogo seja perdido, independente do delay da API.
 */

const fs = require('fs');
const path = require('path');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const HISTORY_FILE = path.join(__dirname, 'notified-ids.json');

async function checkGamesAndNotify() {
  console.log("--- [" + new Date().toISOString() + "] INICIANDO MONITORAMENTO PERSISTENTE ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("ERRO: ONESIGNAL_REST_API_KEY não configurada!");
    process.exit(1);
  }

  // 1. Carregar histórico de IDs já notificados
  let notifiedIds = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      notifiedIds = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
      notifiedIds = [];
    }
  }

  try {
    const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&sort-by=date");
    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error("Erro: Resposta da API inválida.");
      return;
    }

    // 2. Filtrar Steam e Epic Ativos
    const targetGames = games.filter(game => {
      const p = game.platforms.toLowerCase();
      return (p.includes('steam') || p.includes('epic')) && game.status === "Active";
    });

    // 3. Identificar jogos que NUNCA foram notificados (independente da data de publicação)
    // Limitamos a jogos publicados nas últimas 48h para evitar disparar lixo antigo se a API resetar
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;

    const newGamesToNotify = targetGames.filter(game => {
      const isNewId = !notifiedIds.includes(game.id);
      const publishedTime = new Date(game.published_date).getTime();
      const isRecentEnough = (now - publishedTime) < fortyEightHours;
      
      return isNewId && isRecentEnough;
    });

    if (newGamesToNotify.length > 0) {
      console.log(`🎁 ${newGamesToNotify.length} novos jogos detectados para notificação!`);
      
      for (const game of newGamesToNotify) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        console.log(`Disparando: ${game.title}`);
        await sendPushNotification(game, store);
        
        // Adicionar ao histórico para não repetir nunca mais
        notifiedIds.push(game.id);
        
        // Delay anti-spam
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // 4. Salvar histórico atualizado (manter apenas os últimos 500 IDs para o arquivo não crescer infinito)
      const updatedHistory = notifiedIds.slice(-500);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
      console.log("✅ Histórico atualizado localmente.");
    } else {
      console.log("Nenhuma novidade encontrada nesta varredura.");
    }

  } catch (e) {
    console.error("Erro no processo do bot:", e);
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
    if (!result.id) console.error("Erro OneSignal:", result);
  } catch (err) {
    console.error("Erro de conexão OneSignal");
  }
}

checkGamesAndNotify();
