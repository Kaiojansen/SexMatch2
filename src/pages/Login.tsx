import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Container, Typography, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { keyframes } from '@mui/system';
import { motion } from 'framer-motion';
import '@fontsource/staatliches';
import styled from '@emotion/styled';

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Title = styled(Typography)({
  fontFamily: '"Staatliches", cursive',
  fontSize: '3.5rem',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '0',
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  letterSpacing: '1px',
  display: 'inline-block',
  lineHeight: 1
});

const Login: React.FC = () => {
  const { signInWithGoogle, error: authError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      // Erro será tratado pelo AuthContext
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
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
              animation: `${pulseAnimation} 2s infinite ease-in-out`,
              width: '100%',
              mb: 3
            }}
          >
            <FavoriteIcon 
              sx={{ 
                fontSize: { xs: 35, sm: 45 }, 
                color: '#ff4b6e',
                filter: 'drop-shadow(0 0 10px rgba(255,75,110,0.5))',
                marginTop: '2px'
              }} 
            />
            <Title variant="h1">SEXMATCH</Title>
          </Box>

          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              maxWidth: 400,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              mb: 2
            }}
          >
            Descubra e compartilhe suas fantasias com seu parceiro de forma divertida e segura
          </Typography>

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            size="large"
            sx={{
              backgroundColor: 'rgba(255, 75, 110, 0.9)',
              backdropFilter: 'blur(5px)',
              border: '2px solid rgba(255, 75, 110, 0.5)',
              borderRadius: 3,
              padding: '12px 24px',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              fontWeight: 500,
              textTransform: 'none',
              color: '#fff',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 75, 110, 1)',
                transform: 'scale(1.05)',
                boxShadow: '0 0 20px rgba(255, 75, 110, 0.3)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 75, 110, 0.5)',
                color: 'rgba(255, 255, 255, 0.7)',
              }
            }}
          >
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </Button>

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              mt: 2
            }}
          >
            Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade
          </Typography>
        </Box>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
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
    </Container>
  );
};

export default Login; 