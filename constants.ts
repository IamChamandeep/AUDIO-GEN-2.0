
export const STORY_TITLE = "ARJUN - Script & Audio Generator";
export const STORY_DESCRIPTION = "Professional AI Narrator for long-form scripts. Optimized for bulk generation and script fidelity.";

export const STORY_CONTENT = [
  { 
    id: 1, 
    text: "गाँव में अर्जुन नाम का लड़का रहता था। वह बहुत बुद्धिमान था।" 
  },
  { 
    id: 2, 
    text: "उसने एक पुरानी किताब खोजी। वह किताब जादुई थी।" 
  },
  { 
    id: 3, 
    text: "किताब खोलते ही रोशनी फैल गई। उसे अपना रास्ता मिल गया।" 
  }
];

export interface VoicePersona {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  style: string;
}

export const AVAILABLE_VOICES: VoicePersona[] = [
  // Female Personas
  { id: 'Aoede', name: 'Aoede', gender: 'Female', style: 'Highly Expressive & Dynamic' },
  { id: 'Leda', name: 'Leda', gender: 'Female', style: 'Steady, Mature & Professional' },
  { id: 'Puck', name: 'Puck', gender: 'Female', style: 'Bright, Energetic & Youthful' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', style: 'Soothing, Calm & Gentle' },
  
  // Male Personas
  { id: 'Charon', name: 'Charon', gender: 'Male', style: 'Authoritative, Bold & Strong' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', style: 'Dramatic, Theatrical Narrator' },
  { id: 'Kore', name: 'Kore', gender: 'Male', style: 'Neutral, Professional & Clear' },
];
