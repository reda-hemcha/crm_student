import React from 'react'
import { useDispatch } from 'react-redux'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Pause,
  FileText,
  Building2,
  GraduationCap,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  deleteBroadcast, 
  cancelBroadcast, 
  sendBroadcastNow,
  setModalMode,
  setEditingBroadcast,
  setModalOpen
} from '../../store/broadcastSlice'

const BroadcastTable = ({ broadcasts = [], loading = false, onView }) => {
  const dispatch = useDispatch()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'sending':
        return <Send className="w-4 h-4 text-blue-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'cancelled':
        return <Pause className="w-4 h-4 text-gray-500" />
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-orange-100 text-orange-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGroupTypeIcon = (groupType) => {
    switch (groupType) {
      case 'school':
        return <Building2 className="w-4 h-4 text-blue-600" />
      case 'level':
        return <GraduationCap className="w-4 h-4 text-purple-600" />
      case 'class':
        return <Users className="w-4 h-4 text-green-600" />
      default:
        return <Building2 className="w-4 h-4 text-gray-600" />
    }
  }

  const getGroupTypeLabel = (groupType, broadcast) => {
    switch (groupType) {
      case 'school':
        return 'Entire School'
      case 'level':
        return `${broadcast.educationLevel?.replace('-', ' ') || 'Level'} Students`
      case 'class':
        return `${broadcast.classIds?.length || 0} Classes`
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSuccessRate = (broadcast) => {
    const total = broadcast.totalRecipients || 0
    const successful = broadcast.successfulSends || 0
    return total > 0 ? Math.round((successful / total) * 100) : 0
  }

  const handleEdit = (broadcast) => {
    if (broadcast.status !== 'draft') {
      toast.error('Only draft broadcasts can be edited')
      return
    }
    dispatch(setEditingBroadcast(broadcast))
    dispatch(setModalMode('edit'))
    dispatch(setModalOpen(true))
  }

  const handleDelete = async (broadcast) => {
    if (!window.confirm(`Are you sure you want to delete "${broadcast.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await dispatch(deleteBroadcast(broadcast._id)).unwrap()
      toast.success('Broadcast deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting broadcast:', error)
      toast.error(error || 'Failed to delete broadcast')
    }
  }

  const handleCancel = async (broadcast) => {
    const reason = prompt('Please provide a reason for cancelling this broadcast:')
    if (!reason) return

    try {
      await dispatch(cancelBroadcast({ broadcastId: broadcast._id, reason })).unwrap()
      toast.success('Broadcast cancelled successfully')
    } catch (error) {
      console.error('❌ Error cancelling broadcast:', error)
      toast.error(error || 'Failed to cancel broadcast')
    }
  }

  const handleSendNow = async (broadcast) => {
    if (!window.confirm(`Send "${broadcast.title}" immediately? This will cancel the scheduled time.`)) {
      return
    }

    try {
      await dispatch(sendBroadcastNow(broadcast._id)).unwrap()
      toast.success('Broadcast sending started')
    } catch (error) {
      console.error('❌ Error sending broadcast now:', error)
      toast.error(error || 'Failed to send broadcast now')
    }
  }

  const canEdit = (broadcast) => broadcast.status === 'draft'
  const canDelete = (broadcast) => ['draft', 'cancelled', 'failed'].includes(broadcast.status)
  const canCancel = (broadcast) => ['scheduled', 'sending'].includes(broadcast.status) && broadcast.canBeCancelled
  const canSendNow = (broadcast) => broadcast.status === 'scheduled'

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts yet</h3>
        <p className="text-gray-500">Create your first broadcast to start sending messages to parents</p>
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
                Broadcast
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {broadcasts.map((broadcast) => (
              <tr key={broadcast._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {broadcast.title}
                        </div>
                        {broadcast.mediaUrl && (
                          <FileText className="w-4 h-4 text-gray-400" title="Has attachment" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {broadcast.message}
                      </div>
                      {broadcast.scheduledDate && (
                        <div className="text-xs text-blue-600 mt-1">
                          Scheduled: {formatDate(broadcast.scheduledDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getGroupTypeIcon(broadcast.groupType)}
                    <div>
                      <div className="text-sm text-gray-900">
                        {getGroupTypeLabel(broadcast.groupType, broadcast)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {broadcast.schoolId?.name || 'School'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(broadcast.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                      {broadcast.status?.replace('-', ' ') || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {broadcast.totalRecipients || 0} parents
                  </div>
                  {broadcast.status === 'completed' && (
                    <div className="text-xs text-gray-500">
                      {broadcast.successfulSends || 0} sent, {broadcast.failedSends || 0} failed
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {broadcast.status === 'completed' ? (
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {getSuccessRate(broadcast)}%
                      </div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${getSuccessRate(broadcast)}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {broadcast.sentAt ? 'Sent: ' + formatDate(broadcast.sentAt) : 
                     broadcast.createdAt ? 'Created: ' + formatDate(broadcast.createdAt) : 'N/A'}
                  </div>
                  {broadcast.completedAt && (
                    <div className="text-xs text-green-600">
                      Completed: {formatDate(broadcast.completedAt)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* View Details */}
                    <button
                      onClick={() => onView(broadcast)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Send Now (for scheduled broadcasts) */}
                    {canSendNow(broadcast) && (
                      <button
                        onClick={() => handleSendNow(broadcast)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors"
                        title="Send Now"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit (only for drafts) */}
                    {canEdit(broadcast) && (
                      <button
                        onClick={() => handleEdit(broadcast)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Broadcast"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Cancel (for scheduled/sending broadcasts) */}
                    {canCancel(broadcast) && (
                      <button
                        onClick={() => handleCancel(broadcast)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded-lg hover:bg-orange-50 transition-colors"
                        title="Cancel Broadcast"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete (for drafts, cancelled, failed) */}
                    {canDelete(broadcast) && (
                      <button
                        onClick={() => handleDelete(broadcast)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

export default BroadcastTable
