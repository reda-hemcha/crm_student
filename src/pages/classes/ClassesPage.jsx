import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Search, Filter, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  setFilters,
  clearError,
  fetchEducationData
} from '../../store/classesSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import ClassesTable from '../../components/classes/ClassesTable'
import ClassModal from '../../components/classes/ClassModal'
import ClassesCsvUploadModal from '../../components/classes/ClassesCsvUploadModal'
import Pagination from '../../components/students/Pagination'

const ClassesPage = () => {
  const dispatch = useDispatch()
  const { 
    classes, 
    pagination, 
    loading, 
    error,
    filters,
    educationData
  } = useSelector((state) => state.classes)
  
  const { schools } = useSelector((state) => state.schools)
  const { user } = useSelector((state) => state.auth)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Load initial data
  useEffect(() => {
    const initialFilters = {
      ...filters,
      schoolId: user?.role === 'ADMIN' ? user?.schoolId : null
    }
    dispatch(fetchClasses(initialFilters))
    dispatch(fetchSchools())
    dispatch(fetchEducationData())
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

  // Fetch classes when filters change
  useEffect(() => {
    dispatch(fetchClasses(filters))
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
      schoolId: user?.role === 'ADMIN' ? user?.schoolId : null,
      level: null,
      year: null
    }
    dispatch(setFilters(defaultFilters))
    setSearchTerm('')
  }

  const handleAddClass = () => {
    setEditingClass(null)
    setIsModalOpen(true)
  }

  const handleCsvUpload = () => {
    setIsCsvModalOpen(true)
  }

  const handleCsvUploadSuccess = () => {
    // Refresh the classes list after successful CSV upload
    dispatch(fetchClasses(filters))
    toast.success('Students uploaded successfully!')
  }

  const handleEditClass = (classData) => {
    setEditingClass(classData)
    setIsModalOpen(true)
  }

  const handleSaveClass = async (classData) => {
    try {
      if (editingClass) {
        await dispatch(updateClass({ 
          classId: editingClass._id, 
          classData 
        })).unwrap()
        toast.success('Class updated successfully!')
        setIsModalOpen(false)
        setEditingClass(null)
        
        // Reload the classes list to show updated data
        const updatedFilters = { ...filters, page: 1 }
        await dispatch(fetchClasses(updatedFilters))
        dispatch(setFilters(updatedFilters))
      } else {
        await dispatch(createClass(classData)).unwrap()
        toast.success('Class created successfully!')
        setIsModalOpen(false)
        setEditingClass(null)
        
        // Reload the classes list to show the new class
        // Reset to page 1 to show the newly added class
        const updatedFilters = { ...filters, page: 1 }
        await dispatch(fetchClasses(updatedFilters))
        dispatch(setFilters(updatedFilters))
        
        console.log('✅ Class added and list refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Error saving class:', error)
      toast.error(error || 'Failed to save class')
    }
  }

  const handleDeleteClass = async (classData) => {
    if (window.confirm(`Are you sure you want to delete "${classData.name}"? This action cannot be undone.`)) {
      try {
        await dispatch(deleteClass(classData._id)).unwrap()
        toast.success(`"${classData.name}" deleted successfully`)
        
        // Reload the classes list to reflect the deletion
        await dispatch(fetchClasses(filters))
        
        console.log('✅ Class deleted and list refreshed successfully')
      } catch (error) {
        console.error('❌ Error deleting class:', error)
        toast.error(error || 'Failed to delete class')
      }
    }
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
  }

  const handleSchoolFilter = (schoolId) => {
    dispatch(setFilters({ 
      ...filters, 
      schoolId: schoolId || null,
      page: 1
    }))
  }

  const filteredSchools = user?.role === 'SUPER_ADMIN' ? schools : schools.filter(school => school._id === user?.schoolId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-gray-600 mt-1">Manage classes and their school assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCsvUpload}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={handleAddClass}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Search classes..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* School Filter (only for SUPER_ADMIN) */}
            {user?.role === 'SUPER_ADMIN' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by School
                </label>
                <select
                  value={filters.schoolId || ''}
                  onChange={(e) => handleSchoolFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name || 'Unknown School'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Education Level Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Education Level
              </label>
              <select
                value={filters.level || ''}
                onChange={(e) => dispatch(setFilters({ level: e.target.value || null }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                {educationData.levelOptions?.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Academic Year
              </label>
              <select
                value={filters.year || ''}
                onChange={(e) => dispatch(setFilters({ year: e.target.value || null }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Years</option>
                {Object.values(educationData.academicYears || {}).flat().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Classes Table */}
      <ClassesTable
        classes={classes}
        onEdit={handleEditClass}
        onDelete={handleDeleteClass}
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

      {/* Class Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClass(null)
        }}
        onSave={handleSaveClass}
        classData={editingClass}
        schools={filteredSchools}
        userRole={user?.role}
        userSchoolName={user?.role === 'ADMIN' ? schools.find(s => s._id === user?.schoolId)?.name : null}
        loading={loading}
      />

      {/* CSV Upload Modal */}
      <ClassesCsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onUploadSuccess={handleCsvUploadSuccess}
      />

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-500">Total Class Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{schools.length}</div>
            <div className="text-sm text-gray-500">Available Schools</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {classes.filter(cls => cls.schoolId?._id === user?.schoolId).length}
            </div>
            <div className="text-sm text-gray-500">Your School Classes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassesPage
