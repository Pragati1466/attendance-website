import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import AttendanceAnalytics from '../components/AttendanceAnalytics';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Reports = () => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsSnapshot, attendanceSnapshot] = await Promise.all([
          getDocs(collection(db, 'subjects')),
          getDocs(collection(db, 'attendance')),
        ]);

        setSubjects(subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));

        setAttendanceData(attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDateRangeSubmit = () => {
    setOpenDialog(false);
  };

  const getFilteredAttendanceData = () => {
    if (!dateRange.start || !dateRange.end) return attendanceData;

    return attendanceData.filter(record =>
      isWithinInterval(record.timestamp, {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end),
      })
    );
  };

  const calculateSubjectStats = (subjectId) => {
    const filteredData = getFilteredAttendanceData().filter(
      record => record.subjectId === subjectId
    );

    const total = filteredData.length;
    const present = filteredData.filter(
      record => record.status === 'present'
    ).length;
    const proxy = filteredData.filter(
      record => record.status === 'proxy'
    ).length;
    const absent = total - present - proxy;

    return {
      total,
      present,
      proxy,
      absent,
      percentage: total ? Math.round(((present + proxy) / total) * 100) : 0,
    };
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" className="text-gradient">
            Attendance Reports
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #805AD5 30%, #6B46C1 90%)',
              },
            }}
          >
            Set Date Range
          </Button>
        </Box>

        {dateRange.start && dateRange.end && (
          <Paper sx={{ p: 2, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
            <Typography>
              Showing attendance from{' '}
              <strong>{format(dateRange.start, 'MMM d, yyyy')}</strong> to{' '}
              <strong>{format(dateRange.end, 'MMM d, yyyy')}</strong>
            </Typography>
          </Paper>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <AttendanceAnalytics
                attendanceData={getFilteredAttendanceData()}
                subjects={subjects}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Detailed Subject Reports
              </Typography>
              <Grid container spacing={3}>
                {subjects.map(subject => {
                  const stats = calculateSubjectStats(subject.id);
                  return (
                    <Grid item xs={12} md={4} key={subject.id}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          bgcolor: stats.percentage < 75 ? 'error.light' : 'success.light',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          {subject.name}
                        </Typography>
                        <Typography variant="body1">
                          Total Classes: {stats.total}
                        </Typography>
                        <Typography variant="body1">
                          Present: {stats.present}
                        </Typography>
                        <Typography variant="body1">
                          Proxy: {stats.proxy}
                        </Typography>
                        <Typography variant="body1">
                          Absent: {stats.absent}
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 2 }}>
                          {stats.percentage}%
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Set Date Range</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                  renderInput={(params) => <TextField {...params} />}
                  minDate={dateRange.start}
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDateRangeSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
              }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Reports;
