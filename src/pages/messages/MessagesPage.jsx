import React from 'react'

const MessagesPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
        <p className="text-gray-600">Send messages, broadcasts, and manage communication templates.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">One-to-One Messages</h3>
          <p className="text-gray-600 text-sm mb-4">Send individual messages to students or parents.</p>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Message
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Broadcast Messages</h3>
          <p className="text-gray-600 text-sm mb-4">Send messages to multiple recipients at once.</p>
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            New Broadcast
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Templates</h3>
          <p className="text-gray-600 text-sm mb-4">Create and manage reusable message templates.</p>
          <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Manage Templates
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage