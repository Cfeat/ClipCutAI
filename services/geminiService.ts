import { GoogleGenAI } from "@google/genai";

// Helper to get client with current key
const getClient = () => {
  // Always create a new client to ensure we capture the latest selected key if using Veo flow
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    // Do not set responseMimeType for nano banana models
  });

  // For 2.5-flash-image, we look for inlineData in parts
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image generated");
};

interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

export const checkApiKey = async (): Promise<boolean> => {
    const aiStudio = (window as any).aistudio as AIStudio | undefined;
    if (aiStudio && aiStudio.hasSelectedApiKey) {
        return await aiStudio.hasSelectedApiKey();
    }
    return !!process.env.API_KEY;
}

export const promptForKey = async () => {
    const aiStudio = (window as any).aistudio as AIStudio | undefined;
    if (aiStudio && aiStudio.openSelectKey) {
        await aiStudio.openSelectKey();
    }
}

export const generateVideo = async (prompt: string): Promise<string> => {
  const ai = getClient();
  
  // Veo generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Polling
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed to return a URI");

  // Fetch the actual video blob
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateScript = async (topic: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Write a short, engaging video script (max 100 words) about: ${topic}. Format it as raw text.`,
  });
  return response.text || "";
};