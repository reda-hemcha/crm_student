import React from 'react'
import { useSelector } from 'react-redux'

const DashboardDebug = () => {
  const { user } = useSelector((state) => state.auth)
  const { schools } = useSelector((state) => state.schools)
  const { students, pagination: studentPagination } = useSelector((state) => state.students)
  const { classes } = useSelector((state) => state.classes)
  const dashboard = useSelector((state) => state.dashboard)

  const isDevelopment = import.meta.env.MODE === 'development'

  if (!isDevelopment) return null

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-gray-800 mb-2">🔍 Dashboard Debug Info (Development Only)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold text-gray-700">Current User:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto">
            {JSON.stringify({ 
              role: user?.role, 
              schoolId: user?.schoolId, 
              name: user?.name 
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700">Existing Data Counts:</h4>
          <div className="bg-white p-2 rounded">
            <div>🏫 Schools: {schools?.length || 0}</div>
            <div>👥 Students: {students?.length || 0} (Total: {studentPagination?.total || 0})</div>
            <div>📚 Classes: {classes?.length || 0}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700">Dashboard API States:</h4>
          <div className="bg-white p-2 rounded text-xs">
            <div>School Stats: {dashboard.schoolStatsLoading ? 'Loading...' : dashboard.schoolStatsError ? 'Error' : 'Loaded'}</div>
            <div>Student Stats: {dashboard.studentStatsLoading ? 'Loading...' : dashboard.studentStatsError ? 'Error' : 'Loaded'}</div>
            <div>Class Stats: {dashboard.classStatsLoading ? 'Loading...' : dashboard.classStatsError ? 'Error' : 'Loaded'}</div>
            <div>WhatsApp Stats: {dashboard.whatsappStatsLoading ? 'Loading...' : dashboard.whatsappStatsError ? 'Error' : 'Loaded'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700">Dashboard API Data:</h4>
          <div className="bg-white p-2 rounded text-xs">
            <div>Schools: {dashboard.schoolStats?.totalSchools || 'N/A'}</div>
            <div>Students: {dashboard.studentStats?.totalStudents || 'N/A'}</div>
            <div>Classes: {dashboard.classStats?.totalClasses || 'N/A'}</div>
            <div>Messages: {dashboard.whatsappStats?.messagesThisWeek || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <p>💡 If API data shows "N/A" but existing data shows numbers, the dashboard APIs are not available yet.</p>
        <p>✅ The dashboard will automatically use existing data as fallback.</p>
      </div>
    </div>
  )
}

export default DashboardDebug
