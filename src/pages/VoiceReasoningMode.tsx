import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Brain, 
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Flag,
  Plus,
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
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';

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
  const { id: _userId } = useAppSelector((state) => state.user);
  const { problems: reduxProblems } = useAppSelector((state) => state.problems);
  
  // Session State
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [sessionMode, setSessionMode] = useState<'setup' | 'recording' | 'analysis' | 'feedback'>('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [_sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Recording State
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [chunks, setChunks] = useState<SpeechChunk[]>([]);
  const [userNotes, setUserNotes] = useState('');
  const [flaggedMoments, setFlaggedMoments] = useState<{timestamp: number, note: string}[]>([]);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<any>(null);
  const [_isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voice Settings
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [_availableVoices, setAvailableVoices] = useState<Voice[]>([]);
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
  const [_apiUsage, setApiUsage] = useState<{ charactersUsed?: number; charactersLimit?: number } | null>(null);
  const [rateLimitRetryTime, setRateLimitRetryTime] = useState<number>(0);
  
  // UI State
  const [isProblemSelectorOpen, setIsProblemSelectorOpen] = useState(false);
  const [_problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debug state
  const [_debugInfo, setDebugInfo] = useState<string>('');
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
    } catch {
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
      const problemList = data && data.length > 0 ? data : (reduxProblems.length > 0 ? reduxProblems : SAMPLE_PROBLEMS);
      setProblems(problemList);
      
      if (problemList.length > 0) {
        setSelectedProblem(problemList[0]);
      }
    } catch (error) {
      console.warn('Using local problems for Voice Reasoning:', error);
      const problemList = reduxProblems.length > 0 ? reduxProblems : SAMPLE_PROBLEMS;
      setProblems(problemList);
      if (problemList.length > 0) {
        setSelectedProblem(problemList[0]);
      }
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

  const generateQuestionResponse = (transcript: string, _stage: string) => {
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
      <div className="min-h-screen bg-zinc-50/70 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-zinc-200/80 pb-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-200 rounded">
                  Acoustic Thought Analysis
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-xs text-zinc-500 font-mono">
                  Real-time Socratic Probe
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                Voice Reasoning Workbench
              </h1>
              <p className="text-sm text-zinc-500 mt-1 max-w-xl">
                Verbalize your algorithmic thought process. algoOS captures speech chunks, tracks hesitation intervals, and evaluates structural invariants in real time.
              </p>
            </div>
            
            <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-zinc-900 text-white rounded-xl shadow-sm">
              <Mic className="h-7 w-7" />
            </div>
          </div>

          {/* Voice Service Status */}
          {voiceError && (
            <div className={`p-4 rounded-xl border ${voiceError.type === 'rate_limit' ? 'border-amber-200 bg-amber-50/70 text-amber-900' : 'border-rose-200 bg-rose-50/70 text-rose-900'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${voiceError.type === 'rate_limit' ? 'text-amber-600' : 'text-rose-600'}`} />
                  <div>
                    <h3 className="font-semibold text-xs tracking-wider uppercase">
                      {voiceError.type === 'rate_limit' ? 'Voice Service Rate Limited' : 'Voice Link Offline'}
                    </h3>
                    <p className="text-xs mt-0.5 opacity-90">
                      {voiceError.message}
                    </p>
                    {voiceError.type === 'rate_limit' && rateLimitRetryTime > 0 && (
                      <p className="text-xs text-amber-700 mt-1 font-mono">
                        Voice will resume in: {formatRetryTime(rateLimitRetryTime)}
                      </p>
                    )}
                    {voiceError.type === 'rate_limit' && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        💡 Live text synthesis continues normally without interruption.
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={retryVoiceService}
                  variant="outline"
                  size="sm"
                  className="text-xs flex-shrink-0"
                >
                  Retry Link
                </Button>
              </div>
            </div>
          )}

          {/* Problem Selection */}
          <Card title="Target Problem">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-zinc-500">
                Select an algorithm problem to evaluate during this reasoning session.
              </p>
              <Button
                onClick={() => setIsProblemSelectorOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                variant="outline"
                size="sm"
              >
                Browse Bank
              </Button>
            </div>

            {selectedProblem ? (
              <div className="bg-zinc-50/70 rounded-xl p-4 border border-zinc-200/80">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-base font-semibold text-zinc-900">{selectedProblem.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium
                        ${selectedProblem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                          selectedProblem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                          'bg-rose-50 text-rose-700 border border-rose-200/60'}`}>
                        {selectedProblem.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mb-3 line-clamp-2 leading-relaxed">{selectedProblem.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedProblem.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-mono text-[10px] rounded border border-zinc-200/60">
                          {tag}
                        </span>
                      ))}
                      {selectedProblem.tags.length > 3 && (
                        <span className="text-[10px] font-mono text-zinc-400">+{selectedProblem.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsProblemSelectorOpen(true)}
                    variant="outline"
                    size="sm"
                    className="self-start"
                  >
                    Change Problem
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40">
                <Brain className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs font-medium text-zinc-600 mb-1">No Problem Selected</p>
                <p className="text-xs text-zinc-400 mb-4">Choose a problem from your catalog to begin thinking out loud.</p>
                <Button
                  onClick={() => setIsProblemSelectorOpen(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  size="sm"
                >
                  Choose Problem
                </Button>
              </div>
            )}
          </Card>

          {/* Voice Settings */}
          <Card title="Speech Synthesis &amp; Audio Channel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  AI Socratic Voice Persona
                </label>
                <select
                  value={selectedVoice?.voice_id || ''}
                  onChange={(e) => {
                    const voice = _availableVoices.find(v => v.voice_id === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200/90 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors font-mono"
                >
                  {_availableVoices.map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} - {voice.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Button
                  onClick={() => selectedVoice && generateSpeech('Hello! I am ready to evaluate your reasoning patterns.', selectedVoice.voice_id)}
                  variant="outline"
                  size="sm"
                  leftIcon={<Volume2 className="h-3.5 w-3.5" />}
                  disabled={!selectedVoice || !isVoiceServiceAvailable}
                  className="w-full justify-center"
                >
                  {isVoiceServiceAvailable ? 'Test Audio Playback' : 'Audio Service Limited'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Session Guidelines */}
          <Card title="Cognitive Rubric &amp; Recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <h4 className="font-semibold text-zinc-900 mb-2">Rubric Focus Areas</h4>
                <ul className="space-y-1.5 text-zinc-600 font-mono">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                    <span>Deconstruct constraints and input guarantees clearly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                    <span>Trace canonical and boundary examples manually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                    <span>Identify structural invariants before selecting data structures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                    <span>State asymptotic time and space upper bounds</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-900 mb-2">Microphone Guidelines</h4>
                <ul className="space-y-1.5 text-zinc-600 font-mono">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1 flex-shrink-0" />
                    <span>Speak steadily; brief pauses trigger Socratic hints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1 flex-shrink-0" />
                    <span>Verbalize uncertainty or alternatives directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1 flex-shrink-0" />
                    <span>Use the flag shortcut to mark pivotal realization points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1 flex-shrink-0" />
                    <span>Take scratchpad notes to ground your invariants</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Start Session */}
          <div className="text-center pt-2 pb-6">
            <Button
              onClick={startSession}
              disabled={!selectedProblem}
              size="lg"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold px-8 py-3 shadow-sm rounded-lg"
              leftIcon={<Mic className="h-4 w-4" />}
            >
              Initialize Reasoning Session
            </Button>
            <p className="text-xs text-zinc-400 mt-2 font-mono">
              Estimated 15–30 min • Audio input buffered locally
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">{selectedProblem?.title}</h1>
                <p className="text-xs text-zinc-400 font-mono">Voice Reasoning Console // algoOS</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono tracking-tight text-white">{formatDuration(sessionDuration)}</div>
              <div className="text-xs text-zinc-400 flex items-center justify-end font-mono">
                {isVoiceServiceAvailable ? (
                  <>
                    <Wifi className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                    <span>Voice Link Ready</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5 mr-1 text-amber-400" />
                    <span>Voice Link Limited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Voice Service Status */}
          {voiceError && (
            <div className={`p-4 rounded-xl border mb-6 ${voiceError.type === 'rate_limit' ? 'border-amber-800 bg-amber-950/40 text-amber-200' : 'border-rose-800 bg-rose-950/40 text-rose-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${voiceError.type === 'rate_limit' ? 'text-amber-400' : 'text-rose-400'}`} />
                  <div>
                    <h3 className="font-semibold text-xs tracking-wider uppercase">
                      {voiceError.type === 'rate_limit' ? 'Voice Service Notice' : 'Service Connection Error'}
                    </h3>
                    <p className="text-xs mt-0.5 opacity-90">
                      {voiceError.message}
                    </p>
                    {voiceError.type === 'rate_limit' && rateLimitRetryTime > 0 && (
                      <p className="text-xs text-amber-300 mt-1 font-mono">
                        Available in: {formatRetryTime(rateLimitRetryTime)}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={retryVoiceService}
                  variant="outline"
                  size="sm"
                  className="text-xs border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Live Transcript */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Speech Stream</h2>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    {isRecording && !isPaused && (
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                    )}
                    <span className="text-zinc-400">
                      {isRecording && !isPaused ? 'Listening...' : isPaused ? 'Paused' : 'Stopped'}
                    </span>
                    {silenceCountdown > 0 && (
                      <span className="text-amber-400 ml-2">
                        probe in {silenceCountdown}s
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 min-h-[300px] max-h-[420px] overflow-y-auto custom-scrollbar font-mono text-xs">
                  {chunks.map((chunk, index) => (
                    <div key={chunk.id} className="mb-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-400">
                        <span>Chunk #{index + 1}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${getStageColor(chunk.stage || 'general')}`}></span>
                          <span className="uppercase">{chunk.stage || 'general'}</span>
                        </div>
                      </div>
                      <p className="text-zinc-200 text-xs leading-relaxed font-sans">{chunk.transcript}</p>
                    </div>
                  ))}
                  
                  {currentTranscript && (
                    <div className="p-3 bg-zinc-900/60 border border-zinc-700/80 rounded-lg">
                      <p className="text-zinc-100 text-xs font-sans">
                        {currentTranscript}
                        <span className="inline-block w-1.5 h-3.5 bg-white ml-1.5 animate-pulse align-middle"></span>
                      </p>
                    </div>
                  )}
                  
                  {!isRecording && !isPaused && chunks.length === 0 && (
                    <div className="text-center text-zinc-500 py-16">
                      <Mic className="h-8 w-8 mx-auto mb-3 opacity-40" />
                      <p className="text-xs">Start speaking your thought process aloud...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recording Controls */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center justify-center space-x-3">
                {!isRecording && !isPaused && (
                  <Button
                    onClick={startRecording}
                    size="md"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    leftIcon={<Mic className="h-4 w-4" />}
                  >
                    Start Recording
                  </Button>
                )}

                  {isRecording && !isPaused && (
                    <>
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        size="md"
                        className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                        leftIcon={<Pause className="h-4 w-4" />}
                      >
                        Pause
                      </Button>
                      <Button
                        onClick={addFlag}
                        variant="outline"
                        size="md"
                        className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                        leftIcon={<Flag className="h-4 w-4 text-amber-400" />}
                      >
                        Flag Moment
                      </Button>
                      <Button
                        onClick={stopRecording}
                        size="md"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                        leftIcon={<Square className="h-4 w-4" />}
                      >
                        Finish & Analyze
                      </Button>
                    </>
                  )}

                  {isPaused && (
                    <>
                      <Button
                        onClick={resumeRecording}
                        size="md"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        leftIcon={<Play className="h-4 w-4" />}
                      >
                        Resume
                      </Button>
                      <Button
                        onClick={stopRecording}
                        size="md"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                        leftIcon={<Square className="h-4 w-4" />}
                      >
                        Finish & Analyze
                      </Button>
                    </>
                  )}
                </div>

              {/* AI Interaction Panel */}
              {aiMessages.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Socratic Interactions</h2>
                    <span className="text-[11px] font-mono text-zinc-400">{aiMessages.length} total</span>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto mb-4 custom-scrollbar">
                    {aiMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${message.isUser ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-850/80 border-zinc-750 text-zinc-200'}`}
                      >
                        <div className="flex items-center justify-between mb-1.5 text-[10px] uppercase font-semibold text-zinc-400">
                          <span>
                            {message.isUser ? 'You' : 'AI Coach'}
                          </span>
                          <span className="font-mono">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-zinc-200 text-xs leading-relaxed">{message.content}</p>
                        {!message.isUser && (
                          <button
                            onClick={() => playAIMessage(message.content)}
                            className="mt-2 text-xs text-white font-semibold hover:underline flex items-center"
                            disabled={isPlayingAudio || !isVoiceServiceAvailable}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            {isPlayingAudio ? 'Playing...' : isVoiceServiceAvailable ? 'Replay Audio' : 'Voice Limited'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  {showChatInput && (
                    <div className="border-t border-zinc-800 pt-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                          placeholder="Type your response to the AI coach..."
                          className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                        />
                        <Button
                          onClick={handleUserResponse}
                          disabled={!userInput.trim()}
                          size="sm"
                          className="bg-white text-zinc-950 hover:bg-zinc-200"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel - Notes & Flags */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Workbench Scratchpad</h2>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Record invariants, complexity estimates, or edge cases while reasoning..."
                  className="w-full h-36 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 border border-zinc-800 rounded-xl p-3 resize-none text-xs font-mono focus:outline-none focus:border-zinc-600 custom-scrollbar"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Flagged Key Moments</h2>
                  <span className="text-xs font-mono text-zinc-400">{flaggedMoments.length} flags</span>
                </div>
                
                <div className="space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar">
                  {flaggedMoments.map((flag, index) => (
                    <div key={index} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">
                          {formatDuration(flag.timestamp)}
                        </span>
                        <Flag className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <p className="text-zinc-300 text-xs">{flag.note}</p>
                    </div>
                  ))}
                  
                  {flaggedMoments.length === 0 && (
                    <div className="text-center text-zinc-500 py-8">
                      <Flag className="h-6 w-6 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No moments flagged yet. Click "Flag Moment" to mark inflection points.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Stats */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Session Telemetry</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                    <div className="text-xl font-bold font-mono text-white">{chunks.length}</div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-400 mt-0.5">Chunks</div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                    <div className="text-xl font-bold font-mono text-white">{flaggedMoments.length}</div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-400 mt-0.5">Flags</div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                    <div className="text-xl font-bold font-mono text-white">{aiMessages.filter(m => !m.isUser).length}</div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-400 mt-0.5">AI Probes</div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                    <div className="text-xl font-bold font-mono text-white">{aiMessages.filter(m => m.isUser).length}</div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-400 mt-0.5">Replies</div>
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              {debugInfo && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
                  <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Debug Log</h2>
                  <div className="bg-zinc-950 p-2.5 rounded-lg text-[10px] text-zinc-400 font-mono overflow-x-auto">
                    {debugInfo}
                  </div>
                </div>
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
      <div className="min-h-screen bg-zinc-50/70 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-zinc-200/90 rounded-2xl p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Brain className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-lg font-bold text-zinc-950">Synthesizing Thought Telemetry</h1>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Gemini AI is analyzing hesitation intervals, pattern identification accuracy, and algorithmic formulation efficiency.
          </p>
          <div className="pt-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-900 border-t-transparent mx-auto mb-3"></div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-zinc-900 h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feedback Mode
  if (sessionMode === 'feedback' && analysis) {
    return (
      <div className="min-h-screen bg-zinc-50/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 mb-2">
                <CheckCircle className="h-3.5 w-3.5" />
                Session Analysis Complete
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Reasoning Evaluation Report</h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Synthesized insights on problem: <span className="font-semibold text-zinc-800">{selectedProblem?.title}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={resetSession}
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                New Session
              </Button>
              <Button
                onClick={navigateToSSA}
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Start SSA Coaching
              </Button>
            </div>
          </div>

          {/* Voice Service Status */}
          {voiceError && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-900 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Voice Notice: </span>
                    <span>{voiceError.message}</span>
                  </div>
                </div>
                <Button
                  onClick={retryVoiceService}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Session Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Duration</div>
              <div className="text-2xl font-bold font-mono text-zinc-900 mt-1">{formatDuration(sessionDuration)}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Total recorded thinking</div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Reasoning Chunks</div>
              <div className="text-2xl font-bold font-mono text-zinc-900 mt-1">{chunks.length}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Distinct thought units</div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">AI Reasoning Score</div>
              <div className="text-2xl font-bold font-mono text-zinc-900 mt-1">{analysis.overallScore || 'N/A'}<span className="text-xs text-zinc-400 font-normal">/10</span></div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Socratic evaluation index</div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Action Items</div>
              <div className="text-2xl font-bold font-mono text-zinc-900 mt-1">{(analysis.suggestions || []).length}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Identified improvements</div>
            </div>
          </div>

          {/* Voice Feedback Playback */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-700 flex-shrink-0">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Audio Synthesis Report</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Listen to Gemini AI vocal debrief of your reasoning trajectory</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={playAnalysisFeedback}
                disabled={isPlayingAudio || !selectedVoice || !isVoiceServiceAvailable}
                size="sm"
                leftIcon={<Volume2 className="h-3.5 w-3.5" />}
              >
                {isPlayingAudio ? 'Playing...' : isVoiceServiceAvailable ? 'Listen to Feedback' : 'Voice Limited'}
              </Button>
              
              {isPlayingAudio && (
                <Button
                  onClick={stopAudio}
                  variant="outline"
                  size="sm"
                  leftIcon={<VolumeX className="h-3.5 w-3.5" />}
                >
                  Stop
                </Button>
              )}
            </div>
          </div>

          {/* Analysis Results 3-column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Strengths</h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-700">
                {(analysis.strengths || []).map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-700">
                {(analysis.potentialIssues || []).map((issue: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="leading-relaxed">{issue}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-4 w-4 text-zinc-700" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Targeted Suggestions</h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-700">
                {(analysis.suggestions || []).map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="leading-relaxed">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Detailed Feedback */}
          {analysis.detailedFeedback && (
            <Card>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Executive Diagnostic Analysis</h3>
              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">{analysis.detailedFeedback}</p>
            </Card>
          )}

          {/* Reasoning Timeline */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Reasoning Sequence Timeline</h3>
              <span className="text-xs font-mono text-zinc-400">{chunks.length} entries</span>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {chunks.map((chunk) => (
                <div key={chunk.id} className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 uppercase text-[10px]">
                      Stage: {chunk.stage || 'general'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {Math.round(chunk.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed font-sans">{chunk.transcript}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default VoiceReasoningMode;