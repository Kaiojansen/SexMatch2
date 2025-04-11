import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface MatchCardProps {
  match: any;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!match?.id) return;

    const matchRef = doc(db, 'matches', match.id);
    const unsubscribe = onSnapshot(matchRef, (doc) => {
      if (doc.exists()) {
        const matchData = doc.data();
        setIsDone(matchData.done || false);
      }
    });

    return () => unsubscribe();
  }, [match?.id]);

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        position: 'relative',
        height: 200,
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
        },
        overflow: 'hidden'
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={match.imageUrl}
        alt={match.title}
        sx={{
          objectFit: 'cover',
          filter: isDone ? 'brightness(0.7)' : 'none'
        }}
      />
      {isDone && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontFamily: 'Staatliches, cursive',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              transform: 'rotate(-15deg)'
            }}
          >
            FEITO
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          padding: '16px',
          zIndex: 2
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontFamily: 'Staatliches, cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {match.title}
        </Typography>
      </Box>
    </Card>
  );
};

export default MatchCard; 