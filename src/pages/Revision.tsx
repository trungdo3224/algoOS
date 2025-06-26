import React from 'react';
import { Brain, Clock, AlertTriangle, Repeat, TrendingDown, Target, BookOpen, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import RevisionSuggestion from '../components/revision/RevisionSuggestion';
import Button from '../components/ui/Button';
import { useRevisionHistory, useUserSubmissions, useUserInsights } from '../hooks/useSupabase';
import { useAppSelector } from '../hooks/reduxHooks';

const Revision: React.FC = () => {
  const { revisions, loading: revisionsLoading } = useRevisionHistory();
  const { submissions, loading: submissionsLoading } = useUserSubmissions();
  const { insights, loading: insightsLoading } = useUserInsights();
  const { problems, stats } = useAppSelector(state => state.problems);
  
  const handleStartRevision = async (id: string) => {
    // Navigate to SSA coaching with the selected problem
    window.location.href = `/ssa-coaching?problem=${id}`;
  };

  if (revisionsLoading || submissionsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate intelligent revision suggestions based on dashboard data
  const calculateRevisionPriority = () => {
    const revisionCandidates = [];

    // 1. Problems with low scores (< 6)
    const lowScoreProblems = problems.filter(p => {
      const relatedSubmissions = submissions?.filter(s => s.problem_id === p.problem_id) || [];
      const avgScore = relatedSubmissions.reduce((sum, s) => sum + (s.grader_score || 0), 0) / (relatedSubmissions.length || 1);
      return avgScore < 6 && relatedSubmissions.length > 0;
    });

    lowScoreProblems.forEach(problem => {
      const relatedSubmissions = submissions?.filter(s => s.problem_id === problem.problem_id) || [];
      const avgScore = relatedSubmissions.reduce((sum, s) => sum + (s.grader_score || 0), 0) / relatedSubmissions.length;
      
      revisionCandidates.push({
        problem,
        priority: 'high',
        reason: 'Low average score',
        score: avgScore,
        attempts: relatedSubmissions.length,
        lastAttempt: new Date(relatedSubmissions[0]?.submitted_at || Date.now()),
        weakAreas: ['Problem understanding', 'Solution approach'],
        revisionType: 'low_score' as const
      });
    });

    // 2. Problems in weak pattern areas
    const weakPatterns = insights?.filter(i => i.avg_score < 6).map(i => i.tag) || [];
    const patternWeakProblems = problems.filter(p => 
      p.tags.some(tag => weakPatterns.includes(tag)) && 
      !lowScoreProblems.some(lp => lp.problem_id === p.problem_id)
    );

    patternWeakProblems.forEach(problem => {
      const weakTags = problem.tags.filter(tag => weakPatterns.includes(tag));
      const relatedSubmissions = submissions?.filter(s => s.problem_id === problem.problem_id) || [];
      const avgScore = relatedSubmissions.length > 0 
        ? relatedSubmissions.reduce((sum, s) => sum + (s.grader_score || 0), 0) / relatedSubmissions.length 
        : 5;

      revisionCandidates.push({
        problem,
        priority: 'medium',
        reason: `Weak in patterns: ${weakTags.join(', ')}`,
        score: avgScore,
        attempts: relatedSubmissions.length,
        lastAttempt: relatedSubmissions.length > 0 
          ? new Date(relatedSubmissions[0].submitted_at) 
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        weakAreas: weakTags,
        revisionType: 'pattern_weakness' as const
      });
    });

    // 3. Problems not attempted in a while (> 14 days)
    const oldProblems = problems.filter(p => {
      const relatedSubmissions = submissions?.filter(s => s.problem_id === p.problem_id) || [];
      if (relatedSubmissions.length === 0) return false;
      
      const lastSubmission = relatedSubmissions[0];
      const daysSince = (Date.now() - new Date(lastSubmission.submitted_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 14 && !revisionCandidates.some(rc => rc.problem.problem_id === p.problem_id);
    });

    oldProblems.forEach(problem => {
      const relatedSubmissions = submissions?.filter(s => s.problem_id === problem.problem_id) || [];
      const avgScore = relatedSubmissions.reduce((sum, s) => sum + (s.grader_score || 0), 0) / relatedSubmissions.length;
      const daysSince = (Date.now() - new Date(relatedSubmissions[0].submitted_at).getTime()) / (1000 * 60 * 60 * 24);

      revisionCandidates.push({
        problem,
        priority: 'low',
        reason: `Not practiced for ${Math.floor(daysSince)} days`,
        score: avgScore,
        attempts: relatedSubmissions.length,
        lastAttempt: new Date(relatedSubmissions[0].submitted_at),
        weakAreas: ['Memory retention', 'Pattern recall'],
        revisionType: 'time_elapsed' as const
      });
    });

    // 4. Problems with multiple attempts but still low scores
    const multipleAttemptProblems = problems.filter(p => {
      const relatedSubmissions = submissions?.filter(s => s.problem_id === p.problem_id) || [];
      const avgScore = relatedSubmissions.reduce((sum, s) => sum + (s.grader_score || 0), 0) / (relatedSubmissions.length || 1);
      return relatedSubmissions.length > 2 && avgScore < 7 && 
             !revisionCandidates.some(rc => rc.problem.problem_id === p.problem_id);
    });

    multipleAttemptProblems.forEach(problem => {
      const relatedSubmissions = submissions?.filter(s => s.problem_id === problem.problem_id) || [];
      const avgScore = relatedSubmissions.reduce((sum, s) => sum + (s.grader_score || 0), 0) / relatedSubmissions.length;

      revisionCandidates.push({
        problem,
        priority: 'medium',
        reason: `${relatedSubmissions.length} attempts with low scores`,
        score: avgScore,
        attempts: relatedSubmissions.length,
        lastAttempt: new Date(relatedSubmissions[0].submitted_at),
        weakAreas: ['Consistent application', 'Deep understanding'],
        revisionType: 'multiple_attempts' as const
      });
    });

    // Sort by priority and score
    return revisionCandidates.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.score - b.score; // Lower scores first
    });
  };

  const revisionSuggestions = calculateRevisionPriority();

  // Calculate statistics from dashboard data
  const lowScoreCount = revisionSuggestions.filter(r => r.revisionType === 'low_score').length;
  const patternWeaknessCount = revisionSuggestions.filter(r => r.revisionType === 'pattern_weakness').length;
  const needReviewCount = revisionSuggestions.filter(r => r.revisionType === 'time_elapsed').length;
  const multipleAttemptsCount = revisionSuggestions.filter(r => r.revisionType === 'multiple_attempts').length;

  // Calculate overall revision metrics
  const totalProblemsNeedingRevision = revisionSuggestions.length;
  const averageRevisionScore = revisionSuggestions.length > 0 
    ? revisionSuggestions.reduce((sum, r) => sum + r.score, 0) / revisionSuggestions.length 
    : 0;
  const highPriorityCount = revisionSuggestions.filter(r => r.priority === 'high').length;
  const weakestPatterns = insights?.filter(i => i.avg_score < 6).slice(0, 3).map(i => i.tag) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Intelligent Revision</h1>
        <p className="text-gray-600 mb-8">
          AI-powered revision suggestions based on your performance data, learning patterns, and skill gaps.
        </p>
      </div>
      
      {/* Revision Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90 font-medium">Low Score Problems</p>
              <h3 className="text-2xl font-bold">{lowScoreCount}</h3>
              <p className="text-xs text-white text-opacity-75 mt-1">Avg: {averageRevisionScore.toFixed(1)}/10</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90 font-medium">Pattern Weaknesses</p>
              <h3 className="text-2xl font-bold">{patternWeaknessCount}</h3>
              <p className="text-xs text-white text-opacity-75 mt-1">{weakestPatterns.slice(0, 2).join(', ')}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90 font-medium">Need Review</p>
              <h3 className="text-2xl font-bold">{needReviewCount}</h3>
              <p className="text-xs text-white text-opacity-75 mt-1">Not practiced recently</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">
              <Repeat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-90 font-medium">Multiple Attempts</p>
              <h3 className="text-2xl font-bold">{multipleAttemptsCount}</h3>
              <p className="text-xs text-white text-opacity-75 mt-1">Still struggling</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revision Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="📊 Revision Analytics">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Total Problems Needing Revision</h4>
                <p className="text-sm text-blue-700">Based on performance analysis</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalProblemsNeedingRevision}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-900">High Priority Items</h4>
                <p className="text-sm text-red-700">Require immediate attention</p>
              </div>
              <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Potential Score Improvement</h4>
                <p className="text-sm text-green-700">With focused revision</p>
              </div>
              <div className="text-2xl font-bold text-green-600">+{(10 - averageRevisionScore).toFixed(1)}</div>
            </div>
          </div>
        </Card>

        <Card title="🎯 Smart Learning Path">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Recommended Focus Areas</h4>
              <div className="space-y-2">
                {weakestPatterns.slice(0, 3).map((pattern, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm text-purple-800">{pattern}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Study Strategy</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Start with high-priority problems</li>
                <li>• Focus on pattern recognition</li>
                <li>• Use SSA coaching for guidance</li>
                <li>• Review after 3-7 days</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">Expected Timeline</h4>
              <p className="text-sm text-amber-800">
                Complete revision in {Math.ceil(totalProblemsNeedingRevision / 3)} sessions
                ({Math.ceil(totalProblemsNeedingRevision / 3 * 2)} hours estimated)
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Personalized Learning Path */}
      <Card title="🧠 Personalized Learning Path">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">AI-Powered Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-blue-900">Pattern Mastery</h4>
              <p className="text-sm text-blue-700">Focus on {weakestPatterns[0] || 'core patterns'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-green-900">Score Improvement</h4>
              <p className="text-sm text-green-700">Target +2.5 points average</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-purple-900">Knowledge Gaps</h4>
              <p className="text-sm text-purple-700">Fill {patternWeaknessCount} weak areas</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Revision Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended Problems</h2>
          <div className="text-sm text-gray-500">
            Sorted by priority and impact potential
          </div>
        </div>

        {revisionSuggestions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Great Job!</h3>
              <p className="text-gray-600 mb-4">
                No problems need revision right now. Your performance is consistent across all areas.
              </p>
              <Button
                onClick={() => window.location.href = '/ssa-coaching'}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Practice New Problems
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {revisionSuggestions.map((suggestion, index) => (
              <RevisionSuggestion
                key={`${suggestion.problem.problem_id}-${index}`}
                problemTitle={suggestion.problem.title}
                category={suggestion.problem.tags[0] || 'General'}
                weakAreas={suggestion.weakAreas}
                lastAttemptDate={suggestion.lastAttempt}
                score={suggestion.score}
                attempts={suggestion.attempts}
                revisionReason={{
                  type: suggestion.revisionType,
                  description: suggestion.reason
                }}
                onStart={() => handleStartRevision(suggestion.problem.problem_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <Card title="💡 Revision Tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Effective Revision Strategy</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Start with high-priority problems to maximize impact
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Use SSA coaching for guided problem-solving
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Focus on understanding patterns, not memorizing solutions
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Review problems after 3-7 days for better retention
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Spaced Repetition</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Day 1: Initial revision session
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Day 3: Quick review and practice
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Day 7: Comprehensive re-attempt
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Day 21: Final mastery check
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Revision;