import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SubjectInput = ({ onSubjectsSubmit, userId }) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [error, setError] = useState(null);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    
    if (subjects.some(s => s.toLowerCase() === newSubject.trim().toLowerCase())) {
      setError('This subject already exists');
      return;
    }

    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject('');
    setError(null);
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter(subject => subject !== subjectToRemove));
  };

  const handleSubmit = async () => {
    if (subjects.length < 1) {
      setError('Please add at least one subject');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const subjectsData = {
        userId,
        subjects: subjects.map(name => ({ name })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save subjects to Firestore
      const subjectsRef = collection(db, 'subjects');
      await addDoc(subjectsRef, subjectsData);

      // Pass subjects to parent component
      onSubjectsSubmit(subjects.map(name => ({ name })));
    } catch (error) {
      console.error('Error saving subjects:', error);
      setError(
        error.code === 'permission-denied' 
          ? 'You do not have permission to save subjects. Please check if you are logged in.'
          : 'Failed to save subjects. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubject();
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom className="text-gradient">
        Add Your Subjects
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter the subjects you want to include in your timetable
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          label="Subject Name"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Mathematics"
        />
        <IconButton
          color="primary"
          onClick={handleAddSubject}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {subjects.map((subject, index) => (
          <Chip
            key={index}
            label={subject}
            onDelete={() => handleRemoveSubject(subject)}
            deleteIcon={<DeleteIcon />}
            sx={{
              bgcolor: `hsl(${(index * 137.5) % 360}, 70%, 85%)`,
            }}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={subjects.length === 0 || loading}
      >
        Continue to Create Timetable
      </Button>
    </Paper>
  );
};

export default SubjectInput;
