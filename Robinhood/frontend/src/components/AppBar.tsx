import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * AppBar Component
 * 
 * This component renders the top application bar with a title, subtitle, and current time.
 * It uses Framer Motion for animations and React hooks for state management.
 */
const AppBar: React.FC = () => {
  // State to hold the current time
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Set up an interval to update the time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      style={styles.appBar}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={styles.leftSection}>
        <motion.h1 
          style={styles.title}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🚀 Simple Robinhood Clone
        </motion.h1>
        <p style={styles.subtitle}>Your Gateway to Smart Investing</p>
      </div>
      <div style={styles.rightSection}>
        <p style={styles.time}>{currentTime.toLocaleTimeString()}</p>
        <motion.span 
          style={styles.icon}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          💹
        </motion.span>
      </div>
    </motion.div>
  );
};

// Styles object for the AppBar component
const styles = {
  appBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'linear-gradient(45deg, #FFFDD0 0%, #F5E6D3 100%)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    color: '#4A4A4A',
    animation: 'gradientAnimation 15s ease infinite',
    backgroundSize: '400% 400%',
  } as React.CSSProperties,
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginRight: '1rem',
    cursor: 'pointer',
  },
  subtitle: {
    fontSize: '0.875rem',
  },
  time: {
    fontSize: '0.875rem',
    marginRight: '1rem',
  },
  icon: {
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
};

// Define the keyframes for the gradient animation
const gradientKeyframes = `
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Add the keyframes to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = gradientKeyframes;
  document.head.appendChild(styleElement);
}

export default AppBar;