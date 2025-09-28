import React from 'react'
import { 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  MessageSquare,
  AlertCircle,
  BarChart3
} from 'lucide-react'

const BroadcastStats = ({ stats = {}, loading = false }) => {
  const {
    totalBroadcasts = 0,
    statusBreakdown = [],
    recentBroadcasts = [],
    summary = {
      totalRecipients: 0,
      totalSuccessful: 0,
      totalFailed: 0
    }
  } = stats

  const getSuccessRate = () => {
    const total = summary.totalSuccessful + summary.totalFailed
    return total > 0 ? Math.round((summary.totalSuccessful / total) * 100) : 0
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'sending':
        return 'text-blue-600 bg-blue-100'
      case 'scheduled':
        return 'text-orange-600 bg-orange-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      case 'draft':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle
      case 'sending':
        return Send
      case 'scheduled':
        return Clock
      case 'failed':
        return XCircle
      case 'cancelled':
        return AlertCircle
      case 'draft':
        return MessageSquare
      default:
        return MessageSquare
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Broadcasts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Broadcasts</p>
              <p className="text-3xl font-bold text-gray-900">{totalBroadcasts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Recipients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Recipients</p>
              <p className="text-3xl font-bold text-gray-900">{summary.totalRecipients.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{getSuccessRate()}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Successful: {summary.totalSuccessful.toLocaleString()}</span>
              <span>Failed: {summary.totalFailed.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${getSuccessRate()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Active/Scheduled */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active & Scheduled</p>
              <p className="text-3xl font-bold text-gray-900">
                {statusBreakdown.filter(s => ['scheduled', 'sending'].includes(s._id))
                  .reduce((sum, s) => sum + s.count, 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {statusBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Broadcast Status Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusBreakdown.map((status) => {
              const Icon = getStatusIcon(status._id)
              const colorClass = getStatusColor(status._id)
              const successRate = status.totalRecipients > 0 
                ? Math.round((status.successfulSends / status.totalRecipients) * 100) 
                : 0

              return (
                <div key={status._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900 capitalize">
                        {status._id.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {status.count}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Recipients:</span>
                      <span>{status.totalRecipients?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful:</span>
                      <span>{status.successfulSends?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span>{status.failedSends?.toLocaleString() || 0}</span>
                    </div>
                    {status.totalRecipients > 0 && (
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span>Success Rate:</span>
                        <span className="font-medium">{successRate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Broadcasts */}
      {recentBroadcasts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Broadcasts</h3>
          
          <div className="space-y-3">
            {recentBroadcasts.map((broadcast) => (
              <div key={broadcast._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{broadcast.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                      {broadcast.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {broadcast.totalRecipients} recipients • Created {new Date(broadcast.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {broadcast.successfulSends || 0} sent
                  </div>
                  {broadcast.totalRecipients > 0 && (
                    <div className="text-xs text-gray-500">
                      {Math.round((broadcast.successfulSends / broadcast.totalRecipients) * 100)}% success
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {totalBroadcasts === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcast data yet</h3>
          <p className="text-gray-500">Create your first broadcast to see statistics here</p>
        </div>
      )}
    </div>
  )
}

export default BroadcastStats
