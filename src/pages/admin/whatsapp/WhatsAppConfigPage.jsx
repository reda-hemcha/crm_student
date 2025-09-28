import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Smartphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  TestTube, 
  CheckCircle, 
  XCircle,
  Building2,
  Phone,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  fetchWhatsAppConfigs, 
  createWhatsAppConfig, 
  updateWhatsAppConfig, 
  deleteWhatsAppConfig,
  testWhatsAppConnection,
  toggleWhatsAppConfigStatus
} from '../../../store/whatsappSlice'
import { fetchSchools } from '../../../store/schoolsSlice'

const WhatsAppConfigPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  // Redux state
  const { 
    configs, 
    loading, 
    submitting, 
    deleting, 
    error, 
    connectionTests 
  } = useSelector((state) => state.whatsapp)
  
  const { schools, loading: schoolsLoading } = useSelector((state) => state.schools)
  
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [showTokens, setShowTokens] = useState({})
  const [formData, setFormData] = useState({
    schoolId: '',
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  })
  const [showAuthToken, setShowAuthToken] = useState(false)
  
  // Load initial data
  useEffect(() => {
    dispatch(fetchWhatsAppConfigs())
    dispatch(fetchSchools())
  }, [dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOpenModal = (config = null) => {
    if (config) {
      setFormData({
        schoolId: config.schoolId._id,
        accountSid: config.accountSid,
        authToken: config.authToken,
        phoneNumber: config.phoneNumber
      })
      setSelectedConfig(config)
    } else {
      setFormData({
        schoolId: '',
        accountSid: '',
        authToken: '',
        phoneNumber: ''
      })
      setSelectedConfig(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedConfig(null)
    setFormData({
      schoolId: '',
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    })
    setShowAuthToken(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.schoolId || !formData.accountSid || !formData.authToken || !formData.phoneNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (selectedConfig) {
        // Update existing configuration
        await dispatch(updateWhatsAppConfig({
          configId: selectedConfig._id,
          configData: formData
        })).unwrap()
        toast.success('Configuration updated successfully!')
      } else {
        // Create new configuration
        await dispatch(createWhatsAppConfig(formData)).unwrap()
        toast.success('Configuration created successfully!')
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error(error?.message || 'Failed to save configuration')
    }
  }

  const handleToggleToken = (configId) => {
    setShowTokens(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const handleTestConnection = async (config) => {
    try {
      const result = await dispatch(testWhatsAppConnection(config._id)).unwrap()
      const success = result.response?.success
      toast.success(success ? `WhatsApp connection test successful for ${config.schoolId.name}` : `Connection test failed for ${config.schoolId.name}`)
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error(error?.message || 'Connection test failed')
    }
  }

  const handleToggleStatus = async (config) => {
    try {
      await dispatch(toggleWhatsAppConfigStatus(config._id)).unwrap()
      toast.success(`Configuration ${config.isActive ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      console.error('Error toggling configuration status:', error)
      toast.error(error?.message || 'Failed to toggle status')
    }
  }

  const handleDelete = async (config) => {
    if (window.confirm(`Are you sure you want to delete WhatsApp configuration for ${config.schoolId.name}?`)) {
      try {
        await dispatch(deleteWhatsAppConfig(config._id)).unwrap()
        toast.success('Configuration deleted successfully')
      } catch (error) {
        console.error('Error deleting configuration:', error)
        toast.error(error?.message || 'Failed to delete configuration')
      }
    }
  }

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Configuration</h1>
          <p className="text-gray-600 mt-1">Manage Twilio WhatsApp configurations for schools</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Configuration</span>
        </button>
      </div>

      {/* Configurations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-full">
              <div className="col-span-3">School</div>
              <div className="col-span-2">Phone Number</div>
              <div className="col-span-2">Account SID</div>
              <div className="col-span-2">Auth Token</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-green-600 ml-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {configs.length > 0 ? configs.map((config) => (
            <div key={config._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* School */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{config.schoolId.name}</p>
                      <p className="text-xs text-gray-500">ID: {config.schoolId._id.slice(-8)}</p>
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-900">{config.phoneNumber}</span>
                  </div>
                </div>

                {/* Account SID */}
                <div className="col-span-2">
                  <span className="text-sm font-mono text-gray-600">{config.accountSid}</span>
                </div>

                {/* Auth Token */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-600">
                      {showTokens[config._id] ? 'your_full_token_here' : config.authToken}
                    </span>
                    <button
                      onClick={() => handleToggleToken(config._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showTokens[config._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    config.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {config.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTestConnection(config)}
                      disabled={loading}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Test Connection"
                    >
                      <TestTube className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(config)}
                      className={`p-2 rounded-lg transition-colors ${
                        config.isActive
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={config.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {config.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(config)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(config)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="px-6 py-12 text-center">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No WhatsApp Configurations</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first Twilio WhatsApp configuration.</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Configuration</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Total Configurations</h3>
              <p className="text-2xl font-bold text-blue-600">{configs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">Active Configurations</h3>
              <p className="text-2xl font-bold text-green-600">
                {configs.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-900">Schools Connected</h3>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(configs.map(c => c.schoolId._id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedConfig ? 'Edit WhatsApp Configuration' : 'Add WhatsApp Configuration'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedConfig ? 'Update Twilio configuration for this school' : 'Configure Twilio WhatsApp for a school'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* School Selection */}
              <div>
                <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 mb-2">
                  School *
                </label>
                <select
                  id="schoolId"
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a school</option>
                  {schools && schools.length > 0 ? schools
                    .filter(school => !configs.some(config => config.schoolId._id === school._id && config._id !== selectedConfig?._id))
                    .map(school => (
                      <option key={school._id} value={school._id}>
                        {school.name}
                      </option>
                    )) : (
                      <option value="" disabled>No schools available</option>
                    )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Only schools without existing configurations are shown
                </p>
              </div>

              {/* Account SID */}
              <div>
                <label htmlFor="accountSid" className="block text-sm font-medium text-gray-700 mb-2">
                  Twilio Account SID *
                </label>
                <input
                  type="text"
                  id="accountSid"
                  name="accountSid"
                  value={formData.accountSid}
                  onChange={handleInputChange}
                  placeholder="AC1234567890abcdef1234567890abcdef"
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your Twilio Account SID (starts with 'AC')
                </p>
              </div>

              {/* Auth Token */}
              <div>
                <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 mb-2">
                  Twilio Auth Token *
                </label>
                <div className="relative">
                  <input
                    type={showAuthToken ? "text" : "password"}
                    id="authToken"
                    name="authToken"
                    value={formData.authToken}
                    onChange={handleInputChange}
                    placeholder="Your Twilio Auth Token"
                    required
                    disabled={submitting}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthToken(!showAuthToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={submitting}
                  >
                    {showAuthToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your Twilio Auth Token (keep this secure)
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  WhatsApp Business phone number (include country code)
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>{selectedConfig ? 'Update Configuration' : 'Create Configuration'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppConfigPage

