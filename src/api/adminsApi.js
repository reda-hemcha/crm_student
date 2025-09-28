import axiosInstance from './axiosInstance'

export const adminsApi = {
  // Get all admins with pagination
  getAdmins: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response = await axiosInstance.get(`/admins?${queryParams}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch admins' }
    }
  },

  // Get single admin by ID
  getAdmin: async (adminId) => {
    try {
      const response = await axiosInstance.get(`/admins/${adminId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch admin' }
    }
  },

  // Create new admin
  createAdmin: async (adminData) => {
    try {
      const response = await axiosInstance.post('/admins', adminData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create admin' }
    }
  },

  // Update admin
  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await axiosInstance.put(`/admins/${adminId}`, adminData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update admin' }
    }
  },

  // Delete admin
  deleteAdmin: async (adminId) => {
    try {
      const response = await axiosInstance.delete(`/admins/${adminId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete admin' }
    }
  },

  // Get available roles (static - no API call needed)
  getRoles: async () => {
    // Return static roles since the backend endpoint is returning 500
    return {
      success: true,
      data: [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'SUPER_ADMIN', label: 'Super Admin' }
      ]
    }
  }
}
