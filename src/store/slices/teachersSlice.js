import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Async thunk for fetching teacher data
export const fetchTeacherData = createAsyncThunk(
  'teachers/fetchTeacherData',
  async (teacherId, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch(`http://localhost:8088/api/teachers/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch teacher data');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Teachers slice
const teachersSlice = createSlice({
  name: 'teachers',
  initialState: {
    currentTeacher: null,
    classes: [],
    assignments: [],
    students: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeacher: (state, action) => {
      state.currentTeacher = action.payload;
    },
    setClasses: (state, action) => {
      state.classes = action.payload;
    },
    setAssignments: (state, action) => {
      state.assignments = action.payload;
    },
    setStudents: (state, action) => {
      state.students = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeacher = action.payload.teacher;
        state.classes = action.payload.classes || [];
        state.assignments = action.payload.assignments || [];
        state.students = action.payload.students || [];
      })
      .addCase(fetchTeacherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentTeacher, setClasses, setAssignments, setStudents } = teachersSlice.actions;
export default teachersSlice.reducer;
