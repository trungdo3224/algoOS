import axios from 'axios';

const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://api.tavus.io/v2/videos';

interface TavusVideoRequest {
  user_name: string;
  problem_title: string;
  score: number;
  feedback: string;
  suggestion: string;
}

export async function generateVideoFeedback({
  user_name,
  problem_title,
  score,
  feedback,
  suggestion
}: TavusVideoRequest): Promise<string> {
  try {
    if (!TAVUS_API_KEY) {
      throw new Error('Tavus API key is not configured');
    }

    const script = generateFeedbackScript({
      user_name,
      problem_title,
      score,
      feedback,
      suggestion
    });

    const response = await axios.post(
      TAVUS_API_URL,
      {
        script,
        language: 'en',
        voice_id: 'default'
      },
      {
        headers: {
          'Authorization': `Bearer ${TAVUS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.video_url;
  } catch (error) {
    console.error('Error generating video feedback:', error);
    throw error;
  }
}

function generateFeedbackScript({
  user_name,
  problem_title,
  score,
  feedback,
  suggestion
}: TavusVideoRequest): string {
  return `Hi ${user_name}! I've just reviewed your solution for "${problem_title}". 
  You scored ${score} points for critical thinking - ${score >= 7 ? 'that\'s impressive!' : 'which shows good effort.'} 
  ${feedback} 
  To improve further, ${suggestion} 
  Keep pushing yourself - every attempt is a step forward!`;
}