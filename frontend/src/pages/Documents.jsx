import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Trash2, FileText, Send, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import MCPStatus from '../components/MCPStatus';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolCalls, setToolCalls] = useState([]);
  const [retrievalInfo, setRetrievalInfo] = useState(null);
  const chatContainerRef = useRef(null);

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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setToolCalls([]);
    setRetrievalInfo(null);

    setMessages(prev => [...prev, { role: 'assistant', content: '', sources: null, confidence: null }]);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!response.body) throw new Error('No readable stream available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'token') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIndex = newMsgs.length - 1;
                  newMsgs[lastIndex] = {
                    ...newMsgs[lastIndex],
                    content: newMsgs[lastIndex].content + data.content
                  };
                  return newMsgs;
                });
              } else if (data.type === 'tool_call') {
                setToolCalls(prev => [...prev, data.content]);
              } else if (data.type === 'retrieval') {
                setRetrievalInfo({
                  sources: data.sources || [],
                  count: data.count || 0
                });
              } else if (data.type === 'citations') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIndex = newMsgs.length - 1;
                  newMsgs[lastIndex] = {
                    ...newMsgs[lastIndex],
                    sources: data.sources,
                    confidence: data.confidence
                  };
                  return newMsgs;
                });
              } else if (data.type === 'error') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIndex = newMsgs.length - 1;
                  newMsgs[lastIndex] = {
                    ...newMsgs[lastIndex],
                    content: `Error: ${data.content}`
                  };
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Left Column: Documents */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground shrink-0">Documents & Chat</h1>
        
        <div className="bg-card/80 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm transition-colors hover:bg-muted/50 shrink-0">
          <UploadCloud size={40} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Upload a Document</h3>
          <p className="text-sm text-muted-foreground mb-6">Support for PDF, TXT, and Markdown files</p>
          
          <Button variant="ghost" size="lg" asChild disabled={isUploading}>
            <label className="cursor-pointer">
              <UploadCloud size={16} />
              {isUploading ? 'Uploading...' : 'Select File'}
              <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
            </label>
          </Button>
          
          {uploadMessage && (
            <div className={`mt-4 px-4 py-3 rounded-lg border text-sm ${
              uploadMessage.type === 'success' 
                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {uploadMessage.text}
            </div>
          )}
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shrink-0">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Indexed Knowledge</h3>
          {documents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                      <FileText className="text-primary" size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-medium text-foreground text-sm truncate">{doc.filename}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{(doc.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(doc.filename)} 
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0 ml-2"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-6 shrink-0 h-64">
          <MCPStatus toolCalls={toolCalls} />
        </div>
      </div>

      {/* Right Column: Chat Box */}
      <div className="flex-[1.5] flex flex-col bg-card/80 backdrop-blur-md rounded-2xl border border-border overflow-hidden shadow-sm min-h-0">
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
          {messages.length === 0 ? (
            <div className="m-auto text-center text-muted-foreground">
              <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-sm">Ask a question about your uploaded documents.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'assistant' && retrievalInfo && idx === messages.length - 1 && (
                  <div className="flex items-center gap-2 mb-3 px-4 py-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 text-[12px] text-muted-foreground shadow-sm">
                    <Database size={14} className="text-indigo-400 shrink-0" />
                    <span>
                      {retrievalInfo.count > 0 ? (
                        <>
                          Retrieved <strong className="text-indigo-400 font-semibold">{retrievalInfo.count} chunk{retrievalInfo.count !== 1 ? 's' : ''}</strong> from{' '}
                          {retrievalInfo.sources.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-indigo-500/15 px-2 py-0.5 rounded ml-1 text-[11px] font-medium text-indigo-300">
                              <FileText size={10} />
                              {s}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span className="text-amber-500 font-medium">No matching documents found — answering from general knowledge</span>
                      )}
                    </span>
                  </div>
                )}

                <div className={`p-4 rounded-2xl max-w-[90%] shadow-sm text-sm ${
                  msg.role === 'user' 
                    ? 'self-end bg-primary text-primary-foreground ml-auto rounded-br-sm' 
                    : 'self-start bg-background/80 border border-border rounded-bl-sm text-foreground'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                      <strong className="text-foreground/80 font-semibold">Sources:</strong>
                      <ul className="pl-4 mt-1 space-y-0.5 list-disc">
                        {msg.sources.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                      {msg.confidence && <div className="mt-2 text-primary/80 font-medium">Confidence: {(msg.confidence * 100).toFixed(1)}%</div>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleChatSubmit} className="p-4 bg-background/50 backdrop-blur-sm border-t border-border flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about documents..."
            className="flex-1 bg-background border border-input rounded-xl px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            disabled={isLoading}
          />
          <Button variant="ghost" size="icon-lg" type="submit" disabled={isLoading || !input.trim()}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
