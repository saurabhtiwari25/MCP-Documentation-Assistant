import { useState, useRef, useEffect } from 'react';
import { Send, Database, FileText } from 'lucide-react';
import MCPStatus from '../components/MCPStatus';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolCalls, setToolCalls] = useState([]);
  const [retrievalInfo, setRetrievalInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolCalls]);

  const handleSubmit = async (e) => {
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
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <h2>How can I help you today?</h2>
              <p>Ask a question about your uploaded documents.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'assistant' && retrievalInfo && idx === messages.length - 1 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}>
                    <Database size={15} style={{ color: '#818cf8', flexShrink: 0 }} />
                    <span>
                      {retrievalInfo.count > 0 ? (
                        <>
                          Retrieved <strong style={{ color: '#a5b4fc' }}>{retrievalInfo.count} chunk{retrievalInfo.count !== 1 ? 's' : ''}</strong> from{' '}
                          {retrievalInfo.sources.map((s, i) => (
                            <span key={i} style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              padding: '1px 8px',
                              borderRadius: '4px',
                              marginLeft: '4px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#c7d2fe',
                            }}>
                              <FileText size={11} />
                              {s}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span style={{ color: '#fbbf24' }}>No matching documents found — answering from general knowledge</span>
                      )}
                    </span>
                  </div>
                )}

                <div style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-color)',
                  padding: '16px',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  marginLeft: msg.role === 'user' ? 'auto' : undefined,
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>Sources:</strong>
                      <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                        {msg.sources.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                      {msg.confidence && <div style={{ marginTop: '4px' }}>Confidence: {(msg.confidence * 100).toFixed(1)}%</div>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about deployment, architecture, etc..."
            style={{ flex: 1 }}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>

      <div style={{ flex: 1 }}>
        <MCPStatus toolCalls={toolCalls} />
      </div>
    </div>
  );
}
