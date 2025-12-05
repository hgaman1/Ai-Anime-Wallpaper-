import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, Language } from "../types";

export interface BaseImage {
  data: string; // base64 encoded string without the data URL prefix
  mimeType: string;
}

const styleMap: { [key: string]: string } = {
  ghibli: 'Vibrant, cinematic, highly detailed, epic lighting, beautiful composition, iconic Ghibli aesthetic, with a touch of nostalgia and wonder.',
  cyberpunk: 'Cyberpunk style, neon-drenched cityscapes, futuristic technology, cybernetic enhancements, rainy streets, high-contrast lighting, dystopian mood.',
  steampunk: 'Steampunk aesthetic, victorian era with retrofuturistic technology, gears, cogs, steam-powered machinery, copper and brass tones, intricate details.',
  pixel: 'Pixel art style, 16-bit, detailed sprites, vibrant retro color palette, nostalgic video game feel, crisp pixelated look.',
  fantasy: 'High fantasy style, epic landscapes, magical elements, mythical creatures, ornate armor, cinematic lighting, lord of the rings inspiration.',
};

export const generateWallpaper = async (
  prompt: string,
  baseImage: BaseImage | null,
  aspectRatio: AspectRatio | null,
  style: string | null,
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // --- IMAGE EDITING LOGIC (with gemini-2.5-flash-image) ---
    if (baseImage) {
      const parts: any[] = [];
      parts.push({
        inlineData: {
          data: baseImage.data,
          mimeType: baseImage.mimeType,
        },
      });
      let enhancedPrompt = `Using the provided image as a base, create a new masterpiece by applying the following changes: "${prompt}". Enhance the image with vibrant colors, cinematic lighting, and highly detailed elements. Output in 8k resolution.`;
      parts.push({ text: enhancedPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts,
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
      }
      throw new Error("No image was generated during editing. The response might have been blocked.");
    
    // --- IMAGE GENERATION LOGIC (with imagen-4.0-generate-001) ---
    } else {
      const styleKeywords = style ? styleMap[style] : styleMap['ghibli'];
      const enhancedPrompt = `Masterpiece anime wallpaper of: "${prompt}".
      Style: ${styleKeywords}
      Quality: 8k resolution, ultra-high quality, trending on ArtStation.
      Mood: Evoke a powerful emotion suitable for a wallpaper.`;

      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: enhancedPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio || '9:16',
          },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      
      throw new Error("No image was generated. The response might have been blocked.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
};

export const upscaleImage = async (
  baseImage: BaseImage,
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const upscalePrompt = `Take this image and upscale it to 8K resolution. Sharpen the details, enhance the lighting and colors, and improve the overall quality to a cinematic masterpiece level without changing the subject or composition. Make it incredibly clear and detailed.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } },
          { text: upscalePrompt }
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image was generated during upscale. The response might have been blocked.");
  } catch (error) {
    console.error("Error upscaling image:", error);
    throw new Error("Failed to upscale image with Gemini API.");
  }
};

/**
 * Enhances a user's prompt using AI.
 */
export const enhancePrompt = async (currentPrompt: string, language: Language): Promise<string> => {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    
    const contents = language === 'ar' 
        ? `حوّل هذه الفكرة البسيطة إلى وصف غني بالتفاصيل البصرية والإضاءة والمشاعر لإنشاء صورة فنية بالذكاء الاصطناعي. اجعل الوصف باللغة العربية. الفكرة هي: "${currentPrompt}"`
        : `Transform this simple idea into a rich description full of visual details, lighting, and emotion to create an AI art piece. Make the description in English. The idea is: "${currentPrompt}"`;
        
    const systemInstruction = language === 'ar'
        ? "أنت مساعد إبداعي متخصص في كتابة أوصاف فنية لبرامج توليد الصور. مهمتك هي تحويل أفكار المستخدمين البسيطة إلى أوصاف غنية وملهمة. يجب أن يكون الناتج هو الوصف المحسّن فقط، بدون أي مقدمات أو عبارات إضافية."
        : "You are a creative assistant specializing in writing artistic prompts for image generation software. Your task is to transform users' simple ideas into rich, inspiring descriptions. The output should be only the enhanced prompt, without any introductions or extra phrases.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error("Failed to enhance prompt.");
    }
};

/**
 * Suggests a new creative prompt.
 */
export const suggestPrompt = async (language: Language): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const contents = language === 'ar'
        ? "اقترح فكرة جديدة ومبتكرة لوصف خلفية أنمي فنية."
        : "Suggest a new and creative idea for an artistic anime wallpaper prompt.";
        
    const systemInstruction = language === 'ar'
        ? "أنت مساعد إبداعي متخصص في توليد أفكار ملهمة لصور فنية. مهمتك هي اقتراح وصف واحد فريد ومبتكر باللغة العربية. يجب أن يكون الناتج هو الوصف المقترح فقط، بدون أي مقدمات أو عبارات إضافية مثل 'بالتأكيد، تفضل:'."
        : "You are a creative assistant specializing in generating inspiring ideas for artistic images. Your task is to suggest a single, unique, and innovative description in English. The output should be only the suggested prompt, without any preambles or phrases like 'Sure, here you go:'.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
             config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error suggesting prompt:", error);
        throw new Error("Failed to suggest prompt.");
    }
};