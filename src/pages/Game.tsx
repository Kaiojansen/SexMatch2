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
  Timestamp,
  increment
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
import '@fontsource/staatliches';

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
}

interface PartnershipData {
  id: string;
  user1: string;
  user2: string;
  createdAt: Timestamp;
  likes_user1: string[];
  likes_user2: string[];
  fire_user1: string[];
  fire_user2: string[];
  matches: Match[];
  new_matches_user1: number;
  new_matches_user2: number;
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
  position: 'relative',
  width: '100%',
  maxWidth: '400px',
  height: '600px',
  margin: '0 auto',
  borderRadius: '24px',
  overflow: 'hidden',
  '& .card': {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#000',
    '& .card-image': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'brightness(0.9)',
      transition: 'all 0.3s ease'
    },
    '& .card-content': {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '60px 24px 24px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)',
      backdropFilter: 'blur(5px)',
      '& .card-title': {
        color: '#fff',
        fontSize: '2.5rem',
        fontWeight: 300,
        marginBottom: '12px',
        fontFamily: '"Staatliches", cursive',
        letterSpacing: '-0.5px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      },
      '& .card-description': {
        color: 'rgba(255,255,255,0.9)',
        fontSize: '1rem',
        fontWeight: 400,
        opacity: 0.9,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        marginBottom: '20px'
      }
    }
  }
}));

const CardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  }
}));

const CardImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
});

const CardContentWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '120px 24px 24px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, transparent 100%)',
  backdropFilter: 'blur(10px)',
  zIndex: 1,
  '& .card-title': {
    color: '#fff',
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '8px',
    fontFamily: '"Staatliches", cursive',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  '& .card-description': {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.2rem',
    fontWeight: 400,
    opacity: 0.9,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
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

const GameContainer = styled(Box)(({ theme }) => ({
  // ... existing styles ...
}));

const Title = styled(Typography)({
  fontFamily: '"Staatliches", cursive',
  fontSize: '3rem',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '2rem',
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  letterSpacing: '2px'
});

const Game: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { partnerId: urlPartnerId } = useParams(); // Pegando o ID do parceiro da URL
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
  const [hotMarkedCards, setHotMarkedCards] = useState<{ [cardId: string]: boolean }>({});
  const [userFires, setUserFires] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !urlPartnerId) {
        console.log('Usuário não está logado ou ID do parceiro não fornecido');
        return;
      }
      
      console.log('Buscando dados do usuário:', currentUser.uid);
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Dados do usuário encontrados:', userData);
          
          // Verificar se o parceiro da URL está na lista de parceiros do usuário
          if (userData.partners && userData.partners.includes(urlPartnerId)) {
            console.log('Parceiro válido encontrado:', urlPartnerId);
            setPartnerId(urlPartnerId);

            // Criar ou verificar documento de parceria
            const partnershipId = [currentUser.uid, urlPartnerId].sort().join('_');
            console.log('ID da parceria gerado:', partnershipId);
            const partnershipRef = doc(db, 'partners', partnershipId);
            const partnershipDoc = await getDoc(partnershipRef);

            if (!partnershipDoc.exists()) {
              console.log('Criando novo documento de parceria:', partnershipId);
              // Criar documento inicial de parceria
              const [user1, user2] = [currentUser.uid, urlPartnerId].sort();
              await setDoc(partnershipRef, {
                id: partnershipId,
                user1: user1,
                user2: user2,
                createdAt: serverTimestamp(),
                likes_user1: [], 
                likes_user2: [], 
                fire_user1: [],
                fire_user2: [],
                matches: [],
                new_matches_user1: 0,
                new_matches_user2: 0
              });
              console.log('Documento de parceria criado com sucesso');
            } else {
              console.log('Documento de parceria já existe:', partnershipId);
            }
          } else {
            console.log('Parceiro não encontrado na lista de parceiros do usuário');
            setError('Parceiro inválido');
            navigate('/dashboard');
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
  }, [currentUser, urlPartnerId, navigate]);

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

    const partnershipId = [currentUser.uid, partnerId].sort().join('_');
    const partnershipRef = doc(db, 'partners', partnershipId);

    const unsubscribe = onSnapshot(partnershipRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as PartnershipData;
        const isUser1 = data.user1 === currentUser.uid;
        
        // Carregar matches
        setMatches(data.matches || []);
        
        // Carregar cartas marcadas como "quero muito" pelo parceiro
        const partnerFires = isUser1 ? data.fire_user2 || [] : data.fire_user1 || [];
        const myFires = isUser1 ? data.fire_user1 || [] : data.fire_user2 || [];
        
        // Atualizar o estado dos cards marcados pelo parceiro
        const markedCards: { [key: string]: boolean } = {};
        partnerFires.forEach((cardId: string) => {
          markedCards[cardId] = true;
        });
        setHotMarkedCards(markedCards);

        // Atualizar meus fires
        setUserFires(myFires);

        // Atualizar o contador de novos matches
        setNewMatchCount(isUser1 ? data.new_matches_user1 || 0 : data.new_matches_user2 || 0);
      }
    });

    return () => unsubscribe();
  }, [currentUser, partnerId]);

  // Carregar os "quero muito" do usuário
  useEffect(() => {
    if (!currentUser) return;

    const loadUserFires = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserFires(userData.fires || []);
          // Atualizar também o estado local dos cards marcados
          const markedCards: { [key: string]: boolean } = {};
          userData.fires?.forEach((cardId: string) => {
            markedCards[cardId] = true;
          });
          setHotMarkedCards(markedCards);
        }
      } catch (error) {
        console.error('Erro ao carregar quero muito:', error);
      }
    };

    loadUserFires();
  }, [currentUser]);

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
        console.log('Documento de parceria não encontrado');
        setError('Erro: Documento de parceria não encontrado');
        return;
      }

      const data = partnershipDoc.data() as PartnershipData;
      const isUser1 = data.user1 === currentUser.uid;
      
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
          // Primeiro atualiza os likes e incrementa as notificações para ambos
          await updateDoc(partnershipRef, {
            [isUser1 ? 'likes_user1' : 'likes_user2']: updatedLikes,
            // Incrementa o contador de novos matches para ambos os usuários
            new_matches_user1: increment(1),
            new_matches_user2: increment(1)
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
        // Se não for match, apenas atualiza os likes
        try {
          await updateDoc(partnershipRef, {
            [isUser1 ? 'likes_user1' : 'likes_user2']: updatedLikes
          });
        } catch (error) {
          console.error('Erro ao atualizar likes:', error);
          setError('Erro ao salvar o like. Tente novamente.');
          setTimeout(() => setError(''), 3000);
        }
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
      const partnershipDoc = await getDoc(partnershipRef);

      if (!partnershipDoc.exists()) {
        console.error('Documento de parceria não encontrado');
        return;
      }

      const data = partnershipDoc.data() as PartnershipData;
      const isUser1 = data.user1 === currentUser.uid;

      // Verificar se já marcou esta carta
      const userFires = isUser1 ? data.fire_user1 || [] : data.fire_user2 || [];
      if (userFires.includes(match.cardId)) {
        console.log('Carta já foi marcada como quero muito');
        return;
      }

      // Adicionar o fire
      await updateDoc(partnershipRef, {
        [isUser1 ? 'fire_user1' : 'fire_user2']: arrayUnion(match.cardId)
      });

      // Atualizar o estado local
      setUserFires(prev => [...prev, match.cardId]);

      console.log('Carta marcada como quero muito com sucesso!');
    } catch (error) {
      console.error('Erro ao marcar carta como quero muito:', error);
    }
  };

  // Limpar notificações ao abrir os matches
  const handleToggleMatches = async () => {
    setShowMatches(!showMatches);
    if (!showMatches && currentUser && partnerId) {
      try {
        const partnershipId = [currentUser.uid, partnerId].sort().join('_');
        const partnershipRef = doc(db, 'partners', partnershipId);
        const partnershipDoc = await getDoc(partnershipRef);

        if (partnershipDoc.exists()) {
          const data = partnershipDoc.data() as PartnershipData;
          const isUser1 = data.user1 === currentUser.uid;

          // Zerar apenas o contador do usuário atual
          await updateDoc(partnershipRef, {
            [isUser1 ? 'new_matches_user1' : 'new_matches_user2']: 0
          });
        }
      } catch (error) {
        console.error('Erro ao resetar contador de matches:', error);
      }
    }
  };

  return (
    <GameContainer>
      <MatchesButton onClick={handleToggleMatches}>
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
          {matches && matches.length > 0 ? (
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
                    position: 'relative',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '2px solid #666'
                    }
                  }}
                >
                  {currentUser && hotMarkedCards[match.cardId] && (
                    <HotCardIndicator>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: '4px',
                        alignItems: 'center',
                        background: 'linear-gradient(45deg, #ff4b6e, #ff1f4b)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(255, 75, 110, 0.5)',
                        animation: 'pulse 2s infinite'
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
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Nenhum match ainda
            </Typography>
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
        <Title variant="h1" sx={{ 
          fontFamily: '"Staatliches", cursive',
          fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
          color: '#fff',
          textAlign: 'center',
          mb: { xs: 2, sm: 4 },
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '2px'
        }}>
          SexMatch
        </Title>

        <CardWrapper>
          <AnimatePresence mode="wait">
            {currentCardIndex < cards.length ? (
              <motion.div
                className="card"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{
                  x: translateX,
                  rotate: rotate,
                  scale: swipeDirection ? 0.98 : 1,
                  transition: { type: "spring", stiffness: 200, damping: 20 }
                }}
              >
                <img 
                  src={cards[currentCardIndex].image} 
                  alt={cards[currentCardIndex].title}
                  className="card-image"
                  draggable={false}
                />
                <div className="card-content">
                  <Typography className="card-title">{cards[currentCardIndex].title}</Typography>
                  <Typography className="card-description">{cards[currentCardIndex].description}</Typography>
                </div>
                {swipeDirection && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: swipeDirection === 'left' ? '10%' : undefined,
                      right: swipeDirection === 'right' ? '10%' : undefined,
                      transform: 'translateY(-50%)',
                      backgroundColor: 'transparent',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      opacity: 0.9
                    }}
                  >
                    {swipeDirection === 'right' ? 'LIKE' : 'NOPE'}
                  </Box>
                )}
              </motion.div>
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
              {/* Mostrar HOT apenas quando o outro usuário marcou como "quero muito" */}
              {currentUser && hotMarkedCards[selectedMatch.cardId] && (
                <Box sx={{ 
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite'
                }}>
                  HOT!
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
                className={userFires.includes(selectedMatch.cardId) ? 'marked' : ''}
                disabled={userFires.includes(selectedMatch.cardId)}
              >
                {userFires.includes(selectedMatch.cardId) ? 'MUITO QUENTE! 🔥' : 'QUERO MUITO! 🔥'}
              </HotButton>
            </Box>
          </ModalContent>
        </ModalOverlay>
      )}

      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {error}
        </Alert>
      )}
    </GameContainer>
  );
};

export default Game; 