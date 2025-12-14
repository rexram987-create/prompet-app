export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string; // Base64 string for uploaded images
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
  preview: string;
  type: 'architect' | 'wallpaper';
}

export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  Portrait = "9:16",
  Wide = "2:1", // Not natively supported by all models, but useful for prompt context
  Mobile = "9:20" // Not natively supported directly in config usually, mapped to 9:16 or handled in prompt
}

export interface StyleOption {
  id: string;
  label: string;
  promptModifier: string;
}

export type TabView = 'architect' | 'wallpaper';

export interface GenerationResult {
  success: boolean;
  data?: string; // Base64 image or text
  error?: string;
}