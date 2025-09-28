import axiosInstance from './axiosInstance'

export const broadcastApi = {
  // Get all broadcasts with filtering and pagination
  getBroadcasts: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        schoolId,
        groupType,
        status,
        search
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(schoolId && { schoolId }),
        ...(groupType && { groupType }),
        ...(status && { status }),
        ...(search && { search })
      })

      const url = `/broadcasts?${queryParams}`
      console.log('📡 Fetching broadcasts with URL:', url)
      
      const response = await axiosInstance.get(url)
      console.log('✅ Broadcasts fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching broadcasts:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch broadcasts' }
    }
  },

  // Get single broadcast by ID with detailed results
  getBroadcast: async (broadcastId) => {
    try {
      console.log('📡 Fetching broadcast details for ID:', broadcastId)
      const response = await axiosInstance.get(`/broadcasts/${broadcastId}`)
      console.log('✅ Broadcast details fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching broadcast details:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch broadcast details' }
    }
  },

  // Create new broadcast
  createBroadcast: async (broadcastData) => {
    try {
      console.log('📡 Creating broadcast:', broadcastData)
      const response = await axiosInstance.post('/broadcasts', broadcastData)
      console.log('✅ Broadcast created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error creating broadcast:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to create broadcast' }
    }
  },

  // Update broadcast (only drafts can be updated)
  updateBroadcast: async (broadcastId, updateData) => {
    try {
      console.log('📡 Updating broadcast:', broadcastId, updateData)
      const response = await axiosInstance.put(`/broadcasts/${broadcastId}`, updateData)
      console.log('✅ Broadcast updated:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating broadcast:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to update broadcast' }
    }
  },

  // Delete broadcast
  deleteBroadcast: async (broadcastId) => {
    try {
      console.log('📡 Deleting broadcast:', broadcastId)
      const response = await axiosInstance.delete(`/broadcasts/${broadcastId}`)
      console.log('✅ Broadcast deleted:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting broadcast:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to delete broadcast' }
    }
  },

  // Cancel broadcast
  cancelBroadcast: async (broadcastId, reason = '') => {
    try {
      console.log('📡 Cancelling broadcast:', broadcastId, 'Reason:', reason)
      const response = await axiosInstance.post(`/broadcasts/${broadcastId}/cancel`, { reason })
      console.log('✅ Broadcast cancelled:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error cancelling broadcast:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to cancel broadcast' }
    }
  },

  // Send now (convert scheduled to immediate)
  sendNow: async (broadcastId) => {
    try {
      console.log('📡 Sending broadcast now:', broadcastId)
      const response = await axiosInstance.post(`/broadcasts/${broadcastId}/send-now`)
      console.log('✅ Broadcast sending started:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error sending broadcast now:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to send broadcast now' }
    }
  },

  // Get broadcast statistics
  getBroadcastStats: async (schoolId = null) => {
    try {
      const url = schoolId ? `/broadcasts/stats?schoolId=${schoolId}` : '/broadcasts/stats'
      console.log('📡 Fetching broadcast statistics:', url)
      
      const response = await axiosInstance.get(url)
      console.log('✅ Broadcast statistics fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching broadcast statistics:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch broadcast statistics' }
    }
  },

  // Get broadcast options (group types, statuses, education levels)
  getBroadcastOptions: async () => {
    try {
      console.log('📡 Fetching broadcast options...')
      const response = await axiosInstance.get('/broadcasts/options')
      console.log('✅ Broadcast options fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching broadcast options:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch broadcast options' }
    }
  },

  // Upload media file for broadcast
  uploadMedia: async (file) => {
    try {
      console.log('📡 Uploading media file:', file.name)
      const formData = new FormData()
      formData.append('media', file)
      
      const response = await axiosInstance.post('/broadcasts/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('✅ Media uploaded:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error uploading media:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to upload media' }
    }
  }
}

export default broadcastApi
