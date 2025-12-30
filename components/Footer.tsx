
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gaming-900 border-t border-gaming-700 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="text-gray-500 text-sm">
              Encontrando os melhores jogos gratuitos para você.
            </p>
          </div>
          
          <div className="text-gray-600 text-xs">
            © {new Date().getFullYear()} FreeGameHunter
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
