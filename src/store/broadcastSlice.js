import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { broadcastApi } from '../api/broadcastApi'

// Async thunks
export const fetchBroadcasts = createAsyncThunk(
  'broadcasts/fetchBroadcasts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.getBroadcasts(params)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching broadcasts:', error)
      return rejectWithValue(error.message || 'Failed to fetch broadcasts')
    }
  }
)

export const fetchBroadcastDetails = createAsyncThunk(
  'broadcasts/fetchBroadcastDetails',
  async (broadcastId, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.getBroadcast(broadcastId)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching broadcast details:', error)
      return rejectWithValue(error.message || 'Failed to fetch broadcast details')
    }
  }
)

export const createBroadcast = createAsyncThunk(
  'broadcasts/createBroadcast',
  async (broadcastData, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.createBroadcast(broadcastData)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error creating broadcast:', error)
      return rejectWithValue(error.message || 'Failed to create broadcast')
    }
  }
)

export const updateBroadcast = createAsyncThunk(
  'broadcasts/updateBroadcast',
  async ({ broadcastId, updateData }, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.updateBroadcast(broadcastId, updateData)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error updating broadcast:', error)
      return rejectWithValue(error.message || 'Failed to update broadcast')
    }
  }
)

export const deleteBroadcast = createAsyncThunk(
  'broadcasts/deleteBroadcast',
  async (broadcastId, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.deleteBroadcast(broadcastId)
      return { broadcastId, ...response }
    } catch (error) {
      console.error('❌ Error deleting broadcast:', error)
      return rejectWithValue(error.message || 'Failed to delete broadcast')
    }
  }
)

export const cancelBroadcast = createAsyncThunk(
  'broadcasts/cancelBroadcast',
  async ({ broadcastId, reason }, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.cancelBroadcast(broadcastId, reason)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error cancelling broadcast:', error)
      return rejectWithValue(error.message || 'Failed to cancel broadcast')
    }
  }
)

export const sendBroadcastNow = createAsyncThunk(
  'broadcasts/sendBroadcastNow',
  async (broadcastId, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.sendNow(broadcastId)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error sending broadcast now:', error)
      return rejectWithValue(error.message || 'Failed to send broadcast now')
    }
  }
)

export const fetchBroadcastStats = createAsyncThunk(
  'broadcasts/fetchBroadcastStats',
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.getBroadcastStats(schoolId)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching broadcast stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch broadcast statistics')
    }
  }
)

export const fetchBroadcastOptions = createAsyncThunk(
  'broadcasts/fetchBroadcastOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.getBroadcastOptions()
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching broadcast options:', error)
      return rejectWithValue(error.message || 'Failed to fetch broadcast options')
    }
  }
)

export const uploadBroadcastMedia = createAsyncThunk(
  'broadcasts/uploadBroadcastMedia',
  async (file, { rejectWithValue }) => {
    try {
      const response = await broadcastApi.uploadMedia(file)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error uploading media:', error)
      return rejectWithValue(error.message || 'Failed to upload media')
    }
  }
)

const initialState = {
  // Broadcasts list
  broadcasts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,

  // Current broadcast details
  selectedBroadcast: null,
  selectedBroadcastLoading: false,
  selectedBroadcastError: null,

  // Filters
  filters: {
    page: 1,
    limit: 10,
    schoolId: '',
    groupType: '',
    status: '',
    search: ''
  },

  // Statistics
  stats: {
    totalBroadcasts: 0,
    statusBreakdown: [],
    recentBroadcasts: [],
    summary: {
      totalRecipients: 0,
      totalSuccessful: 0,
      totalFailed: 0
    }
  },
  statsLoading: false,
  statsError: null,

  // Options
  options: {
    groupTypes: {},
    statuses: {},
    educationLevels: {}
  },
  optionsLoading: false,
  optionsError: null,

  // UI state
  isModalOpen: false,
  modalMode: 'create', // 'create', 'edit', 'view'
  editingBroadcast: null,

  // Media upload
  mediaUploading: false,
  mediaUploadError: null,
  uploadedMediaUrl: null
}

const broadcastSlice = createSlice({
  name: 'broadcasts',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        schoolId: '',
        groupType: '',
        status: '',
        search: ''
      }
    },
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload
    },
    setModalMode: (state, action) => {
      state.modalMode = action.payload
    },
    setEditingBroadcast: (state, action) => {
      state.editingBroadcast = action.payload
    },
    clearError: (state) => {
      state.error = null
      state.selectedBroadcastError = null
      state.statsError = null
      state.optionsError = null
      state.mediaUploadError = null
    },
    clearUploadedMedia: (state) => {
      state.uploadedMediaUrl = null
      state.mediaUploadError = null
    },
    updateBroadcastStatus: (state, action) => {
      const { broadcastId, status, updates = {} } = action.payload
      const broadcastIndex = state.broadcasts.findIndex(b => b._id === broadcastId)
      if (broadcastIndex !== -1) {
        state.broadcasts[broadcastIndex] = {
          ...state.broadcasts[broadcastIndex],
          status,
          ...updates
        }
      }
      if (state.selectedBroadcast && state.selectedBroadcast._id === broadcastId) {
        state.selectedBroadcast = {
          ...state.selectedBroadcast,
          status,
          ...updates
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Broadcasts
      .addCase(fetchBroadcasts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBroadcasts.fulfilled, (state, action) => {
        state.loading = false
        state.broadcasts = action.payload.broadcasts
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchBroadcasts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Broadcast Details
      .addCase(fetchBroadcastDetails.pending, (state) => {
        state.selectedBroadcastLoading = true
        state.selectedBroadcastError = null
      })
      .addCase(fetchBroadcastDetails.fulfilled, (state, action) => {
        state.selectedBroadcastLoading = false
        state.selectedBroadcast = action.payload.broadcast
        state.selectedBroadcastError = null
      })
      .addCase(fetchBroadcastDetails.rejected, (state, action) => {
        state.selectedBroadcastLoading = false
        state.selectedBroadcastError = action.payload
      })

      // Create Broadcast
      .addCase(createBroadcast.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBroadcast.fulfilled, (state, action) => {
        state.loading = false
        state.broadcasts.unshift(action.payload.broadcast)
        state.pagination.total += 1
        state.error = null
        state.isModalOpen = false
        state.editingBroadcast = null
      })
      .addCase(createBroadcast.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Broadcast
      .addCase(updateBroadcast.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBroadcast.fulfilled, (state, action) => {
        state.loading = false
        const index = state.broadcasts.findIndex(b => b._id === action.payload.broadcast._id)
        if (index !== -1) {
          state.broadcasts[index] = action.payload.broadcast
        }
        if (state.selectedBroadcast && state.selectedBroadcast._id === action.payload.broadcast._id) {
          state.selectedBroadcast = action.payload.broadcast
        }
        state.error = null
        state.isModalOpen = false
        state.editingBroadcast = null
      })
      .addCase(updateBroadcast.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete Broadcast
      .addCase(deleteBroadcast.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBroadcast.fulfilled, (state, action) => {
        state.loading = false
        state.broadcasts = state.broadcasts.filter(b => b._id !== action.payload.broadcastId)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteBroadcast.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Cancel Broadcast
      .addCase(cancelBroadcast.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelBroadcast.fulfilled, (state, action) => {
        state.loading = false
        const index = state.broadcasts.findIndex(b => b._id === action.payload.broadcast._id)
        if (index !== -1) {
          state.broadcasts[index] = action.payload.broadcast
        }
        if (state.selectedBroadcast && state.selectedBroadcast._id === action.payload.broadcast._id) {
          state.selectedBroadcast = action.payload.broadcast
        }
        state.error = null
      })
      .addCase(cancelBroadcast.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Send Broadcast Now
      .addCase(sendBroadcastNow.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendBroadcastNow.fulfilled, (state, action) => {
        state.loading = false
        const index = state.broadcasts.findIndex(b => b._id === action.payload.broadcast._id)
        if (index !== -1) {
          state.broadcasts[index] = action.payload.broadcast
        }
        if (state.selectedBroadcast && state.selectedBroadcast._id === action.payload.broadcast._id) {
          state.selectedBroadcast = action.payload.broadcast
        }
        state.error = null
      })
      .addCase(sendBroadcastNow.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch Broadcast Stats
      .addCase(fetchBroadcastStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchBroadcastStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
        state.statsError = null
      })
      .addCase(fetchBroadcastStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload
      })

      // Fetch Broadcast Options
      .addCase(fetchBroadcastOptions.pending, (state) => {
        state.optionsLoading = true
        state.optionsError = null
      })
      .addCase(fetchBroadcastOptions.fulfilled, (state, action) => {
        state.optionsLoading = false
        state.options = action.payload
        state.optionsError = null
      })
      .addCase(fetchBroadcastOptions.rejected, (state, action) => {
        state.optionsLoading = false
        state.optionsError = action.payload
      })

      // Upload Media
      .addCase(uploadBroadcastMedia.pending, (state) => {
        state.mediaUploading = true
        state.mediaUploadError = null
      })
      .addCase(uploadBroadcastMedia.fulfilled, (state, action) => {
        state.mediaUploading = false
        state.uploadedMediaUrl = action.payload.mediaUrl
        state.mediaUploadError = null
      })
      .addCase(uploadBroadcastMedia.rejected, (state, action) => {
        state.mediaUploading = false
        state.mediaUploadError = action.payload
      })
  }
})

export const {
  setFilters,
  clearFilters,
  setModalOpen,
  setModalMode,
  setEditingBroadcast,
  clearError,
  clearUploadedMedia,
  updateBroadcastStatus
} = broadcastSlice.actions

export default broadcastSlice.reducer
