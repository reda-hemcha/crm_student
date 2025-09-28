import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Filter, Users, GraduationCap, BookOpen, Search, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchClasses } from '../../store/classesSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import ClassLevelModal from '../../components/groups/ClassLevelModal'
import ClassLevelFilters from '../../components/groups/ClassLevelFilters'
import ClassLevelCard from '../../components/groups/ClassLevelCard'

const GroupsPage = () => {
  const dispatch = useDispatch()
  const { classes, loading } = useSelector((state) => state.classes)
  const { schools } = useSelector((state) => state.schools)
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filteredClasses, setFilteredClasses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClassLevel, setSelectedClassLevel] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'cards'

  // Class levels based on French education system
  const classLevels = [
    { value: 'primary', label: 'Primary School', years: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'] },
    { value: 'lower-secondary', label: 'Lower Secondary (Collège)', years: ['7th Year', '8th Year', '9th Year'] },
    { value: 'upper-secondary', label: 'Upper Secondary (Lycée)', years: ['10th Year', '11th Year', '12th Year'] }
  ]

  // Load initial data
  useEffect(() => {
    dispatch(fetchClasses())
    if (user?.role === 'SUPER_ADMIN') {
      dispatch(fetchSchools())
    }
  }, [dispatch, user?.role])

  // Filter classes based on search and filters
  useEffect(() => {
    let filtered = classes || []

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter(cls => {
        const className = cls.name.toLowerCase()
        const level = classLevels.find(l => l.value === selectedLevel)
        return level.years.some(year => className.includes(year.toLowerCase()))
      })
    }

    // School filter (for SUPER_ADMIN)
    if (selectedSchool && user?.role === 'SUPER_ADMIN') {
      filtered = filtered.filter(cls => cls.schoolId?._id === selectedSchool)
    }

    setFilteredClasses(filtered)
  }, [classes, searchTerm, selectedLevel, selectedSchool, user?.role])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleLevelFilter = (level) => {
    setSelectedLevel(level === selectedLevel ? '' : level)
  }

  const handleSchoolFilter = (schoolId) => {
    setSelectedSchool(schoolId === selectedSchool ? '' : schoolId)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedLevel('')
    setSelectedSchool('')
  }

  const getClassLevel = (className) => {
    const name = className.toLowerCase()
    
    // Check primary school (1st to 6th year)
    if (name.includes('1st') || name.includes('2nd') || name.includes('3rd') || 
        name.includes('4th') || name.includes('5th') || name.includes('6th')) {
      return { level: 'primary', color: 'bg-green-100 text-green-800' }
    }
    
    // Check lower secondary (7th to 9th year)
    if (name.includes('7th') || name.includes('8th') || name.includes('9th')) {
      return { level: 'lower-secondary', color: 'bg-blue-100 text-blue-800' }
    }
    
    // Check upper secondary (10th to 12th year)
    if (name.includes('10th') || name.includes('11th') || name.includes('12th')) {
      return { level: 'upper-secondary', color: 'bg-purple-100 text-purple-800' }
    }
    
    return { level: 'other', color: 'bg-gray-100 text-gray-800' }
  }

  const getLevelLabel = (level) => {
    const levelObj = classLevels.find(l => l.value === level)
    return levelObj ? levelObj.label : 'Other'
  }

  const handleViewClass = (cls) => {
    toast.success(`Viewing details for ${cls.name}`)
    // In real app, this would open a detailed view
  }

  const handleEditClass = (cls) => {
    toast.success(`Editing ${cls.name}`)
    // In real app, this would open an edit modal
  }

  const handleDeleteClass = (cls) => {
    if (window.confirm(`Are you sure you want to delete class "${cls.name}"?`)) {
      toast.success(`Class "${cls.name}" deleted successfully`)
      // In real app, this would call the delete API
    }
  }

  const handleAddClass = () => {
    setSelectedClassLevel(null)
    setIsModalOpen(true)
  }

  const handleEditClass = (cls) => {
    setSelectedClassLevel(cls)
    setIsModalOpen(true)
  }

  const handleSaveClassLevel = async (classData) => {
    try {
      // Here you would call the API to save the class level
      toast.success(`Class level "${classData.name}" saved successfully!`)
      setIsModalOpen(false)
      setSelectedClassLevel(null)
      // Refresh the classes list
      dispatch(fetchClasses())
    } catch (error) {
      toast.error(error || 'Failed to save class level')
    }
  }

  // Group classes by level for better organization
  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    const levelInfo = getClassLevel(cls.name)
    const level = levelInfo.level
    
    if (!acc[level]) {
      acc[level] = []
    }
    acc[level].push(cls)
    
    return acc
  }, {})

  const hasActiveFilters = searchTerm || selectedLevel || selectedSchool

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups / Classes Management</h1>
          <p className="text-gray-600 mt-1">Organize students into class levels and groups for better communication.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </button>
          </div>
          
          <button
            onClick={handleAddClass}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Class Level</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search classes by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {classLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => handleLevelFilter(level.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedLevel === level.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Filter (SUPER_ADMIN only) */}
              {user?.role === 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => handleSchoolFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Schools</option>
                    {schools.map(school => (
                      <option key={school._id} value={school._id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Class Levels Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classLevels.map(level => {
          const levelClasses = groupedClasses[level.value] || []
          const totalStudents = levelClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
          
          return (
            <div key={level.value} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{level.label}</h3>
                    <p className="text-sm text-gray-600">{level.years.join(', ')}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{levelClasses.length}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Classes</span>
                  <span className="font-medium">{levelClasses.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{totalStudents}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Classes</h2>
          <p className="text-sm text-gray-600">
            {filteredClasses.length} class{filteredClasses.length !== 1 ? 'es' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters ? 'Try adjusting your search or filters' : 'Get started by creating your first class level'}
            </p>
            <button
              onClick={handleAddClass}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Class Level
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
                <ClassLevelCard
                  key={cls._id}
                  classLevel={cls}
                  onView={handleViewClass}
                  onEdit={handleEditClass}
                  onDelete={handleDeleteClass}
                  userRole={user?.role}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(groupedClasses).map(([level, levelClasses]) => (
              <div key={level}>
                {/* Level Header */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">{getLevelLabel(level)}</h3>
                  <p className="text-sm text-gray-600">{levelClasses.length} classes</p>
                </div>
                
                {/* Classes in this level */}
                {levelClasses.map((cls) => {
                  const levelInfo = getClassLevel(cls.name)
                  
                  return (
                    <div key={cls._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{cls.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
                                {getLevelLabel(levelInfo.level)}
                              </span>
                              {cls.schoolId && (
                                <span className="text-sm text-gray-500">
                                  • {cls.schoolId.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{cls.studentCount || 0} students</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewClass(cls)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClass(cls)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Class"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{filteredClasses.length}</div>
            <div className="text-sm text-gray-500">Total Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {filteredClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Object.keys(groupedClasses).length}
            </div>
            <div className="text-sm text-gray-500">Education Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {schools.length}
            </div>
            <div className="text-sm text-gray-500">Schools</div>
          </div>
        </div>
      </div>

      {/* Class Level Modal */}
      <ClassLevelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClassLevel(null)
        }}
        onSave={handleSaveClassLevel}
        classLevel={selectedClassLevel}
        schools={schools}
        userRole={user?.role}
        userSchoolName={user?.role === 'ADMIN' ? schools.find(s => s._id === user?.schoolId)?.name : null}
        loading={loading}
      />
    </div>
  )
}

export default GroupsPage