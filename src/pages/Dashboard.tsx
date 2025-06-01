import React from 'react';
import { Brain, Clock, BookOpen, BarChart2, Trophy, Timer, Repeat, Target } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import DifficultyDistribution from '../components/dashboard/DifficultyDistribution';
import TagDistribution from '../components/dashboard/TagDistribution';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import StudySessionCard from '../components/dashboard/StudySessionCard';
import StatusBarChart from '../components/dashboard/StatusBarChart';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import { useUserSubmissions, useUserInsights } from '../hooks/useSupabase';
import { useAppSelector } from '../hooks/reduxHooks';

const Dashboard: React.FC = () => {
  const { submissions, loading: submissionsLoading } = useUserSubmissions();
  const { insights, loading: insightsLoading } = useUserInsights();
  const { problems, stats } = useAppSelector(state => state.problems);
  
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Learning Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatCard
            title="Overall Score"
            value={`${(stats.averageTimePerProblem / 60).toFixed(1)} hr/problem`}
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
            title="Total Time"
            value={`${Math.floor(stats.totalTimeTaken / 60)} hr ${stats.totalTimeTaken % 60} min`}
            icon={Clock}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
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
            title="Total Attempts"
            value={stats.totalAttempts}
            icon={Repeat}
            className="from-teal-500 to-teal-600"
            breakdown={{
              easy: Math.floor(stats.totalAttempts * 0.3).toString(),
              medium: Math.floor(stats.totalAttempts * 0.4).toString(),
              hard: Math.floor(stats.totalAttempts * 0.3).toString()
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ProgressChart data={progressData} />
        <DifficultyDistribution stats={difficultyStats} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <StatusBarChart data={statusStats} />
        <StatusPieChart data={statusStats} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ActivityCalendar activities={activities} />
        <TagDistribution tags={tagStats} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
  );
};

export default Dashboard;