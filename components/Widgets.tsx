

import React, { useState, useEffect, useRef } from 'react';
import { TodoItem, TodoContent, NoteContent, CounterContent, ImageContent, LinksContent, HabitContent, ClockContent, StopwatchContent, QuoteContent, CalculatorContent, CountdownContent } from '../types';
import { Check, Plus, Trash2, Play, Square, RotateCcw, Minus, Image as ImageIcon, ExternalLink, RotateCw, Link as LinkIcon, Calendar, Flag, Pause, Quote, Eye, EyeOff, Type, AlignLeft, CalendarDays, Calculator, Globe } from 'lucide-react';

interface WidgetProps<T> {
  data: T;
  onUpdate: (newData: T) => void;
  colorTheme: string;
}

// --- Shared Components ---
const IOSInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props}
        className={`w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none placeholder-gray-500 focus:bg-gray-200 dark:focus:bg-[#3A3A3C] transition-colors ${props.className}`}
    />
);

// --- ToDo Widget ---
export const TodoWidget: React.FC<WidgetProps<TodoContent>> = ({ data, onUpdate, colorTheme }) => {
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    const newItem: TodoItem = { id: Date.now().toString(), text: input.trim(), completed: false };
    onUpdate({ ...data, items: [...data.items, newItem] });
    setInput('');
  };

  const toggle = (id: string) => {
    onUpdate({
      ...data,
      items: data.items.map(i => i.id === id ? { ...i, completed: !i.completed } : i)
    });
  };

  const remove = (id: string) => {
    onUpdate({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  const visibleItems = data.hideCompleted ? data.items.filter(i => !i.completed) : data.items;

  return (
    <div className="h-full flex flex-col relative group/widget">
      {/* Options Overlay */}
      <div className="absolute top-[-2.5rem] right-0 opacity-0 group-hover/widget:opacity-100 transition-opacity z-20 flex gap-2">
          <button 
            onClick={() => onUpdate({ ...data, hideCompleted: !data.hideCompleted })}
            className="p-1.5 bg-gray-200 dark:bg-[#3A3A3C] rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#48484A]"
            title={data.hideCompleted ? "Show Completed" : "Hide Completed"}
          >
              {data.hideCompleted ? <EyeOff size={12}/> : <Eye size={12}/>}
          </button>
      </div>

      <div className="flex gap-2 mb-4 relative">
        <IOSInput 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a task..."
        />
        <button 
          onClick={add} 
          disabled={!input.trim()}
          className={`absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center bg-${colorTheme}-500 text-white rounded-lg opacity-0 disabled:opacity-0 transition-all ${input.trim() ? 'opacity-100' : ''}`}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
      <div className="flex-1 space-y-2 pr-1 overflow-y-auto">
        {visibleItems.length === 0 && (
          <div className="h-20 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm font-medium">
            {data.items.length > 0 ? "All tasks completed!" : "No active tasks"}
          </div>
        )}
        {visibleItems.map(item => (
          <div key={item.id} className="group flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
            <button 
              onClick={() => toggle(item.id)}
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${item.completed ? `bg-${colorTheme}-500 border-${colorTheme}-500` : 'border-gray-300 dark:border-gray-600'}`}
            >
              {item.completed && <Check size={12} className="text-white" strokeWidth={4} />}
            </button>
            <span className={`flex-1 text-[15px] font-medium transition-all ${item.completed ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-900 dark:text-white'}`}>
              {item.text}
            </span>
            <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Note Widget ---
export const NoteWidget: React.FC<WidgetProps<NoteContent>> = ({ data, onUpdate }) => {
  return (
    <div className="h-full relative group/widget">
         {/* Options Overlay */}
         <div className="absolute top-[-2.5rem] right-0 opacity-0 group-hover/widget:opacity-100 transition-opacity z-20 flex gap-2">
            <button 
                onClick={() => onUpdate({ ...data, fontSize: data.fontSize === 'large' ? 'normal' : 'large' })}
                className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#48484A] ${data.fontSize === 'large' ? 'bg-gray-300 dark:bg-[#5A5A5C] text-gray-900 dark:text-white' : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-500'}`}
            >
                <Type size={12}/>
            </button>
            <button 
                onClick={() => onUpdate({ ...data, fontFamily: data.fontFamily === 'mono' ? 'sans' : 'mono' })}
                className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#48484A] ${data.fontFamily === 'mono' ? 'bg-gray-300 dark:bg-[#5A5A5C] text-gray-900 dark:text-white' : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-500'}`}
            >
                <AlignLeft size={12}/>
            </button>
        </div>

        <textarea
        className={`w-full h-full resize-none border-none outline-none text-gray-800 dark:text-gray-200 leading-relaxed bg-transparent placeholder-gray-400
            ${data.fontSize === 'large' ? 'text-xl' : 'text-base'}
            ${data.fontFamily === 'mono' ? 'font-mono' : 'font-sans'}
        `}
        placeholder="Jot something down..."
        value={data.text}
        onChange={(e) => onUpdate({ ...data, text: e.target.value })}
        spellCheck={false}
        />
    </div>
  );
};

// --- Timer Widget ---
export const TimerWidget: React.FC<WidgetProps<{ duration: number; timeLeft?: number; isRunning?: boolean; unit?: 'm' | 'h' }>> = ({ data, onUpdate, colorTheme }) => {
  const [timeLeft, setTimeLeft] = useState(data.timeLeft ?? data.duration * 60);
  const [isActive, setIsActive] = useState(data.isRunning ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.duration.toString());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unit = data.unit || 'm';

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    onUpdate({ ...data, timeLeft, isRunning: isActive });
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    const multiplier = unit === 'h' ? 3600 : 60;
    setTimeLeft(data.duration * multiplier);
  };
  
  const addTime = (amount: number) => {
      // Amount in minutes
      setTimeLeft(prev => prev + (amount * 60));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleEditComplete = () => {
      setIsEditing(false);
      const val = parseInt(editValue) || 25;
      onUpdate({ ...data, duration: val });
      const multiplier = unit === 'h' ? 3600 : 60;
      setTimeLeft(val * multiplier);
  };

  const toggleUnit = () => {
      const newUnit = unit === 'm' ? 'h' : 'm';
      onUpdate({ ...data, unit: newUnit });
      // Reset timer on unit change to match new duration
      const multiplier = newUnit === 'h' ? 3600 : 60;
      setTimeLeft(data.duration * multiplier);
      setIsActive(false);
  };

  const totalDuration = data.duration * (unit === 'h' ? 3600 : 60);
  const progress = 100 - (timeLeft / Math.max(totalDuration, timeLeft || 1)) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-between py-1 overflow-hidden">
      <div className="relative w-full h-1 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-full overflow-hidden shrink-0">
        <div 
          className={`h-full bg-${colorTheme}-500 transition-all duration-1000 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
          {isEditing ? (
              <div className="flex items-center gap-1">
                  <input 
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={handleEditComplete}
                    onKeyDown={e => e.key === 'Enter' && handleEditComplete()}
                    className="text-4xl font-bold bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg text-center w-24 py-1 outline-none text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <button 
                    onClick={toggleUnit}
                    className="text-lg font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 py-1 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg"
                  >
                      {unit.toUpperCase()}
                  </button>
              </div>
          ) : (
             <div 
                onClick={() => !isActive && setIsEditing(true)}
                className={`text-5xl font-light tracking-tighter tabular-nums text-gray-900 dark:text-white cursor-pointer ${isActive ? '' : 'hover:opacity-70'} transition-opacity`}
             >
                {formatTime(timeLeft)}
             </div>
          )}
          
          {!isActive && !isEditing && (
             <div className="absolute -bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[1, 5, 10].map(m => (
                      <button key={m} onClick={() => addTime(m)} className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2C2C2E] rounded text-[10px] font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3A3A3C]">
                          +{m}m
                      </button>
                  ))}
             </div>
          )}
      </div>

      <div className="flex gap-4 shrink-0 mt-2">
        <button 
          onClick={resetTimer}
          className="w-10 h-10 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-900 dark:text-white font-medium flex items-center justify-center hover:bg-gray-300 dark:hover:bg-[#3A3A3C] transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button 
          onClick={toggleTimer}
          className={`h-10 px-6 rounded-full bg-${isActive ? 'orange-500' : `${colorTheme}-500`} text-white font-semibold flex items-center justify-center hover:opacity-90 transition-opacity text-sm`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
};

// --- Counter Widget ---
export const CounterWidget: React.FC<WidgetProps<CounterContent>> = ({ data, onUpdate, colorTheme }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="text-7xl font-bold tracking-tighter tabular-nums text-gray-900 dark:text-white">
        {data.count}
      </div>
      <div className="flex items-center gap-3 bg-[#E5E5EA] dark:bg-[#2C2C2E] p-1.5 rounded-2xl">
        <button 
          onClick={() => onUpdate({ count: data.count - 1 })}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#3A3A3C] rounded-xl shadow-sm hover:scale-95 transition-transform"
        >
          <Minus size={20} />
        </button>
        <button 
          onClick={() => onUpdate({ count: 0 })}
          className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500"
        >
          Reset
        </button>
        <button 
          onClick={() => onUpdate({ count: data.count + 1 })}
          className={`w-10 h-10 flex items-center justify-center bg-${colorTheme}-500 text-white rounded-xl shadow-sm hover:scale-95 transition-transform`}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Image Widget ---
export const ImageWidget: React.FC<WidgetProps<ImageContent>> = ({ data, onUpdate, colorTheme }) => {
  const [isEditing, setIsEditing] = useState(!data.url);
  const [tempUrl, setTempUrl] = useState(data.url);

  if (isEditing) {
    return (
      <div className="h-full flex flex-col justify-center items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center text-gray-400">
          <ImageIcon size={28} />
        </div>
        <IOSInput 
          value={tempUrl}
          onChange={e => setTempUrl(e.target.value)}
          placeholder="Paste Image URL"
          autoFocus
        />
        <button 
          onClick={() => { onUpdate({ url: tempUrl }); setIsEditing(false); }}
          className={`w-full py-2.5 bg-${colorTheme}-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity`}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 group">
      <img 
        src={data.url} 
        alt="Widget" 
        className="w-full h-full object-cover" 
        onError={() => setIsEditing(true)} 
      />
      <button 
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <RotateCw size={14} />
      </button>
    </div>
  );
};

// --- Links Widget ---
export const LinksWidget: React.FC<WidgetProps<LinksContent>> = ({ data, onUpdate, colorTheme }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const addLink = () => {
    if (!newLabel || !newUrl) return;
    let formattedUrl = newUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = 'https://' + formattedUrl;
    
    onUpdate({ items: [...data.items, { id: Date.now().toString(), label: newLabel, url: formattedUrl }] });
    setNewLabel('');
    setNewUrl('');
    setShowAdd(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {data.items.map(link => (
          <a 
            key={link.id} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 rounded-2xl bg-[#E5E5EA]/50 dark:bg-[#2C2C2E]/50 hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors"
          >
            <div className={`w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center text-${colorTheme}-500`}>
              {link.url.includes('github') ? <span className="font-bold text-[10px]">GH</span> : <ExternalLink size={14} />}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="font-semibold text-sm truncate text-gray-900 dark:text-white">{link.label}</div>
                <div className="text-[10px] text-gray-500 truncate">{new URL(link.url).hostname}</div>
            </div>
            <button 
                onClick={(e) => { e.preventDefault(); onUpdate({ items: data.items.filter(i => i.id !== link.id) }); }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
            >
                <Trash2 size={14} />
            </button>
          </a>
        ))}
        {data.items.length === 0 && !showAdd && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <LinkIcon size={24} className="mb-2 opacity-50"/>
                <span className="text-xs">No links saved</span>
            </div>
        )}
      </div>

      {showAdd ? (
        <div className="mt-3 bg-[#E5E5EA] dark:bg-[#2C2C2E] p-3 rounded-2xl animate-in slide-in-from-bottom-2">
          <input className="w-full bg-transparent text-sm font-semibold outline-none placeholder-gray-500 mb-2" placeholder="Title" value={newLabel} onChange={e => setNewLabel(e.target.value)} autoFocus />
          <div className="h-px bg-gray-300 dark:bg-gray-600 mb-2" />
          <input className="w-full bg-transparent text-sm outline-none placeholder-gray-500 mb-3" placeholder="URL" value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg text-xs font-bold">Cancel</button>
            <button onClick={addLink} className={`flex-1 py-1.5 bg-${colorTheme}-500 text-white rounded-lg text-xs font-bold`}>Add</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className={`mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:border-${colorTheme}-500 hover:text-${colorTheme}-500 text-xs font-bold uppercase tracking-widest transition-colors`}>
          Add Link
        </button>
      )}
    </div>
  );
};

// --- Habit Widget ---
export const HabitWidget: React.FC<WidgetProps<HabitContent>> = ({ data, onUpdate, colorTheme }) => {
    const [input, setInput] = useState('');
    const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const addHabit = () => {
        if (!input.trim()) return;
        const newHabit = { id: Date.now().toString(), text: input.trim(), history: new Array(7).fill(false) };
        onUpdate({ habits: [...data.habits, newHabit] });
        setInput('');
    };

    const toggleDay = (habitId: string, dayIndex: number) => {
        onUpdate({
            habits: data.habits.map(h => h.id === habitId ? { ...h, history: h.history.map((val, idx) => idx === dayIndex ? !val : val) } : h)
        });
    };

    return (
        <div className="h-full flex flex-col">
             <div className="flex gap-2 mb-4 relative">
                <IOSInput 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHabit()}
                placeholder="Track a habit..."
                />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {data.habits.map(habit => (
                    <div key={habit.id} className="group">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{habit.text}</span>
                            <button onClick={() => onUpdate({ habits: data.habits.filter(h => h.id !== habit.id) })} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                                <Trash2 size={12} />
                            </button>
                        </div>
                        <div className="flex justify-between gap-1">
                            {habit.history.map((done, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => toggleDay(habit.id, idx)}
                                    className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all duration-300
                                        ${done 
                                            ? `bg-${colorTheme}-500 text-white scale-105` 
                                            : 'bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-400 hover:bg-gray-300 dark:hover:bg-[#3A3A3C]'
                                        }`}
                                >
                                    {DAYS[idx]}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Clock Widget ---
export const ClockWidget: React.FC<WidgetProps<ClockContent>> = ({ data, onUpdate, colorTheme }) => {
    const [time, setTime] = useState(new Date());
    
    // Simple list of major timezones
    const timezones = [
        { label: 'Local', value: undefined },
        { label: 'UTC', value: 'UTC' },
        { label: 'London', value: 'Europe/London' },
        { label: 'New York', value: 'America/New_York' },
        { label: 'Los Angeles', value: 'America/Los_Angeles' },
        { label: 'Tokyo', value: 'Asia/Tokyo' },
        { label: 'Sydney', value: 'Australia/Sydney' },
    ];

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeStr = time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: !data.is24Hour,
        timeZone: data.timezone
    });
    
    // We need to parse seconds manually if using custom timezone because getSeconds() is local
    const getSecondsInTimezone = () => {
        if (!data.timezone) return time.getSeconds();
        const str = time.toLocaleTimeString([], { timeZone: data.timezone, hour12: false, second: 'numeric' });
        // The string might be "HH:MM:SS" or just "SS" depending on browser, usually full time.
        // Safer way:
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: data.timezone,
            second: 'numeric',
            hour12: false
        }).formatToParts(time);
        return parts.find(p => p.type === 'second')?.value || '00';
    };

    const secStr = getSecondsInTimezone().toString().padStart(2, '0');
    
    const dateStr = time.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        timeZone: data.timezone
    });

    const nextTimezone = () => {
        const idx = timezones.findIndex(t => t.value === data.timezone);
        const next = timezones[(idx + 1) % timezones.length];
        onUpdate({ ...data, timezone: next.value });
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center relative group/widget">
             {/* Options Overlay */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full group-hover/widget:translate-y-[-1rem] opacity-0 group-hover/widget:opacity-100 transition-all duration-300 z-20 flex gap-2 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-xl">
                 <button onClick={() => onUpdate({ ...data, is24Hour: !data.is24Hour })} className={`px-2 py-1 rounded-full text-[10px] font-bold ${data.is24Hour ? `bg-${colorTheme}-500 text-white` : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-500'}`}>24H</button>
                 <button onClick={() => onUpdate({ ...data, showSeconds: !data.showSeconds })} className={`px-2 py-1 rounded-full text-[10px] font-bold ${data.showSeconds ? `bg-${colorTheme}-500 text-white` : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-500'}`}>SEC</button>
                 <button onClick={() => onUpdate({ ...data, showDate: data.showDate === false ? true : false })} className={`px-2 py-1 rounded-full text-[10px] font-bold ${data.showDate !== false ? `bg-${colorTheme}-500 text-white` : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-500'}`}>DATE</button>
                 <button onClick={nextTimezone} className={`px-2 py-1 rounded-full text-[10px] font-bold ${data.timezone ? `bg-${colorTheme}-500 text-white` : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-500'}`}>
                     {timezones.find(t => t.value === data.timezone)?.label || 'LOC'}
                 </button>
            </div>

            <div className="text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white tabular-nums flex items-baseline leading-none mb-2">
                {timeStr}
                {data.showSeconds && <span className="text-xl lg:text-2xl font-medium text-gray-400 ml-1">{secStr}</span>}
            </div>
            {data.showDate !== false && (
                <div className={`text-sm font-semibold text-${colorTheme}-500 uppercase tracking-wide`}>
                    {dateStr}
                </div>
            )}
             {data.timezone && <div className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">{timezones.find(t => t.value === data.timezone)?.label}</div>}
        </div>
    );
};

// --- Stopwatch Widget ---
export const StopwatchWidget: React.FC<WidgetProps<StopwatchContent>> = ({ data, onUpdate, colorTheme }) => {
    const [time, setTime] = useState(data.elapsed);
    const [isRunning, setIsRunning] = useState(data.isRunning);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now() - time;
            intervalRef.current = setInterval(() => {
                setTime(Date.now() - startTime);
            }, 10);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    useEffect(() => {
        if (!isRunning) onUpdate({ ...data, elapsed: time, isRunning });
    }, [isRunning]);

    const format = (ms: number) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        const centi = Math.floor((ms % 1000) / 10);
        return `${min}:${sec.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`;
    };

    const toggle = () => setIsRunning(!isRunning);
    const lap = () => {
        onUpdate({ ...data, elapsed: time, laps: [time, ...data.laps], isRunning });
    };
    const reset = () => {
        setIsRunning(false);
        setTime(0);
        onUpdate({ ...data, elapsed: 0, laps: [], isRunning: false });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 flex items-center justify-center py-2">
                 <div className="text-5xl font-light tracking-tighter tabular-nums text-gray-900 dark:text-white">
                    {format(time)}
                </div>
            </div>
            {/* Flexible scrolling container for laps with custom scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto mb-4 border-t border-b border-gray-100 dark:border-white/5 py-2 custom-scrollbar">
                 {data.laps.map((l, i) => (
                     <div key={i} className="flex justify-between text-sm py-1 text-gray-500 px-2">
                         <span>Lap {data.laps.length - i}</span>
                         <span className="font-mono">{format(l)}</span>
                     </div>
                 ))}
                 {data.laps.length === 0 && <div className="text-center text-xs text-gray-400 py-2">No laps yet</div>}
            </div>
            <div className="shrink-0 flex gap-2">
                 <button onClick={isRunning ? lap : reset} className="flex-1 py-2 rounded-xl bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-900 dark:text-white font-semibold text-sm">
                     {isRunning ? 'Lap' : 'Reset'}
                 </button>
                 <button 
                    onClick={toggle} 
                    className={`flex-1 py-2 rounded-xl text-white font-semibold text-sm transition-colors ${isRunning ? 'bg-red-500 hover:bg-red-600' : `bg-${colorTheme}-500 hover:bg-${colorTheme}-600`}`}
                >
                     {isRunning ? 'Stop' : 'Start'}
                 </button>
            </div>
        </div>
    );
};

// --- Quote Widget ---
export const QuoteWidget: React.FC<WidgetProps<QuoteContent>> = ({ data, onUpdate }) => {
    return (
        <div className="h-full flex flex-col justify-center text-center p-2 group">
            <Quote size={24} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <textarea
                value={data.text}
                onChange={e => onUpdate({ ...data, text: e.target.value })}
                className="w-full bg-transparent text-center font-serif text-xl italic text-gray-800 dark:text-gray-200 outline-none resize-none overflow-hidden placeholder-gray-300"
                placeholder="Type your favorite quote..."
                rows={3}
            />
            <input 
                 value={data.author}
                 onChange={e => onUpdate({ ...data, author: e.target.value })}
                 className="mt-2 w-full bg-transparent text-center text-xs font-bold uppercase tracking-widest text-gray-400 outline-none"
                 placeholder="AUTHOR"
            />
        </div>
    );
};

// --- Calculator Widget ---
export const CalculatorWidget: React.FC<WidgetProps<CalculatorContent>> = ({ data, onUpdate, colorTheme }) => {
    const [display, setDisplay] = useState(data.display || '0');
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [pendingOp, setPendingOp] = useState<string | null>(null);
    const [value, setValue] = useState<number | null>(null);

    const inputDigit = (digit: number) => {
        if (waitingForOperand) {
            setDisplay(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? String(digit) : display + digit);
        }
    };

    const performOp = (nextOp: string) => {
        const inputValue = parseFloat(display);
        
        if (value === null) {
            setValue(inputValue);
        } else if (pendingOp) {
            const currentValue = value || 0;
            const newValue = calculate(currentValue, inputValue, pendingOp);
            setValue(newValue);
            setDisplay(String(newValue));
        }

        setWaitingForOperand(true);
        setPendingOp(nextOp);
    };

    const calculate = (right: number, left: number, op: string) => {
        switch(op) {
            case '+': return right + left;
            case '-': return right - left;
            case '*': return right * left;
            case '/': return right / left;
            default: return left;
        }
    };

    const clear = () => {
        setDisplay('0');
        setValue(null);
        setPendingOp(null);
        setWaitingForOperand(false);
    };

    const handleUpdate = () => {
        onUpdate({ display, lastResult: display });
    };
    
    useEffect(() => { handleUpdate() }, [display]);

    const btnClass = "flex items-center justify-center rounded-lg text-lg font-medium transition-colors active:scale-95";
    const numClass = `${btnClass} bg-[#E5E5EA] dark:bg-[#2C2C2E] text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-[#3A3A3C]`;
    
    const getOpClass = (op: string) => {
        const isActive = pendingOp === op;
        return `${btnClass} transition-all ${isActive ? `bg-${colorTheme}-500 text-white` : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/40'}`;
    };
    
    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-[#151516] rounded-xl flex items-end justify-end p-3 overflow-hidden">
                <span className="text-3xl font-light tracking-tight">{display.substring(0, 10)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 h-4/5">
                <button onClick={clear} className={`${btnClass} col-span-1 bg-gray-200 dark:bg-[#3A3A3C] text-red-500`}>C</button>
                <button onClick={() => performOp('/')} className={getOpClass('/')}>÷</button>
                <button onClick={() => performOp('*')} className={getOpClass('*')}>×</button>
                <button onClick={() => {
                    const current = parseFloat(display);
                    if (current) {
                        setDisplay(String(current * -1));
                    }
                }} className={getOpClass('pm')}>±</button>
                
                {[7,8,9].map(n => <button key={n} onClick={() => inputDigit(n)} className={numClass}>{n}</button>)}
                <button onClick={() => performOp('-')} className={getOpClass('-')}>-</button>
                
                {[4,5,6].map(n => <button key={n} onClick={() => inputDigit(n)} className={numClass}>{n}</button>)}
                <button onClick={() => performOp('+')} className={getOpClass('+')}>+</button>
                
                {[1,2,3].map(n => <button key={n} onClick={() => inputDigit(n)} className={numClass}>{n}</button>)}
                <button onClick={() => performOp('=')} className={`${btnClass} row-span-2 bg-${colorTheme}-500 text-white shadow-lg`}>=</button>
                
                <button onClick={() => inputDigit(0)} className={`${numClass} col-span-2`}>0</button>
                <button onClick={() => { if(!display.includes('.')) setDisplay(display + '.')}} className={numClass}>.</button>
            </div>
        </div>
    );
};

// --- Countdown Widget ---
export const CountdownWidget: React.FC<WidgetProps<CountdownContent>> = ({ data, onUpdate, colorTheme }) => {
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null);
    const [isEditing, setIsEditing] = useState(!data.targetDate);

    useEffect(() => {
        if (!data.targetDate) return;
        const calc = () => {
            const now = new Date().getTime();
            const target = new Date(data.targetDate).getTime();
            const diff = target - now;

            if (diff < 0) {
                setTimeLeft(null); // Passed
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ days, hours, minutes });
            }
        };
        calc();
        const t = setInterval(calc, 60000);
        return () => clearInterval(t);
    }, [data.targetDate]);

    if (isEditing) {
        return (
            <div className="h-full flex flex-col justify-center gap-2">
                <input 
                    type="text" 
                    className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-xl px-3 py-1.5 text-sm outline-none" 
                    placeholder="Event Name"
                    value={data.eventName}
                    onChange={e => onUpdate({...data, eventName: e.target.value})}
                />
                <input 
                    type="date" 
                    className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-xl px-3 py-1.5 text-sm outline-none" 
                    value={data.targetDate}
                    onChange={e => onUpdate({...data, targetDate: e.target.value})}
                />
                <button onClick={() => setIsEditing(false)} className={`w-full py-2 bg-${colorTheme}-500 text-white rounded-xl font-bold`}>Start Countdown</button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-center group">
            <button onClick={() => setIsEditing(true)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400">
                <RotateCw size={12} />
            </button>
            
            <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{data.eventName || 'Event'}</div>
            
            {timeLeft ? (
                <div className="flex items-baseline gap-2">
                    <div className="flex flex-col">
                        <span className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white tabular-nums">{timeLeft.days}</span>
                        <span className="text-[10px] font-bold text-gray-400">DAYS</span>
                    </div>
                    <span className="text-xl text-gray-300 font-light">:</span>
                    <div className="flex flex-col">
                        <span className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white tabular-nums">{timeLeft.hours}</span>
                        <span className="text-[10px] font-bold text-gray-400">HOURS</span>
                    </div>
                </div>
            ) : (
                <div className="text-xl font-bold text-green-500">Completed!</div>
            )}
        </div>
    )
};


// --- Spacer Widget ---
export const SpacerWidget: React.FC = () => {
    return <div className="w-full h-full" />;
};
