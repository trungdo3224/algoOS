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

  const recorderRef = useRef<VoiceReasoningRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    recorderRef.current = new VoiceReasoningRecorder();
    loadVoices();
    
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

  const startRecording = () => {
    if (!recorderRef.current) return;

    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);
    setCurrentTranscript('');
    setChunks([]);
    setSessionDuration(0);

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

    // Analyze the session
    analyzeSession();
  };

  const analyzeSession = async () => {
    setIsAnalyzing(true);
    
    try {
      // Use Gemini-powered analysis
      const sessionAnalysis = await analyzeReasoningPatterns(
        chunks, 
        problemTitle, 
        problemDescription
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
              <h2 className="text-xl font-bold">Voice Reasoning Session</h2>
              <p className="text-purple-100">Think out loud while solving: {problemTitle}</p>
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
                Start Recording
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
            </div>
          )}
        </div>
      </Card>

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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Reasoning...</h3>
            <p className="text-gray-600">Gemini AI is processing your thought patterns and identifying insights</p>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reasoning Quality Score</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">{analysis.overallScore}/10</div>
                <p className="text-gray-600">{analysis.detailedFeedback}</p>
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
                <h3 className="font-medium text-blue-900">Suggestions</h3>
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