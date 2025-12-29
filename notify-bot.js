/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.5.1
 * Lógica Baseada em Histórico - Versão ES Module (ESM)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Em ES Modules, precisamos definir o __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const HISTORY_FILE = path.join(__dirname, 'notified-ids.json');

async function checkGamesAndNotify() {
  console.log("--- [" + new Date().toISOString() + "] INICIANDO MONITORAMENTO PERSISTENTE (ESM) ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("ERRO: ONESIGNAL_REST_API_KEY não configurada!");
    process.exit(1);
  }

  // 1. Carregar histórico de IDs já notificados
  let notifiedIds = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      notifiedIds = JSON.parse(data);
    } catch (e) {
      console.warn("Aviso: Histórico corrompido ou vazio, iniciando novo.");
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

    // 3. Identificar jogos novos
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;

    const newGamesToNotify = targetGames.filter(game => {
      const isNewId = !notifiedIds.includes(game.id);
      const publishedTime = new Date(game.published_date).getTime();
      const isRecentEnough = (now - publishedTime) < fortyEightHours;
      
      return isNewId && isRecentEnough;
    });

    if (newGamesToNotify.length > 0) {
      console.log(`🎁 ${newGamesToNotify.length} novos jogos detectados!`);
      
      for (const game of newGamesToNotify) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        console.log(`Disparando Push: ${game.title}`);
        await sendPushNotification(game, store);
        
        notifiedIds.push(game.id);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // 4. Salvar histórico (limitado a 500 itens)
      const updatedHistory = notifiedIds.slice(-500);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
      console.log("✅ Histórico atualizado.");
    } else {
      console.log("Nenhuma novidade encontrada.");
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
    if (!result.id) console.error("Erro OneSignal:", result);
  } catch (err) {
    console.error("Erro de rede OneSignal");
  }
}

checkGamesAndNotify();