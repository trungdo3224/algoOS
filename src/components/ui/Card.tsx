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
        bg-white rounded-xl border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] 
        ${hoverable ? 'transition-all duration-200 hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 bg-zinc-50/70 border-t border-zinc-100 rounded-b-xl text-xs text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;