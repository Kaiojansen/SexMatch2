import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(40,0,0,0.95) 100%)',
        }}
      >
        <CircularProgress
          sx={{
            color: '#ff4b6e',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
          size={60}
        />
      </Box>
    );
  }

  if (!currentUser) {
    console.log('No user found, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 