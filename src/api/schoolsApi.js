import axiosInstance from './axiosInstance'

export const schoolsApi = {
  // Get all schools with pagination (only schools created by current super admin)
  getSchools: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(search && { search })
      })

      const url = `/schools?${queryParams}`
      console.log('Fetching schools with URL:', url)
      console.log('Query params:', Object.fromEntries(queryParams))
      
      const response = await axiosInstance.get(url)
      
      console.log('Schools API response:', response.data)
      
      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 401:
            throw { message: 'Unauthorized access. Please login again.', code: 'UNAUTHORIZED' }
          case 403:
            throw { message: 'Access denied. You do not have permission to view schools.', code: 'FORBIDDEN' }
          case 404:
            throw { message: 'Schools endpoint not found.', code: 'NOT_FOUND' }
          case 500:
            throw { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' }
          default:
            throw data || { message: 'Failed to fetch schools', code: 'UNKNOWN_ERROR' }
        }
      } else if (error.request) {
        throw { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR' }
      } else {
        throw { message: error.message || 'Failed to fetch schools', code: 'CLIENT_ERROR' }
      }
    }
  },

  // Get single school by ID
  getSchool: async (schoolId) => {
    try {
      if (!schoolId) {
        throw { message: 'School ID is required', code: 'MISSING_ID' }
      }

      const response = await axiosInstance.get(`/schools/${schoolId}`)
      
      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 401:
            throw { message: 'Unauthorized access. Please login again.', code: 'UNAUTHORIZED' }
          case 403:
            throw { message: 'Access denied. You do not have permission to view this school.', code: 'FORBIDDEN' }
          case 404:
            throw { message: 'School not found.', code: 'NOT_FOUND' }
          case 500:
            throw { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' }
          default:
            throw data || { message: 'Failed to fetch school', code: 'UNKNOWN_ERROR' }
        }
      } else if (error.request) {
        throw { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR' }
      } else {
        throw { message: error.message || 'Failed to fetch school', code: 'CLIENT_ERROR' }
      }
    }
  },

  // Get schools with statistics (for dashboard)
  getSchoolsWithStats: async (params = {}) => {
    try {
      const {
        limit = 5,
        includeStats = true
      } = params

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        includeStats: includeStats.toString()
      })

      const response = await axiosInstance.get(`/schools/stats?${queryParams}`)
      
      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 401:
            throw { message: 'Unauthorized access. Please login again.', code: 'UNAUTHORIZED' }
          case 403:
            throw { message: 'Access denied. You do not have permission to view school statistics.', code: 'FORBIDDEN' }
          case 404:
            throw { message: 'Statistics endpoint not found.', code: 'NOT_FOUND' }
          case 500:
            throw { message: 'Server error. Please try again later.', code: 'SERVER_ERROR' }
          default:
            throw data || { message: 'Failed to fetch school statistics', code: 'UNKNOWN_ERROR' }
        }
      } else if (error.request) {
        throw { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR' }
      } else {
        throw { message: error.message || 'Failed to fetch school statistics', code: 'CLIENT_ERROR' }
      }
    }
  },

  // Create new school
  createSchool: async (schoolData) => {
    try {
      const response = await axiosInstance.post('/schools', schoolData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create school' }
    }
  },

  // Update school
  updateSchool: async (schoolId, schoolData) => {
    try {
      const response = await axiosInstance.put(`/schools/${schoolId}`, schoolData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update school' }
    }
  },

  // Delete school
  deleteSchool: async (schoolId) => {
    try {
      const response = await axiosInstance.delete(`/schools/${schoolId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete school' }
    }
  }
}
