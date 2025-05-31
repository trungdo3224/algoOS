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
      setError('Please provide a more detailed description of your algorithm idea (at least 50 characters).');
      return;
    }
    
    setError('');
    onSubmit(idea);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-1">
          Describe your algorithm idea
        </label>
        <textarea
          id="idea"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Explain your approach to solving the problem, including any data structures or algorithms you would use..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isLoading}
        ></textarea>
        {error && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!idea.trim() || isLoading}
          isLoading={isLoading}
          rightIcon={<Send className="h-4 w-4" />}
        >
          Submit for Grading
        </Button>
      </div>
    </form>
  );
};

export default IdeaSubmissionForm;