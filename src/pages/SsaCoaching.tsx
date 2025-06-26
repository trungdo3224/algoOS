import React, { useState, useEffect } from 'react';
import { Plus, Mic } from 'lucide-react';
import ProblemStatement from '../components/ssa-coaching/ProblemStatement';
import CoachingInterface from '../components/ssa-coaching/CoachingInterface';
import ProblemSelector from '../components/ssa-coaching/ProblemSelector';
import StageNavigation from '../components/ssa-coaching/StageNavigation';
import SessionControls from '../components/ssa-coaching/SessionControls';
import SessionSummary from '../components/ssa-coaching/SessionSummary';
import VoiceReasoningModal from '../components/voice-reasoning/VoiceReasoningModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAppSelector } from '../hooks/reduxHooks';
import { supabase } from '../lib/supabase';
import { validateStage } from '../services/gemini';
import type { Problem, SsaSession } from '../lib/supabase';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  stage?: number;
}

const SsaCoaching: React.FC = () => {
  const { id: userId } = useAppSelector((state) => state.user);
  const [currentStage, setCurrentStage] = useState(1);
  const [validatedStages, setValidatedStages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isProblemSelectorOpen, setIsProblemSelectorOpen] = useState(false);
  const [isVoiceReasoningOpen, setIsVoiceReasoningOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<SsaSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [stageResponses, setStageResponses] = useState<{[key: number]: {userAnswer: string, assistantFeedback: string}}>({});
  const [voiceReasoningAnalysis, setVoiceReasoningAnalysis] = useState<any>(null);

  // Load persisted problem from localStorage on component mount
  useEffect(() => {
    const persistedProblemId = localStorage.getItem('ssa-selected-problem-id');
    if (persistedProblemId) {
      console.log('Loading persisted problem ID:', persistedProblemId);
      // We'll load the actual problem data after fetching problems
    }
    fetchProblems();
  }, []);

  // Load persisted problem after problems are fetched
  useEffect(() => {
    if (problems.length > 0) {
      const persistedProblemId = localStorage.getItem('ssa-selected-problem-id');
      if (persistedProblemId) {
        const persistedProblem = problems.find(p => p.problem_id === persistedProblemId);
        if (persistedProblem) {
          console.log('Restoring persisted problem:', persistedProblem.title);
          setSelectedProblem(persistedProblem);
          return;
        } else {
          // Problem no longer exists, clear from localStorage
          localStorage.removeItem('ssa-selected-problem-id');
        }
      }
      
      // If no persisted problem or it doesn't exist, auto-select first problem
      if (problems.length > 0 && !selectedProblem) {
        console.log('Auto-selecting first problem:', problems[0].title);
        setSelectedProblem(problems[0]);
        localStorage.setItem('ssa-selected-problem-id', problems[0].problem_id);
      }
    }
  }, [problems]);

  useEffect(() => {
    if (selectedProblem && userId) {
      console.log('Selected problem changed, loading session for:', selectedProblem.title);
      loadOrCreateSession();
    }
  }, [selectedProblem, userId]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProblems(data || []);
      console.log('Fetched problems:', data?.length || 0);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateSession = async () => {
    if (!userId || !selectedProblem) {
      console.log('Missing userId or selectedProblem');
      return;
    }

    console.log('Loading or creating session for problem:', selectedProblem.title);

    try {
      // Try to load existing session
      const { data: existingSessions, error: queryError } = await supabase
        .from('ssa_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', selectedProblem.problem_id)
        .order('started_at', { ascending: false })
        .limit(1);

      if (queryError) throw queryError;

      const existingSession = existingSessions && existingSessions.length > 0 ? existingSessions[0] : null;

      if (existingSession && existingSession.session_data?.messages) {
        console.log('Loading existing session');
        // Load existing session
        setCurrentSession(existingSession);
        setCurrentStage(existingSession.current_stage || 1);
        setMessages(existingSession.session_data.messages || []);
        setValidatedStages(existingSession.session_data.validatedStages || []);
        setStageResponses(existingSession.session_data.stageResponses || {});
        setSessionStartTime(new Date(existingSession.started_at));
        setShowSummary(false);
      } else {
        console.log('Creating new session');
        // Create new session
        await createNewSession();
      }
    } catch (error) {
      console.error('Error loading/creating session:', error);
    }
  };

  const createNewSession = async () => {
    if (!userId || !selectedProblem) return;

    const initialMessage = {
      id: Date.now().toString(),
      content: `Hello! I'm your Socratic Solve Assistant. Let's solve "${selectedProblem.title}" together by breaking it down step by step. First, could you explain in your own words what the problem is asking for?`,
      sender: 'assistant' as const,
      timestamp: new Date(),
      stage: 1
    };

    try {
      const { data: newSession, error: insertError } = await supabase
        .from('ssa_sessions')
        .insert({
          user_id: userId,
          problem_id: selectedProblem.problem_id,
          current_stage: 1,
          session_data: {
            messages: [initialMessage],
            validatedStages: [],
            stageResponses: {}
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Created new session:', newSession.session_id);
      setCurrentSession(newSession);
      setCurrentStage(1);
      setValidatedStages([]);
      setMessages([initialMessage]);
      setStageResponses({});
      setSessionStartTime(new Date());
      setShowSummary(false);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const resetSession = async () => {
    if (!userId || !selectedProblem) return;

    console.log('Resetting session');
    
    // Clear current state first
    setCurrentStage(1);
    setValidatedStages([]);
    setMessages([]);
    setStageResponses({});
    setShowSummary(false);
    setCurrentSession(null);
    setVoiceReasoningAnalysis(null);

    // Create new session
    await createNewSession();
  };

  const handleStageChange = (newStage: number) => {
    if (validatedStages.includes(newStage) || newStage === currentStage) {
      setCurrentStage(newStage);
      
      // Add a message indicating stage change
      const stageNames = {
        1: 'Understanding the Problem',
        2: 'Simulation',
        3: 'Pattern Recognition',
        4: 'Validation',
        5: 'Solution Planning'
      };

      const stageMessage: Message = {
        id: Date.now().toString(),
        content: `You've navigated to Stage ${newStage}: ${stageNames[newStage as keyof typeof stageNames]}. ${newStage < currentStage ? 'Feel free to review or add more thoughts.' : 'Let\'s continue from where we left off.'}`,
        sender: 'assistant',
        timestamp: new Date(),
        stage: newStage
      };

      setMessages(prev => [...prev, stageMessage]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!userId || !selectedProblem || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      stage: currentStage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsValidating(true);

    try {
      // Update session with new message
      const updatedMessages = [...messages, userMessage];
      
      const { error } = await supabase
        .from('ssa_sessions')
        .update({
          session_data: { 
            messages: updatedMessages,
            validatedStages,
            stageResponses,
            voiceReasoningAnalysis
          }
        })
        .eq('session_id', currentSession.session_id);

      if (error) throw error;

      // Validate user response with Gemini
      const validation = await validateStage(
        currentStage,
        content,
        selectedProblem.title,
        selectedProblem.description || ''
      );

      setIsValidating(false);
      setIsTyping(true);

      // Store stage response
      const newStageResponses = {
        ...stageResponses,
        [currentStage]: {
          userAnswer: content,
          assistantFeedback: validation.assistant_reply
        }
      };
      setStageResponses(newStageResponses);

      // Create assistant response based on validation
      let assistantResponse = validation.assistant_reply;
      let newValidatedStages = [...validatedStages];

      // If valid and not already validated, mark stage as validated
      if (validation.is_valid && !validatedStages.includes(currentStage)) {
        newValidatedStages.push(currentStage);
        setValidatedStages(newValidatedStages);

        // If not at final stage, ask about moving to next stage
        if (currentStage < 5) {
          const stageNames = {
            1: 'Simulation',
            2: 'Pattern Recognition', 
            3: 'Validation',
            4: 'Solution Implementation'
          };
          
          const nextStageName = stageNames[currentStage as keyof typeof stageNames];
          assistantResponse += ` Great work! Would you like to move on to the next stage: ${nextStageName}? Type 'yes' to continue or keep discussing this stage.`;
        } else {
          // Completed all stages
          assistantResponse += ` Excellent! You've successfully completed all stages of the problem-solving process. Well done!`;
        }
      }

      setTimeout(async () => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: assistantResponse,
          sender: 'assistant',
          timestamp: new Date(),
          stage: currentStage
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        setIsTyping(false);

        // Update session with assistant response and validation status
        await supabase
          .from('ssa_sessions')
          .update({
            session_data: { 
              messages: finalMessages,
              validatedStages: newValidatedStages,
              stageResponses: newStageResponses,
              voiceReasoningAnalysis
            }
          })
          .eq('session_id', currentSession.session_id);

        // Check if user wants to advance to next stage or if all stages completed
        if (validation.is_valid) {
          if (currentStage === 5 && newValidatedStages.includes(5)) {
            // Show summary after completing final stage
            setTimeout(() => {
              setShowSummary(true);
            }, 2000);
          } else if (currentStage < 5 && 
                    (content.toLowerCase().includes('yes') || 
                     content.toLowerCase().includes('next') ||
                     content.toLowerCase().includes('continue'))) {
            
            setTimeout(() => {
              advanceToNextStage();
            }, 1000);
          }
        }
      }, 1500);

    } catch (error) {
      console.error('Error processing message:', error);
      setIsValidating(false);
      setIsTyping(false);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I'm having trouble processing your response. Could you please try again?",
        sender: 'assistant',
        timestamp: new Date(),
        stage: currentStage
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const advanceToNextStage = async () => {
    if (currentStage >= 5 || !currentSession) return;

    const nextStage = currentStage + 1;
    setCurrentStage(nextStage);

    const stageIntros = {
      2: "Great! Now let's move to the Simulation stage. Can you walk me through your solution using a concrete example? Pick a simple input and show me step by step how you would solve it.",
      3: "Excellent simulation! Now for Pattern Recognition. What algorithmic pattern or approach does this problem remind you of? Have you seen similar problems before?",
      4: "Good pattern identification! Let's move to Validation. How would you verify that your solution is correct? What about edge cases and time/space complexity?",
      5: "Perfect! Now for the final Solution stage. Let's discuss the implementation details. How would you structure your code? Any optimizations you can think of?"
    };

    const stageMessage: Message = {
      id: Date.now().toString(),
      content: stageIntros[nextStage as keyof typeof stageIntros] || "Let's continue to the next stage.",
      sender: 'assistant',
      timestamp: new Date(),
      stage: nextStage
    };

    setMessages(prev => [...prev, stageMessage]);

    try {
      // Update session stage and messages
      await supabase
        .from('ssa_sessions')
        .update({
          current_stage: nextStage,
          session_data: { 
            messages: [...messages, stageMessage],
            validatedStages,
            stageResponses,
            voiceReasoningAnalysis
          }
        })
        .eq('session_id', currentSession.session_id);
    } catch (error) {
      console.error('Error advancing stage:', error);
    }
  };

  const handleSelectProblem = async (problem: Problem) => {
    console.log('Problem selected:', problem.title);
    
    // Persist the selected problem to localStorage
    localStorage.setItem('ssa-selected-problem-id', problem.problem_id);
    
    // Close the modal first
    setIsProblemSelectorOpen(false);
    
    // Clear all current state immediately
    setCurrentStage(1);
    setValidatedStages([]);
    setMessages([]);
    setStageResponses({});
    setShowSummary(false);
    setCurrentSession(null);
    setVoiceReasoningAnalysis(null);
    
    // Set the new problem - this will trigger the useEffect to load/create session
    setSelectedProblem(problem);
  };

  const handleAddNewProblem = () => {
    setIsProblemSelectorOpen(false);
    window.location.href = '/problem-creator';
  };

  const handleChooseProblem = () => {
    console.log('Choose Problem button clicked');
    setIsProblemSelectorOpen(true);
  };

  const handleDiscardProblem = () => {
    console.log('Discarding current problem');
    
    // Clear persisted problem from localStorage
    localStorage.removeItem('ssa-selected-problem-id');
    
    // Clear all current state
    setSelectedProblem(null);
    setCurrentStage(1);
    setValidatedStages([]);
    setMessages([]);
    setStageResponses({});
    setShowSummary(false);
    setCurrentSession(null);
    setVoiceReasoningAnalysis(null);
  };

  const handleVoiceReasoningComplete = (analysis: any, chunks: any[]) => {
    setVoiceReasoningAnalysis(analysis);
    
    // Add a message about the voice reasoning session
    const voiceMessage: Message = {
      id: Date.now().toString(),
      content: `Great! I've analyzed your voice reasoning session. I noticed ${analysis.strengths.length} strengths and ${analysis.potentialIssues.length} areas for improvement. Let's continue with the guided coaching to address these insights.`,
      sender: 'assistant',
      timestamp: new Date(),
      stage: currentStage
    };
    
    setMessages(prev => [...prev, voiceMessage]);
  };

  const handleStartSSAFromVoice = (analysis: any) => {
    setVoiceReasoningAnalysis(analysis);
    
    // Create a targeted message based on voice analysis
    let targetedMessage = `Based on your voice reasoning session, I've identified some key areas to focus on. `;
    
    if (analysis.potentialIssues.length > 0) {
      targetedMessage += `Let's work on: ${analysis.potentialIssues.join(', ')}. `;
    }
    
    if (analysis.suggestions.length > 0) {
      targetedMessage += `Here's what I suggest we focus on: ${analysis.suggestions[0]}. `;
    }
    
    targetedMessage += `Let's start with the current stage and build from your insights.`;

    const targetedSSAMessage: Message = {
      id: Date.now().toString(),
      content: targetedMessage,
      sender: 'assistant',
      timestamp: new Date(),
      stage: currentStage
    };
    
    setMessages(prev => [...prev, targetedSSAMessage]);
  };

  const getSummaryData = () => {
    const totalTime = (new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60); // in minutes
    
    return {
      problemTitle: selectedProblem?.title || '',
      completedAt: new Date(),
      totalTime,
      stageResponses: Object.fromEntries(
        Object.entries(stageResponses).map(([stageId, response]) => [
          stageId,
          {
            ...response,
            stageName: {
              1: 'Understanding the Problem',
              2: 'Simulation',
              3: 'Pattern Recognition',
              4: 'Validation',
              5: 'Solution Planning'
            }[parseInt(stageId)] || `Stage ${stageId}`
          }
        ])
      )
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">SSA Coaching</h1>
          <p className="text-gray-600">
            Solve problems with guidance from our Socratic Solve Assistant.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedProblem && (
            <>
              <Button
                onClick={() => setIsVoiceReasoningOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                leftIcon={<Mic className="h-4 w-4" />}
              >
                Voice Reasoning
              </Button>
              <Button
                onClick={handleDiscardProblem}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Discard Problem
              </Button>
            </>
          )}
          <Button
            onClick={handleChooseProblem}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {selectedProblem ? 'Change Problem' : 'Choose Problem'}
          </Button>
        </div>
      </div>

      {!selectedProblem ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Problem Selected</h3>
          <p className="text-gray-600 mb-4">Choose a problem to start your SSA coaching session.</p>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={handleChooseProblem}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Choose Problem
            </Button>
            <Button
              onClick={() => setIsVoiceReasoningOpen(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
              leftIcon={<Mic className="h-4 w-4" />}
            >
              Start with Voice Reasoning
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Problem Info Bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {selectedProblem.difficulty.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900">
                    {selectedProblem.title}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {selectedProblem.difficulty} • {selectedProblem.tags.slice(0, 3).join(', ')}
                    {selectedProblem.tags.length > 3 && ` +${selectedProblem.tags.length - 3} more`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {voiceReasoningAnalysis && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Voice Analysis Available
                  </span>
                )}
                <span className="text-sm text-blue-600">
                  Session in progress
                </span>
              </div>
            </div>
          </div>

          {/* Adaptive Layout Container */}
          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* Problem Statement Section - Fixed width on large screens */}
            <div className="lg:w-1/3 flex-shrink-0">
              <ProblemStatement
                title={selectedProblem.title}
                description={selectedProblem.description || ''}
                difficulty={selectedProblem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'}
                timeEstimate="20-30 min"
                tags={selectedProblem.tags}
                exampleInput={selectedProblem.example_input || undefined}
                exampleOutput={selectedProblem.example_output || undefined}
                constraints={selectedProblem.constraints || undefined}
              />
            </div>

            {/* Chat Section - Flexible height that adapts */}
            <div className="lg:w-2/3 flex flex-col min-h-0">
              <div className="space-y-4 flex-shrink-0">
                <StageNavigation
                  currentStage={currentStage}
                  validatedStages={validatedStages}
                  onStageChange={handleStageChange}
                />

                <SessionControls
                  currentStage={currentStage}
                  validatedStages={validatedStages}
                  onStageChange={handleStageChange}
                  onResetSession={resetSession}
                  isLoading={isTyping || isValidating}
                />
              </div>

              {/* Chat Interface - Takes remaining height */}
              <div className="flex-1 min-h-0 mt-4">
                <CoachingInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentStage={currentStage}
                  isLoading={isTyping || isValidating}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <ProblemSelector
        isOpen={isProblemSelectorOpen}
        onClose={() => setIsProblemSelectorOpen(false)}
        onSelectProblem={handleSelectProblem}
        onAddNewProblem={handleAddNewProblem}
      />

      <VoiceReasoningModal
        isOpen={isVoiceReasoningOpen}
        onClose={() => setIsVoiceReasoningOpen(false)}
        problem={selectedProblem || problems[0]}
        onComplete={handleVoiceReasoningComplete}
        onStartSSA={handleStartSSAFromVoice}
      />

      {showSummary && (
        <SessionSummary
          summaryData={getSummaryData()}
          onResetSession={() => {
            setShowSummary(false);
            resetSession();
          }}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
};

export default SsaCoaching;