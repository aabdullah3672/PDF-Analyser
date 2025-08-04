'use client'

import { useState, useRef } from 'react'

export default function PDFUploader() {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf')
    
    const fileObjects = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...fileObjects])
    
    fileObjects.forEach(fileObj => {
      simulateUpload(fileObj.id)
    })
  }

  const simulateUpload = (fileId) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' } : f
    ))

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progress, 100) }))
      
      if (progress >= 100) {
        clearInterval(interval)
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed' } : f
        ))
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 1000)
      }
    }, 200)
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ color: 'white', fontSize: '32px' }}>📄</span>
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            PDF Uploader
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }}>
            Drag and drop your PDF files or click to browse
          </p>
        </div>

        {/* Upload Area */}
        <div
          style={{
            position: 'relative',
            border: `2px dashed ${isDragging ? '#ffffff' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            backgroundColor: isDragging ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            marginBottom: '32px',
            cursor: 'pointer',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            style={{
              position: 'absolute',
              inset: '0',
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: isDragging ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              marginBottom: '16px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ 
                fontSize: '40px',
                filter: isDragging ? 'brightness(1.2)' : 'brightness(1)'
              }}>
                ⬆️
              </span>
            </div>
            
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px'
            }}>
              {isDragging ? 'Drop your files here' : 'Upload your PDF files'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px', fontSize: '16px' }}>
              Drag and drop files here, or{' '}
              <span style={{ color: 'white', fontWeight: '500', textDecoration: 'underline' }}>
                browse
              </span>
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Supports: PDF files up to 10MB each
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            padding: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📄 Uploaded Files ({files.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    transition: 'background-color 0.2s',
                    border: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '20px' }}>
                      {file.status === 'completed' ? '✅' : 
                       file.status === 'uploading' ? '⏳' : '📄'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px'
                      }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div style={{ flex: 1, maxWidth: '200px', margin: '0 16px' }}>
                      <div style={{
                        width: '100%',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        height: '6px',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            height: '6px',
                            borderRadius: '9999px',
                            transition: 'width 0.3s ease',
                            width: `${uploadProgress[file.id] || 0}%`
                          }}
                        />
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: '4px',
                        textAlign: 'center'
                      }}>
                        {Math.round(uploadProgress[file.id] || 0)}%
                      </p>
                    </div>
                  )}
                  
                  {/* Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {file.status === 'completed' && (
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        Completed
                      </span>
                    )}
                    {file.status === 'uploading' && (
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '500',
                        animation: 'pulse 2s infinite'
                      }}>
                        Uploading...
                      </span>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.id)
                      }}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        fontSize: '16px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'linear-gradient(90deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(102,126,234,0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <span style={{ color: '#6b7280' }}>
                  Total Files: <span style={{ fontWeight: '600', color: '#111827' }}>{files.length}</span>
                </span>
                <span style={{ color: '#6b7280' }}>
                  Completed: <span style={{ fontWeight: '600', color: '#059669' }}>
                    {files.filter(f => f.status === 'completed').length}
                  </span>
                </span>
                <span style={{ color: '#6b7280' }}>
                  Total Size: <span style={{ fontWeight: '600', color: '#111827' }}>
                    {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '32px' }}>📁</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
              No files uploaded yet
            </p>
          </div>
        )}
      </div>
      
      {/* Add some custom styles for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
