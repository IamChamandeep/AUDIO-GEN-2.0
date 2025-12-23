
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData, mergeAudioBuffers } from "./audioUtils";

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    throw new Error("API Key not found in environment. Please ensure you are logged into your Google account.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const textChunks = chunkText(text, 400); 
  const audioBuffers: AudioBuffer[] = [];
  
  const expLevels = ["monotone", "flat", "subtle", "natural", "engaging", "expressive", "emotional", "dramatic", "theatrical", "intense", "extreme"];
  const emotionHint = expLevels[Math.floor(expressiveness)] || "expressive";
  const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede', 'Leda'];
  const safeVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

  for (let chunkIdx = 0; chunkIdx < textChunks.length; chunkIdx++) {
    const chunk = textChunks[chunkIdx];
    const promptText = `Narrate this part with a ${emotionHint} tone: ${chunk}`;

    let attempts = 0;
    const maxAttempts = 3; 

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
        if (!base64Audio) throw new Error("Empty audio response.");

        const audioBytes = decode(base64Audio);
        const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        audioBuffers.push(buffer);
        
        if (onProgress) onProgress(((chunkIdx + 1) / textChunks.length) * 100);
        await sleep(800); 
        break; 

      } catch (error: any) {
        attempts++;
        const errorMsg = error.toString();
        
        // Only trigger account selection if specifically requested by an error, don't force it upfront
        if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API_KEY_INVALID")) {
           throw new Error("Authentication error. Please use the 'Switch Account' button in the top right.");
        }

        if (attempts >= maxAttempts) throw new Error(`Generation error: ${errorMsg}`);
        await sleep(attempts * 1500);
      }
    }
  }

  if (audioBuffers.length === 0) throw new Error("Audio synthesis failed.");
  return audioBuffers.length === 1 ? audioBuffers[0] : mergeAudioBuffers(audioBuffers, audioContext);
};
