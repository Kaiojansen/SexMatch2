import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

const PartnerRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [pendingPartner, setPendingPartner] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      const checkPartnerRequest = async () => {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.pendingPartner) {
            setPendingPartner(data.pendingPartner);
            // Fetch partner's name
            const partnerDoc = doc(db, 'users', data.pendingPartner);
            const partnerSnap = await getDoc(partnerDoc);
            if (partnerSnap.exists()) {
              setPartnerName(partnerSnap.data().displayName || 'Unknown User');
            }
          }
        }
      };

      checkPartnerRequest();
    }
  }, [currentUser]);

  const handleAccept = async () => {
    if (!currentUser || !pendingPartner) return;

    const userDoc = doc(db, 'users', currentUser.uid);
    const partnerDoc = doc(db, 'users', pendingPartner);

    await updateDoc(userDoc, {
      partnerId: pendingPartner,
      pendingPartner: null,
    });

    await updateDoc(partnerDoc, {
      partnerId: currentUser.uid,
      pendingPartner: null,
    });

    navigate('/dashboard');
  };

  const handleReject = async () => {
    if (!currentUser || !pendingPartner) return;

    const userDoc = doc(db, 'users', currentUser.uid);
    await updateDoc(userDoc, {
      pendingPartner: null,
    });

    navigate('/dashboard');
  };

  if (!pendingPartner) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">
            No pending partner requests
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Partner Request
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {partnerName} wants to be your partner!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAccept}
                fullWidth
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleReject}
                fullWidth
              >
                Reject
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PartnerRequest; 