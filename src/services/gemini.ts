interface GeminiValidationResponse {
  is_valid: boolean;
  assistant_reply: string;
}

interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{
      text: string;
    }>;
  }>;
}

const GEMINI_API_KEY = 'AIzaSyCy0CUClSN-I0NVdnouSK7dBze0KI3e2Jo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function validateStage(
  stageId: number,
  userMessage: string,
  problemTitle: string,
  problemDescription: string
): Promise<GeminiValidationResponse> {
  const stagePrompts = {
    1: `You're a Socratic AI Coach validating stage 1: Understanding the Problem.

Problem: "${problemTitle}"
Description: "${problemDescription}"

The user said: "${userMessage}"

Your task:
1. Determine if the user demonstrates understanding of what the problem is asking for
2. Check if they identify key requirements and constraints
3. Respond with JSON format: {"is_valid": boolean, "assistant_reply": "your response"}

If valid (is_valid: true): Give positive feedback and ask if they want to move to the next stage (Simulation).
If not valid (is_valid: false): Ask clarifying questions to guide them toward better understanding.

Keep responses conversational and encouraging.`,

    2: `You're a Socratic AI Coach validating stage 2: Simulation.

Problem: "${problemTitle}"
The user said: "${userMessage}"

Your task:
1. Check if the user can walk through the solution with a concrete example
2. Verify they understand the step-by-step process
3. Respond with JSON format: {"is_valid": boolean, "assistant_reply": "your response"}

If valid (is_valid: true): Acknowledge their simulation and ask if they want to move to Pattern Recognition.
If not valid (is_valid: false): Guide them to think through a specific example step by step.`,

    3: `You're a Socratic AI Coach validating stage 3: Pattern Recognition.

Problem: "${problemTitle}"
The user said: "${userMessage}"

Your task:
1. Check if the user identifies the correct algorithmic pattern or approach
2. Verify they can connect this to similar problems they might know
3. Respond with JSON format: {"is_valid": boolean, "assistant_reply": "your response"}

If valid (is_valid: true): Confirm their pattern recognition and ask if they want to move to Validation.
If not valid (is_valid: false): Help them think about what algorithmic patterns or data structures might be useful.`,

    4: `You're a Socratic AI Coach validating stage 4: Validation.

Problem: "${problemTitle}"
The user said: "${userMessage}"

Your task:
1. Check if the user can verify their solution's correctness
2. Assess if they consider edge cases and time/space complexity
3. Respond with JSON format: {"is_valid": boolean, "assistant_reply": "your response"}

If valid (is_valid: true): Praise their validation approach and ask if they want to move to the final Solution stage.
If not valid (is_valid: false): Guide them to think about correctness, edge cases, or complexity analysis.`,

    5: `You're a Socratic AI Coach validating stage 5: Solution Implementation.

Problem: "${problemTitle}"
The user said: "${userMessage}"

Your task:
1. Check if the user can articulate implementation details
2. Verify they consider optimization and clean code practices
3. Respond with JSON format: {"is_valid": boolean, "assistant_reply": "your response"}

If valid (is_valid: true): Congratulate them on completing the problem-solving process!
If not valid (is_valid: false): Help them think about implementation details, optimization, or code structure.`
  };

  try {
    const prompt = stagePrompts[stageId as keyof typeof stagePrompts] || stagePrompts[1];
    
    const requestBody: GeminiRequest = {
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[^}]*"is_valid"[^}]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          is_valid: parsed.is_valid,
          assistant_reply: parsed.assistant_reply
        };
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from Gemini response, using fallback');
    }

    // Fallback: analyze response text for validation cues
    const isValid = responseText.toLowerCase().includes('good') || 
                   responseText.toLowerCase().includes('correct') ||
                   responseText.toLowerCase().includes('excellent') ||
                   responseText.toLowerCase().includes('well done');

    return {
      is_valid: isValid,
      assistant_reply: responseText
    };

  } catch (error) {
    console.error('Error validating with Gemini:', error);
    
    // Fallback response
    return {
      is_valid: false,
      assistant_reply: "I'm having trouble processing your response right now. Could you please rephrase your answer or try again?"
    };
  }
}