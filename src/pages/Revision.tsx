import React from 'react';
import { Brain, Clock, AlertTriangle, Repeat } from 'lucide-react';
import Card from '../components/ui/Card';
import RevisionSuggestion from '../components/revision/RevisionSuggestion';
import { useRevisionHistory } from '../hooks/useSupabase';

const Revision: React.FC = () => {
  const { revisions, loading, error } = useRevisionHistory();
  
  const handleStartRevision = async (id: string) => {
    // Navigate to SSA coaching with the selected problem
    window.location.href = `/ssa-coaching?problem=${id}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading revision data: {error}
      </div>
    );
  }

  // Calculate statistics
  const lowScoreCount = revisions?.filter(r => r.last_score < 6).length || 0;
  const patternWeaknessCount = revisions?.filter(r => r.reason?.includes('pattern')).length || 0;
  const needReviewCount = revisions?.filter(r => {
    const daysSinceLastAttempt = Math.floor((Date.now() - new Date(r.last_attempt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastAttempt > 7;
  }).length || 0;
  const multipleAttemptsCount = revisions?.filter(r => r.times_attempted > 1).length || 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Intelligent Revision</h1>
        <p className="text-gray-600 mb-6">
          Personalized revision suggestions based on your performance data and learning patterns.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90">Low Score Problems</p>
              <h3 className="text-2xl font-bold">{lowScoreCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90">Pattern Weaknesses</p>
              <h3 className="text-2xl font-bold">{patternWeaknessCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90">Need Review</p>
              <h3 className="text-2xl font-bold">{needReviewCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <Repeat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90">Multiple Attempts</p>
              <h3 className="text-2xl font-bold">{multipleAttemptsCount}</h3>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="Suggested Learning Path">
        <div className="p-4 bg-blue-50 rounded-md mb-6">
          <h3 className="text-md font-medium text-blue-800 mb-2">Personalized Recommendations</h3>
          <p className="text-sm text-blue-700">
            Based on your learning data, we've identified these problems that need attention. 
            Focus on these to strengthen your understanding and improve your problem-solving skills.
          </p>
        </div>
      </Card>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Problems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {revisions?.map((revision) => (
            <RevisionSuggestion
              key={revision.revision_id}
              problemTitle={revision.problems.title}
              category={revision.problems.tags[0]}
              weakAreas={[revision.reason]}
              lastAttemptDate={new Date(revision.last_attempt)}
              score={revision.last_score}
              attempts={revision.times_attempted}
              revisionReason={{
                type: revision.last_score < 6 ? 'low_score' :
                      revision.reason?.includes('pattern') ? 'pattern_weakness' :
                      revision.times_attempted > 1 ? 'multiple_attempts' : 'time_elapsed',
                description: revision.reason
              }}
              onStart={() => handleStartRevision(revision.problem_id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Revision;