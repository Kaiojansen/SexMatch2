import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, getDocs, arrayUnion, arrayRemove, onSnapshot, where, writeBatch } from 'firebase/firestore';
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
  LinearProgress,
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

const StyledContainer = styled(Container)({
  background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(40,0,0,0.95) 100%)',
  minHeight: '100vh',
  position: 'relative',
  padding: 0,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(https://source.unsplash.com/1920x1080/?dark,pattern)',
    opacity: 0.1,
    zIndex: 0,
    pointerEvents: 'none',
  }
});

const CardWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  height: '600px',
  position: 'relative',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    height: '80vh',
    maxWidth: '100%',
    margin: '0 16px'
  }
}));

const StyledCard = styled(motion(Card))(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'absolute',
  borderRadius: '20px',
  background: 'rgba(20, 20, 20, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 75, 110, 0.2)',
  cursor: 'grab',
  overflow: 'hidden',
  '&:active': {
    cursor: 'grabbing'
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '15px',
  }
}));

const CardImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  filter: 'brightness(0.8)',
  transition: 'all 0.3s ease',
});

const CardOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
  padding: '80px 24px 24px',
  color: 'white',
});

const ActionButtons = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '5%',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(4),
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    bottom: '3%',
    gap: theme.spacing(3),
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(5px)',
  border: '2px solid',
  padding: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  '&.like': {
    borderColor: '#ff4b6e',
    '&:hover': {
      backgroundColor: 'rgba(255, 75, 110, 0.2)',
    }
  },
  '&.dislike': {
    borderColor: '#666',
    '&:hover': {
      backgroundColor: 'rgba(102, 102, 102, 0.2)',
    }
  },
  [theme.breakpoints.down('sm')]: {
    padding: '15px',
  }
}));

const SwipeIndicator = styled(Box)<{ direction: 'left' | 'right' }>(({ direction }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  ...(direction === 'left' ? { left: '20px' } : { right: '20px' }),
  padding: '8px 16px',
  borderRadius: '8px',
  background: direction === 'left' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)',
  color: 'white',
  fontWeight: 'bold',
  opacity: 0,
  zIndex: 10,
}));

const MatchesButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(5px)',
  border: '2px solid #ff4b6e',
  padding: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 75, 110, 0.2)',
  },
  zIndex: 1000,
}));

const MatchesPanel = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '80px',
  right: '20px',
  width: '300px',
  maxHeight: 'calc(100vh - 100px)',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 75, 110, 0.3)',
  padding: theme.spacing(2),
  overflowY: 'auto',
  zIndex: 999,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}));

const MatchCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: 'rgba(255, 75, 110, 0.1)',
  border: '1px solid rgba(255, 75, 110, 0.3)',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    borderColor: '#ff4b6e',
  },
}));

const Game: React.FC = () => {
  const { currentUser } = useAuth();
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedCard, setMatchedCard] = useState<CardData | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState<CardData[]>([]);
  const [newMatch, setNewMatch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser || !partnerId) {
      navigate('/dashboard');
      return;
    }

    const fetchCards = async () => {
      try {
        setIsLoading(true);
        const cardsRef = collection(db, 'cards');
        const q = query(cardsRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedCards = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CardData[];

        // Embaralhar as cartas
        const shuffledCards = fetchedCards.sort(() => Math.random() - 0.5);
        setCards(shuffledCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
        setError('Erro ao carregar as cartas. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [currentUser, partnerId, navigate]);

  // Melhorar o monitoramento de matches
  useEffect(() => {
    if (!currentUser || !partnerId) return;

    const userDoc = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDoc, async (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        if (userData.matches) {
          try {
            // Buscar apenas as cartas que são matches
            const matchesRef = collection(db, 'cards');
            const matchesQuery = query(matchesRef, where('id', 'in', userData.matches));
            const matchesSnapshot = await getDocs(matchesQuery);
            
            const matchedCards = matchesSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() })) as CardData[];
            
            setMatches(matchedCards);
            
            // Verificar se há um novo match
            if (userData.recentMatch) {
              const matchedCard = matchedCards.find(card => card.id === userData.recentMatch);
              if (matchedCard) {
                setNewMatch(true);
                setMatchedCard(matchedCard);
                setShowMatchDialog(true);
                
                // Limpar o recentMatch após mostrar o diálogo
                setTimeout(async () => {
                  await updateDoc(userDoc, { recentMatch: null });
                }, 1000);
              }
            }
          } catch (error) {
            console.error('Erro ao buscar matches:', error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, partnerId]);

  useEffect(() => {
    const updateDragConstraints = () => {
      setDragConstraints({
        left: -window.innerWidth / 2,
        right: window.innerWidth / 2,
      });
    };

    window.addEventListener('resize', updateDragConstraints);
    updateDragConstraints();

    return () => window.removeEventListener('resize', updateDragConstraints);
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentUser || !cards[currentCardIndex] || !partnerId) return;

    const cardId = cards[currentCardIndex].id;
    const userDoc = doc(db, 'users', currentUser.uid);
    const partnerDoc = doc(db, 'users', partnerId);

    try {
      // Desabilitar interação durante o processamento
      setIsProcessing(true);

      if (direction === 'right') {
        // Verificar se já curtiu antes
        const userData = await getDoc(userDoc);
        if (userData.exists() && userData.data().likes?.includes(cardId)) {
          setIsProcessing(false);
          return;
        }

        // Adicionar aos likes
        await updateDoc(userDoc, {
          likes: arrayUnion(cardId)
        });

        // Verificar se o parceiro também curtiu
        const partnerData = await getDoc(partnerDoc);
        if (partnerData.exists() && partnerData.data().likes?.includes(cardId)) {
          // É um match!
          const batch = writeBatch(db);
          
          // Atualizar usuário atual
          batch.update(userDoc, {
            matches: arrayUnion(cardId),
            recentMatch: cardId,
            lastMatchTime: new Date().toISOString()
          });
          
          // Atualizar parceiro
          batch.update(partnerDoc, {
            matches: arrayUnion(cardId),
            recentMatch: cardId,
            lastMatchTime: new Date().toISOString()
          });
          
          await batch.commit();
        }
      } else {
        // Adicionar aos dislikes
        await updateDoc(userDoc, {
          dislikes: arrayUnion(cardId)
        });
      }

      // Remover a carta atual do array
      setCards(prevCards => prevCards.filter((_, index) => index !== currentCardIndex));
    } catch (error) {
      console.error('Erro ao processar swipe:', error);
      // Mostrar feedback visual de erro
      setError('Erro ao processar sua escolha. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (event: any, info: any) => {
    if (info.offset.x > 50) {
      setSwipeDirection('right');
    } else if (info.offset.x < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 800 || Math.abs(offset) >= 100) {
      if (offset > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <MatchesButton onClick={() => setShowMatches(!showMatches)}>
        <Badge color="error" variant="dot" invisible={!newMatch}>
          <LocalFireDepartmentIcon sx={{ color: '#ff4b6e' }} />
        </Badge>
      </MatchesButton>

      <Collapse in={showMatches}>
        <MatchesPanel>
          <Typography variant="h6" gutterBottom sx={{ color: '#ff4b6e', textAlign: 'center' }}>
            Seus Matches
          </Typography>
          {matches.map((match) => (
            <MatchCard key={match.id}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#ff4b6e' }}>
                  {match.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {match.description}
                </Typography>
              </CardContent>
            </MatchCard>
          ))}
        </MatchesPanel>
      </Collapse>

      <Box 
        sx={{ 
          py: { xs: 2, sm: 4, md: 6 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            mb: { xs: 2, sm: 4 },
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Descubra Suas Fantasias
        </Typography>

        <CardWrapper>
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
                exit={{ opacity: 0, x: -200 }}
                whileDrag={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CardImage 
                  src={cards[currentCardIndex].image} 
                  alt={cards[currentCardIndex].title} 
                />
                <CardOverlay>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 600, 
                    color: '#ff4b6e',
                    fontSize: { xs: '1.5rem', sm: '1.8rem' }
                  }}>
                    {cards[currentCardIndex].title}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    {cards[currentCardIndex].description}
                  </Typography>
                </CardOverlay>
                <SwipeIndicator 
                  direction="left" 
                  sx={{ opacity: swipeDirection === 'left' ? 1 : 0 }}
                >
                  NOPE
                </SwipeIndicator>
                <SwipeIndicator 
                  direction="right" 
                  sx={{ opacity: swipeDirection === 'right' ? 1 : 0 }}
                >
                  LIKE
                </SwipeIndicator>
              </StyledCard>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: { xs: 3, sm: 6 },
                  background: 'rgba(20, 20, 20, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 75, 110, 0.2)',
                  width: '100%',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#ff4b6e', 
                  fontWeight: 'bold', 
                  mb: 3,
                  fontSize: { xs: '1.5rem', sm: '1.8rem' }
                }}>
                  Acabaram as cartas! 🎭
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  mb: 4,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Volte em algumas horas para descobrir novas fantasias. Suas escolhas foram salvas!
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  sx={{
                    borderColor: '#ff4b6e',
                    color: '#ff4b6e',
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    '&:hover': {
                      borderColor: '#ff1f4c',
                      backgroundColor: 'rgba(255, 75, 110, 0.1)'
                    }
                  }}
                >
                  Verificar Novos Cards
                </Button>
              </Box>
            )}
          </AnimatePresence>
        </CardWrapper>

        <ActionButtons>
          <ActionButton 
            onClick={() => handleSwipe('left')}
            className="dislike"
          >
            <CloseIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: '#666' }} />
          </ActionButton>
          <ActionButton 
            onClick={() => handleSwipe('right')}
            className="like"
          >
            <FavoriteIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: '#ff4b6e' }} />
          </ActionButton>
        </ActionButtons>

        {/* Dialog de Match */}
        <Dialog 
          open={showMatchDialog} 
          onClose={() => setShowMatchDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxWidth: 400,
              width: '100%',
              background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(40,0,0,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 75, 110, 0.3)',
              color: 'white',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(255,75,110,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff4b6e' }}>
              É um Match! 🎉
            </Typography>
          </DialogTitle>
          <DialogContent>
            {matchedCard && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CardImage 
                  src={matchedCard.image} 
                  alt={matchedCard.title}
                  sx={{ 
                    height: 250,
                    width: '100%',
                    borderRadius: 2,
                    mb: 3,
                    border: '2px solid rgba(255,75,110,0.3)'
                  }}
                />
                <Typography variant="h5" gutterBottom sx={{ color: '#ff4b6e' }}>
                  {matchedCard.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Você e seu parceiro combinaram nesta fantasia!
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>

      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {error}
        </Alert>
      )}
    </StyledContainer>
  );
};

export default Game; 