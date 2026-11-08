import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

interface IdeaSubmissionFormProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ 
  onSubmit,
  isLoading 
}) => {
  const [idea, setIdea] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (idea.trim().length < 50) {
      setError('Please provide a more detailed description of your algorithm strategy (at least 50 characters).');
      return;
    }
    
    setError('');
    onSubmit(idea);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="idea" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Algorithmic Reasoning & Strategy *
          </label>
          <span className="text-[11px] font-mono text-zinc-400">
            {idea.length} chars (min 50)
          </span>
        </div>
        <textarea
          id="idea"
          rows={6}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-zinc-50/40 border border-zinc-200 rounded-lg placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors leading-relaxed"
          placeholder="Articulate your approach: Describe the data structures chosen, loop invariants, state transitions, and the asymptotic time/space complexity tradeoffs..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isLoading}
        />
        {error && (
          <div className="mt-2 flex items-center text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          variant="primary"
          disabled={!idea.trim() || isLoading}
          isLoading={isLoading}
          rightIcon={<Send className="h-3.5 w-3.5" />}
        >
          Evaluate Strategy
        </Button>
      </div>
    </form>
  );
};

export default IdeaSubmissionForm;
