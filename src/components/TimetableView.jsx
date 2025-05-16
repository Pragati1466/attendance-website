import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

const TimetableView = () => {
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Fetch user's saved timetables
  const fetchTimetables = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'timetables'), 
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const fetchedTimetables = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setTimetables(fetchedTimetables);
  };

  // Mark attendance with optional notes
  const markAttendance = async () => {
    const user = auth.currentUser;
    if (!user || !selectedPeriod) return;

    try {
      await addDoc(collection(db, 'attendance'), {
        userId: user.uid,
        subject: selectedPeriod.subject,
        color: selectedPeriod.color,
        day: selectedPeriod.day,
        notes: additionalNotes,
        timestamp: serverTimestamp(),
        timetableId: selectedTimetable.id
      });

      alert(`Attendance marked for ${selectedPeriod.subject}`);
      setApplyDialogOpen(false);
      setAdditionalNotes('');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  // Open apply dialog for a specific period
  const openApplyDialog = (day, period) => {
    setSelectedPeriod({
      ...period,
      day: day.day
    });
    setApplyDialogOpen(true);
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Timetables
      </Typography>

      {/* Timetable Selection */}
      {timetables.map((timetable, index) => (
        <Button 
          key={timetable.id}
          variant="contained" 
          onClick={() => setSelectedTimetable(timetable)}
          sx={{ m: 1 }}
        >
          Timetable {index + 1}
        </Button>
      ))}

      {/* Selected Timetable View */}
      {selectedTimetable && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Timetable Details
          </Typography>
          <Grid container spacing={2}>
            {selectedTimetable.grid.map((day) => (
              <Grid item xs={12} key={day.day}>
                <Typography variant="h6">{day.day}</Typography>
                <Grid container spacing={1}>
                  {day.periods.map((period, periodIndex) => (
                    <Grid item xs={2} key={periodIndex}>
                      <Paper
                        sx={{
                          p: 1,
                          bgcolor: period.color || '#f0f0f0',
                          color: period.color ? 'white' : 'black',
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="body2">
                          {period.subject || 'Free'}
                        </Typography>
                        {period.subject && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              color: period.color ? 'white' : 'primary.main', 
                              borderColor: period.color ? 'white' : 'primary.main',
                              mt: 1 
                            }}
                            onClick={() => openApplyDialog(day, period)}
                          >
                            Apply
                          </Button>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Attendance Application Dialog */}
      <Dialog 
        open={applyDialogOpen} 
        onClose={() => setApplyDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>
          Apply Attendance for {selectedPeriod?.subject}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Notes (Optional)"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={markAttendance}
          >
            Confirm Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TimetableView;