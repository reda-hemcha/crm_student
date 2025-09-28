import React from 'react'

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600">Configure your school's settings and preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter school name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Address</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Enter school address"></textarea>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">SMS Notifications</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">WhatsApp Notifications</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
