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
  CheckCircle,
  FileText,
  Flag,
  Plus,
  Settings,
  Target,
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { VoiceReasoningRecorder, SpeechChunk, analyzeReasoningPatterns } from '../services/speechRecognition';
import { generateSpeech, getAvailableVoices, Voice, checkApiUsage } from '../services/elevenlabs';
import ProblemSelector from '../components/ssa-coaching/ProblemSelector';
import { useAppSelector } from '../hooks/reduxHooks';
import { supabase } from '../lib/supabase';
import type { Problem } from '../lib/supabase';

interface AIMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'response' | 'question' | 'encouragement';
  isUser?: boolean;
}

interface VoiceError {
  type: 'rate_limit' | 'api_error' | 'network_error' | 'config_error';
  message: string;
  retryAfter?: number;
}

const VoiceReasoningMode: React.FC = () => {
  const { id: userId } = useAppSelector((state) => state.user);
  
  // Session State
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [sessionMode, setSessionMode] = useState<'setup' | 'recording' | 'analysis' | 'feedback'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Recording State
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [chunks, setChunks] = useState<SpeechChunk[]>([]);
  const [userNotes, setUserNotes] = useState('');
  const [flaggedMoments, setFlaggedMoments] = useState<{timestamp: number, note: string}[]>([]);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voice Settings
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // AI interaction state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showChatInput, setShowChatInput] = useState(false);
  const [lastAIResponseTime, setLastAIResponseTime] = useState<number>(0);
  
  // Voice service state
  const [voiceError, setVoiceError] = useState<VoiceError | null>(null);
  const [isVoiceServiceAvailable, setIsVoiceServiceAvailable] = useState(true);
  const [apiUsage, setApiUsage] = useState<{ charactersUsed?: number; charactersLimit?: number } | null>(null);
  const [rateLimitRetryTime, setRateLimitRetryTime] = useState<number>(0);
  
  // UI State
  const [isProblemSelectorOpen, setIsProblemSelectorOpen] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [silenceCountdown, setSilenceCountdown] = useState<number>(0);

  const recorderRef = useRef<VoiceReasoningRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rateLimitTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const silenceThreshold = 15000; // 15 seconds of silence
  const minTimeBetweenAI = 30000; // 30 seconds minimum between AI responses

  useEffect(() => {
    recorderRef.current = new VoiceReasoningRecorder();
    loadVoices();
    checkApiUsageStatus();
    fetchProblems();
    
    return () => {
      clearAllTimers();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const clearAllTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (rateLimitTimerRef.current) {
      clearTimeout(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
    }
  };

  const updateDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(`[${timestamp}] ${info}`);
    console.log(`[Voice Debug] ${info}`);
  };

  const checkApiUsageStatus = async () => {
    try {
      const usage = await checkApiUsage();
      setApiUsage(usage);
      updateDebugInfo(`API usage checked: ${usage ? 'Available' : 'Not available'}`);
    } catch (error) {
      updateDebugInfo('Could not check API usage');
    }
  };

  const handleVoiceError = (error: any) => {
    const errorType = error.type || 'api_error';
    const retryAfter = error.retryAfter || 60000;

    const voiceError: VoiceError = {
      type: errorType,
      message: error.message,
      retryAfter: errorType === 'rate_limit' ? retryAfter : undefined
    };

    setVoiceError(voiceError);
    setIsVoiceServiceAvailable(false);
    updateDebugInfo(`Voice error: ${errorType} - ${error.message}`);

    if (errorType === 'rate_limit') {
      setRateLimitRetryTime(Date.now() + retryAfter);
      updateDebugInfo(`Rate limit hit, retry after ${retryAfter}ms`);
      
      // Set timer to clear rate limit error
      rateLimitTimerRef.current = setTimeout(() => {
        setVoiceError(null);
        setIsVoiceServiceAvailable(true);
        setRateLimitRetryTime(0);
        updateDebugInfo('Rate limit period expired, voice service restored');
      }, retryAfter);
    } else {
      // For other errors, allow retry after 30 seconds
      setTimeout(() => {
        setVoiceError(null);
        setIsVoiceServiceAvailable(true);
        updateDebugInfo('Voice service error cleared, retrying available');
      }, 30000);
    }
  };

  const loadVoices = async () => {
    try {
      updateDebugInfo('Loading voices...');
      const voices = await getAvailableVoices();
      setAvailableVoices(voices);
      if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
      setIsVoiceServiceAvailable(true);
      setVoiceError(null);
      updateDebugInfo(`Loaded ${voices.length} voices successfully`);
    } catch (error) {
      console.error('Failed to load voices:', error);
      handleVoiceError(error);
    }
  };

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProblems(data || []);
      
      if (data && data.length > 0) {
        setSelectedProblem(data[0]);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSilenceTimer = () => {
    // Clear existing timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    const now = Date.now();
    lastSpeechTimeRef.current = now;
    
    // Check if enough time has passed since last AI response
    const timeSinceLastAI = now - lastAIResponseTime;
    if (timeSinceLastAI < minTimeBetweenAI) {
      updateDebugInfo(`Too soon for AI response (${Math.round((minTimeBetweenAI - timeSinceLastAI) / 1000)}s remaining)`);
      return;
    }

    // Don't start timer if voice service is unavailable
    if (!isVoiceServiceAvailable) {
      updateDebugInfo('Voice service unavailable, skipping AI response timer');
      return;
    }

    updateDebugInfo('Starting silence timer (15 seconds)');
    setSilenceCountdown(15);

    // Start countdown display
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastSpeechTimeRef.current;
      const remaining = Math.max(0, Math.ceil((silenceThreshold - elapsed) / 1000));
      setSilenceCountdown(remaining);
      
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    // Set the main silence timer
    silenceTimerRef.current = setTimeout(() => {
      updateDebugInfo('Silence threshold reached - triggering AI response');
      if (isRecording && !isPaused && !isWaitingForResponse && isVoiceServiceAvailable) {
        handleSilenceDetected();
      } else {
        updateDebugInfo(`Skipped AI response - recording: ${isRecording}, paused: ${isPaused}, waiting: ${isWaitingForResponse}, voice available: ${isVoiceServiceAvailable}`);
      }
    }, silenceThreshold);
  };

  const handleSilenceDetected = async () => {
    if (chunks.length === 0 || isWaitingForResponse || !isVoiceServiceAvailable) {
      updateDebugInfo('Skipped AI response - no chunks, already waiting, or voice unavailable');
      return;
    }

    updateDebugInfo('Generating AI response for silence...');
    
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
    setSilenceCountdown(0);

    updateDebugInfo(`AI message generated: ${aiResponse.type}`);

    // Try to play the AI response
    await playAIMessage(aiResponse.content);
  };

  const playAIMessage = async (message: string) => {
    if (!selectedVoice) {
      updateDebugInfo('No voice selected for AI message');
      return;
    }

    if (!isVoiceServiceAvailable) {
      updateDebugInfo('Voice service unavailable, skipping audio playback');
      return;
    }

    try {
      updateDebugInfo('Playing AI message with ElevenLabs...');
      setIsPlayingAudio(true);
      
      const audioUrl = await generateSpeech(message, selectedVoice.voice_id);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        updateDebugInfo('AI message playback finished');
      };
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        updateDebugInfo('Error playing AI message');
      };
      
      await audioRef.current.play();
      updateDebugInfo('AI message started playing');
    } catch (error) {
      console.error('Error playing AI response:', error);
      handleVoiceError(error);
      setIsPlayingAudio(false);
      updateDebugInfo(`Error playing AI message: ${error}`);
    }
  };

  const generateAIResponse = (lastChunk: SpeechChunk, allChunks: SpeechChunk[]) => {
    const transcript = lastChunk.transcript.toLowerCase();
    const stage = lastChunk.stage || 'general';
    const chunkCount = allChunks.length;

    updateDebugInfo(`Generating AI response for stage: ${stage}, chunk count: ${chunkCount}`);

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

    updateDebugInfo(`User responded: ${userInput}`);

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

    // Try to play follow-up
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

  const startSession = async () => {
    if (!selectedProblem) return;
    
    setSessionMode('recording');
    setSessionStartTime(new Date());
    setSessionDuration(0);
    setChunks([]);
    setUserNotes('');
    setFlaggedMoments([]);
    setCurrentTranscript('');
    setAiMessages([]);
    
    await startRecording();
  };

  const startRecording = async () => {
    if (!recorderRef.current) return;

    updateDebugInfo('Starting voice reasoning session...');
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);
    setCurrentTranscript('');
    setChunks([]);
    setSessionDuration(0);
    setAiMessages([]);
    setLastAIResponseTime(0);
    setSilenceCountdown(0);
    clearAllTimers();

    // Create and add initial AI welcome message
    const initialMessage: AIMessage = {
      id: `ai_initial_${Date.now()}`,
      content: `Hello! I'm your AI reasoning coach, and I'm excited to work with you on "${selectedProblem.title}". I'll be listening as you think through this problem and will offer guidance when needed. Feel free to speak your thoughts out loud - I'm here to help you discover the solution together. Let's begin!`,
      timestamp: new Date(),
      type: 'encouragement',
      isUser: false
    };

    setAiMessages([initialMessage]);

    // Try to play the initial welcome message
    if (selectedVoice && isVoiceServiceAvailable) {
      await playAIMessage(initialMessage.content);
    } else {
      updateDebugInfo('Voice service unavailable, skipping initial message playback');
    }

    // Set the initial AI response time to now
    setLastAIResponseTime(Date.now());

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
        updateDebugInfo(`New speech chunk received: "${chunk.transcript.substring(0, 50)}..."`);
        setChunks(prev => [...prev, chunk]);
        setCurrentTranscript('');
        
        // Reset waiting state when user speaks
        if (isWaitingForResponse) {
          setIsWaitingForResponse(false);
          setShowChatInput(false);
          updateDebugInfo('User spoke - resetting waiting state');
        }
        
        // Start new silence timer
        startSilenceTimer();
      },
      (error) => {
        console.error('Recording error:', error);
        updateDebugInfo(`Recording error: ${error}`);
        stopRecording();
      }
    );
  };

  const pauseRecording = () => {
    if (recorderRef.current && isRecording) {
      updateDebugInfo('Pausing recording');
      recorderRef.current.stopRecording();
      setIsPaused(true);
      clearAllTimers();
      setSilenceCountdown(0);
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current && isPaused) {
      updateDebugInfo('Resuming recording');
      startTimeRef.current = Date.now() - sessionDuration;
      setIsPaused(false);
      
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
          updateDebugInfo(`New speech chunk (resumed): "${chunk.transcript.substring(0, 50)}..."`);
          setChunks(prev => [...prev, chunk]);
          setCurrentTranscript('');
          
          if (isWaitingForResponse) {
            setIsWaitingForResponse(false);
            setShowChatInput(false);
            updateDebugInfo('User spoke after resume - resetting waiting state');
          }
          
          startSilenceTimer();
        },
        (error) => {
          console.error('Recording error:', error);
          updateDebugInfo(`Recording error on resume: ${error}`);
          stopRecording();
        }
      );
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
    
    updateDebugInfo('Stopping recording');
    setIsRecording(false);
    setIsPaused(false);
    clearAllTimers();
    setSilenceCountdown(0);

    finishSession();
  };

  const finishSession = async () => {
    setSessionMode('analysis');
    setIsAnalyzing(true);
    
    try {
      // Use Gemini-powered analysis
      const sessionAnalysis = await analyzeReasoningPatterns(
        chunks,
        selectedProblem?.title || 'Algorithm Problem',
        selectedProblem?.description || 'Problem solving session'
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
      setSessionMode('feedback');
    }
  };

  const addFlag = () => {
    const timestamp = Date.now() - startTimeRef.current;
    const note = prompt('Add a note for this moment:');
    if (note) {
      setFlaggedMoments(prev => [...prev, { timestamp, note }]);
    }
  };

  const resetSession = () => {
    setSessionMode('setup');
    setIsRecording(false);
    setIsPaused(false);
    setCurrentTranscript('');
    setChunks([]);
    setSessionDuration(0);
    setAnalysis(null);
    setIsAnalyzing(false);
    setUserNotes('');
    setFlaggedMoments([]);
    setSessionStartTime(null);
    setAiMessages([]);
    setIsWaitingForResponse(false);
    setShowChatInput(false);
    setUserInput('');
    setLastAIResponseTime(0);
    setSilenceCountdown(0);
    setDebugInfo('');
    
    clearAllTimers();
    
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
  };

  const retryVoiceService = async () => {
    updateDebugInfo('Retrying voice service...');
    setVoiceError(null);
    setIsVoiceServiceAvailable(true);
    await loadVoices();
    await checkApiUsageStatus();
  };

  const playAnalysisFeedback = async () => {
    if (!selectedVoice || !analysis || !isVoiceServiceAvailable) {
      if (!isVoiceServiceAvailable) {
        updateDebugInfo('Voice service unavailable for feedback playback');
      }
      return;
    }

    try {
      setIsPlayingAudio(true);
      
      const feedbackText = generateFeedbackText(analysis);
      const audioUrl = await generateSpeech(feedbackText, selectedVoice.voice_id);
      
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
      handleVoiceError(error);
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
    let feedback = `Excellent work on your voice reasoning session for "${selectedProblem?.title}"! `;
    
    if (analysis.overallScore) {
      feedback += `Your reasoning scored ${analysis.overallScore} out of 10. `;
    }
    
    if (analysis.aiInteractions) {
      feedback += `During our session, I asked ${analysis.aiInteractions.questionsAsked} questions and you responded ${analysis.aiInteractions.userResponses} times. `;
    }
    
    if (analysis.strengths && analysis.strengths.length > 0) {
      feedback += `I identified several strengths in your approach: ${analysis.strengths.join(', ')}. `;
    }
    
    if (analysis.potentialIssues && analysis.potentialIssues.length > 0) {
      feedback += `There are some areas where we can help you improve: ${analysis.potentialIssues.join(', ')}. `;
    }
    
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      feedback += `Based on your reasoning patterns, I recommend: ${analysis.suggestions.join('. ')}. `;
    }
    
    feedback += `This analysis will help guide our SSA coaching session to address your specific needs.`;
    
    return feedback;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatRetryTime = (retryTime: number) => {
    const remaining = Math.max(0, Math.ceil((retryTime - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'understanding': return 'bg-blue-500';
      case 'simulation': return 'bg-green-500';
      case 'pattern': return 'bg-purple-500';
      case 'validation': return 'bg-yellow-500';
      case 'solution': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  const navigateToSSA = () => {
    // Navigate to SSA coaching with the analysis data
    window.location.href = '/ssa-coaching';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Setup Mode
  if (sessionMode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-6">
              <Mic className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Reasoning Session</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Think out loud while solving algorithmic problems. Our AI will analyze your reasoning patterns 
              and provide personalized insights to improve your problem-solving approach.
            </p>
          </div>

          {/* Voice Service Status */}
          {voiceError && (
            <Card className={`mb-8 border-2 ${voiceError.type === 'rate_limit' ? 'border-orange-300 bg-orange-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${voiceError.type === 'rate_limit' ? 'text-orange-600' : 'text-red-600'}`} />
                  <div>
                    <h3 className={`font-medium ${voiceError.type === 'rate_limit' ? 'text-orange-900' : 'text-red-900'}`}>
                      {voiceError.type === 'rate_limit' ? 'Voice Service Rate Limited' : 'Voice Service Error'}
                    </h3>
                    <p className={`text-sm ${voiceError.type === 'rate_limit' ? 'text-orange-800' : 'text-red-800'}`}>
                      {voiceError.message}
                    </p>
                    {voiceError.type === 'rate_limit' && rateLimitRetryTime > 0 && (
                      <p className="text-sm text-orange-700 mt-1">
                        Voice will be available again in: {formatRetryTime(rateLimitRetryTime)}
                      </p>
                    )}
                    {voiceError.type === 'rate_limit' && (
                      <p className="text-sm text-orange-700 mt-1">
                        💡 You can continue the session - text responses will still work!
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={retryVoiceService}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Problem Selection */}
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Problem</h2>
              <Button
                onClick={() => setIsProblemSelectorOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
                variant="outline"
              >
                Browse Problems
              </Button>
            </div>

            {selectedProblem ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedProblem.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-3">{selectedProblem.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {selectedProblem.difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        {selectedProblem.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {selectedProblem.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{selectedProblem.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsProblemSelectorOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No problem selected</p>
                <Button
                  onClick={() => setIsProblemSelectorOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Choose Problem
                </Button>
              </div>
            )}
          </Card>

          {/* Voice Settings */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Voice for Feedback
                </label>
                <select
                  value={selectedVoice?.voice_id || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.voice_id === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableVoices.map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} - {voice.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => selectedVoice && generateSpeech('Hello! I\'m ready to analyze your reasoning patterns.', selectedVoice.voice_id)}
                  variant="outline"
                  leftIcon={<Volume2 className="h-4 w-4" />}
                  disabled={!selectedVoice || !isVoiceServiceAvailable}
                >
                  {isVoiceServiceAvailable ? 'Test Voice' : 'Voice Unavailable'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Session Tips */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Session Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What to Think About</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Break down what the problem is asking
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Walk through examples step by step
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Identify patterns and approaches
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Consider edge cases and complexity
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Speak clearly and at a natural pace
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Express your thought process honestly
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Don't worry about being perfect
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Take notes while thinking
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Start Session */}
          <div className="text-center">
            <Button
              onClick={startSession}
              disabled={!selectedProblem}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-12 py-4 text-lg font-semibold"
              leftIcon={<Mic className="h-6 w-6" />}
            >
              Start Voice Reasoning Session
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Estimated session time: 15-30 minutes
            </p>
          </div>
        </div>

        <ProblemSelector
          isOpen={isProblemSelectorOpen}
          onClose={() => setIsProblemSelectorOpen(false)}
          onSelectProblem={(problem) => {
            setSelectedProblem(problem);
            setIsProblemSelectorOpen(false);
          }}
          onAddNewProblem={() => {
            setIsProblemSelectorOpen(false);
            window.location.href = '/problem-creator';
          }}
        />
      </div>
    );
  }

  // Recording Mode
  if (sessionMode === 'recording') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{selectedProblem?.title}</h1>
                <p className="text-purple-200">Voice Reasoning Session</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatDuration(sessionDuration)}</div>
              <div className="text-sm text-purple-200 flex items-center justify-end">
                {isVoiceServiceAvailable ? (
                  <>
                    <Wifi className="h-4 w-4 mr-1" />
                    Voice Available
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 mr-1" />
                    Voice Limited
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Voice Service Status */}
          {voiceError && (
            <Card className={`mb-4 border-2 ${voiceError.type === 'rate_limit' ? 'border-orange-300 bg-orange-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${voiceError.type === 'rate_limit' ? 'text-orange-600' : 'text-red-600'}`} />
                  <div>
                    <h3 className={`font-medium ${voiceError.type === 'rate_limit' ? 'text-orange-900' : 'text-red-900'}`}>
                      {voiceError.type === 'rate_limit' ? 'Voice Service Rate Limited' : 'Voice Service Error'}
                    </h3>
                    <p className={`text-sm ${voiceError.type === 'rate_limit' ? 'text-orange-800' : 'text-red-800'}`}>
                      {voiceError.message}
                    </p>
                    {voiceError.type === 'rate_limit' && rateLimitRetryTime > 0 && (
                      <p className="text-sm text-orange-700 mt-1">
                        Voice will be available again in: {formatRetryTime(rateLimitRetryTime)}
                      </p>
                    )}
                    {voiceError.type === 'rate_limit' && (
                      <p className="text-sm text-orange-700 mt-1">
                        💡 You can continue the session - text responses will still work!
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={retryVoiceService}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Live Transcript */}
            <div className="space-y-6">
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Live Transcript</h2>
                  <div className="flex items-center space-x-2">
                    {isRecording && !isPaused && (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    <span className="text-sm text-purple-200">
                      {isRecording && !isPaused ? 'Recording...' : isPaused ? 'Paused' : 'Stopped'}
                    </span>
                    {silenceCountdown > 0 && (
                      <span className="text-sm text-orange-300 ml-2">
                        AI response in {silenceCountdown}s
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                  {chunks.map((chunk, index) => (
                    <div key={chunk.id} className="mb-4 p-3 bg-white bg-opacity-10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-purple-200">Chunk {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${getStageColor(chunk.stage || 'general')}`}></span>
                          <span className="text-xs text-purple-200">{chunk.stage || 'general'}</span>
                        </div>
                      </div>
                      <p className="text-white text-sm">{chunk.transcript}</p>
                    </div>
                  ))}
                  
                  {currentTranscript && (
                    <div className="p-3 bg-yellow-500 bg-opacity-20 rounded-lg border border-yellow-400 border-opacity-30">
                      <p className="text-yellow-100 text-sm">
                        {currentTranscript}
                        <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse"></span>
                      </p>
                    </div>
                  )}
                  
                  {!isRecording && !isPaused && chunks.length === 0 && (
                    <div className="text-center text-purple-300 py-12">
                      <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start speaking to see your transcript here...</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recording Controls */}
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <div className="flex justify-center space-x-4">
                  {!isRecording && !isPaused && (
                    <Button
                      onClick={startRecording}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
                      leftIcon={<Mic className="h-5 w-5" />}
                    >
                      Start Recording
                    </Button>
                  )}

                  {isRecording && !isPaused && (
                    <>
                      <Button
                        onClick={pauseRecording}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        leftIcon={<Pause className="h-5 w-5" />}
                      >
                        Pause
                      </Button>
                      <Button
                        onClick={addFlag}
                        variant="outline"
                        className="border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10"
                        leftIcon={<Flag className="h-5 w-5" />}
                      >
                        Flag Moment
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        leftIcon={<Square className="h-5 w-5" />}
                      >
                        Finish Session
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
                        Finish Session
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {/* AI Interaction Panel */}
              {aiMessages.length > 0 && (
                <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                  <h2 className="text-xl font-bold text-white mb-4">AI Coaching Conversation</h2>
                  <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                    {aiMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg border ${message.isUser ? 'bg-blue-900 bg-opacity-30 border-blue-700' : 'bg-purple-900 bg-opacity-30 border-purple-700'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-white">
                            {message.isUser ? '👤 You' : '🤖 AI Coach'}
                          </span>
                          <span className="text-xs text-purple-200">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-white text-sm">{message.content}</p>
                        {!message.isUser && (
                          <button
                            onClick={() => playAIMessage(message.content)}
                            className="mt-2 text-xs text-blue-300 hover:text-blue-200 flex items-center"
                            disabled={isPlayingAudio || !isVoiceServiceAvailable}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            {isPlayingAudio ? 'Playing...' : isVoiceServiceAvailable ? 'Play Again' : 'Voice Unavailable'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  {showChatInput && (
                    <div className="border-t border-white border-opacity-20 pt-4">
                      <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-200">
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
                          className="flex-1 px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        />
                        <Button
                          onClick={handleUserResponse}
                          disabled={!userInput.trim()}
                          leftIcon={<Brain className="h-4 w-4" />}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right Panel - Notes & Flags */}
            <div className="space-y-6">
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <h2 className="text-xl font-bold text-white mb-4">Session Notes</h2>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Take notes while thinking through the problem..."
                  className="w-full h-40 bg-black bg-opacity-30 text-white placeholder-purple-300 border border-white border-opacity-20 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </Card>

              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Flagged Moments</h2>
                  <span className="text-sm text-purple-200">{flaggedMoments.length} flags</span>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {flaggedMoments.map((flag, index) => (
                    <div key={index} className="bg-black bg-opacity-30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-purple-200">
                          {formatDuration(flag.timestamp)}
                        </span>
                        <Flag className="h-4 w-4 text-yellow-400" />
                      </div>
                      <p className="text-white text-sm">{flag.note}</p>
                    </div>
                  ))}
                  
                  {flaggedMoments.length === 0 && (
                    <div className="text-center text-purple-300 py-8">
                      <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No flagged moments yet</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Session Stats */}
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <h2 className="text-xl font-bold text-white mb-4">Session Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{chunks.length}</div>
                    <div className="text-sm text-purple-200">Chunks Captured</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{flaggedMoments.length}</div>
                    <div className="text-sm text-purple-200">Moments Flagged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{aiMessages.filter(m => !m.isUser).length}</div>
                    <div className="text-sm text-purple-200">AI Interactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{aiMessages.filter(m => m.isUser).length}</div>
                    <div className="text-sm text-purple-200">Your Responses</div>
                  </div>
                </div>
              </Card>

              {/* Debug Info */}
              {debugInfo && (
                <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                  <h2 className="text-xl font-bold text-white mb-4">Debug Info</h2>
                  <div className="bg-black bg-opacity-30 p-3 rounded-lg text-xs text-purple-200 font-mono">
                    {debugInfo}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analysis Mode
  if (sessionMode === 'analysis') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <Brain className="h-10 w-10 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Analyzing Your Reasoning...</h1>
            <p className="text-xl text-gray-600 mb-8">
              Gemini AI is processing your thought patterns and identifying insights
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-6"></div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">Processing speech chunks...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500">Identifying reasoning patterns and insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feedback Mode
  if (sessionMode === 'feedback' && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Session Complete!</h1>
            <p className="text-xl text-gray-600">
              Here's your personalized analysis and feedback powered by Gemini AI
            </p>
          </div>

          {/* Voice Service Status */}
          {voiceError && (
            <Card className={`mb-8 border-2 ${voiceError.type === 'rate_limit' ? 'border-orange-300 bg-orange-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${voiceError.type === 'rate_limit' ? 'text-orange-600' : 'text-red-600'}`} />
                  <div>
                    <h3 className={`font-medium ${voiceError.type === 'rate_limit' ? 'text-orange-900' : 'text-red-900'}`}>
                      {voiceError.type === 'rate_limit' ? 'Voice Service Rate Limited' : 'Voice Service Error'}
                    </h3>
                    <p className={`text-sm ${voiceError.type === 'rate_limit' ? 'text-orange-800' : 'text-red-800'}`}>
                      {voiceError.message}
                    </p>
                    {voiceError.type === 'rate_limit' && rateLimitRetryTime > 0 && (
                      <p className="text-sm text-orange-700 mt-1">
                        Voice will be available again in: {formatRetryTime(rateLimitRetryTime)}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={retryVoiceService}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Session Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatDuration(sessionDuration)}</div>
              <div className="text-sm text-blue-100">Total Time</div>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-green-500 to-green-600 text-white">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{chunks.length}</div>
              <div className="text-sm text-green-100">Reasoning Chunks</div>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analysis.overallScore || 'N/A'}/10</div>
              <div className="text-sm text-purple-100">AI Score</div>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{(analysis.suggestions || []).length}</div>
              <div className="text-sm text-orange-100">Improvements</div>
            </Card>
          </div>

          {/* Voice Feedback */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Voice Feedback</h2>
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Volume2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personalized Audio Analysis</h3>
                  <p className="text-gray-600">Listen to Gemini AI insights about your reasoning patterns</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={playAnalysisFeedback}
                  disabled={isPlayingAudio || !selectedVoice || !isVoiceServiceAvailable}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  leftIcon={<Volume2 className="h-4 w-4" />}
                >
                  {isPlayingAudio ? 'Playing...' : isVoiceServiceAvailable ? 'Play Feedback' : 'Voice Unavailable'}
                </Button>
                
                {isPlayingAudio && (
                  <Button
                    onClick={stopAudio}
                    variant="outline"
                    leftIcon={<VolumeX className="h-4 w-4" />}
                  >
                    Stop
                  </Button>
                )}
                
                {!isVoiceServiceAvailable && (
                  <Button
                    onClick={retryVoiceService}
                    variant="outline"
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                  >
                    Retry Voice
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-green-900">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {(analysis.strengths || []).map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-green-800">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                <h3 className="text-xl font-bold text-yellow-900">Areas to Improve</h3>
              </div>
              <ul className="space-y-3">
                {(analysis.potentialIssues || []).map((issue: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-yellow-800">{issue}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-blue-900">AI Suggestions</h3>
              </div>
              <ul className="space-y-3">
                {(analysis.suggestions || []).map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-blue-800">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* AI Interaction Summary */}
          {analysis.aiInteractions && (
            <Card className="mb-8" title="🤖 AI Interaction Summary">
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

          {/* Detailed Feedback */}
          {analysis.detailedFeedback && (
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed AI Analysis</h2>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                <p className="text-gray-800 leading-relaxed">{analysis.detailedFeedback}</p>
              </div>
            </Card>
          )}

          {/* Reasoning Timeline */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reasoning Timeline</h2>
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <div key={chunk.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full ${getStageColor(chunk.stage || 'general')}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        Stage: {chunk.stage || 'general'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(chunk.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{chunk.transcript}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <Button
              onClick={navigateToSSA}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start SSA Coaching
            </Button>
            
            <Button
              onClick={resetSession}
              variant="outline"
              leftIcon={<RotateCcw className="h-5 w-5" />}
            >
              New Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VoiceReasoningMode;