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
  TrendingUp
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { VoiceReasoningRecorder, SpeechChunk, analyzeReasoningPatterns } from '../services/speechRecognition';
import { generateSpeech, getAvailableVoices, Voice } from '../services/elevenlabs';
import ProblemSelector from '../components/ssa-coaching/ProblemSelector';
import { useAppSelector } from '../hooks/reduxHooks';
import { supabase } from '../lib/supabase';
import type { Problem } from '../lib/supabase';

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
  
  // UI State
  const [isProblemSelectorOpen, setIsProblemSelectorOpen] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const recorderRef = useRef<VoiceReasoningRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    recorderRef.current = new VoiceReasoningRecorder();
    loadVoices();
    fetchProblems();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  const startSession = () => {
    if (!selectedProblem) return;
    
    setSessionMode('recording');
    setSessionStartTime(new Date());
    setSessionDuration(0);
    setChunks([]);
    setUserNotes('');
    setFlaggedMoments([]);
    setCurrentTranscript('');
    
    startRecording();
  };

  const startRecording = () => {
    if (!recorderRef.current) return;

    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);

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
        setChunks(prev => [...prev, chunk]);
        setCurrentTranscript('');
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
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current && isPaused) {
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
          setChunks(prev => [...prev, chunk]);
          setCurrentTranscript('');
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
      setAnalysis(sessionAnalysis);
    } catch (error) {
      console.error('Error analyzing session:', error);
      // Fallback analysis
      setAnalysis({
        strengths: ['Completed the reasoning session'],
        potentialIssues: ['Analysis temporarily unavailable'],
        suggestions: ['Try the session again for detailed feedback'],
        overallScore: 5,
        detailedFeedback: 'Session completed successfully. Detailed analysis is temporarily unavailable.'
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
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
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
    let feedback = `Excellent work on your voice reasoning session for "${selectedProblem?.title}"! `;
    
    if (analysis.overallScore) {
      feedback += `Your reasoning scored ${analysis.overallScore} out of 10. `;
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
                  disabled={!selectedVoice}
                >
                  Test Voice
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
              <div className="text-sm text-purple-200">Session Duration</div>
            </div>
          </div>

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
                </div>
              </Card>
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
                  disabled={isPlayingAudio || !selectedVoice}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  leftIcon={<Volume2 className="h-4 w-4" />}
                >
                  {isPlayingAudio ? 'Playing...' : 'Play Feedback'}
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