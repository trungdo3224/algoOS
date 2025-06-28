import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Brain, 
  Clock, 
  MessageSquare,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { VoiceReasoningRecorder, SpeechChunk, analyzeReasoningPatterns } from '../../services/speechRecognition';
import { generateSpeech, getAvailableVoices, Voice } from '../../services/elevenlabs';

interface VoiceReasoningSessionProps {
  problemTitle: string;
  problemDescription?: string;
  onComplete: (analysis: any, chunks: SpeechChunk[]) => void;
  onStartSSA: (analysis: any) => void;
}

interface AIMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'response' | 'question' | 'encouragement';
  isUser?: boolean;
}

const VoiceReasoningSession: React.FC<VoiceReasoningSessionProps> = ({
  problemTitle,
  problemDescription = '',
  onComplete,
  onStartSSA
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [chunks, setChunks] = useState<SpeechChunk[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // AI interaction state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showChatInput, setShowChatInput] = useState(false);
  const [lastAIResponseTime, setLastAIResponseTime] = useState<number>(0);

  const recorderRef = useRef<VoiceReasoningRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const silenceThreshold = 15000; // 15 seconds of silence

  useEffect(() => {
    recorderRef.current = new VoiceReasoningRecorder();
    loadVoices();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Monitor for silence and trigger AI responses
  useEffect(() => {
    if (isRecording && !isPaused && chunks.length > 0 && !isWaitingForResponse) {
      // Clear existing timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // Only set timer if enough time has passed since last AI response
      const timeSinceLastAI = Date.now() - lastAIResponseTime;
      if (timeSinceLastAI > 30000) { // At least 30 seconds between AI interventions
        const timer = setTimeout(() => {
          if (isRecording && !isPaused && !isWaitingForResponse) {
            handleSilenceDetected();
          }
        }, silenceThreshold);

        setSilenceTimer(timer);
      }
    }

    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [lastSpeechTime, isRecording, isPaused, isWaitingForResponse, chunks.length]);

  const loadVoices = async () => {
    try {
      const voices = await getAvailableVoices();
      setAvailableVoices(voices);
      if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleSilenceDetected = async () => {
    if (chunks.length === 0 || isWaitingForResponse) return;

    console.log('Silence detected, generating AI response...');
    
    const lastChunk = chunks[chunks.length - 1];
    const aiResponse = generateAIResponse(lastChunk, chunks);
    
    const aiMessage: AIMessage = {
      id: `ai_${Date.now()}`,
      content: aiResponse.content,
      timestamp: new Date(),
      type: aiResponse.type,
      isUser: false
    };

    setAiMessages(prev => [...prev, aiMessage]);
    setIsWaitingForResponse(true);
    setShowChatInput(true);
    setLastAIResponseTime(Date.now());

    // Play the AI response using ElevenLabs
    await playAIMessage(aiResponse.content);
  };

  const playAIMessage = async (message: string) => {
    if (!selectedVoice) {
      console.log('No voice selected for AI message');
      return;
    }

    try {
      console.log('Playing AI message with ElevenLabs...');
      setIsPlayingAudio(true);
      
      const audioUrl = await generateSpeech(message, selectedVoice.voice_id);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        console.log('AI message playback finished');
      };
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        console.error('Error playing AI message');
      };
      
      await audioRef.current.play();
      console.log('AI message started playing');
    } catch (error) {
      console.error('Error playing AI response:', error);
      setIsPlayingAudio(false);
    }
  };

  const generateAIResponse = (lastChunk: SpeechChunk, allChunks: SpeechChunk[]) => {
    const transcript = lastChunk.transcript.toLowerCase();
    const stage = lastChunk.stage || 'general';
    const chunkCount = allChunks.length;

    console.log(`Generating AI response for stage: ${stage}, chunk count: ${chunkCount}`);

    // Check if user is asking a question
    if (transcript.includes('?') || 
        transcript.includes('how do i') || 
        transcript.includes('what should') || 
        transcript.includes('why') ||
        transcript.includes('can you help') ||
        transcript.includes('i need help')) {
      return {
        content: generateQuestionResponse(transcript, stage),
        type: 'response' as const
      };
    }

    // Generate contextual questions based on stage and progress
    switch (stage) {
      case 'understanding':
        return {
          content: "I notice you're working on understanding the problem. What specific part of the requirements seems most challenging to you?",
          type: 'question' as const
        };
      case 'simulation':
        return {
          content: "You're walking through an example - that's great! Can you explain what happens in the next step of your approach?",
          type: 'question' as const
        };
      case 'pattern':
        return {
          content: "I can see you're thinking about algorithmic patterns. What similar problems have you solved that might relate to this one?",
          type: 'question' as const
        };
      case 'validation':
        return {
          content: "You're validating your approach - excellent! What edge cases are you considering?",
          type: 'question' as const
        };
      case 'solution':
        return {
          content: "You're working on the solution implementation. Are there any optimizations you're thinking about?",
          type: 'question' as const
        };
      default:
        // General encouragement based on progress
        if (chunkCount < 3) {
          return {
            content: "You're off to a good start! Take your time to think through the problem step by step.",
            type: 'encouragement' as const
          };
        } else if (chunkCount < 6) {
          return {
            content: "I can see you're making progress. What's your current thinking about the best approach to solve this?",
            type: 'question' as const
          };
        } else {
          return {
            content: "You've been working through this thoughtfully. Is there anything specific you'd like to clarify or explore further?",
            type: 'question' as const
          };
        }
    }
  };

  const generateQuestionResponse = (transcript: string, stage: string) => {
    if (transcript.includes('time complexity') || transcript.includes('complexity')) {
      return "Great question about complexity! Think about how many times you're iterating through your data and what operations you're performing in each iteration.";
    } else if (transcript.includes('approach') || transcript.includes('algorithm')) {
      return "For choosing the right approach, consider the problem constraints and what data structures might help you access or organize the information efficiently.";
    } else if (transcript.includes('edge case') || transcript.includes('edge')) {
      return "Good thinking about edge cases! Consider scenarios like empty inputs, single elements, very large inputs, or boundary conditions.";
    } else if (transcript.includes('stuck') || transcript.includes('confused')) {
      return "It's normal to feel stuck sometimes. Try breaking the problem into smaller parts or walking through a simple example step by step.";
    } else {
      return "That's a thoughtful question! Take a moment to think about it, and remember that working through problems systematically often reveals the answer.";
    }
  };

  const handleUserResponse = async () => {
    if (!userInput.trim()) return;

    console.log('User responded:', userInput);

    // Add user message to chat
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      content: userInput,
      timestamp: new Date(),
      type: 'response',
      isUser: true
    };

    setAiMessages(prev => [...prev, userMessage]);

    // Generate AI follow-up
    const followUp = generateFollowUpResponse(userInput);
    const aiMessage: AIMessage = {
      id: `ai_${Date.now() + 1}`,
      content: followUp,
      timestamp: new Date(),
      type: 'response',
      isUser: false
    };

    setAiMessages(prev => [...prev, aiMessage]);

    // Play follow-up
    await playAIMessage(followUp);

    setUserInput('');
    setIsWaitingForResponse(false);
    setShowChatInput(false);
    setLastAIResponseTime(Date.now());
  };

  const generateFollowUpResponse = (userResponse: string) => {
    const response = userResponse.toLowerCase();
    
    if (response.includes('yes') || response.includes('understand') || response.includes('clear')) {
      return "Excellent! Keep going with your reasoning. I'm here if you need any guidance.";
    } else if (response.includes('no') || response.includes('confused') || response.includes('stuck')) {
      return "No worries! Try approaching it from a different angle. Sometimes it helps to think about what the problem is really asking for.";
    } else if (response.includes('help') || response.includes('hint')) {
      return "I'm here to guide you, but I want you to discover the solution yourself. What's the first step you think you should take?";
    } else {
      return "I see what you're thinking. Continue with that line of reasoning and see where it leads you.";
    }
  };

  const startRecording = () => {
    if (!recorderRef.current) return;

    console.log('Starting voice reasoning session...');
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);
    setCurrentTranscript('');
    setChunks([]);
    setSessionDuration(0);
    setAiMessages([]);
    setLastSpeechTime(Date.now());
    setLastAIResponseTime(0);

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setSessionDuration(Date.now() - startTimeRef.current);
    }, 1000);

    recorderRef.current.startRecording(
      (result) => {
        if (!result.isFinal) {
          setCurrentTranscript(result.transcript);
        }
      },
      (chunk) => {
        console.log('New speech chunk received:', chunk.transcript);
        setChunks(prev => [...prev, chunk]);
        setCurrentTranscript('');
        setLastSpeechTime(Date.now());
        
        // Reset waiting state when user speaks
        if (isWaitingForResponse) {
          setIsWaitingForResponse(false);
          setShowChatInput(false);
        }
      },
      (error) => {
        console.error('Recording error:', error);
        stopRecording();
      }
    );
  };

  const pauseRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current && isPaused) {
      startTimeRef.current = Date.now() - sessionDuration;
      setIsPaused(false);
      setLastSpeechTime(Date.now());
      
      intervalRef.current = setInterval(() => {
        setSessionDuration(Date.now() - startTimeRef.current);
      }, 1000);

      recorderRef.current.startRecording(
        (result) => {
          if (!result.isFinal) {
            setCurrentTranscript(result.transcript);
          }
        },
        (chunk) => {
          setChunks(prev => [...prev, chunk]);
          setCurrentTranscript('');
          setLastSpeechTime(Date.now());
          
          if (isWaitingForResponse) {
            setIsWaitingForResponse(false);
            setShowChatInput(false);
          }
        },
        (error) => {
          console.error('Recording error:', error);
          stopRecording();
        }
      );
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
    
    setIsRecording(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }

    // Analyze the session
    analyzeSession();
  };

  const analyzeSession = async () => {
    setIsAnalyzing(true);
    
    try {
      // Use Gemini-powered analysis
      const sessionAnalysis = await analyzeReasoningPatterns(
        chunks,
        problemTitle || 'Algorithm Problem',
        problemDescription || 'Problem solving session'
      );
      
      // Add AI interaction data to analysis
      sessionAnalysis.aiInteractions = {
        totalMessages: aiMessages.length,
        questionsAsked: aiMessages.filter(m => m.type === 'question' && !m.isUser).length,
        userResponses: aiMessages.filter(m => m.isUser).length,
        encouragements: aiMessages.filter(m => m.type === 'encouragement').length
      };
      
      setAnalysis(sessionAnalysis);
    } catch (error) {
      console.error('Error analyzing session:', error);
      // Fallback analysis
      setAnalysis({
        strengths: ['Completed the reasoning session'],
        potentialIssues: ['Analysis temporarily unavailable'],
        suggestions: ['Try the session again for detailed feedback'],
        overallScore: 5,
        detailedFeedback: 'Session completed successfully. Detailed analysis is temporarily unavailable.',
        aiInteractions: {
          totalMessages: aiMessages.length,
          questionsAsked: aiMessages.filter(m => m.type === 'question' && !m.isUser).length,
          userResponses: aiMessages.filter(m => m.isUser).length,
          encouragements: aiMessages.filter(m => m.type === 'encouragement').length
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetSession = () => {
    setIsRecording(false);
    setIsPaused(false);
    setCurrentTranscript('');
    setChunks([]);
    setSessionDuration(0);
    setAnalysis(null);
    setIsAnalyzing(false);
    setAiMessages([]);
    setIsWaitingForResponse(false);
    setShowChatInput(false);
    setUserInput('');
    setLastSpeechTime(0);
    setLastAIResponseTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }
    
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
  };

  const playAnalysisFeedback = async () => {
    if (!selectedVoice || !analysis) return;

    try {
      setIsPlayingAudio(true);
      
      const feedbackText = generateFeedbackText(analysis);
      const audioUrl = await generateSpeech(feedbackText, selectedVoice.voice_id);
      
      setAudioUrl(audioUrl);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing feedback:', error);
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const generateFeedbackText = (analysis: any): string => {
    let feedback = `Great job working through "${problemTitle}"! `;
    
    if (analysis.overallScore) {
      feedback += `Your reasoning scored ${analysis.overallScore} out of 10. `;
    }
    
    if (analysis.aiInteractions) {
      feedback += `During our session, I asked ${analysis.aiInteractions.questionsAsked} questions and you responded ${analysis.aiInteractions.userResponses} times. `;
    }
    
    if (analysis.strengths && analysis.strengths.length > 0) {
      feedback += `I noticed some strong points in your reasoning: ${analysis.strengths.join(', ')}. `;
    }
    
    if (analysis.potentialIssues && analysis.potentialIssues.length > 0) {
      feedback += `However, there are a few areas we could improve: ${analysis.potentialIssues.join(', ')}. `;
    }
    
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      feedback += `Here are my suggestions: ${analysis.suggestions.join('. ')}. `;
    }
    
    if (analysis.nextSteps && analysis.nextSteps.length > 0) {
      feedback += `For next steps, I recommend: ${analysis.nextSteps.join(', ')}. `;
    }
    
    feedback += `Would you like to continue with guided coaching to strengthen these areas?`;
    
    return feedback;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'understanding': return 'bg-blue-100 text-blue-800';
      case 'simulation': return 'bg-green-100 text-green-800';
      case 'pattern': return 'bg-purple-100 text-purple-800';
      case 'validation': return 'bg-yellow-100 text-yellow-800';
      case 'solution': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageTypeColor = (type: string, isUser: boolean = false) => {
    if (isUser) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    
    switch (type) {
      case 'question': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'encouragement': return 'bg-green-50 border-green-200 text-green-800';
      case 'response': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Interactive Voice Reasoning</h2>
              <p className="text-purple-100">AI-powered coaching while you think aloud: {problemTitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatDuration(sessionDuration)}</div>
            <div className="text-sm text-purple-100">Session Duration</div>
          </div>
        </div>
      </Card>

      {/* Recording Controls */}
      <Card>
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-4">
            {!isRecording && !isPaused && (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg"
                leftIcon={<Mic className="h-6 w-6" />}
              >
                Start Interactive Session
              </Button>
            )}

            {isRecording && !isPaused && (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  leftIcon={<Pause className="h-5 w-5" />}
                >
                  Pause
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  leftIcon={<Square className="h-5 w-5" />}
                >
                  Stop & Analyze
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={resumeRecording}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  leftIcon={<Play className="h-5 w-5" />}
                >
                  Resume
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  leftIcon={<Square className="h-5 w-5" />}
                >
                  Stop & Analyze
                </Button>
              </>
            )}

            {(chunks.length > 0 || analysis) && (
              <Button
                onClick={resetSession}
                variant="outline"
                leftIcon={<RotateCcw className="h-5 w-5" />}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Live Transcript */}
          {(isRecording || isPaused) && (
            <div className="w-full">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Live Transcript:</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
                <p className="text-gray-800">
                  {currentTranscript || (isPaused ? 'Recording paused...' : 'Speak your thoughts...')}
                  {isRecording && !isPaused && (
                    <span className="inline-block w-2 h-4 bg-red-500 ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Recording Status */}
          {(isRecording || isPaused) && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                {isRecording && !isPaused ? (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                ) : (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                )}
                <span>{isRecording && !isPaused ? 'Recording...' : 'Paused'}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{chunks.length} chunks captured</span>
              </div>
              {aiMessages.length > 0 && (
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-1 text-purple-600" />
                  <span>{aiMessages.length} AI interactions</span>
                </div>
              )}
              {isPlayingAudio && (
                <div className="flex items-center">
                  <Volume2 className="h-4 w-4 mr-1 text-green-600 animate-pulse" />
                  <span>AI Speaking...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* AI Interaction Panel */}
      {aiMessages.length > 0 && (
        <Card title="🤖 AI Coaching Conversation">
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {aiMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${getMessageTypeColor(message.type, message.isUser)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {message.isUser ? '👤 You' : '🤖 AI Coach'}
                  </span>
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                {!message.isUser && (
                  <button
                    onClick={() => playAIMessage(message.content)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    disabled={isPlayingAudio}
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    {isPlayingAudio ? 'Playing...' : 'Play Again'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          {showChatInput && (
            <div className="border-t pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  💬 The AI coach is waiting for your response. You can type here or continue speaking.
                </p>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                  placeholder="Type your response to the AI coach..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleUserResponse}
                  disabled={!userInput.trim()}
                  leftIcon={<MessageSquare className="h-4 w-4" />}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Captured Chunks */}
      {chunks.length > 0 && (
        <Card title="Reasoning Chunks">
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {chunks.map((chunk, index) => (
              <div key={chunk.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Chunk {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(chunk.stage || 'general')}`}>
                      {chunk.stage || 'general'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(chunk.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{chunk.transcript}</p>
                {chunk.keywords && chunk.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {chunk.keywords.map((keyword, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Interactive Session...</h3>
            <p className="text-gray-600">Gemini AI is processing your reasoning patterns and AI interactions</p>
          </div>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Voice Selection for Feedback */}
          <Card title="AI Voice Feedback">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose AI Voice for Feedback:
                </label>
                <select
                  value={selectedVoice?.voice_id || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.voice_id === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableVoices.map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} - {voice.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={playAnalysisFeedback}
                  disabled={isPlayingAudio || !selectedVoice}
                  leftIcon={<Volume2 className="h-4 w-4" />}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isPlayingAudio ? 'Playing...' : 'Play AI Feedback'}
                </Button>
                
                {isPlayingAudio && (
                  <Button
                    onClick={stopAudio}
                    variant="outline"
                    leftIcon={<VolumeX className="h-4 w-4" />}
                  >
                    Stop Audio
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Overall Score */}
          {analysis.overallScore && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Reasoning Score</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">{analysis.overallScore}/10</div>
                <p className="text-gray-600">{analysis.detailedFeedback}</p>
              </div>
            </Card>
          )}

          {/* AI Interaction Summary */}
          {analysis.aiInteractions && (
            <Card title="🤖 AI Interaction Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analysis.aiInteractions.totalMessages}</div>
                  <div className="text-sm text-purple-700">Total Messages</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysis.aiInteractions.questionsAsked}</div>
                  <div className="text-sm text-blue-700">Questions Asked</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analysis.aiInteractions.userResponses}</div>
                  <div className="text-sm text-green-700">Your Responses</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analysis.aiInteractions.encouragements}</div>
                  <div className="text-sm text-orange-700">Encouragements</div>
                </div>
              </div>
            </Card>
          )}

          {/* Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-900">Strengths</h3>
              </div>
              <ul className="space-y-1">
                {(analysis.strengths || []).map((strength: string, index: number) => (
                  <li key={index} className="text-sm text-green-800">• {strength}</li>
                ))}
              </ul>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-900">Areas to Improve</h3>
              </div>
              <ul className="space-y-1">
                {(analysis.potentialIssues || []).map((issue: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800">• {issue}</li>
                ))}
              </ul>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">AI Suggestions</h3>
              </div>
              <ul className="space-y-1">
                {(analysis.suggestions || []).map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm text-blue-800">• {suggestion}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Card title="Detailed Analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Stage Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.stageDistribution || {}).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(stage)}`}>
                        {stage}
                      </span>
                      <span className="text-sm text-gray-600">{count} chunks</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Patterns Identified</h4>
                <div className="space-y-2">
                  {(analysis.identifiedPatterns || []).map((pattern: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            {analysis.nextSteps && analysis.nextSteps.length > 0 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-medium text-indigo-900 mb-3">Recommended Next Steps</h4>
                <ul className="space-y-2">
                  {analysis.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-sm text-indigo-800">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => onComplete(analysis, chunks)}
              className="bg-green-500 hover:bg-green-600 text-white"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Complete Session
            </Button>
            
            <Button
              onClick={() => onStartSSA(analysis)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              rightIcon={<MessageSquare className="h-4 w-4" />}
            >
              Start SSA Coaching
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceReasoningSession;