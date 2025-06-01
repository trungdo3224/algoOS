import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import ProblemForm from '../components/problem-creator/ProblemForm';
import { supabase } from '../lib/supabase';
import { useAppSelector } from '../hooks/reduxHooks';
import type { ProblemStatus } from '../lib/supabase';

interface ProblemData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string;
  hint?: string;
  status: ProblemStatus;
}

const ProblemCreator: React.FC = () => {
  const { id: userId } = useAppSelector((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (data: ProblemData) => {
    if (!userId) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setError('');

    try {
      // Format the data for database insertion
      const problemData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
        tags: data.tags,
        example_input: data.examples[0]?.input || '',
        example_output: data.examples[0]?.output || '',
        constraints: data.constraints,
        hint: data.hint,
        status: data.status
      };

      // Insert the problem into the database
      const { data: newProblem, error: insertError } = await supabase
        .from('problems')
        .insert(problemData)
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccessMessage('Problem created successfully!');

      // Clear form or redirect
      setTimeout(() => {
        window.location.href = '/idea-grader';
      }, 2000);
    } catch (err) {
      console.error('Error creating problem:', err);
      setError('Failed to create problem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Problem</h1>
        <p className="text-gray-600 mb-6">
          Add a new algorithm problem to the learning system.
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-full">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Problem Details</h2>
            <p className="text-sm text-gray-500">
              Fill in the details below to create a new algorithm problem.
            </p>
          </div>
        </div>

        <ProblemForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </Card>
    </div>
  );
};

export default ProblemCreator;