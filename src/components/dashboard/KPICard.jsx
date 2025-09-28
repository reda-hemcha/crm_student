import React from 'react'
import { Loader2 } from 'lucide-react'

const KPICard = ({ title, value, icon: Icon, color = "blue", loading = false }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              <span className="text-lg text-gray-400">Loading...</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} ${loading ? 'opacity-50' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default KPICard
