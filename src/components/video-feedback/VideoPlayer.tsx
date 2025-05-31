import React from 'react';
import { Download, Share2 } from 'lucide-react';
import Button from '../ui/Button';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  date: Date;
  onDownload: () => void;
  onShare: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  date,
  onDownload,
  onShare,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-900">
        <video
          className="w-full h-full object-contain"
          controls
          poster="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Recorded on {formatDate(date)}</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              leftIcon={<Share2 className="h-4 w-4" />}
            >
              Share
            </Button>
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <h4>Coach's Notes:</h4>
          <p>
            In this personalized feedback video, I review your approach to the sorting algorithm problem. 
            I highlight your creative thinking in the time complexity analysis, but suggest areas 
            where you could optimize the space complexity further.
          </p>
          <p>
            Pay special attention to the discussion on edge cases around 2:45. This is a common 
            area where many developers miss important considerations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;