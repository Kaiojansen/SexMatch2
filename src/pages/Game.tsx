import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  collection, 
  query, 
  getDocs, 
  where, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Badge,
  Collapse,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { motion, AnimatePresence } from 'framer-motion';

interface CardData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

interface Match {
  cardId: string;
  timestamp: any;
}

const GameContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
  color: '#fff',
});

const StyledCard = styled(motion.div)({
  position: 'relative',
  width: '100%',
  maxWidth: '400px',
  height: '500px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  cursor: 'grab',
  userSelect: 'none',
  touchAction: 'none',
  backgroundColor: 'white',
  '&:active': {
    cursor: 'grabbing',
  },
});

const CardImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
});

const CardOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
  color: '#fff',
  textAlign: 'left',
});

const ActionButton = styled(IconButton)({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '2px solid',
  margin: '0 10px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

const MatchesButton = styled(Button)({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  borderRadius: '50%',
  width: '60px',
  height: '60px',
  minWidth: 'unset',
  padding: 0,
  background: 'linear-gradient(45deg, #FF3366 30%, #FF9933 90%)',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF3366 60%, #FF9933 90%)',
  },
});

const MatchesPanel = styled(Box)({
  position: 'fixed',
  bottom: '90px',
  right: '20px',
  width: '300px',
  maxHeight: '400px',
  overflowY: 'auto',
  background: 'rgba(0, 0, 0, 0.9)',
  borderRadius: '16px',
  padding: '20px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
});

const Game: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedCard, setMatchedCard] = useState<CardData | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [newMatchCount, setNewMatchCount] = useState(0);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setPartnerId(userDoc.data().partnerId);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchCards = async () => {
      const cardsCollection = collection(db, 'cards');
      const cardsSnapshot = await getDocs(cardsCollection);
      const fetchedCards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CardData[];
      setCards(fetchedCards);
    };

    fetchCards();
  }, []);

  useEffect(() => {
    if (!currentUser || !partnerId) return;

    // Escutar por novos matches
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('users', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMatches: Match[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.users.includes(partnerId)) {
          newMatches.push({
            cardId: data.cardId,
            timestamp: data.timestamp
          });
        }
      });
      setMatches(newMatches);
      setNewMatchCount(newMatches.length);
    });

    return () => unsubscribe();
  }, [currentUser, partnerId]);

  const handleDrag = (event: any, info: any) => {
    setTranslateX(info.offset.x);
    setRotate(info.offset.x * 0.1);
  };

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      await handleLike();
    } else if (info.offset.x < -swipeThreshold) {
      handleDislike();
    }
    
    setTranslateX(0);
    setRotate(0);
  };

  const handleLike = async () => {
    if (!currentUser || !partnerId || currentCardIndex >= cards.length) return;

    const currentCard = cards[currentCardIndex];
    
    try {
      // Criar ou atualizar o documento de likes para o card atual
      const likeRef = doc(db, 'likes', `${currentCard.id}_${currentUser.uid}`);
      await setDoc(likeRef, {
        userId: currentUser.uid,
        cardId: currentCard.id,
        timestamp: serverTimestamp()
      });

      // Verificar se o parceiro também deu like
      const partnerLikeRef = doc(db, 'likes', `${currentCard.id}_${partnerId}`);
      const partnerLikeDoc = await getDoc(partnerLikeRef);

      if (partnerLikeDoc.exists()) {
        // É um match! Criar documento de match
        const matchRef = doc(db, 'matches', `${currentCard.id}_${currentUser.uid}_${partnerId}`);
        await setDoc(matchRef, {
          cardId: currentCard.id,
          users: [currentUser.uid, partnerId],
          timestamp: serverTimestamp()
        });

        setMatchedCard(currentCard);
        setShowMatchDialog(true);
      }

      // Avançar para o próximo card
      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDislike = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  const dragConstraints = {
    left: 0,
    right: 0,
  };

  return (
    <GameContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          position: 'relative',
          minHeight: '80vh',
        }}
      >
        <AnimatePresence mode="wait">
          {currentCardIndex < cards.length ? (
            <StyledCard
              key={cards[currentCardIndex].id}
              drag="x"
              dragConstraints={dragConstraints}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: translateX < 0 ? -200 : 200 }}
              style={{
                x: translateX,
                rotate: rotate,
              }}
            >
              <CardImage src={cards[currentCardIndex].image} alt={cards[currentCardIndex].title} />
              <CardOverlay>
                <Typography variant="h5" gutterBottom>
                  {cards[currentCardIndex].title}
                </Typography>
                <Typography variant="body1">
                  {cards[currentCardIndex].description}
                </Typography>
              </CardOverlay>
            </StyledCard>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '500px',
                textAlign: 'center',
                padding: '20px',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Você viu todas as cartas por enquanto!
              </Typography>
              <Typography variant="body1">
                Volte mais tarde para descobrir novas experiências com seu parceiro.
              </Typography>
            </Box>
          )}
        </AnimatePresence>

        {currentCardIndex < cards.length && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            <ActionButton
              onClick={() => handleDislike()}
              sx={{ borderColor: '#FF3366' }}
            >
              <CloseIcon sx={{ color: '#FF3366' }} />
            </ActionButton>
            <ActionButton
              onClick={() => handleLike()}
              sx={{ borderColor: '#33FF99' }}
            >
              <FavoriteIcon sx={{ color: '#33FF99' }} />
            </ActionButton>
          </Box>
        )}

        <Badge badgeContent={newMatchCount} color="secondary">
          <MatchesButton
            onClick={() => {
              setShowMatches(!showMatches);
              setNewMatchCount(0);
            }}
          >
            {showMatches ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </MatchesButton>
        </Badge>

        <Collapse in={showMatches}>
          <MatchesPanel>
            <Typography variant="h6" gutterBottom>
              Seus Matches
            </Typography>
            {matches.length > 0 ? (
              matches.map((match, index) => {
                const matchedCard = cards.find(card => card.id === match.cardId);
                return matchedCard ? (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 2,
                      padding: 1,
                      borderRadius: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <img
                      src={matchedCard.image}
                      alt={matchedCard.title}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 8,
                        marginRight: 10,
                        objectFit: 'cover',
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {matchedCard.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(match.timestamp?.toDate()).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ) : null;
              })
            ) : (
              <Typography variant="body2">
                Ainda não há matches. Continue explorando!
              </Typography>
            )}
          </MatchesPanel>
        </Collapse>
      </Box>

      <Dialog
        open={showMatchDialog}
        onClose={() => setShowMatchDialog(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(33,33,33,0.9) 100%)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '400px',
            width: '90%',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>
          <LocalFireDepartmentIcon sx={{ fontSize: 40, color: '#FF3366' }} />
          <Typography variant="h5">É um Match!</Typography>
        </DialogTitle>
        <DialogContent>
          {matchedCard && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={matchedCard.image}
                alt={matchedCard.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              />
              <Typography variant="h6" sx={{ color: '#fff', marginBottom: 1 }}>
                {matchedCard.title}
              </Typography>
              <Typography variant="body1" sx={{ color: '#ccc' }}>
                Você e seu parceiro combinaram nesta experiência!
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowMatchDialog(false)}
                sx={{
                  marginTop: 3,
                  background: 'linear-gradient(45deg, #FF3366 30%, #FF9933 90%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF3366 60%, #FF9933 90%)',
                  },
                }}
              >
                Continuar Explorando
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </GameContainer>
  );
};

export default Game; 