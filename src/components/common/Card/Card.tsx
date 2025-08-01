import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  padding = 'md',
  border = true,
  shadow = true,
  className,
  children,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-lg',
        border && 'border border-gray-200',
        shadow && 'shadow-sm',
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className={clsx('border-b border-gray-200', paddingClasses[padding], 'pb-4')}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className={clsx((title || subtitle || actions) ? 'pt-4' : '', paddingClasses[padding])}>
        {children}
      </div>
    </div>
  );
};