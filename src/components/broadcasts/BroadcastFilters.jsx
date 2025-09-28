import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, X, Building2, Send, Clock, CheckCircle } from 'lucide-react'
import { setFilters, clearFilters } from '../../store/broadcastSlice'

const BroadcastFilters = ({ onSearch }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { schools } = useSelector((state) => state.schools)
  const { filters, options } = useSelector((state) => state.broadcasts)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    dispatch(setFilters(newFilters))
    if (onSearch) {
      onSearch(newFilters)
    }
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
    if (onSearch) {
      onSearch({
        page: 1,
        limit: 10,
        schoolId: '',
        groupType: '',
        status: '',
        search: ''
      })
    }
  }

  const hasActiveFilters = () => {
    return filters.schoolId || filters.groupType || filters.status || filters.search
  }

  const getFilterCount = () => {
    let count = 0
    if (filters.schoolId) count++
    if (filters.groupType) count++
    if (filters.status) count++
    if (filters.search) count++
    return count
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getFilterCount()} active
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search broadcasts..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* School Filter (SUPER_ADMIN only) */}
        {user?.role === 'SUPER_ADMIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.schoolId || ''}
                onChange={(e) => handleFilterChange('schoolId', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Schools</option>
                {schools && schools.map(school => (
                  <option key={school._id} value={school._id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Group Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Type
          </label>
          <select
            value={filters.groupType || ''}
            onChange={(e) => handleFilterChange('groupType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="school">Entire School</option>
            <option value="level">Education Level</option>
            <option value="class">Specific Classes</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.schoolId && user?.role === 'SUPER_ADMIN' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                School: {schools?.find(s => s._id === filters.schoolId)?.name || 'Selected School'}
                <button
                  onClick={() => handleFilterChange('schoolId', '')}
                  className="ml-2 text-blue-400 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.groupType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Type: {filters.groupType === 'school' ? 'Entire School' : 
                       filters.groupType === 'level' ? 'Education Level' : 
                       filters.groupType === 'class' ? 'Specific Classes' : filters.groupType}
                <button
                  onClick={() => handleFilterChange('groupType', '')}
                  className="ml-2 text-green-400 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-2 text-purple-400 hover:text-purple-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-gray-500 mr-2">Quick filters:</span>
          
          <button
            onClick={() => handleFilterChange('status', 'scheduled')}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.status === 'scheduled' 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </button>

          <button
            onClick={() => handleFilterChange('status', 'sending')}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.status === 'sending' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Send className="w-3 h-3 mr-1" />
            Sending
          </button>

          <button
            onClick={() => handleFilterChange('status', 'completed')}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </button>

          <button
            onClick={() => handleFilterChange('groupType', 'school')}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.groupType === 'school' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-3 h-3 mr-1" />
            School-wide
          </button>
        </div>
      </div>
    </div>
  )
}

export default BroadcastFilters
