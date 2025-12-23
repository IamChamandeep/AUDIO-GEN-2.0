import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData, mergeAudioBuffers } from "./audioUtils";

/**
 * Splits text into very small chunks (400 chars).
 * Gemini TTS preview models are most stable with small payloads.
 */
function chunkText(text: string, maxChars: number = 400): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    let cutIndex = remaining.lastIndexOf('।', maxChars);
    if (cutIndex === -1) cutIndex = remaining.lastIndexOf('.', maxChars);
    if (cutIndex === -1) cutIndex = remaining.lastIndexOf('?', maxChars);
    if (cutIndex === -1) cutIndex = remaining.lastIndexOf(' ', maxChars);
    if (cutIndex === -1) cutIndex = maxChars;

    chunks.push(remaining.substring(0, cutIndex + 1).trim());
    remaining = remaining.substring(cutIndex + 1).trim();
  }
  return chunks.filter(c => c.length > 0);
}

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generates audio using the latest available API key with resilient retry logic.
 */
export const generateStorySpeech = async (
  text: string, 
  audioContext: AudioContext, 
  voiceName: string = 'Kore',
  speed: number = 1.0,
  expressiveness: number = 5,
  onProgress?: (progress: number) => void
) => {
  // Always fetch the latest key from the environment/bridge
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // If the key is missing, we may need to prompt for re-authentication
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
    }
    throw new Error("API Key is missing. Please authenticate via the Project Gate.");
  }

  const textChunks = chunkText(text, 400); 
  const audioBuffers: AudioBuffer[] = [];
  
  // Create a fresh instance for every session to pick up bridge updates
  const ai = new GoogleGenAI({ apiKey });

  const expLevels = [
    "monotone and flat", 
    "very low emotion", 
    "subtle", 
    "natural", 
    "engaging", 
    "expressive", 
    "emotional", 
    "highly dramatic", 
    "extremely theatrical", 
    "intense and passionate", 
    "maximum intensity"
  ];
  const emotionHint = expLevels[Math.floor(expressiveness)] || "expressive";

  const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede', 'Leda'];
  const safeVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

  for (let chunkIdx = 0; chunkIdx < textChunks.length; chunkIdx++) {
    const chunk = textChunks[chunkIdx];
    const promptText = `Narrate this with a ${emotionHint} tone: ${chunk}`;

    let attempts = 0;
    const maxAttempts = 10; 
    let baseDelay = 3500;

    while (attempts < maxAttempts) {
      try {
        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: promptText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: safeVoice as any },
              },
            },
          },
        });

        const candidate = result.candidates?.[0];
        const base64Audio = candidate?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
          if (candidate?.finishReason === 'SAFETY') {
            throw new Error(`Safety Filter Blocked Content.`);
          }
          throw new Error("Empty audio response");
        }

        const audioBytes = decode(base64Audio);
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        audioBuffers.push(buffer);
        
        if (onProgress) {
          onProgress(((chunkIdx + 1) / textChunks.length) * 100);
        }

        await sleep(1500); 
        break; 

      } catch (error: any) {
        attempts++;
        let errorMsg = error.toString();
        
        // Handle specific "Requested entity was not found" error by triggering key selection
        if (errorMsg.includes("Requested entity was not found")) {
           const aiStudio = (window as any).aistudio;
           if (aiStudio) {
             await aiStudio.openSelectKey();
           }
           throw new Error("Authentication stale. Please select your project again.");
        }

        if (error.message) {
          errorMsg = error.message;
        }

        const isTransient = errorMsg.toLowerCase().includes('429') || 
                            errorMsg.toLowerCase().includes('quota') ||
                            errorMsg.toLowerCase().includes('empty audio') ||
                            errorMsg.toLowerCase().includes('internal');

        if (isTransient && attempts < maxAttempts) {
          let waitTime = errorMsg.toLowerCase().includes('quota') ? 30000 : 5000;
          await sleep(waitTime);
          continue;
        }

        throw new Error(`Narration failed: ${errorMsg}`);
      }
    }
  }

  if (audioBuffers.length === 0) throw new Error("No audio generated.");
  return audioBuffers.length === 1 ? audioBuffers[0] : mergeAudioBuffers(audioBuffers, audioContext);
};