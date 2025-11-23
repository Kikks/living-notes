const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  async createNote(title: string) {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    return response.json();
  },

  async getNote(code: string) {
    const response = await fetch(`${API_URL}/api/notes/${code}`);

    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }

    return response.json();
  },

  async createVersion(code: string, author: string) {
    const response = await fetch(`${API_URL}/api/notes/${code}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ author }),
    });

    if (!response.ok) {
      throw new Error('Failed to create version');
    }

    return response.json();
  },

  async getVersion(code: string, versionId: string) {
    const response = await fetch(`${API_URL}/api/notes/${code}/versions/${versionId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch version');
    }

    return response.json();
  },
};
