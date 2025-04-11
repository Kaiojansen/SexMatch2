import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

interface CardData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

const Admin = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    image: '',
    category: ''
  });
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const cardsRef = collection(db, 'cards');
    const snapshot = await getDocs(cardsRef);
    const cardsData: CardData[] = [];
    snapshot.forEach((doc) => {
      cardsData.push({ id: doc.id, ...doc.data() } as CardData);
    });
    setCards(cardsData);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cardsRef = collection(db, 'cards');
      await addDoc(cardsRef, newCard);
      setNewCard({ title: '', description: '', image: '', category: '' });
      fetchCards();
    } catch (error) {
      console.error('Erro ao adicionar card:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteDoc(doc(db, 'cards', cardId));
      fetchCards();
    } catch (error) {
      console.error('Erro ao deletar card:', error);
    }
  };

  const handleEditCard = (card: CardData) => {
    setEditingCard(card);
    setEditDialogOpen(true);
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    try {
      const cardRef = doc(db, 'cards', editingCard.id);
      await updateDoc(cardRef, {
        title: editingCard.title,
        description: editingCard.description,
        image: editingCard.image,
        category: editingCard.category
      });
      setEditDialogOpen(false);
      setEditingCard(null);
      fetchCards();
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
    }
  };

  const handleExportCards = () => {
    const cardsJson = JSON.stringify(cards, null, 2);
    const blob = new Blob([cardsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cards_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Administração de Cards
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleExportCards}
          sx={{
            backgroundColor: '#ff4b6e',
            '&:hover': {
              backgroundColor: '#ff1f4c'
            }
          }}
        >
          Exportar Cards
        </Button>
      </Box>

      <Box component="form" onSubmit={handleAddCard} sx={{ mb: 6 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Título"
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Categoria"
              value={newCard.category}
              onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              value={newCard.description}
              onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
              multiline
              rows={2}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL da Imagem"
              value={newCard.image}
              onChange={(e) => setNewCard({ ...newCard, image: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                backgroundColor: '#ff4b6e',
                '&:hover': {
                  backgroundColor: '#ff1f4c'
                }
              }}
            >
              Adicionar Card
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 75, 110, 0.2)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(255, 75, 110, 0.2)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={card.image}
                alt={card.title}
                sx={{ 
                  objectFit: 'cover',
                  borderBottom: '1px solid rgba(255, 75, 110, 0.2)'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h2"
                  sx={{ 
                    color: '#fff',
                    fontFamily: '"Staatliches", cursive',
                    letterSpacing: '1px'
                  }}
                >
                  {card.title}
                </Typography>
                <Typography 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 2
                  }}
                >
                  {card.description}
                </Typography>
                <Chip 
                  label={card.category}
                  sx={{ 
                    backgroundColor: 'rgba(255, 75, 110, 0.2)',
                    color: '#ff4b6e',
                    fontWeight: 'bold'
                  }}
                />
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <IconButton
                  onClick={() => handleEditCard(card)}
                  sx={{
                    color: '#ff4b6e',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 75, 110, 0.1)'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteCard(card.id)}
                  sx={{
                    color: '#ff4b6e',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 75, 110, 0.1)'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid rgba(255, 75, 110, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(255,75,110,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#fff',
          fontFamily: '"Staatliches", cursive',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 75, 110, 0.2)',
          pb: 2
        }}>
          Editar Card
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box component="form" onSubmit={handleUpdateCard} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Título"
              value={editingCard?.title || ''}
              onChange={(e) => setEditingCard(prev => prev ? {...prev, title: e.target.value} : null)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 75, 110, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ff4b6e',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Descrição"
              value={editingCard?.description || ''}
              onChange={(e) => setEditingCard(prev => prev ? {...prev, description: e.target.value} : null)}
              required
              multiline
              rows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 75, 110, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ff4b6e',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            <TextField
              fullWidth
              label="URL da Imagem"
              value={editingCard?.image || ''}
              onChange={(e) => setEditingCard(prev => prev ? {...prev, image: e.target.value} : null)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 75, 110, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ff4b6e',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Categoria"
              value={editingCard?.category || ''}
              onChange={(e) => setEditingCard(prev => prev ? {...prev, category: e.target.value} : null)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 75, 110, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ff4b6e',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 75, 110, 0.2)', p: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateCard}
            sx={{ 
              color: '#ff4b6e',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 0.1)'
              }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin; 