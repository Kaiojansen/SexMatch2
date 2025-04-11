import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PartnerRequest from './pages/PartnerRequest';
import Game from './pages/Game';
import Admin from './pages/Admin';
import './styles/fonts.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4b6e',
      dark: '#ff1f4c',
      light: '#ff7591',
    },
    secondary: {
      main: '#4a4a4a',
      dark: '#333333',
      light: '#666666',
    },
    background: {
      default: '#121212',
      paper: 'rgba(20, 20, 20, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#ff4b6e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: "'Cinzel', serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Cinzel', serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Cinzel', serif",
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(40,0,0,0.95) 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #ff4b6e 30%, #ff1f4c 90%)',
          boxShadow: '0 3px 10px rgba(255, 75, 110, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff1f4c 30%, #ff4b6e 90%)',
            boxShadow: '0 5px 15px rgba(255, 75, 110, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 75, 110, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(20, 20, 20, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 75, 110, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/partner-request" element={<PartnerRequest />} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/game/:partnerId" element={<PrivateRoute><Game /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 