import React, { useEffect, useState } from 'react';
import { Video, Clock, Brain, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import { generateVideoFeedback } from '../../services/tavus';

interface VideoFeedbackProps {
  userName: string;
  problemTitle: string;
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  timestamp: Date;
}

const VideoFeedback: React.FC<VideoFeedbackProps> = ({
  userName,
  problemTitle,
  score,
  feedback,
  timestamp,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateVideo = async () => {
      try {
        const url = await generateVideoFeedback({
          user_name: userName,
          problem_title: problemTitle,
          score,
          feedback: feedback.improvements.join('. '),
          suggestion: feedback.nextSteps[0]
        });
        setVideoUrl(url);
      } catch (err) {
        setError('Failed to generate video feedback. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    generateVideo();
  }, [userName, problemTitle, score, feedback]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Personalized Feedback for {userName}
            </h2>
            <p className="text-sm text-gray-500">
              {problemTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">{formatDate(timestamp)}</span>
        </div>
      </div>

      <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden mb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            {error}
          </div>
        ) : (
          <video
            className="w-full h-full object-contain"
            controls
            src={videoUrl || undefined}
            poster="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-green-600 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="h-4 w-4 mr-2 mt-0.5 rounded-full bg-green-100 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-amber-600 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((improvement, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="h-4 w-4 mr-2 mt-0.5 rounded-full bg-amber-100 flex-shrink-0" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-blue-600 flex items-center">
            <Video className="h-4 w-4 mr-2" />
            Next Steps
          </h3>
          <ul className="space-y-2">
            {feedback.nextSteps.map((step, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="h-4 w-4 mr-2 mt-0.5 rounded-full bg-blue-100 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default VideoFeedback;