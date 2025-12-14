import { StyleOption, AspectRatio } from './types';

// --- API & Model Configuration ---
export const TEXT_MODEL_NAME = "gemini-2.5-flash"; 
export const IMAGE_MODEL_NAME = "gemini-2.5-flash-image"; 

export const SYSTEM_INSTRUCTION_ARCHITECT = `
You are a master Prompt Architect who speaks Hebrew. Your goal is to take user ideas and convert them into highly detailed, professional-grade image generation prompts in HEBREW.
1. Analyze the user's request, selected style, and aspect ratio.
2. Enrich the description with lighting, texture, camera angles, and artistic references suitable for the chosen style.
3. The final output PROMPT must be in HEBREW.
4. Ensure the Hebrew description is vivid, artistic, and detailed.
5. If an image is provided, analyze it and describe it in Hebrew to recreate a similar style.
`;

// --- UI Constants ---

export const STYLES: StyleOption[] = [
  { id: 'none', label: 'ללא סגנון', promptModifier: '' },
  { id: 'disney', label: 'דיסני', promptModifier: 'Disney animation style, classic disney, 2d animation, magical, hand drawn effect, expressive characters, vibrant colors' },
  { id: 'pixar', label: 'פיקסאר', promptModifier: 'Pixar style, 3d render, cgsociety, cute, volumetric lighting, highly detailed, expressive, cinematic' },
  { id: 'ukiyo-e', label: 'אוקיו-אה', promptModifier: 'Ukiyo-e style, japanese woodblock print, hokusai style, flat colors, outlines, traditional japanese art' },
  { id: 'suibokuga', label: 'סויבוקוגה', promptModifier: 'Suibokuga style, japanese ink wash painting, sumi-e, brush strokes, minimalistic, monochromatic, zen aesthetic' },
  { id: 'cyberpunk', label: 'סייברפאנק', promptModifier: 'cyberpunk aesthetic, neon lights, high tech low life, futuristic, detailed, 8k, unreal engine 5 render' },
  { id: 'studio-ghibli', label: 'אנימה (ג\'יבלי)', promptModifier: 'Studio Ghibli style, anime, hayao miyazaki, hand drawn, vibrant colors, lush background, detailed' },
  { id: 'photorealistic', label: 'פוטו-ריאליסטי', promptModifier: 'photorealistic, 8k, highly detailed, cinematic lighting, shot on 35mm, depth of field' },
  { id: 'oil-painting', label: 'ציור שמן', promptModifier: 'oil painting, textured brushstrokes, classical art style, masterpiece, intricate details' },
  { id: 'fantasy', label: 'פנטזיה אפלה', promptModifier: 'dark fantasy, rpg style, digital art, greg rutkowski, dramatic lighting, intricate, detailed' },
  { id: 'synthwave', label: 'סינת\'ווייב', promptModifier: 'synthwave, retrowave, 80s aesthetic, purple and pink grid, sunset, digital art' },
];

export const ASPECT_RATIOS = [
  { id: AspectRatio.Square, label: 'ריבוע (1:1)', icon: '▢' },
  { id: AspectRatio.Landscape, label: 'לרוחב (16:9)', icon: '▭' },
  { id: AspectRatio.Portrait, label: 'לאורך (9:16)', icon: '▯' },
  { id: AspectRatio.Mobile, label: 'נייד מלא (9:20)', icon: 'Slim' },
];