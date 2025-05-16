import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const defaultSubjects = [
  { name: 'Mathematics', color: '#FF5252' },
  { name: 'Physics', color: '#448AFF' },
  { name: 'Chemistry', color: '#66BB6A' },
  { name: 'Biology', color: '#FFA726' },
  { name: 'English', color: '#BA68C8' },
  { name: 'Computer Science', color: '#4DB6AC' },
  { name: 'Break', color: '#90A4AE' },
];

const SubjectSetup = ({ userId, onComplete }) => {
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#000000' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExistingSubjects = async () => {
      try {
        const subjectsRef = collection(db, 'subjects');
        const q = query(subjectsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const existingSubjects = snapshot.docs[0].data().subjects;
          setSubjects(existingSubjects);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
        setError('Failed to load your subjects. Using default subjects.');
      } finally {
        setLoading(false);
      }
    };

    loadExistingSubjects();
  }, [userId]);

  const handleAddSubject = () => {
    if (newSubject.name.trim()) {
      setSubjects([...subjects, { ...newSubject }]);
      setNewSubject({ name: '', color: '#000000' });
    }
  };

  const handleDeleteSubject = (index) => {
    if (subjects[index].name !== 'Break') {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const subjectsData = {
        userId,
        subjects,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const subjectsRef = collection(db, 'subjects');
      await addDoc(subjectsRef, subjectsData);
      
      onComplete(subjects);
    } catch (error) {
      console.error('Error saving subjects:', error);
      setError('Failed to save subjects. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Set Up Your Subjects
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add the subjects you want to include in your timetable. Each subject can have its own color.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {subjects.map((subject, index) => (
            <Grid item key={index}>
              <Chip
                label={subject.name}
                sx={{
                  bgcolor: subject.color,
                  color: 'white',
                  '&:hover': {
                    bgcolor: subject.color,
                    opacity: 0.9,
                  },
                }}
                onDelete={
                  subject.name !== 'Break' 
                    ? () => handleDeleteSubject(index)
                    : undefined
                }
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            label="Subject Name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            sx={{ flexGrow: 1 }}
          />
          <input
            type="color"
            value={newSubject.color}
            onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
            style={{ width: 50, padding: 0 }}
          />
          <Button 
            variant="contained" 
            onClick={handleAddSubject}
            disabled={!newSubject.name.trim()}
          >
            Add Subject
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || subjects.length < 2}
          >
            {saving ? 'Saving...' : 'Continue to Create Timetable'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubjectSetup;
