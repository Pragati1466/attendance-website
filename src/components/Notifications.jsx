import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';

const Notifications = ({ attendanceData, subjects, threshold = 75 }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const checkAttendance = () => {
      const newNotifications = [];

      // Check for low attendance
      subjects.forEach(subject => {
        const subjectAttendance = attendanceData.filter(record => record.subjectId === subject.id);
        if (subjectAttendance.length > 0) {
          const present = subjectAttendance.filter(record => 
            record.status === 'present' || record.status === 'proxy'
          ).length;
          const percentage = Math.round((present / subjectAttendance.length) * 100);

          if (percentage < threshold) {
            newNotifications.push({
              id: Date.now() + subject.id,
              type: 'warning',
              message: `Low attendance alert for ${subject.name}: ${percentage}%`,
              timestamp: new Date(),
            });
          }
        }
      });

      // Check for unmarked attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const unmarkedSubjects = subjects.filter(subject => {
        const todayAttendance = attendanceData.find(record => 
          record.subjectId === subject.id && format(record.timestamp, 'yyyy-MM-dd') === today
        );
        return !todayAttendance;
      });

      if (unmarkedSubjects.length > 0) {
        newNotifications.push({
          id: Date.now(),
          type: 'reminder',
          message: `Don't forget to mark attendance for: ${unmarkedSubjects.map(s => s.name).join(', ')}`,
          timestamp: new Date(),
        });
      }

      setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));

      // Show snackbar for new notifications
      if (newNotifications.length > 0) {
        setSnackbarMessage('You have new notifications');
        setShowSnackbar(true);
      }
    };

    checkAttendance();
    const interval = setInterval(checkAttendance, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, [attendanceData, subjects, threshold]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="error" />;
      case 'reminder':
        return <EventIcon color="primary" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem>
            <ListItemText primary="No new notifications" />
          </MenuItem>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={format(notification.timestamp, 'MMM d, yyyy h:mm a')}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Notifications;
