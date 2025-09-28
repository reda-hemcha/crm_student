import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { X, GraduationCap } from 'lucide-react'
import { fetchEducationData, fetchAcademicYearsByLevel } from '../../store/classesSlice'

const ClassModal = ({ isOpen, onClose, onSave, classData, schools = [], userRole = null, userSchoolName = null, loading }) => {
  const dispatch = useDispatch()
  const { educationData, academicYearsByLevel } = useSelector((state) => state.classes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm()

  const watchedLevel = watch('level')

  // Load education data when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(educationData.educationLevels).length === 0) {
      dispatch(fetchEducationData())
    }
  }, [isOpen, dispatch, educationData.educationLevels])

  // Load academic years when level changes
  useEffect(() => {
    if (watchedLevel && !academicYearsByLevel[watchedLevel]) {
      dispatch(fetchAcademicYearsByLevel(watchedLevel))
    }
  }, [watchedLevel, dispatch, academicYearsByLevel])

  const getSelectedLevelYears = () => {
    if (!watchedLevel || !academicYearsByLevel[watchedLevel]) {
      return []
    }
    return academicYearsByLevel[watchedLevel]
  }

  const getLevelOptions = () => {
    return educationData.levelOptions || []
  }

  useEffect(() => {
    if (isOpen) {
      if (classData) {
        setValue('name', classData.name || '')
        setValue('level', classData.level || '')
        setValue('year', classData.year || '')
        setValue('schoolId', classData.schoolId?._id || classData.schoolId || '')
        setValue('maxStudents', classData.maxStudents || 30)
      } else {
        reset({
          name: '',
          level: '',
          year: '',
          schoolId: '',
          maxStudents: 30
        })
      }
    }
  }, [isOpen, classData, setValue, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error saving class:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {classData ? 'Edit Class' : 'Add New Class'}
              </h2>
              <p className="text-sm text-gray-600">
                {classData ? 'Update class information' : 'Create a new class with education level'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Education Level Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Education Level *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {getLevelOptions().map(level => (
                <label key={level.value} className="relative">
                  <input
                    type="radio"
                    value={level.value}
                    {...register('level', { required: 'Education level is required' })}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    watchedLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{level.label}</h3>
                        <p className="text-sm text-gray-600">
                          {educationData.academicYears[level.value]?.join(', ') || 'Loading...'}
                        </p>
                      </div>
                      {watchedLevel === level.value && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>

          {/* Academic Year Selection */}
          {watchedLevel && (
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <select
                id="year"
                {...register('year', { required: 'Academic year is required' })}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select Year</option>
                {getSelectedLevelYears().map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>
          )}

          {/* Class Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Class Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: 'Class name is required',
                minLength: {
                  value: 2,
                  message: 'Class name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Class name must be less than 50 characters'
                }
              })}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 1st Year Class A, 7th Year Advanced Math"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* School Selection - Only for SUPER_ADMIN */}
          {userRole === 'SUPER_ADMIN' ? (
            <div>
              <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 mb-2">
                School *
              </label>
              <select
                id="schoolId"
                {...register('schoolId', {
                  required: 'School selection is required'
                })}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.schoolId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name || 'Unknown School'}
                  </option>
                ))}
              </select>
              {errors.schoolId && (
                <p className="mt-1 text-sm text-red-600">{errors.schoolId.message}</p>
              )}
              {schools.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  No schools available. Please create a school first.
                </p>
              )}
            </div>
          ) : (
            /* Show assigned school for ADMIN users */
            userRole === 'ADMIN' && userSchoolName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School
                </label>
                <div className="block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {userSchoolName}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Classes will be automatically assigned to your school
                </p>
              </div>
            )
          )}

          {/* Maximum Students */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students
            </label>
            <input
              type="number"
              id="maxStudents"
              {...register('maxStudents', {
                min: { value: 1, message: 'Minimum 1 student' },
                max: { value: 50, message: 'Maximum 50 students' }
              })}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.maxStudents ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="30"
              disabled={isSubmitting}
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 20-30 students per class
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {classData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                classData ? 'Update Class' : 'Create Class'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassModal
