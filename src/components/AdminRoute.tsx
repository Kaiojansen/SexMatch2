import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuthenticated');
      setIsAuthenticated(auth === 'true');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
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

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute; 