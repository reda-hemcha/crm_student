import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Building2, Users, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  setFilters,
  clearError
} from '../../store/schoolsSlice'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import SchoolModal from '../../components/schools/SchoolModal'

const SchoolsPage = () => {
  const dispatch = useDispatch()
  const { 
    schools, 
    pagination, 
    loading, 
    error,
    filters 
  } = useSelector((state) => state.schools)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load initial data
  useEffect(() => {
    dispatch(fetchSchools(filters))
  }, [dispatch])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ 
          ...filters, 
          search: searchTerm,
          page: 1
        }))
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, dispatch])

  // Fetch schools when filters change
  useEffect(() => {
    dispatch(fetchSchools(filters))
  }, [filters, dispatch])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleClearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    dispatch(setFilters(defaultFilters))
    setSearchTerm('')
  }

  const handleSortChange = (sortBy, sortOrder) => {
    dispatch(setFilters({ 
      ...filters, 
      sortBy, 
      sortOrder,
      page: 1 // Reset to first page when sorting
    }))
  }

  const handleAddSchool = () => {
    setEditingSchool(null)
    setIsModalOpen(true)
  }

  const handleEditSchool = (school) => {
    setEditingSchool(school)
    setIsModalOpen(true)
  }

  const handleSaveSchool = async (schoolData) => {
    try {
      if (editingSchool) {
        await dispatch(updateSchool({ 
          schoolId: editingSchool._id, 
          schoolData 
        })).unwrap()
        toast.success('School updated successfully!')
        setIsModalOpen(false)
        setEditingSchool(null)
        
        // Reload the schools list to show updated data
        const updatedFilters = { ...filters, page: 1 }
        await dispatch(fetchSchools(updatedFilters))
        dispatch(setFilters(updatedFilters))
      } else {
        await dispatch(createSchool(schoolData)).unwrap()
        toast.success('School created successfully!')
        setIsModalOpen(false)
        setEditingSchool(null)
        
        // Reload the schools list to show the new school
        // Reset to page 1 to show the newly added school
        const updatedFilters = { ...filters, page: 1 }
        await dispatch(fetchSchools(updatedFilters))
        dispatch(setFilters(updatedFilters))
        
        console.log('✅ School added and list refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Error saving school:', error)
      toast.error(error || 'Failed to save school')
    }
  }

  const handleDelete = async (school) => {
    if (window.confirm(`Are you sure you want to delete ${school.name}?`)) {
      try {
        await dispatch(deleteSchool(school._id)).unwrap()
        toast.success(`${school.name} deleted successfully`)
        
        // Reload the schools list to reflect the deletion
        await dispatch(fetchSchools(filters))
        
        console.log('✅ School deleted and list refreshed successfully')
      } catch (error) {
        console.error('❌ Error deleting school:', error)
        toast.error(error || 'Failed to delete school')
      }
    }
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schools Management</h1>
            <p className="text-gray-600 mt-1">Manage schools you created</p>
          </div>
          <button
            onClick={handleAddSchool}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add School</span>
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Search schools..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value, filters.sortOrder)}
              className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="createdAt">Created Date</option>
              <option value="name">School Name</option>
              <option value="studentCount">Student Count</option>
            </select>
            
            <button
              onClick={() => handleSortChange(filters.sortBy, filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Schools Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div key={school._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditSchool(school)}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded-lg transition-colors"
                      title="Edit School"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(school)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors"
                      title="Delete School"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{school.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{school.description || 'No description available'}</p>
                
                <div className="space-y-2">
                  {school.address && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{school.address}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{school.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{school.studentCount || 0} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {schools.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No schools found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or add a new school</p>
          </div>
        )}

        {/* Load More Button (if needed) */}
        {schools.length >= pagination.limit && (
          <div className="text-center">
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Load More Schools
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{schools.length}</div>
              <div className="text-sm text-gray-500">Your Schools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {schools.reduce((total, school) => total + (school.studentCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
          </div>
        </div>

        {/* School Modal */}
        <SchoolModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSchool(null)
          }}
          onSave={handleSaveSchool}
          school={editingSchool}
          loading={loading}
        />
      </div>
    </ProtectedRoute>
  )
}

export default SchoolsPage
