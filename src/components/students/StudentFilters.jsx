import React from 'react'
import { Filter, X } from 'lucide-react'

const StudentFilters = ({ filters, onFilterChange, onClearFilters, classes = [] }) => {
  const classOptions = [
    { value: '', label: 'All Classes' },
    ...classes.map(cls => ({ value: cls._id, label: cls.name }))
  ]

  const relationOptions = [
    'All Relations',
    'Mother', 'Father', 'Guardian', 'Other'
  ]

  // Academic Year options based on French education system
  const academicYearOptions = [
    { value: '', label: 'All Academic Years' },
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: '5th Year', label: '5th Year' },
    { value: '6th Year', label: '6th Year' },
    { value: '7th Year', label: '7th Year' },
    { value: '8th Year', label: '8th Year' },
    { value: '9th Year', label: '9th Year' },
    { value: '10th Year', label: '10th Year' },
    { value: '11th Year', label: '11th Year' },
    { value: '12th Year', label: '12th Year' }
  ]

  const hasActiveFilters = filters.classId !== '' || filters.relation !== 'All Relations' || filters.academicYear !== ''

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
          <select
            value={filters.classId || ''}
            onChange={(e) => onFilterChange('classId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {classOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Academic Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year
          </label>
          <select
            value={filters.academicYear || ''}
            onChange={(e) => onFilterChange('academicYear', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {academicYearOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Parent Relation Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Relation
          </label>
          <select
            value={filters.relation}
            onChange={(e) => onFilterChange('relation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {relationOptions.map(relation => (
              <option key={relation} value={relation}>{relation}</option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="name">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="grade">Grade (Low to High)</option>
            <option value="grade-desc">Grade (High to Low)</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
           <div className="flex items-center space-x-2">
             <span className="text-sm text-gray-600">Active filters:</span>
             {filters.classId && (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                 Class: {classOptions.find(c => c.value === filters.classId)?.label}
                 <button
                   onClick={() => onFilterChange('classId', '')}
                   className="ml-1 hover:text-blue-600"
                 >
                   <X className="w-3 h-3" />
                 </button>
               </span>
             )}
             {filters.academicYear && (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                 Year: {academicYearOptions.find(y => y.value === filters.academicYear)?.label}
                 <button
                   onClick={() => onFilterChange('academicYear', '')}
                   className="ml-1 hover:text-purple-600"
                 >
                   <X className="w-3 h-3" />
                 </button>
               </span>
             )}
            {filters.relation !== 'All Relations' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Relation: {filters.relation}
                <button
                  onClick={() => onFilterChange('relation', 'All Relations')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentFilters
