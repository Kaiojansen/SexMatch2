import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import MatchDialog from '../components/MatchDialog';

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('users', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMatches(matchesList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMatchClick = (match: any) => {
    setSelectedMatch(match);
  };

  const handleCloseDialog = () => {
    setSelectedMatch(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontFamily: 'Staatliches, cursive',
        textAlign: 'center',
        color: '#ff4081',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        mb: 4
      }}>
        Seus Matches
      </Typography>
      
      {matches.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum match ainda. Continue explorando!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match.id}>
              <MatchCard 
                match={match} 
                onClick={() => handleMatchClick(match)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <MatchDialog
        open={!!selectedMatch}
        onClose={handleCloseDialog}
        match={selectedMatch}
        currentUser={currentUser}
      />
    </Container>
  );
};

export default Matches; 