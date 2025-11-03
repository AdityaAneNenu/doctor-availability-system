/**
 * Empty State Component
 * Shows helpful messages when there's no data to display
 */

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-6">
        {/* Animated background circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full animate-pulse" />
        
        {/* Icon */}
        <div className="relative bg-white dark:bg-gray-900 rounded-full p-6 border-4 border-white dark:border-gray-900 shadow-lg">
          <Icon className="h-16 w-16 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={action.label}
            >
              {action.label}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={secondaryAction.label}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact variant for smaller spaces
interface EmptyStateCompactProps {
  icon: LucideIcon;
  message: string;
}

export function EmptyStateCompact({ icon: Icon, message }: EmptyStateCompactProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4" role="status">
      <Icon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" strokeWidth={1.5} />
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{message}</p>
    </div>
  );
}
