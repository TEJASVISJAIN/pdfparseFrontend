import { useRef, useState } from 'react'
import './App.css'

type ApiResponse = {
  success: boolean
  data: {
    fileName: string
    fileSize: number
    mimeType: string
    fields: {
      full_name: string
      college: string
      most_recent_company: string
      top_skills: string[]
    }
  }
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ApiResponse['data'] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setResult(null)
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Using Vite dev proxy: request to /pdf will be proxied to http://localhost:3000
      const response = await fetch('/pdf/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }
      const json = (await response.json()) as ApiResponse
      if (!json.success) {
        throw new Error('API responded with success=false')
      }
      setResult(json.data)
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    preventDefaults(e)
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      if (dropped.type !== 'application/pdf') {
        setError('Please drop a PDF file.')
        return
      }
      setFile(dropped)
      setError(null)
      setResult(null)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Candidate Profiler</h1>
        <p className="muted">Upload your resume PDF to extract key details.</p>
      </header>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={(e) => {
          preventDefaults(e)
          setIsDragging(true)
        }}
        onDragOver={preventDefaults}
        onDragLeave={(e) => {
          preventDefaults(e)
          setIsDragging(false)
        }}
        onDrop={handleDrop as unknown as React.DragEventHandler<HTMLDivElement>}
        role="button"
        aria-label="Upload PDF"
        title="Click or drag to upload a PDF"
      >
        <div className="dropzone-inner">
          <div className="dropzone-icon">📄</div>
          <div className="dropzone-text">
            <strong>Drag & drop</strong> your PDF here, or <span className="link">browse</span>
          </div>
          <div className="dropzone-sub">Only PDF files are supported.</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      <div className="actions">
        <div className="file-name" title={file ? file.name : undefined}>{file ? file.name : 'No file selected'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(file || result) && (
            <button className="btn" onClick={handleReset} disabled={loading} title="Clear selected file and results">
              Reset
            </button>
          )}
          <button className="btn primary" onClick={handleUpload} disabled={!file || loading} title="Upload selected PDF">
            {loading ? 'Uploading…' : 'Upload PDF'}
          </button>
        </div>
      </div>

      {error && <div className="error" role="alert">{error}</div>}

      {result && (
        <section className="results">
          <h2 className="section-title">Extracted Information</h2>
          <div className="grid">
            <div className="card">
              <h3 className="card-title">File</h3>
              <div className="row"><span>File name</span><strong>{result.fileName}</strong></div>
              <div className="row"><span>File size</span><strong>{result.fileSize} bytes</strong></div>
              <div className="row"><span>MIME type</span><strong>{result.mimeType}</strong></div>
            </div>
            <div className="card">
              <h3 className="card-title">Fields</h3>
              <div className="row"><span>Full name</span><strong>{result.fields.full_name}</strong></div>
              <div className="row"><span>College</span><strong>{result.fields.college}</strong></div>
              <div className="row"><span>Company</span><strong>{result.fields.most_recent_company}</strong></div>
              <div className="row column">
                <span>Top skills</span>
                <div className="chips">
                  {result.fields.top_skills.map((skill, idx) => (
                    <span className="chip" key={idx}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
