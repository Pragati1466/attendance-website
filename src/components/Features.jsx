import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Container } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';

const features = [
  {
    icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
    title: 'Digital Timetable',
    description: 'Upload and scan your timetable using OCR technology',
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
    title: 'Attendance Tracking',
    description: 'Mark attendance daily and track your progress',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 40 }} />,
    title: 'Analytics',
    description: 'View detailed attendance reports and statistics',
  },
  {
    icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
    title: 'Smart Reminders',
    description: 'Get notifications for classes and low attendance',
  },
];

const Features = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container>
        <Typography
          variant="h2"
          align="center"
          sx={{ mb: 6, color: '#2D3748', fontWeight: 'bold' }}
          data-aos="fade-up"
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                data-aos="fade-up"
                data-aos-delay={index * 100}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#6B46C1',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    align="center"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography align="center" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
