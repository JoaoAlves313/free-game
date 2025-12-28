import React from 'react';
import { Bell, X, Check, ShieldCheck, BellOff } from 'lucide-react';

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
  permissionStatus: NotificationPermission;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  preferences,
  onTogglePreference,
  onToggleEnabled,
  onRequestPermission,
  permissionStatus
}) => {
  if (!isOpen) return null;

  const platforms = ['PC', 'Android'];
  const stores = ['Steam', 'Epic Games', 'GOG', 'Extra'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gaming-800 border border-gaming-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gaming-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gaming-accent/20 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-gaming-accent" />
            </div>
            <h2 className="text-xl font-bold text-white">Notificações</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {permissionStatus !== 'granted' ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col items-center text-center gap-3">
              <BellOff className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm font-bold text-amber-200">Permissão Necessária</p>
                <p className="text-xs text-amber-200/60 mt-1">Para receber alertas de novos jogos, você precisa permitir notificações no seu navegador.</p>
              </div>
              <button 
                onClick={onRequestPermission}
                className="w-full bg-amber-500 hover:bg-amber-600 text-gaming-900 font-bold py-2 rounded-lg transition-colors text-sm"
              >
                Permitir Notificações
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-bold">Serviço Ativo</span>
              </div>
              <button 
                onClick={onToggleEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.enabled ? 'bg-gaming-accent' : 'bg-gaming-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Plataformas</h3>
              <div className="flex flex-wrap gap-2">
                {platforms.map(p => (
                  <button
                    key={p}
                    onClick={() => onTogglePreference('platforms', p)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      preferences.platforms.includes(p)
                        ? 'bg-gaming-accent border-gaming-accent text-white'
                        : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {preferences.platforms.includes(p) && <Check className="w-3 h-3" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Lojas</h3>
              <div className="flex flex-wrap gap-2">
                {stores.map(s => (
                  <button
                    key={s}
                    onClick={() => onTogglePreference('stores', s)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      preferences.stores.includes(s)
                        ? 'bg-gaming-highlight border-gaming-highlight text-gaming-900'
                        : 'bg-gaming-900 border-gaming-700 text-gray-400 hover:text-white'
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

        <div className="p-4 bg-gaming-900/50 border-t border-gaming-700 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
            Você será notificado apenas quando o site estiver aberto ou em segundo plano.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;