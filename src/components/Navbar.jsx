import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { auth } from '../firebase';
import { useTheme } from '@mui/material/styles';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleClose();
  };

  const buttonStyle = (path) => ({
    color: 'inherit',
    fontWeight: isActive(path) ? 600 : 400,
    borderBottom: isActive(path) ? 2 : 0,
    borderColor: 'white',
    borderRadius: 0,
    px: 2,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  });

  return (
    <AppBar position="fixed" sx={{ 
      background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
      boxShadow: '0 3px 5px 2px rgba(107, 70, 193, .3)'
    }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer', fontWeight: 700 }}
          onClick={() => navigate('/')}
        >
          AttendanceTracker
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 4 }}>
          {user && (
            <>
              <Button
                startIcon={<DateRangeIcon />}
                onClick={() => navigate('/timetable')}
                sx={buttonStyle('/timetable')}
              >
                Timetable
              </Button>
              
              <Button
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/attendance')}
                sx={buttonStyle('/attendance')}
              >
                Attendance
              </Button>
              
              <Button
                startIcon={<BarChartIcon />}
                onClick={() => navigate('/reports')}
                sx={buttonStyle('/reports')}
              >
                Reports
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <IconButton
                onClick={handleMenu}
                color="inherit"
                edge="end"
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
              >
                {user.photoURL ? (
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    {user.displayName || user.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
