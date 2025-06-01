import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import IdeaSubmissionForm from '../components/idea-grader/IdeaSubmissionForm';
import GradingResult from '../components/idea-grader/GradingResult';
import ProblemSelector from '../components/ssa-coaching/ProblemSelector';
import Button from '../components/ui/Button';
import { useAppSelector } from '../hooks/reduxHooks';
import { supabase } from '../lib/supabase';
import type { Problem } from '../lib/supabase';

const IdeaGrader: React.FC = () => {
  const { id: userId } = useAppSelector((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProblemSelectorOpen, setIsProblemSelectorOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    patternRecognition: {
      identifiedPattern: string;
      isCorrectPattern: boolean;
      patternFeedback: string;
    };
    efficiencyAnalysis: {
      complexity: string;
      isOptimal: boolean;
      efficiencyFeedback: string;
    };
    logicalFlow: {
      isClear: boolean;
      flowFeedback: string;
    };
    overallScore: number;
    scoreMax: number;
    summary: string;
    improvementSuggestion: string;
  } | null>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

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

  const handleSubmitIdea = async (idea: string) => {
    if (!userId || !selectedProblem) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      // Create submission in database
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: userId,
          problem_id: selectedProblem.problem_id,
          idea: idea,
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // For now, we'll use a simple scoring algorithm
      // In production, this would be replaced with a real AI grading system
      const score = Math.min(Math.floor(Math.random() * 4) + 7, 10); // Random score between 7-10

      // Update submission with grading results
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          grader_score: score,
          grader_feedback: 'Your solution demonstrates good understanding of the problem.',
          grader_suggestion: 'Consider optimizing the space complexity further.'
        })
        .eq('submission_id', submission.submission_id);

      if (updateError) throw updateError;

      setResult({
        patternRecognition: {
          identifiedPattern: "Dynamic Programming",
          isCorrectPattern: true,
          patternFeedback: "You correctly identified the optimal solution pattern."
        },
        efficiencyAnalysis: {
          complexity: "O(n)",
          isOptimal: true,
          efficiencyFeedback: "Your solution achieves optimal time complexity."
        },
        logicalFlow: {
          isClear: true,
          flowFeedback: "Your approach is well-structured and clearly explained."
        },
        overallScore: score,
        scoreMax: 10,
        summary: "Excellent approach with good optimization considerations.",
        improvementSuggestion: "Consider edge cases and error handling in your implementation."
      });
    } catch (error) {
      console.error('Error submitting idea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsProblemSelectorOpen(false);
    setResult(null);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Idea Grader</h1>
          <p className="text-gray-600">
            Submit your algorithm ideas and receive instant feedback on your approach.
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
        <Card>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedProblem.title}</h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {selectedProblem.difficulty}
                </span>
                {selectedProblem.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 mb-4">{selectedProblem.description}</p>
          </div>
        </Card>
      )}

      <Card title="Submit Your Algorithm Idea">
        <p className="text-gray-600 mb-4">
          Describe your approach to solving this problem. Focus on your algorithm design, data structures, and any optimizations.
        </p>
        <IdeaSubmissionForm onSubmit={handleSubmitIdea} isLoading={isSubmitting} />
      </Card>

      {result && <GradingResult {...result} />}

      <ProblemSelector
        isOpen={isProblemSelectorOpen}
        onClose={() => setIsProblemSelectorOpen(false)}
        onSelectProblem={handleSelectProblem}
        onAddNewProblem={handleAddNewProblem}
      />
    </div>
  );
};

export default IdeaGrader;