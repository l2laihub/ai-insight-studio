
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

// Helper to convert file to base64
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getAINews = async (topics: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const topicsList = topics.join(", ");
  const prompt = `Find the latest news about the following topics: ${topicsList}. Provide a comprehensive summary for each topic and include source names. Focus on events from the last 7 days. Use Markdown for formatting.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Filter sources to ensure they have web/uri
    const formattedSources = sources
      .filter((s: any) => s.web?.uri || s.maps?.uri)
      .map((s: any) => ({
        title: s.web?.title || s.maps?.title || "Source",
        uri: s.web?.uri || s.maps?.uri
      }));

    return {
      text,
      sources: formattedSources
    };
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export const generateInfographic = async (summary: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a professional, high-quality, modern, and detailed vertical infographic based on the following AI news summary: 
  
  ${summary}
  
  The infographic should feature:
  - Clear sections for each major topic
  - Sleek icons and data visualizations (charts, timelines)
  - A clean typography layout with bold headings
  - A sophisticated color palette (blues, slates, and whites)
  - No messy text, just high-level insights and visual icons.
  Vertical aspect ratio 9:16 is preferred but 1:1 is acceptable.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No infographic data found in response");
  } catch (error) {
    console.error("Error generating infographic:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, size: ImageSize) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const mimeType = base64Image.split(';')[0].split(':')[1];
  const base64Data = base64Image.split(',')[1];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image data found in response");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
