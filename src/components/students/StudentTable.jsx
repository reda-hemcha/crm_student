import React from 'react'
import { Send, Eye, Edit, Trash2 } from 'lucide-react'

const StudentTable = ({ students, onMessage, onView, onEdit, onDelete, loading }) => {
  const formatParents = (parents) => {
    if (!parents || parents.length === 0) {
      return <span className="text-gray-400">No parents</span>
    }

    if (parents.length === 1) {
      const parent = parents[0]
      return (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {parent.name} ({parent.responsible_parent || 'Parent'})
          </p>
          <p className="text-sm text-gray-500">{parent.phoneNumber}</p>
        </div>
      )
    }

    return (
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {parents[0].name} ({parents[0].responsible_parent || 'Parent'})
        </p>
        <p className="text-sm text-gray-500">{parents[0].phoneNumber}</p>
        {parents.length > 1 && (
          <p className="text-xs text-blue-600 mt-1">
            +{parents.length - 1} more parent{parents.length > 2 ? 's' : ''}
          </p>
        )}
      </div>
    )
  }

  const getStudentInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'S'
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Student Info</div>
          <div className="col-span-4">Parent(s) Info</div>
          <div className="col-span-4">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {students && students.length > 0 ? students.map((student, index) => (
          <div key={student._id || student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Student Info */}
              <div className="col-span-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getStudentInitials(student.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student.name || 'Unknown Student'}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {student.classId?.name || 'No Class'}
                    </p>
                    {student.academicYear && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-500">{student.academicYear}</p>
                      </>
                    )}
                    {student.gender && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-500">{student.gender}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div className="col-span-4">
                {formatParents(student.parentIds)}
              </div>

              {/* Actions */}
              <div className="col-span-4 flex items-center space-x-2">
                <button
                  onClick={() => onMessage(student)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onView(student)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(student)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Student"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(student)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No students available</p>
          </div>
        )}
      </div>

      {/* Empty State - Only show if students is null/undefined */}
      {(!students || students.length === 0) && !loading && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No students found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

export default StudentTable