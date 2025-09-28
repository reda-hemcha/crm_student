import axiosInstance from './axiosInstance'

export const dashboardApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      console.log('📊 Fetching dashboard statistics...')
      const response = await axiosInstance.get('/dashboard/stats')
      console.log('✅ Dashboard stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch dashboard statistics' }
    }
  },

  // Get KPI data
  getKPIData: async (timeRange = '7d') => {
    try {
      console.log('📈 Fetching KPI data for timeRange:', timeRange)
      const response = await axiosInstance.get(`/dashboard/kpi?timeRange=${timeRange}`)
      console.log('✅ KPI data fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch KPI data' }
    }
  },

  // Get chart data for messages
  getMessageChartData: async (timeRange = '7d') => {
    try {
      console.log('📊 Fetching message chart data for timeRange:', timeRange)
      const response = await axiosInstance.get(`/dashboard/charts/messages?timeRange=${timeRange}`)
      console.log('✅ Message chart data fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching message chart data:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch message chart data' }
    }
  },

  // Get delivery statistics
  getDeliveryStats: async (timeRange = '30d') => {
    try {
      console.log('📦 Fetching delivery stats for timeRange:', timeRange)
      const response = await axiosInstance.get(`/dashboard/charts/delivery?timeRange=${timeRange}`)
      console.log('✅ Delivery stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching delivery stats:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch delivery statistics' }
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      console.log('📝 Fetching recent activities, limit:', limit)
      const response = await axiosInstance.get(`/dashboard/activities?limit=${limit}`)
      console.log('✅ Recent activities fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch recent activities' }
    }
  },

  // Get school statistics (for SUPER_ADMIN)
  getSchoolStats: async () => {
    try {
      console.log('🏫 Fetching school statistics...')
      const response = await axiosInstance.get('/dashboard/schools/stats')
      console.log('✅ School stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching school stats:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch school statistics' }
    }
  },

  // Get student statistics
  getStudentStats: async () => {
    try {
      console.log('👥 Fetching student statistics...')
      const response = await axiosInstance.get('/dashboard/students/stats')
      console.log('✅ Student stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching student stats:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch student statistics' }
    }
  },

  // Get class statistics
  getClassStats: async () => {
    try {
      console.log('📚 Fetching class statistics...')
      const response = await axiosInstance.get('/dashboard/classes/stats')
      console.log('✅ Class stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching class stats:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch class statistics' }
    }
  },

  // Get WhatsApp messaging statistics
  getWhatsAppStats: async () => {
    try {
      console.log('📱 Fetching WhatsApp statistics...')
      const response = await axiosInstance.get('/dashboard/whatsapp/stats')
      console.log('✅ WhatsApp stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching WhatsApp stats:', error.response?.data || error.message)
      throw error.response?.data || { message: 'Failed to fetch WhatsApp statistics' }
    }
  }
}

export default dashboardApi
