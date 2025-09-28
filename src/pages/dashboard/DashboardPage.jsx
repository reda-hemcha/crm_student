import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MessageSquare, TrendingUp, Radio, Mail, Users, GraduationCap, Building2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchDashboardStats,
  fetchKPIData,
  fetchMessageChartData,
  fetchDeliveryStats,
  fetchRecentActivities,
  fetchSchoolStats,
  fetchStudentStats,
  fetchClassStats,
  fetchWhatsAppStats,
  clearError,
  updateLastRefresh
} from '../../store/dashboardSlice'
import { fetchStudents } from '../../store/studentsSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import { fetchClasses } from '../../store/classesSlice'
import KPICard from '../../components/dashboard/KPICard'
import LineChart from '../../components/charts/LineChart'
import DonutChart from '../../components/charts/DonutChart'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import QuickActions from '../../components/dashboard/QuickActions'
import DashboardDebug from '../../components/dashboard/DashboardDebug'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  // Dashboard state
  const {
    loading,
    error,
    lastUpdated,
    kpiData,
    kpiLoading,
    messageChartData,
    messageChartLoading,
    deliveryStats,
    deliveryLoading,
    recentActivities,
    activitiesLoading,
    schoolStats,
    schoolStatsLoading,
    studentStats,
    studentStatsLoading,
    classStats,
    classStatsLoading,
    whatsappStats,
    whatsappStatsLoading
  } = useSelector((state) => state.dashboard)

  // Existing data from other slices (as fallback)
  const { schools } = useSelector((state) => state.schools)
  const { students, pagination: studentPagination } = useSelector((state) => state.students)
  const { classes } = useSelector((state) => state.classes)

  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  // Load initial dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [dispatch, user?.role])

  // Also fetch existing data from current APIs as fallback
  useEffect(() => {
    console.log('🔍 Loading existing data as fallback...')
    // Load existing data that we know works
    dispatch(fetchSchools())
    dispatch(fetchStudents({ page: 1, limit: 1000 })) // Get all students for counting
    dispatch(fetchClasses({ page: 1, limit: 1000 })) // Get all classes for counting
  }, [dispatch])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...')
      loadDashboardData(true)
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [dispatch])

  const loadDashboardData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setRefreshing(true)
      }

      console.log('📊 Loading dashboard data for role:', user?.role)

      // Clear any previous errors
      dispatch(clearError())

      // Fetch core data for all users (these are optional, fallback to existing data)
      const promises = [
        dispatch(fetchKPIData(timeRange)).catch(err => {
          console.warn('⚠️ KPI data failed, using fallback:', err)
          return null
        }),
        dispatch(fetchRecentActivities(10)).catch(err => {
          console.warn('⚠️ Recent activities failed, using fallback:', err)
          return null
        }),
        dispatch(fetchStudentStats()).catch(err => {
          console.warn('⚠️ Student stats failed, using fallback:', err)
          return null
        }),
        dispatch(fetchClassStats()).catch(err => {
          console.warn('⚠️ Class stats failed, using fallback:', err)
          return null
        }),
        dispatch(fetchWhatsAppStats()).catch(err => {
          console.warn('⚠️ WhatsApp stats failed, using fallback:', err)
          return null
        })
      ]

      // Add role-specific data
      if (user?.role === 'SUPER_ADMIN') {
        promises.push(dispatch(fetchSchoolStats()).catch(err => {
          console.warn('⚠️ School stats failed, using fallback:', err)
          return null
        }))
      }

      // Fetch chart data
      promises.push(
        dispatch(fetchMessageChartData(timeRange)).catch(err => {
          console.warn('⚠️ Message chart data failed, using fallback:', err)
          return null
        }),
        dispatch(fetchDeliveryStats('30d')).catch(err => {
          console.warn('⚠️ Delivery stats failed, using fallback:', err)
          return null
        })
      )

      const results = await Promise.allSettled(promises)
      const successfulCalls = results.filter(result => result.status === 'fulfilled').length
      const totalCalls = results.length

      console.log(`📊 Dashboard API calls: ${successfulCalls}/${totalCalls} successful`)

      dispatch(updateLastRefresh())
      
      if (!isAutoRefresh) {
        if (successfulCalls === totalCalls) {
          toast.success('Dashboard data updated successfully!')
        } else if (successfulCalls > 0) {
          toast.success(`Dashboard partially updated (${successfulCalls}/${totalCalls} data sources)`)
        } else {
          toast.success('Dashboard showing cached data (APIs not available)')
        }
      }

      console.log('✅ Dashboard data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      if (!isAutoRefresh) {
        toast.error('Dashboard showing cached data. Some features may be limited.')
      }
    } finally {
      if (!isAutoRefresh) {
        setRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange)
    dispatch(fetchKPIData(newTimeRange))
    dispatch(fetchMessageChartData(newTimeRange))
  }

  // Get KPI cards based on user role
  const getKPICards = () => {
    const cards = []

    // Calculate fallback values from existing data
    const fallbackSchoolCount = schools?.length || 0
    const fallbackStudentCount = students?.length || studentPagination?.total || 0
    const fallbackClassCount = classes?.length || 0

    console.log('📊 Dashboard data:', {
      schools: fallbackSchoolCount,
      students: fallbackStudentCount,
      classes: fallbackClassCount,
      apiSchoolStats: schoolStats,
      apiStudentStats: studentStats,
      apiClassStats: classStats
    })

    if (user?.role === 'SUPER_ADMIN') {
      cards.push(
        <KPICard
          key="schools"
          title="Total Schools"
          value={schoolStatsLoading ? '...' : (schoolStats.totalSchools || fallbackSchoolCount)?.toLocaleString()}
          icon={Building2}
          color="blue"
          loading={schoolStatsLoading}
        />,
        <KPICard
          key="students"
          title="Total Students"
          value={studentStatsLoading ? '...' : (studentStats.totalStudents || fallbackStudentCount)?.toLocaleString()}
          icon={Users}
          color="green"
          loading={studentStatsLoading}
        />,
        <KPICard
          key="classes"
          title="Total Classes"
          value={classStatsLoading ? '...' : (classStats.totalClasses || fallbackClassCount)?.toLocaleString()}
          icon={GraduationCap}
          color="purple"
          loading={classStatsLoading}
        />,
        <KPICard
          key="whatsapp"
          title="WhatsApp Messages Today"
          value={whatsappStatsLoading ? '...' : (whatsappStats.messagesThisWeek || 0)?.toLocaleString()}
          icon={MessageSquare}
          color="orange"
          loading={whatsappStatsLoading}
        />
      )
    } else {
      // ADMIN user cards - filter data by user's school
      const userSchoolStudents = user?.schoolId ? 
        students?.filter(student => student.schoolId === user.schoolId || student.schoolId?._id === user.schoolId)?.length || 0 :
        fallbackStudentCount
      
      const userSchoolClasses = user?.schoolId ?
        classes?.filter(cls => cls.schoolId === user.schoolId || cls.schoolId?._id === user.schoolId)?.length || 0 :
        fallbackClassCount

      cards.push(
        <KPICard
          key="students"
          title="My Students"
          value={studentStatsLoading ? '...' : (studentStats.totalStudents || userSchoolStudents)?.toLocaleString()}
          icon={Users}
          color="blue"
          loading={studentStatsLoading}
        />,
        <KPICard
          key="classes"
          title="My Classes"
          value={classStatsLoading ? '...' : (classStats.totalClasses || userSchoolClasses)?.toLocaleString()}
          icon={GraduationCap}
          color="green"
          loading={classStatsLoading}
        />,
        <KPICard
          key="messages"
          title="Messages Sent"
          value={whatsappStatsLoading ? '...' : (whatsappStats.messagesThisWeek || 0)?.toLocaleString()}
          icon={MessageSquare}
          color="purple"
          loading={whatsappStatsLoading}
        />,
        <KPICard
          key="delivery"
          title="Delivery Rate"
          value={whatsappStatsLoading ? '...' : `${whatsappStats.deliveryRate || 0}%`}
          icon={TrendingUp}
          color="orange"
          loading={whatsappStatsLoading}
        />
      )
    }

    return cards
  }

  return (
    <div className="space-y-6">
      {/* Debug Info (Development Only) */}
      <DashboardDebug />

      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || refreshing}
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-700">
              <p className="font-medium">Error loading dashboard data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getKPICards()}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Daily Messages Sent"
          subtitle={`Last ${timeRange === '1d' ? '24 Hours' : timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}`}
          trend="+12%"
          data={messageChartData}
          loading={messageChartLoading}
        />
        <DonutChart
          title="Message Delivery Status"
          subtitle="This Month"
          trend="+2%"
          data={{
            delivered: deliveryStats.delivered || 0,
            pending: deliveryStats.pending || 0,
            failed: deliveryStats.failed || 0
          }}
          loading={deliveryLoading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed 
          activities={recentActivities}
          loading={activitiesLoading}
        />
        <QuickActions />
      </div>
    </div>
  )
}

export default DashboardPage