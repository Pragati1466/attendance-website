import React, { useState, useEffect } from 'react';
import { Container, Box, Paper, Tabs, Tab, Typography, Button } from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AttendanceMarking from '../components/AttendanceMarking';
import AttendanceAnalytics from '../components/AttendanceAnalytics';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [semesterDates, setSemesterDates] = useState({
    start: null,
    end: null,
  });

  useEffect(() => {
    // Fetch subjects from Firestore
    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(db, 'subjects'));
      const subjectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjectsData);
    };

    // Fetch attendance records
    const fetchAttendance = async () => {
      const querySnapshot = await getDocs(collection(db, 'attendance'));
      const attendanceRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceData(attendanceRecords);
    };

    fetchSubjects();
    fetchAttendance();
  }, []);

  const handleAttendanceUpdate = async (newAttendance) => {
    try {
      // Add attendance record to Firestore
      const attendanceRef = collection(db, 'attendance');
      await addDoc(attendanceRef, {
        ...newAttendance,
        timestamp: new Date(),
      });

      // Refresh attendance data
      const querySnapshot = await getDocs(collection(db, 'attendance'));
      const attendanceRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceData(attendanceRecords);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
              },
              '& .Mui-selected': {
                color: '#6B46C1',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#6B46C1',
              },
            }}
          >
            <Tab
              icon={<DateRangeIcon />}
              label="Mark Attendance"
              iconPosition="start"
            />
            <Tab
              icon={<AssessmentIcon />}
              label="Analytics"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" className="text-gradient" gutterBottom>
                Today's Attendance
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Mark your attendance for each subject
              </Typography>
            </Box>
            <AttendanceMarking
              subjects={subjects}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <AttendanceAnalytics
              attendanceData={attendanceData}
              subjects={subjects}
              threshold={75}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Attendance;
