import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Clock, Send, Upload, FileText, Calendar, Users, GraduationCap, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  createBroadcast,
  updateBroadcast,
  uploadBroadcastMedia,
  clearUploadedMedia,
  setModalOpen
} from '../../store/broadcastSlice'
import { fetchSchools } from '../../store/schoolsSlice'
import { fetchClasses } from '../../store/classesSlice'

const BroadcastModal = ({ isOpen, onClose, mode = 'create', broadcast = null }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { schools } = useSelector((state) => state.schools)
  const { classes } = useSelector((state) => state.classes)
  const { 
    loading, 
    options, 
    mediaUploading, 
    uploadedMediaUrl,
    mediaUploadError 
  } = useSelector((state) => state.broadcasts)

  const [selectedGroupType, setSelectedGroupType] = useState('school')
  const [selectedEducationLevel, setSelectedEducationLevel] = useState('')
  const [selectedClasses, setSelectedClasses] = useState([])
  const [scheduleMode, setScheduleMode] = useState(false) // false = send now, true = schedule
  const [uploadedFile, setUploadedFile] = useState(null)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      message: '',
      schoolId: user?.role === 'ADMIN' ? user?.schoolId : '',
      scheduledDate: '',
      scheduledTime: ''
    }
  })

  const watchedSchoolId = watch('schoolId')

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      if (user?.role === 'SUPER_ADMIN') {
        dispatch(fetchSchools())
      }
      dispatch(fetchClasses())
    }
  }, [isOpen, dispatch, user?.role])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && broadcast) {
        // Populate form for editing
        reset({
          title: broadcast.title || '',
          message: broadcast.message || '',
          schoolId: broadcast.schoolId?._id || broadcast.schoolId || '',
          scheduledDate: broadcast.scheduledDate ? new Date(broadcast.scheduledDate).toISOString().split('T')[0] : '',
          scheduledTime: broadcast.scheduledDate ? new Date(broadcast.scheduledDate).toTimeString().slice(0, 5) : ''
        })
        setSelectedGroupType(broadcast.groupType || 'school')
        setSelectedEducationLevel(broadcast.educationLevel || '')
        setSelectedClasses(broadcast.classIds || [])
        setScheduleMode(!broadcast.sendNow)
        if (broadcast.mediaUrl) {
          setUploadedFile({ url: broadcast.mediaUrl, name: 'Existing file' })
        }
      } else {
        // Reset for new broadcast
        reset({
          title: '',
          message: '',
          schoolId: user?.role === 'ADMIN' ? user?.schoolId : '',
          scheduledDate: '',
          scheduledTime: ''
        })
        setSelectedGroupType('school')
        setSelectedEducationLevel('')
        setSelectedClasses([])
        setScheduleMode(false)
        setUploadedFile(null)
        dispatch(clearUploadedMedia())
      }
    }
  }, [isOpen, mode, broadcast, reset, user?.schoolId, user?.role, dispatch])

  const onSubmit = async (data) => {
    try {
      // Validate group-specific requirements
      if (selectedGroupType === 'level' && !selectedEducationLevel) {
        toast.error('Please select an education level')
        return
      }
      if (selectedGroupType === 'class' && selectedClasses.length === 0) {
        toast.error('Please select at least one class')
        return
      }

      // Prepare broadcast data
      const broadcastData = {
        title: data.title,
        message: data.message,
        groupType: selectedGroupType,
        sendNow: !scheduleMode,
        ...(user?.role === 'SUPER_ADMIN' && data.schoolId && { schoolId: data.schoolId }),
        ...(selectedGroupType === 'level' && { educationLevel: selectedEducationLevel }),
        ...(selectedGroupType === 'class' && { classIds: selectedClasses }),
        ...(scheduleMode && data.scheduledDate && data.scheduledTime && {
          scheduledDate: new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString()
        }),
        ...(uploadedMediaUrl && { mediaUrl: uploadedMediaUrl }),
        ...(uploadedFile?.url && !uploadedMediaUrl && { mediaUrl: uploadedFile.url })
      }

      console.log('📤 Submitting broadcast:', broadcastData)

      if (mode === 'edit' && broadcast) {
        await dispatch(updateBroadcast({ 
          broadcastId: broadcast._id, 
          updateData: broadcastData 
        })).unwrap()
        toast.success('Broadcast updated successfully!')
      } else {
        const result = await dispatch(createBroadcast(broadcastData)).unwrap()
        if (scheduleMode) {
          toast.success('Broadcast scheduled successfully!')
        } else {
          toast.success('Broadcast created and sending started!')
        }
      }

      onClose()
    } catch (error) {
      console.error('❌ Error saving broadcast:', error)
      toast.error(error || 'Failed to save broadcast')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'audio/mp3']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload images, PDFs, videos, or audio files.')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size too large. Please upload files smaller than 10MB.')
      return
    }

    try {
      await dispatch(uploadBroadcastMedia(file)).unwrap()
      setUploadedFile({ url: uploadedMediaUrl, name: file.name })
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.error('❌ Error uploading file:', error)
      toast.error(error || 'Failed to upload file')
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    dispatch(clearUploadedMedia())
  }

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case 'school': return Building2
      case 'level': return GraduationCap
      case 'class': return Users
      default: return Building2
    }
  }

  const getFilteredClasses = () => {
    if (!classes || !watchedSchoolId) return []
    
    return classes.filter(cls => {
      const classSchoolId = cls.schoolId?._id || cls.schoolId
      return classSchoolId === watchedSchoolId
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'edit' ? 'Edit Broadcast' : 'Create New Broadcast'}
              </h2>
              <p className="text-sm text-gray-500">
                Send messages to parents via WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broadcast Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a descriptive title for your broadcast"
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content *
              </label>
              <textarea
                {...register('message', { required: 'Message is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your message to parents here..."
                disabled={loading}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {uploadedFile ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-700">{uploadedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeUploadedFile}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-2">
                      Upload images, PDFs, videos, or audio files
                    </div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-upload"
                      accept="image/*,application/pdf,video/*,audio/*"
                      disabled={mediaUploading}
                    />
                    <label
                      htmlFor="media-upload"
                      className={`inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                        mediaUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{mediaUploading ? 'Uploading...' : 'Choose File'}</span>
                    </label>
                  </div>
                )}
                {mediaUploadError && (
                  <p className="mt-2 text-sm text-red-600">{mediaUploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Targeting Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Target Recipients</h3>
            
            {/* School Selection (SUPER_ADMIN only) */}
            {user?.role === 'SUPER_ADMIN' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School *
                </label>
                <select
                  {...register('schoolId', { required: user?.role === 'SUPER_ADMIN' ? 'School is required' : false })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select School</option>
                  {schools && schools.map(school => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                {errors.schoolId && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolId.message}</p>
                )}
              </div>
            )}

            {/* Group Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['school', 'level', 'class'].map((type) => {
                const Icon = getGroupTypeIcon(type)
                const isSelected = selectedGroupType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedGroupType(type)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    disabled={loading}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="font-medium">
                      {type === 'school' && 'Entire School'}
                      {type === 'level' && 'Education Level'}
                      {type === 'class' && 'Specific Classes'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type === 'school' && 'Send to all parents'}
                      {type === 'level' && 'Target by grade level'}
                      {type === 'class' && 'Choose specific classes'}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Education Level Selection (when level is selected) */}
            {selectedGroupType === 'level' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level *
                </label>
                <select
                  value={selectedEducationLevel}
                  onChange={(e) => setSelectedEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select Education Level</option>
                  <option value="primary">Primary School (1st - 6th Year)</option>
                  <option value="lower-secondary">Lower Secondary (7th - 9th Year)</option>
                  <option value="upper-secondary">Upper Secondary (10th - 12th Year)</option>
                </select>
              </div>
            )}

            {/* Class Selection (when class is selected) */}
            {selectedGroupType === 'class' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classes * ({selectedClasses.length} selected)
                </label>
                <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto p-3">
                  {getFilteredClasses().map((classItem) => (
                    <label key={classItem._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(classItem._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, classItem._id])
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== classItem._id))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-700">{classItem.name}</span>
                    </label>
                  ))}
                  {getFilteredClasses().length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {user?.role === 'SUPER_ADMIN' && !watchedSchoolId 
                        ? 'Please select a school first'
                        : 'No classes available'
                      }
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Scheduling Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setScheduleMode(false)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  !scheduleMode
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                disabled={loading}
              >
                <Send className={`w-6 h-6 mx-auto mb-2 ${!scheduleMode ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="font-medium">Send Now</div>
                <div className="text-xs text-gray-500 mt-1">
                  Deliver immediately
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode(true)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  scheduleMode
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                disabled={loading}
              >
                <Clock className={`w-6 h-6 mx-auto mb-2 ${scheduleMode ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="font-medium">Schedule</div>
                <div className="text-xs text-gray-500 mt-1">
                  Choose date and time
                </div>
              </button>
            </div>

            {/* Schedule Date and Time */}
            {scheduleMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    {...register('scheduledDate', { required: scheduleMode ? 'Date is required' : false })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  {errors.scheduledDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    {...register('scheduledTime', { required: scheduleMode ? 'Time is required' : false })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  {errors.scheduledTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              disabled={loading || mediaUploading}
            >
              {scheduleMode ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>{loading ? 'Scheduling...' : 'Schedule Broadcast'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Now'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BroadcastModal
