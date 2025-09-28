import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { fetchClassesBySchool } from '../../store/classesSlice'


const AddStudentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  classes = [], 
  schools = [], 
  userRole = null, 
  userSchoolName = null, 
  loading = false
}) => {
  const dispatch = useDispatch()
  const [schoolSpecificClasses, setSchoolSpecificClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  
  const { register, handleSubmit: hookFormSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      gender: '',
      academicYear: '',
      classId: '',
      schoolId: '',
      parents: [{ name: '', phoneNumber: '', responsible_parent: 'Mother' }]
    }
  })

  const watchedParents = watch('parents')
  const watchedSchoolId = watch('schoolId')

  // Debug logging for schools data
  useEffect(() => {
    if (isOpen && userRole === 'SUPER_ADMIN') {
      console.log('AddStudentModal - Schools data:', schools)
      console.log('AddStudentModal - Schools length:', schools?.length)
    }
  }, [isOpen, userRole, schools])

  // Initialize classes for ADMIN users (use their school)
  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      // For ADMIN users, use all classes since they're already filtered by their school
      setSchoolSpecificClasses(classes)
    }
  }, [isOpen, userRole, classes])

  // Fetch classes when school is selected (for SUPER_ADMIN)
  useEffect(() => {
    const fetchClassesForSchool = async () => {
      if (watchedSchoolId && userRole === 'SUPER_ADMIN') {
        try {
          setLoadingClasses(true)
          console.log('🔍 Fetching classes for selected school:', watchedSchoolId)
          
          const result = await dispatch(fetchClassesBySchool({ 
            schoolId: watchedSchoolId 
          })).unwrap()
          
          console.log('✅ School-specific classes fetched:', result.classes?.length || 0, 'classes')
          setSchoolSpecificClasses(result.classes || [])
          
          // Reset class selection when school changes
          setValue('classId', '')
        } catch (error) {
          console.error('❌ Error fetching classes for school:', error)
          setSchoolSpecificClasses([])
          setValue('classId', '')
        } finally {
          setLoadingClasses(false)
        }
      }
    }

    if (isOpen) {
      fetchClassesForSchool()
    }
  }, [watchedSchoolId, userRole, dispatch, setValue, isOpen])

  // Reset classes when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSchoolSpecificClasses([])
      setLoadingClasses(false)
    }
  }, [isOpen])

  const onSubmit = (data) => {
    console.log('📝 Submitting student data:', data)
    const studentData = {
      name: data.name,
      gender: data.gender,
      academicYear: data.academicYear,
      classId: data.classId,
      ...(userRole === 'SUPER_ADMIN' && data.schoolId && { schoolId: data.schoolId }),
      parentIds: data.parents.filter(parent => parent.name && parent.phoneNumber)
    }
    console.log('✅ Final student data:', studentData)
    onSave(studentData)
  }

  const handleParentChange = (index, field, value) => {
    const currentParents = [...(watchedParents || [])]
    if (!currentParents[index]) {
      currentParents[index] = { name: '', phoneNumber: '', responsible_parent: 'Mother' }
    }
    currentParents[index] = { ...currentParents[index], [field]: value }
    setValue('parents', currentParents, { shouldValidate: true })
    console.log('📝 Parent updated:', { index, field, value, currentParents })
  }

  const addParent = () => {
    const currentParents = [...(watchedParents || [])]
    const newParents = [...currentParents, { name: '', phoneNumber: '', responsible_parent: 'Mother' }]
    setValue('parents', newParents, { shouldValidate: true })
    console.log('➕ Parent added. Total parents:', newParents.length)
  }

  const removeParent = (index) => {
    const currentParents = [...(watchedParents || [])]
    if (currentParents.length > 1) {
      const newParents = currentParents.filter((_, i) => i !== index)
      setValue('parents', newParents, { shouldValidate: true })
      console.log('➖ Parent removed. Remaining parents:', newParents.length)
    } else {
      console.log('⚠️ Cannot remove last parent')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Save className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
              <p className="text-sm text-gray-600">Add a new student to the system</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={hookFormSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
            
            {/* Student Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Student name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student name"
                disabled={loading}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                {...register('gender', { required: 'Gender is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <select
                id="academicYear"
                {...register('academicYear', { required: 'Academic Year is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                required
              >
                <option value="">Select Academic Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
                <option value="6th Year">6th Year</option>
                <option value="7th Year">7th Year</option>
                <option value="8th Year">8th Year</option>
                <option value="9th Year">9th Year</option>
                <option value="10th Year">10th Year</option>
                <option value="11th Year">11th Year</option>
                <option value="12th Year">12th Year</option>
              </select>
              {errors.academicYear && (
                <p className="mt-1 text-sm text-red-600">{errors.academicYear.message}</p>
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
                  {...register('schoolId', { required: userRole === 'SUPER_ADMIN' ? 'School is required' : false })}
                  disabled={loading || !schools || schools.length === 0}
                  required={userRole === 'SUPER_ADMIN'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loading ? 'Loading schools...' : !schools || schools.length === 0 ? 'No schools available' : 'Select School'}
                  </option>
                  {schools && Array.isArray(schools) && schools.map(school => (
                    <option key={school._id} value={school._id}>
                      {school.name || 'Unnamed School'}
                    </option>
                  ))}
                </select>
                {errors.schoolId && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolId.message}</p>
                )}
                {schools && schools.length === 0 && !loading && (
                  <p className="mt-1 text-sm text-red-600">
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
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {userSchoolName}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Students will be automatically assigned to your school
                  </p>
                </div>
              )
            )}

            {/* Class */}
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <select
                id="classId"
                {...register('classId', { required: 'Class is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || loadingClasses || (userRole === 'SUPER_ADMIN' && !watchedSchoolId)}
                required
              >
                <option value="">
                  {loadingClasses 
                    ? 'Loading classes...' 
                    : userRole === 'SUPER_ADMIN' && !watchedSchoolId 
                      ? 'Select a school first' 
                      : 'Select Class'
                  }
                </option>
                {schoolSpecificClasses && Array.isArray(schoolSpecificClasses) && schoolSpecificClasses.map(classItem => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
              )}
              {userRole === 'SUPER_ADMIN' && watchedSchoolId && schoolSpecificClasses.length === 0 && !loadingClasses && (
                <p className="mt-1 text-sm text-amber-600">No classes found for this school</p>
              )}
            </div>
          </div>

          {/* Parents Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Parent(s) Information</h3>
              <button
                type="button"
                onClick={addParent}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                <span>Add Parent</span>
              </button>
            </div>

            {errors.parents && <p className="mt-1 text-sm text-red-600">{errors.parents.message}</p>}

            {Array.isArray(watchedParents) && watchedParents.map((parent, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Parent {index + 1}</h4>
                  {watchedParents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParent(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor={`parents.${index}.name`} className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Name *
                  </label>
                  <input
                    type="text"
                    id={`parents.${index}.name`}
                    {...register(`parents.${index}.name`, { required: 'Parent name is required' })}
                    onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter parent name"
                    disabled={loading}
                    required
                  />
                  {errors.parents?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.parents[index].name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor={`parents.${index}.phoneNumber`} className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    id={`parents.${index}.phoneNumber`}
                    {...register(`parents.${index}.phoneNumber`, { required: 'Phone number is required' })}
                    onChange={(e) => handleParentChange(index, 'phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                    disabled={loading}
                    required
                  />
                  {errors.parents?.[index]?.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.parents[index].phoneNumber.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor={`parents.${index}.responsible_parent`} className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    id={`parents.${index}.responsible_parent`}
                    {...register(`parents.${index}.responsible_parent`)}
                    onChange={(e) => handleParentChange(index, 'responsible_parent', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.parents?.[index]?.responsible_parent && (
                    <p className="mt-1 text-sm text-red-600">{errors.parents[index].responsible_parent.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStudentModal