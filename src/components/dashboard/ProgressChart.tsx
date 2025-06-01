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
      <div className="min-w-fit" style={{ width: `${Math.max(500, totalWidth + 40)}px` }}>
        <div className="flex items-end h-52 mb-4 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 inset-y-0 w-12 flex flex-col justify-between text-sm text-gray-500 -ml-14">
            <span>10</span>
            <span>7.5</span>
            <span>5.0</span>
            <span>2.5</span>
            <span>0</span>
          </div>

          {/* Chart bars */}
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
                className="flex flex-col items-center mr-5 relative group"
                style={{ width: barWidth }}
              >
                {/* Previous score bar */}
                {item.previousScore && (
                  <div 
                    className="absolute w-full bg-gray-200 rounded-t transition-all duration-300 group-hover:bg-gray-300"
                    style={{ 
                      height: `${prevHeight}px`,
                      bottom: 0,
                      opacity: 0.5
                    }}
                  >
                    <div className="absolute -top-6 w-full text-center">
                      <span className="text-xs text-gray-500">{item.previousScore.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* Current score bar */}
                <div 
                  className="w-full bg-blue-500 rounded-t relative transition-all duration-300 group-hover:bg-blue-600"
                  style={{ height: `${height}px` }}
                >
                  <div className="absolute -top-6 w-full text-center">
                    <span className="text-xs font-medium text-gray-700">{item.score.toFixed(1)}</span>
                  </div>
                  {item.previousScore && (
                    <div 
                      className={`absolute -right-12 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium ${
                        isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isPositive ? '+' : ''}{improvement.toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Category label */}
                <div className="mt-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                  {item.category}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center border-t border-gray-200 pt-4 px-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200"></div>
            <span className="text-sm text-gray-600">Previous Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500"></div>
            <span className="text-sm text-gray-600">Current Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;