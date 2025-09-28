import React from 'react'
import { Edit2, Trash2, Users } from 'lucide-react'

const ClassesTable = ({ classes, onEdit, onDelete, loading }) => {
  const getClassInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'CL'
    }
    const words = name.split(' ')
    if (words.length >= 2) {
      return words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2)
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getEducationLevelDisplay = (level) => {
    const levelMap = {
      'primary': 'Primary School',
      'lower-secondary': 'Lower Secondary',
      'upper-secondary': 'Upper Secondary'
    }
    return levelMap[level] || level || 'Unknown'
  }

  const getLevelColor = (level) => {
    const colorMap = {
      'primary': 'bg-green-100 text-green-800',
      'lower-secondary': 'bg-blue-100 text-blue-800',
      'upper-secondary': 'bg-purple-100 text-purple-800'
    }
    return colorMap[level] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading classes...</p>
        </div>
      </div>
    )
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600">Get started by creating your first class.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Education Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {getClassInitials(cls.name || 'Unknown Class')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {cls.name || 'Unknown Class'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cls.year || 'No Year'} • ID: {cls._id?.slice(-6) || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(cls.level)}`}>
                      {getEducationLevelDisplay(cls.level)}
                    </span>
                    {cls.year && (
                      <span className="text-xs text-gray-500">
                        {cls.year}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {cls.schoolId?.name || 'No School'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cls.schoolId?._id?.slice(-6) || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {cls.maxStudents || 30} students
                  </div>
                  <div className="text-sm text-gray-500">
                    Max capacity
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(cls)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      title="Edit class"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(cls)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClassesTable
