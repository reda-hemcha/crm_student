import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  setFilters,
  clearError
} from '../../store/studentsSlice'
import { fetchClasses, fetchClassesBySchool } from '../../store/classesSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import StudentSearch from '../../components/students/StudentSearch'
import StudentTable from '../../components/students/StudentTable'
import StudentFilters from '../../components/students/StudentFilters'
import FilterBar from '../../components/students/FilterBar'
import Pagination from '../../components/students/Pagination'
import AddStudentModal from '../../components/students/AddStudentModal'
import ViewStudentModal from '../../components/students/ViewStudentModal'
import EditStudentModal from '../../components/students/EditStudentModal'

const StudentsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { 
    students, 
    pagination, 
    loading, 
    error,
    filters 
  } = useSelector((state) => state.students)
  
  const { classes } = useSelector((state) => state.classes)
  const { schools, loading: schoolsLoading } = useSelector((state) => state.schools)
  
  const { user } = useSelector((state) => state.auth)

  // Debug logging for schools data
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      console.log('StudentsPage - Schools data:', schools)
      console.log('StudentsPage - Schools loading:', schoolsLoading)
    }
  }, [schools, schoolsLoading, user?.role])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load initial data
  useEffect(() => {
    dispatch(fetchStudents(filters))
    
    // Fetch classes - for ADMIN use their schoolId, for SUPER_ADMIN fetch all
    if (user?.role === 'ADMIN' && user?.schoolId) {
      // Use the new dedicated endpoint for getting classes by school
      dispatch(fetchClassesBySchool({ schoolId: user.schoolId }))
    } else if (user?.role === 'SUPER_ADMIN') {
      dispatch(fetchClasses()) // Fetch all classes for SUPER_ADMIN
    }
    
    // Fetch schools for SUPER_ADMIN
    if (user?.role === 'SUPER_ADMIN') {
      dispatch(fetchSchools())
    }
  }, [dispatch, user?.schoolId, user?.role])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ 
          ...filters, 
          search: searchTerm,
          page: 1 // Reset to first page when searching
        }))
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, dispatch])

  // Fetch students when filters change
  useEffect(() => {
    dispatch(fetchStudents(filters))
  }, [filters, dispatch])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ 
      ...filters, 
      [filterType]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handleClearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 10,
      schoolId: '',
      classId: '',
      academicYear: '',
      search: ''
    }
    dispatch(setFilters(defaultFilters))
    setSearchTerm('')
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
  }

  const handleAddStudent = async (studentData) => {
    try {
      await dispatch(createStudent({
        studentData,
        userRole: user?.role,
        userSchoolId: user?.schoolId
      })).unwrap()
      
      toast.success('Student added successfully!')
      setIsModalOpen(false)
      
      // Reload the students list to show the new student and ensure data consistency
      // Reset to page 1 to show the newly added student
      const updatedFilters = { ...filters, page: 1 }
      await dispatch(fetchStudents(updatedFilters))
      
      // Update the filters state to reflect the page change
      dispatch(setFilters(updatedFilters))
      
      console.log('✅ Student added and list refreshed successfully')
    } catch (error) {
      console.error('❌ Error adding student:', error)
      toast.error(error || 'Failed to add student')
    }
  }

  const handleMessage = (student) => {
    // Navigate to one-to-one messaging with student data
    navigate('/messages/one-to-one', { 
      state: { student } 
    })
  }

  const handleView = (student) => {
    setSelectedStudent(student)
    setIsViewModalOpen(true)
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  const handleUpdateStudent = async (studentData) => {
    try {
      await dispatch(updateStudent({
        studentId: selectedStudent._id,
        studentData
      })).unwrap()
      
      toast.success('Student updated successfully!')
      setIsEditModalOpen(false)
      setSelectedStudent(null)
      
      // Refresh the students list
      dispatch(fetchStudents(filters))
    } catch (error) {
      toast.error(error || 'Failed to update student')
    }
  }

  const handleDelete = async (student) => {
    const confirmMessage = `Are you sure you want to delete ${student.name}?\n\nThis will permanently remove:\n- Student record\n- All associated data\n- Parent information\n\nThis action cannot be undone.`
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('🗑️ Deleting student:', student)
        await dispatch(deleteStudent(student._id)).unwrap()
        toast.success(`${student.name} deleted successfully`)
        
        // Refresh the students list to reflect changes
        dispatch(fetchStudents(filters))
        
        console.log('✅ Student deleted successfully')
      } catch (error) {
        console.error('❌ Error deleting student:', error)
        toast.error(error?.message || 'Failed to delete student')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <button
          onClick={async () => {
            try {
              // Check if user is authenticated
              if (!user) {
                console.error('User not authenticated')
                toast.error('Please login to add students.')
                return
              }
              
              // Ensure schools are fetched for SUPER_ADMIN when opening modal
              if (user?.role === 'SUPER_ADMIN') {
                console.log('Fetching schools for SUPER_ADMIN user:', user)
                const result = await dispatch(fetchSchools())
                if (fetchSchools.rejected.match(result)) {
                  console.error('Failed to fetch schools:', result.payload)
                  toast.error('Failed to load schools data. Please try again.')
                  return
                }
              }
              
              // Ensure classes are fetched when opening modal
              if (user?.role === 'ADMIN' && user?.schoolId) {
                console.log('Fetching classes for ADMIN user school:', user.schoolId)
                const result = await dispatch(fetchClassesBySchool({ schoolId: user.schoolId }))
                if (fetchClassesBySchool.rejected.match(result)) {
                  console.error('Failed to fetch classes:', result.payload)
                  toast.error('Failed to load classes data. Please try again.')
                  return
                }
              } else if (user?.role === 'SUPER_ADMIN') {
                console.log('Fetching all classes for SUPER_ADMIN user')
                const result = await dispatch(fetchClasses())
                if (fetchClasses.rejected.match(result)) {
                  console.error('Failed to fetch classes:', result.payload)
                  toast.error('Failed to load classes data. Please try again.')
                  return
                }
              }
              
              // Check if required data is available
              if (!classes || classes.length === 0) {
                console.error('No classes available')
                toast.error('No classes available. Please create a class first.')
                return
              }
              
              setIsModalOpen(true)
            } catch (error) {
              console.error('Error fetching schools:', error)
              toast.error('Failed to load schools data. Please try again.')
            }
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <StudentSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Filters */}
      <FilterBar>
        <StudentFilters
          filters={{
            classId: filters.classId || '',
            academicYear: filters.academicYear || '',
            relation: 'All Relations', // This would need to be implemented in the API
            sortBy: 'name'
          }}
          onFilterChange={(type, value) => {
            if (type === 'classId') {
              handleFilterChange('classId', value)
            } else if (type === 'academicYear') {
              handleFilterChange('academicYear', value)
            }
          }}
          onClearFilters={handleClearFilters}
          classes={classes}
        />
      </FilterBar>

      {/* Students Table */}
      <StudentTable
        students={students || []}
        onMessage={handleMessage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddStudent}
        classes={classes}
        schools={schools}
        userRole={user?.role}
        userSchoolName={user?.role === 'ADMIN' ? schools.find(s => s._id === user?.schoolId)?.name : null}
        loading={loading || schoolsLoading}
      />

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedStudent(null)
        }}
        onSave={handleUpdateStudent}
        student={selectedStudent}
        classes={classes}
        schools={schools}
        userRole={user?.role}
        userSchoolName={user?.role === 'ADMIN' ? schools.find(s => s._id === user?.schoolId)?.name : null}
        loading={loading || schoolsLoading}
      />

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {students ? new Set(students.map(s => s.classId?.name).filter(Boolean)).size : 0}
            </div>
            <div className="text-sm text-gray-500">Active Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {students ? students.length : 0}
            </div>
            <div className="text-sm text-gray-500">Current Page</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {students ? students.reduce((total, student) => total + (student.parentIds?.length || 0), 0) : 0}
            </div>
            <div className="text-sm text-gray-500">Total Parents</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentsPage