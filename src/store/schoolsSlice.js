import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { schoolsApi } from '../api/schoolsApi'

// Async thunks
export const fetchSchools = createAsyncThunk(
  'schools/fetchSchools',
  async (params, { rejectWithValue }) => {
    try {
      const response = await schoolsApi.getSchools(params)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch schools')
    }
  }
)

export const createSchool = createAsyncThunk(
  'schools/createSchool',
  async (schoolData, { rejectWithValue }) => {
    try {
      const response = await schoolsApi.createSchool(schoolData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create school')
    }
  }
)

export const updateSchool = createAsyncThunk(
  'schools/updateSchool',
  async ({ schoolId, schoolData }, { rejectWithValue }) => {
    try {
      const response = await schoolsApi.updateSchool(schoolId, schoolData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update school')
    }
  }
)

export const deleteSchool = createAsyncThunk(
  'schools/deleteSchool',
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await schoolsApi.deleteSchool(schoolId)
      if (response.success) {
        return schoolId
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete school')
    }
  }
)

const initialState = {
  schools: [],
  pagination: {
    page: 1,
    limit: 10
  },
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
}

const schoolsSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    resetSchools: (state) => {
      state.schools = []
      state.pagination = {
        page: 1,
        limit: 10
      }
      state.filters = {
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schools
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false
        state.schools = action.payload.schools
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create School
      .addCase(createSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.loading = false
        state.schools.unshift(action.payload)
        state.error = null
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update School
      .addCase(updateSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        state.loading = false
        const index = state.schools.findIndex(school => school._id === action.payload._id)
        if (index !== -1) {
          state.schools[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete School
      .addCase(deleteSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.loading = false
        state.schools = state.schools.filter(school => school._id !== action.payload)
        state.error = null
      })
      .addCase(deleteSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setFilters, clearError, resetSchools } = schoolsSlice.actions
export default schoolsSlice.reducer
