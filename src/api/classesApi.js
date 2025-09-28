import axiosInstance from './axiosInstance'

export const classesApi = {
  // Get all classes with pagination and enhanced filtering
  getClasses: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        schoolId,
        search,
        level,
        year
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(schoolId && { schoolId }),
        ...(search && { search }),
        ...(level && { level }),
        ...(year && { year })
      })

      const url = `/classes?${queryParams}`
      console.log('Fetching classes with URL:', url)
      console.log('Query params:', Object.fromEntries(queryParams))
      
      const response = await axiosInstance.get(url)
      
      console.log('Classes API response:', response.data)
      console.log('Response type:', typeof response.data)
      console.log('Response status:', response.status)
      
      // Handle empty or invalid response
      if (!response.data || response.data === '' || typeof response.data === 'string') {
        console.warn('⚠️ Empty or invalid API response, returning empty data structure')
        return {
          success: true,
          data: {
            classes: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 }
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching classes:', error.response?.data || error.message)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', error)
      throw error.response?.data || { message: 'Failed to fetch classes' }
    }
  },

  // Get single class by ID
  getClass: async (classId) => {
    try {
      const response = await axiosInstance.get(`/classes/${classId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch class' }
    }
  },

  // Create new class
  createClass: async (classData) => {
    try {
      const response = await axiosInstance.post('/classes', classData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create class' }
    }
  },

  // Update class
  updateClass: async (classId, classData) => {
    try {
      const response = await axiosInstance.put(`/classes/${classId}`, classData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update class' }
    }
  },

  // Delete class
  deleteClass: async (classId) => {
    try {
      const response = await axiosInstance.delete(`/classes/${classId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete class' }
    }
  },

  // Get education data (levels and years)
  getEducationData: async () => {
    try {
      const response = await axiosInstance.get('/classes/education-data')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch education data' }
    }
  },

  // Get academic years for specific education level
  getAcademicYearsByLevel: async (level) => {
    try {
      const response = await axiosInstance.get(`/classes/academic-years/${level}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch academic years' }
    }
  },

  // Get classes for a specific school (NEW DEDICATED ENDPOINT)
  getClassesBySchool: async (schoolId, params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        level,
        year
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(level && { level }),
        ...(year && { year })
      })

      const queryString = queryParams.toString()
      const url = `/classes/school/${schoolId}${queryString ? `?${queryString}` : ''}`
      
      console.log('Fetching classes by school with URL:', url)
      console.log('School ID:', schoolId)
      console.log('Query params:', Object.fromEntries(queryParams))
      
      const response = await axiosInstance.get(url)
      
      console.log('Classes by school API response:', response.data)
      console.log('Response type:', typeof response.data)
      console.log('Response status:', response.status)
      
      // Handle empty or invalid response
      if (!response.data || response.data === '' || typeof response.data === 'string') {
        console.warn('⚠️ Empty or invalid API response, returning empty data structure')
        return {
          success: true,
          data: {
            school: { id: schoolId, name: 'Unknown School' },
            classes: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 }
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching classes by school:', error.response?.data || error.message)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', error)
      throw error.response?.data || { message: 'Failed to fetch classes for school' }
    }
  }
}
