import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProblemStatement from '../components/ssa-coaching/ProblemStatement';
import CoachingInterface from '../components/ssa-coaching/CoachingInterface';
import ProblemSelector from '../components/ssa-coaching/ProblemSelector';
import Button from '../components/ui/Button';
import { useAppSelector } from '../hooks/reduxHooks';
import { supabase } from '../lib/supabase';
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
    setIsTyping(true);
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

      // Simulate AI response
      setTimeout(async () => {
        let response = '';
        let nextStage = currentStage;

        switch (currentStage) {
          case 1:
            response = "Good explanation! Now let's try to understand the constraints better. What's the significance of the constraints in this problem?";
            nextStage = 2;
            break;
          case 2:
            response = "Excellent observation! Let's try to simulate this with a small example. Can you walk me through how you would solve this with a simple case?";
            nextStage = 3;
            break;
          case 3:
            response = "I see you're starting to recognize a pattern. Can you identify any similar problems you've solved before?";
            nextStage = 4;
            break;
          case 4:
            response = "You're on the right track! Let's think about efficiency. What would be the time complexity of your approach?";
            nextStage = 5;
            break;
          case 5:
            response = "Great thinking! Now that we have a solid approach, let's focus on implementation details. What edge cases should we handle?";
            break;
          default:
            response = "Let's continue exploring this problem together. What are your thoughts?";
        }

        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: response,
          sender: 'assistant',
          timestamp: new Date(),
          stage: nextStage
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        if (nextStage !== currentStage) {
          setCurrentStage(nextStage);
          
          // Update session stage
          await supabase
            .from('ssa_sessions')
            .update({
              current_stage: nextStage,
              session_data: { messages: [...updatedMessages, assistantMessage] }
            })
            .eq('session_id', currentSession.session_id);
        }
      }, 1500);
    } catch (error) {
      console.error('Error updating session:', error);
      setIsTyping(false);
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
              description={selectedProblem.description}
              difficulty={selectedProblem.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'}
              timeEstimate="20-30 min"
              tags={selectedProblem.tags}
            />
          </div>

          <div className="lg:col-span-2 h-[700px]">
            <CoachingInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              currentStage={currentStage}
              isLoading={isTyping}
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