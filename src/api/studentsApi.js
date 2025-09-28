import axiosInstance from './axiosInstance'

export const studentsApi = {
  // Get all students with pagination and filters
  getStudents: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        schoolId,
        classId,
        academicYear,
        search
      } = params

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      // Only add non-empty filter parameters
      if (schoolId && schoolId.trim()) {
        queryParams.append('schoolId', schoolId)
      }
      if (classId && classId.trim()) {
        queryParams.append('classId', classId)
      }
      if (academicYear && academicYear.trim()) {
        queryParams.append('academicYear', academicYear)
      }
      if (search && search.trim()) {
        queryParams.append('search', search)
      }

      const url = `/students?${queryParams}`
      console.log('Fetching students with URL:', url)
      console.log('Query params:', Object.fromEntries(queryParams))
      
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching students:', error.response?.data || error.message)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', error)
      throw error.response?.data || { message: 'Failed to fetch students' }
    }
  },

  // Get single student by ID
  getStudent: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/students/${studentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch student' }
    }
  },

  // Create new student
  createStudent: async (studentData, userRole = null, userSchoolId = null) => {
    try {
      // For ADMIN users, automatically add their schoolId to the student data
      const dataToSend = { ...studentData }
      
      if (userRole === 'ADMIN' && userSchoolId) {
        dataToSend.schoolId = userSchoolId
      }
      
      console.log('📝 Creating student with data:', dataToSend)
      console.log('👤 User role:', userRole, 'School ID:', userSchoolId)
      
      const response = await axiosInstance.post('/students', dataToSend)
      console.log('✅ Student created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error creating student:', error.response?.data || error.message)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', error)
      throw error.response?.data || { message: 'Failed to create student' }
    }
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await axiosInstance.put(`/students/${studentId}`, studentData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update student' }
    }
  },

  // Delete student
  deleteStudent: async (studentId) => {
    try {
      console.log('🗑️ Deleting student with ID:', studentId)
      const response = await axiosInstance.delete(`/students/${studentId}`)
      console.log('✅ Student deleted successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting student:', error.response?.data || error.message)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', error)
      throw error.response?.data || { message: 'Failed to delete student' }
    }
  },

  // Get classes for dropdown
  getClasses: async (schoolId) => {
    try {
      const queryParams = schoolId ? `?schoolId=${schoolId}` : ''
      const response = await axiosInstance.get(`/classes${queryParams}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch classes' }
    }
  },

  // Get schools for dropdown
  getSchools: async () => {
    try {
      const response = await axiosInstance.get('/schools')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch schools' }
    }
  }
}
