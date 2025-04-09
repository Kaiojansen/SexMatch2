import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [partners, setPartners] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserCode(data.code);
          setPartners(data.partners || []);
        } else {
          // Gerar código único se não existir
          const newCode = generateUniqueCode();
          await setDoc(userDoc, {
            code: newCode,
            partners: [],
            createdAt: new Date()
          });
          setUserCode(newCode);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleAddPartner = async () => {
    if (!partnerCode) {
      setError('Por favor, insira um código de parceiro');
      return;
    }

    try {
      // Verificar se o código existe
      const partnerDoc = await getDoc(doc(db, 'users', partnerCode));
      if (!partnerDoc.exists()) {
        setError('Código de parceiro inválido');
        return;
      }

      // Atualizar o documento do usuário atual
      const userDoc = doc(db, 'users', currentUser?.uid || '');
      await updateDoc(userDoc, {
        partners: arrayUnion(partnerCode)
      });

      // Atualizar o documento do parceiro
      const partnerUserDoc = doc(db, 'users', partnerCode);
      await updateDoc(partnerUserDoc, {
        partners: arrayUnion(currentUser?.uid || '')
      });

      setPartners([...partners, partnerCode]);
      setPartnerCode('');
      setOpen(false);
      setSuccess('Parceiro adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding partner:', error);
      setError('Erro ao adicionar parceiro. Tente novamente.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setSuccess('Código copiado para a área de transferência!');
  };

  const handleStartGame = (partnerId: string) => {
    navigate(`/game/${partnerId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={24}
          sx={{ 
            p: 4,
            background: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 75, 110, 0.2)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
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
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontFamily: "'Cinzel', serif",
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <FavoriteIcon sx={{ color: '#ff4b6e' }} />
              Dashboard
            </Typography>
          </Box>

          {/* Seção do Código do Usuário */}
          <Card 
            sx={{ 
              mb: 4,
              background: 'rgba(255, 75, 110, 0.1)',
              border: '1px solid rgba(255, 75, 110, 0.2)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Seu Código Único
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'monospace',
                    color: '#ff4b6e',
                    letterSpacing: '0.2em'
                  }}
                >
                  {userCode}
                </Typography>
                <Tooltip title="Copiar código">
                  <IconButton 
                    onClick={handleCopyCode}
                    sx={{ 
                      color: '#ff4b6e',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 75, 110, 0.2)'
                      }
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>

          {/* Seção de Parceiros */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Seus Parceiros
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpen(true)}
                sx={{
                  color: '#ff4b6e',
                  borderColor: '#ff4b6e',
                  '&:hover': {
                    borderColor: '#ff4b6e',
                    backgroundColor: 'rgba(255, 75, 110, 0.1)'
                  }
                }}
              >
                Adicionar Parceiro
              </Button>
            </Box>

            {partners.length === 0 ? (
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed rgba(255, 75, 110, 0.3)'
                }}
              >
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Você ainda não tem parceiros. Adicione um usando o botão acima!
                </Typography>
              </Paper>
            ) : (
              <List>
                {partners.map((partnerId) => (
                  <React.Fragment key={partnerId}>
                    <ListItem
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          background: 'rgba(255, 75, 110, 0.1)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff4b6e' }}>
                          {partnerId.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: '#fff' }}>
                            Parceiro {partnerId.substring(0, 6)}
                          </Typography>
                        }
                        secondary={
                          <Chip 
                            label="Online" 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'rgba(0, 255, 0, 0.2)',
                              color: '#00ff00'
                            }} 
                          />
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleStartGame(partnerId)}
                          sx={{
                            backgroundColor: 'rgba(255, 75, 110, 0.9)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 75, 110, 1)'
                            }
                          }}
                        >
                          Iniciar Jogo
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider sx={{ my: 1, borderColor: 'rgba(255, 75, 110, 0.1)' }} />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                color: '#ff4b6e',
                borderColor: '#ff4b6e',
                '&:hover': {
                  borderColor: '#ff4b6e',
                  backgroundColor: 'rgba(255, 75, 110, 0.1)'
                }
              }}
            >
              Sair
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Dialog para adicionar parceiro */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid rgba(255, 75, 110, 0.2)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Adicionar Parceiro</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Código do Parceiro"
            type="text"
            fullWidth
            variant="outlined"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            sx={{
              mt: 2,
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
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddPartner}
            sx={{
              color: '#ff4b6e',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 0.1)'
              }
            }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para feedback */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(255, 75, 110, 0.9)',
            color: '#fff'
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            color: '#00ff00'
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 