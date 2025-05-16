import React, { useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Hero = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <Box
      sx={{
        background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        pt: 8,
      }}
    >
      <Container>
        <Box data-aos="fade-up">
          <Typography
            variant="h1"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              fontSize: { xs: '2.5rem', md: '4rem' },
            }}
          >
            Simplify Your College Life with Smart Attendance Tracking
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Track your attendance, set reminders, and stay on top of your academic journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: 'white',
              color: '#6B46C1',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
