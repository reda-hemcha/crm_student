import React from 'react'
import { X, User, GraduationCap, Users, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const ViewStudentModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null

  const formatParents = (parents) => {
    if (!parents || parents.length === 0) {
      return (
        <div className="text-gray-500 text-sm">No parent information available</div>
      )
    }

    return (
      <div className="space-y-3">
        {parents.map((parent, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{parent.name || 'Unknown Parent'}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {parent.responsible_parent || 'Parent'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{parent.phoneNumber || 'No phone'}</p>
                {parent.email && (
                  <p className="text-sm text-gray-600">{parent.email}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getStudentInitials = (name) => {
    if (!name) return 'S'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-white">
                {getStudentInitials(student.name)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
              <p className="text-sm text-gray-600">View complete student information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900 font-medium">{student.name || 'Not provided'}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-gray-900">{student.gender || 'Not specified'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <p className="text-gray-900">{student.academicYear || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <p className="text-gray-900">{student.classId?.name || 'No class assigned'}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <p className="text-gray-900">{student.schoolId?.name || 'No school assigned'}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Parent Information</h3>
            </div>
            
            {formatParents(student.parentIds)}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">
                  {student.createdAt ? format(new Date(student.createdAt), 'MMM d, yyyy') : 'Unknown'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">
                  {student.updatedAt ? format(new Date(student.updatedAt), 'MMM d, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewStudentModal
