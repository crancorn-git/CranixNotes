
import React from 'react';
import { TileSize } from '../types';
import { Maximize2, X, MoveDiagonal } from 'lucide-react';

interface TileProps {
  id: string; // Added ID prop for ViewTransition naming
  title: string;
  size: TileSize;
  children: React.ReactNode;
  onResize: () => void;
  onRemove?: () => void;
  colorTheme: string;
  variant?: 'default' | 'ghost';
  borderRadius?: number;
}

const getSizeClasses = (size: TileSize): string => {
  switch (size) {
    case 'small': return 'col-span-1 row-span-1 h-52'; 
    case 'wide': return 'col-span-1 md:col-span-2 row-span-1 h-52';
    case 'tall': return 'col-span-1 row-span-2 h-[27rem]';
    case 'big': return 'col-span-1 md:col-span-2 row-span-2 h-[27rem]';
    case 'banner': return 'col-span-1 md:col-span-4 row-span-1 h-52';
    case 'poster': return 'col-span-1 md:col-span-4 row-span-2 h-[27rem]';
    default: return 'col-span-1 row-span-1 h-52';
  }
};

const Tile: React.FC<TileProps> = ({ id, title, size, children, onResize, onRemove, colorTheme, variant = 'default', borderRadius = 32 }) => {
  
  // Unique view transition name for this tile based on its ID
  // This allows the browser to track this specific element during layout changes
  const transitionStyle = {
      viewTransitionName: `tile-${id}`,
      borderRadius: `${borderRadius}px`
  } as React.CSSProperties;

  if (variant === 'ghost') {
      return (
        <div 
            className={`relative group flex flex-col items-center justify-center tile-transition ${getSizeClasses(size)} border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[2rem] hover:bg-gray-50 dark:hover:bg-white/5 opacity-0 hover:opacity-100 transition-all duration-300`}
            style={transitionStyle}
        >
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Spacer</span>
             <div className="flex gap-2 mt-2">
                 <button onClick={onResize} className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300"><Maximize2 size={12}/></button>
                 {onRemove && <button onClick={onRemove} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full hover:bg-red-200"><X size={12}/></button>}
             </div>
        </div>
      );
  }

  return (
    <div 
      className={`relative group flex flex-col tile-transition ${getSizeClasses(size)}
        bg-white dark:bg-[#1C1C1E]
        shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
        dark:shadow-none
        overflow-hidden
        hover:scale-[1.01] transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)
        z-0 hover:z-10
      `}
      style={transitionStyle}
    >
      {/* iOS Widget Header */}
      <div className="px-6 pt-5 pb-2 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
            {/* Theme Dot */}
            <div className={`w-1.5 h-1.5 rounded-full bg-${colorTheme}-500`}></div>
            <h3 className="font-semibold text-[10px] tracking-widest text-gray-400 dark:text-gray-500 uppercase">
              {title}
            </h3>
        </div>

        {/* Action Buttons (Visible on Hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={onResize}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors"
          >
            <Maximize2 size={10} strokeWidth={2.5} />
          </button>
          {onRemove && (
             <button 
             onClick={onRemove}
             className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
           >
             <X size={10} strokeWidth={2.5} />
           </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 relative text-gray-900 dark:text-gray-100">
        <div className="h-full w-full overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>

      {/* Resize Handle (Subtle) */}
      <div 
        onClick={(e) => {
            e.stopPropagation();
            onResize();
        }}
        className="absolute bottom-0 right-0 w-12 h-12 flex items-end justify-end p-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

export default Tile;