import React from 'react'
import { Loader2 } from 'lucide-react'

const LineChart = ({ data, title, subtitle, trend, loading = false }) => {
  // Sample data for the chart
  const defaultData = [
    { day: 'Mon', value: 120 },
    { day: 'Tue', value: 180 },
    { day: 'Wed', value: 150 },
    { day: 'Thu', value: 220 },
    { day: 'Fri', value: 190 },
    { day: 'Sat', value: 160 },
    { day: 'Sun', value: 140 }
  ]

  const chartData = data?.labels && data?.datasets ? 
    data.labels.map((label, index) => ({
      day: label,
      value: data.datasets[0]?.data[index] || 0
    })) : 
    (data || defaultData)

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value || 0)) : 100

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
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {loading ? (
          // Loading skeleton
          [...Array(7)].map((_, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 rounded-t-lg animate-pulse" style={{ height: '200px' }}>
                <div 
                  className="w-full bg-gray-300 rounded-t-lg"
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                ></div>
              </div>
              <div className="w-8 h-3 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
          ))
        ) : (
          chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 ease-out"
                  style={{ 
                    height: `${(item.value / maxValue) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{item.day}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LineChart
