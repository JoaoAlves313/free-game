import React from 'react';
import { Bell, X, Check, ShieldCheck, BellOff, Send } from 'lucide-react';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: {
    platforms: string[];
    stores: string[];
    enabled: boolean;
  };
  onTogglePreference: (type: 'platforms' | 'stores', value: string) => void;
  onToggleEnabled: () => void;
  onRequestPermission: () => void;
  onSendTestNotification: () => void;
  permissionStatus: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  preferences,
  onTogglePreference,
  onToggleEnabled,
  onRequestPermission,
  onSendTestNotification,
  permissionStatus
}) => {
  if (!isOpen) return null;

  const platforms = ['PC', 'Android'];
  const stores = ['Steam', 'Epic Games', 'GOG', 'Extra'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gaming-800 border border-gaming-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gaming-700 flex items-center justify-between bg-gaming-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-gaming-accent/20 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-gaming-accent" />
            </div>
            <h2 className="text-xl font-bold text-white">Alertas Push</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gaming-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {permissionStatus !== 'granted' ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex flex-col items-center text-center gap-4">
              <div className="relative">
                <BellOff className="w-10 h-10 text-amber-500" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-200">Notificações Desativadas</p>
                <p className="text-xs text-amber-200/60 mt-1">Para receber jogos grátis, use o link oficial abaixo para se inscrever.</p>
              </div>
              
              {/* Substituição do botão pelo comando oficial solicitado */}
              <div className='onesignal-customlink-container w-full min-h-[44px] flex justify-center items-center py-2'></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3 text-green-400">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Serviço Conectado</span>
                    <span className="text-[10px] opacity-70">Você está pronto para receber alertas</span>
                  </div>
                </div>
                <button 
                  onClick={onToggleEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.enabled ? 'bg-gaming-accent' : 'bg-gaming-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <button 
                onClick={onSendTestNotification}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gaming-accent border border-gaming-accent/30 rounded-lg hover:bg-gaming-accent/10 transition-colors"
              >
                <Send className="w-3 h-3" />
                Enviar Notificação de Teste
              </button>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Plataformas Alvo</h3>
              <div className="flex flex-wrap gap-2">
                {platforms.map(p => (
                  <button
                    key={p}
                    onClick={() => onTogglePreference('platforms', p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                      preferences.platforms.includes(p)
                        ? 'bg-gaming-accent border-gaming-accent text-white shadow-md shadow-gaming-accent/20'
                        : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {preferences.platforms.includes(p) && <Check className="w-3 h-3" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Lojas de Interesse</h3>
              <div className="flex flex-wrap gap-2">
                {stores.map(s => (
                  <button
                    key={s}
                    onClick={() => onTogglePreference('stores', s)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                      preferences.stores.includes(s)
                        ? 'bg-gaming-highlight border-gaming-highlight text-gaming-900 shadow-md shadow-gaming-highlight/20'
                        : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {preferences.stores.includes(s) && <Check className="w-3 h-3" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gaming-900 border-t border-gaming-700 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
            As notificações funcionam via tecnologia WebPush.<br/>
            Suas preferências são sincronizadas com o servidor OneSignal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;