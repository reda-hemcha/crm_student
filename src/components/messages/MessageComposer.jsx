import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Send, Paperclip, X, FileText, Image, Video, Music } from 'lucide-react'
import { 
  sendOneToOneMessage, 
  uploadOneToOneMedia,
  setMessageContent,
  clearUploadedMedia,
  clearErrors
} from '../../store/oneToOneSlice'
import { oneToOneApi } from '../../api/oneToOneApi'
import toast from 'react-hot-toast'

const MessageComposer = ({ onMessageSent }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { 
    selectedStudent,
    selectedParent,
    messageContent,
    sending,
    sendError,
    mediaUploading,
    mediaUploadError,
    uploadedMediaUrl
  } = useSelector((state) => state.oneToOne)

  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageContent.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!selectedParent?.phoneNumber) {
      toast.error('Please select a parent contact')
      return
    }

    // Validate phone number
    const validation = oneToOneApi.validatePhoneNumber(selectedParent.phoneNumber)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      const messageData = {
        phoneNumber: validation.cleanPhone,
        message: messageContent.trim(),
        ...(user?.role === 'SUPER_ADMIN' && selectedStudent?.schoolId && { 
          schoolId: selectedStudent.schoolId._id || selectedStudent.schoolId 
        }),
        ...(uploadedMediaUrl && { mediaUrl: uploadedMediaUrl })
      }

      const result = await dispatch(sendOneToOneMessage(messageData)).unwrap()
      
      toast.success('Message sent successfully!')
      
      // Clear form
      dispatch(setMessageContent(''))
      dispatch(clearUploadedMedia())
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent(result)
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error)
      toast.error(error || 'Failed to send message')
    }
  }

  const handleFileUpload = async (file) => {
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
      await dispatch(uploadOneToOneMedia(file)).unwrap()
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.error('❌ Error uploading file:', error)
      toast.error(error || 'Failed to upload file')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeUploadedFile = () => {
    dispatch(clearUploadedMedia())
  }

  const getFileIcon = (url) => {
    if (!url) return FileText
    
    const extension = url.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Image
      case 'mp4':
      case 'avi':
      case 'mov':
        return Video
      case 'mp3':
      case 'wav':
      case 'm4a':
        return Music
      default:
        return FileText
    }
  }

  const getFileName = (url) => {
    if (!url) return ''
    return url.split('/').pop() || 'Uploaded file'
  }

  const canSend = selectedStudent && selectedParent && messageContent.trim() && !sending

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Error Display */}
      {sendError && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="text-red-600 text-sm">{sendError}</div>
            <button
              onClick={() => dispatch(clearErrors())}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Media Display */}
      {uploadedMediaUrl && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const FileIcon = getFileIcon(uploadedMediaUrl)
                return <FileIcon className="w-5 h-5 text-green-600" />
              })()}
              <div>
                <p className="text-sm font-medium text-green-800">File attached</p>
                <p className="text-xs text-green-600">{getFileName(uploadedMediaUrl)}</p>
              </div>
            </div>
            <button
              onClick={removeUploadedFile}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="p-4">
        <div 
          className={`relative border-2 border-dashed rounded-lg transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-4">
            {/* Message Input */}
            <div className="flex items-end space-x-3">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaUploading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach file"
              >
                {mediaUploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,application/pdf,video/*,audio/*"
                className="hidden"
                disabled={mediaUploading}
              />
              
              {/* Message Textarea */}
              <div className="flex-1">
                <textarea
                  value={messageContent}
                  onChange={(e) => dispatch(setMessageContent(e.target.value))}
                  placeholder="Type your message to the parent..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={sending}
                />
                {mediaUploadError && (
                  <p className="mt-1 text-sm text-red-600">{mediaUploadError}</p>
                )}
              </div>
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={!canSend}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!selectedStudent ? 'Select a student first' : 
                       !selectedParent ? 'Select a parent first' : 
                       !messageContent.trim() ? 'Enter a message' : 'Send message'}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Drag and Drop Hint */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                Drag and drop a file here, or click the 📎 button to attach
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Send Status */}
      {sending && (
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Sending message to {selectedParent?.name}...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageComposer
