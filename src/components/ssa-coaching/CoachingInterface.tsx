import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  stage?: number;
}

interface CoachingStage {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CoachingInterfaceProps {
  onSendMessage: (content: string) => void;
  messages: Message[];
  currentStage: number;
  isLoading: boolean;
}

const stages: CoachingStage[] = [
  {
    number: 1,
    title: 'Understanding',
    description: "Deconstruct inputs, outputs, edge cases, and constraints.",
    icon: <BookOpen size={14} />,
  },
  {
    number: 2,
    title: 'Simulation',
    description: 'Dry run a concrete minimal example step by step.',
    icon: <Target size={14} />,
  },
  {
    number: 3,
    title: 'Pattern',
    description: 'Identify the exact algorithmic paradigm (Two Pointers, DP, etc.).',
    icon: <Lightbulb size={14} />,
  },
  {
    number: 4,
    title: 'Validation',
    description: 'Mathematically analyze time and space complexity boundaries.',
    icon: <CheckCircle size={14} />,
  },
  {
    number: 5,
    title: 'Solution',
    description: 'Synthesize optimal pseudo-code and implementation invariants.',
    icon: <ArrowRight size={14} />,
  },
];

const CoachingInterface: React.FC<CoachingInterfaceProps> = ({
  onSendMessage,
  messages,
  currentStage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeStage = stages[currentStage - 1] || stages[0];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Active Stage Guidance Panel */}
      <div className="p-3.5 bg-white border border-zinc-200/90 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-zinc-900 text-white flex items-center justify-center text-xs font-mono font-bold">
              {currentStage}
            </span>
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Stage {currentStage}: {activeStage.title}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
            Socratic Guidance
          </span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed pl-7">
          {activeStage.description}
        </p>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl min-h-[360px] custom-scrollbar">
        {messages && messages.length > 0 ? (
          messages.map((message) => {
            const isUser = message.sender === 'user';

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 mr-2.5 mt-0.5">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                      <Brain className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-4 py-3 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-zinc-900 text-white rounded-tr-sm shadow-sm'
                      : 'bg-white border border-zinc-200/90 text-zinc-800 rounded-tl-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  {!isUser && (
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                      <span>Socratic Coach</span>
                      <span className="font-mono text-zinc-400">Stage {message.stage || currentStage}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line font-sans">
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-zinc-400">
            <Brain className="h-8 w-8 text-zinc-300 mb-2 stroke-1" />
            <p className="text-xs font-medium text-zinc-500">Session initiated. Ready for reasoning.</p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-sm">
              State your initial observations about the problem statement, parameters, and constraints to begin.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start items-center space-x-2 text-zinc-400 text-xs py-1">
            <div className="h-6 w-6 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-zinc-600 animate-pulse" />
            </div>
            <span className="italic">Coach is analyzing your reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="flex-shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isLoading) {
                e.preventDefault();
                onSendMessage(input);
                setInput('');
              }
            }}
            placeholder="Articulate your thought process or answer the coach's prompt... (Press Enter to send)"
            rows={3}
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200/90 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400 custom-scrollbar resize-none pr-24"
            disabled={isLoading}
          />
          <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
            <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400">
              Shift+↵ newline
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              isLoading={isLoading}
              className="h-8 px-3 text-xs bg-zinc-950 text-white hover:bg-zinc-800"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachingInterface;
