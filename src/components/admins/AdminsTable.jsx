import React from 'react'
import { Edit, Trash2, Shield } from 'lucide-react'

const AdminsTable = ({ admins, onEdit, onDelete, loading }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAdminInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'AD'
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
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
              <div className="flex space-x-2">
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
          <div className="col-span-3">Admin Info</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">School</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {admins.map((admin, index) => (
          <div key={admin._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Admin Info */}
              <div className="col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getAdminInitials(admin.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{admin.name || 'Unknown Admin'}</p>
                  <p className="text-sm text-gray-500">ID: {admin._id?.slice(-6) || 'N/A'}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-span-3">
                <p className="text-sm font-medium text-gray-900">{admin.email || 'No email'}</p>
                <p className="text-sm text-gray-500">
                  Created: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {admin.role || 'Unknown'}
                </span>
              </div>

              {/* School */}
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-900">
                  {admin.schoolId?.name || 'No School'}
                </p>
                {admin.schoolId?.name && (
                  <p className="text-xs text-gray-500">
                    {admin.schoolId._id?.slice(-6) || 'N/A'}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center space-x-2">
                <button
                  onClick={() => onEdit(admin)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Admin"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(admin)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Admin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {admins.length === 0 && !loading && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No admins found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or add a new admin</p>
        </div>
      )}
    </div>
  )
}

export default AdminsTable
