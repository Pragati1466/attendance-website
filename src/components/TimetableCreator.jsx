import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Container,
  Stepper,
  Step,
  StepLabel,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMinutes } from 'date-fns';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Predefined color palette
const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FDCB6E', // Yellow
  '#6C5CE7', // Purple
  '#A8E6CF', // Mint Green
  '#FF8ED4', // Pink
  '#FAD390', // Light Orange
  '#55E6C1', // Seafoam Green
  '#5F27CD'  // Deep Purple
];

const TimetableCreator = ({ onSave, userId }) => {
  // Workflow Steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Timetable Settings',
    'Subjects',
    'Create Timetable'
  ];

  // Timetable Settings
  const [startTime, setStartTime] = useState(new Date().setHours(8, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(16, 0, 0));
  const [classDuration, setClassDuration] = useState(45);
  const [breakDuration, setBreakDuration] = useState(15);
  const [workingDays, setWorkingDays] = useState(5);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);

  // Subjects
  const [totalSubjectsCount, setTotalSubjectsCount] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState({ name: '', color: '' });

  // Timetable Grid
  const [timetableGrid, setTimetableGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleNextStep = () => {
    if (activeStep === 0) {
      // Validate timetable settings
      if (!startTime || !endTime || classDuration <= 0 || workingDays <= 0 || periodsPerDay <= 0) {
        alert('Please fill all settings correctly');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate subjects
      if (subjects.length !== totalSubjectsCount) {
        alert(`Please enter all ${totalSubjectsCount} subjects`);
        return;
      }
      generateTimetableGrid();
      setActiveStep(2);
    }
  };

  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const generateTimetableGrid = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].slice(0, workingDays);
    const grid = days.map(day => ({
      day,
      periods: Array(periodsPerDay).fill().map(() => ({ subject: null, color: null }))
    }));
    setTimetableGrid(grid);
  };

  const handleAddSubject = () => {
    if (currentSubject.name.trim() && subjects.length < totalSubjectsCount) {
      // Assign a color if not already selected
      const subjectWithColor = {
        ...currentSubject,
        color: currentSubject.color || COLOR_PALETTE[subjects.length % COLOR_PALETTE.length]
      };

      setSubjects([...subjects, subjectWithColor]);

      // Reset current subject
      setCurrentSubject({ name: '', color: '' });
    }
  };

  const handleCellClick = (dayIndex, periodIndex) => {
    setSelectedCell({ dayIndex, periodIndex });
    setEditDialogOpen(true);
  };

  const handleSaveCell = (selectedSubject) => {
    if (selectedCell) {
      const newGrid = [...timetableGrid];
      const subject = subjects.find(s => s.name === selectedSubject);

      newGrid[selectedCell.dayIndex].periods[selectedCell.periodIndex] = {
        subject: selectedSubject,
        color: subject ? subject.color : null
      };

      setTimetableGrid(newGrid);
      setEditDialogOpen(false);
    }
  };

  const handleSaveTimetable = async () => {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to save your timetable');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      // Validate timetable data before saving
      if (!validateTimetableData()) {
        return;
      }

      // Prepare timetable data for saving
      const timetableData = {
        userId: user.uid, // Use the authenticated user's UID
        settings: {
          startTime: startTime.toString(),
          endTime: endTime.toString(),
          classDuration,
          breakDuration,
          workingDays,
          periodsPerDay
        },
        subjects: subjects,
        grid: timetableGrid.map(day => ({
          day: day.day,
          periods: day.periods.map(period => ({
            subject: period.subject,
            color: period.color
          }))
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      const timetablesRef = collection(db, 'timetables');
      const docRef = await addDoc(timetablesRef, timetableData);

      // Call onSave callback if provided
      if (onSave) {
        onSave(timetableData);
      }

      // Optional: Show success message or navigate
      alert('Timetable saved successfully!');
    } catch (error) {
      console.error('Error saving timetable:', error);

      // More specific error handling
      if (error.code === 'permission-denied') {
        setSaveError('You do not have permission to save this timetable. Please check your authentication.');
        alert('Permission denied. Please log in and try again.');
      } else {
        setSaveError(`Failed to save timetable: ${error.message}`);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Validate timetable data before saving
  const validateTimetableData = () => {
    // Check if all required fields are filled
    if (!startTime || !endTime) {
      alert('Please set start and end times');
      return false;
    }

    // Ensure all periods are filled
    const incompletePeriods = timetableGrid.some(day =>
      day.periods.some(period => !period.subject)
    );

    if (incompletePeriods) {
      alert('Please fill in all periods before saving');
      return false;
    }

    return true;
  };

  const renderTimetableSettings = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Timetable Configuration</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Class Duration (min)"
            type="number"
            fullWidth
            value={classDuration}
            onChange={(e) => setClassDuration(Number(e.target.value))}
            inputProps={{ min: 30, max: 90 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Break Duration (min)"
            type="number"
            fullWidth
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            inputProps={{ min: 0, max: 30 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Working Days"
            type="number"
            fullWidth
            value={workingDays}
            onChange={(e) => setWorkingDays(Number(e.target.value))}
            inputProps={{ min: 1, max: 6 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Periods Per Day"
            type="number"
            fullWidth
            value={periodsPerDay}
            onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderSubjectsStep = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Subject Details</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <TextField
          label="Total Number of Subjects"
          type="number"
          value={totalSubjectsCount}
          onChange={(e) => {
            setTotalSubjectsCount(Number(e.target.value));
            setSubjects([]);
          }}
          inputProps={{ min: 1, max: 10 }}
          sx={{ flexGrow: 1 }}
        />
      </Box>
      {totalSubjectsCount > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <TextField
            label={`Subject ${subjects.length + 1} Name`}
            value={currentSubject.name}
            onChange={(e) => setCurrentSubject(prev => ({ ...prev, name: e.target.value }))}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            type="color"
            label="Color"
            value={currentSubject.color || COLOR_PALETTE[subjects.length % COLOR_PALETTE.length]}
            onChange={(e) => setCurrentSubject(prev => ({ ...prev, color: e.target.value }))}
            sx={{ width: 100 }}
          />
          <Button
            variant="contained"
            onClick={handleAddSubject}
            disabled={!currentSubject.name || subjects.length >= totalSubjectsCount}
          >
            Add Subject
          </Button>
        </Box>
      )}
      {subjects.length > 0 && (
        <Box>
          <Typography variant="subtitle1">Added Subjects:</Typography>
          {subjects.map((subject, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: subject.color,
                  mr: 2,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2">
                {index + 1}. {subject.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );

  const renderTimetableGrid = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Create Timetable</Typography>
      <Grid container spacing={1}>
        {/* Time slots header */}
        <Grid item xs={2}>
          <Box sx={{ p: 1, border: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2">Time / Day</Typography>
          </Box>
        </Grid>
        {timetableGrid.map((day) => (
          <Grid item xs={2} key={day.day}>
            <Box sx={{ p: 1, border: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2">{day.day}</Typography>
            </Box>
          </Grid>
        ))}

        {/* Time slots and periods */}
        {timetableGrid[0]?.periods.map((_, periodIndex) => (
          <Grid container key={periodIndex}>
            <Grid item xs={2}>
              <Box sx={{ p: 1, border: '1px solid #ddd' }}>
                <Typography variant="caption">
                  Period {periodIndex + 1}
                </Typography>
              </Box>
            </Grid>
            {timetableGrid.map((day, dayIndex) => (
              <Grid item xs={2} key={`${day.day}-${periodIndex}`}>
                <Box
                  sx={{
                    p: 1,
                    border: '1px solid #ddd',
                    minHeight: '60px',
                    cursor: 'pointer',
                    bgcolor: day.periods[periodIndex].color || '#f5f5f5',
                    color: day.periods[periodIndex].color ? 'white' : 'inherit',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleCellClick(dayIndex, periodIndex)}
                >
                  <Typography variant="body2">
                    {day.periods[periodIndex].subject || 'Click to add'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>

      {/* Subject Selection Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth>
        <DialogTitle>Select Subject</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={''}
              label="Subject"
              onChange={(e) => handleSaveCell(e.target.value)}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.name} value={subject.name}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: subject.color,
                      mr: 2,
                      borderRadius: '50%'
                    }}
                  />
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && renderTimetableSettings()}
        {activeStep === 1 && renderSubjectsStep()}
        {activeStep === 2 && renderTimetableGrid()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handlePrevStep}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === 2 ? handleSaveTimetable : handleNextStep}
            disabled={activeStep === 2 && (saving || timetableGrid.some(day => day.periods.some(period => !period.subject)))}
          >
            {activeStep === 2
              ? (saving ? 'Saving...' : 'Save Timetable')
              : 'Next'}
          </Button>
        </Box>

        {saveError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {saveError}
          </Typography>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default TimetableCreator;
