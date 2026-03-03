import React from 'react';
import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0, duration = 0.5, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
