import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { oneToOneApi } from '../api/oneToOneApi'

// Async thunks
export const sendOneToOneMessage = createAsyncThunk(
  'oneToOne/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await oneToOneApi.sendMessage(messageData)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error sending one-to-one message:', error)
      return rejectWithValue(error.message || 'Failed to send message')
    }
  }
)

export const uploadOneToOneMedia = createAsyncThunk(
  'oneToOne/uploadMedia',
  async (file, { rejectWithValue }) => {
    try {
      const response = await oneToOneApi.uploadMedia(file)
      return response.success ? response.data : response
    } catch (error) {
      console.error('❌ Error uploading media for one-to-one message:', error)
      return rejectWithValue(error.message || 'Failed to upload media')
    }
  }
)

const initialState = {
  // Message sending state
  sending: false,
  sendError: null,
  lastSentMessage: null,
  
  // Media upload state
  mediaUploading: false,
  mediaUploadError: null,
  uploadedMediaUrl: null,
  
  // Form state
  selectedStudent: null,
  selectedParent: null,
  messageContent: '',
  
  // UI state
  showStudentSelector: false,
  showParentSelector: false,
  showMediaUpload: false,
  
  // Validation state
  phoneValidation: {
    isValid: true,
    error: null,
    cleanPhone: null
  },
  
  // Message history (for display)
  messageHistory: [],
  loadingHistory: false,
  historyError: null
}

const oneToOneSlice = createSlice({
  name: 'oneToOne',
  initialState,
  reducers: {
    // Student selection
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload
      state.selectedParent = null // Reset parent selection
      state.phoneValidation = { isValid: true, error: null, cleanPhone: null }
    },
    
    // Parent selection
    setSelectedParent: (state, action) => {
      state.selectedParent = action.payload
      if (action.payload?.phoneNumber) {
        const validation = oneToOneApi.validatePhoneNumber(action.payload.phoneNumber)
        state.phoneValidation = validation
      }
    },
    
    // Message content
    setMessageContent: (state, action) => {
      state.messageContent = action.payload
    },
    
    // Phone number validation
    validatePhoneNumber: (state, action) => {
      const validation = oneToOneApi.validatePhoneNumber(action.payload)
      state.phoneValidation = validation
    },
    
    // UI state management
    setShowStudentSelector: (state, action) => {
      state.showStudentSelector = action.payload
    },
    
    setShowParentSelector: (state, action) => {
      state.showParentSelector = action.payload
    },
    
    setShowMediaUpload: (state, action) => {
      state.showMediaUpload = action.payload
    },
    
    // Clear uploaded media
    clearUploadedMedia: (state) => {
      state.uploadedMediaUrl = null
      state.mediaUploadError = null
    },
    
    // Clear form
    clearForm: (state) => {
      state.selectedStudent = null
      state.selectedParent = null
      state.messageContent = ''
      state.uploadedMediaUrl = null
      state.phoneValidation = { isValid: true, error: null, cleanPhone: null }
      state.sendError = null
      state.mediaUploadError = null
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.sendError = null
      state.mediaUploadError = null
      state.historyError = null
    },
    
    // Add message to history
    addMessageToHistory: (state, action) => {
      state.messageHistory.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      })
    },
    
    // Set message history
    setMessageHistory: (state, action) => {
      state.messageHistory = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendOneToOneMessage.pending, (state) => {
        state.sending = true
        state.sendError = null
      })
      .addCase(sendOneToOneMessage.fulfilled, (state, action) => {
        state.sending = false
        state.lastSentMessage = action.payload
        state.sendError = null
        
        // Add to message history
        state.messageHistory.push({
          id: action.payload.messageId || Date.now(),
          type: 'sent',
          content: state.messageContent,
          phoneNumber: state.selectedParent?.phoneNumber,
          parentName: state.selectedParent?.name,
          messageId: action.payload.messageId,
          sentAt: action.payload.sentAt,
          hasMedia: action.payload.hasMedia,
          mediaUrl: action.payload.mediaUrl,
          status: action.payload.status,
          timestamp: new Date().toISOString()
        })
        
        // Clear form after successful send
        state.messageContent = ''
        state.uploadedMediaUrl = null
      })
      .addCase(sendOneToOneMessage.rejected, (state, action) => {
        state.sending = false
        state.sendError = action.payload
      })
      
      // Upload Media
      .addCase(uploadOneToOneMedia.pending, (state) => {
        state.mediaUploading = true
        state.mediaUploadError = null
      })
      .addCase(uploadOneToOneMedia.fulfilled, (state, action) => {
        state.mediaUploading = false
        state.uploadedMediaUrl = action.payload.mediaUrl
        state.mediaUploadError = null
      })
      .addCase(uploadOneToOneMedia.rejected, (state, action) => {
        state.mediaUploading = false
        state.mediaUploadError = action.payload
      })
  }
})

export const {
  setSelectedStudent,
  setSelectedParent,
  setMessageContent,
  validatePhoneNumber,
  setShowStudentSelector,
  setShowParentSelector,
  setShowMediaUpload,
  clearUploadedMedia,
  clearForm,
  clearErrors,
  addMessageToHistory,
  setMessageHistory
} = oneToOneSlice.actions

export default oneToOneSlice.reducer
