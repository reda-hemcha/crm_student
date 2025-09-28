import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardApi } from '../api/dashboardApi'

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getDashboardStats()
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch dashboard statistics')
    }
  }
)

export const fetchKPIData = createAsyncThunk(
  'dashboard/fetchKPIData',
  async (timeRange = '7d', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getKPIData(timeRange)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error)
      return rejectWithValue(error.message || 'Failed to fetch KPI data')
    }
  }
)

export const fetchMessageChartData = createAsyncThunk(
  'dashboard/fetchMessageChartData',
  async (timeRange = '7d', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getMessageChartData(timeRange)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching message chart data:', error)
      return rejectWithValue(error.message || 'Failed to fetch message chart data')
    }
  }
)

export const fetchDeliveryStats = createAsyncThunk(
  'dashboard/fetchDeliveryStats',
  async (timeRange = '30d', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getDeliveryStats(timeRange)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching delivery stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch delivery statistics')
    }
  }
)

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getRecentActivities(limit)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error)
      return rejectWithValue(error.message || 'Failed to fetch recent activities')
    }
  }
)

export const fetchSchoolStats = createAsyncThunk(
  'dashboard/fetchSchoolStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSchoolStats()
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching school stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch school statistics')
    }
  }
)

export const fetchStudentStats = createAsyncThunk(
  'dashboard/fetchStudentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStudentStats()
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching student stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch student statistics')
    }
  }
)

export const fetchClassStats = createAsyncThunk(
  'dashboard/fetchClassStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getClassStats()
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching class stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch class statistics')
    }
  }
)

export const fetchWhatsAppStats = createAsyncThunk(
  'dashboard/fetchWhatsAppStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getWhatsAppStats()
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error fetching WhatsApp stats:', error)
      return rejectWithValue(error.message || 'Failed to fetch WhatsApp statistics')
    }
  }
)

const initialState = {
  // General loading states
  loading: false,
  error: null,
  lastUpdated: null,

  // KPI Data
  kpiData: {
    totalStudents: 0,
    totalClasses: 0,
    totalSchools: 0,
    messagesSentToday: 0,
    messagesThisWeek: 0,
    messagesThisMonth: 0,
    replyRate: 0,
    activeBroadcasts: 0,
    newInboxMessages: 0,
    deliveryRate: 0
  },
  kpiLoading: false,
  kpiError: null,

  // Chart Data
  messageChartData: {
    labels: [],
    datasets: []
  },
  messageChartLoading: false,
  messageChartError: null,

  // Delivery Statistics
  deliveryStats: {
    delivered: 0,
    pending: 0,
    failed: 0,
    total: 0
  },
  deliveryLoading: false,
  deliveryError: null,

  // Recent Activities
  recentActivities: [],
  activitiesLoading: false,
  activitiesError: null,

  // School Statistics (for SUPER_ADMIN)
  schoolStats: {
    totalSchools: 0,
    activeSchools: 0,
    schoolsWithWhatsApp: 0,
    averageStudentsPerSchool: 0,
    schoolsCreatedThisMonth: 0
  },
  schoolStatsLoading: false,
  schoolStatsError: null,

  // Student Statistics
  studentStats: {
    totalStudents: 0,
    studentsThisMonth: 0,
    studentsByLevel: {},
    studentsByGender: {},
    averageClassSize: 0
  },
  studentStatsLoading: false,
  studentStatsError: null,

  // Class Statistics
  classStats: {
    totalClasses: 0,
    classesByLevel: {},
    averageStudentsPerClass: 0,
    classesCreatedThisMonth: 0
  },
  classStatsLoading: false,
  classStatsError: null,

  // WhatsApp Statistics
  whatsappStats: {
    totalMessagesSent: 0,
    messagesThisWeek: 0,
    messagesThisMonth: 0,
    activeConfigurations: 0,
    deliveryRate: 0,
    replyRate: 0
  },
  whatsappStatsLoading: false,
  whatsappStatsError: null
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.kpiError = null
      state.messageChartError = null
      state.deliveryError = null
      state.activitiesError = null
      state.schoolStatsError = null
      state.studentStatsError = null
      state.classStatsError = null
      state.whatsappStatsError = null
    },
    updateLastRefresh: (state) => {
      state.lastUpdated = new Date().toISOString()
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.kpiData = { ...state.kpiData, ...action.payload }
        state.lastUpdated = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // KPI Data
      .addCase(fetchKPIData.pending, (state) => {
        state.kpiLoading = true
        state.kpiError = null
      })
      .addCase(fetchKPIData.fulfilled, (state, action) => {
        state.kpiLoading = false
        state.kpiData = { ...state.kpiData, ...action.payload }
        state.kpiError = null
      })
      .addCase(fetchKPIData.rejected, (state, action) => {
        state.kpiLoading = false
        state.kpiError = action.payload
      })

      // Message Chart Data
      .addCase(fetchMessageChartData.pending, (state) => {
        state.messageChartLoading = true
        state.messageChartError = null
      })
      .addCase(fetchMessageChartData.fulfilled, (state, action) => {
        state.messageChartLoading = false
        state.messageChartData = action.payload
        state.messageChartError = null
      })
      .addCase(fetchMessageChartData.rejected, (state, action) => {
        state.messageChartLoading = false
        state.messageChartError = action.payload
      })

      // Delivery Stats
      .addCase(fetchDeliveryStats.pending, (state) => {
        state.deliveryLoading = true
        state.deliveryError = null
      })
      .addCase(fetchDeliveryStats.fulfilled, (state, action) => {
        state.deliveryLoading = false
        state.deliveryStats = action.payload
        state.deliveryError = null
      })
      .addCase(fetchDeliveryStats.rejected, (state, action) => {
        state.deliveryLoading = false
        state.deliveryError = action.payload
      })

      // Recent Activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.activitiesLoading = true
        state.activitiesError = null
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.activitiesLoading = false
        state.recentActivities = action.payload
        state.activitiesError = null
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.activitiesLoading = false
        state.activitiesError = action.payload
      })

      // School Stats
      .addCase(fetchSchoolStats.pending, (state) => {
        state.schoolStatsLoading = true
        state.schoolStatsError = null
      })
      .addCase(fetchSchoolStats.fulfilled, (state, action) => {
        state.schoolStatsLoading = false
        state.schoolStats = action.payload
        state.schoolStatsError = null
      })
      .addCase(fetchSchoolStats.rejected, (state, action) => {
        state.schoolStatsLoading = false
        state.schoolStatsError = action.payload
        // Set fallback data when API fails
        if (!state.schoolStats.totalSchools) {
          state.schoolStats.totalSchools = 0
        }
      })

      // Student Stats
      .addCase(fetchStudentStats.pending, (state) => {
        state.studentStatsLoading = true
        state.studentStatsError = null
      })
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.studentStatsLoading = false
        state.studentStats = action.payload
        state.studentStatsError = null
      })
      .addCase(fetchStudentStats.rejected, (state, action) => {
        state.studentStatsLoading = false
        state.studentStatsError = action.payload
      })

      // Class Stats
      .addCase(fetchClassStats.pending, (state) => {
        state.classStatsLoading = true
        state.classStatsError = null
      })
      .addCase(fetchClassStats.fulfilled, (state, action) => {
        state.classStatsLoading = false
        state.classStats = action.payload
        state.classStatsError = null
      })
      .addCase(fetchClassStats.rejected, (state, action) => {
        state.classStatsLoading = false
        state.classStatsError = action.payload
      })

      // WhatsApp Stats
      .addCase(fetchWhatsAppStats.pending, (state) => {
        state.whatsappStatsLoading = true
        state.whatsappStatsError = null
      })
      .addCase(fetchWhatsAppStats.fulfilled, (state, action) => {
        state.whatsappStatsLoading = false
        state.whatsappStats = action.payload
        state.whatsappStatsError = null
      })
      .addCase(fetchWhatsAppStats.rejected, (state, action) => {
        state.whatsappStatsLoading = false
        state.whatsappStatsError = action.payload
      })
  }
})

export const { clearError, updateLastRefresh } = dashboardSlice.actions
export default dashboardSlice.reducer
