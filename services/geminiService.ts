
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
 * Generates audio using the default API key with highly resilient retry logic.
 */
export const generateStorySpeech = async (
  text: string, 
  audioContext: AudioContext, 
  voiceName: string = 'Kore',
  speed: number = 1.0,
  expressiveness: number = 5,
  onProgress?: (progress: number) => void
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from the environment.");
  }

  const textChunks = chunkText(text, 400); 
  const audioBuffers: AudioBuffer[] = [];
  
  const ai = new GoogleGenAI({ apiKey });

  // Map 0-10 expressiveness to descriptive terms for the AI
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
    // We explicitly tell the AI the tone to help it adjust the TTS output
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
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
            ] as any,
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

        // Delay to respect rate limits
        await sleep(1500); 
        break; 

      } catch (error: any) {
        attempts++;
        let errorMsg = error.toString();
        
        if (error.message) {
          errorMsg = error.message;
          if (errorMsg.includes('{')) {
             try {
               const start = errorMsg.indexOf('{');
               const parsed = JSON.parse(errorMsg.substring(start));
               errorMsg = parsed.error?.message || errorMsg;
             } catch(e) {}
          }
        }

        if (errorMsg.toLowerCase().includes('safety')) throw error;

        const isTransient = errorMsg.toLowerCase().includes('xhr') || 
                            errorMsg.toLowerCase().includes('rpc') ||
                            errorMsg.toLowerCase().includes('network') ||
                            errorMsg.toLowerCase().includes('fetch') ||
                            errorMsg.toLowerCase().includes('429') ||
                            errorMsg.toLowerCase().includes('quota') ||
                            errorMsg.toLowerCase().includes('deadline') ||
                            errorMsg.toLowerCase().includes('internal') ||
                            errorMsg.toLowerCase().includes('empty audio');

        if (isTransient && attempts < maxAttempts) {
          const isQuota = errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('429');
          const isEmpty = errorMsg.toLowerCase().includes('empty audio');
          
          let waitTime = isQuota 
            ? (35000 + (Math.random() * 15000)) 
            : (baseDelay * Math.pow(1.6, attempts - 1)) + (Math.random() * 1000);
          
          if (isEmpty) waitTime += 3000;

          console.warn(`Attempt ${attempts} failed: ${errorMsg}. Retrying in ${Math.round(waitTime/1000)}s...`);
          await sleep(waitTime);
          continue;
        }

        throw new Error(`Narration failed for segment ${chunkIdx + 1}: ${errorMsg}`);
      }
    }
  }

  if (audioBuffers.length === 0) throw new Error("No audio generated.");
  return audioBuffers.length === 1 ? audioBuffers[0] : mergeAudioBuffers(audioBuffers, audioContext);
};
