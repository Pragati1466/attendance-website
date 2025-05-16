import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import Chart from 'chart.js/auto';

const AttendanceAnalytics = ({ attendanceData, subjects, threshold = 75 }) => {
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: subjects.map(subject => subject.name),
          datasets: [{
            label: 'Attendance Percentage',
            data: subjects.map(subject => calculateAttendancePercentage(subject.id)),
            backgroundColor: subjects.map(subject => 
              calculateAttendancePercentage(subject.id) < threshold
                ? 'rgba(244, 67, 54, 0.7)'
                : 'rgba(107, 70, 193, 0.7)'
            ),
            borderColor: subjects.map(subject =>
              calculateAttendancePercentage(subject.id) < threshold
                ? 'rgb(244, 67, 54)'
                : 'rgb(107, 70, 193)'
            ),
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Subject-wise Attendance',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => value + '%',
              },
            },
          },
        },
      });

      return () => chart.destroy();
    }
  }, [attendanceData, subjects, threshold]);

  useEffect(() => {
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Present', 'Absent', 'Proxy'],
          datasets: [{
            data: calculateOverallStats(),
            backgroundColor: [
              'rgba(76, 175, 80, 0.7)',
              'rgba(244, 67, 54, 0.7)',
              'rgba(255, 152, 0, 0.7)',
            ],
            borderColor: [
              'rgb(76, 175, 80)',
              'rgb(244, 67, 54)',
              'rgb(255, 152, 0)',
            ],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Overall Attendance Distribution',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
          },
        },
      });

      return () => chart.destroy();
    }
  }, [attendanceData]);

  const calculateAttendancePercentage = (subjectId) => {
    const subjectAttendance = attendanceData.filter(record => record.subjectId === subjectId);
    if (!subjectAttendance.length) return 0;

    const present = subjectAttendance.filter(record => 
      record.status === 'present' || record.status === 'proxy'
    ).length;
    return Math.round((present / subjectAttendance.length) * 100);
  };

  const calculateOverallStats = () => {
    const present = attendanceData.filter(record => record.status === 'present').length;
    const absent = attendanceData.filter(record => record.status === 'absent').length;
    const proxy = attendanceData.filter(record => record.status === 'proxy').length;
    return [present, absent, proxy];
  };

  const overallPercentage = () => {
    if (!attendanceData.length) return 0;
    const present = attendanceData.filter(record => 
      record.status === 'present' || record.status === 'proxy'
    ).length;
    return Math.round((present / attendanceData.length) * 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" className="text-gradient" gutterBottom>
        Attendance Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Attendance
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={overallPercentage()}
                  size={80}
                  thickness={4}
                  sx={{
                    color: overallPercentage() >= threshold ? 'primary.main' : 'error.main',
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" color="text.secondary">
                    {overallPercentage()}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {subjects.map(subject => {
          const percentage = calculateAttendancePercentage(subject.id);
          return (
            <Grid item xs={12} md={4} key={subject.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {subject.name}
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={percentage}
                      size={80}
                      thickness={4}
                      sx={{
                        color: percentage >= threshold ? 'primary.main' : 'error.main',
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {subjects.some(subject => calculateAttendancePercentage(subject.id) < threshold) && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Some subjects have attendance below the minimum requirement of {threshold}%
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <canvas ref={chartRef} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <canvas ref={pieChartRef} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceAnalytics;
