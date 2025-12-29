import React from 'react';
import { Bell, X, ShieldCheck, BellOff, Info, CloudCheck, CloudOff, Zap, Server, Settings, Send } from 'lucide-react';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  enabled: boolean;
  isCloudSynced: boolean;
  onToggleEnabled: () => void;
  onRequestPermission: () => void;
  onSendTest: () => void;
  permissionStatus: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  enabled,
  isCloudSynced,
  onToggleEnabled,
  onRequestPermission,
  onSendTest,
  permissionStatus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="bg-gaming-800 border border-gaming-700 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gaming-700 flex items-center justify-between bg-gaming-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-gaming-accent/20 p-2 rounded-xl">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tighter">Alertas 24h Cloud</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gaming-700 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-300">
              Nosso bot monitora <span className="text-gaming-highlight font-bold">todos</span> os lançamentos da <span className="text-white font-bold">Steam/Epic</span> simultaneamente.
            </p>
          </div>

          {permissionStatus !== 'granted' ? (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                <BellOff className="w-10 h-10 text-amber-500 animate-pulse" />
                <p className="text-xs text-amber-200/80 leading-relaxed uppercase font-bold tracking-widest">Aguardando Autorização</p>
                <div className='onesignal-customlink-container w-full'></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-indigo-400">
                  <Server className="w-6 h-6" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest block">Bot de Nuvem</span>
                    <span className="text-[10px] opacity-60">Ativo 24h/dia (V1.4.1)</span>
                  </div>
                </div>
                <button 
                  onClick={onToggleEnabled}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-indigo-500' : 'bg-gaming-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isCloudSynced && enabled 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-gaming-900 border-gaming-700 text-gray-500'
              }`}>
                <div className="flex items-center gap-3">
                  {isCloudSynced && enabled ? <CloudCheck className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block">Status do Bot</span>
                    <span className="text-[9px] opacity-60">{isCloudSynced && enabled ? 'Sincronizado e Pronto' : 'Aguardando Sincronia'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={onSendTest}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gaming-700 hover:bg-gaming-600 text-white rounded-2xl border border-gaming-600 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <Send className="w-4 h-4" />
                Testar Notificação Agora
              </button>

              <div className="bg-gaming-900/80 p-4 rounded-2xl border border-gaming-700 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Settings className="w-3 h-3" /> Info do Robô
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  O robô verifica a API oficial a cada hora. Se houver novos jogos, você receberá um alerta mesmo com o site fechado.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gaming-900 border-t border-gaming-700 text-center">
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-bold">
            Cloud Monitor v1.4.1 Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;