import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Aqui você pode implementar sua própria lógica de autenticação
      // Por exemplo, verificar contra um hash armazenado em variáveis de ambiente
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (error) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(40,0,0,0.95) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4 },
        position: 'relative',
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
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 3, sm: 6 },
            borderRadius: 4,
            background: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 75, 110, 0.2)',
            maxWidth: 500,
            width: '100%',
            position: 'relative',
            zIndex: 1,
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                width: '100%',
                mb: 3
              }}
            >
              <FavoriteIcon 
                sx={{ 
                  fontSize: { xs: 35, sm: 45 }, 
                  color: '#ff4b6e',
                  filter: 'drop-shadow(0 0 10px rgba(255,75,110,0.5))',
                  marginTop: '-2px',
                  display: 'flex'
                }} 
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Staatliches", cursive',
                  color: '#fff',
                  textAlign: 'center',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: '2px',
                  lineHeight: '0.8',
                }}
              >
                Admin Login
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              <TextField
                fullWidth
                label="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#ff4b6e',
                  '&:hover': {
                    backgroundColor: '#ff1f4c'
                  },
                  height: '48px'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AdminLogin; 