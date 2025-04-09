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
  serverTimestamp,
  Timestamp
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
  Paper,
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
  cardTitle: string;
  cardImage: string;
  hotStatus?: {
    [userId: string]: boolean;
  };
}

interface PartnershipData {
  users: string[];
  createdAt: Timestamp;
  likes_user1: string[];
  likes_user2: string[];
  matches: Match[];
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

const MatchesPanel = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: 280,
  maxHeight: '80vh',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: '2px solid #333',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
}));

const MatchesGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
  padding: '8px 4px',
  maxHeight: '400px', // Altura máxima para 4 cartas (2x2)
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.4)',
    },
  },
  // Esconde a scrollbar no Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)'
});

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

const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.85)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const ModalContent = styled(Box)({
  position: 'relative',
  backgroundColor: '#000',
  padding: '15px',
  borderRadius: '15px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
  maxWidth: '80vw',
  maxHeight: '90vh',
  overflow: 'hidden',
  zIndex: 10000,
  border: '2px solid #333'
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#fff',
  zIndex: 10001,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)'
  }
});

const HotCardIndicator = styled('div')({
  position: 'absolute',
  top: '8px',
  right: '8px',
  zIndex: 2,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { 
      transform: 'scale(1)',
      opacity: 0.8 
    },
    '50%': { 
      transform: 'scale(1.2)',
      opacity: 1 
    },
    '100%': { 
      transform: 'scale(1)',
      opacity: 0.8 
    }
  }
});

// Função auxiliar para converter timestamp
const parseTimestamp = (timestamp: string | Timestamp): Date => {
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return timestamp.toDate();
};

// Componente de animação de fogos
const FireworksEmoji = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'none',
  zIndex: 10000,
  animation: 'fadeOut 2s forwards',
  '& .emoji': {
    position: 'absolute',
    fontSize: '2rem',
    animation: 'floatUp 2s ease-out forwards',
  },
  '@keyframes fadeOut': {
    '0%': { opacity: 1 },
    '80%': { opacity: 1 },
    '100%': { opacity: 0 }
  },
  '@keyframes floatUp': {
    '0%': { 
      transform: 'translateY(0) scale(1)',
      opacity: 1 
    },
    '100%': { 
      transform: 'translateY(-100vh) scale(0)',
      opacity: 0 
    }
  }
});

const HotButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff4b6e',
  color: 'white',
  borderRadius: '20px',
  padding: '8px 24px',
  marginTop: '16px',
  width: '100%',
  '&:hover': {
    backgroundColor: '#ff1f4b',
  },
  '&.marked': {
    backgroundColor: '#ff1f4b',
    pointerEvents: 'none',
  }
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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [hotMarkedCards, setHotMarkedCards] = useState<{ [cardId: string]: boolean }>({});

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
          
          if (userData.partners && userData.partners.length > 0) {
            const partnerId = userData.partners[0];
            console.log('Parceiro encontrado:', partnerId);
            setPartnerId(partnerId);

            // Criar ou verificar documento de parceria
            const partnershipId = [currentUser.uid, partnerId].sort().join('_');
            const partnershipRef = doc(db, 'partners', partnershipId);
            const partnershipDoc = await getDoc(partnershipRef);

            if (!partnershipDoc.exists()) {
              // Criar documento inicial de parceria
              const [user1, user2] = [currentUser.uid, partnerId].sort();
              await setDoc(partnershipRef, {
                users: [user1, user2],
                createdAt: serverTimestamp(),
                likes_user1: [], // Likes do primeiro usuário (em ordem alfabética)
                likes_user2: [], // Likes do segundo usuário (em ordem alfabética)
                matches: []
              });
            }
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

    // Escutar por atualizações no documento de parceria
    const partnershipId = [currentUser.uid, partnerId].sort().join('_');
    const partnershipRef = doc(db, 'partners', partnershipId);

    const unsubscribe = onSnapshot(partnershipRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const matches = data.matches || [];
        
        setMatches(matches);
        
        // Atualizar contador apenas para matches novos
        const newMatchesCount = matches.length > 0 ? 1 : 0;
        setNewMatchCount(newMatchesCount);
      }
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
    if (!currentUser || !partnerId) {
      setError('Você precisa estar logado e ter um parceiro para curtir');
      return;
    }

    if (currentCardIndex >= cards.length) return;

    const currentCard = cards[currentCardIndex];
    
    try {
      const partnershipId = [currentUser.uid, partnerId].sort().join('_');
      const partnershipRef = doc(db, 'partners', partnershipId);
      const partnershipDoc = await getDoc(partnershipRef);

      if (!partnershipDoc.exists()) {
        console.log('Criando novo documento de parceria');
        // Criar documento inicial de parceria
        const [user1, user2] = [currentUser.uid, partnerId].sort();
        await setDoc(partnershipRef, {
          users: [user1, user2],
          createdAt: serverTimestamp(),
          likes_user1: [], // Likes do primeiro usuário (em ordem alfabética)
          likes_user2: [], // Likes do segundo usuário (em ordem alfabética)
          matches: []
        });
        return;
      }

      const data = partnershipDoc.data() as PartnershipData;
      const [user1, user2] = data.users;
      const isUser1 = currentUser.uid === user1;
      
      // Pegar os likes do usuário atual e do parceiro
      const userLikes = isUser1 ? data.likes_user1 : data.likes_user2;
      const partnerLikes = isUser1 ? data.likes_user2 : data.likes_user1;

      if (!userLikes || !partnerLikes) {
        console.error('Estrutura de likes inválida');
        setError('Erro na estrutura de dados. Por favor, tente novamente.');
        return;
      }

      // Verificar se já curtiu este card
      if (userLikes.includes(currentCard.id)) {
        console.log('Card já foi curtido anteriormente');
        setCurrentCardIndex(prev => prev + 1);
        return;
      }

      // Adicionar o like
      const updatedLikes = [...userLikes, currentCard.id];

      // Verificar se é um match
      if (partnerLikes.includes(currentCard.id)) {
        console.log('Match encontrado!');
        // É um match! Adicionar aos matches
        const newMatch = {
          cardId: currentCard.id,
          cardTitle: currentCard.title,
          cardImage: currentCard.image
        };

        try {
          // Primeiro atualiza os likes
          await updateDoc(partnershipRef, {
            [isUser1 ? 'likes_user1' : 'likes_user2']: updatedLikes
          });

          // Depois atualiza os matches separadamente
          await updateDoc(partnershipRef, {
            matches: arrayUnion(newMatch)
          });

          setMatchedCard(currentCard);
          setShowMatchDialog(true);
          setNewMatchCount(prev => prev + 1);
        } catch (error) {
          console.error('Erro ao processar match:', error);
          setError('Erro ao processar o match. Tente novamente.');
          setTimeout(() => setError(''), 3000);
        }
      } else {
        console.log('Adicionando novo like');
        // Apenas adicionar o like
        await updateDoc(partnershipRef, {
          [isUser1 ? 'likes_user1' : 'likes_user2']: updatedLikes
        });
      }

      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao processar like:', error);
      setError('Erro ao processar seu like. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDislike = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  // Função para marcar uma carta como "quero muito"
  const handleMarkAsHot = async (match: Match) => {
    if (!currentUser || !partnerId) return;

    try {
      const partnershipId = [currentUser.uid, partnerId].sort().join('_');
      const partnershipRef = doc(db, 'partners', partnershipId);
      
      // Atualiza o status de "quero muito" para esta carta
      await updateDoc(partnershipRef, {
        [`matches.${match.cardId}.hotStatus.${currentUser.uid}`]: true
      });

      setHotMarkedCards(prev => ({
        ...prev,
        [match.cardId]: true
      }));

      // Notifica o parceiro
      const notificationRef = doc(db, 'notifications', partnerId);
      await setDoc(notificationRef, {
        type: 'hot_mark',
        cardId: match.cardId,
        cardTitle: match.cardTitle,
        from: currentUser.uid,
        timestamp: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Erro ao marcar carta como quente:', error);
      setError('Erro ao marcar carta. Tente novamente.');
    }
  };

  // Efeito para mostrar fogos quando receber notificação
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'notifications', currentUser.uid), (doc) => {
      const data = doc.data();
      if (data?.type === 'hot_mark') {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 2000);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

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
          <Typography variant="h6" sx={{ 
            mb: 2, 
            textAlign: 'center',
            color: '#fff',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            Seus Matches
          </Typography>
          {matches.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Nenhum match ainda
            </Typography>
          ) : (
            <MatchesGrid>
              {matches.map((match) => (
                <MatchCard 
                  key={match.cardId}
                  onClick={() => setSelectedMatch(match)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    touchAction: 'pan-y',
                    position: 'relative',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '2px solid #666'
                    }
                  }}
                >
                  {match.hotStatus && match.hotStatus[partnerId || ''] && (
                    <HotCardIndicator>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: '4px',
                        alignItems: 'center',
                        background: 'linear-gradient(45deg, #ff4b6e, #ff1f4b)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(255, 75, 110, 0.5)'
                      }}>
                        <LocalFireDepartmentIcon sx={{ fontSize: '1rem' }} />
                        <Typography variant="caption" sx={{ 
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}>
                          HOT!
                        </Typography>
                      </Box>
                    </HotCardIndicator>
                  )}
                  <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                    <img
                      src={match.cardImage}
                      alt={match.cardTitle}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }}
                      draggable={false}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                        padding: '15px 8px 8px',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'white',
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                          userSelect: 'none',
                        }}
                      >
                        {match.cardTitle}
                      </Typography>
                    </Box>
                  </Box>
                </MatchCard>
              ))}
            </MatchesGrid>
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
          SexMatch
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

      {/* Modal para exibir o match selecionado */}
      {selectedMatch && (
        <ModalOverlay onClick={() => setSelectedMatch(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedMatch(null)}>
              <CloseIcon />
            </CloseButton>
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: '#000',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {selectedMatch.hotStatus && selectedMatch.hotStatus[partnerId || ''] && (
                <Box sx={{ 
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 2,
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  background: 'linear-gradient(45deg, #ff4b6e, #ff1f4b)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(255, 75, 110, 0.5)',
                  animation: 'pulse 2s infinite',
                }}>
                  <LocalFireDepartmentIcon />
                  <Typography sx={{ 
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    SEU PARCEIRO QUER MUITO!
                  </Typography>
                </Box>
              )}
              <img
                src={selectedMatch.cardImage}
                alt={selectedMatch.cardTitle}
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="h6" sx={{ 
                mt: 2, 
                color: '#fff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}>
                {selectedMatch.cardTitle}
              </Typography>
              
              <HotButton
                onClick={() => handleMarkAsHot(selectedMatch)}
                startIcon={<LocalFireDepartmentIcon />}
                className={hotMarkedCards[selectedMatch.cardId] ? 'marked' : ''}
                disabled={hotMarkedCards[selectedMatch.cardId]}
              >
                {hotMarkedCards[selectedMatch.cardId] ? 'MUITO QUENTE! 🔥' : 'QUERO MUITO! 🔥'}
              </HotButton>
            </Box>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Animação de fogos */}
      {showFireworks && (
        <FireworksEmoji>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="emoji"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🔥', '💥', '⭐', '✨'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </FireworksEmoji>
      )}

      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {error}
        </Alert>
      )}
    </StyledContainer>
  );
};

export default Game; 