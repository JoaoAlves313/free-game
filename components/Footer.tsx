import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gaming-900 border-t border-gaming-700 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm">
          Desenvolvido com React, Tailwind e Gemini API.
        </p>
        <p className="text-gray-600 text-xs mt-2">
          As ofertas são encontradas automaticamente via IA e podem expirar a qualquer momento. Verifique sempre a loja oficial.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
