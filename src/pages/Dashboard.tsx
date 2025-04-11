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
  Chip,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const PartnerItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  marginBottom: '8px',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    paddingBottom: '12px'
  }
}));

const PartnerInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'flex-start'
  }
}));

const OnlineStatus = styled('div')(({ online }: { online: boolean }) => ({
  position: 'absolute',
  top: '50%',
  right: '12px',
  transform: 'translateY(-50%)',
  padding: '4px 8px',
  borderRadius: '12px',
  backgroundColor: online ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
  color: online ? '#4CAF50' : '#f44336',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  '@media (max-width: 600px)': {
    top: '12px',
    right: '12px',
    transform: 'none'
  }
}));

const StartGameButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  borderRadius: '20px',
  padding: '8px 24px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginTop: '8px'
  }
}));

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [partners, setPartners] = useState<string[]>([]);
  const [partnerNames, setPartnerNames] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editNameDialog, setEditNameDialog] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserCode(data.code);
          setUserName(data.name || '');
          setPartners(data.partners || []);
          if (!data.name) {
            setShowNameDialog(true);
          }
          
          // Buscar nomes dos parceiros
          const partnerIds = data.partners || [];
          const names: {[key: string]: string} = {};
          
          for (const partnerId of partnerIds) {
            const partnerDoc = await getDoc(doc(db, 'users', partnerId));
            if (partnerDoc.exists()) {
              names[partnerId] = partnerDoc.data().name || 'Sem nome';
            }
          }
          
          setPartnerNames(names);
        } else {
          // Gerar código único se não existir
          const newCode = generateUniqueCode();
          await setDoc(userDoc, {
            code: newCode,
            partners: [],
            createdAt: new Date()
          });
          setUserCode(newCode);
          setShowNameDialog(true);
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
      // Buscar usuário pelo código
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('code', '==', partnerCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Código de parceiro inválido');
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();

      // Verificar se não é o próprio usuário
      if (partnerId === currentUser?.uid) {
        setError('Você não pode adicionar a si mesmo como parceiro');
        return;
      }

      // Verificar se já é parceiro
      if (partners.includes(partnerId)) {
        setError('Este parceiro já foi adicionado');
        return;
      }

      // Atualizar o documento do usuário atual
      const userDoc = doc(db, 'users', currentUser?.uid || '');
      await updateDoc(userDoc, {
        partners: arrayUnion(partnerId)
      });

      // Atualizar o documento do parceiro
      const partnerUserDoc = doc(db, 'users', partnerId);
      await updateDoc(partnerUserDoc, {
        partners: arrayUnion(currentUser?.uid || '')
      });

      // Atualizar a lista de parceiros e seus nomes
      setPartners([...partners, partnerId]);
      setPartnerNames(prev => ({
        ...prev,
        [partnerId]: partnerData.name || 'Sem nome'
      }));
      
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
    if (!partnerId) {
      setError('Parceiro inválido');
      return;
    }
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

  const handleSetName = async () => {
    if (!currentUser || !userName.trim()) return;
    
    const userDoc = doc(db, 'users', currentUser.uid);
    await updateDoc(userDoc, {
      name: userName.trim()
    });
    setShowNameDialog(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditName = () => {
    setTempName(userName);
    setEditNameDialog(true);
    handleMenuClose();
  };

  const handleSaveName = async () => {
    if (!currentUser || !tempName.trim()) return;
    
    const userDoc = doc(db, 'users', currentUser.uid);
    await updateDoc(userDoc, {
      name: tempName.trim()
    });
    setUserName(tempName.trim());
    setEditNameDialog(false);
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
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontFamily: '"Staatliches", cursive',
                color: '#fff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 0
              }}
            >
              <FavoriteIcon sx={{ color: '#ff4b6e' }} />
              Dashboard
            </Typography>
            <IconButton
              onClick={handleMenuClick}
              sx={{
                color: '#ff4b6e',
                '&:hover': {
                  backgroundColor: 'rgba(255, 75, 110, 0.2)'
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
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
                  <PartnerItem key={partnerId}>
                    <PartnerInfo>
                      <Avatar sx={{ bgcolor: '#ff4b6e' }}>
                        {(partnerNames[partnerId] || 'S').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        {partnerNames[partnerId] || 'Sem nome'}
                      </Typography>
                    </PartnerInfo>
                    
                    <OnlineStatus online={true}>
                      Online
                    </OnlineStatus>

                    <StartGameButton
                      onClick={() => handleStartGame(partnerId)}
                      startIcon={<PlayArrowIcon />}
                    >
                      Iniciar Jogo
                    </StartGameButton>
                  </PartnerItem>
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

      <Dialog open={showNameDialog} onClose={() => {}}>
        <DialogTitle>Choose Your Name</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSetName}
              disabled={!userName.trim()}
            >
              Save Name
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid rgba(255, 75, 110, 0.2)',
            backdropFilter: 'blur(10px)',
            '& .MuiMenuItem-root': {
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 0.2)'
              }
            }
          }
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <ListItemIcon>
            <PersonIcon sx={{ color: '#ff4b6e' }} />
          </ListItemIcon>
          <ListItemText 
            primary={userName || 'Sem nome'} 
            secondary="Seu nome atual"
            sx={{ color: '#fff' }}
          />
        </MenuItem>
        <Divider sx={{ bgcolor: 'rgba(255, 75, 110, 0.2)' }} />
        <MenuItem onClick={handleEditName}>
          <ListItemIcon>
            <EditIcon sx={{ color: '#ff4b6e' }} />
          </ListItemIcon>
          <ListItemText primary="Mudar Nome" />
        </MenuItem>
        <Divider sx={{ bgcolor: 'rgba(255, 75, 110, 0.2)' }} />
        <MenuItem onClick={() => { setShowTermsDialog(true); handleMenuClose(); }}>
          <ListItemIcon>
            <DescriptionIcon sx={{ color: '#ff4b6e' }} />
          </ListItemIcon>
          <ListItemText primary="Termos de Uso" />
        </MenuItem>
        <MenuItem onClick={() => { setShowPrivacyDialog(true); handleMenuClose(); }}>
          <ListItemIcon>
            <SecurityIcon sx={{ color: '#ff4b6e' }} />
          </ListItemIcon>
          <ListItemText primary="Política de Privacidade" />
        </MenuItem>
      </Menu>

      <Dialog 
        open={editNameDialog} 
        onClose={() => setEditNameDialog(false)}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 20, 0.95)',
            border: '1px solid rgba(255, 75, 110, 0.2)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Editar Nome</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Seu Nome"
            type="text"
            fullWidth
            variant="outlined"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
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
            onClick={() => setEditNameDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveName}
            disabled={!tempName.trim()}
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

      {/* Termos de Uso Dialog */}
      <Dialog 
        open={showTermsDialog} 
        onClose={() => setShowTermsDialog(false)}
        maxWidth="md"
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
          Termos de Uso
        </DialogTitle>
        <DialogContent sx={{ color: '#fff', py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>1. Aceitação dos Termos</Typography>
            <Typography>
              Ao acessar e usar o SexMatch, você concorda em cumprir e estar vinculado a estes Termos de Uso.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>2. Uso do Serviço</Typography>
            <Typography>
              O SexMatch é uma plataforma para adultos que promove encontros e conexões. Você concorda em:
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 2 }}>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Manter um comportamento respeitoso com todos os usuários</Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Não compartilhar conteúdo inapropriado ou ilegal</Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Respeitar a privacidade e consentimento dos outros usuários</Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>3. Responsabilidades</Typography>
            <Typography>
              Você é responsável por todas as atividades realizadas em sua conta e por manter a confidencialidade de suas credenciais.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>4. Modificações</Typography>
            <Typography>
              Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas aos usuários.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 75, 110, 0.2)', p: 2 }}>
          <Button 
            onClick={() => setShowTermsDialog(false)}
            sx={{ 
              color: '#ff4b6e',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 0.1)'
              }
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Política de Privacidade Dialog */}
      <Dialog 
        open={showPrivacyDialog} 
        onClose={() => setShowPrivacyDialog(false)}
        maxWidth="md"
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
          Política de Privacidade
        </DialogTitle>
        <DialogContent sx={{ color: '#fff', py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>1. Coleta de Dados</Typography>
            <Typography>
              Coletamos apenas as informações necessárias para fornecer nossos serviços, incluindo:
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 2 }}>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Informações básicas de perfil</Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Preferências de uso</Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Dados de interação com outros usuários</Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>2. Uso dos Dados</Typography>
            <Typography>
              Utilizamos seus dados para:
            </Typography>
            <List sx={{ listStyleType: 'disc', pl: 2 }}>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Melhorar sua experiência no aplicativo</Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Facilitar conexões com outros usuários</Typography>
              </ListItem>
              <ListItem sx={{ display: 'list-item' }}>
                <Typography>Garantir a segurança da plataforma</Typography>
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>3. Proteção de Dados</Typography>
            <Typography>
              Implementamos medidas de segurança rigorosas para proteger suas informações pessoais contra acesso não autorizado.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#ff4b6e', mb: 1 }}>4. Seus Direitos</Typography>
            <Typography>
              Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 75, 110, 0.2)', p: 2 }}>
          <Button 
            onClick={() => setShowPrivacyDialog(false)}
            sx={{ 
              color: '#ff4b6e',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 0.1)'
              }
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 