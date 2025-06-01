import React, { useState, useEffect } from 'react';
import { Brain, Clock, BookOpen, BarChart2, Trophy, Timer, Repeat, Target } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import DifficultyDistribution from '../components/dashboard/DifficultyDistribution';
import TagDistribution from '../components/dashboard/TagDistribution';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import StudySessionCard from '../components/dashboard/StudySessionCard';
import { useUserSubmissions, useUserInsights } from '../hooks/useSupabase';

const Dashboard: React.FC = () => {
  const { submissions, loading: submissionsLoading } = useUserSubmissions();
  const { insights, loading: insightsLoading } = useUserInsights();
  
  // Calculate difficulty stats from submissions
  const difficultyStats = {
    easy: submissions?.filter(s => s.problems.difficulty === 'Easy').length || 0,
    medium: submissions?.filter(s => s.problems.difficulty === 'Medium').length || 0,
    hard: submissions?.filter(s => s.problems.difficulty === 'Hard').length || 0
  };

  // Calculate tag stats from submissions
  const tagStats = submissions?.reduce((acc: { name: string; count: number }[], submission) => {
    submission.problems.tags.forEach((tag: string) => {
      const existing = acc.find(t => t.name === tag);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: tag, count: 1 });
      }
    });
    return acc;
  }, []) || [];

  // Calculate activity data
  const activities = submissions?.reduce((acc: any[], submission) => {
    const date = new Date(submission.submitted_at).toISOString().split('T')[0];
    const existing = acc.find(a => a.date === date);
    
    if (existing) {
      existing.problemsSolved++;
      existing.averageScore = (existing.averageScore * (existing.problemsSolved - 1) + submission.grader_score) / existing.problemsSolved;
      existing.timeSpent += 30; // Assuming average 30 minutes per problem
    } else {
      acc.push({
        date,
        problemsSolved: 1,
        averageScore: submission.grader_score || 0,
        timeSpent: 30
      });
    }
    
    return acc;
  }, []) || [];

  // Calculate progress data from insights
  const progressData = insights?.map(insight => ({
    category: insight.tag,
    score: insight.avg_score,
    previousScore: insight.avg_score - (Math.random() * 2) // For demonstration, replace with real historical data
  })) || [];

  if (submissionsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate overall stats
  const totalProblems = submissions?.length || 0;
  const averageScore = submissions?.reduce((sum, s) => sum + (s.grader_score || 0), 0) / totalProblems || 0;
  const totalTime = submissions?.length * 30 || 0; // Assuming 30 minutes per problem
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
            value={`${averageScore.toFixed(1)}/10`}
            icon={Brain}
            trend={{ value: 12, isPositive: true }}
            className="from-blue-500 to-blue-600"
          />
          
          <StatCard
            title="Problems Solved"
            value={totalProblems}
            icon={BookOpen}
            trend={{ value: 8, isPositive: true }}
            className="from-purple-500 to-purple-600"
          />
          
          <StatCard
            title="Study Time"
            value={`${Math.floor(totalTime / 60)} hr ${totalTime % 60} min`}
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
            title="Total Time"
            value={`${Math.floor(totalTime / 60)} hr ${totalTime % 60} min`}
            icon={Timer}
            className="from-indigo-500 to-indigo-600"
            breakdown={{
              easy: `${Math.floor((difficultyStats.easy * 30) / 60)} hr ${(difficultyStats.easy * 30) % 60} min`,
              medium: `${Math.floor((difficultyStats.medium * 30) / 60)} hr ${(difficultyStats.medium * 30) % 60} min`,
              hard: `${Math.floor((difficultyStats.hard * 30) / 60)} hr ${(difficultyStats.hard * 30) % 60} min`
            }}
          />
          
          <StatCard
            title="Average Time/Problem"
            value="30 min"
            icon={Target}
            className="from-pink-500 to-pink-600"
            breakdown={{
              easy: "25 min",
              medium: "30 min",
              hard: "45 min"
            }}
          />
          
          <StatCard
            title="Average Attempts"
            value={(totalProblems / (new Set(submissions?.map(s => s.problem_id)).size || 1)).toFixed(1)}
            icon={Repeat}
            className="from-teal-500 to-teal-600"
            breakdown={{
              easy: (difficultyStats.easy / (new Set(submissions?.filter(s => s.problems.difficulty === 'Easy').map(s => s.problem_id)).size || 1)).toFixed(1),
              medium: (difficultyStats.medium / (new Set(submissions?.filter(s => s.problems.difficulty === 'Medium').map(s => s.problem_id)).size || 1)).toFixed(1),
              hard: (difficultyStats.hard / (new Set(submissions?.filter(s => s.problems.difficulty === 'Hard').map(s => s.problem_id)).size || 1)).toFixed(1)
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ProgressChart data={progressData} />
        <DifficultyDistribution stats={difficultyStats} />
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
            duration={30}
            problemsSolved={1}
            averageScore={submission.grader_score || 0}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;