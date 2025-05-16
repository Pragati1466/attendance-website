import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { auth, googleProvider } from '../../firebase';
import { 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence,
  GoogleAuthProvider 
} from 'firebase/auth';

const Login = ({ onLoginSuccess, redirectPath }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure persistence
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in with popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the user's ID token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      
      // Pass the authenticated user to parent
      onLoginSuccess(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Please allow popups for this website to sign in with Google.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom className="text-gradient">
          Welcome Back!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Sign in to create and manage your timetable
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{
            py: 1.5,
            width: '100%',
            bgcolor: '#fff',
            color: '#757575',
            border: '1px solid #ddd',
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ mr: 1 }} />
          ) : (
            'Continue with Google'
          )}
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
