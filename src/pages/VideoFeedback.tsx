import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import VideoFeedback from '../components/video-feedback/VideoFeedback';
import { useAppSelector } from '../hooks/reduxHooks';
import { useVideoFeedback } from '../hooks/useSupabase';

const VideoFeedbackPage: React.FC = () => {
  const { name: userName } = useAppSelector((state) => state.user);
  const { feedback, loading, error } = useVideoFeedback();

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
        Error loading video feedback: {error}
      </div>
    );
  }

  const currentFeedback = feedback?.[0];
  const previousFeedbacks = feedback?.slice(1) || [];
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Video Feedback</h1>
        <p className="text-gray-600 mb-6">
          Watch personalized coaching videos with feedback on your problem-solving approaches.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {currentFeedback && (
          <div className="lg:col-span-2">
            <VideoFeedback
              userName={userName || ''}
              problemTitle={currentFeedback.problems.title}
              score={currentFeedback.submissions.grader_score}
              feedback={{
                strengths: [
                  'Good understanding of the problem',
                  'Clear solution approach',
                  'Efficient implementation'
                ],
                improvements: [
                  currentFeedback.submissions.grader_feedback || 'Consider edge cases',
                  'Optimize space complexity',
                  'Add detailed comments'
                ],
                nextSteps: [
                  currentFeedback.submissions.grader_suggestion || 'Practice similar problems',
                  'Review optimization techniques',
                  'Study related patterns'
                ]
              }}
              timestamp={new Date(currentFeedback.generated_at)}
            />
          </div>
        )}
        
        <div className="lg:col-span-1">
          <Card title="Previous Feedback">
            <div className="space-y-4">
              {previousFeedbacks.map((feedback) => (
                <div 
                  key={feedback.feedback_id} 
                  className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 w-20 h-12 bg-gray-200 rounded overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg"
                      alt={feedback.problems.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{feedback.problems.title}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(new Date(feedback.generated_at))}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoFeedbackPage;