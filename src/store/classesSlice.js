import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { classesApi } from '../api/classesApi'

// Async thunks
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await classesApi.getClasses(params)
      
      if (response && response.success) {
        console.log('✅ Classes fetched:', response.data.classes?.length || 0, 'classes')
        return response.data
      } else if (response && response.data) {
        // Handle case where API returns data without success flag
        return response
      } else {
        console.error('❌ Invalid API response format:', response)
        return rejectWithValue(response.message || 'Invalid API response format')
      }
    } catch (error) {
      console.error('❌ Error fetching classes:', error)
      return rejectWithValue(error.message || 'Failed to fetch classes')
    }
  }
)

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await classesApi.createClass(classData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create class')
    }
  }
)

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ classId, classData }, { rejectWithValue }) => {
    try {
      const response = await classesApi.updateClass(classId, classData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update class')
    }
  }
)

export const deleteClass = createAsyncThunk(
  'classes/deleteClass',
  async (classId, { rejectWithValue }) => {
    try {
      const response = await classesApi.deleteClass(classId)
      if (response.success) {
        return classId
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete class')
    }
  }
)

export const fetchEducationData = createAsyncThunk(
  'classes/fetchEducationData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await classesApi.getEducationData()
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch education data')
    }
  }
)

export const fetchAcademicYearsByLevel = createAsyncThunk(
  'classes/fetchAcademicYearsByLevel',
  async (level, { rejectWithValue }) => {
    try {
      const response = await classesApi.getAcademicYearsByLevel(level)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch academic years')
    }
  }
)

// Fetch classes for a specific school (NEW DEDICATED ENDPOINT)
export const fetchClassesBySchool = createAsyncThunk(
  'classes/fetchClassesBySchool',
  async ({ schoolId, params = {} }, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching classes for school:', schoolId, 'with params:', params)
      const response = await classesApi.getClassesBySchool(schoolId, params)
      
      if (response && response.success) {
        console.log('✅ Classes by school fetched:', response.data.classes?.length || 0, 'classes')
        return {
          schoolId,
          school: response.data.school,
          classes: response.data.classes,
          pagination: response.data.pagination
        }
      } else {
        console.error('❌ Invalid API response format:', response)
        return rejectWithValue(response.message || 'Invalid API response format')
      }
    } catch (error) {
      console.error('❌ Error fetching classes by school:', error)
      return rejectWithValue(error.message || 'Failed to fetch classes for school')
    }
  }
)

const initialState = {
  classes: [],
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
    search: '',
    schoolId: null,
    level: null,
    year: null
  },
  educationData: {
    educationLevels: {},
    academicYears: {},
    levelOptions: []
  },
  academicYearsByLevel: {}
}

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    resetClasses: (state) => {
      state.classes = []
      state.pagination = initialState.pagination
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Classes
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false
        state.classes = action.payload.classes
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Class
      .addCase(createClass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.loading = false
        state.classes.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createClass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update Class
      .addCase(updateClass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.loading = false
        const index = state.classes.findIndex(cls => cls._id === action.payload._id)
        if (index !== -1) {
          state.classes[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete Class
      .addCase(deleteClass.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.loading = false
        state.classes = state.classes.filter(cls => cls._id !== action.payload)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Education data cases
      .addCase(fetchEducationData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEducationData.fulfilled, (state, action) => {
        state.loading = false
        state.educationData = action.payload
        state.error = null
      })
      .addCase(fetchEducationData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Academic years by level cases
      .addCase(fetchAcademicYearsByLevel.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAcademicYearsByLevel.fulfilled, (state, action) => {
        state.loading = false
        state.academicYearsByLevel[action.payload.level] = action.payload.academicYears
        state.error = null
      })
      .addCase(fetchAcademicYearsByLevel.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch Classes by School
      .addCase(fetchClassesBySchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClassesBySchool.fulfilled, (state, action) => {
        state.loading = false
        state.classes = action.payload.classes
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchClassesBySchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setFilters, clearError, resetClasses } = classesSlice.actions
export default classesSlice.reducer
