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
  increment,
  addDoc
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
  TextField,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/staatliches';
import MatchAnimation from '../components/MatchAnimation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  user1Name: string;
  user2Name: string;
  createdAt: Timestamp;
  likes_user1: string[];
  likes_user2: string[];
  fire_user1: string[];
  fire_user2: string[];
  feito_user1: string[];
  feito_user2: string[];
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
  position: 'relative',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
    '& .card-overlay': {
      opacity: 1
    }
  },
  '&.feito': {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(76, 175, 80, 0.3)',
      zIndex: 1
    }
  }
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
  backgroundColor: 'rgba(255, 75, 110, 0.1)',
  color: 'white',
  borderRadius: '30px',
  padding: '12px 24px',
  border: '2px solid rgba(255, 75, 110, 0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  minWidth: '180px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 75, 110, 0.2)',
    borderColor: 'rgba(255, 75, 110, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(255, 75, 110, 0.2)',
  },
  '&.marked': {
    backgroundColor: 'rgba(255, 75, 110, 0.3)',
    borderColor: 'rgba(255, 75, 110, 0.8)',
    pointerEvents: 'none',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.3rem',
  },
  '@media (max-width: 600px)': {
    fontSize: '0.9rem',
    padding: '10px 20px',
    minWidth: '160px',
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
  const { partnerId: urlPartnerId } = useParams();
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
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [userFeitos, setUserFeitos] = useState<string[]>([]);
  const [partnerFeitos, setPartnerFeitos] = useState<string[]>([]);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !urlPartnerId) {
        console.log('Usuário ou ID do parceiro não encontrado');
        setError('Dados inválidos');
        navigate('/dashboard');
        return;
      }

      try {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userPartners = userData.partners || [];

          if (userPartners.includes(urlPartnerId)) {
            setPartnerId(urlPartnerId);
            const partnershipId = [currentUser.uid, urlPartnerId].sort().join('_');
            const partnershipRef = doc(db, 'partners', partnershipId);
            const partnershipDoc = await getDoc(partnershipRef);

            if (!partnershipDoc.exists()) {
              console.log('Criando novo documento de parceria:', partnershipId);
              // Criar documento inicial de parceria
              const [user1, user2] = [currentUser.uid, urlPartnerId].sort();
              
              // Buscar nomes dos usuários
              const user1Doc = await getDoc(doc(db, 'users', user1));
              const user2Doc = await getDoc(doc(db, 'users', user2));
              
              const user1Name = user1Doc.exists() ? user1Doc.data().name || '' : '';
              const user2Name = user2Doc.exists() ? user2Doc.data().name || '' : '';

              await setDoc(partnershipRef, {
                id: partnershipId,
                user1: user1,
                user2: user2,
                user1Name: user1Name,
                user2Name: user2Name,
                createdAt: serverTimestamp(),
                likes_user1: [], 
                likes_user2: [], 
                fire_user1: [],
                fire_user2: [],
                feito_user1: [],
                feito_user2: [],
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

        // Embaralhar as cartas disponíveis
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
        
        // Carregar cartas marcadas como "feito" pelo parceiro
        const partnerFeitos = isUser1 ? data.feito_user2 || [] : data.feito_user1 || [];
        const myFeitos = isUser1 ? data.feito_user1 || [] : data.feito_user2 || [];
        
        // Atualizar o estado dos cards marcados pelo parceiro
        const markedCards: { [key: string]: boolean } = {};
        partnerFires.forEach((cardId: string) => {
          markedCards[cardId] = true;
        });
        setHotMarkedCards(markedCards);

        // Atualizar meus fires
        setUserFires(myFires);

        // Atualizar feitos
        setUserFeitos(myFeitos);
        setPartnerFeitos(partnerFeitos);

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
    if (isProcessingAction) return;
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
    if (isProcessingAction) return;
    
    const swipeThreshold = 100;
    setIsProcessingAction(true);
    
    if (info.offset.x > swipeThreshold) {
      setTranslateX(window.innerWidth * 1.5);
      setRotate(45);
      await handleLike();
    } else if (info.offset.x < -swipeThreshold) {
      setTranslateX(-window.innerWidth * 1.5);
      setRotate(-45);
      handleDislike();
    } else {
      setTranslateX(0);
      setRotate(0);
    }
    
    setSwipeDirection(null);
    
    setTimeout(() => {
      setTranslateX(0);
      setRotate(0);
      setIsProcessingAction(false);
    }, 300);
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
          setShowMatchAnimation(true);
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

  const handleMarkAsDone = async (match: Match) => {
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
      const userFeitos = isUser1 ? data.feito_user1 || [] : data.feito_user2 || [];
      if (userFeitos.includes(match.cardId)) {
        console.log('Carta já foi marcada como feita');
        return;
      }

      // Adicionar o feito
      await updateDoc(partnershipRef, {
        [isUser1 ? 'feito_user1' : 'feito_user2']: arrayUnion(match.cardId)
      });

      // Atualizar o estado local
      setUserFeitos(prev => [...prev, match.cardId]);

      console.log('Carta marcada como feita com sucesso!');
    } catch (error) {
      console.error('Erro ao marcar carta como feita:', error);
    }
  };

  const handleSubmitSuggestion = async () => {
    try {
      const suggestionsRef = collection(db, 'suggestions');
      await addDoc(suggestionsRef, {
        title: suggestionTitle,
        description: suggestionDescription,
        status: 'pending',
        createdAt: new Date()
      });

      setShowSuggestionDialog(false);
      setSuggestionTitle('');
      setSuggestionDescription('');
      alert('Sugestão enviada com sucesso! Obrigado por contribuir!');
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      alert('Erro ao enviar sugestão. Por favor, tente novamente.');
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
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              textAlign: 'center',
              color: '#fff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              fontSize: '1.2rem'
            }}
          >
            Seus Matches
          </Typography>
          {matches && matches.length > 0 ? (
            <MatchesGrid>
              {matches.map((match) => (
                <MatchCard 
                  key={match.cardId} 
                  onClick={() => setSelectedMatch(match)}
                  className={userFeitos.includes(match.cardId) || partnerFeitos.includes(match.cardId) ? 'feito' : ''}
                >
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
                        objectFit: 'cover'
                      }}
                    />
                    <Box className="card-overlay" sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)',
                      opacity: 0.9,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '16px',
                      zIndex: 2
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#fff',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {match.cardTitle}
                      </Typography>
                      {currentUser && hotMarkedCards[match.cardId] && 
                        !userFeitos.includes(match.cardId) && 
                        !partnerFeitos.includes(match.cardId) && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(255, 75, 110, 0.9)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          animation: 'pulse 2s infinite',
                          zIndex: 3
                        }}>
                          QUERO MUITO
                        </Box>
                      )}
                      {(userFeitos.includes(match.cardId) || partnerFeitos.includes(match.cardId)) && (
                        <Box sx={{ 
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: 'rgba(76, 175, 80, 0.9)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          animation: 'pulse 2s infinite',
                          zIndex: 3
                        }}>
                          JÁ FIZEMOS!
                        </Box>
                      )}
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
                  scale: swipeDirection ? 0.95 : 1,
                  opacity: Math.abs(translateX) > window.innerWidth ? 0 : 1,
                  transition: { 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 15,
                    mass: 0.5
                  }
                }}
                initial={{ scale: 1, x: 0, rotate: 0 }}
                exit={{
                  x: translateX,
                  rotate: rotate,
                  opacity: 0,
                  transition: { duration: 0.2 }
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
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Aguarde novas cartas ou sugira suas próprias ideias!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowSuggestionDialog(true)}
                >
                  Sugerir Cartas
                </Button>
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
            background: 'linear-gradient(135deg, rgba(20,20,20,0.98) 0%, rgba(40,0,0,0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 75, 110, 0.3)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        {/* Efeito de brilho de fundo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,75,110,0.15) 0%, transparent 70%)',
          animation: 'pulse 3s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.5 }
          },
          pointerEvents: 'none'
        }} />

        <DialogTitle sx={{ 
          textAlign: 'center', 
          pt: 4,
          pb: 2,
          position: 'relative'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff4b6e, #ff8f53)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontSize: '3rem'
            }}
          >
            É um Match!
          </Typography>
        </DialogTitle>

        <DialogContent>
          {matchedCard && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 3,
              position: 'relative'
            }}>
              {/* Container da imagem com efeito de borda brilhante */}
              <Box sx={{
                position: 'relative',
                mb: 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: 'linear-gradient(45deg, #ff4b6e, #ff8f53)',
                  borderRadius: '12px',
                  zIndex: -1,
                  animation: 'borderGlow 2s infinite ease-in-out',
                  '@keyframes borderGlow': {
                    '0%': { opacity: 0.5 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.5 }
                  }
                }
              }}>
                <img 
                  src={matchedCard.image}
                  alt={matchedCard.title}
                  style={{ 
                    width: '100%',
                    height: 250,
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '2px solid rgba(255,255,255,0.1)'
                  }}
                />
              </Box>

              {/* Título da carta */}
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#fff',
                  fontSize: '2rem',
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {matchedCard.title}
              </Typography>

              {/* Mensagem motivacional */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  fontStyle: 'italic',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                Vocês combinaram nesta fantasia! 
                Que tal torná-la realidade?
              </Typography>

              {/* Botão de ação */}
              <Button
                variant="contained"
                onClick={() => {
                  setShowMatchDialog(false);
                  setSelectedMatch({
                    cardId: matchedCard.id,
                    cardTitle: matchedCard.title,
                    cardImage: matchedCard.image
                  });
                }}
                sx={{
                  background: 'linear-gradient(45deg, #ff4b6e, #ff8f53)',
                  color: 'white',
                  padding: '10px 30px',
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255,75,110,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ff3b5e, #ff7f43)',
                    boxShadow: '0 6px 20px rgba(255,75,110,0.4)',
                  }
                }}
              >
                Ver Detalhes
              </Button>
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
              {currentUser && hotMarkedCards[selectedMatch.cardId] && 
                !userFeitos.includes(selectedMatch.cardId) && 
                !partnerFeitos.includes(selectedMatch.cardId) && (
                <Box sx={{ 
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255, 75, 110, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite',
                  zIndex: 3
                }}>
                  QUERO MUITO
                </Box>
              )}
              {(userFeitos.includes(selectedMatch.cardId) || partnerFeitos.includes(selectedMatch.cardId)) && (
                <Box sx={{ 
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: 'rgba(76, 175, 80, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite',
                  zIndex: 3
                }}>
                  JÁ FIZEMOS!
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
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontSize: {xs: '1.5rem', sm: '2rem'},
                px: 2
              }}>
                {selectedMatch.cardTitle}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: {xs: 'column', sm: 'row'},
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 2, 
                mt: 2, 
                mb: 3,
                px: 3
              }}>
                <HotButton
                  onClick={() => handleMarkAsHot(selectedMatch)}
                  startIcon={<LocalFireDepartmentIcon />}
                  className={userFires.includes(selectedMatch.cardId) ? 'marked' : ''}
                  disabled={userFires.includes(selectedMatch.cardId) || userFeitos.includes(selectedMatch.cardId)}
                  sx={{
                    opacity: userFeitos.includes(selectedMatch.cardId) ? 0.7 : 1,
                    flex: {xs: '1', sm: '0 1 auto'},
                    backgroundColor: 'rgba(255, 75, 110, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 75, 110, 0.2)',
                    },
                    '&.marked': {
                      backgroundColor: 'rgba(255, 75, 110, 0.3)',
                    }
                  }}
                >
                  {userFires.includes(selectedMatch.cardId) ? 'MUITO QUENTE' : 'QUERO MUITO'}
                </HotButton>

                <HotButton
                  onClick={() => handleMarkAsDone(selectedMatch)}
                  startIcon={<CheckCircleIcon />}
                  className={userFeitos.includes(selectedMatch.cardId) ? 'marked' : ''}
                  disabled={userFeitos.includes(selectedMatch.cardId)}
                  sx={{
                    flex: {xs: '1', sm: '0 1 auto'},
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderColor: 'rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      borderColor: 'rgba(76, 175, 80, 0.5)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                    },
                    '&.marked': {
                      backgroundColor: 'rgba(76, 175, 80, 0.3)',
                      borderColor: 'rgba(76, 175, 80, 0.8)',
                    }
                  }}
                >
                  {userFeitos.includes(selectedMatch.cardId) ? 'JÁ FIZEMOS' : 'JÁ FIZEMOS'}
                </HotButton>
              </Box>
            </Box>
          </ModalContent>
        </ModalOverlay>
      )}

      <MatchAnimation 
        isVisible={showMatchAnimation} 
        onComplete={() => setShowMatchAnimation(false)} 
      />

      {/* Dialog para sugestão de cartas */}
      <Dialog
        open={showSuggestionDialog}
        onClose={() => setShowSuggestionDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 400,
            width: '100%',
            background: 'linear-gradient(135deg, rgba(20,20,20,0.98) 0%, rgba(40,0,0,0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 75, 110, 0.3)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Sugerir Nova Carta
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Título da Carta"
              value={suggestionTitle}
              onChange={(e) => setSuggestionTitle(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 75, 110, 0.5)',
                  },
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <TextField
              fullWidth
              label="Descrição"
              multiline
              rows={4}
              value={suggestionDescription}
              onChange={(e) => setSuggestionDescription(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 75, 110, 0.5)',
                  },
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            onClick={() => setShowSuggestionDialog(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitSuggestion}
            disabled={!suggestionTitle.trim() || !suggestionDescription.trim()}
            sx={{
              background: 'linear-gradient(45deg, #ff4b6e, #ff8f53)',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '20px',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff3b5e, #ff7f43)',
              },
              '&.Mui-disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Enviar Sugestão
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {error}
        </Alert>
      )}
    </GameContainer>
  );
};

export default Game; 