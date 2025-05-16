import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Firebase imports
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Components
import Navbar from './components/Navbar';
import TimetableCreator from './components/TimetableCreator';
import TimetableView from './components/TimetableView';
import AttendanceHistory from './components/AttendanceHistory';

// Pages
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Login from './components/Auth/Login';
import SubjectSetup from './components/SubjectSetup';

// Styles
import './App.css';

const theme = createTheme({
  // Your existing theme configuration
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSubjects, setHasSubjects] = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user has subjects
        try {
          const subjectsRef = collection(db, 'subjects');
          const q = query(subjectsRef, where('userId', '==', currentUser.uid));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const userSubjects = snapshot.docs[0].data().subjects;
            setSubjects(userSubjects);
            setHasSubjects(true);
          } else {
            setHasSubjects(false);
          }
        } catch (error) {
          console.error('Error checking subjects:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          {user && <Navbar user={user} />}
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh' 
            }}>
              Loading...
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/timetable" 
                element={
                  !user ? (
                    <Navigate to="/login" />
                  ) : !hasSubjects ? (
                    <SubjectSetup 
                      userId={user.uid} 
                      onComplete={(subjects) => {
                        setSubjects(subjects);
                        setHasSubjects(true);
                      }} 
                    />
                  ) : (
                    <TimetableCreator 
                      userId={user.uid} 
                      subjects={subjects}
                    />
                  )
                } 
              />
              <Route 
                path="/timetable-creator" 
                element={
                  user ? (
                    <TimetableCreator 
                      userId={user.uid} 
                      subjects={subjects}
                    />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/timetable-view" 
                element={
                  user ? (
                    <TimetableView />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/attendance-history" 
                element={
                  user ? (
                    <AttendanceHistory />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              <Route 
                path="/attendance" 
                element={
                  !user ? (
                    <Navigate to="/login" />
                  ) : !hasSubjects ? (
                    <Navigate to="/timetable" />
                  ) : (
                    <Attendance />
                  )
                } 
              />
              <Route 
                path="/reports" 
                element={
                  !user ? (
                    <Navigate to="/login" />
                  ) : !hasSubjects ? (
                    <Navigate to="/timetable" />
                  ) : (
                    <Reports />
                  )
                } 
              />
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/timetable" /> : <Login onLoginSuccess={setUser} />
                } 
              />
            </Routes>
          )}
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;