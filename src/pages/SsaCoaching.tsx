import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProblemStatement from '../components/ssa-coaching/ProblemStatement';
import CoachingInterface from '../components/ssa-coaching/CoachingInterface';
import ProblemSelector from '../components/ssa-coaching/ProblemSelector';
import Button from '../components/ui/Button';
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
  const [isTyping, setIsTyping] = useState(false);
  const [isProblemSelectorOpen, setIsProblemSelectorOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<SsaSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedProblem && userId) {
      loadOrCreateSession();
    }
  }, [selectedProblem, userId]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*');
      
      if (error) throw error;
      
      setProblems(data);
      if (data.length > 0) {
        setSelectedProblem(data[0]);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateSession = async () => {
    if (!userId || !selectedProblem) return;

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

      if (existingSession) {
        setCurrentSession(existingSession);
        setCurrentStage(existingSession.current_stage);
        setMessages(existingSession.session_data.messages || []);
      } else {
        // Create new session
        const initialMessage = {
          id: Date.now().toString(),
          content: `Hello! I'm your Socratic Solve Assistant. Let's solve "${selectedProblem.title}" together by breaking it down step by step. First, could you explain in your own words what the problem is asking for?`,
          sender: 'assistant' as const,
          timestamp: new Date(),
          stage: 1
        };

        const { data: newSession, error: insertError } = await supabase
          .from('ssa_sessions')
          .insert({
            user_id: userId,
            problem_id: selectedProblem.problem_id,
            current_stage: 1,
            session_data: {
              messages: [initialMessage]
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setCurrentSession(newSession);
        setMessages([initialMessage]);
      }
    } catch (error) {
      console.error('Error loading/creating session:', error);
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
          session_data: { messages: updatedMessages }
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

      // Create assistant response based on validation
      let assistantResponse = validation.assistant_reply;
      let nextStage = currentStage;

      // If valid and not at final stage, ask about moving to next stage
      if (validation.is_valid && currentStage < 5) {
        const stageNames = {
          1: 'Simulation',
          2: 'Pattern Recognition', 
          3: 'Validation',
          4: 'Solution Implementation'
        };
        
        const nextStageName = stageNames[currentStage as keyof typeof stageNames];
        assistantResponse += ` Would you like to move on to the next stage: ${nextStageName}? Type 'yes' to continue or keep discussing this stage.`;
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

        // Update session with assistant response
        await supabase
          .from('ssa_sessions')
          .update({
            session_data: { messages: finalMessages }
          })
          .eq('session_id', currentSession.session_id);

        // Check if user wants to advance to next stage
        if (validation.is_valid && currentStage < 5 && 
            (content.toLowerCase().includes('yes') || 
             content.toLowerCase().includes('next') ||
             content.toLowerCase().includes('continue'))) {
          
          setTimeout(() => {
            advanceToNextStage();
          }, 1000);
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
          session_data: { messages: [...messages, stageMessage] }
        })
        .eq('session_id', currentSession.session_id);
    } catch (error) {
      console.error('Error advancing stage:', error);
    }
  };

  const handleSelectProblem = async (problem: Problem) => {
    setSelectedProblem(problem);
    setIsProblemSelectorOpen(false);
    setCurrentStage(1);
    setMessages([]);
  };

  const handleAddNewProblem = () => {
    window.location.href = '/problem-creator';
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
        <Button
          onClick={() => setIsProblemSelectorOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Choose Problem
        </Button>
      </div>

      {selectedProblem && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
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

          <div className="lg:col-span-2 h-[700px]">
            <CoachingInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentStage={currentStage}
              isLoading={isTyping || isValidating}
            />
          </div>
        </div>
      )}

      <ProblemSelector
        isOpen={isProblemSelectorOpen}
        onClose={() => setIsProblemSelectorOpen(false)}
        onSelectProblem={handleSelectProblem}
        onAddNewProblem={handleAddNewProblem}
      />
    </div>
  );
};

export default SsaCoaching;