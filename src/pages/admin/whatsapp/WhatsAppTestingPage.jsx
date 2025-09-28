import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Phone, 
  Send, 
  MessageSquare, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  TestTube,
  AlertCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { whatsappMessagingApi } from '../../../api/whatsappApi'
import { fetchWhatsAppConfigs } from '../../../store/whatsappSlice'
import { fetchSchools } from '../../../store/schoolsSlice'

const WhatsAppTestingPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  // Redux state
  const { schools, loading: schoolsLoading } = useSelector((state) => state.schools)
  const { configs, loading: configsLoading } = useSelector((state) => state.whatsapp)
  
  // Local state
  const [selectedSchool, setSelectedSchool] = useState('')
  const [testType, setTestType] = useState('single') // 'single' or 'bulk'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneNumbers, setPhoneNumbers] = useState('')
  const [message, setMessage] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)

  // Load initial data
  useEffect(() => {
    dispatch(fetchSchools())
    dispatch(fetchWhatsAppConfigs())
  }, [dispatch])

  // Filter schools that have WhatsApp configurations
  const schoolsWithConfig = schools.filter(school => 
    configs.some(config => config.schoolId._id === school._id && config.isActive)
  )

  const handleSingleTest = async () => {
    if (!selectedSchool || !phoneNumber || !message) {
      toast.error('Please fill in all fields')
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number with country code (e.g., +1234567890)')
      return
    }

    setTesting(true)
    try {
      const result = await whatsappMessagingApi.testMessage(selectedSchool, phoneNumber, message, mediaUrl || null)
      
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        school: schools.find(s => s._id === selectedSchool)?.name,
        type: 'single',
        recipient: phoneNumber,
        message: message,
        mediaUrl: mediaUrl || null,
        status: result.success ? 'success' : 'error',
        response: result.message || (result.success ? 'Message sent successfully' : 'Failed to send message')
      }
      
      setTestResults(prev => [newResult, ...prev])
      toast.success(result.success ? 'Test message sent successfully!' : 'Failed to send test message')
      
      // Clear form on success
      if (result.success) {
        setPhoneNumber('')
        setMessage('')
        setMediaUrl('')
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        school: schools.find(s => s._id === selectedSchool)?.name,
        type: 'single',
        recipient: phoneNumber,
        message: message,
        mediaUrl: mediaUrl || null,
        status: 'error',
        response: error?.message || 'Failed to send test message'
      }
      
      setTestResults(prev => [newResult, ...prev])
      toast.error(error?.message || 'Failed to send test message')
    } finally {
      setTesting(false)
    }
  }

  const handleBulkTest = async () => {
    if (!selectedSchool || !phoneNumbers || !message) {
      toast.error('Please fill in all fields')
      return
    }

    const validation = validatePhoneNumbers(phoneNumbers)
    if (validation.valid.length === 0) {
      toast.error('Please enter at least one valid phone number')
      return
    }

    if (!validation.allValid) {
      toast.error(`Invalid phone numbers: ${validation.invalid.join(', ')}`)
      return
    }

    setTesting(true)
    try {
      const result = await whatsappMessagingApi.sendBulkMessages(selectedSchool, validation.valid, message, mediaUrl || null)
      
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        school: schools.find(s => s._id === selectedSchool)?.name,
        type: 'bulk',
        recipients: validation.valid,
        message: message,
        mediaUrl: mediaUrl || null,
        status: result.success ? 'success' : 'partial',
        response: result.message || (result.success ? `${validation.valid.length} messages sent successfully` : 'Some messages failed to send')
      }
      
      setTestResults(prev => [newResult, ...prev])
      toast.success(result.success ? `Bulk test completed! ${validation.valid.length} messages sent` : 'Bulk test completed with some failures')
      
      // Clear form on success
      if (result.success) {
        setPhoneNumbers('')
        setMessage('')
        setMediaUrl('')
      }
    } catch (error) {
      console.error('Error sending bulk test messages:', error)
      
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        school: schools.find(s => s._id === selectedSchool)?.name,
        type: 'bulk',
        recipients: validation.valid,
        message: message,
        mediaUrl: mediaUrl || null,
        status: 'error',
        response: error?.message || 'Failed to send bulk test messages'
      }
      
      setTestResults(prev => [newResult, ...prev])
      toast.error(error?.message || 'Failed to send bulk test messages')
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const clearTestResults = () => {
    setTestResults([])
    toast.success('Test results cleared')
  }

  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString()
    }
    return timestamp.toLocaleTimeString()
  }

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone.trim())
  }

  const validatePhoneNumbers = (phones) => {
    const numbers = phones.split('\n').filter(n => n.trim())
    const invalidNumbers = numbers.filter(num => !validatePhoneNumber(num))
    return {
      valid: numbers,
      invalid: invalidNumbers,
      allValid: invalidNumbers.length === 0
    }
  }

  const insertTemplate = (template) => {
    setMessage(template.message)
    setMediaUrl(template.mediaUrl || '')
    toast.success('Template inserted')
  }

  const messageTemplates = [
    {
      message: 'Hello! This is a test message from your school.',
      mediaUrl: null
    },
    {
      message: 'Your child\'s attendance report is ready for review.',
      mediaUrl: null
    },
    {
      message: 'Parent-teacher meeting scheduled for next week.',
      mediaUrl: null
    },
    {
      message: 'Emergency: School will be closed tomorrow due to weather.',
      mediaUrl: null
    },
    {
      message: 'Please check this important document.',
      mediaUrl: 'https://example.com/document.pdf'
    },
    {
      message: 'Here\'s the school newsletter for this month.',
      mediaUrl: 'https://example.com/newsletter.pdf'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Testing</h1>
          <p className="text-gray-600 mt-1">Test WhatsApp message sending functionality</p>
        </div>
        {(schoolsLoading || configsLoading) && (
          <div className="flex items-center space-x-2 text-green-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TestTube className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Send Test Messages</h2>
          </div>

          <div className="space-y-4">
            {/* School Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select School *
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                disabled={schoolsLoading || configsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {schoolsLoading || configsLoading ? 'Loading schools...' : 'Choose a school'}
                </option>
                {schoolsWithConfig.map(school => (
                  <option key={school._id} value={school._id}>
                    {school.name}
                  </option>
                ))}
                {!schoolsLoading && !configsLoading && schoolsWithConfig.length === 0 && (
                  <option value="" disabled>
                    No schools with WhatsApp configuration found
                  </option>
                )}
              </select>
              {schoolsWithConfig.length === 0 && !schoolsLoading && !configsLoading && (
                <p className="text-xs text-orange-600 mt-1">
                  No schools have active WhatsApp configurations. Please configure WhatsApp for schools first.
                </p>
              )}
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="single"
                    checked={testType === 'single'}
                    onChange={(e) => setTestType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Single Message</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bulk"
                    checked={testType === 'bulk'}
                    onChange={(e) => setTestType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Bulk Messages</span>
                </label>
              </div>
            </div>

            {/* Phone Number(s) */}
            {testType === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Numbers * (one per line)
                </label>
                <textarea
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  placeholder="+1234567890&#10;+0987654321&#10;+1122334455"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {phoneNumbers.split('\n').filter(n => n.trim()).length} numbers entered
                  {phoneNumbers && (() => {
                    const validation = validatePhoneNumbers(phoneNumbers)
                    if (!validation.allValid && validation.invalid.length > 0) {
                      return (
                        <span className="text-red-600 ml-2">
                          ({validation.invalid.length} invalid)
                        </span>
                      )
                    }
                    return null
                  })()}
                </p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your test message here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length} characters
              </p>
              
              {/* Message Templates */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {messageTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => insertTemplate(template)}
                      className="text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {template.message.length > 50 ? `${template.message.substring(0, 50)}...` : template.message}
                        </span>
                        {template.mediaUrl && (
                          <span className="text-green-600 text-xs">📎</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Media URL (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media URL (Optional)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: Images (JPEG, PNG, GIF), Documents (PDF, DOC), Audio (MP3, WAV), Video (MP4, 3GP)
              </p>
            </div>

            {/* Send Button */}
            <button
              onClick={testType === 'single' ? handleSingleTest : handleBulkTest}
              disabled={testing || !selectedSchool || schoolsWithConfig.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Test {testType === 'bulk' ? 'Messages' : 'Message'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {testResults.length}
              </span>
            </div>
            {testResults.length > 0 && (
              <button
                onClick={clearTestResults}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear Results
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {testResults.length > 0 ? testResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm font-medium text-gray-900">{result.school}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(result.timestamp)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{result.type}</span>
                  </div>
                  
                  {result.type === 'single' ? (
                    <div className="text-sm">
                      <span className="text-gray-600">Recipient:</span>
                      <span className="ml-2 font-mono">{result.recipient}</span>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <span className="text-gray-600">Recipients:</span>
                      <span className="ml-2 font-medium">{result.recipients.length} numbers</span>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Message:</span>
                    <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded text-xs">
                      {result.message}
                    </p>
                  </div>
                  
                  {result.mediaUrl && (
                    <div className="text-sm">
                      <span className="text-gray-600">Media:</span>
                      <a 
                        href={result.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs break-all"
                      >
                        {result.mediaUrl}
                      </a>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Response:</span>
                    <span className="ml-2 text-gray-900">{result.response}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No test results yet</p>
                <p className="text-sm text-gray-500">Send a test message to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Total Tests</h3>
              <p className="text-2xl font-bold text-blue-600">{testResults.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">Successful</h3>
              <p className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.status === 'success').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900">Failed</h3>
              <p className="text-2xl font-bold text-red-600">
                {testResults.filter(r => r.status === 'error').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-900">Schools Tested</h3>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(testResults.map(r => r.school)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppTestingPage
