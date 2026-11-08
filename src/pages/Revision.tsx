import React from 'react';
import { Brain, Clock, AlertTriangle, Repeat, TrendingDown, Target, BookOpen, ArrowRight, Trophy } from 'lucide-react';
import Card from '../components/ui/Card';
import RevisionSuggestion from '../components/revision/RevisionSuggestion';
import Button from '../components/ui/Button';
import { useRevisionHistory, useUserSubmissions, useUserInsights } from '../hooks/useSupabase';
import { useAppSelector } from '../hooks/reduxHooks';

const Revision: React.FC = () => {
  const { loading: revisionsLoading } = useRevisionHistory();
  const { submissions, loading: submissionsLoading } = useUserSubmissions();
  const { insights, loading: insightsLoading } = useUserInsights();
  const { problems } = useAppSelector(state => state.problems);
  
  const handleStartRevision = async (id: string) => {
    // Persist selected problem ID so SSA coaching will load it immediately
    localStorage.setItem('ssa-selected-problem-id', id);
    // Navigate to SSA coaching with the selected problem
    window.location.href = `/ssa-coaching?problem=${id}`;
  };

  if (revisionsLoading || submissionsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-zinc-500">Synthesizing revision metrics...</span>
        </div>
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
      (p.tags || []).some(tag => weakPatterns.includes(tag)) && 
      !lowScoreProblems.some(lp => lp.problem_id === p.problem_id)
    );

    patternWeakProblems.forEach(problem => {
      const weakTags = (problem.tags || []).filter(tag => weakPatterns.includes(tag));
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-200 rounded">
            Spaced Repetition Engine
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-xs text-zinc-500 font-mono">
            {totalProblemsNeedingRevision} queued items
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          Intelligent Revision
        </h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
          Adaptive spaced review schedule prioritized by score volatility, historical retention curves, and algorithmic pattern gaps.
        </p>
      </div>
      
      {/* Revision Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Low Score Problems</span>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-900 tabular-nums">
              {lowScoreCount}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Avg score: {averageRevisionScore.toFixed(1)}/10
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Pattern Weaknesses</span>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-900 tabular-nums">
              {patternWeaknessCount}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
              {weakestPatterns.length > 0 ? weakestPatterns.slice(0, 2).join(', ') : 'None detected'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Need Review</span>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-900 tabular-nums">
              {needReviewCount}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Interval threshold (&gt;14d)
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Multiple Attempts</span>
            <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-700">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-900 tabular-nums">
              {multipleAttemptsCount}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              High-friction challenges
            </p>
          </div>
        </div>
      </div>

      {/* Revision Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revision Diagnostics">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-zinc-50/70 border border-zinc-200/70 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Total Problems In Queue</h4>
                <p className="text-xs text-zinc-500">Synthesized from submission performance</p>
              </div>
              <div className="text-xl font-bold font-mono text-zinc-900 tabular-nums">
                {totalProblemsNeedingRevision}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-rose-50/40 border border-rose-200/60 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-rose-950">High Priority Action Items</h4>
                <p className="text-xs text-rose-700">Require immediate concept reinforcement</p>
              </div>
              <div className="text-xl font-bold font-mono text-rose-600 tabular-nums">
                {highPriorityCount}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-200/60 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-emerald-950">Potential Rating Headroom</h4>
                <p className="text-xs text-emerald-700">Estimated gain with targeted revision cycle</p>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
                +{(10 - averageRevisionScore).toFixed(1)}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Smart Learning Plan">
          <div className="space-y-3.5">
            <div className="p-3.5 bg-zinc-50/70 border border-zinc-200/70 rounded-lg">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Priority Concept Tracks
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {weakestPatterns.length > 0 ? (
                  weakestPatterns.slice(0, 3).map((pattern, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center text-xs font-mono font-medium px-2 py-0.5 rounded bg-white border border-zinc-200/80 text-zinc-800"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                      {pattern}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">No weak patterns identified</span>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50/70 border border-zinc-200/70 rounded-lg">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Execution Protocol
              </h4>
              <ul className="text-xs text-zinc-600 space-y-1 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-zinc-400">01.</span> Tackle High-priority items first
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-400">02.</span> Focus on pattern recognition &amp; invariants
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-400">03.</span> Utilize SSA coaching for structured hints
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-400">04.</span> Retest after 3–7 day retention cooldown
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-100/70 border border-zinc-200/70 rounded-lg">
              <span className="text-xs font-medium text-zinc-600">Expected Cycle Duration:</span>
              <span className="text-xs font-mono font-semibold text-zinc-900">
                {Math.ceil(totalProblemsNeedingRevision / 3)} sessions (~{Math.ceil(totalProblemsNeedingRevision / 3 * 2)}h)
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Personalized Learning Path */}
      <Card title="Curated Objectives">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
              <Brain className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">Pattern Mastery</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Reinforce invariants in {weakestPatterns[0] || 'core algorithm paradigms'}.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
              <Target className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">Score Improvement</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Elevate average problem evaluation score to &gt;8.0 across all categories.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
              <BookOpen className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">Knowledge Gaps</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Address {patternWeaknessCount} identified weakness areas systematically.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Revision Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Recommended Problems</h2>
            <p className="text-xs text-zinc-500">Ordered by priority weight and impact potential</p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {revisionSuggestions.length} items
          </span>
        </div>

        {revisionSuggestions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-700">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">Queue Clear</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                No problems currently meet the threshold for revision. Your retention across active patterns is stable.
              </p>
              <Button
                onClick={() => window.location.href = '/ssa-coaching'}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                size="sm"
              >
                Practice New Problems
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <Card title="Retention Guidelines">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Effective Revision Routine</h4>
            <ul className="space-y-1.5 text-zinc-600 font-mono">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                <span>Start with high-priority items to prevent memory decay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                <span>Use Socratic coaching rather than memorizing template code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                <span>Formulate the invariant before coding the solution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1 flex-shrink-0" />
                <span>Review problems after 3–7 days for optimal consolidation</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Spaced Repetition Schedule</h4>
            <div className="space-y-1.5 font-mono text-zinc-600">
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 border border-zinc-100">
                <span className="font-medium text-zinc-900">Day 1</span>
                <span>Initial discovery &amp; coaching</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 border border-zinc-100">
                <span className="font-medium text-zinc-900">Day 3</span>
                <span>Quick recall &amp; edge case check</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 border border-zinc-100">
                <span className="font-medium text-zinc-900">Day 7</span>
                <span>Full re-attempt under time limit</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-zinc-50 border border-zinc-100">
                <span className="font-medium text-zinc-900">Day 21</span>
                <span>Final mastery check &amp; variation</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Revision;