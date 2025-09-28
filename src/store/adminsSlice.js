import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminsApi } from '../api/adminsApi'

// Async thunks
export const fetchAdmins = createAsyncThunk(
  'admins/fetchAdmins',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminsApi.getAdmins(params)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch admins')
    }
  }
)

export const createAdmin = createAsyncThunk(
  'admins/createAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await adminsApi.createAdmin(adminData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create admin')
    }
  }
)

export const updateAdmin = createAsyncThunk(
  'admins/updateAdmin',
  async ({ adminId, adminData }, { rejectWithValue }) => {
    try {
      const response = await adminsApi.updateAdmin(adminId, adminData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update admin')
    }
  }
)

export const deleteAdmin = createAsyncThunk(
  'admins/deleteAdmin',
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await adminsApi.deleteAdmin(adminId)
      if (response.success) {
        return adminId
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete admin')
    }
  }
)

export const fetchRoles = createAsyncThunk(
  'admins/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminsApi.getRoles()
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.message)
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch roles')
    }
  }
)

const initialState = {
  admins: [],
  roles: [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' }
  ],
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
    search: ''
  }
}

const adminsSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    resetAdmins: (state) => {
      state.admins = []
      state.pagination = initialState.pagination
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admins
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false
        state.admins = action.payload.admins
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create Admin
      .addCase(createAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.admins.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update Admin
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false
        const index = state.admins.findIndex(admin => admin._id === action.payload._id)
        if (index !== -1) {
          state.admins[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete Admin
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.admins = state.admins.filter(admin => admin._id !== action.payload)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch Roles
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload
      })
  }
})

export const { setFilters, clearError, resetAdmins } = adminsSlice.actions
export default adminsSlice.reducer
