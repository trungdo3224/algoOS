import React, { useState } from 'react';
import { Brain, TrendingUp, Clock, Target } from 'lucide-react';
import Card from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import ScoreTrend from '../components/insights/ScoreTrend';
import PatternAnalysis from '../components/insights/PatternAnalysis';
import WeaknessSummary from '../components/insights/WeaknessSummary';
import StudyHeatmap from '../components/insights/StudyHeatmap';
import { useUserInsights, useUserSubmissions } from '../hooks/useSupabase';

const Insights: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');
  const { insights, loading: insightsLoading } = useUserInsights();
  const { submissions, loading: submissionsLoading } = useUserSubmissions();

  if (insightsLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate score trend data
  const scoreTrendData = submissions?.map(submission => ({
    date: new Date(submission.submitted_at).toISOString(),
    score: submission.grader_score || 0,
    problemCount: 1
  })) || [];

  // Calculate pattern analysis data
  const patternData = insights?.map(insight => ({
    name: insight.tag,
    score: insight.avg_score,
    problemCount: submissions?.filter(s => s.problems.tags.includes(insight.tag)).length || 0,
    trend: Math.random() * 20 - 10 // Mock trend data
  })) || [];

  // Calculate weakness data
  const weaknessData = {
    patterns: insights?.filter(i => i.avg_score < 6).map(i => i.tag) || [],
    concepts: ['Time Complexity Analysis', 'Space Optimization'],
    recommendations: [
      'Practice more problems in your weak areas',
      'Review fundamental concepts',
      'Focus on pattern recognition'
    ]
  };

  // Calculate study data
  const studyData = submissions?.map(submission => ({
    date: new Date(submission.submitted_at).toISOString(),
    minutes: 30, // Assuming average 30 minutes per problem
    problems: 1
  })) || [];

  // Calculate statistics
  const averageScore = insights?.reduce((sum, i) => sum + i.avg_score, 0) / (insights?.length || 1);
  const patternMastery = (insights?.filter(i => i.avg_score >= 7).length || 0) / (insights?.length || 1) * 100;
  const streak = calculateStreak(submissions || []);
  const goalsMet = Math.floor((averageScore / 10) * 10);

  function calculateStreak(submissions: any[]): number {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = new Set(submissions.map(s => 
      new Date(s.submitted_at).toISOString().split('T')[0]
    ));
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dates.has(dateStr)) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }
    
    return streak;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Learning Insights</h1>
        <p className="text-gray-600 mb-6">
          Detailed analytics of your learning progress and problem-solving patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Average Score"
          value={`${averageScore.toFixed(1)}/10`}
          icon={Brain}
          trend={{ value: 15, isPositive: true }}
          className="from-blue-500 to-blue-600"
        />
        
        <StatCard
          title="Pattern Mastery"
          value={`${patternMastery.toFixed(0)}%`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          className="from-purple-500 to-purple-600"
        />
        
        <StatCard
          title="Study Streak"
          value={`${streak} days`}
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
          className="from-green-500 to-green-600"
        />
        
        <StatCard
          title="Goals Met"
          value={`${goalsMet}/10`}
          icon={Target}
          trend={{ value: 5, isPositive: true }}
          className="from-amber-500 to-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreTrend
          data={scoreTrendData}
          period={timePeriod}
          onPeriodChange={setTimePeriod}
        />
        <PatternAnalysis data={patternData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeaknessSummary data={weaknessData} />
        <StudyHeatmap data={studyData} />
      </div>

      <Card title="Personalized Recommendations">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Focus Areas</h3>
            <p className="text-sm text-blue-700">
              Based on your recent performance, we recommend focusing on {weaknessData.patterns.join(', ')}.
              Your scores in these areas show potential for significant improvement.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Study Patterns</h3>
            <p className="text-sm text-green-700">
              Your learning is most effective during morning sessions. Consider scheduling more
              practice during these peak performance hours.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Next Steps</h3>
            <p className="text-sm text-purple-700">
              Try tackling more medium-difficulty problems in your weaker areas. This will help
              build confidence and improve problem-solving patterns.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Insights;