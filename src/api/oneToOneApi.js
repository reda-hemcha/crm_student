import axiosInstance from './axiosInstance'

export const oneToOneApi = {
  // Send one-to-one message to parent
  sendMessage: async (messageData) => {
    try {
      const { schoolId, phoneNumber, message, mediaUrl } = messageData
      
      console.log('📤 Sending one-to-one message:', {
        schoolId,
        phoneNumber: phoneNumber?.replace(/\s/g, ''), // Clean phone for logging
        hasMessage: !!message,
        hasMedia: !!mediaUrl
      })

      const payload = {
        phoneNumber,
        message,
        ...(schoolId && { schoolId }),
        ...(mediaUrl && { mediaUrl })
      }

      const response = await axiosInstance.post('/broadcasts/send-message', payload)
      
      console.log('✅ One-to-one message sent successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error sending one-to-one message:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to send message' }
    }
  },

  // Upload media file for one-to-one message
  uploadMedia: async (file) => {
    try {
      console.log('📎 Uploading media file for one-to-one message:', file.name)
      const formData = new FormData()
      formData.append('media', file)
      
      const response = await axiosInstance.post('/broadcasts/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('✅ Media uploaded for one-to-one message:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error uploading media for one-to-one message:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to upload media' }
    }
  },

  // Validate phone number format
  validatePhoneNumber: (phoneNumber) => {
    if (!phoneNumber) return { valid: false, error: 'Phone number is required' }
    
    // Clean the phone number
    const cleanPhone = phoneNumber.replace(/\s/g, '').replace(/-/g, '')
    
    // Check if it starts with + and has valid format
    if (!cleanPhone.startsWith('+')) {
      return { valid: false, error: 'Phone number must include country code (e.g., +216)' }
    }
    
    // Remove + for digit check
    const digitsOnly = cleanPhone.slice(1)
    
    // Check if remaining characters are all digits
    if (!/^\d+$/.test(digitsOnly)) {
      return { valid: false, error: 'Phone number can only contain digits and +' }
    }
    
    // Check minimum length (country code + number)
    if (digitsOnly.length < 7) {
      return { valid: false, error: 'Phone number is too short' }
    }
    
    // Check maximum length
    if (digitsOnly.length > 15) {
      return { valid: false, error: 'Phone number is too long' }
    }
    
    return { valid: true, cleanPhone }
  },

  // Format phone number for display
  formatPhoneNumber: (phoneNumber) => {
    if (!phoneNumber) return ''
    
    const cleanPhone = phoneNumber.replace(/\s/g, '').replace(/-/g, '')
    
    // If it starts with +216 (Tunisia), format it nicely
    if (cleanPhone.startsWith('+216')) {
      const number = cleanPhone.slice(4)
      if (number.length >= 8) {
        return `+216 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
      }
    }
    
    // For other countries, just return cleaned version
    return cleanPhone
  },

  // Get phone number suggestions based on student's parents
  getParentPhoneNumbers: (student) => {
    if (!student?.parentIds || !Array.isArray(student.parentIds)) {
      return []
    }
    
    return student.parentIds
      .filter(parent => parent.phoneNumber)
      .map(parent => ({
        name: parent.name,
        phoneNumber: parent.phoneNumber,
        relationship: parent.responsible_parent,
        formatted: oneToOneApi.formatPhoneNumber(parent.phoneNumber)
      }))
  }
}

export default oneToOneApi
