import axiosInstance from './axiosInstance'

export const studentsCsvApi = {
  // Upload students CSV file
  uploadStudentsCsv: async (formData) => {
    try {
      console.log('📤 Uploading students CSV file:', {
        hasFile: !!formData.get('csvFile'),
        fileName: formData.get('csvFile')?.name,
        fileSize: formData.get('csvFile')?.size,
        classId: formData.get('classId'),
        schoolId: formData.get('schoolId')
      })
      
      // Log all FormData entries for debugging
      console.log('📋 FormData entries:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
      }

      const response = await axiosInstance.post('/students/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('✅ Students CSV uploaded successfully:', response.data)
      console.log('📊 Upload response details:', {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
        totalRows: response.data.data?.totalRows,
        successful: response.data.data?.successful,
        errors: response.data.data?.errors
      })
      return response.data
    } catch (error) {
      console.error('❌ Error uploading students CSV:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to upload CSV file' }
    }
  },

  // Get CSV upload template
  getCsvTemplate: async () => {
    try {
      const response = await axiosInstance.get('/students/download-template')
      return response.data
    } catch (error) {
      console.error('❌ Error getting CSV template:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to get CSV template' }
    }
  },

  // Validate CSV data before upload
  validateCsvData: async (formData) => {
    try {
      console.log('🔍 Validating CSV data before upload')
      
      const response = await axiosInstance.post('/students/validate-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('✅ CSV data validation result:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error validating CSV data:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to validate CSV data' }
    }
  }
}

export default studentsCsvApi
