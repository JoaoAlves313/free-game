/**
 * SCRIPT DE MONITORAMENTO EXTERNO (BOT) v1.5.2
 * Lógica Baseada em Histórico - Versão ES Module (ESM)
 * Correção: Só marca como notificado se o envio via OneSignal for bem-sucedido.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Em ES Modules, precisamos definir o __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .trim() remove espaços em branco acidentais que causam erro de "Access Denied"
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID?.trim();
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY?.trim();
const HISTORY_FILE = path.join(__dirname, 'notified-ids.json');

async function checkGamesAndNotify() {
  console.log("--- [" + new Date().toISOString() + "] INICIANDO MONITORAMENTO PERSISTENTE (ESM) ---");
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error("ERRO CRÍTICO: ONESIGNAL_REST_API_KEY não encontrada no ambiente do GitHub!");
    process.exit(1);
  }

  if (!ONESIGNAL_APP_ID) {
    console.error("ERRO CRÍTICO: ONESIGNAL_APP_ID não encontrada!");
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
      console.error("Erro: Resposta da API GamerPower inválida.");
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
      console.log(`🎁 Encontrados ${newGamesToNotify.length} possíveis novos jogos.`);
      let successCount = 0;
      
      for (const game of newGamesToNotify) {
        const store = game.platforms.toLowerCase().includes('steam') ? 'Steam' : 'Epic Games';
        console.log(`Tentando enviar: ${game.title} (${store})`);
        
        const success = await sendPushNotification(game, store);
        
        if (success) {
          notifiedIds.push(game.id);
          successCount++;
          // Delay anti-spam
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.warn(`Aviso: O jogo "${game.title}" não foi enviado e será tentado novamente na próxima rodada.`);
        }
      }

      // 4. Salvar histórico apenas dos IDs que realmente foram enviados
      if (successCount > 0) {
        const updatedHistory = notifiedIds.slice(-500);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
        console.log(`✅ Histórico atualizado com ${successCount} novos jogos.`);
      } else {
        console.log("Nenhuma notificação foi enviada com sucesso. Histórico não alterado.");
      }
    } else {
      console.log("Nenhum jogo novo detectado.");
    }

  } catch (e) {
    console.error("Erro fatal no processo do bot:", e);
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
    
    if (result && result.id) {
      console.log(`Sucesso: Notificação enviada! ID: ${result.id}`);
      return true;
    } else {
      console.error("Falha no OneSignal:", JSON.stringify(result));
      if (JSON.stringify(result).includes("Access denied")) {
        console.error("DICA: Sua 'ONESIGNAL_REST_API_KEY' parece inválida para este App ID. Verifique os Segredos do GitHub.");
      }
      return false;
    }
  } catch (err) {
    console.error("Erro de conexão com OneSignal:", err.message);
    return false;
  }
}

checkGamesAndNotify();