import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { Version } from '../types';

interface VersionHistoryProps {
  noteCode: string;
  userName: string;
  onClose: () => void;
}

export default function VersionHistory({
  noteCode,
  userName,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [noteCode]);

  const loadVersions = async () => {
    try {
      const note = await api.getNote(noteCode);
      setVersions(note.versions || []);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    setCreating(true);
    try {
      await api.createVersion(noteCode, userName);
      await loadVersions();
    } catch (error) {
      console.error('Failed to create version:', error);
      alert('Failed to create version. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleViewVersion = async (version: Version) => {
    try {
      const fullVersion = await api.getVersion(noteCode, version.id);
      setSelectedVersion(fullVersion);
    } catch (error) {
      console.error('Failed to load version details:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Version History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading versions...
            </div>
          ) : selectedVersion ? (
            /* Version Details View */
            <div>
              <button
                onClick={() => setSelectedVersion(null)}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                ← Back to versions
              </button>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600">
                  Created by <span className="font-medium">{selectedVersion.author}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(selectedVersion.timestamp)}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {JSON.stringify(selectedVersion.content, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            /* Versions List View */
            <>
              <div className="mb-4">
                <button
                  onClick={handleCreateVersion}
                  disabled={creating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {creating ? 'Creating Snapshot...' : '+ Create Snapshot'}
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Save the current state of your note
                </p>
              </div>

              {versions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>No versions saved yet</p>
                  <p className="text-sm mt-2">
                    Create your first snapshot to track changes
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      onClick={() => handleViewVersion(version)}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 cursor-pointer transition-colors border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {formatDate(version.timestamp)}
                          </div>
                          <div className="text-sm text-gray-600">
                            by {version.author}
                          </div>
                        </div>
                        <div className="text-gray-400">→</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
