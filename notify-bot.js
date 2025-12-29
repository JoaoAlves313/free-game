/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.7.0
 * Proteção contra duplicatas pós-update (Cold Start Logic)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_APP_ID = "f2ba2a7e-9634-43af-8489-7dcfa2c27cb4";
const ONESIGNAL_APP_ID = (process.env.ONESIGNAL_APP_ID || FALLBACK_APP_ID).trim();
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY?.trim();
const HISTORY_FILE = path.join(__dirname, 'notified-ids.json');

async function checkGamesAndNotify() {
  console.log("--- [" + new Date().toISOString() + "] MONITORAMENTO ATIVO ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("❌ Erro: ONESIGNAL_REST_API_KEY não configurada.");
    process.exit(1);
  }

  let notifiedIds = [];
  let isColdStart = false;

  // 1. Tenta carregar o histórico
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      notifiedIds = JSON.parse(data);
    } catch (e) {
      notifiedIds = [];
    }
  }

  // 2. Se o histórico estiver vazio, marcamos como Cold Start
  // Isso acontece na primeira execução ou após você atualizar o código do site
  if (notifiedIds.length === 0) {
    console.log("❄️ [Cold Start] Histórico vazio detectado. Vou sincronizar os IDs atuais sem enviar notificações.");
    isColdStart = true;
  }

  try {
    const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&sort-by=date");
    const games = await response.json();
    
    if (!Array.isArray(games)) return;

    // Filtramos apenas Steam e Epic que estejam ativos
    const activeGames = games.filter(game => {
      const p = game.platforms.toLowerCase();
      return (p.includes('steam') || p.includes('epic')) && game.status === "Active";
    });

    if (isColdStart) {
      // Apenas salvamos os IDs atuais para "limpar" o passado
      const currentIds = activeGames.map(g => g.id);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(currentIds, null, 2));
      console.log(`✅ Sincronizado: ${currentIds.length} jogos salvos no histórico. Nenhuma notificação enviada.`);
      return;
    }

    // Lógica normal para encontrar novidades (apenas jogos publicados nas últimas 48h)
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;

    const newGamesToNotify = activeGames.filter(game => {
      const isNewId = !notifiedIds.includes(game.id);
      const publishedTime = new Date(game.published_date).getTime();
      return isNewId && (now - publishedTime < fortyEightHours);
    });

    if (newGamesToNotify.length > 0) {
      console.log(`🎁 Detectados ${newGamesToNotify.length} novos jogos!`);
      let successCount = 0;
      
      for (const game of newGamesToNotify) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        const success = await sendPushNotification(game, store);
        
        if (success) {
          notifiedIds.push(game.id);
          successCount++;
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (successCount > 0) {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(notifiedIds.slice(-500), null, 2));
        console.log(`✅ Sucesso: ${successCount} notificações enviadas.`);
      }
    } else {
      console.log("😴 Tudo atualizado. Sem novos jogos.");
    }

  } catch (e) {
    console.error("❌ Erro fatal:", e.message);
  }
}

async function sendPushNotification(game, store) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { 
          "en": `🎁 FREE GAME: ${game.title}`,
          "pt": `🎁 JOGO GRÁTIS: ${game.title}` 
        },
        contents: { 
          "en": `Available now on ${store}! Click to claim.`,
          "pt": `Disponível na ${store}! Clique para resgatar.` 
        },
        included_segments: ["All"],
        chrome_web_icon: game.thumbnail,
        url: game.open_giveaway_url,
        priority: 10
      })
    });
    
    const result = await response.json();
    return !!(result && result.id);
  } catch (err) {
    return false;
  }
}

checkGamesAndNotify();