import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import EventIcon from '@mui/icons-material/Event';
import { format, isWeekend } from 'date-fns';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const CalendarIntegration = ({ subjects, onHolidayUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const loadGoogleAPI = async () => {
      try {
        // First load the gapi script
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        await new Promise((resolve, reject) => {
          gapiScript.onload = resolve;
          gapiScript.onerror = reject;
          document.body.appendChild(gapiScript);
        });

        // Then load the gsi script
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        await new Promise((resolve, reject) => {
          gsiScript.onload = resolve;
          gsiScript.onerror = reject;
          document.body.appendChild(gsiScript);
        });

        // Initialize the client
        await new Promise((resolve) => window.gapi.load('client', resolve));
        initClient();
      } catch (error) {
        console.error('Error loading Google API:', error);
        setError('Failed to load Google Calendar API');
      }
    };

    loadGoogleAPI();
  }, []);

  const initClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
      });

      // Get the Google Auth instance
      const googleAuth = window.gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes
      googleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state
      const isSignedIn = googleAuth.isSignedIn.get();
      setIsAuthenticated(isSignedIn);
      
      if (isSignedIn) {
        await listCalendars();
      }
    } catch (error) {
      console.error('Error initializing Google Calendar API:', error);
      setError('Failed to initialize Google Calendar API: ' + error.message);
      setIsAuthenticated(false);
    }
  };

  const updateSigninStatus = async (isSignedIn) => {
    setIsAuthenticated(isSignedIn);
    if (isSignedIn) {
      await listCalendars();
    } else {
      setCalendars([]);
      setSelectedCalendars([]);
    }
  };

  const handleAuthClick = () => {
    if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      window.gapi.auth2.getAuthInstance().signOut();
    } else {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  };

  const listCalendars = async () => {
    setLoading(true);
    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      setCalendars(response.result.items);
      setOpenDialog(true);
    } catch (error) {
      setError('Error loading calendars');
      console.error('Error loading calendars:', error);
    }
    setLoading(false);
  };

  const handleCalendarToggle = (calendarId) => {
    setSelectedCalendars((prev) => {
      if (prev.includes(calendarId)) {
        return prev.filter((id) => id !== calendarId);
      }
      return [...prev, calendarId];
    });
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      const eventPromises = selectedCalendars.map((calendarId) =>
        window.gapi.client.calendar.events.list({
          calendarId,
          timeMin: now.toISOString(),
          timeMax: oneYearFromNow.toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime',
        })
      );

      const responses = await Promise.all(eventPromises);
      const allEvents = responses.flatMap((response) => response.result.items);
      
      // Process events to identify holidays and weekends
      const holidays = allEvents
        .filter((event) => {
          const startDate = new Date(event.start.date || event.start.dateTime);
          return (
            event.summary?.toLowerCase().includes('holiday') ||
            isWeekend(startDate)
          );
        })
        .map((event) => ({
          date: format(new Date(event.start.date || event.start.dateTime), 'yyyy-MM-dd'),
          title: event.summary,
          type: isWeekend(new Date(event.start.date || event.start.dateTime))
            ? 'weekend'
            : 'holiday',
        }));

      setEvents(allEvents);
      onHolidayUpdate(holidays);
      setOpenDialog(false);
    } catch (error) {
      setError('Error loading events');
      console.error('Error loading events:', error);
    }
    setLoading(false);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleAuthClick}
        sx={{
          background: isAuthenticated
            ? 'linear-gradient(45deg, #34A853 30%, #4285F4 90%)'
            : 'linear-gradient(45deg, #DB4437 30%, #F4B400 90%)',
          color: 'white',
          '&:hover': {
            background: isAuthenticated
              ? 'linear-gradient(45deg, #4285F4 30%, #34A853 90%)'
              : 'linear-gradient(45deg, #F4B400 30%, #DB4437 90%)',
          },
        }}
      >
        {isAuthenticated ? 'Connected to Google Calendar' : 'Connect Google Calendar'}
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Calendars to Sync</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {calendars.map((calendar) => (
                <ListItem key={calendar.id}>
                  <ListItemIcon>
                    <EventIcon style={{ color: calendar.backgroundColor }} />
                  </ListItemIcon>
                  <ListItemText primary={calendar.summary} />
                  <Switch
                    edge="end"
                    checked={selectedCalendars.includes(calendar.id)}
                    onChange={() => handleCalendarToggle(calendar.id)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={loadEvents}
            disabled={selectedCalendars.length === 0 || loading}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
            }}
          >
            Sync Selected
          </Button>
        </DialogActions>
      </Dialog>

      {events.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Synced Events
          </Typography>
          <List>
            {events.slice(0, 5).map((event) => (
              <ListItem key={event.id}>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText
                  primary={event.summary}
                  secondary={format(
                    new Date(event.start.date || event.start.dateTime),
                    'MMM d, yyyy'
                  )}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default CalendarIntegration;
