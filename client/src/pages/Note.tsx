import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import CollaborativeEditor from '../components/CollaborativeEditor';
import VersionHistory from '../components/VersionHistory';
import { Note as NoteType, User } from '../types';

export default function Note() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [userNameSet, setUserNameSet] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    loadNote();
  }, [code]);

  const loadNote = async () => {
    if (!code) return;

    try {
      const fetchedNote = await api.getNote(code);
      setNote(fetchedNote);
    } catch (err) {
      setError('Note not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUserNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setUserNameSet(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading note...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Note Not Found</h2>
          <p className="text-gray-600 mb-4">
            The note you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!userNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            What's your name?
          </h2>
          <p className="text-gray-600 mb-6">
            This will be displayed to other collaborators
          </p>
          <form onSubmit={handleUserNameSubmit}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Home
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{note.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Users */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {activeUsers.length} online
                </span>
              </div>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Share Code'}
                </button>
              </div>

              {/* Version History Button */}
              <button
                onClick={() => setShowVersionHistory(true)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Versions
              </button>
            </div>
          </div>

          {/* Share Info */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Note Code:</span>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                {code}
              </code>
              <button
                onClick={handleCopyCode}
                className="text-blue-600 hover:text-blue-700"
              >
                Copy
              </button>
            </div>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleCopyUrl}
              className="text-blue-600 hover:text-blue-700"
            >
              Copy URL
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <CollaborativeEditor
              noteCode={code!}
              userName={userName}
              onUsersUpdate={setActiveUsers}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Active Collaborators
              </h3>
              <div className="space-y-2">
                {activeUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No users yet</p>
                ) : (
                  activeUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: user.color || '#666',
                        }}
                      />
                      <span className="text-gray-700">{user.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistory
          noteCode={code!}
          userName={userName}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}
