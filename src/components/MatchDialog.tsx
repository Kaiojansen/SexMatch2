import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, IconButton } from '@mui/material';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface MatchDialogProps {
  open: boolean;
  onClose: () => void;
  match: any;
  currentUser: any;
}

const MatchDialog: React.FC<MatchDialogProps> = ({ open, onClose, match, currentUser }) => {
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleMarkAsDone = async () => {
    if (!match?.id) return;
    setIsLoading(true);
    try {
      const matchRef = doc(db, 'matches', match.id);
      await updateDoc(matchRef, {
        done: !isDone,
        doneBy: !isDone ? currentUser.uid : null,
        doneAt: !isDone ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error marking match as done:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h4" component="div" sx={{ 
          fontFamily: 'Staatliches, cursive',
          textAlign: 'center',
          color: '#ff4081',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Match!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2,
          p: 2
        }}>
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            height: 300,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
              zIndex: 1
            }
          }}>
            <img 
              src={match?.imageUrl} 
              alt={match?.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {isDone && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}>
                <Typography variant="h4" sx={{
                  color: 'white',
                  fontFamily: 'Staatliches, cursive',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  transform: 'rotate(-15deg)'
                }}>
                  FEITO
                </Typography>
              </Box>
            )}
            <Box sx={{ 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              zIndex: 2
            }}>
              <Typography variant="h5" sx={{ 
                color: 'white',
                fontFamily: 'Staatliches, cursive',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                {match?.title}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2
          }}>
            <IconButton 
              onClick={handleMarkAsDone}
              disabled={isLoading}
              sx={{
                color: isDone ? '#4caf50' : 'inherit',
                '&:hover': {
                  color: '#4caf50'
                }
              }}
            >
              {isDone ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
            </IconButton>
            <Typography>
              {isDone ? 'Marcado como feito' : 'Marcar como feito'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchDialog; 