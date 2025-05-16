import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TextField, MenuItem } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const TimetableUpload = ({ onTimetableProcessed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !room || !day || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const classData = {
        subject: subject.toUpperCase(),
        room,
        days: [parseInt(day)],
        startTime: startTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        endTime: endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        id: `${day}-${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}-${subject}`,
      };

      // Save to Firestore
      await addDoc(collection(db, 'classes'), classData);

      // Update parent component
      onTimetableProcessed({ classes: [classData] });

      // Clear form
      setSubject('');
      setRoom('');
      setDay('');
      setStartTime(null);
      setEndTime(null);
      setError('');
    } catch (err) {
      console.error('Error saving class:', err);
      setError('Failed to save the class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Add Class to Timetable
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Subject Code"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        fullWidth
        placeholder="e.g., CS101"
      />

      <TextField
        label="Room Number"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        required
        fullWidth
        placeholder="e.g., 301"
      />

      <TextField
        select
        label="Day"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        required
        fullWidth
      >
        {days.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TimePicker
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          renderInput={(params) => <TextField {...params} fullWidth required />}
        />

        <TimePicker
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          renderInput={(params) => <TextField {...params} fullWidth required />}
        />
      </LocalizationProvider>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{
          background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
          color: 'white',
          py: 1.5,
          fontSize: '1.1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(45deg, #805AD5 30%, #6B46C1 90%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(107, 70, 193, 0.4)',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <span>Saving...</span>
          </Box>
        ) : (
          'Add Class'
        )}
      </Button>
    </Box>
  );
};

export default TimetableUpload;
