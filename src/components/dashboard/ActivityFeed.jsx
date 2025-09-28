import React from 'react'
import { Megaphone, CheckCircle, Monitor, UserPlus, Loader2, MessageSquare, Users, GraduationCap, Building2 } from 'lucide-react'

const ActivityFeed = ({ activities = [], loading = false }) => {
  // Fallback activities if none provided
  const fallbackActivities = [
    {
      id: 1,
      icon: Megaphone,
      title: "Broadcast 'Back to School' sent",
      time: "2h ago",
      color: "text-blue-600"
    },
    {
      id: 2,
      icon: CheckCircle,
      title: "New template 'PTM Reminder' approved",
      time: "4h ago",
      color: "text-green-600"
    },
    {
      id: 3,
      icon: Monitor,
      title: "New message received from a parent",
      time: "6h ago",
      color: "text-purple-600"
    },
    {
      id: 4,
      icon: UserPlus,
      title: "New student 'John Doe' added to Grade 5",
      time: "1d ago",
      color: "text-orange-600"
    }
  ]

  // Icon mapping for different activity types
  const getActivityIcon = (type) => {
    switch (type) {
      case 'student_created':
        return Users
      case 'class_created':
        return GraduationCap
      case 'school_created':
        return Building2
      case 'message_sent':
        return MessageSquare
      case 'broadcast_sent':
        return Megaphone
      case 'template_approved':
        return CheckCircle
      case 'message_received':
        return Monitor
      default:
        return UserPlus
    }
  }

  // Color mapping for different activity types
  const getActivityColor = (type) => {
    switch (type) {
      case 'student_created':
        return 'text-blue-600'
      case 'class_created':
        return 'text-green-600'
      case 'school_created':
        return 'text-purple-600'
      case 'message_sent':
        return 'text-orange-600'
      case 'broadcast_sent':
        return 'text-indigo-600'
      case 'template_approved':
        return 'text-emerald-600'
      case 'message_received':
        return 'text-pink-600'
      default:
        return 'text-gray-600'
    }
  }

  // Format relative time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now - date
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const displayActivities = activities.length > 0 ? activities : fallbackActivities

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
      </div>
      
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [...Array(4)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : displayActivities.length > 0 ? (
          displayActivities.map((activity) => {
            const Icon = activity.icon || getActivityIcon(activity.type)
            const color = activity.color || getActivityColor(activity.type)
            const time = activity.time || formatTime(activity.timestamp || activity.createdAt)
            
            return (
              <div key={activity.id || activity._id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title || activity.description || 'Activity occurred'}
                  </p>
                  <p className="text-xs text-gray-500">{time}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No recent activities</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed
