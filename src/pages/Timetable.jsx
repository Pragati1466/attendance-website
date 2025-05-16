import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SyncIcon from '@mui/icons-material/Sync';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import TimetableView from '../components/TimetableView';
import CalendarIntegration from '../components/CalendarIntegration';
import TimetableCreator from '../components/TimetableCreator';
import Login from '../components/Auth/Login';
import SubjectInput from '../components/SubjectInput';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Timetable = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timetableData, setTimetableData] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleHolidayUpdate = (newHolidays) => {
    setHolidays(newHolidays);
  };

  const handleSubjectsSubmit = (newSubjects) => {
    setSubjects(newSubjects);
    setSetupComplete(true);
  };

  const handleTimetableSave = (newTimetable) => {
    setTimetableData(newTimetable);
    setActiveTab(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  if (!setupComplete) {
    return <SubjectInput onSubjectsSubmit={handleSubjectsSubmit} userId={user.uid} />;
  }

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
              icon={<EditCalendarIcon />}
              label="Create/Edit"
              iconPosition="start"
            />
            <Tab
              icon={<CalendarMonthIcon />}
              label="View"
              iconPosition="start"
            />
            <Tab
              icon={<SyncIcon />}
              label="Calendar Sync"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <TimetableCreator
            subjects={subjects}
            onSave={handleTimetableSave}
            userId={user.uid}
          />
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            {timetableData ? (
              <TimetableView
                timetableData={timetableData}
                holidays={holidays}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Please upload a timetable first
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" className="text-gradient" gutterBottom>
                Calendar Integration
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Sync with Google Calendar to import holidays and events
              </Typography>
            </Box>
            <Divider sx={{ my: 3 }} />
            <CalendarIntegration
              subjects={timetableData?.subjects || []}
              onHolidayUpdate={handleHolidayUpdate}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Timetable;
