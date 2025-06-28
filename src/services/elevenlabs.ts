// ElevenLabs API service for voice synthesis
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
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

export interface SpeechGenerationError {
  type: 'rate_limit' | 'api_error' | 'network_error' | 'config_error';
  message: string;
  retryAfter?: number;
}

// Utility function to wait for a specified time
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Retry mechanism with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error && error.message.includes('API key not configured')) {
        throw error;
      }
      
      // Check if it's a rate limit error
      const isRateLimit = error instanceof Error && error.message.includes('429');
      
      if (attempt === maxRetries) {
        // Last attempt failed, throw the error
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = isRateLimit 
        ? baseDelay * Math.pow(2, attempt) + Math.random() * 1000 // Add jitter for rate limits
        : baseDelay * Math.pow(2, attempt);
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await wait(delay);
    }
  }
  
  throw lastError!;
}

// Enhanced error handling for API responses
function handleApiError(response: Response): SpeechGenerationError {
  switch (response.status) {
    case 429:
      const retryAfter = response.headers.get('Retry-After');
      return {
        type: 'rate_limit',
        message: 'Rate limit exceeded. Please wait before making more requests.',
        retryAfter: retryAfter ? parseInt(retryAfter) * 1000 : 60000 // Default to 60 seconds
      };
    case 401:
      return {
        type: 'config_error',
        message: 'Invalid API key. Please check your ElevenLabs configuration.'
      };
    case 403:
      return {
        type: 'config_error',
        message: 'Access forbidden. Please check your ElevenLabs subscription and permissions.'
      };
    case 422:
      return {
        type: 'api_error',
        message: 'Invalid request parameters. Please check your voice settings.'
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'api_error',
        message: 'ElevenLabs service temporarily unavailable. Please try again later.'
      };
    default:
      return {
        type: 'api_error',
        message: `ElevenLabs API error: ${response.status}`
      };
  }
}

// Get available voices
export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured, using default voices');
      return getDefaultVoices();
    }

    return await retryWithBackoff(async () => {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        const error = handleApiError(response);
        throw new Error(error.message);
      }

      const data = await response.json();
      return data.voices || getDefaultVoices();
    }, 2, 2000); // 2 retries with 2 second base delay
  } catch (error) {
    console.error('Error fetching voices:', error);
    // Return default voices if API fails
    return getDefaultVoices();
  }
}

// Default voices fallback
function getDefaultVoices(): Voice[] {
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

// Generate speech from text with enhanced error handling
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
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Please add your API key to continue using voice features.');
  }

  // Validate text length (ElevenLabs has limits)
  if (text.length > 5000) {
    throw new Error('Text too long. Please limit to 5000 characters or less.');
  }

  try {
    return await retryWithBackoff(async () => {
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
        const error = handleApiError(response);
        
        // For rate limits, throw with specific information
        if (error.type === 'rate_limit') {
          const rateLimitError = new Error(error.message);
          (rateLimitError as any).type = 'rate_limit';
          (rateLimitError as any).retryAfter = error.retryAfter;
          throw rateLimitError;
        }
        
        throw new Error(error.message);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    }, 3, 2000); // 3 retries with 2 second base delay
  } catch (error) {
    console.error('Error generating speech:', error);
    
    // Re-throw with enhanced error information
    if (error instanceof Error) {
      const enhancedError = new Error(error.message);
      (enhancedError as any).type = (error as any).type || 'api_error';
      (enhancedError as any).retryAfter = (error as any).retryAfter;
      throw enhancedError;
    }
    
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
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    await retryWithBackoff(async () => {
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
        const error = handleApiError(response);
        throw new Error(error.message);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(value);
      }
    }, 2, 3000); // 2 retries with 3 second base delay for streaming
  } catch (error) {
    console.error('Error streaming speech:', error);
    throw error;
  }
}

// Check API quota/usage (if available)
export async function checkApiUsage(): Promise<{ charactersUsed?: number; charactersLimit?: number } | null> {
  try {
    if (!ELEVENLABS_API_KEY) {
      return null;
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      charactersUsed: data.subscription?.character_count,
      charactersLimit: data.subscription?.character_limit
    };
  } catch (error) {
    console.error('Error checking API usage:', error);
    return null;
  }
}