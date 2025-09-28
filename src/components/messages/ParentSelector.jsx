import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Phone, Mail, User, X } from 'lucide-react'
import { setSelectedParent } from '../../store/oneToOneSlice'
import { oneToOneApi } from '../../api/oneToOneApi'

const ParentSelector = ({ isOpen, onClose, student }) => {
  const dispatch = useDispatch()
  const [customPhone, setCustomPhone] = useState('')
  const [customName, setCustomName] = useState('')

  const parents = student?.parentIds || []
  const phoneNumbers = oneToOneApi.getParentPhoneNumbers(student)

  const handleSelectParent = (parent) => {
    dispatch(setSelectedParent(parent))
    onClose()
  }

  const handleCustomParent = () => {
    if (!customName.trim() || !customPhone.trim()) return
    
    const customParent = {
      name: customName.trim(),
      phoneNumber: customPhone.trim(),
      relationship: 'Custom Contact',
      isCustom: true
    }
    
    dispatch(setSelectedParent(customParent))
    setCustomPhone('')
    setCustomName('')
    onClose()
  }

  const formatPhoneForDisplay = (phone) => {
    return oneToOneApi.formatPhoneNumber(phone)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Parent Contact</h2>
              <p className="text-sm text-gray-500">
                Choose a parent of {student?.name} to send a message to
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

        <div className="p-6">
          {/* Student Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{student?.name}</h3>
                <p className="text-sm text-gray-600">
                  {student?.classId?.name || 'No Class'} • {student?.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Parents List */}
          {parents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Student's Parents</h3>
              <div className="space-y-3">
                {parents.map((parent, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectParent(parent)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{parent.name}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {parent.responsible_parent}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{formatPhoneForDisplay(parent.phoneNumber)}</span>
                          </div>
                          
                          {parent.email && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span>{parent.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Contact */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Custom Contact</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send to a phone number not listed above
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+216 98 123 456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +216 for Tunisia)
                </p>
              </div>
              
              <button
                onClick={handleCustomParent}
                disabled={!customName.trim() || !customPhone.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Use Custom Contact
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParentSelector
