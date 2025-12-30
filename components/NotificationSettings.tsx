
import React from 'react';
import { Bell, X, BellOff, Zap, Send, MousePointer2, CheckCircle2 } from 'lucide-react';

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
  onToggleEnabled,
  onRequestPermission,
  onSendTest,
  permissionStatus
}) => {
  if (!isOpen) return null;

  const isGranted = permissionStatus === 'granted';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gaming-800 border border-gaming-700 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-5 border-b border-gaming-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Notificações</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gaming-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-400 text-center">
            Receba um aviso imediato no seu navegador assim que um novo jogo ficar gratuito.
          </p>

          {!isGranted ? (
            <div className="space-y-4">
              <div className="bg-gaming-900/50 border border-gaming-700 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                <BellOff className="w-8 h-8 text-gray-500" />
                <p className="text-xs text-gray-400">As notificações estão desativadas no seu navegador.</p>
                <button 
                  onClick={onRequestPermission}
                  className="w-full flex items-center justify-center gap-2 bg-gaming-accent hover:bg-white text-white hover:text-gaming-900 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  <MousePointer2 className="w-4 h-4" />
                  PERMITIR AGORA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gaming-900/50 p-4 rounded-2xl border border-gaming-700">
                <div className="flex items-center gap-3 text-white">
                  <Bell className="w-5 h-5 text-gaming-highlight" />
                  <span className="text-sm font-medium">Alertas Ativos</span>
                </div>
                <button 
                  onClick={onToggleEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-gaming-accent' : 'bg-gaming-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <button 
                onClick={onSendTest}
                className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-white transition-all text-xs font-medium"
              >
                <Send className="w-3 h-3" />
                Enviar notificação de teste
              </button>
              
              {enabled && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" />
                  Sistema Pronto
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
