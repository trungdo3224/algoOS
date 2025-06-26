import React, { useState } from 'react';
import { Brain, Clock, BookOpen, BarChart2, Trophy, Timer, Repeat, Target, TrendingUp } from 'lucide-react';
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
import Card from '../components/ui/Card';
import { useUserSubmissions, useUserInsights } from '../hooks/useSupabase';
import { useAppSelector } from '../hooks/reduxHooks';

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
    problem.tags.forEach(tag => {
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
  const activities = submissions?.reduce((acc: any[], submission) => {
    const date = new Date(submission.submitted_at).toISOString().split('T')[0];
    const existing = acc.find(a => a.date === date);
    
    if (existing) {
      existing.problemsSolved++;
      existing.averageScore = (existing.averageScore * (existing.problemsSolved - 1) + submission.grader_score) / existing.problemsSolved;
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

  // Calculate insights statistics
  const averageScore = insights?.reduce((sum, i) => sum + i.avg_score, 0) / (insights?.length || 1);
  const patternMastery = (insights?.filter(i => i.avg_score >= 7).length || 0) / (insights?.length || 1) * 100;
  const goalsMet = Math.floor((averageScore / 10) * 10);

  if (submissionsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate streak from activities
  const streak = calculateStreak(activities);

  function calculateStreak(activities: any[]): number {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < activities.length; i++) {
      if (activities[i].date === today || isConsecutiveDay(activities[i].date, activities[i-1]?.date)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function isConsecutiveDay(current: string, previous?: string): boolean {
    if (!previous) return false;
    const currentDate = new Date(current);
    const previousDate = new Date(previous);
    const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Comprehensive overview of your learning progress, insights, and performance analytics.
        </p>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Overall Score"
            value={`${averageScore.toFixed(1)}/10`}
            icon={Brain}
            trend={{ value: 12, isPositive: true }}
            className="from-blue-500 to-blue-600"
          />
          
          <StatCard
            title="Problems Solved"
            value={problems.length}
            icon={BookOpen}
            trend={{ value: 8, isPositive: true }}
            className="from-purple-500 to-purple-600"
          />
          
          <StatCard
            title="Pattern Mastery"
            value={`${patternMastery.toFixed(0)}%`}
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
            className="from-green-500 to-green-600"
          />
          
          <StatCard
            title="Current Streak"
            value={`${streak} days`}
            icon={Trophy}
            trend={{ value: 2, isPositive: true }}
            className="from-amber-500 to-amber-600"
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Average Time"
            value={`${Math.floor(stats.averageTimePerProblem)} min`}
            icon={Timer}
            className="from-indigo-500 to-indigo-600"
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
            className="from-pink-500 to-pink-600"
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
            className="from-teal-500 to-teal-600"
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScoreTrend
            data={scoreTrendData}
            period={timePeriod}
            onPeriodChange={setTimePeriod}
          />
          <PatternAnalysis data={patternData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeaknessSummary data={weaknessData} />
          <StudyHeatmap data={studyData} />
        </div>
      </div>

      {/* Problem Statistics Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Problem Statistics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProgressChart data={progressData} />
          <DifficultyDistribution stats={difficultyStats} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatusBarChart data={statusStats} />
          <StatusPieChart data={statusStats} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivityCalendar activities={activities} />
          <TagDistribution tags={tagStats} />
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Recommendations</h2>
        <Card>
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Focus Areas</h3>
              <p className="text-blue-700">
                Based on your recent performance, we recommend focusing on {weaknessData.patterns.join(', ')}.
                Your scores in these areas show potential for significant improvement.
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-3">Study Patterns</h3>
              <p className="text-green-700">
                Your learning is most effective during morning sessions. Consider scheduling more
                practice during these peak performance hours.
              </p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-medium text-purple-800 mb-3">Next Steps</h3>
              <p className="text-purple-700">
                Try tackling more medium-difficulty problems in your weaker areas. This will help
                build confidence and improve problem-solving patterns.
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Study Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Study Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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