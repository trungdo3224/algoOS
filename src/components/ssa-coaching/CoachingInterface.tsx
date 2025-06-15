import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Brain,
  Send,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

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
    description: "Let's break down what the problem is asking for.",
    icon: <BookOpen size={16} />,
  },
  {
    number: 2,
    title: 'Simulation',
    description: 'Walk through the solution step by step with a small example.',
    icon: <Target size={16} />,
  },
  {
    number: 3,
    title: 'Pattern',
    description: 'Identify the algorithmic pattern that fits this problem.',
    icon: <Lightbulb size={16} />,
  },
  {
    number: 4,
    title: 'Validation',
    description: 'Verify the correctness and efficiency of your solution.',
    icon: <CheckCircle size={16} />,
  },
  {
    number: 5,
    title: 'Solution',
    description: 'Refine and optimize your implementation.',
    icon: <ArrowRight size={16} />,
  },
];

const CoachingInterface: React.FC<CoachingInterfaceProps> = ({
  onSendMessage,
  messages,
  currentStage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const [showTips, setShowTips] = useState(true);

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
  }, [messages]);

  useEffect(() => {
    setTimeout(() => setShowTips(false), 3000);
  }, []);

  return (
    <div className='flex flex-col h-full'>
      <Card className='bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4 flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <div className='h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center'>
            <Brain className='h-6 w-6' />
          </div>
          <div>
            <h3 className='font-medium text-lg'>Socratic Solve Assistant</h3>
            <p className='text-sm text-blue-100'>
              Let's solve this problem step by step together
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Stages Bar */}
      <div className='flex items-center space-x-2 mb-6 overflow-x-auto py-2 scrollbar-hide flex-shrink-0'>
        {stages.map((stage) => {
          const isCompleted = currentStage > stage.number;
          const isActive = currentStage === stage.number;

          return (
            <div
              key={stage.number}
              className={`flex-none group relative ${isActive ? 'flex-1' : ''}`}
            >
              <div
                className={`
                  flex items-center px-4 py-2 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                <div className='flex items-center space-x-2'>
                  <div className='flex-shrink-0'>
                    {isCompleted ? (
                      <CheckCircle size={16} className='text-green-600' />
                    ) : (
                      stage.icon
                    )}
                  </div>
                  <span className='text-sm font-medium whitespace-nowrap'>
                    {stage.title}
                  </span>
                </div>
              </div>

              {/* Tooltip */}
              <div className='absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
                <div className='bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap'>
                  {stage.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stages[currentStage - 1] && (
        <div className='mb-6 flex-shrink-0'>
          <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 mt-1'>
                {stages[currentStage - 1].icon}
              </div>
              <div>
                <h4 className='text-sm font-medium text-blue-800'>
                  Stage {currentStage}: {stages[currentStage - 1].title}
                </h4>
                <p className='text-sm text-blue-600 mt-1'>
                  {stages[currentStage - 1].description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Messages Box - Flexible height */}
      <div className='flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-gray-50 rounded-lg mb-4 min-h-0'>
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'assistant' && (
                <div className='flex-shrink-0 mr-3'>
                  <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                    <Brain className='h-4 w-4 text-blue-600' />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[80%] px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.sender === 'assistant' && (
                  <div className='text-xs text-blue-600 font-medium mb-1'>
                    Socratic Assistant
                  </div>
                )}
                <div
                  className={
                    message.sender === 'user' ? 'text-white' : 'text-gray-700'
                  }
                >
                  {message.content}
                </div>
              </div>

              {message.sender === 'user' && (
                <div className='flex-shrink-0 ml-3'>
                  <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                    <MessageCircle className='h-4 w-4 text-white' />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form - Fixed at bottom */}
      <div className='flex-shrink-0'>
        <form onSubmit={handleSubmit} className='flex space-x-2 flex-row'>
          <div className='flex-1 relative'>
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
              placeholder='Share your thoughts on the problem... (Press Enter to send)'
              className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              rows={2}
              disabled={isLoading}
            />
            {isLoading && (
              <div className='absolute right-3 top-3 animate-pulse'>
                <div className='flex items-center space-x-1'>
                  <div className='h-2 w-2 bg-blue-600 rounded-full'></div>
                  <div className='h-2 w-2 bg-blue-600 rounded-full animation-delay-200'></div>
                  <div className='h-2 w-2 bg-blue-600 rounded-full animation-delay-400'></div>
                </div>
              </div>
            )}
          </div>
          <Button
            type='submit'
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            className='self-start'
          >
            Send
          </Button>
        </form>
      </div>

      {/* Tips Panel */}
      {showTips && (
        <div className='fixed right-4 bottom-4 max-w-xs z-10'>
          <Card className='bg-gradient-to-br from-purple-50 to-blue-50 border-blue-100'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <Lightbulb className='h-5 w-5 text-blue-600' onClick={() => setShowTips(!showTips)}/>
              </div>
              <div onClick={() => setShowTips(!showTips)}>
                <h4 className='text-sm font-medium text-blue-800'>Quick Tip</h4>
                <p className='text-xs text-blue-600 mt-1'>
                  Feel free to ask for examples or clarification about any
                  constraints you're unsure about.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CoachingInterface;