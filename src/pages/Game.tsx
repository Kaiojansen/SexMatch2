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

interface Match {
  cardId: string;
  timestamp: any;
  cardTitle: string;
  cardImage: string;
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
  padding: '24px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
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
  padding: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 75, 110, 0.2)',
  },
  zIndex: 1000,
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  }
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        console.log('Usuário não está logado');
        return;
      }
      
      console.log('Buscando dados do usuário:', currentUser.uid);
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Dados do usuário encontrados:', userData);
          
          // Verifica se existe o array de partners
          if (userData.partners && userData.partners.length > 0) {
            // Pega o primeiro parceiro do array
            const partnerId = userData.partners[0];
            console.log('Parceiro encontrado:', partnerId);
            setPartnerId(partnerId);
          } else {
            console.log('Usuário não tem parceiro vinculado');
            setError('Você precisa ter um parceiro vinculado para jogar');
          }
        } else {
          console.log('Documento do usuário não encontrado');
          setError('Dados do usuário não encontrados');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError('Erro ao carregar seus dados');
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
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
      try {
        const newMatches: Match[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Verifica se o match é entre o usuário atual e seu parceiro
          if (data.users.includes(partnerId)) {
            newMatches.push({
              cardId: data.cardId,
              timestamp: data.timestamp,
              cardTitle: data.cardTitle,
              cardImage: data.cardImage
            });
          }
        });
        
        // Ordenar matches por data, mais recentes primeiro
        newMatches.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        
        setMatches(newMatches);
        
        // Atualizar contador apenas para matches novos
        const newMatchesCount = newMatches.filter(match => 
          match.timestamp?.toDate() > new Date(Date.now() - 5000) // últimos 5 segundos
        ).length;
        
        if (newMatchesCount > 0) {
          setNewMatchCount(prev => prev + newMatchesCount);
        }
      } catch (error) {
        console.error('Error processing matches:', error);
      }
    }, (error) => {
      console.error('Error in matches listener:', error);
    });

    return () => unsubscribe();
  }, [currentUser, partnerId]);

  const handleDrag = (event: any, info: any) => {
    setTranslateX(info.offset.x);
    setRotate(info.offset.x * 0.1);
    
    if (info.offset.x > 50) {
      setSwipeDirection('right');
    } else if (info.offset.x < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
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
    setSwipeDirection(null);
  };

  const handleLike = async () => {
    if (!currentUser) {
      console.error('Usuário não está logado');
      setError('Você precisa estar logado para curtir');
      return;
    }

    if (!partnerId) {
      console.error('Parceiro não encontrado');
      setError('Você precisa ter um parceiro vinculado para curtir');
      return;
    }

    if (currentCardIndex >= cards.length) {
      console.error('Índice do card inválido');
      return;
    }

    const currentCard = cards[currentCardIndex];
    console.log('Tentando curtir card:', currentCard.id);
    
    try {
      // Criar ID único para o like
      const likeId = `${currentCard.id}_${currentUser.uid}`;
      const likeRef = doc(db, 'likes', likeId);
      
      // Verificar se já deu like antes
      const existingLike = await getDoc(likeRef);
      if (existingLike.exists()) {
        console.log('Like já existe para este card');
        setCurrentCardIndex(prev => prev + 1);
        return;
      }

      console.log('Salvando like para o usuário:', currentUser.uid);
      // Salvar o like
      await setDoc(likeRef, {
        userId: currentUser.uid,
        cardId: currentCard.id,
        partnerId: partnerId,
        timestamp: serverTimestamp()
      });

      // Verificar se o parceiro já deu like
      const partnerLikeId = `${currentCard.id}_${partnerId}`;
      const partnerLikeRef = doc(db, 'likes', partnerLikeId);
      const partnerLikeDoc = await getDoc(partnerLikeRef);

      console.log('Verificando like do parceiro:', partnerId);
      if (partnerLikeDoc.exists()) {
        const partnerLikeData = partnerLikeDoc.data();
        // Verifica se o like do parceiro é realmente para este usuário
        if (partnerLikeData.partnerId === currentUser.uid) {
          console.log('Match encontrado!');
          // É um match! Criar documento de match
          const matchId = `${currentCard.id}_${currentUser.uid}_${partnerId}`;
          const matchRef = doc(db, 'matches', matchId);
          
          // Verificar se o match já existe
          const existingMatch = await getDoc(matchRef);
          if (!existingMatch.exists()) {
            console.log('Criando novo match');
            await setDoc(matchRef, {
              cardId: currentCard.id,
              users: [currentUser.uid, partnerId],
              timestamp: serverTimestamp(),
              cardTitle: currentCard.title,
              cardImage: currentCard.image,
              seenBy: [currentUser.uid] // Adiciona o usuário atual como tendo visto o match
            });

            setMatchedCard(currentCard);
            setShowMatchDialog(true);
            setNewMatchCount(prev => prev + 1);
          }
        } else {
          console.log('Like do parceiro encontrado, mas não é para este usuário');
        }
      } else {
        console.log('Parceiro ainda não deu like neste card');
      }

      // Avançar para o próximo card
      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      console.error('Erro detalhado ao processar like:', error);
      setError('Erro ao processar seu like. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDislike = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  return (
    <StyledContainer maxWidth={false}>
      <MatchesButton onClick={() => setShowMatches(!showMatches)}>
        <Badge badgeContent={newMatchCount} color="error" sx={{ 
          '& .MuiBadge-badge': { 
            fontSize: '0.7rem',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px'
          }
        }}>
          <LocalFireDepartmentIcon />
        </Badge>
      </MatchesButton>

      <Collapse in={showMatches} sx={{ position: 'fixed', top: '80px', right: '20px', zIndex: 1000 }}>
        <MatchesPanel>
          <Typography variant="h6" gutterBottom>
            Seus Matches
          </Typography>
          {matches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum match ainda. Continue jogando!
            </Typography>
          ) : (
            matches.map(match => (
              <MatchCard key={match.cardId}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <img
                    src={match.cardImage}
                    alt={match.cardTitle}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      marginRight: 10,
                      objectFit: 'cover',
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {match.cardTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.timestamp?.toDate().toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </MatchCard>
            ))
          )}
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
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200 }}
                style={{
                  x: translateX,
                  rotate: rotate,
                }}
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
                  p: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Todas as cartas foram visualizadas!
                </Typography>
                <Typography variant="body1">
                  Volte mais tarde para novas cartas.
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </CardWrapper>

        <ActionButtons>
          <ActionButton
            className="dislike" 
            onClick={() => handleDislike()}
          >
            <CloseIcon />
          </ActionButton>
          <ActionButton
            className="like" 
            onClick={() => handleLike()}
          >
            <FavoriteIcon />
          </ActionButton>
        </ActionButtons>
      </Box>

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

      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {error}
        </Alert>
      )}
    </StyledContainer>
  );
};

export default Game; 