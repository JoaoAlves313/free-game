import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gaming-900 border-t border-gaming-700 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm">
          Desenvolvido com React e Tailwind.
        </p>
        <p className="text-gray-600 text-xs mt-2">
          As ofertas são atualizadas automaticamente via GamerPower. Verifique sempre a loja oficial antes de resgatar.
        </p>
      </div>
    </footer>
  );
};

export default Footer;