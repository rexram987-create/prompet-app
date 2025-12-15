
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TEXT_MODEL_NAME, IMAGE_MODEL_NAME, SYSTEM_INSTRUCTION_ARCHITECT } from "../constants";

// Initialize the API client
// Ideally, this should be in a context or hook, but for this single-file requirement structure, we init here.
// We assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Helper to convert a File object to a GoogleGenAI compatible part
 */
export async function fileToPart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generates text response for the Prompt Architect (Chat)
 */
export async function generateArchitectResponse(
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  imagePart?: { inlineData: { data: string; mimeType: string } }
): Promise<string> {
  try {
    // Construct content parts
    const parts: any[] = [];
    
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: prompt });

    // Note: While 'chat' abstraction exists, for multimodal single-turn-heavy interactions 
    // or when mixing images dynamically, generateContent is often more flexible.
    // However, to maintain history context, we can manually format history or use chat.
    // Given the multimodal nature, we will use generateContent with system instructions.

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ARCHITECT,
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Architect Generation Error:", error);
    throw error;
  }
}

/**
 * Generates an image for the Wallpaper Generator
 */
export async function generateWallpaperImage(
  prompt: string, 
  aspectRatio: string
): Promise<string> {
  try {
    // Determine the closest valid aspect ratio for the API
    // Gemini Flash Image supports 1:1, 3:4, 4:3, 9:16, 16:9
    let targetRatio = "1:1";
    if (aspectRatio === "16:9") targetRatio = "16:9";
    if (aspectRatio === "9:16" || aspectRatio === "9:20") targetRatio = "9:16";

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: targetRatio,
          // imageSize: "1K" // Default
        }
      }
    });

    // Extract base64 image from response parts
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Wallpaper Generation Error:", error);
    throw error;
  }
}
