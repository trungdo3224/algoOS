import { analyzeVoiceReasoning } from './gemini';

// Speech Recognition service using Web Speech API
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface SpeechChunk {
  id: string;
  transcript: string;
  confidence: number;
  startTime: number;
  endTime: number;
  stage?: string;
  keywords?: string[];
}

export class VoiceReasoningRecorder {
  private recognition: SpeechRecognition | null = null;
  private isRecording = false;
  private chunks: SpeechChunk[] = [];
  private currentChunkId = 0;
  private onResult?: (result: SpeechRecognitionResult) => void;
  private onChunk?: (chunk: SpeechChunk) => void;
  private onError?: (error: string) => void;
  private startTime = 0;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.startTime = Date.now();
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      
      if (lastResult) {
        const transcript = lastResult[0].transcript;
        const confidence = lastResult[0].confidence;
        const isFinal = lastResult.isFinal;

        const result: SpeechRecognitionResult = {
          transcript,
          confidence,
          isFinal,
          timestamp: new Date()
        };

        this.onResult?.(result);

        // Create chunk if final result
        if (isFinal && transcript.trim()) {
          const chunk: SpeechChunk = {
            id: `chunk_${this.currentChunkId++}`,
            transcript: transcript.trim(),
            confidence,
            startTime: this.startTime,
            endTime: Date.now(),
            stage: this.detectStage(transcript),
            keywords: this.extractKeywords(transcript)
          };

          this.chunks.push(chunk);
          this.onChunk?.(chunk);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isRecording = false;
    };
  }

  private detectStage(transcript: string): string {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('understand') || lowerTranscript.includes('problem') || lowerTranscript.includes('asking')) {
      return 'understanding';
    } else if (lowerTranscript.includes('example') || lowerTranscript.includes('simulate') || lowerTranscript.includes('step')) {
      return 'simulation';
    } else if (lowerTranscript.includes('pattern') || lowerTranscript.includes('algorithm') || lowerTranscript.includes('approach')) {
      return 'pattern';
    } else if (lowerTranscript.includes('correct') || lowerTranscript.includes('verify') || lowerTranscript.includes('check')) {
      return 'validation';
    } else if (lowerTranscript.includes('implement') || lowerTranscript.includes('code') || lowerTranscript.includes('solution')) {
      return 'solution';
    }
    
    return 'general';
  }

  private extractKeywords(transcript: string): string[] {
    const algorithmKeywords = [
      'array', 'string', 'tree', 'graph', 'dynamic programming', 'recursion',
      'sorting', 'searching', 'hash', 'stack', 'queue', 'heap', 'binary search',
      'two pointers', 'sliding window', 'greedy', 'backtracking', 'dfs', 'bfs'
    ];

    const keywords: string[] = [];
    const lowerTranscript = transcript.toLowerCase();

    algorithmKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return keywords;
  }

  startRecording(
    onResult: (result: SpeechRecognitionResult) => void,
    onChunk: (chunk: SpeechChunk) => void,
    onError: (error: string) => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    if (this.isRecording) {
      return;
    }

    this.onResult = onResult;
    this.onChunk = onChunk;
    this.onError = onError;
    this.chunks = [];
    this.currentChunkId = 0;

    try {
      this.recognition.start();
      this.isRecording = true;
    } catch {
      onError('Failed to start recording');
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  getChunks(): SpeechChunk[] {
    return [...this.chunks];
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

// Analyze reasoning patterns from speech chunks using Gemini AI
export async function analyzeReasoningPatterns(
  chunks: SpeechChunk[],
  problemTitle: string = 'Algorithm Problem',
  problemDescription: string = 'Problem solving session'
) {
  if (chunks.length === 0) {
    return {
      totalDuration: 0,
      stageDistribution: {},
      keywordFrequency: {},
      reasoningFlow: [],
      identifiedPatterns: [],
      potentialIssues: ['No speech data captured'],
      strengths: [],
      suggestions: ['Try speaking more clearly during the session'],
      overallScore: 0,
      detailedFeedback: 'No analysis available - no speech was captured.',
      improvementAreas: ['Speech clarity', 'Session engagement'],
      nextSteps: ['Ensure microphone is working', 'Speak clearly during reasoning']
    };
  }

  try {
    // Combine all transcripts
    const fullTranscript = chunks.map(chunk => chunk.transcript).join(' ');
    
    // Calculate session duration
    const firstChunk = chunks[0];
    const lastChunk = chunks[chunks.length - 1];
    const sessionDuration = lastChunk.endTime - firstChunk.startTime;

    // Use Gemini AI for advanced analysis
    const geminiAnalysis = await analyzeVoiceReasoning(
      fullTranscript,
      problemTitle,
      problemDescription,
      sessionDuration,
      chunks
    );

    return geminiAnalysis;

  } catch (error) {
    console.error('Error in Gemini analysis, falling back to basic analysis:', error);
    
    // Fallback to basic analysis if Gemini fails
    return performBasicAnalysis(chunks);
  }
}

// Fallback basic analysis function
function performBasicAnalysis(chunks: SpeechChunk[]) {
  const analysis = {
    totalDuration: 0,
    stageDistribution: {} as Record<string, number>,
    keywordFrequency: {} as Record<string, number>,
    reasoningFlow: [] as string[],
    identifiedPatterns: [] as string[],
    potentialIssues: [] as string[],
    strengths: [] as string[],
    suggestions: [] as string[],
    overallScore: 5,
    detailedFeedback: '',
    improvementAreas: [] as string[],
    nextSteps: [] as string[]
  };

  if (chunks.length === 0) return analysis;

  // Calculate total duration
  const firstChunk = chunks[0];
  const lastChunk = chunks[chunks.length - 1];
  analysis.totalDuration = lastChunk.endTime - firstChunk.startTime;

  // Analyze stage distribution
  chunks.forEach(chunk => {
    const stage = chunk.stage || 'general';
    analysis.stageDistribution[stage] = (analysis.stageDistribution[stage] || 0) + 1;
    analysis.reasoningFlow.push(stage);
  });

  // Analyze keyword frequency
  chunks.forEach(chunk => {
    chunk.keywords?.forEach(keyword => {
      analysis.keywordFrequency[keyword] = (analysis.keywordFrequency[keyword] || 0) + 1;
    });
  });

  // Identify patterns and issues
  const transcriptText = chunks.map(c => c.transcript).join(' ').toLowerCase();

  // Check for common patterns
  if (transcriptText.includes('brute force') || transcriptText.includes('nested loop')) {
    analysis.identifiedPatterns.push('Brute Force Approach');
  }
  if (transcriptText.includes('dynamic programming') || transcriptText.includes('memoization')) {
    analysis.identifiedPatterns.push('Dynamic Programming');
  }
  if (transcriptText.includes('two pointer') || transcriptText.includes('sliding window')) {
    analysis.identifiedPatterns.push('Two Pointers/Sliding Window');
  }

  // Identify potential issues
  if (analysis.stageDistribution.understanding < 2) {
    analysis.potentialIssues.push('Insufficient problem understanding phase');
    analysis.improvementAreas.push('Problem comprehension');
  }
  if (!analysis.stageDistribution.simulation) {
    analysis.potentialIssues.push('Missing simulation/example walkthrough');
    analysis.improvementAreas.push('Example-based reasoning');
  }
  if (transcriptText.includes('confused') || transcriptText.includes('not sure')) {
    analysis.potentialIssues.push('Uncertainty in reasoning process');
    analysis.improvementAreas.push('Confidence building');
  }

  // Identify strengths
  if (analysis.stageDistribution.understanding >= 2) {
    analysis.strengths.push('Thorough problem analysis');
  }
  if (analysis.stageDistribution.validation > 0) {
    analysis.strengths.push('Good validation practices');
  }
  if (analysis.keywordFrequency['time complexity'] || analysis.keywordFrequency['space complexity']) {
    analysis.strengths.push('Complexity analysis awareness');
  }

  // Generate suggestions
  if (analysis.potentialIssues.includes('Insufficient problem understanding phase')) {
    analysis.suggestions.push('Spend more time breaking down the problem requirements');
    analysis.nextSteps.push('Practice problem decomposition techniques');
  }
  if (analysis.potentialIssues.includes('Missing simulation/example walkthrough')) {
    analysis.suggestions.push('Walk through examples step by step to verify your approach');
    analysis.nextSteps.push('Always test with concrete examples');
  }
  if (analysis.identifiedPatterns.includes('Brute Force Approach')) {
    analysis.suggestions.push('Consider if there are more efficient algorithmic patterns');
    analysis.nextSteps.push('Study common optimization patterns');
  }

  // Calculate overall score based on engagement and completeness
  let score = 5; // Base score
  if (analysis.stageDistribution.understanding >= 2) score += 1;
  if (analysis.stageDistribution.simulation > 0) score += 1;
  if (analysis.stageDistribution.pattern > 0) score += 1;
  if (analysis.stageDistribution.validation > 0) score += 1;
  if (Object.keys(analysis.keywordFrequency).length > 2) score += 1;
  
  analysis.overallScore = Math.min(score, 10);

  // Generate detailed feedback
  analysis.detailedFeedback = `Your reasoning session showed ${analysis.strengths.length > 0 ? 'several strengths including ' + analysis.strengths.join(', ') : 'room for improvement'}. ${analysis.potentialIssues.length > 0 ? 'Areas to focus on include ' + analysis.potentialIssues.join(', ') + '.' : 'Keep up the good work!'} Your overall reasoning score is ${analysis.overallScore}/10.`;

  return analysis;
}