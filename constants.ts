
export const STORY_TITLE = "CHAMANDEEP - Script & Audio Generator";
export const STORY_DESCRIPTION = "Professional AI Narrator for long-form scripts. Optimized for bulk generation and script fidelity.";

export const STORY_CONTENT = [
  { 
    id: 1, 
    text: "एक समय की बात है, एक बहुत ही सुंदर गाँव में चमनदीप नाम का एक लड़का रहता था। वह अपनी बुद्धिमानी के लिए प्रसिद्ध था।" 
  },
  { 
    id: 2, 
    text: "वह बहुत बुद्धिमान और दयालु था। वह हमेशा दूसरों की मदद करने के लिए तैयार रहता था, चाहे वह इंसान हो या जानवर।" 
  },
  { 
    id: 3, 
    text: "एक दिन उसने पुराने पुस्तकालय के कोने में एक जादुई किताब देखी, जिसमें कई अनकही कहानियाँ और रहस्य छिपे थे।" 
  },
  {
    id: 4,
    text: "जैसे ही उसने किताब खोली, पन्ने अपने आप पलटने लगे और एक सुनहरी रोशनी कमरे में फैल गई। चमनदीप समझ गया कि यह कोई साधारण किताब नहीं है।"
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
