import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { studentsApi } from '../api/studentsApi'

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await studentsApi.getStudents(params)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch students')
    }
  }
)

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async ({ studentData, userRole, userSchoolId }, { rejectWithValue }) => {
    try {
      const response = await studentsApi.createStudent(studentData, userRole, userSchoolId)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create student')
    }
  }
)

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ studentId, studentData }, { rejectWithValue }) => {
    try {
      const response = await studentsApi.updateStudent(studentId, studentData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update student')
    }
  }
)

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentsApi.deleteStudent(studentId)
      if (response.success) {
        return studentId
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete student')
    }
  }
)

export const fetchClasses = createAsyncThunk(
  'students/fetchClasses',
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await studentsApi.getClasses(schoolId)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch classes')
    }
  }
)

const initialState = {
  students: [],
  classes: [],
  schools: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    schoolId: '',
    classId: '',
    academicYear: '',
    search: ''
  }
}

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    resetStudents: (state) => {
      state.students = []
      state.pagination = initialState.pagination
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false
        state.students = action.payload.students
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Student
      .addCase(createStudent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false
        state.students.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.students.findIndex(student => student._id === action.payload._id)
        if (index !== -1) {
          state.students[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false
        state.students = state.students.filter(student => student._id !== action.payload)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch Classes
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.classes = action.payload
      })
  }
})

export const { setFilters, clearError, resetStudents } = studentsSlice.actions
export default studentsSlice.reducer
