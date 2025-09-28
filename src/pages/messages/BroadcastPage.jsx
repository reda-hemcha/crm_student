import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, BarChart3, Send, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchBroadcasts,
  fetchBroadcastStats,
  fetchBroadcastOptions,
  fetchBroadcastDetails,
  setModalOpen,
  setModalMode,
  setEditingBroadcast,
  setFilters,
  clearError
} from '../../store/broadcastSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import { fetchClasses } from '../../store/classesSlice'
import BroadcastModal from '../../components/broadcasts/BroadcastModal'
import BroadcastTable from '../../components/broadcasts/BroadcastTable'
import BroadcastFilters from '../../components/broadcasts/BroadcastFilters'
import BroadcastStats from '../../components/broadcasts/BroadcastStats'
import Pagination from '../../components/students/Pagination'

const BroadcastPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const {
    broadcasts,
    pagination,
    loading,
    error,
    filters,
    stats,
    statsLoading,
    isModalOpen,
    modalMode,
    editingBroadcast,
    selectedBroadcast,
    selectedBroadcastLoading
  } = useSelector((state) => state.broadcasts)

  const [activeTab, setActiveTab] = useState('broadcasts') // 'broadcasts' or 'stats'
  const [viewDetailsModal, setViewDetailsModal] = useState(false)

  // Load initial data
  useEffect(() => {
    loadBroadcastData()
    loadOptionsData()
  }, [dispatch, user?.role])

  // Load broadcasts when filters change
  useEffect(() => {
    dispatch(fetchBroadcasts(filters))
  }, [dispatch, filters])

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const loadBroadcastData = () => {
    // Set school filter for ADMIN users
    if (user?.role === 'ADMIN' && user?.schoolId) {
      const adminFilters = { ...filters, schoolId: user.schoolId }
      dispatch(setFilters(adminFilters))
    }

    // Load broadcasts
    dispatch(fetchBroadcasts(filters))
    
    // Load statistics
    if (user?.role === 'SUPER_ADMIN') {
      dispatch(fetchBroadcastStats())
    } else if (user?.role === 'ADMIN' && user?.schoolId) {
      dispatch(fetchBroadcastStats(user.schoolId))
    }
  }

  const loadOptionsData = () => {
    // Load broadcast options (group types, statuses, etc.)
    dispatch(fetchBroadcastOptions())
    
    // Load schools for SUPER_ADMIN
    if (user?.role === 'SUPER_ADMIN') {
      dispatch(fetchSchools())
    }
    
    // Load classes
    dispatch(fetchClasses())
  }

  const handleCreateBroadcast = () => {
    dispatch(setEditingBroadcast(null))
    dispatch(setModalMode('create'))
    dispatch(setModalOpen(true))
  }

  const handleViewBroadcast = async (broadcast) => {
    try {
      await dispatch(fetchBroadcastDetails(broadcast._id)).unwrap()
      setViewDetailsModal(true)
    } catch (error) {
      console.error('❌ Error loading broadcast details:', error)
      toast.error(error || 'Failed to load broadcast details')
    }
  }

  const handleRefresh = () => {
    loadBroadcastData()
    toast.success('Data refreshed!')
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
  }

  const handleSearch = (searchFilters) => {
    dispatch(fetchBroadcasts(searchFilters))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast Messages</h1>
          <p className="text-gray-600 mt-1">Send WhatsApp messages to parents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateBroadcast}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'broadcasts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>All Broadcasts</span>
              {pagination.total > 0 && (
                <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {pagination.total}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'broadcasts' ? (
        <div className="space-y-6">
          {/* Filters */}
          <BroadcastFilters onSearch={handleSearch} />

          {/* Broadcasts Table */}
          <BroadcastTable
            broadcasts={broadcasts}
            loading={loading}
            onView={handleViewBroadcast}
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics */}
          <BroadcastStats
            stats={stats}
            loading={statsLoading}
          />
        </div>
      )}

      {/* Create/Edit Broadcast Modal */}
      <BroadcastModal
        isOpen={isModalOpen}
        onClose={() => dispatch(setModalOpen(false))}
        mode={modalMode}
        broadcast={editingBroadcast}
      />

      {/* View Broadcast Details Modal */}
      {viewDetailsModal && selectedBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedBroadcast.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Broadcast Details & Message Results
                </p>
              </div>
              <button
                onClick={() => setViewDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {selectedBroadcastLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Broadcast Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Message Content</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800">{selectedBroadcast.message}</p>
                      {selectedBroadcast.mediaUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">Attachment:</p>
                          <a 
                            href={selectedBroadcast.mediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Broadcast Summary</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium capitalize">{selectedBroadcast.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Type:</span>
                          <span className="font-medium">{selectedBroadcast.groupType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Recipients:</span>
                          <span className="font-medium">{selectedBroadcast.totalRecipients || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Successful:</span>
                          <span className="font-medium text-green-600">{selectedBroadcast.successfulSends || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Failed:</span>
                          <span className="font-medium text-red-600">{selectedBroadcast.failedSends || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium">{selectedBroadcast.successRate || 0}%</span>
                        </div>
                        {selectedBroadcast.sentAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sent At:</span>
                            <span className="font-medium">{formatDate(selectedBroadcast.sentAt)}</span>
                          </div>
                        )}
                        {selectedBroadcast.scheduledDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Scheduled For:</span>
                            <span className="font-medium">{formatDate(selectedBroadcast.scheduledDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Results */}
                {selectedBroadcast.messageResults && selectedBroadcast.messageResults.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Message Delivery Results ({selectedBroadcast.messageResults.length})
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Parent
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sent At
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Error
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedBroadcast.messageResults.map((result, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {result.parentId?.name || 'Unknown Parent'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {result.phoneNumber}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeliveryStatusColor(result.status)}`}>
                                    {result.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {result.sentAt ? formatDate(result.sentAt) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                  {result.error || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setViewDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BroadcastPage
