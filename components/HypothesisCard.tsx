import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Gift, Snowflake, Lock } from 'lucide-react';

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
      
      // Data de drop da Epic geralmente é às 13h (Brasília)
      const targetDate = new Date(currentYear, 11, day, 13, 0, 0); 
      
      const distance = targetDate.getTime() - now.getTime();

      if (distance < -86400000) {
        setStatus('passed');
        return "Resgate Encerrado";
      }

      if (distance <= 0 && distance > -86400000) {
        setStatus('today');
        return "REVELADO!";
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

  // Imagem temática de Natal para o placeholder
  const imageUrl = `https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=600&auto=format&fit=crop`;

  return (
    <div className={`group relative bg-gaming-800/50 rounded-xl overflow-hidden border transition-all duration-500 shadow-lg flex flex-col ${
      status === 'today' ? 'border-green-500 shadow-green-500/20' : 'border-red-500/30 hover:border-red-500'
    }`}>
      
      {/* Badge Natalina */}
      <div className="absolute top-2 left-2 z-10">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border backdrop-blur-md ${
          status === 'today' ? 'bg-green-600 text-white border-green-400' : 'bg-red-600 text-white border-red-400'
        }`}>
          <Snowflake className="w-3 h-3" />
          NATAL
        </span>
      </div>

      {/* Badge da Data */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`flex flex-col items-center bg-gaming-900/90 border rounded-lg p-1.5 min-w-[50px] backdrop-blur-sm transition-colors ${
          status === 'today' ? 'border-green-500' : 'border-red-500/50'
        }`}>
            <span className={`text-[10px] uppercase font-bold ${status === 'today' ? 'text-green-300' : 'text-red-300'}`}>DEZ</span>
            <span className="text-xl font-black text-white leading-none">{day}</span>
        </div>
      </div>

      {/* Imagem do Card */}
      <div className="relative aspect-video overflow-hidden bg-black">
        <img 
          src={imageUrl} 
          alt={title} 
          className={`w-full h-full object-cover transition-all duration-700 ${
            status === 'waiting' ? 'opacity-40 grayscale blur-[2px]' : 'opacity-80 group-hover:opacity-100'
          }`}
        />
        
        {/* Overlay de Countdown / Status */}
        <div className="absolute inset-0 flex items-center justify-center">
           {status === 'waiting' && (
             <div className="flex flex-col items-center gap-2 transform group-hover:scale-110 transition-transform">
               <div className="bg-red-600/80 p-3 rounded-full shadow-lg border border-red-400">
                 <Lock className="w-6 h-6 text-white" />
               </div>
               <div className="bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-500/30">
                 <span className="font-mono text-white font-bold tracking-widest text-sm">{timeLeft}</span>
               </div>
             </div>
           )}
           {status === 'today' && (
             <div className="flex items-center gap-2 bg-green-600 px-6 py-2 rounded-full animate-bounce shadow-xl">
               <Gift className="w-5 h-5 text-white" />
               <span className="font-bold text-white uppercase tracking-tighter">DISPONÍVEL AGORA!</span>
             </div>
           )}
           {status === 'passed' && (
             <div className="flex items-center gap-2 bg-gray-700/80 px-4 py-1.5 rounded-full backdrop-blur-sm">
               <Calendar className="w-4 h-4 text-gray-400" />
               <span className="font-bold text-gray-300">Data Passada</span>
             </div>
           )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className={`p-4 flex-grow border-t transition-colors ${
        status === 'today' ? 'bg-green-900/20 border-green-500/20' : 'bg-gradient-to-b from-gaming-800 to-gaming-900 border-red-500/20'
      }`}>
        <h3 className={`text-lg font-bold mb-1 text-center transition-colors ${
          status === 'waiting' ? 'text-gray-400' : 'text-white'
        }`}>
          {title}
        </h3>
        <p className={`text-center text-[10px] font-black uppercase tracking-widest ${
          status === 'today' ? 'text-green-400' : 'text-red-400/60'
        }`}>
          {status === 'waiting' ? 'Aguardando Revelação' : 'Resgate na Epic Games'}
        </p>
      </div>
    </div>
  );
};

export default HypothesisCard;