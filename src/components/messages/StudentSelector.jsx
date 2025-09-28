import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Users, GraduationCap, Building2, X } from 'lucide-react'
import { fetchStudents } from '../../store/studentsSlice'
import { setSelectedStudent } from '../../store/oneToOneSlice'

const StudentSelector = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { students, loading } = useSelector((state) => state.students)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')

  // Load students when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchStudents({ 
        page: 1, 
        limit: 1000, // Get all students for selection
        ...(user?.role === 'ADMIN' && { schoolId: user?.schoolId })
      }))
    }
  }, [isOpen, dispatch, user?.role, user?.schoolId])

  // Filter students based on search and school
  const filteredStudents = students?.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.classId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentIds?.some(parent => 
        parent.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesSchool = !selectedSchool || 
      (user?.role === 'SUPER_ADMIN' ? 
        student.schoolId?._id === selectedSchool || student.schoolId === selectedSchool :
        true // ADMIN users already have filtered students
      )
    
    return matchesSearch && matchesSchool
  }) || []

  const handleSelectStudent = (student) => {
    dispatch(setSelectedStudent(student))
    onClose()
  }

  const getUniqueSchools = () => {
    if (user?.role !== 'SUPER_ADMIN') return []
    
    const schools = students
      ?.map(student => student.schoolId)
      .filter((school, index, self) => 
        school && self.findIndex(s => s?._id === school?._id) === index
      ) || []
    
    return schools
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Student</h2>
              <p className="text-sm text-gray-500">Choose a student to send a message to their parents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, class, or parent name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* School Filter (SUPER_ADMIN only) */}
            {user?.role === 'SUPER_ADMIN' && getUniqueSchools().length > 0 && (
              <div>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Schools</option>
                  {getUniqueSchools().map(school => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Students List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No students found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Student Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {student.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {student.gender}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <GraduationCap className="w-3 h-3" />
                            <span>{student.classId?.name || 'No Class'}</span>
                          </div>
                          
                          {user?.role === 'SUPER_ADMIN' && student.schoolId && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Building2 className="w-3 h-3" />
                              <span>{student.schoolId?.name || 'Unknown School'}</span>
                            </div>
                          )}
                        </div>

                        {/* Parents Info */}
                        {student.parentIds && student.parentIds.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              {student.parentIds.length === 1 ? 'Parent' : 'Parents'}: {' '}
                              {student.parentIds.map(parent => parent.name).join(', ')}
                            </p>
                            <p className="text-xs text-blue-600">
                              {student.parentIds.length} contact{student.parentIds.length > 1 ? 's' : ''} available
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentSelector
