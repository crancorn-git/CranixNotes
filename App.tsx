import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Briefcase, Coffee, LayoutGrid, Plus, Moon, Sun, Trash2, Folder, 
  CheckCircle2, Image as ImageIcon, Link, Hash, Clock, ListTodo, StickyNote, 
  CalendarCheck, Watch, ChevronDown, Plane, Code, Music, Gamepad2, Book, 
  Heart, Zap, Globe, Smile, Settings, Timer, Quote, Move, Calculator, CalendarDays,
  Download, Loader2
} from 'lucide-react';
import { AreaState, TileData, TileSize, WidgetType, AppSettings } from './types';
import Tile from './components/Tile';
import { TodoWidget, NoteWidget, TimerWidget, CounterWidget, ImageWidget, LinksWidget, HabitWidget, ClockWidget, StopwatchWidget, QuoteWidget, SpacerWidget, CalculatorWidget, CountdownWidget } from './components/Widgets';
import { loadAreas, saveAreas, loadDarkMode, saveDarkMode, loadSettings, saveSettings } from './services/storage';

// Define Electron window interface locally to ensure no TS errors
declare global {
  interface Window {
    electron?: {
      onUpdateAvailable: (cb: () => void) => void;
      onUpdateDownloaded: (cb: () => void) => void;
      restartApp: () => void;
    };
  }
}

const COLORS = [
  { id: 'blue', class: 'bg-blue-500' },
  { id: 'orange', class: 'bg-orange-500' },
  { id: 'emerald', class: 'bg-emerald-500' },
  { id: 'rose', class: 'bg-rose-500' },
  { id: 'violet', class: 'bg-violet-500' },
  { id: 'amber', class: 'bg-amber-500' },
  { id: 'cyan', class: 'bg-cyan-500' },
  { id: 'pink', class: 'bg-pink-500' },
];

const ICONS: Record<string, React.ElementType> = {
  home: Home,
  briefcase: Briefcase,
  coffee: Coffee,
  folder: Folder,
  plane: Plane,
  code: Code,
  music: Music,
  gamepad: Gamepad2,
  book: Book,
  heart: Heart,
  zap: Zap,
  globe: Globe,
  smile: Smile,
  settings: Settings
};

const DEFAULT_AREAS: AreaState[] = [
  {
    id: 'home',
    label: 'Home',
    theme: 'orange',
    icon: 'home',
    tiles: [
      { id: 'h1', type: WidgetType.TODO, title: 'Groceries', size: 'wide', content: { items: [{ id: '1', text: 'Milk', completed: false }, { id: '2', text: 'Eggs', completed: true }] } },
      { id: 'h4', type: WidgetType.CLOCK, title: 'Time', size: 'wide', content: { showSeconds: true, showDate: true, is24Hour: false } },
    ]
  }
];

const BACKGROUNDS = {
    minimal: 'bg-[#F2F2F7] dark:bg-[#000000]',
    aurora: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950',
    midnight: 'bg-slate-200 dark:bg-slate-950',
    sunset: 'bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950'
};

const BLUR_STRENGTHS = {
    low: 'backdrop-blur-sm bg-white/50 dark:bg-[#1C1C1E]/50',
    medium: 'backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70',
    high: 'backdrop-blur-3xl bg-white/80 dark:bg-[#1C1C1E]/80'
};

const App: React.FC = () => {
  const [activeAreaId, setActiveAreaId] = useState<string>('home');
  const [areas, setAreas] = useState<AreaState[]>(() => loadAreas(DEFAULT_AREAS));
  const [darkMode, setDarkMode] = useState(() => loadDarkMode());
  const [appSettings, setAppSettings] = useState<AppSettings>(() => loadSettings());
  
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageColor, setNewPageColor] = useState('blue');
  const [newPageIcon, setNewPageIcon] = useState('folder');
  
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showAddTileMenu, setShowAddTileMenu] = useState(false);

  // --- ELECTRON UPDATE LOGIC ---
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [readyToInstall, setReadyToInstall] = useState(false);

  useEffect(() => {
    if (window.electron) {
      window.electron.onUpdateAvailable(() => {
        setUpdateAvailable(true);
      });
      window.electron.onUpdateDownloaded(() => {
        setUpdateAvailable(false);
        setReadyToInstall(true);
      });
    }
  }, []);

  const handleRestart = () => {
    if (window.electron) {
      window.electron.restartApp();
    }
  };
  // -----------------------------

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveAreas(areas); }, [areas]);
  useEffect(() => { saveSettings(appSettings); }, [appSettings]);
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    saveDarkMode(darkMode);
  }, [darkMode]);

  const activeArea = areas.find(a => a.id === activeAreaId) || areas[0];

  const safeStartViewTransition = (callback: () => void) => {
      if ('startViewTransition' in document) {
          // @ts-ignore
          document.startViewTransition(callback);
      } else {
          callback();
      }
  };

  const updateTile = (areaId: string, tileId: string, newContent: any) => {
    setAreas(prev => prev.map(area => {
      if (area.id !== areaId) return area;
      return { ...area, tiles: area.tiles.map(tile => tile.id === tileId ? { ...tile, content: newContent } : tile) };
    }));
  };

  const resizeTile = (areaId: string, tileId: string) => {
    safeStartViewTransition(() => {
        setAreas(prev => prev.map(area => {
          if (area.id !== areaId) return area;
          return {
            ...area,
            tiles: area.tiles.map(tile => {
              if (tile.id !== tileId) return tile;
              const sizes: TileSize[] = ['small', 'wide', 'tall', 'big', 'banner', 'poster'];
              const nextIndex = (sizes.indexOf(tile.size) + 1) % sizes.length;
              return { ...tile, size: sizes[nextIndex] };
            })
          };
        }));
    });
  };

  const addTile = (type: WidgetType) => {
    let content = {};
    let title = 'Widget';
    let size: TileSize = 'small';
    
    switch (type) {
        case WidgetType.TODO: content = { items: [], hideCompleted: false }; title = 'To-Do'; break;
        case WidgetType.NOTE: content = { text: '', fontSize: 'normal', fontFamily: 'sans' }; title = 'Note'; break;
        case WidgetType.TIMER: content = { duration: 25 }; title = 'Timer'; break;
        case WidgetType.COUNTER: content = { count: 0 }; title = 'Counter'; break;
        case WidgetType.IMAGE: content = { url: '' }; title = 'Image'; break;
        case WidgetType.LINKS: content = { items: [] }; title = 'Links'; break;
        case WidgetType.HABIT: content = { habits: [] }; title = 'Habits'; size='wide'; break;
        case WidgetType.CLOCK: content = { showSeconds: true, showDate: true, is24Hour: false }; title = 'Clock'; size='wide'; break;
        case WidgetType.STOPWATCH: content = { elapsed: 0, laps: [], isRunning: false }; title = 'Stopwatch'; size='wide'; break;
        case WidgetType.QUOTE: content = { text: '"Simplicity is the ultimate sophistication."', author: 'Leonardo da Vinci' }; title = 'Quote'; size='wide'; break;
        case WidgetType.CALCULATOR: content = { display: '0' }; title = 'Calc'; size='tall'; break;
        case WidgetType.COUNTDOWN: content = { eventName: '', targetDate: '' }; title = 'Countdown'; break;
        case WidgetType.SPACER: content = {}; title = 'Spacer'; break;
    }

    const newTile: TileData = { id: Date.now().toString(), type, title, size, content };
    safeStartViewTransition(() => {
        setAreas(prev => prev.map(area => {
          if (area.id !== activeAreaId) return area;
          return { ...area, tiles: [...area.tiles, newTile] };
        }));
    });
    setShowAddTileMenu(false);
  };

  const removeTile = (id: string) => {
    safeStartViewTransition(() => {
        setAreas(prev => prev.map(area => {
          if (area.id !== activeAreaId) return area;
          return { ...area, tiles: area.tiles.filter(t => t.id !== id) };
        }));
    });
  };

  const addNewPage = () => {
    if (!newPageName.trim()) return;
    const id = newPageName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const newArea: AreaState = { id, label: newPageName, theme: newPageColor, icon: newPageIcon, tiles: [] };
    setAreas([...areas, newArea]);
    setActiveAreaId(id);
    setShowAddPageModal(false);
    setNewPageName('');
    setNewPageIcon('folder');
  };

  const updateCurrentPage = (updates: Partial<AreaState>) => {
    setAreas(prev => prev.map(a => a.id === activeAreaId ? { ...a, ...updates } : a));
  };

  const deleteCurrentPage = () => {
    if (areas.length <= 1) return;
    const newAreas = areas.filter(a => a.id !== activeAreaId);
    setAreas(newAreas);
    setActiveAreaId(newAreas[0].id);
    setShowPageSettings(false);
  };

  const exportData = () => {
      const dataStr = JSON.stringify(areas);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'cranixnotes_backup.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const parsed = JSON.parse(event.target?.result as string);
              if (Array.isArray(parsed)) {
                  setAreas(parsed);
                  setActiveAreaId(parsed[0].id);
                  alert('Import successful!');
                  setShowSettingsModal(false);
              }
          } catch (error) {
              alert('Failed to import data. Invalid file.');
          }
      };
      reader.readAsText(file);
  };

  const resetApp = () => {
      if (window.confirm('Are you sure you want to reset the app? All data will be lost.')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const renderWidget = (tile: TileData) => {
    const commonProps = { data: tile.content, onUpdate: (data: any) => updateTile(activeAreaId, tile.id, data), colorTheme: activeArea.theme };
    switch (tile.type) {
      case WidgetType.TODO: return <TodoWidget {...commonProps} />;
      case WidgetType.NOTE: return <NoteWidget {...commonProps} />;
      case WidgetType.TIMER: return <TimerWidget {...commonProps} />;
      case WidgetType.COUNTER: return <CounterWidget {...commonProps} />;
      case WidgetType.IMAGE: return <ImageWidget {...commonProps} />;
      case WidgetType.LINKS: return <LinksWidget {...commonProps} />;
      case WidgetType.HABIT: return <HabitWidget {...commonProps} />;
      case WidgetType.CLOCK: return <ClockWidget {...commonProps} />;
      case WidgetType.STOPWATCH: return <StopwatchWidget {...commonProps} />;
      case WidgetType.QUOTE: return <QuoteWidget {...commonProps} />;
      case WidgetType.CALCULATOR: return <CalculatorWidget {...commonProps} />;
      case WidgetType.COUNTDOWN: return <CountdownWidget {...commonProps} />;
      case WidgetType.SPACER: return <SpacerWidget />;
      default: return <div>Unknown Widget</div>;
    }
  };

  const renderIcon = (iconName: string | undefined, className: string) => {
      const IconComponent = ICONS[iconName || 'folder'] || Folder;
      return <IconComponent className={className} />;
  };

  const fontClass = {
      'sans': 'font-sans',
      'serif': 'font-serif',
      'mono': 'font-mono'
  }[appSettings.font] || 'font-sans';

  const dockPadding = {
      'small': 'px-2 py-2',
      'medium': 'px-3 py-3',
      'large': 'px-4 py-4'
  }[appSettings.dockSize] || 'px-3 py-3';

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 overflow-hidden ${fontClass} selection:bg-green-500/30 selection:text-green-900 dark:selection:text-green-200 ${BACKGROUNDS[appSettings.background]} ${appSettings.background === 'midnight' ? '' : ''}`}>
      
      {/* Main Content Area - Full Width */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Header - Draggable Region */}
        <header className="px-8 pt-10 pb-6 flex items-end justify-between z-10 titlebar-drag">
            <div className="flex flex-col gap-1">
                 {appSettings.userName && (
                     <h1 className="text-xl text-gray-400 dark:text-gray-500 font-medium mb-[-4px]">
                         Good Day, <span className="text-gray-800 dark:text-white font-bold">{appSettings.userName}</span>
                     </h1>
                 )}
                 {/* Interactive: No Drag */}
                 <div className="flex items-center gap-3 group cursor-pointer titlebar-no-drag" onClick={() => setShowPageSettings(!showPageSettings)}>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{activeArea.label}</h2>
                    <ChevronDown size={20} className="text-gray-400 mt-2 group-hover:text-gray-600 transition-colors" />
                 </div>
                 {appSettings.showDate && (
                    <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                 )}

                 {/* Settings Popover - Interactive: No Drag */}
                 {showPageSettings && (
                     <>
                     <div className="fixed inset-0 z-40 titlebar-no-drag" onClick={() => setShowPageSettings(false)} />
                     <div className={`absolute top-24 left-8 w-72 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 border border-white/20 ${BLUR_STRENGTHS[appSettings.blurStrength]} titlebar-no-drag`}>
                         <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Color Theme</h4>
                         <div className="grid grid-cols-4 gap-2 mb-6">
                            {COLORS.map(c => (
                                <button key={c.id} onClick={() => updateCurrentPage({ theme: c.id })} className={`aspect-square rounded-full ${c.class} flex items-center justify-center ${activeArea.theme === c.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}>
                                    {activeArea.theme === c.id && <CheckCircle2 size={12} className="text-white"/>}
                                </button>
                            ))}
                         </div>
                         {areas.length > 1 && (
                            <button onClick={deleteCurrentPage} className="w-full py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold">Delete Space</button>
                         )}
                     </div>
                     </>
                 )}
            </div>

            {/* Add Widget Button - Interactive: No Drag */}
            <div className="relative titlebar-no-drag">
               <button 
                 onClick={() => setShowAddTileMenu(!showAddTileMenu)}
                 className="w-12 h-12 bg-white dark:bg-[#1C1C1E] text-green-500 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
               >
                 <Plus size={24} strokeWidth={3} />
               </button>
               {showAddTileMenu && (
                   <>
                   <div className="fixed inset-0 z-40 titlebar-no-drag" onClick={() => setShowAddTileMenu(false)} />
                   <div className={`absolute right-0 mt-4 w-64 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 border border-white/20 max-h-96 overflow-y-auto custom-scrollbar ${BLUR_STRENGTHS[appSettings.blurStrength]} titlebar-no-drag`}>
                      {[
                          { type: WidgetType.TODO, label: 'To-Do', icon: ListTodo, color: 'text-green-500' },
                          { type: WidgetType.NOTE, label: 'Note', icon: StickyNote, color: 'text-yellow-500' },
                          { type: WidgetType.TIMER, label: 'Timer', icon: Clock, color: 'text-purple-500' },
                          { type: WidgetType.HABIT, label: 'Habit', icon: CalendarCheck, color: 'text-teal-500' },
                          { type: WidgetType.CLOCK, label: 'Clock', icon: Watch, color: 'text-gray-500' },
                          { type: WidgetType.CALCULATOR, label: 'Calculator', icon: Calculator, color: 'text-orange-500' },
                          { type: WidgetType.COUNTDOWN, label: 'Countdown', icon: CalendarDays, color: 'text-blue-500' },
                          { type: WidgetType.STOPWATCH, label: 'Stopwatch', icon: Timer, color: 'text-orange-500' },
                          { type: WidgetType.LINKS, label: 'Links', icon: Link, color: 'text-indigo-500' },
                          { type: WidgetType.COUNTER, label: 'Counter', icon: Hash, color: 'text-emerald-500' },
                          { type: WidgetType.QUOTE, label: 'Quote', icon: Quote, color: 'text-pink-500' },
                          { type: WidgetType.IMAGE, label: 'Image', icon: ImageIcon, color: 'text-rose-500' },
                          { type: WidgetType.SPACER, label: 'Spacer', icon: Move, color: 'text-gray-400' },
                      ].map(item => (
                          <button key={item.type} onClick={() => addTile(item.type)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                              <item.icon size={18} className={item.color} /> {item.label}
                          </button>
                      ))}
                   </div>
                   </>
               )}
            </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-40 custom-scrollbar">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] grid-flow-dense max-w-[1920px] mx-auto"
            style={{ gap: `${appSettings.gridGap}px` }}
          >
            {activeArea.tiles.map(tile => (
              <Tile 
                key={tile.id} 
                id={tile.id}
                title={tile.title} 
                size={tile.size}
                colorTheme={activeArea.theme}
                onResize={() => resizeTile(activeArea.id, tile.id)}
                onRemove={() => removeTile(tile.id)}
                variant={tile.type === WidgetType.SPACER ? 'ghost' : 'default'}
                borderRadius={appSettings.tileRounding}
              >
                {renderWidget(tile)}
              </Tile>
            ))}
            
            {activeArea.tiles.length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400">
                <LayoutGrid size={48} className="opacity-20 mb-4" />
                <p className="font-medium text-lg">Empty Space</p>
                <button onClick={() => setShowAddTileMenu(true)} className="text-green-500 font-semibold mt-2 text-sm hover:underline">Add a widget</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MacOS Style Floating Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-2 ${dockPadding} ${BLUR_STRENGTHS[appSettings.blurStrength]} border border-white/20 dark:border-white/10 rounded-full shadow-2xl transition-all duration-300 hover:scale-[1.02]`}>
              
              {/* Space Icons */}
              {areas.map((area) => {
                  const isActive = activeAreaId === area.id;
                  return (
                      <button
                        key={area.id}
                        onClick={() => {
                            safeStartViewTransition(() => setActiveAreaId(area.id));
                        }}
                        className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
                      >
                          <div className={`
                            w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300
                            ${isActive 
                                ? `bg-${area.theme}-500 text-white shadow-lg scale-110` 
                                : 'bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                            }
                          `}>
                              {renderIcon(area.icon, isActive ? 'w-5 h-5' : 'w-5 h-5')}
                          </div>
                          
                          {/* Dot indicator for active */}
                          {isActive && <div className={`absolute -bottom-1 w-1 h-1 rounded-full bg-${area.theme}-500 opacity-60`}></div>}
                          
                          {/* Tooltip */}
                          <span className="absolute -top-14 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              {area.label}
                          </span>
                      </button>
                  );
              })}

              <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2"></div>

              {/* Add Space Button */}
              <button 
                onClick={() => setShowAddPageModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
              >
                  <Plus size={20} />
              </button>

              {/* Settings Button */}
               <button 
                onClick={() => setShowSettingsModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95 ml-1"
              >
                 <Settings size={20} />
              </button>

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95 ml-1"
              >
                 {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* ELECTRON UPDATE NOTIFICATION BUTTON */}
              {(updateAvailable || readyToInstall) && (
                <div className="flex items-center ml-1 animate-in slide-in-from-right duration-500">
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                    <button 
                        onClick={readyToInstall ? handleRestart : undefined}
                        disabled={!readyToInstall}
                        className={`w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all ${readyToInstall ? 'hover:bg-blue-600 active:scale-95 cursor-pointer' : 'cursor-default'}`}
                        title={readyToInstall ? "Restart to update" : "Downloading update..."}
                    >
                        {updateAvailable ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                            <Download size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-500"></span>
                            </>
                        )}
                    </button>
                </div>
              )}

          </div>
      </div>

      {/* Add Page Modal */}
      {showAddPageModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-12 titlebar-no-drag">
          <div className={`bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md text-center animate-in zoom-in-95 border border-white/20`}>
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">New Space</h3>
             <p className="text-gray-500 mb-8">Create a new dashboard for your widgets.</p>
             
             <input 
               autoFocus
               value={newPageName}
               onChange={e => setNewPageName(e.target.value)}
               className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-900 dark:text-white rounded-2xl px-5 py-4 text-lg outline-none mb-6 text-center font-semibold placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 transition-all"
               placeholder="Name (e.g. Travel)"
             />

             {/* Icon Picker */}
             <div className="mb-8">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Choose Icon</p>
                 <div className="grid grid-cols-6 gap-3">
                     {Object.entries(ICONS).filter(([k]) => k !== 'settings').map(([key, IconComp]) => (
                         <button
                            key={key}
                            onClick={() => setNewPageIcon(key)}
                            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${newPageIcon === key ? `bg-green-500 text-white shadow-lg scale-110` : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                         >
                             <IconComp size={20} />
                         </button>
                     ))}
                 </div>
             </div>
             
             <div className="flex gap-3">
               <button onClick={() => setShowAddPageModal(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-900 dark:text-white font-semibold text-lg active:scale-95 transition-transform">Cancel</button>
               <button onClick={addNewPage} disabled={!newPageName.trim()} className="flex-1 py-3.5 bg-green-500 rounded-xl text-white font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-green-500/20">Create</button>
             </div>
          </div>
        </div>
      )}

      {/* Global Settings Modal (iOS Settings Style) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-12 titlebar-no-drag">
             <div className="bg-[#F2F2F7] dark:bg-[#000000] w-full max-w-2xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95">
                 {/* Modal Header */}
                 <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                     <button onClick={() => setShowSettingsModal(false)} className="bg-gray-200 dark:bg-white/10 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-white/20">
                         <Trash2 size={0} className="hidden" /> {/* Hack to keep spacing if needed, but using X instead */}
                         <span className="font-bold text-green-500 px-2">Done</span>
                     </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                     
                     {/* Appearance Section */}
                     <div className="mb-8">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-4">Appearance</h3>
                         <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
                             
                             {/* Background Selector */}
                             <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Background</label>
                                 <div className="grid grid-cols-2 gap-3">
                                     {Object.keys(BACKGROUNDS).map((bgKey) => (
                                         <button 
                                            key={bgKey}
                                            onClick={() => setAppSettings(s => ({ ...s, background: bgKey as any }))}
                                            className={`h-16 rounded-xl border-2 transition-all capitalize text-sm font-medium flex items-center justify-center
                                                ${appSettings.background === bgKey ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-500'}
                                            `}
                                         >
                                             {bgKey === 'midnight' ? 'Slate' : bgKey}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             {/* Typography */}
                             <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Typography</label>
                                 <div className="flex bg-gray-100 dark:bg-[#2C2C2E] p-1 rounded-lg">
                                     {['sans', 'serif', 'mono'].map((f) => (
                                         <button 
                                            key={f}
                                            onClick={() => setAppSettings(s => ({ ...s, font: f as any }))}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${appSettings.font === f ? 'bg-white dark:bg-[#3A3A3C] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                         >
                                             {f === 'sans' ? 'Modern' : f === 'serif' ? 'Elegant' : 'Tech'}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                              {/* Greeting Name */}
                              <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                  <label className="text-sm font-medium text-gray-900 dark:text-white">Greeting Name</label>
                                  <input 
                                     value={appSettings.userName}
                                     onChange={(e) => setAppSettings(s => ({ ...s, userName: e.target.value }))}
                                     placeholder="e.g. John"
                                     className="bg-gray-100 dark:bg-[#2C2C2E] rounded-lg px-3 py-1.5 text-sm outline-none text-right w-32"
                                  />
                             </div>

                             {/* Tile Roundness Slider */}
                             <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                 <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Tile Roundness</label>
                                    <span className="text-xs text-gray-400">{appSettings.tileRounding}px</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="0" 
                                    max="40" 
                                    value={appSettings.tileRounding} 
                                    onChange={(e) => setAppSettings(s => ({ ...s, tileRounding: parseInt(e.target.value) }))}
                                    className="w-full accent-green-500"
                                 />
                             </div>

                             {/* Grid Gap Slider */}
                             <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                 <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Grid Spacing</label>
                                    <span className="text-xs text-gray-400">{appSettings.gridGap}px</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="12" 
                                    max="48" 
                                    value={appSettings.gridGap} 
                                    onChange={(e) => setAppSettings(s => ({ ...s, gridGap: parseInt(e.target.value) }))}
                                    className="w-full accent-green-500"
                                 />
                             </div>

                              {/* Blur Strength */}
                              <div className="p-4">
                                 <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Glass Blur</label>
                                 <div className="flex bg-gray-100 dark:bg-[#2C2C2E] p-1 rounded-lg">
                                     {['low', 'medium', 'high'].map((b) => (
                                         <button 
                                            key={b}
                                            onClick={() => setAppSettings(s => ({ ...s, blurStrength: b as any }))}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${appSettings.blurStrength === b ? 'bg-white dark:bg-[#3A3A3C] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                         >
                                             {b}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                         </div>
                     </div>
                     
                     {/* Interface Section */}
                     <div className="mb-8">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-4">Interface</h3>
                         <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
                             
                             <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                 <label className="text-sm font-medium text-gray-900 dark:text-white">Show Header Date</label>
                                 <button 
                                    onClick={() => setAppSettings(s => ({ ...s, showDate: !s.showDate }))}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${appSettings.showDate ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                 >
                                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${appSettings.showDate ? 'left-6' : 'left-1'}`} />
                                 </button>
                             </div>

                             <div className="p-4 flex items-center justify-between">
                                 <label className="text-sm font-medium text-gray-900 dark:text-white">Dock Size</label>
                                 <div className="flex bg-gray-100 dark:bg-[#2C2C2E] p-1 rounded-lg w-40">
                                     {['small', 'medium', 'large'].map((sizeOption) => (
                                         <button 
                                            key={sizeOption}
                                            onClick={() => setAppSettings(prev => ({ ...prev, dockSize: sizeOption as any }))}
                                            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all capitalize ${appSettings.dockSize === sizeOption ? 'bg-white dark:bg-[#3A3A3C] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                         >
                                             {sizeOption === 'medium' ? 'Std' : sizeOption}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                         </div>
                     </div>


                     {/* Data Management Section */}
                     <div>
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-4">Data Management</h3>
                         <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
                             <button onClick={exportData} className="w-full p-4 text-left flex items-center justify-between border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                 <span className="text-sm font-medium text-gray-900 dark:text-white">Export Data (JSON)</span>
                                 <ChevronDown size={16} className="text-gray-400 -rotate-90" />
                             </button>
                             
                             <div className="relative w-full">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImport}
                                    accept=".json"
                                    className="hidden"
                                />
                                <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 text-left flex items-center justify-between border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Import Data</span>
                                    <ChevronDown size={16} className="text-gray-400 -rotate-90" />
                                </button>
                             </div>

                             <button onClick={resetApp} className="w-full p-4 text-left flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                 <span className="text-sm font-medium text-red-500">Reset Application</span>
                                 <Trash2 size={16} className="text-red-500" />
                             </button>
                         </div>
                     </div>

                     <div className="mt-8 text-center">
                         <p className="text-xs text-gray-400">CranixNotes v1.0.5</p>
                     </div>

                 </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default App;