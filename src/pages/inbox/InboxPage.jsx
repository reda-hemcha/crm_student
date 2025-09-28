import React from 'react'

const InboxPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Inbox</h1>
        <p className="text-gray-600">View and manage incoming messages from students and parents.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Conversations will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InboxPage