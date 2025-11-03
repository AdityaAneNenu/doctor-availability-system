/**
 * Page Transition Wrapper
 * Provides smooth transitions between pages
 */

'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="animate-fadeInUp">
      {children}
    </div>
  );
}

// Add custom animation to Tailwind config
// animate-fadeInUp: 'fadeInUp 0.5s ease-out'
