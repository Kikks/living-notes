import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Home() {
  const [noteTitle, setNoteTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const note = await api.createNote(noteTitle || 'Untitled Note');
      navigate(`/note/${note.code}`);
    } catch (err) {
      setError('Failed to create note. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.getNote(joinCode);
      navigate(`/note/${joinCode}`);
    } catch (err) {
      setError('Note not found. Please check the code and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            Living Notes
          </h1>
          <p className="text-xl text-gray-600">
            Collaborate in real-time. See cursors. Track versions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Note Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Create New Note
              </h2>
              <p className="text-gray-600">
                Start a new collaborative document
              </p>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label
                  htmlFor="noteTitle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Note Title (optional)
                </label>
                <input
                  type="text"
                  id="noteTitle"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="My Awesome Note"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Note'}
              </button>
            </form>
          </div>

          {/* Join Note Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Join Existing Note
              </h2>
              <p className="text-gray-600">
                Enter a note code to collaborate
              </p>
            </div>

            <form onSubmit={handleJoinNote} className="space-y-4">
              <div>
                <label
                  htmlFor="joinCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Note Code
                </label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter 10-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !joinCode}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Note'}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            ✨ Features: Real-time collaboration • Live cursors • Version history
          </p>
        </div>
      </div>
    </div>
  );
}
