import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { whatsappConfigApi } from '../api/whatsappApi'

// Async thunks for WhatsApp configurations
export const fetchWhatsAppConfigs = createAsyncThunk(
  'whatsapp/fetchConfigs',
  async (params = {}) => {
    const response = await whatsappConfigApi.getConfigs(params)
    return response.data
  }
)

export const fetchConfigBySchool = createAsyncThunk(
  'whatsapp/fetchConfigBySchool',
  async (schoolId) => {
    const response = await whatsappConfigApi.getConfigBySchool(schoolId)
    return response.data
  }
)

export const createWhatsAppConfig = createAsyncThunk(
  'whatsapp/createConfig',
  async (configData) => {
    const response = await whatsappConfigApi.createConfig(configData)
    return response.data
  }
)

export const updateWhatsAppConfig = createAsyncThunk(
  'whatsapp/updateConfig',
  async ({ configId, configData }) => {
    const response = await whatsappConfigApi.updateConfig(configId, configData)
    return response.data
  }
)

export const deleteWhatsAppConfig = createAsyncThunk(
  'whatsapp/deleteConfig',
  async (configId) => {
    const response = await whatsappConfigApi.deleteConfig(configId)
    return { configId, response: response.data }
  }
)

export const testWhatsAppConnection = createAsyncThunk(
  'whatsapp/testConnection',
  async (configId) => {
    const response = await whatsappConfigApi.testConnection(configId)
    return { configId, response: response.data }
  }
)

export const toggleWhatsAppConfigStatus = createAsyncThunk(
  'whatsapp/toggleStatus',
  async (configId) => {
    const response = await whatsappConfigApi.toggleStatus(configId)
    return response.data
  }
)

const initialState = {
  configs: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  connectionTests: {}, // Store test results by configId
  submitting: false,
  deleting: false
}

const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearConnectionTest: (state, action) => {
      const configId = action.payload
      delete state.connectionTests[configId]
    },
    clearAllConnectionTests: (state) => {
      state.connectionTests = {}
    }
  },
  extraReducers: (builder) => {
    // Fetch configs
    builder
      .addCase(fetchWhatsAppConfigs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWhatsAppConfigs.fulfilled, (state, action) => {
        state.loading = false
        state.configs = action.payload.configs || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchWhatsAppConfigs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch WhatsApp configurations'
      })

    // Fetch config by school
    builder
      .addCase(fetchConfigBySchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConfigBySchool.fulfilled, (state, action) => {
        state.loading = false
        // Update or add the config to the list
        const existingIndex = state.configs.findIndex(config => config._id === action.payload._id)
        if (existingIndex >= 0) {
          state.configs[existingIndex] = action.payload
        } else {
          state.configs.push(action.payload)
        }
      })
      .addCase(fetchConfigBySchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch WhatsApp configuration for school'
      })

    // Create config
    builder
      .addCase(createWhatsAppConfig.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createWhatsAppConfig.fulfilled, (state, action) => {
        state.submitting = false
        state.configs.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(createWhatsAppConfig.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Failed to create WhatsApp configuration'
      })

    // Update config
    builder
      .addCase(updateWhatsAppConfig.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateWhatsAppConfig.fulfilled, (state, action) => {
        state.submitting = false
        const index = state.configs.findIndex(config => config._id === action.payload._id)
        if (index !== -1) {
          state.configs[index] = action.payload
        }
      })
      .addCase(updateWhatsAppConfig.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Failed to update WhatsApp configuration'
      })

    // Delete config
    builder
      .addCase(deleteWhatsAppConfig.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteWhatsAppConfig.fulfilled, (state, action) => {
        state.deleting = false
        state.configs = state.configs.filter(config => config._id !== action.payload.configId)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
      })
      .addCase(deleteWhatsAppConfig.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete WhatsApp configuration'
      })

    // Test connection
    builder
      .addCase(testWhatsAppConnection.pending, (state, action) => {
        const configId = action.meta.arg
        state.connectionTests[configId] = { loading: true, result: null }
      })
      .addCase(testWhatsAppConnection.fulfilled, (state, action) => {
        const configId = action.payload.configId
        state.connectionTests[configId] = {
          loading: false,
          result: action.payload.response,
          timestamp: new Date().toISOString()
        }
      })
      .addCase(testWhatsAppConnection.rejected, (state, action) => {
        const configId = action.meta.arg
        state.connectionTests[configId] = {
          loading: false,
          result: { success: false, error: action.error.message },
          timestamp: new Date().toISOString()
        }
      })

    // Toggle status
    builder
      .addCase(toggleWhatsAppConfigStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleWhatsAppConfigStatus.fulfilled, (state, action) => {
        state.loading = false
        const index = state.configs.findIndex(config => config._id === action.payload._id)
        if (index !== -1) {
          state.configs[index] = action.payload
        }
      })
      .addCase(toggleWhatsAppConfigStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to toggle WhatsApp configuration status'
      })
  }
})

export const { clearError, clearConnectionTest, clearAllConnectionTests } = whatsappSlice.actions
export default whatsappSlice.reducer
