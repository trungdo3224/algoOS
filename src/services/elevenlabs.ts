// ElevenLabs API service for voice synthesis
const ELEVENLABS_API_KEY = 'sk_c4a3149429d3289ebb5fe780357283af3ef31881089a1ae7';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

// Get available voices
export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    // Return default voices if API fails
    return [
      {
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        category: 'premade',
        description: 'Deep, authoritative voice perfect for coaching'
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        category: 'premade', 
        description: 'Warm, encouraging voice ideal for learning'
      },
      {
        voice_id: 'ErXwobaYiN019PkySvjV',
        name: 'Antoni',
        category: 'premade',
        description: 'Clear, professional voice for explanations'
      }
    ];
  }
}

// Generate speech from text
export async function generateSpeech(
  text: string,
  voiceId: string,
  settings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  }
): Promise<string> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

// Stream speech (for real-time generation)
export async function streamSpeech(
  text: string,
  voiceId: string,
  onChunk: (chunk: Uint8Array) => void,
  settings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75
  }
): Promise<void> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(value);
    }
  } catch (error) {
    console.error('Error streaming speech:', error);
    throw error;
  }
}