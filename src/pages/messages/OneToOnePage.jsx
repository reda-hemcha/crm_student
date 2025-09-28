import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Circle,
  Send,
  Phone,
  GraduationCap,
  Building2,
  Clock
} from 'lucide-react'
import { 
  setSelectedStudent, 
  setSelectedParent, 
  clearForm,
  setShowStudentSelector,
  setShowParentSelector,
  setMessageContent,
  sendOneToOneMessage,
  uploadOneToOneMedia,
  clearUploadedMedia,
  clearErrors
} from '../../store/oneToOneSlice'
import StudentSelector from '../../components/messages/StudentSelector'
import ParentSelector from '../../components/messages/ParentSelector'
import toast from 'react-hot-toast'

const OneToOnePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user } = useSelector((state) => state.auth)
  const { 
    selectedStudent,
    selectedParent,
    showStudentSelector,
    showParentSelector,
    messageContent,
    sending,
    sendError,
    mediaUploading,
    uploadedMediaUrl,
    mediaUploadError
  } = useSelector((state) => state.oneToOne)
  
  const [messages, setMessages] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 1: Select Student, 2: Select Parent, 3: Compose & Send

  // Get student data from navigation state and set current step
  useEffect(() => {
    if (location.state?.student) {
      dispatch(setSelectedStudent(location.state.student))
      setCurrentStep(2) // Move to parent selection step
    }
  }, [location.state, dispatch])

  // Update current step based on selections
  useEffect(() => {
    if (selectedStudent && selectedParent) {
      setCurrentStep(3) // Move to compose & send step
    } else if (selectedStudent) {
      setCurrentStep(2) // Move to parent selection step
    } else {
      setCurrentStep(1) // Back to student selection step
    }
  }, [selectedStudent, selectedParent])

  // Clear form when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearForm())
    }
  }, [dispatch])

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!selectedParent?.phoneNumber) {
      toast.error('Please select a parent contact')
      return
    }

    try {
      const messageData = {
        phoneNumber: selectedParent.phoneNumber,
        message: messageContent.trim(),
        ...(user?.role === 'SUPER_ADMIN' && selectedStudent?.schoolId && { 
          schoolId: selectedStudent.schoolId._id || selectedStudent.schoolId 
        }),
        ...(uploadedMediaUrl && { mediaUrl: uploadedMediaUrl })
      }

      const result = await dispatch(sendOneToOneMessage(messageData)).unwrap()
      
      toast.success('Message sent successfully!')
      
      // Add to message history
      const newMessage = {
        id: result.messageId || Date.now(),
        type: 'sent',
        content: messageContent.trim(),
        timestamp: new Date(result.sentAt || Date.now()),
        sender: user?.name || 'Admin',
        messageId: result.messageId,
        status: result.status,
        hasMedia: result.hasMedia,
        mediaUrl: result.mediaUrl
      }

      setMessages(prev => [...prev, newMessage])
      
      // Clear form
      dispatch(setMessageContent(''))
      dispatch(clearUploadedMedia())
      
      // Move back to parent selection for new message
      dispatch(setSelectedParent(null))
      setCurrentStep(2)
      
    } catch (error) {
      console.error('❌ Error sending message:', error)
      toast.error(error || 'Failed to send message')
    }
  }

  const handleFileUpload = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'audio/mp3']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload images, PDFs, videos, or audio files.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Please upload files smaller than 10MB.')
      return
    }

    try {
      await dispatch(uploadOneToOneMedia(file)).unwrap()
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.error('❌ Error uploading file:', error)
      toast.error(error || 'Failed to upload file')
    }
  }

  // Step indicators component
  const StepIndicator = () => {
    const steps = [
      { number: 1, title: 'Select Student', icon: Users, completed: selectedStudent },
      { number: 2, title: 'Choose Parent', icon: Phone, completed: selectedParent },
      { number: 3, title: 'Send Message', icon: Send, completed: false }
    ]

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.number
          const isCompleted = step.completed
          
          return (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Send Personal Message</h1>
            <p className="text-gray-600 mt-1">Send a WhatsApp message to a student's parent</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/messages/broadcast')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Broadcast Messages</span>
        </button>
      </div>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Step 1: Student Selection */}
        {currentStep === 1 && (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Student</h2>
            <p className="text-gray-600 mb-6">
              Choose a student to send a message to their parents
            </p>
            <button
              onClick={() => dispatch(setShowStudentSelector(true))}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose Student
            </button>
          </div>
        )}

        {/* Step 2: Parent Selection */}
        {currentStep === 2 && selectedStudent && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.classId?.name || 'No Class'} • {selectedStudent.gender}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  dispatch(setSelectedStudent(null))
                  setCurrentStep(1)
                }}
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Change Student
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Choose Parent Contact</h4>
              
              {selectedParent ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedParent.name}</p>
                      <p className="text-sm text-gray-600">{selectedParent.phoneNumber}</p>
                      {selectedParent.relationship && (
                        <p className="text-xs text-gray-500">{selectedParent.relationship}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(setSelectedParent(null))}
                    className="text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Choose a parent to send the message to</p>
                  <button
                    onClick={() => dispatch(setShowParentSelector(true))}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select Parent
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Compose & Send */}
        {currentStep === 3 && selectedStudent && selectedParent && (
          <div className="p-6">
            {/* Selected Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.classId?.name || 'No Class'}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedParent.name}</p>
                    <p className="text-sm text-gray-600">{selectedParent.phoneNumber}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  dispatch(setSelectedParent(null))
                  setCurrentStep(2)
                }}
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Change Parent
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {/* Error Display */}
              {sendError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{sendError}</p>
                </div>
              )}

              {/* Message Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => dispatch(setMessageContent(e.target.value))}
                    placeholder="Type your message to the parent..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={sending}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {uploadedMediaUrl ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">File attached</p>
                            <p className="text-xs text-gray-500">{uploadedMediaUrl.split('/').pop()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => dispatch(clearUploadedMedia())}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                          accept="image/*,application/pdf,video/*,audio/*"
                          className="hidden"
                          id="file-upload"
                          disabled={mediaUploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            {mediaUploading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {mediaUploading ? 'Uploading...' : 'Click to attach file'}
                          </p>
                        </label>
                        {mediaUploadError && (
                          <p className="mt-2 text-sm text-red-600">{mediaUploadError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sending}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message History */}
      {messages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Messages</h3>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{msg.content}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleDateString()} at{' '}
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs text-green-600">• Sent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <StudentSelector
        isOpen={showStudentSelector}
        onClose={() => dispatch(setShowStudentSelector(false))}
      />

      <ParentSelector
        isOpen={showParentSelector}
        onClose={() => dispatch(setShowParentSelector(false))}
        student={selectedStudent}
      />
    </div>
  )
}

export default OneToOnePage
