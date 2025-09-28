import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  fetchRoles,
  setFilters,
  clearError
} from '../../store/adminsSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import AdminsTable from '../../components/admins/AdminsTable'
import AdminModal from '../../components/admins/AdminModal'
import Pagination from '../../components/students/Pagination'

const AdminsPage = () => {
  const dispatch = useDispatch()
  const { 
    admins, 
    roles = [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'SUPER_ADMIN', label: 'Super Admin' }
    ],
    pagination, 
    loading, 
    error,
    filters 
  } = useSelector((state) => state.admins)
  
  const { schools } = useSelector((state) => state.schools)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load initial data
  useEffect(() => {
    dispatch(fetchAdmins(filters))
    dispatch(fetchRoles()) // This now returns static roles without API call
    dispatch(fetchSchools())
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

  // Fetch admins when filters change
  useEffect(() => {
    dispatch(fetchAdmins(filters))
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
      search: ''
    }
    dispatch(setFilters(defaultFilters))
    setSearchTerm('')
  }

  const handleAddAdmin = () => {
    setEditingAdmin(null)
    setIsModalOpen(true)
  }

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin)
    setIsModalOpen(true)
  }

  const handleSaveAdmin = async (adminData) => {
    try {
      if (editingAdmin) {
        await dispatch(updateAdmin({ 
          adminId: editingAdmin._id, 
          adminData 
        })).unwrap()
        toast.success('Admin updated successfully!')
        setIsModalOpen(false)
        setEditingAdmin(null)
        
        // Reload the admins list to show updated data
        const updatedFilters = { ...filters, page: 1 }
        await dispatch(fetchAdmins(updatedFilters))
        dispatch(setFilters(updatedFilters))
      } else {
        await dispatch(createAdmin(adminData)).unwrap()
        toast.success('Admin created successfully!')
        setIsModalOpen(false)
        setEditingAdmin(null)
        
        // Reload the admins list to show the new admin
        // Reset to page 1 to show the newly added admin
        const updatedFilters = { ...filters, page: 1 }
        await dispatch(fetchAdmins(updatedFilters))
        dispatch(setFilters(updatedFilters))
        
        console.log('✅ Admin added and list refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Error saving admin:', error)
      toast.error(error || 'Failed to save admin')
    }
  }

  const handleDeleteAdmin = async (admin) => {
    if (window.confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteAdmin(admin._id)).unwrap()
        toast.success(`${admin.name} deleted successfully`)
        
        // Reload the admins list to reflect the deletion
        await dispatch(fetchAdmins(filters))
        
        console.log('✅ Admin deleted and list refreshed successfully')
      } catch (error) {
        console.error('❌ Error deleting admin:', error)
        toast.error(error || 'Failed to delete admin')
      }
    }
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admins Management</h1>
          <p className="text-gray-600 mt-1">Manage system administrators and their permissions</p>
        </div>
        <button
          onClick={handleAddAdmin}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Search admins..."
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <AdminsTable
        admins={admins}
        onEdit={handleEditAdmin}
        onDelete={handleDeleteAdmin}
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

      {/* Admin Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAdmin(null)
        }}
        onSave={handleSaveAdmin}
        admin={editingAdmin}
        schools={schools}
        roles={roles}
        loading={loading}
      />

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-500">Total Admins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {admins.filter(admin => admin.role === 'SUPER_ADMIN').length}
            </div>
            <div className="text-sm text-gray-500">Super Admins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {admins.filter(admin => admin.role === 'ADMIN').length}
            </div>
            <div className="text-sm text-gray-500">School Admins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{schools.length}</div>
            <div className="text-sm text-gray-500">Available Schools</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminsPage
