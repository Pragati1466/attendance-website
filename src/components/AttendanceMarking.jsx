import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

const AttendanceMarking = ({ subjects, onAttendanceUpdate }) => {
  const [attendance, setAttendance] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [proxyNote, setProxyNote] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Initialize attendance state for today
    const today = format(new Date(), 'yyyy-MM-dd');
    const initialAttendance = {};
    subjects.forEach(subject => {
      initialAttendance[subject.id] = {
        date: today,
        status: 'pending',
        isProxy: false,
        note: '',
      };
    });
    setAttendance(initialAttendance);
  }, [subjects]);

  const handleAttendanceChange = (subjectId, status) => {
    setAttendance(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        status: status,
      },
    }));
    onAttendanceUpdate && onAttendanceUpdate(attendance);
  };

  const handleProxyClick = (subject) => {
    setSelectedSubject(subject);
    setProxyNote(attendance[subject.id]?.note || '');
    setOpenDialog(true);
  };

  const handleSaveProxy = () => {
    if (selectedSubject) {
      setAttendance(prev => ({
        ...prev,
        [selectedSubject.id]: {
          ...prev[selectedSubject.id],
          isProxy: true,
          note: proxyNote,
        },
      }));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
    setOpenDialog(false);
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#f44336';
      case 'proxy':
        return '#FF9800';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {showAlert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Proxy attendance marked. Please adjust this later if needed.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Subject</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>
                  <Typography variant="subtitle1">{subject.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {subject.startTime} - {subject.endTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={attendance[subject.id]?.status.toUpperCase()}
                    sx={{
                      backgroundColor: getAttendanceColor(attendance[subject.id]?.status),
                      color: 'white',
                    }}
                  />
                  {attendance[subject.id]?.isProxy && (
                    <Chip
                      label="PROXY"
                      size="small"
                      sx={{ ml: 1, backgroundColor: '#FF9800', color: 'white' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleAttendanceChange(subject.id, 'present')}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleAttendanceChange(subject.id, 'absent')}
                  >
                    <CancelIcon />
                  </IconButton>
                  <IconButton
                    color="warning"
                    onClick={() => handleProxyClick(subject)}
                  >
                    <SwapHorizIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Mark Proxy Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedSubject?.name}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Add a note (optional)"
              value={proxyNote}
              onChange={(e) => setProxyNote(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProxy}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceMarking;
