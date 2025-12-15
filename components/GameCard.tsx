import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { Monitor, Cpu, Smartphone, HelpCircle, ExternalLink, Tag, Clock, CalendarDays } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

  useEffect(() => {
    if (!game.end_date || game.end_date === 'N/A') return;

    const calculateTimeLeft = () => {
      const end = new Date(game.end_date).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        return "Expirado";
      }

      // Check if expiring within 24 hours
      setIsExpiringSoon(distance < 24 * 60 * 60 * 1000);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}d ${hours}h`;
      }
      return `${hours}h ${minutes}m`;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every minute
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [game.end_date]);

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('pc') || p.includes('steam') || p.includes('epic') || p.includes('gog')) return <Monitor className="w-4 h-4" />;
    if (p.includes('xbox') || p.includes('playstation') || p.includes('ps4') || p.includes('ps5')) return <Cpu className="w-4 h-4" />;
    if (p.includes('android') || p.includes('ios')) return <Smartphone className="w-4 h-4" />;
    return <HelpCircle className="w-4 h-4" />;
  };

  const getStoreBadgeColor = (platforms: string) => {
    const p = platforms.toLowerCase();
    if (p.includes('epic')) return 'bg-gray-800 text-white border-gray-600';
    if (p.includes('steam')) return 'bg-blue-900 text-blue-100 border-blue-700';
    if (p.includes('gog')) return 'bg-purple-900 text-purple-100 border-purple-700';
    if (p.includes('ubisoft')) return 'bg-blue-600 text-white border-blue-500';
    if (p.includes('itch')) return 'bg-red-900 text-red-100 border-red-700';
    return 'bg-gaming-700 text-gray-200';
  };

  return (
    <div className="group relative bg-gaming-800 rounded-xl overflow-hidden border border-gaming-700 hover:border-gaming-accent transition-all duration-300 shadow-lg hover:shadow-gaming-accent/20 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-black">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm backdrop-blur-sm">
             GRÁTIS
           </span>
           {game.worth !== "N/A" && (
             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-gray-300 line-through backdrop-blur-sm">
               {game.worth}
             </span>
           )}
        </div>

        {/* Countdown Clock - Only shows if end_date is available */}
        {timeLeft && timeLeft !== 'Expirado' && (
          <div className={`absolute bottom-0 left-0 right-0 py-1 px-3 backdrop-blur-md border-t flex items-center justify-center gap-2 text-xs font-bold ${
            isExpiringSoon 
              ? 'bg-red-900/80 text-red-100 border-red-500/50 animate-pulse-slow' 
              : 'bg-gaming-900/80 text-gaming-highlight border-gaming-700/50'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-red-300' : 'text-gaming-highlight'}`} />
            <span>Expira em: {timeLeft}</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 gap-2">
           <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border truncate max-w-[70%] ${getStoreBadgeColor(game.platforms)}`}>
             {game.platforms.split(',')[0]}
           </span>
           <div className="flex items-center text-gray-400 gap-1 text-xs shrink-0">
              {getPlatformIcon(game.platforms)}
              <span className="sr-only">{game.platforms}</span>
           </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-gaming-highlight transition-colors h-12">
          {game.title}
        </h3>
        
        <p className="text-gray-400 text-xs mb-4 line-clamp-3 leading-relaxed">
          {game.description}
        </p>

        <div className="mt-auto pt-4 border-t border-gaming-700 flex items-center justify-between gap-3">
           <div className="flex flex-col gap-0.5">
             <div className="flex items-center gap-1 text-gray-500 text-[10px]">
               <Tag className="w-3 h-3" />
               <span>{game.type}</span>
             </div>
             {game.published_date && (
               <div className="flex items-center gap-1 text-gray-600 text-[10px]">
                 <CalendarDays className="w-3 h-3" />
                 <span>{new Date(game.published_date).toLocaleDateString()}</span>
               </div>
             )}
           </div>
           
           <a 
             href={game.open_giveaway_url}
             target="_blank"
             rel="noopener noreferrer"
             className="flex-1 flex items-center justify-center gap-2 bg-gaming-highlight text-gaming-900 hover:bg-white font-bold py-2 px-3 rounded-lg transition-all duration-200 text-sm shadow-lg shadow-gaming-highlight/20 hover:shadow-gaming-highlight/40"
           >
             <span>Resgatar</span>
             <ExternalLink className="w-3 h-3" />
           </a>
        </div>
      </div>
    </div>
  );
};

export default GameCard;