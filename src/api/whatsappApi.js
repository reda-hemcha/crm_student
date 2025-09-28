import axiosInstance from './axiosInstance'

// Twilio Configuration API calls
export const whatsappConfigApi = {
  // Get all Twilio configurations
  getConfigs: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      const url = `/twilio-configs?${queryParams}`
      console.log('🔍 Fetching WhatsApp configs with URL:', url)
      
      const response = await axiosInstance.get(url)
      console.log('✅ WhatsApp configs fetched successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching WhatsApp configs:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch WhatsApp configurations' }
    }
  },

  // Get configuration by school ID
  getConfigBySchool: async (schoolId) => {
    try {
      console.log('🔍 Fetching WhatsApp config for school:', schoolId)
      const response = await axiosInstance.get(`/twilio-configs/school/${schoolId}`)
      console.log('✅ WhatsApp config fetched for school:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching WhatsApp config for school:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch WhatsApp configuration for school' }
    }
  },

  // Create new Twilio configuration
  createConfig: async (configData) => {
    try {
      console.log('📝 Creating WhatsApp config with data:', configData)
      const response = await axiosInstance.post('/twilio-configs', configData)
      console.log('✅ WhatsApp config created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error creating WhatsApp config:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to create WhatsApp configuration' }
    }
  },

  // Update Twilio configuration
  updateConfig: async (configId, configData) => {
    try {
      console.log('📝 Updating WhatsApp config:', configId, configData)
      const response = await axiosInstance.put(`/twilio-configs/${configId}`, configData)
      console.log('✅ WhatsApp config updated successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error updating WhatsApp config:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to update WhatsApp configuration' }
    }
  },

  // Delete Twilio configuration
  deleteConfig: async (configId) => {
    try {
      console.log('🗑️ Deleting WhatsApp config:', configId)
      const response = await axiosInstance.delete(`/twilio-configs/${configId}`)
      console.log('✅ WhatsApp config deleted successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting WhatsApp config:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to delete WhatsApp configuration' }
    }
  },

  // Test Twilio connection
  testConnection: async (configId) => {
    try {
      console.log('🧪 Testing WhatsApp connection for config:', configId)
      const response = await axiosInstance.post(`/twilio-configs/${configId}/test`)
      console.log('✅ WhatsApp connection test completed:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error testing WhatsApp connection:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to test WhatsApp connection' }
    }
  },

  // Toggle configuration status
  toggleStatus: async (configId) => {
    try {
      console.log('🔄 Toggling WhatsApp config status:', configId)
      const response = await axiosInstance.patch(`/twilio-configs/${configId}/toggle-status`)
      console.log('✅ WhatsApp config status toggled:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error toggling WhatsApp config status:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to toggle WhatsApp configuration status' }
    }
  }
}

// WhatsApp Messaging API calls
export const whatsappMessagingApi = {
  // Send single message using new endpoint structure
  sendMessage: async (schoolId, messageData) => {
    try {
      console.log('📱 Sending WhatsApp message:', { schoolId, messageData })
      const response = await axiosInstance.post(`/twilio-configs/${schoolId}/send-message`, messageData)
      console.log('✅ WhatsApp message sent successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to send WhatsApp message' }
    }
  },

  // Send bulk messages (sequential calls to single message endpoint)
  sendBulkMessages: async (schoolId, recipients, message, mediaUrl = null) => {
    try {
      console.log('📱 Sending bulk WhatsApp messages:', { schoolId, recipients, message })
      
      const results = []
      let successCount = 0
      let errorCount = 0
      const errors = []

      // Send messages sequentially to avoid rate limiting
      for (const recipient of recipients) {
        try {
          const messageData = {
            message,
            phoneNumber: recipient,
            ...(mediaUrl && { mediaUrl })
          }
          
          const response = await axiosInstance.post(`/twilio-configs/${schoolId}/send-message`, messageData)
          results.push({
            recipient,
            success: true,
            data: response.data
          })
          successCount++
        } catch (error) {
          results.push({
            recipient,
            success: false,
            error: error.response?.data || { message: 'Failed to send message' }
          })
          errorCount++
          errors.push(error.response?.data?.message || error.message)
        }
      }

      const bulkResult = {
        success: errorCount === 0,
        message: `${successCount} of ${recipients.length} messages sent successfully`,
        data: {
          total: recipients.length,
          successful: successCount,
          failed: errorCount,
          results,
          errors: errorCount > 0 ? errors : undefined
        }
      }

      console.log('✅ Bulk WhatsApp messages completed:', bulkResult)
      return bulkResult
    } catch (error) {
      console.error('❌ Error sending bulk WhatsApp messages:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to send bulk WhatsApp messages' }
    }
  },

  // Test message (same as send message for testing purposes)
  testMessage: async (schoolId, phoneNumber, message, mediaUrl = null) => {
    try {
      console.log('🧪 Testing WhatsApp message:', { schoolId, phoneNumber, message })
      
      const messageData = {
        message,
        phoneNumber,
        ...(mediaUrl && { mediaUrl })
      }
      
      const response = await axiosInstance.post(`/twilio-configs/${schoolId}/send-message`, messageData)
      console.log('✅ WhatsApp test message sent:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error testing WhatsApp message:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to test WhatsApp message' }
    }
  },

  // Send message with media
  sendMessageWithMedia: async (schoolId, phoneNumber, message, mediaUrl) => {
    try {
      console.log('📱 Sending WhatsApp message with media:', { schoolId, phoneNumber, message, mediaUrl })
      
      const messageData = {
        message,
        phoneNumber,
        mediaUrl
      }
      
      const response = await axiosInstance.post(`/twilio-configs/${schoolId}/send-message`, messageData)
      console.log('✅ WhatsApp message with media sent successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error sending WhatsApp message with media:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to send WhatsApp message with media' }
    }
  }
}

export default {
  config: whatsappConfigApi,
  messaging: whatsappMessagingApi
}
