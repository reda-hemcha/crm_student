import React from 'react'

const HelpPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Help & Documentation</h1>
        <p className="text-gray-600">Find answers to common questions and learn how to use the system.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• How to add students</li>
            <li>• Creating message groups</li>
            <li>• Sending your first message</li>
            <li>• Managing notifications</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Bulk messaging</li>
            <li>• Message templates</li>
            <li>• Attendance tracking</li>
            <li>• Parent communication</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
        <p className="text-gray-600 mb-4">Contact our support team for additional assistance.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Contact Support
        </button>
      </div>
    </div>
  )
}

export default HelpPage
