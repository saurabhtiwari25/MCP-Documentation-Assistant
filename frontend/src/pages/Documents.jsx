import { useState, useEffect } from 'react';
import { UploadCloud, Trash2, FileText } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await fetch('http://localhost:8000/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Upload failed');
      }
      
      const data = await response.json();
      setUploadMessage({ type: 'success', text: `${data.filename} uploaded successfully.` });
      
      await fetchDocs();
      
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setUploadMessage({ type: 'error', text: e.message || 'An error occurred during upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await fetch(`http://localhost:8000/documents/${filename}`, {
        method: 'DELETE',
      });
      await fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1>Documents</h1>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', borderStyle: 'dashed' }}>
        <UploadCloud size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
        <h3>Upload a Document</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Support for PDF, TXT, and Markdown files</p>
        
        <label style={{ background: 'var(--accent-color)', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          {isUploading ? 'Uploading...' : 'Select File'}
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
        </label>
        
        {uploadMessage && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            borderRadius: '6px', 
            background: uploadMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: uploadMessage.type === 'success' ? '#22c55e' : '#ef4444',
            border: `1px solid ${uploadMessage.type === 'success' ? '#22c55e' : '#ef4444'}`
          }}>
            {uploadMessage.text}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Indexed Knowledge</h3>
        {documents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No documents uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.map((doc, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText color="var(--accent-color)" />
                  <div>
                    <div style={{ fontWeight: 500 }}>{doc.filename}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{(doc.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(doc.filename)} style={{ background: 'transparent', color: 'var(--error-color)', padding: '8px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
