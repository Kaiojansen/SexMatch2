import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Gerenciar Cards
      </Typography>

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
            <Card sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={card.image}
                alt={card.title}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
                onClick={() => handleDeleteCard(card.id)}
              >
                <DeleteIcon />
              </IconButton>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Categoria: {card.category}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Admin; 