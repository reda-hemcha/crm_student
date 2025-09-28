import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Upload, Download, FileText, CheckCircle, AlertCircle, Users, GraduationCap, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsCsvApi } from '../../api/studentsCsvApi'
import { fetchSchools } from '../../store/schoolsSlice'
import { fetchClasses } from '../../store/classesSlice'

const ClassesCsvUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { schools } = useSelector((state) => state.schools)
  const { classes } = useSelector((state) => state.classes)
  
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Fetch schools and classes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSchoolsAndClasses()
    } else {
      // Reset state when modal closes
      setSelectedSchool('')
      setSelectedClass('')
      setSelectedFile(null)
      setPreviewData(null)
      setValidationErrors([])
    }
  }, [isOpen])

  // Fetch classes when school changes (for SUPER_ADMIN)
  useEffect(() => {
    if (selectedSchool && user?.role === 'SUPER_ADMIN') {
      fetchClassesForSchool(selectedSchool)
    }
  }, [selectedSchool, user?.role])

  const fetchSchoolsAndClasses = async () => {
    try {
      setLoadingSchools(true)
      setLoadingClasses(true)
      
      console.log('🔍 Fetching schools and classes for CSV upload...')
      
      // Fetch schools
      await dispatch(fetchSchools())
      console.log('✅ Schools fetched successfully')
      
      // Fetch classes
      const filters = {
        page: 1,
        limit: 1000, // Get all classes
        schoolId: user?.role === 'ADMIN' ? user?.schoolId : null
      }
      await dispatch(fetchClasses(filters))
      console.log('✅ Classes fetched successfully')
      
    } catch (error) {
      console.error('❌ Error fetching schools and classes:', error)
      toast.error('Failed to load schools and classes')
    } finally {
      setLoadingSchools(false)
      setLoadingClasses(false)
    }
  }

  const fetchClassesForSchool = async (schoolId) => {
    try {
      setLoadingClasses(true)
      console.log('🔍 Fetching classes for school:', schoolId)
      
      const filters = {
        page: 1,
        limit: 1000,
        schoolId: schoolId
      }
      await dispatch(fetchClasses(filters))
      console.log('✅ Classes for school fetched successfully')
    } catch (error) {
      console.error('❌ Error fetching classes for school:', error)
      toast.error('Failed to load classes for selected school')
    } finally {
      setLoadingClasses(false)
    }
  }

  // Filter schools based on user role
  const filteredSchools = user?.role === 'SUPER_ADMIN' ? schools : schools.filter(school => school._id === user?.schoolId)
  
  // Filter classes based on selected school and user role
  const filteredClasses = classes.filter(cls => {
    if (user?.role === 'ADMIN') {
      return cls.schoolId === user?.schoolId || cls.schoolId?._id === user?.schoolId
    } else if (user?.role === 'SUPER_ADMIN' && selectedSchool) {
      return cls.schoolId === selectedSchool || cls.schoolId?._id === selectedSchool
    }
    return true
  })

  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setValidationErrors([])
      setPreviewData(null)
      
      console.log('📁 Selected CSV file:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Parse CSV for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvText = e.target.result
        console.log('📄 CSV content preview:', csvText.substring(0, 200) + '...')
        parseCsvPreview(csvText)
      }
      reader.readAsText(file)
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const parseCsvPreview = (csvText) => {
    try {
      console.log('🔍 Parsing CSV preview...')
      const lines = csvText.split('\n').filter(line => line.trim())
      console.log('📊 CSV lines found:', lines.length)
      console.log('📋 First few lines:', lines.slice(0, 3))
      
      if (lines.length < 2) {
        setValidationErrors(['CSV file must have at least a header row and one data row'])
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      console.log('📑 Headers found:', headers)
      
      const requiredHeaders = ['studentname', 'parentname', 'parentphone', 'parentrelationship', 'gender']
      const missingHeaders = requiredHeaders.filter(req => !headers.includes(req))
      console.log('❌ Missing headers:', missingHeaders)
      
      if (missingHeaders.length > 0) {
        setValidationErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
        return
      }

      // Parse first few rows for preview
      const previewRows = lines.slice(1, Math.min(6, lines.length)).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      setPreviewData({
        headers,
        rows: previewRows,
        totalRows: lines.length - 1
      })
      
      // Move to step 3 (preview) when file is parsed
      setCurrentStep(3)
      
    } catch (error) {
      setValidationErrors(['Error parsing CSV file. Please check the format.'])
    }
  }

  const validateCsvData = () => {
    const errors = []
    
    if (!selectedFile) {
      errors.push('Please select a CSV file')
    }
    
    if (!selectedClass) {
      errors.push('Please select a target class')
    }

    // For SUPER_ADMIN, school selection is required
    if (user?.role === 'SUPER_ADMIN' && !selectedSchool) {
      errors.push('Please select a school')
    }

    if (previewData) {
      previewData.rows.forEach((row, index) => {
        const rowNum = index + 2 // +2 because we start from row 2 (after header)
        
        // Validate required fields
        if (!row.studentname?.trim()) {
          errors.push(`Row ${rowNum}: Student name is required`)
        }
        
        if (!row.parentname?.trim()) {
          errors.push(`Row ${rowNum}: Parent name is required`)
        }
        
        if (!row.parentphone?.trim()) {
          errors.push(`Row ${rowNum}: Parent phone is required`)
        }
        
        // Validate phone format
        const phoneRegex = /^\+[1-9]\d{1,14}$/
        if (!phoneRegex.test(row.parentphone?.replace(/\s/g, ''))) {
          errors.push(`Row ${rowNum}: Parent phone must be in international format (+1234567890)`)
        }
        
        if (!row.parentrelationship?.trim()) {
          errors.push(`Row ${rowNum}: Parent relationship is required`)
        }
        
        // Validate parent relationship
        const validRelationships = ['father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt', 'other']
        if (!validRelationships.includes(row.parentrelationship?.toLowerCase())) {
          errors.push(`Row ${rowNum}: Parent relationship must be one of: Father, Mother, Guardian, Grandfather, Grandmother, Uncle, Aunt, Other`)
        }
        
        if (!row.gender?.trim()) {
          errors.push(`Row ${rowNum}: Gender is required`)
        }
        
        // Validate gender
        if (!['male', 'female'].includes(row.gender?.toLowerCase())) {
          errors.push(`Row ${rowNum}: Gender must be 'Male' or 'Female'`)
        }
      })
    }
    
    return errors
  }

  const handleUpload = async () => {
    const errors = validateCsvData()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setUploading(true)
    try {
      // Comprehensive debugging before upload
      console.log('🔍 === CSV UPLOAD DEBUG START ===')
      console.log('📁 Selected file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified
      })
      
      console.log('🎯 Selected class ID:', selectedClass)
      const selectedClassObj = filteredClasses.find(cls => cls._id === selectedClass)
      console.log('🏫 Selected class object:', selectedClassObj)
      
      console.log('👤 Current user:', {
        role: user?.role,
        schoolId: user?.schoolId,
        id: user?.id
      })
      
      console.log('📊 Preview data:', previewData)
      
      // Read CSV content for debugging
      const reader = new FileReader()
      reader.onload = async (e) => {
        const csvContent = e.target.result
        console.log('📄 CSV Content (first 500 chars):', csvContent.substring(0, 500))
        
        const lines = csvContent.split('\n').filter(line => line.trim())
        console.log('📋 CSV Analysis:', {
          totalLines: lines.length,
          headerLine: lines[0],
          firstDataLine: lines[1],
          lastDataLine: lines[lines.length - 1]
        })
        
        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim())
        console.log('📑 Headers found:', headers)
        
        // Check if headers match expected format
        const expectedHeaders = ['studentName', 'parentName', 'parentPhone', 'parentRelationship', 'gender']
        const headerMatch = expectedHeaders.every(h => headers.includes(h))
        console.log('✅ Header validation:', headerMatch ? 'PASS' : 'FAIL')
        if (!headerMatch) {
          const missing = expectedHeaders.filter(h => !headers.includes(h))
          console.log('❌ Missing headers:', missing)
        }
        
        // Proceed with upload
        await performUpload()
      }
      reader.readAsText(selectedFile)
      
    } catch (error) {
      console.error('❌ Upload error:', error)
      toast.error(error.message || 'Failed to upload CSV file')
      setUploading(false)
    }
  }
  
  const performUpload = async () => {
    try {
      const formData = new FormData()
      formData.append('csvFile', selectedFile)
      formData.append('classId', selectedClass)
      
      console.log('📤 FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
      }
      
      // Test CSV validation first (optional)
      try {
        console.log('🔍 Testing CSV validation...')
        const validationResponse = await studentsCsvApi.validateCsvData(formData)
        console.log('✅ Validation result:', validationResponse)
      } catch (validationError) {
        console.warn('⚠️ Validation failed, proceeding with upload:', validationError)
      }
      
      console.log('🚀 Making API call to upload CSV...')
      // Make the API call to upload CSV
      const response = await studentsCsvApi.uploadStudentsCsv(formData)
      
      console.log('📥 API Response received:', response)
      
      console.log('📊 Upload result analysis:', {
        success: response.success,
        message: response.message,
        totalRows: response.data?.totalRows,
        successful: response.data?.successful,
        errors: response.data?.errors,
        results: response.data?.results,
        errorDetails: response.data?.errors
      })
      
      if (response.success) {
        const successCount = response.data?.successful || 0
        const errorCount = response.data?.errors || 0
        const totalRows = response.data?.totalRows || 0
        
        console.log(`📈 Processing Summary: ${successCount}/${totalRows} students processed successfully`)
        
        if (totalRows === 0) {
          toast.error('No data rows found in CSV file')
          console.error('❌ No data rows found - CSV might be empty or malformed')
        } else if (successCount === 0 && totalRows > 0) {
          toast.error('All rows failed validation. Check CSV format and data.')
          console.error('❌ All rows failed - likely data format issues')
        } else if (errorCount > 0) {
          toast.success(`Upload completed: ${successCount} students processed successfully, ${errorCount} errors`)
          console.log('⚠️ Partial success with errors')
          // Show detailed errors if any
          if (response.data?.errors?.length > 0) {
            console.log('📋 Upload errors:', response.data.errors)
          }
        } else {
          toast.success(`Successfully processed ${successCount} students`)
          console.log('✅ Complete success!')
        }
        
        // Reset form
        setSelectedFile(null)
        setSelectedClass('')
        setSelectedSchool('')
        setPreviewData(null)
        setValidationErrors([])
        
        if (onUploadSuccess) {
          onUploadSuccess()
        }
        
        onClose()
      } else {
        throw new Error(response.message || 'Upload failed')
      }
      
      console.log('🔍 === CSV UPLOAD DEBUG END ===')
      
    } catch (error) {
      console.error('❌ Upload error:', error)
      toast.error(error.message || 'Failed to upload CSV file')
    } finally {
      setUploading(false)
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
      handleFileSelect(file)
    }
  }

  const downloadTemplate = async () => {
    try {
      // Try to get template from API first
      const response = await studentsCsvApi.getCsvTemplate()
      if (response.success && response.data.template) {
        const blob = new Blob([response.data.template], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'students_template.csv'
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        // Fallback to local template
        downloadLocalTemplate()
      }
    } catch (error) {
      console.warn('Could not fetch template from API, using local template:', error)
      // Fallback to local template
      downloadLocalTemplate()
    }
  }

  const downloadLocalTemplate = () => {
    const csvContent = `studentName,parentName,parentPhone,parentRelationship,gender
Ahmed Ben Ali,Fatima Ben Ali,+21698123456,Mother,Male
Sara Mansouri,Mohamed Mansouri,+21698765432,Father,Female
Omar Khelil,Aicha Khelil,+21695123456,Mother,Male
Fatima Trabelsi,Hassan Trabelsi,+21694123456,Father,Female
Youssef Khelil,Aicha Khelil,+21695123456,Mother,Male`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Students CSV</h2>
              <p className="text-sm text-gray-500">Bulk import students to a specific class</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Step 1: Class Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                Step 1: Select Target Class
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Selection (for SUPER_ADMIN) */}
                {user?.role === 'SUPER_ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School
                    </label>
                    <select
                      value={selectedSchool}
                      onChange={(e) => {
                        setSelectedSchool(e.target.value)
                        setSelectedClass('') // Reset class when school changes
                      }}
                      disabled={loadingSchools}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loadingSchools ? 'Loading schools...' : 'Select School'}
                      </option>
                      {filteredSchools.map(school => (
                        <option key={school._id} value={school._id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={
                      loadingClasses || 
                      (user?.role === 'SUPER_ADMIN' && !selectedSchool)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingClasses 
                        ? 'Loading classes...' 
                        : user?.role === 'SUPER_ADMIN' && !selectedSchool
                        ? 'Select school first'
                        : 'Select Class'
                      }
                    </option>
                    {filteredClasses.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  
                  {user?.role === 'SUPER_ADMIN' && !selectedSchool && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please select a school first to see available classes
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: File Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Step 2: Upload CSV File
              </h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewData(null)
                        setValidationErrors([])
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Upload CSV File</p>
                      <p className="text-sm text-gray-500">
                        Drag and drop your CSV file here, or click to browse
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {/* Download Template */}
              <div className="mt-4 flex items-center justify-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>

            {/* Step 3: Preview */}
            {previewData && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Step 3: Preview Data ({previewData.totalRows} students)
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {previewData.headers.map((header, index) => (
                          <th key={index} className="text-left py-2 px-3 font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100">
                          {previewData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="py-2 px-3 text-gray-600">
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {previewData.totalRows > previewData.rows.length && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Showing first {previewData.rows.length} rows of {previewData.totalRows} total
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={
              !selectedFile || 
              !selectedClass || 
              uploading || 
              validationErrors.length > 0 ||
              (user?.role === 'SUPER_ADMIN' && !selectedSchool)
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Students</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClassesCsvUploadModal
