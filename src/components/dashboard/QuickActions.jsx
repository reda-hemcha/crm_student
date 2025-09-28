import React from 'react'
import { Send, UserPlus, Inbox } from 'lucide-react'

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      icon: Send,
      title: "Send Broadcast",
      color: "bg-blue-600 hover:bg-blue-700",
      iconColor: "text-white"
    },
    {
      id: 2,
      icon: UserPlus,
      title: "Add Student",
      color: "bg-green-600 hover:bg-green-700",
      iconColor: "text-white"
    },
    {
      id: 3,
      icon: Inbox,
      title: "View Inbox",
      color: "bg-purple-600 hover:bg-purple-700",
      iconColor: "text-white"
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white font-medium transition-colors ${action.color}`}
            >
              <Icon className={`w-5 h-5 ${action.iconColor}`} />
              <span>{action.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActions
