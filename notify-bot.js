/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.6.1
 * Configuração: GitHub Secrets (Seguro)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definições de fallback caso o segredo falhe ou não exista
const FALLBACK_APP_ID = "f2ba2a7e-9634-43af-8489-7dcfa2c27cb4";

// Prioriza variáveis do ambiente (GitHub Secrets)
const ONESIGNAL_APP_ID = (process.env.ONESIGNAL_APP_ID || FALLBACK_APP_ID).trim();
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY?.trim();
const HISTORY_FILE = path.join(__dirname, 'notified-ids.json');

async function checkGamesAndNotify() {
  console.log("--- [" + new Date().toISOString() + "] INICIANDO MONITORAMENTO (GITHUB SECRETS) ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("❌ ERRO CRÍTICO: Variável ONESIGNAL_REST_API_KEY não detectada!");
    console.error("Certifique-se de que o segredo foi criado em: Settings > Secrets and variables > Actions");
    process.exit(1);
  }

  console.log(`📡 Usando App ID: ${ONESIGNAL_APP_ID}`);

  let notifiedIds = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      notifiedIds = JSON.parse(data);
    } catch (e) {
      console.warn("⚠️ Histórico corrompido, iniciando novo.");
      notifiedIds = [];
    }
  }

  try {
    const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game&sort-by=date");
    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error("❌ Erro ao buscar dados da GamerPower.");
      return;
    }

    const targetGames = games.filter(game => {
      const p = game.platforms.toLowerCase();
      return (p.includes('steam') || p.includes('epic')) && game.status === "Active";
    });

    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;

    const newGamesToNotify = targetGames.filter(game => {
      const isNewId = !notifiedIds.includes(game.id);
      const publishedTime = new Date(game.published_date).getTime();
      return isNewId && (now - publishedTime < fortyEightHours);
    });

    if (newGamesToNotify.length > 0) {
      console.log(`🎁 Detectados ${newGamesToNotify.length} novos jogos!`);
      let successCount = 0;
      
      for (const game of newGamesToNotify) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        console.log(`🚀 Disparando Push: ${game.title} (${store})`);
        
        const success = await sendPushNotification(game, store);
        
        if (success) {
          notifiedIds.push(game.id);
          successCount++;
          // Delay entre notificações para evitar bloqueio
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      if (successCount > 0) {
        // Salva apenas os últimos 500 IDs para manter o arquivo leve
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(notifiedIds.slice(-500), null, 2));
        console.log(`✅ Processo finalizado. ${successCount} notificações enviadas.`);
      }
    } else {
      console.log("😴 Nenhum jogo novo desde a última verificação.");
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
        // OneSignal exige 'en' como fallback obrigatório
        headings: { 
          "en": `🎁 FREE GAME: ${game.title}`,
          "pt": `🎁 JOGO GRÁTIS: ${game.title}` 
        },
        contents: { 
          "en": `New giveaway on ${store}! Click to claim now.`,
          "pt": `Novo drop na ${store}! Clique para resgatar agora.` 
        },
        included_segments: ["All"],
        chrome_web_icon: game.thumbnail,
        url: game.open_giveaway_url,
        priority: 10
      })
    });
    
    const result = await response.json();
    
    if (result && result.id) {
      console.log(`✨ Sucesso! ID da Notificação: ${result.id}`);
      return true;
    } else {
      console.error("❌ Falha OneSignal:", JSON.stringify(result));
      return false;
    }
  } catch (err) {
    console.error("❌ Erro de conexão OneSignal:", err.message);
    return false;
  }
}

checkGamesAndNotify();