import React from 'react';
import { Gamepad2, Gift, Snowflake } from 'lucide-react';

interface NavbarProps {
  activeTab: 'offers' | 'leaks';
  onTabChange: (tab: 'offers' | 'leaks') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="sticky top-0 z-50 bg-gaming-900/90 backdrop-blur-md border-b border-gaming-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('offers')}>
            <div className="bg-gradient-to-tr from-gaming-accent to-gaming-highlight p-2 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              FreeGameHunter
            </span>
            <span className="text-xl font-bold text-white sm:hidden">FGH</span>
          </div>
          
          <div>
            <div className="flex items-baseline space-x-2 md:space-x-4">
              <button 
                onClick={() => onTabChange('offers')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'offers' 
                    ? 'bg-gaming-800 text-white shadow-md shadow-gaming-highlight/10 border border-gaming-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gaming-800/50'
                }`}
              >
                <Gift className={`w-4 h-4 ${activeTab === 'offers' ? 'text-gaming-highlight' : 'text-gray-500'}`} />
                <span>Ofertas</span>
              </button>

              <button 
                onClick={() => onTabChange('leaks')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'leaks' 
                    ? 'bg-red-900/40 text-red-100 shadow-md shadow-red-500/10 border border-red-500/50' 
                    : 'text-gray-400 hover:text-red-300 hover:bg-red-900/20'
                }`}
              >
                <Snowflake className={`w-4 h-4 ${activeTab === 'leaks' ? 'text-red-400' : 'text-gray-500'}`} />
                <span>Natal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;