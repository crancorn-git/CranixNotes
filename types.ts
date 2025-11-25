

export type AreaType = string;

export type TileSize = 'small' | 'wide' | 'tall' | 'big' | 'banner' | 'poster';

export enum WidgetType {
  TODO = 'TODO',
  NOTE = 'NOTE',
  TIMER = 'TIMER',
  COUNTER = 'COUNTER',
  IMAGE = 'IMAGE',
  LINKS = 'LINKS',
  HABIT = 'HABIT',
  CLOCK = 'CLOCK',
  STOPWATCH = 'STOPWATCH',
  QUOTE = 'QUOTE',
  SPACER = 'SPACER',
  CALCULATOR = 'CALCULATOR',
  COUNTDOWN = 'COUNTDOWN'
}

export interface TileData {
  id: string;
  type: WidgetType;
  title: string;
  size: TileSize;
  content: any; // Flexible content based on widget type
}

export interface AreaState {
  id: string;
  label: string;
  theme: string;
  tiles: TileData[];
  icon?: string; // Optional icon identifier
}

export interface AppSettings {
  background: 'minimal' | 'aurora' | 'midnight' | 'sunset';
  tileRounding: number; // px, default 32
  gridGap: number; // px, default 24
  font: 'sans' | 'serif' | 'mono';
  blurStrength: 'low' | 'medium' | 'high';
  dockSize: 'small' | 'medium' | 'large';
  showDate: boolean;
  userName: string;
}

// Specific content interfaces
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoContent {
  items: TodoItem[];
  hideCompleted?: boolean;
}

export interface NoteContent {
  text: string;
  fontSize?: 'normal' | 'large';
  fontFamily?: 'sans' | 'mono';
}

export interface TimerContent {
  duration: number; // stored in minutes usually, but input might vary
  unit?: 'm' | 'h';
  timeLeft?: number;
  isRunning?: boolean;
}

export interface CounterContent {
  count: number;
}

export interface ImageContent {
  url: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface LinksContent {
  items: LinkItem[];
}

export interface HabitItem {
    id: string;
    text: string;
    history: boolean[]; // Array of 7 booleans for the week
}

export interface HabitContent {
    habits: HabitItem[];
}

export interface ClockContent {
    timezone?: string;
    showSeconds: boolean;
    showDate?: boolean;
    is24Hour?: boolean;
}

export interface StopwatchContent {
    elapsed: number;
    isRunning: boolean;
    laps: number[];
}

export interface QuoteContent {
    text: string;
    author: string;
}

export interface CalculatorContent {
    display: string;
    lastResult?: string;
}

export interface CountdownContent {
    targetDate: string; // ISO string
    eventName: string;
}

// Spacer has no content
export interface SpacerContent {}