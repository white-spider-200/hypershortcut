import React from 'react';
import { motion } from 'motion/react';
import { LAYOUTS, Modifier } from '../types';

interface KeyboardProps {
  activeModifiers: Modifier[];
  activeMainKey: string | null;
  layout: string;
  kbType: string;
  isListening?: boolean;
  onKeyClick?: (key: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ activeModifiers, activeMainKey, layout, kbType, isListening, onKeyClick }) => {
  const currentLayout = React.useMemo(() => LAYOUTS[layout] || LAYOUTS['US'], [layout]);

  const isKeyActive = (key: string) => {
    const upperKey = key.toUpperCase();
    if (upperKey === 'SUPER' || upperKey === 'WIN' || upperKey === 'COMMAND' || upperKey === 'META') {
      return activeModifiers.includes('SUPER');
    }
    if (upperKey === 'SHIFT') return activeModifiers.includes('SHIFT');
    if (upperKey === 'CTRL' || upperKey === 'CONTROL') return activeModifiers.includes('CTRL');
    if (upperKey === 'ALT') return activeModifiers.includes('ALT');
    
    // Handle special mappings for display
    if (activeMainKey) {
      const mainKeyUpper = activeMainKey.toUpperCase();
      if (upperKey === mainKeyUpper) return true;
      
      // Handle some common key name differences
      if (mainKeyUpper === ' ' && upperKey === 'SPACE') return true;
      if (mainKeyUpper === 'CONTROL' && upperKey === 'CTRL') return true;
      if (mainKeyUpper === 'META' && upperKey === 'SUPER') return true;
      if (mainKeyUpper === 'ESCAPE' && upperKey === 'ESC') return true;
      
      // Handle numeric keys
      if (mainKeyUpper === key) return true;
    }
    
    return false;
  };

  const rowsToDisplay = React.useMemo(() => {
    let filtered = [...currentLayout.rows];
    
    if (kbType === '60%') {
      // Remove F-row
      filtered = filtered.slice(1);
    }
    
    return filtered;
  }, [currentLayout, kbType]);

  const getKeyboardWidth = () => {
    switch (kbType) {
      case '60%': return 'max-w-2xl';
      case 'Laptop': return 'max-w-3xl';
      default: return 'max-w-4xl';
    }
  };

  const getAccent = () => {
    switch (layout) {
      case 'Arabic': 
        return { 
          border: 'border-emerald-500/40', 
          bg: 'bg-emerald-950/20', 
          glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]',
          rgba: '16, 185, 129',
          text: 'text-emerald-400'
        };
      case 'UK': 
        return { 
          border: 'border-blue-500/40', 
          bg: 'bg-blue-950/20', 
          glow: 'shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]',
          rgba: '59, 130, 246',
          text: 'text-blue-400'
        };
      case 'German': 
        return { 
          border: 'border-amber-500/40', 
          bg: 'bg-amber-950/20', 
          glow: 'shadow-[0_0_50px_-12px_rgba(245,158,11,0.3)]',
          rgba: '245, 158, 11',
          text: 'text-amber-400'
        };
      default: 
        return { 
          border: 'border-zinc-800', 
          bg: 'bg-zinc-900/50', 
          glow: 'shadow-2xl',
          rgba: '34, 211, 238',
          text: 'text-cyan-400'
        };
    }
  };

  const accent = getAccent();

  return (
    <motion.div 
      animate={isListening ? {
        borderColor: [
          'rgba(34, 211, 238, 0.2)', 
          'rgba(34, 211, 238, 0.6)', 
          'rgba(34, 211, 238, 0.2)'
        ],
        boxShadow: [
          '0 0 20px rgba(34, 211, 238, 0.1)',
          '0 0 40px rgba(34, 211, 238, 0.2)',
          '0 0 20px rgba(34, 211, 238, 0.1)'
        ],
      } : {}}
      transition={isListening ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      className={`w-full ${getKeyboardWidth()} mx-auto p-6 rounded-3xl glass transition-all duration-500 overflow-hidden relative`}
    >
      <div className="absolute top-3 right-6 flex gap-2">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Configuration</span>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded-md bg-zinc-800/80 border border-zinc-700 text-[9px] font-black uppercase tracking-tighter ${accent.text}`}>{layout}</span>
            <span className="px-2 py-1 rounded-md bg-zinc-800/80 border border-zinc-700 text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{kbType}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mt-8">
        {rowsToDisplay.map((row, rowIndex) => (
          <div key={`${layout}-${kbType}-row-${rowIndex}`} className="flex justify-center gap-1.5">
            {row.map((keyLabel, keyIndex) => {
              const active = isKeyActive(keyLabel);
              const isWide = ['Backspace', 'Tab', 'Enter', 'Shift', 'Caps', 'Space'].includes(keyLabel);
              const isExtraWide = keyLabel === 'Space';
              
              return (
                <motion.button
                  key={`${layout}-${kbType}-key-${rowIndex}-${keyIndex}-${keyLabel}`}
                  onClick={() => onKeyClick?.(keyLabel)}
                  initial={false}
                  whileHover={{
                    backgroundColor: active ? `rgba(${accent.rgba}, 0.35)` : 'rgba(39, 39, 42, 1)',
                    borderColor: active ? `rgba(${accent.rgba}, 0.9)` : 'rgba(63, 63, 70, 1)',
                    scale: active ? 1.08 : 1.05,
                    y: -1,
                    transition: { duration: 0.1 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    backgroundColor: active ? `rgba(${accent.rgba}, 0.3)` : 'rgba(24, 24, 27, 1)',
                    borderColor: active ? `rgba(${accent.rgba}, 0.8)` : 'rgba(39, 39, 42, 1)',
                    color: active ? '#ffffff' : 'rgba(161, 161, 170, 1)',
                    boxShadow: active ? `0 0 20px rgba(${accent.rgba}, 0.4)` : 'none',
                    scale: active ? 1.05 : 1,
                    y: 0
                  }}
                  className={`
                    flex items-center justify-center rounded-md border text-[10px] font-bold transition-all duration-75 cursor-pointer select-none
                    ${isExtraWide ? 'w-48 h-10' : isWide ? 'min-w-[50px] px-3 h-10' : 'w-10 h-10'}
                  `}
                >
                  {keyLabel}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Keyboard;
