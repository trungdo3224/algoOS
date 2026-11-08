import React, { useState } from 'react';
import { Brain, Clock, BookOpen, Trophy, Timer, Target, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import DifficultyDistribution from '../components/dashboard/DifficultyDistribution';
import TagDistribution from '../components/dashboard/TagDistribution';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import StudySessionCard from '../components/dashboard/StudySessionCard';
import StatusBarChart from '../components/dashboard/StatusBarChart';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import ScoreTrend from '../components/insights/ScoreTrend';
import PatternAnalysis from '../components/insights/PatternAnalysis';
import WeaknessSummary from '../components/insights/WeaknessSummary';
import StudyHeatmap from '../components/insights/StudyHeatmap';
import { useUserSubmissions, useUserInsights } from '../hooks/useSupabase';
import { useAppSelector } from '../hooks/reduxHooks';

interface ActivityRecord {
  date: string;
  problemsSolved: number;
  averageScore: number;
  timeSpent: number;
}

const Dashboard: React.FC = () => {
  const { submissions, loading: submissionsLoading } = useUserSubmissions();
  const { insights, loading: insightsLoading } = useUserInsights();
  const { problems, stats } = useAppSelector(state => state.problems);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Calculate status stats from problems
  const statusStats = problems.reduce((acc: { status: string; count: number }[], problem) => {
    if (problem.status) {
      const existing = acc.find(s => s.status === problem.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: problem.status, count: 1 });
      }
    }
    return acc;
  }, []);

  // Calculate difficulty stats from problems
  const difficultyStats = {
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length
  };

  // Calculate tag stats from problems
  const tagStats = problems.reduce((acc: { name: string; count: number }[], problem) => {
    (problem.tags || []).forEach(tag => {
      const existing = acc.find(t => t.name === tag);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: tag, count: 1 });
      }
    });
    return acc;
  }, []);

  // Calculate activity data
  const activities: ActivityRecord[] = submissions?.reduce((acc: ActivityRecord[], submission) => {
    const date = new Date(submission.submitted_at).toISOString().split('T')[0];
    const existing = acc.find(a => a.date === date);
    
    if (existing) {
      existing.problemsSolved++;
      existing.averageScore = (existing.averageScore * (existing.problemsSolved - 1) + (submission.grader_score || 0)) / existing.problemsSolved;
      existing.timeSpent += stats.averageTimePerProblem;
    } else {
      acc.push({
        date,
        problemsSolved: 1,
        averageScore: submission.grader_score || 0,
        timeSpent: stats.averageTimePerProblem
      });
    }
    
    return acc;
  }, []) || [];

  // Calculate progress data from insights
  const progressData = insights?.map(insight => ({
    category: insight.tag,
    score: insight.avg_score,
    previousScore: insight.avg_score - (Math.random() * 2) // For demonstration
  })) || [];

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
    problemCount: submissions?.filter(s => s.problems?.tags?.includes(insight.tag)).length || 0,
    trend: 0
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

  // Calculate insights statistics
  const averageScore = insights?.reduce((sum, i) => sum + i.avg_score, 0) / (insights?.length || 1);
  const patternMastery = (insights?.filter(i => i.avg_score >= 7).length || 0) / (insights?.length || 1) * 100;
  const _goalsMet = Math.floor((averageScore / 10) * 10);

  // Calculate real trend data
  const calculateTrend = (currentValue: number, historicalData: any[], valueExtractor: (item: any) => number, daysBack: number = 30) => {
    if (!historicalData || historicalData.length < 2) return undefined;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const recentData = historicalData.filter(item => {
      const itemDate = new Date(item.submitted_at || item.updated_at || item.created_at);
      return itemDate >= cutoffDate;
    });
    
    const olderData = historicalData.filter(item => {
      const itemDate = new Date(item.submitted_at || item.updated_at || item.created_at);
      return itemDate < cutoffDate;
    });
    
    if (recentData.length === 0 || olderData.length === 0) return undefined;
    
    const recentAvg = recentData.reduce((sum, item) => sum + valueExtractor(item), 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, item) => sum + valueExtractor(item), 0) / olderData.length;
    
    if (olderAvg === 0) return undefined;
    
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange > 0
    };
  };

  // Calculate specific trends
  const scoreTrend = calculateTrend(
    averageScore,
    submissions || [],
    (submission) => submission.grader_score || 0
  );

  const problemsSolvedTrend = (() => {
    if (!submissions || submissions.length < 2) return undefined;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProblems = submissions.filter(s => new Date(s.submitted_at) >= thirtyDaysAgo).length;
    const olderProblems = submissions.filter(s => new Date(s.submitted_at) < thirtyDaysAgo).length;
    
    if (olderProblems === 0) return undefined;
    
    const percentChange = ((recentProblems - olderProblems) / olderProblems) * 100;
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange > 0
    };
  })();

  const patternMasteryTrend = (() => {
    if (!insights || insights.length < 2) return undefined;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentInsights = insights.filter(i => new Date(i.updated_at) >= thirtyDaysAgo);
    const olderInsights = insights.filter(i => new Date(i.updated_at) < thirtyDaysAgo);
    
    if (recentInsights.length === 0 || olderInsights.length === 0) return undefined;
    
    const recentMastery = (recentInsights.filter(i => i.avg_score >= 7).length / recentInsights.length) * 100;
    const olderMastery = (olderInsights.filter(i => i.avg_score >= 7).length / olderInsights.length) * 100;
    
    if (olderMastery === 0) return undefined;
    
    const percentChange = ((recentMastery - olderMastery) / olderMastery) * 100;
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange > 0
    };
  })();

  const streakTrend = (() => {
    if (!activities || activities.length < 7) return undefined;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = activities.filter(a => new Date(a.date) >= sevenDaysAgo).length;
    const previousWeekActivity = activities.filter(a => {
      const activityDate = new Date(a.date);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      return activityDate >= fourteenDaysAgo && activityDate < sevenDaysAgo;
    }).length;
    
    if (previousWeekActivity === 0) return undefined;
    
    const percentChange = ((recentActivity - previousWeekActivity) / previousWeekActivity) * 100;
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange > 0
    };
  })();

  if (submissionsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate streak from activities
  const streak = calculateStreak(activities);

  function calculateStreak(activitiesList: any[]): number {
    if (!activitiesList || activitiesList.length === 0) return 0;

    const uniqueDates = Array.from(new Set(activitiesList.map(a => a.date)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentDate = new Date(uniqueDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);

    const isToday = mostRecentDate.getTime() === today.getTime();
    const isYesterday = mostRecentDate.getTime() === yesterday.getTime();

    if (!isToday && !isYesterday) {
      return 0;
    }

    let streakCount = 1;
    const expectedDate = new Date(mostRecentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      currentDate.setHours(0, 0, 0, 0);

      if (currentDate.getTime() === expectedDate.getTime()) {
        streakCount++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streakCount;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Engineering Dashboard</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time algorithmic mastery analytics, session cadence, and adaptive diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 shadow-sm text-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Core Performance KPIs</h2>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Overall Score"
            value={`${averageScore.toFixed(1)}/10`}
            icon={Brain}
            trend={scoreTrend}
          />
          
          <StatCard
            title="Problems Solved"
            value={problems.length}
            icon={BookOpen}
            trend={problemsSolvedTrend}
          />
          
          <StatCard
            title="Pattern Mastery"
            value={`${patternMastery.toFixed(0)}%`}
            icon={TrendingUp}
            trend={patternMasteryTrend}
          />
          
          <StatCard
            title="Current Streak"
            value={`${streak} days`}
            icon={Trophy}
            trend={streakTrend}
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Average Time"
            value={`${Math.floor(stats.averageTimePerProblem)} min`}
            icon={Timer}
            breakdown={{
              easy: `${Math.floor(stats.averageTimePerProblem * 0.8)} min`,
              medium: `${Math.floor(stats.averageTimePerProblem)} min`,
              hard: `${Math.floor(stats.averageTimePerProblem * 1.2)} min`
            }}
          />
          
          <StatCard
            title="Average Attempts"
            value={stats.averageAttemptsPerProblem.toFixed(1)}
            icon={Target}
            breakdown={{
              easy: (stats.averageAttemptsPerProblem * 0.8).toFixed(1),
              medium: stats.averageAttemptsPerProblem.toFixed(1),
              hard: (stats.averageAttemptsPerProblem * 1.2).toFixed(1)
            }}
          />
          
          <StatCard
            title="Total Time"
            value={`${Math.floor(stats.totalTimeTaken / 60)} hr`}
            icon={Clock}
            breakdown={{
              easy: `${Math.floor(stats.totalTimeTaken * 0.3 / 60)} hr`,
              medium: `${Math.floor(stats.totalTimeTaken * 0.4 / 60)} hr`,
              hard: `${Math.floor(stats.totalTimeTaken * 0.3 / 60)} hr`
            }}
          />
        </div>
      </div>
      
      {/* Performance Analytics Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Adaptive Diagnostics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ScoreTrend
            data={scoreTrendData}
            period={timePeriod}
            onPeriodChange={setTimePeriod}
          />
          <PatternAnalysis data={patternData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <WeaknessSummary data={weaknessData} />
          <StudyHeatmap data={studyData} />
        </div>
      </div>

      {/* Problem Statistics Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Curriculum Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ProgressChart data={progressData} />
          <DifficultyDistribution stats={difficultyStats} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <StatusBarChart data={statusStats} />
          <StatusPieChart data={statusStats} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ActivityCalendar activities={activities} />
          <TagDistribution tags={tagStats} />
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Personalized Strategic Takeaways</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/70 flex items-center justify-center font-semibold">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Priority Focus</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Based on your recent performance, prioritize {weaknessData.patterns.length > 0 ? weaknessData.patterns.join(', ') : 'Sliding Window & Hash Tables'}. Strengthening these patterns will yield the highest rating gains.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/70 flex items-center justify-center font-semibold">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Cognitive Cadence</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Your problem-solving clarity peaks during morning practice blocks. Consider scheduling deliberate practice before tackling complex Hard problems.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/70 flex items-center justify-center font-semibold">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">Recommended Action</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Try solving 2 medium problems using the SSA Coaching mode to validate each phase before code implementation.
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Study Sessions */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Recent Study Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions?.slice(0, 3).map((submission, index) => (
            <StudySessionCard
              key={index}
              date={new Date(submission.submitted_at)}
              duration={stats.averageTimePerProblem}
              problemsSolved={1}
              averageScore={submission.grader_score || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;