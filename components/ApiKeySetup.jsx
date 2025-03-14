import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ApiKeySetup() {
  const { data: session } = useSession();
  const [notionKey, setNotionKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/keys/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notionKey: notionKey || undefined,
          claudeKey: claudeKey || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save keys');
      }
      
      setMessage('API keys saved successfully!');
      setNotionKey('');
      setClaudeKey('');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }
  
  if (!session) {
    return <div>Please sign in to manage API keys</div>;
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">API Keys Setup</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notion API Key
          </label>
          <input
            type="password"
            value={notionKey}
            onChange={(e) => setNotionKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Notion API key"
          />
          <p className="mt-1 text-xs text-gray-500">
            Get your key from <a href="https://www.notion.so/my-integrations" className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">notion.so/my-integrations</a>
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Claude API Key
          </label>
          <input
            type="password"
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Claude API key"
          />
          <p className="mt-1 text-xs text-gray-500">
            Get your key from <a href="https://console.anthropic.com/" className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">console.anthropic.com</a>
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save API Keys'}
        </button>
      </form>
    </div>
  );
}
