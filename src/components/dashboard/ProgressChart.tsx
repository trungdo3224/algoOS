import React from 'react';

interface ProgressChartProps {
  data: {
    category: string;
    score: number;
    previousScore?: number;
  }[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const maxScore = Math.max(...data.map(item => Math.max(item.score, item.previousScore || 0)));
  const chartHeight = 200;
  const barWidth = 40;
  const spacing = 20;
  const totalWidth = data.length * (barWidth + spacing) - spacing;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit\" style={{ width: `${totalWidth + 40}px` }}>
        <div className="flex items-end h-52 mb-4 pl-2">
          {data.map((item, index) => {
            const height = (item.score / maxScore) * chartHeight;
            const prevHeight = item.previousScore 
              ? (item.previousScore / maxScore) * chartHeight 
              : 0;
            
            const improvement = item.previousScore 
              ? ((item.score - item.previousScore) / item.previousScore) * 100 
              : 0;
            
            const isPositive = improvement > 0;
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center mr-5 relative"
                style={{ width: barWidth }}
              >
                {item.previousScore && (
                  <div 
                    className="absolute w-full bg-gray-200 rounded-t"
                    style={{ 
                      height: `${prevHeight}px`,
                      bottom: 0,
                      opacity: 0.5
                    }}
                  ></div>
                )}
                <div 
                  className="w-full bg-blue-500 rounded-t relative"
                  style={{ height: `${height}px` }}
                >
                  {item.previousScore && (
                    <div 
                      className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium ${
                        isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isPositive ? '+' : ''}{improvement.toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                  {item.category}
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between px-2">
          <span className="text-sm text-gray-500">Previous Score</span>
          <span className="text-sm text-gray-500">Current Score</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;