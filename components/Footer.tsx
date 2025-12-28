import React from 'react';

const Footer: React.FC = () => {
  const APP_VERSION = "v1.0.7";

  return (
    <footer className="bg-gaming-900 border-t border-gaming-700 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-500 text-sm">
              Desenvolvido com React e Tailwind.
            </p>
            <p className="text-gray-600 text-xs mt-1">
              As ofertas são atualizadas automaticamente via GamerPower. Verifique sempre a loja oficial antes de resgatar.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center gap-2 px-3 py-1 bg-gaming-800 rounded-full border border-gaming-700">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Build: {APP_VERSION}</span>
            </div>
            <p className="text-[9px] text-gray-700 mt-2 uppercase tracking-tighter">© 2024 FreeGameHunter</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;