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

interface VoiceAnalysisResponse {
  totalDuration: number;
  stageDistribution: Record<string, number>;
  keywordFrequency: Record<string, number>;
  reasoningFlow: string[];
  identifiedPatterns: string[];
  potentialIssues: string[];
  strengths: string[];
  suggestions: string[];
  overallScore: number;
  detailedFeedback: string;
  improvementAreas: string[];
  nextSteps: string[];
}

import type { RealWorldApplication, Problem } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
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
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

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

export async function generateRealWorldApplication(problem: Problem): Promise<RealWorldApplication> {
  const prompt = `You are an expert software engineer and computer science educator. Generate a comprehensive real-world application analysis for the following competitive programming problem.

**Problem Details:**
- Title: "${problem.title}"
- Description: "${problem.description}"
- Difficulty: ${problem.difficulty}
- Tags: ${problem.tags.join(', ')}
- Constraints: "${problem.constraints}"

**Task:** Create a detailed real-world application analysis with three main sections:

**Response Format (JSON):**
{
  "theoreticalFoundation": {
    "concepts": ["concept1", "concept2", ...],
    "algorithms": ["algorithm1", "algorithm2", ...],
    "dataStructures": ["structure1", "structure2", ...],
    "timeComplexity": "O(n) explanation",
    "spaceComplexity": "O(1) explanation",
    "explanation": "Detailed explanation of the theoretical foundation"
  },
  "practicalApplication": {
    "realWorldScenarios": [
      {
        "title": "Scenario Title",
        "description": "Detailed scenario description",
        "industry": "Industry name"
      }
    ],
    "concreteExamples": ["example1", "example2"],
    "openEndedQuestion": "How would you modify this algorithm for real-time systems?",
    "modifications": ["modification1", "modification2"]
  },
  "reframedProblem": {
    "title": "Real-world Problem Title",
    "description": "Software engineering challenge description",
    "apiSpec": {
      "endpoint": "/api/endpoint",
      "method": "POST",
      "requestFormat": "JSON request format",
      "responseFormat": "JSON response format"
    },
    "constraints": ["constraint1", "constraint2"],
    "edgeCases": ["edge case1", "edge case2"],
    "systemDesignConsiderations": ["consideration1", "consideration2"]
  }
}

**Guidelines:**
1. **Theoretical Foundation**: Identify the core CS concepts, algorithms, and data structures. Explain time/space complexity clearly.

2. **Practical Application**: Provide 2-3 real-world scenarios where this algorithm is used. Include concrete examples from different industries (tech, finance, healthcare, etc.). Ask a thoughtful open-ended question about real-time or distributed systems.

3. **Reframed Problem**: Transform the CP problem into a software engineering challenge. Include API specifications, real-world constraints, edge cases, and system design considerations.

**Important:**
- Be specific and practical
- Use real industry examples
- Consider scalability and performance
- Include modern software engineering practices
- Make it educational and engaging

Generate the JSON response now:`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

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
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate and ensure all required fields are present
        const realWorldApp: RealWorldApplication = {
          theoreticalFoundation: {
            concepts: parsed.theoreticalFoundation?.concepts || [],
            algorithms: parsed.theoreticalFoundation?.algorithms || [],
            dataStructures: parsed.theoreticalFoundation?.dataStructures || [],
            timeComplexity: parsed.theoreticalFoundation?.timeComplexity || 'O(n)',
            spaceComplexity: parsed.theoreticalFoundation?.spaceComplexity || 'O(1)',
            explanation: parsed.theoreticalFoundation?.explanation || 'Theoretical foundation analysis'
          },
          practicalApplication: {
            realWorldScenarios: parsed.practicalApplication?.realWorldScenarios || [],
            concreteExamples: parsed.practicalApplication?.concreteExamples || [],
            openEndedQuestion: parsed.practicalApplication?.openEndedQuestion || 'How would you optimize this for production use?',
            modifications: parsed.practicalApplication?.modifications || []
          },
          reframedProblem: {
            title: parsed.reframedProblem?.title || 'Real-world Engineering Challenge',
            description: parsed.reframedProblem?.description || 'Software engineering implementation',
            apiSpec: parsed.reframedProblem?.apiSpec,
            constraints: parsed.reframedProblem?.constraints || [],
            edgeCases: parsed.reframedProblem?.edgeCases || [],
            systemDesignConsiderations: parsed.reframedProblem?.systemDesignConsiderations || []
          },
          generatedAt: new Date()
        };
        
        return realWorldApp;
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from Gemini response, using fallback');
    }

    // Fallback: create basic analysis from response text
    return createFallbackRealWorldApplication(problem, responseText);

  } catch (error) {
    console.error('Error generating real-world application with Gemini:', error);
    
    // Return fallback analysis
    return createFallbackRealWorldApplication(problem, 'Failed to generate analysis');
  }
}

function createFallbackRealWorldApplication(problem: Problem, responseText: string): RealWorldApplication {
  // Create basic real-world application based on problem tags and difficulty
  const commonPatterns: Record<string, any> = {
    'Array': {
      concepts: ['Array manipulation', 'Indexing', 'Iteration'],
      algorithms: ['Linear search', 'Two pointers'],
      scenarios: [{ title: 'Data processing', description: 'Processing user data in batches', industry: 'Technology' }]
    },
    'String': {
      concepts: ['String processing', 'Pattern matching'],
      algorithms: ['String matching', 'Parsing'],
      scenarios: [{ title: 'Text analysis', description: 'Processing user input validation', industry: 'Web Development' }]
    },
    'Dynamic Programming': {
      concepts: ['Optimization', 'Memoization', 'Subproblems'],
      algorithms: ['Dynamic programming', 'Recursion with memoization'],
      scenarios: [{ title: 'Resource optimization', description: 'Optimizing resource allocation', industry: 'Operations' }]
    }
  };

  const primaryTag = problem.tags[0] || 'General';
  const pattern = commonPatterns[primaryTag] || commonPatterns['Array'];

  return {
    theoreticalFoundation: {
      concepts: pattern.concepts,
      algorithms: pattern.algorithms,
      dataStructures: ['Array', 'Hash Map'],
      timeComplexity: 'O(n) - Linear time complexity',
      spaceComplexity: 'O(1) - Constant space',
      explanation: `This problem demonstrates fundamental ${primaryTag.toLowerCase()} concepts and their practical applications in software engineering.`
    },
    practicalApplication: {
      realWorldScenarios: pattern.scenarios,
      concreteExamples: [
        'User data validation in web applications',
        'Batch processing in data pipelines'
      ],
      openEndedQuestion: 'How would you modify this algorithm to handle real-time data streams?',
      modifications: [
        'Add error handling for edge cases',
        'Implement caching for better performance',
        'Consider distributed processing for large datasets'
      ]
    },
    reframedProblem: {
      title: `${problem.title} - Production Implementation`,
      description: `Implement a production-ready solution for ${problem.title.toLowerCase()} that handles real-world constraints and edge cases.`,
      apiSpec: {
        endpoint: '/api/process',
        method: 'POST',
        requestFormat: '{ "data": [...], "options": {...} }',
        responseFormat: '{ "result": [...], "metadata": {...} }'
      },
      constraints: [
        'Handle up to 10,000 items per request',
        'Response time under 100ms',
        'Memory usage under 512MB'
      ],
      edgeCases: [
        'Empty input arrays',
        'Null or undefined values',
        'Extremely large datasets'
      ],
      systemDesignConsiderations: [
        'Horizontal scaling capabilities',
        'Error handling and recovery',
        'Monitoring and logging',
        'Rate limiting and security'
      ]
    },
    generatedAt: new Date()
  };
}

export async function analyzeVoiceReasoning(
  transcript: string,
  problemTitle: string,
  problemDescription: string,
  sessionDuration: number,
  chunks: Array<{
    id: string;
    transcript: string;
    confidence: number;
    startTime: number;
    endTime: number;
    stage?: string;
    keywords?: string[];
  }>
): Promise<VoiceAnalysisResponse> {
  const prompt = `You are an expert AI coach analyzing a student's voice reasoning session for algorithmic problem solving. 

**Problem Details:**
- Title: "${problemTitle}"
- Description: "${problemDescription}"

**Session Information:**
- Duration: ${Math.round(sessionDuration / 1000)} seconds
- Number of speech chunks: ${chunks.length}

**Complete Transcript:**
"${transcript}"

**Speech Chunks with Metadata:**
${chunks.map((chunk, index) => `
Chunk ${index + 1}:
- Text: "${chunk.transcript}"
- Confidence: ${Math.round(chunk.confidence * 100)}%
- Stage: ${chunk.stage || 'general'}
- Keywords: ${chunk.keywords?.join(', ') || 'none'}
`).join('\n')}

**Analysis Task:**
Provide a comprehensive analysis of the student's reasoning patterns, thought process, and problem-solving approach. Focus on:

1. **Reasoning Flow Analysis**: How well did they progress through problem-solving stages?
2. **Pattern Recognition**: What algorithmic patterns or approaches did they identify?
3. **Strengths**: What did they do well in their reasoning process?
4. **Areas for Improvement**: What specific issues or gaps were identified?
5. **Suggestions**: Concrete recommendations for improvement
6. **Overall Assessment**: Rate their reasoning quality (1-10 scale)

**Response Format:**
Respond with a JSON object containing:
{
  "totalDuration": ${sessionDuration},
  "stageDistribution": {"understanding": number, "simulation": number, "pattern": number, "validation": number, "solution": number, "general": number},
  "keywordFrequency": {"keyword1": count, "keyword2": count, ...},
  "reasoningFlow": ["stage1", "stage2", ...],
  "identifiedPatterns": ["pattern1", "pattern2", ...],
  "potentialIssues": ["issue1", "issue2", ...],
  "strengths": ["strength1", "strength2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "overallScore": number_between_1_and_10,
  "detailedFeedback": "comprehensive_feedback_paragraph",
  "improvementAreas": ["area1", "area2", ...],
  "nextSteps": ["step1", "step2", ...]
}

**Important Guidelines:**
- Be specific and actionable in your feedback
- Identify both technical and metacognitive aspects
- Consider the problem difficulty and student's approach
- Provide encouraging but honest assessment
- Focus on learning and improvement opportunities
- Analyze reasoning patterns, not just correctness`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

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
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Validate and ensure all required fields are present
        return {
          totalDuration: parsed.totalDuration || sessionDuration,
          stageDistribution: parsed.stageDistribution || {},
          keywordFrequency: parsed.keywordFrequency || {},
          reasoningFlow: parsed.reasoningFlow || [],
          identifiedPatterns: parsed.identifiedPatterns || [],
          potentialIssues: parsed.potentialIssues || [],
          strengths: parsed.strengths || [],
          suggestions: parsed.suggestions || [],
          overallScore: parsed.overallScore || 5,
          detailedFeedback: parsed.detailedFeedback || responseText,
          improvementAreas: parsed.improvementAreas || [],
          nextSteps: parsed.nextSteps || []
        };
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from Gemini response, using fallback analysis');
    }

    // Fallback: create analysis from response text
    return createFallbackAnalysis(responseText, sessionDuration, chunks);

  } catch (error) {
    console.error('Error analyzing voice reasoning with Gemini:', error);
    
    // Return fallback analysis
    return createFallbackAnalysis(
      "I encountered an issue analyzing your reasoning session. However, I can see you've made a good effort in working through the problem.",
      sessionDuration,
      chunks
    );
  }
}

function createFallbackAnalysis(
  responseText: string, 
  sessionDuration: number, 
  chunks: Array<any>
): VoiceAnalysisResponse {
  // Create basic analysis from chunks
  const stageDistribution: Record<string, number> = {};
  const keywordFrequency: Record<string, number> = {};
  const reasoningFlow: string[] = [];

  chunks.forEach(chunk => {
    const stage = chunk.stage || 'general';
    stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
    reasoningFlow.push(stage);
    
    chunk.keywords?.forEach((keyword: string) => {
      keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
    });
  });

  // Extract insights from response text
  const strengths = [];
  const potentialIssues = [];
  const suggestions = [];

  if (responseText.toLowerCase().includes('good') || responseText.toLowerCase().includes('well')) {
    strengths.push('Demonstrated clear thinking process');
  }
  if (responseText.toLowerCase().includes('pattern') || responseText.toLowerCase().includes('approach')) {
    strengths.push('Showed pattern recognition skills');
  }
  if (responseText.toLowerCase().includes('improve') || responseText.toLowerCase().includes('consider')) {
    potentialIssues.push('Could benefit from more structured approach');
  }
  if (responseText.toLowerCase().includes('practice') || responseText.toLowerCase().includes('focus')) {
    suggestions.push('Continue practicing similar problems');
  }

  return {
    totalDuration: sessionDuration,
    stageDistribution,
    keywordFrequency,
    reasoningFlow,
    identifiedPatterns: Object.keys(keywordFrequency).slice(0, 3),
    potentialIssues: potentialIssues.length > 0 ? potentialIssues : ['Consider spending more time on problem analysis'],
    strengths: strengths.length > 0 ? strengths : ['Completed the reasoning session'],
    suggestions: suggestions.length > 0 ? suggestions : ['Practice more problems to improve pattern recognition'],
    overallScore: Math.min(Math.max(chunks.length, 3), 8), // Score based on engagement
    detailedFeedback: responseText,
    improvementAreas: ['Problem decomposition', 'Pattern recognition'],
    nextSteps: ['Practice similar problems', 'Focus on systematic approach']
  };
}