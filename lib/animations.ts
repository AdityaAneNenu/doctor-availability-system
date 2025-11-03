/**
 * Animation variants for Framer Motion
 * Provides consistent animations across the app
 */

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const slideInFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

export const cardHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};
