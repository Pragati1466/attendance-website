import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';

const AttendanceHistory = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const fetchAttendanceHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'attendance'), 
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setAttendanceRecords(records);
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Attendance History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Day</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {record.timestamp?.toDate?.().toLocaleString()}
                </TableCell>
                <TableCell>{record.subject}</TableCell>
                <TableCell>{record.day}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AttendanceHistory;