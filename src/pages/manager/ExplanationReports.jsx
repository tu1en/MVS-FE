import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Grid, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ExplanationReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({ reason: {}, status: {} });

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [page, rowsPerPage, startDate, endDate, status, role, department]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let url = `http://localhost:8080/api/attendance-explanations/report?page=${page}&size=${rowsPerPage}`;
      if (startDate) url += `&startDate=${startDate.format('YYYY-MM-DD')}`;
      if (endDate) url += `&endDate=${endDate.format('YYYY-MM-DD')}`;
      if (status) url += `&status=${status}`;
      if (role) url += `&role=${role}`;
      if (department) url += `&department=${department}`;

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setReports(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      let reasonUrl = `http://localhost:8080/api/attendance-explanations/statistics/reason`;
      let statusUrl = `http://localhost:8080/api/attendance-explanations/statistics/status`;
      if (startDate) {
        reasonUrl += `?startDate=${startDate.format('YYYY-MM-DD')}`;
        statusUrl += `?startDate=${startDate.format('YYYY-MM-DD')}`;
      }
      if (endDate) {
        reasonUrl += `${startDate ? '&' : '?'}endDate=${endDate.format('YYYY-MM-DD')}`;
        statusUrl += `${startDate ? '&' : '?'}endDate=${endDate.format('YYYY-MM-DD')}`;
      }

      const [reasonResponse, statusResponse] = await Promise.all([
        axios.get(reasonUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setStatistics({
        reason: reasonResponse.data,
        status: statusResponse.data
      });
    } catch (err) {
      console.error('Failed to load statistics', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:8080/api/attendance-explanations/export/excel`;
      if (startDate) url += `?startDate=${startDate.format('YYYY-MM-DD')}`;
      if (endDate) url += `${startDate ? '&' : '?'}endDate=${endDate.format('YYYY-MM-DD')}`;
      if (status) url += `${startDate || endDate ? '&' : '?'}status=${status}`;
      if (role) url += `${startDate || endDate || status ? '&' : '?'}role=${role}`;
      if (department) url += `${startDate || endDate || status || role ? '&' : '?'}department=${department}`;

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'attendance_explanations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export Excel', err);
      setError('Failed to export Excel report. Please try again.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'orange';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'black';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Explanation Reports
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                  <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Statistics Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Statistics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>By Reason:</Typography>
            {Object.entries(statistics.reason).map(([reason, count]) => (
              <Typography key={reason}>{reason}: {count}</Typography>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>By Status:</Typography>
            {Object.entries(statistics.status).map(([status, count]) => (
              <Typography key={status}>{status}: {count}</Typography>
            ))}
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleExportExcel} sx={{ mt: 2 }}>
          Export to Excel
        </Button>
      </Paper>

      {/* Reports Table */}
      <Paper sx={{ width: '100%' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Submitter</TableCell>
                <TableCell>Absence Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No reports found.</TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.submitterName}</TableCell>
                    <TableCell>{report.absenceDate}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{dayjs(report.submittedAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>
                      <span style={{ color: getStatusColor(report.status) }}>{report.status}</span>
                    </TableCell>
                    <TableCell>{report.approverName || 'N/A'}</TableCell>
                    <TableCell>{report.department || 'N/A'}</TableCell>
                    <TableCell>
                      {report.status === 'PENDING' && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const userId = JSON.parse(atob(token.split('.')[1])).id;
                                await axios.put(`http://localhost:8080/api/attendance-explanations/${report.id}/approve?approverId=${userId}`, {}, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchReports();
                                fetchStatistics();
                              } catch (err) {
                                console.error('Failed to approve', err);
                                setError('Failed to approve explanation.');
                              }
                            }}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const userId = JSON.parse(atob(token.split('.')[1])).id;
                                await axios.put(`http://localhost:8080/api/attendance-explanations/${report.id}/reject?approverId=${userId}`, {}, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchReports();
                                fetchStatistics();
                              } catch (err) {
                                console.error('Failed to reject', err);
                                setError('Failed to reject explanation.');
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Button
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0 || loading}
          >
            Previous
          </Button>
          <Typography>Page {page + 1} of {Math.ceil(totalElements / rowsPerPage)}</Typography>
          <Button
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= Math.ceil(totalElements / rowsPerPage) - 1 || loading}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ExplanationReports;
