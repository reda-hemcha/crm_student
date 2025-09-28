import React from 'react'
import { Loader2 } from 'lucide-react'

const DonutChart = ({ data, title, subtitle, trend, loading = false }) => {
  const { delivered, pending, failed } = data || { delivered: 98, pending: 1, failed: 1 }
  const total = delivered + pending + failed
  const deliveredPercentage = total > 0 ? (delivered / total) * 100 : 0
  const pendingPercentage = total > 0 ? (pending / total) * 100 : 0
  const failedPercentage = total > 0 ? (failed / total) * 100 : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          {trend && !loading && (
            <div className="flex items-center space-x-1 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        {loading ? (
          <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-gray-100"></div>
            
            {/* Delivered segment */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, #3b82f6 0deg, #3b82f6 ${deliveredPercentage * 3.6}deg, transparent ${deliveredPercentage * 3.6}deg)`
              }}
            ></div>
            
            {/* Pending segment */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from ${deliveredPercentage * 3.6}deg, #f59e0b ${deliveredPercentage * 3.6}deg, #f59e0b ${(deliveredPercentage + pendingPercentage) * 3.6}deg, transparent ${(deliveredPercentage + pendingPercentage) * 3.6}deg)`
              }}
            ></div>
            
            {/* Failed segment */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from ${(deliveredPercentage + pendingPercentage) * 3.6}deg, #ef4444 ${(deliveredPercentage + pendingPercentage) * 3.6}deg, #ef4444 360deg, transparent 360deg)`
              }}
            ></div>
            
            {/* Center hole */}
            <div className="absolute inset-8 bg-white rounded-full"></div>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">{Math.round(deliveredPercentage)}%</div>
              <div className="text-sm text-gray-500">Delivered</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {!loading && (
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Delivered ({delivered})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Pending ({pending})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Failed ({failed})</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonutChart
