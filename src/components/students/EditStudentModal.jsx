import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { fetchClassesBySchool } from '../../store/classesSlice'

const EditStudentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  student, 
  classes = [], 
  schools = [], 
  userRole = null, 
  userSchoolName = null,
  loading = false 
}) => {
  const dispatch = useDispatch()
  const [schoolSpecificClasses, setSchoolSpecificClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    academicYear: '',
    classId: '',
    schoolId: '',
    parents: [{ name: '', phoneNumber: '', responsible_parent: 'Mother', email: '' }]
  })

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        name: student.name || '',
        gender: student.gender || '',
        academicYear: student.academicYear || '',
        classId: student.classId?._id || '',
        schoolId: student.schoolId?._id || '',
        parents: student.parentIds && student.parentIds.length > 0 
          ? student.parentIds.map(parent => ({
              name: parent.name || '',
              phoneNumber: parent.phoneNumber || '',
              responsible_parent: parent.responsible_parent || 'Mother',
              email: parent.email || ''
            }))
          : [{ name: '', phoneNumber: '', responsible_parent: 'Mother', email: '' }]
      })
    } else if (isOpen && !student) {
      setFormData({
        name: '',
        gender: '',
        academicYear: '',
        classId: '',
        schoolId: '',
        parents: [{ name: '', phoneNumber: '', responsible_parent: 'Mother', email: '' }]
      })
    }
  }, [isOpen, student])

  // Initialize classes for ADMIN users (use their school)
  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      // For ADMIN users, use all classes since they're already filtered by their school
      setSchoolSpecificClasses(classes)
    }
  }, [isOpen, userRole, classes])

  // Fetch classes when school is selected (for SUPER_ADMIN) or when modal opens with student data
  useEffect(() => {
    const fetchClassesForSchool = async () => {
      const schoolId = formData.schoolId
      if (schoolId && userRole === 'SUPER_ADMIN') {
        try {
          setLoadingClasses(true)
          console.log('🔍 Fetching classes for selected school:', schoolId)
          
          const result = await dispatch(fetchClassesBySchool({ 
            schoolId: schoolId 
          })).unwrap()
          
          console.log('✅ School-specific classes fetched:', result.classes?.length || 0, 'classes')
          setSchoolSpecificClasses(result.classes || [])
        } catch (error) {
          console.error('❌ Error fetching classes for school:', error)
          setSchoolSpecificClasses([])
        } finally {
          setLoadingClasses(false)
        }
      }
    }

    if (isOpen) {
      fetchClassesForSchool()
    }
  }, [formData.schoolId, userRole, dispatch, isOpen])

  // Reset classes when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSchoolSpecificClasses([])
      setLoadingClasses(false)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.gender || !formData.classId || (userRole === 'SUPER_ADMIN' && !formData.schoolId)) {
      alert('Please fill in all required fields')
      return
    }

    const validParents = formData.parents.filter(parent => parent.name && parent.phoneNumber)
    if (validParents.length === 0) {
      alert('Please add at least one parent with name and phone number')
      return
    }

    const studentData = {
      name: formData.name,
      gender: formData.gender,
      classId: formData.classId,
      ...(userRole === 'SUPER_ADMIN' && formData.schoolId && { schoolId: formData.schoolId }),
      ...(userRole === 'ADMIN' && student?.schoolId && { schoolId: student.schoolId }),
      parentIds: validParents
    }

    onSave(studentData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset class selection when school changes (for SUPER_ADMIN)
      ...(name === 'schoolId' && userRole === 'SUPER_ADMIN' && { classId: '' })
    }))
  }

  const handleParentChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      parents: prev.parents.map((parent, i) => 
        i === index ? { ...parent, [field]: value } : parent
      )
    }))
  }

  const addParent = () => {
    setFormData(prev => ({
      ...prev,
      parents: [...prev.parents, { name: '', phoneNumber: '', responsible_parent: 'Mother', email: '' }]
    }))
  }

  const removeParent = (index) => {
    if (formData.parents.length > 1) {
      setFormData(prev => ({
        ...prev,
        parents: prev.parents.filter((_, i) => i !== index)
      }))
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      gender: '',
      classId: '',
      schoolId: '',
      parents: [{ name: '', phoneNumber: '', responsible_parent: 'Mother', email: '' }]
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Save className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {student ? 'Edit Student' : 'Add New Student'}
              </h2>
              <p className="text-sm text-gray-600">
                {student ? 'Update student information' : 'Add a new student to the system'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
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
            </div>

            {userRole === 'SUPER_ADMIN' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School *
                </label>
                <select
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleChange}
                  required
                  disabled={loading || !schools || schools.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loading ? 'Loading schools...' : schools && schools.length === 0 ? 'No schools available' : 'Select School'}
                  </option>
                  {schools && schools.map(school => (
                    <option key={school._id} value={school._id}>
                      {school.name || 'Unnamed School'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              userRole === 'ADMIN' && userSchoolName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {userSchoolName}
                  </div>
                </div>
              )
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || loadingClasses || (userRole === 'SUPER_ADMIN' && !formData.schoolId)}
              >
                <option value="">
                  {loadingClasses 
                    ? 'Loading classes...' 
                    : userRole === 'SUPER_ADMIN' && !formData.schoolId 
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
              {userRole === 'SUPER_ADMIN' && formData.schoolId && schoolSpecificClasses.length === 0 && !loadingClasses && (
                <p className="mt-1 text-sm text-amber-600">No classes found for this school</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Parent(s) Information</h3>
              <button
                type="button"
                onClick={addParent}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Parent</span>
              </button>
            </div>

            {formData.parents.map((parent, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Parent {index + 1}</h4>
                  {formData.parents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParent(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      value={parent.name}
                      onChange={(e) => handleParentChange(index, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter parent name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={parent.phoneNumber}
                      onChange={(e) => handleParentChange(index, 'phoneNumber', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship
                    </label>
                    <select
                      value={parent.responsible_parent}
                      onChange={(e) => handleParentChange(index, 'responsible_parent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={parent.email}
                      onChange={(e) => handleParentChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStudentModal
