import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
  hoverable = false,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm 
        ${hoverable ? 'transition-shadow hover:shadow-md' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;