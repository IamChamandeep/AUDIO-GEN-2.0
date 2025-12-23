
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData, mergeAudioBuffers } from "./audioUtils";

/**
 * Splits text into small chunks to ensure stability with the Gemini TTS model.
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
 * Generates audio using a fresh GoogleGenAI instance per call to pick up the latest injected API Key.
 */
export const generateStorySpeech = async (
  text: string, 
  audioContext: AudioContext, 
  voiceName: string = 'Kore',
  speed: number = 1.0,
  expressiveness: number = 5,
  onProgress?: (progress: number) => void
) => {
  // Access the injected API KEY directly
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
    }
    throw new Error("API Key is missing. Please connect your Google account via the Project Gate.");
  }

  // Create a new instance right before making the API call as per instructions
  const ai = new GoogleGenAI({ apiKey });
  const textChunks = chunkText(text, 400); 
  const audioBuffers: AudioBuffer[] = [];
  
  const expLevels = [
    "monotone", "flat", "subtle", "natural", "engaging", 
    "expressive", "emotional", "dramatic", "theatrical", "intense", "extreme"
  ];
  const emotionHint = expLevels[Math.floor(expressiveness)] || "expressive";
  const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede', 'Leda'];
  const safeVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

  for (let chunkIdx = 0; chunkIdx < textChunks.length; chunkIdx++) {
    const chunk = textChunks[chunkIdx];
    const promptText = `Narrate this story part with a ${emotionHint} tone: ${chunk}`;

    let attempts = 0;
    const maxAttempts = 5; 

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
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

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
          throw new Error("No audio returned from the engine.");
        }

        const audioBytes = decode(base64Audio);
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        audioBuffers.push(buffer);
        
        if (onProgress) {
          onProgress(((chunkIdx + 1) / textChunks.length) * 100);
        }

        // Small delay between chunks to respect processing cadence
        await sleep(1000); 
        break; 

      } catch (error: any) {
        attempts++;
        const errorMsg = error.toString();
        
        // Handle stale auth/entity not found by resetting via the bridge
        if (errorMsg.includes("Requested entity was not found")) {
           const aiStudio = (window as any).aistudio;
           if (aiStudio) {
             await aiStudio.openSelectKey();
           }
           throw new Error("Authentication stale. Please re-select your account in the popup.");
        }

        if (attempts >= maxAttempts) {
          throw new Error(`Narration failed after ${maxAttempts} attempts: ${errorMsg}`);
        }
        
        // Exponential backoff or constant sleep for transient errors
        await sleep(attempts * 2000);
      }
    }
  }

  if (audioBuffers.length === 0) throw new Error("Audio generation failed.");
  return audioBuffers.length === 1 ? audioBuffers[0] : mergeAudioBuffers(audioBuffers, audioContext);
};
