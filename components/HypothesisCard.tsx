import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Gift, Sparkles } from 'lucide-react';

interface HypothesisCardProps {
  title: string;
  day: number;
}

const HypothesisCard: React.FC<HypothesisCardProps> = ({ title, day }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [status, setStatus] = useState<'waiting' | 'today' | 'passed'>('waiting');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Setup target date: December of current year at the specific day
      const targetDate = new Date(currentYear, 11, day, 13, 0, 0); // Assuming 13:00 (1PM) as standard drop time
      
      const distance = targetDate.getTime() - now.getTime();

      // If date passed more than 24h ago
      if (distance < -86400000) {
        setStatus('passed');
        return "Data Passada";
      }

      // If it's today (within 24h window roughly)
      if (distance <= 0 && distance > -86400000) {
        setStatus('today');
        return "HOJE!";
      }

      setStatus('waiting');

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [day]);

  // Placeholder image with text
  const imageUrl = `https://placehold.co/600x340/2c1f36/FFFFFF?text=${encodeURIComponent(title)}&font=montserrat`;

  return (
    <div className="group relative bg-gaming-800/50 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 flex flex-col">
      
      {/* Badge de "Leak/Hipótese" */}
      <div className="absolute top-2 left-2 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm border border-purple-400 backdrop-blur-md">
          <Sparkles className="w-3 h-3" />
          RUMOR
        </span>
      </div>

      {/* Date Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex flex-col items-center bg-gaming-900/90 border border-purple-500/50 rounded-lg p-1.5 min-w-[50px] backdrop-blur-sm">
            <span className="text-[10px] uppercase text-purple-300 font-bold">DEZ</span>
            <span className="text-xl font-black text-white leading-none">{day}</span>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-black">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        />
        
        {/* Countdown Overlay */}
        <div className="absolute bottom-0 left-0 right-0 py-2 bg-gradient-to-t from-gaming-900 to-transparent flex items-end justify-center pb-4">
           {status === 'waiting' && (
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-500/30">
               <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
               <span className="font-mono text-purple-100 font-bold tracking-widest">{timeLeft}</span>
             </div>
           )}
           {status === 'today' && (
             <div className="flex items-center gap-2 bg-green-600 px-6 py-1.5 rounded-full animate-bounce">
               <Gift className="w-4 h-4 text-white" />
               <span className="font-bold text-white">DISPONÍVEL HOJE?</span>
             </div>
           )}
           {status === 'passed' && (
             <div className="flex items-center gap-2 bg-gray-700 px-4 py-1.5 rounded-full opacity-80">
               <Calendar className="w-4 h-4 text-gray-400" />
               <span className="font-bold text-gray-300">Data Passada</span>
             </div>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-gradient-to-b from-gaming-800 to-gaming-900 flex-grow border-t border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors text-center">
          {title}
        </h3>
        <p className="text-center text-xs text-purple-200/60 italic">
          Provável oferta misteriosa
        </p>
      </div>
    </div>
  );
};

export default HypothesisCard;