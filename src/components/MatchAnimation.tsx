import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface MatchAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const MatchAnimation: React.FC<MatchAnimationProps> = ({ isVisible, onComplete }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
          }}
        >
          {/* Coração pulsante */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ 
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: "easeOut"
            }}
            onAnimationComplete={onComplete}
          >
            <FavoriteIcon 
              sx={{ 
                fontSize: '120px',
                color: '#ff4b6e',
                filter: 'drop-shadow(0 0 20px rgba(255,75,110,0.8))'
              }} 
            />
          </motion.div>

          {/* Texto "MATCH!" */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Stabillo", sans-serif',
                fontSize: '4rem',
                color: '#fff',
                textShadow: '0 0 20px rgba(255,255,255,0.5)',
                marginTop: '20px'
              }}
            >
              MATCH!
            </Typography>
          </motion.div>

          {/* Partículas de confete */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#ff4b6e' : '#fff',
                }}
                initial={{ 
                  x: '50%',
                  y: '50%',
                  scale: 0
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default MatchAnimation; 