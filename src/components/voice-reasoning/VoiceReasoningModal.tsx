import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Play, Pause, Square, Brain, Volume2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { VoiceReasoningRecorder, SpeechChunk, analyzeReasoningPatterns } from '../../services/speechRecognition';
import { generateSpeech, getAvailableVoices, Voice } from '../../services/elevenlabs';
import type { Problem } from '../../lib/supabase';

interface VoiceReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  onComplete: (analysis: any, chunks: any[]) => void;
  onStartSSA: (analysis: any) => void;
}

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

const VoiceReasoningModal: React.FC<VoiceReasoningModalProps> = ({
  isOpen,
  onClose,
  problem,
  onComplete,
  onStartSSA
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [chunks, setChunks] = useState<SpeechChunk[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Voice settings
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

  const silenceThreshold = 15000; // 15 seconds of silence
  const minTimeBetweenAI = 30000; // 30 seconds minimum between AI responses

  useEffect(() => {
    if (isOpen) {
      recorderRef.current = new VoiceReasoningRecorder();
      loadVoices();
    }
    
    return () => {
      clearAllTimers();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

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
  };

  const updateDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(`[${timestamp}] ${info}`);
    console.log(`[Voice Debug] ${info}`);
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

    if (errorType !== 'rate_limit') {
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

  const startRecording = async () => {
    if (!recorderRef.current) return;

    updateDebugInfo('Starting voice reasoning session...');
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);
    setCurrentTranscript('');
    setChunks([]);
    setSessionDuration(0);
    setLastAIResponseTime(0);
    setSilenceCountdown(0);
    clearAllTimers();

    // Create and add initial AI welcome message
    const initialMessage: AIMessage = {
      id: `ai_initial_${Date.now()}`,
      content: `Hello! I'm your AI reasoning coach, and I'm excited to work with you on "${problem.title}". I'll be listening as you think through this problem and will offer guidance when needed. Feel free to speak your thoughts out loud - I'm here to help you discover the solution together. Let's begin!`,
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

    // Analyze the session
    analyzeSession();
  };

  const analyzeSession = async () => {
    setIsAnalyzing(true);
    updateDebugInfo('Starting session analysis');
    
    try {
      const sessionAnalysis = await analyzeReasoningPatterns(
        chunks,
        problem.title || 'Algorithm Problem',
        problem.description || 'Problem solving session'
      );
      
      // Add AI interaction data to analysis
      sessionAnalysis.aiInteractions = {
        totalMessages: aiMessages.length,
        questionsAsked: aiMessages.filter(m => m.type === 'question' && !m.isUser).length,
        userResponses: aiMessages.filter(m => m.isUser).length,
        encouragements: aiMessages.filter(m => m.type === 'encouragement').length
      };
      
      setAnalysis(sessionAnalysis);
      updateDebugInfo('Session analysis completed');
    } catch (error) {
      console.error('Error analyzing session:', error);
      updateDebugInfo(`Analysis error: ${error}`);
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

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMessageTypeColor = (type: string, isUser: boolean = false) => {
    if (isUser) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    
    switch (type) {
      case 'question': return 'bg-zinc-50 border-zinc-200 text-zinc-800';
      case 'encouragement': return 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900';
      case 'response': return 'bg-amber-50/60 border-amber-200/80 text-amber-900';
      default: return 'bg-zinc-50 border-zinc-200 text-zinc-800';
    }
  };

  const handleComplete = () => {
    onComplete(analysis, chunks);
  };

  const handleStartSSA = () => {
    onStartSSA(analysis);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200/90 w-full max-w-5xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-zinc-950 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">Voice Reasoning Session</h2>
              <p className="text-xs text-zinc-500">{problem.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-base font-bold font-mono text-zinc-900">{formatDuration(sessionDuration)}</div>
              <div className="text-[11px] text-zinc-500 flex items-center justify-end font-mono">
                {isVoiceServiceAvailable ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1 text-emerald-600" />
                    <span>Voice Ready</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1 text-amber-600" />
                    <span>Voice Limited</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Voice Service Status */}
          {voiceError && (
            <div className={`p-4 rounded-xl border ${voiceError.type === 'rate_limit' ? 'border-amber-200 bg-amber-50/60' : 'border-rose-200 bg-rose-50/60'}`}>
              <div className="flex items-start space-x-3">
                <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${voiceError.type === 'rate_limit' ? 'text-amber-600' : 'text-rose-600'}`} />
                <div>
                  <h3 className={`text-xs font-semibold ${voiceError.type === 'rate_limit' ? 'text-amber-900' : 'text-rose-900'}`}>
                    {voiceError.type === 'rate_limit' ? 'Voice Service Rate Limited' : 'Voice Service Notice'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${voiceError.type === 'rate_limit' ? 'text-amber-800' : 'text-rose-800'}`}>
                    {voiceError.message}
                  </p>
                  {voiceError.type === 'rate_limit' && (
                    <p className="text-xs text-amber-700 mt-1 font-medium">
                      You can continue speaking or typing — speech recognition and text feedback remain active.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          <Card>
            <div className="flex flex-col items-center space-y-5">
              <div className="flex items-center space-x-3">
                {!isRecording && !isPaused && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold px-8"
                    leftIcon={<Mic className="h-5 w-5" />}
                  >
                    Start Interactive Reasoning
                  </Button>
                )}

                {isRecording && !isPaused && (
                  <>
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      leftIcon={<Pause className="h-4 w-4" />}
                    >
                      Pause
                    </Button>
                    <Button
                      onClick={stopRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                      leftIcon={<Square className="h-4 w-4" />}
                    >
                      Stop & Analyze
                    </Button>
                  </>
                )}

                {isPaused && (
                  <>
                    <Button
                      onClick={resumeRecording}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      leftIcon={<Play className="h-4 w-4" />}
                    >
                      Resume
                    </Button>
                    <Button
                      onClick={stopRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                      leftIcon={<Square className="h-4 w-4" />}
                    >
                      Stop & Analyze
                    </Button>
                  </>
                )}
              </div>

              {/* Live Transcript */}
              {(isRecording || isPaused) && (
                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700">Live Speech Telemetry</span>
                    <span className="text-[11px] font-mono text-zinc-400">Continuous Speech-to-Text</span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-4 min-h-[110px] text-xs font-mono leading-relaxed">
                    <p className="text-zinc-800">
                      {currentTranscript || (isPaused ? 'Recording paused...' : 'Speak your thought process aloud...')}
                      {isRecording && !isPaused && (
                        <span className="inline-block w-1.5 h-3.5 bg-zinc-900 ml-1.5 animate-pulse align-middle"></span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Recording Status Bar */}
              {(isRecording || isPaused) && (
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-500">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${isRecording && !isPaused ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    <span>{isRecording && !isPaused ? 'Listening' : 'Paused'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Brain className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{chunks.length} chunks</span>
                  </div>
                  {aiMessages.length > 0 && (
                    <div className="flex items-center space-x-1.5">
                      <span>{aiMessages.length} AI prompts</span>
                    </div>
                  )}
                  {isPlayingAudio && (
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                      <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                      <span>Audio Active</span>
                    </div>
                  )}
                  {silenceCountdown > 0 && (
                    <div className="flex items-center space-x-1 text-amber-700">
                      <span>Probing in {silenceCountdown}s</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* AI Interaction Panel */}
          {aiMessages.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                  AI Dialogue Stream
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">
                  {aiMessages.length} exchanges
                </span>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto mb-4 custom-scrollbar">
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${getMessageTypeColor(message.type, message.isUser)}`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      <span>
                        {message.isUser ? 'You' : 'Socratic Assistant'}
                      </span>
                      <span className="font-mono">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-zinc-800 text-xs leading-relaxed">{message.content}</p>
                    {!message.isUser && (
                      <button
                        onClick={() => playAIMessage(message.content)}
                        className="mt-2 text-xs text-zinc-900 font-semibold hover:underline flex items-center"
                        disabled={isPlayingAudio || !isVoiceServiceAvailable}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        {isPlayingAudio ? 'Playing...' : isVoiceServiceAvailable ? 'Replay Voice' : 'Voice Limited'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              {showChatInput && (
                <div className="border-t border-zinc-100 pt-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserResponse()}
                      placeholder="Type your response to the AI coach..."
                      className="flex-1 px-3 py-2 text-xs bg-zinc-50/50 border border-zinc-200/90 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900"
                    />
                    <Button
                      onClick={handleUserResponse}
                      disabled={!userInput.trim()}
                      size="sm"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Analysis Loading */}
          {isAnalyzing && (
            <Card>
              <div className="text-center py-10 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent mx-auto"></div>
                <h3 className="text-sm font-semibold text-zinc-900">Processing Reasoning Telemetry...</h3>
                <p className="text-xs text-zinc-500">Gemini AI is analyzing hesitation intervals, pattern identification, and conceptual clarity.</p>
              </div>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              <div className="p-5 bg-white border border-zinc-200/90 rounded-xl shadow-sm text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  Reasoning Quality Index
                </span>
                <div className="text-3xl font-bold font-mono text-zinc-900 mb-2">{analysis.overallScore}/10</div>
                <p className="text-xs text-zinc-600 max-w-xl mx-auto leading-relaxed">{analysis.detailedFeedback}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-3 pt-2">
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  size="md"
                >
                  Save & Complete
                </Button>
                
                <Button
                  onClick={handleStartSSA}
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue to SSA Coaching
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceReasoningModal;