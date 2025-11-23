import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import * as Y from 'yjs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store for notes and their Yjs documents
interface Note {
  id: string;
  code: string;
  title: string;
  createdAt: Date;
  ydoc: Y.Doc;
  versions: Version[];
  activeUsers: Set<string>;
}

interface Version {
  id: string;
  timestamp: Date;
  content: any;
  author: string;
}

const notes = new Map<string, Note>();

// Generate unique short code for sharing
function generateCode(): string {
  return nanoid(10);
}

// REST API endpoints
app.post('/api/notes', (req, res) => {
  const { title } = req.body;
  const id = nanoid();
  const code = generateCode();

  const ydoc = new Y.Doc();

  const note: Note = {
    id,
    code,
    title: title || 'Untitled Note',
    createdAt: new Date(),
    ydoc,
    versions: [],
    activeUsers: new Set()
  };

  notes.set(code, note);

  res.json({
    id: note.id,
    code: note.code,
    title: note.title,
    createdAt: note.createdAt
  });
});

app.get('/api/notes/:code', (req, res) => {
  const { code } = req.params;
  const note = notes.get(code);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  res.json({
    id: note.id,
    code: note.code,
    title: note.title,
    createdAt: note.createdAt,
    activeUsers: note.activeUsers.size,
    versions: note.versions.map(v => ({
      id: v.id,
      timestamp: v.timestamp,
      author: v.author
    }))
  });
});

app.get('/api/notes/:code/versions/:versionId', (req, res) => {
  const { code, versionId } = req.params;
  const note = notes.get(code);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const version = note.versions.find(v => v.id === versionId);

  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  res.json(version);
});

app.post('/api/notes/:code/versions', (req, res) => {
  const { code } = req.params;
  const { author } = req.body;
  const note = notes.get(code);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  // Get current content from Yjs document
  const ytext = note.ydoc.getText('content');
  const content = ytext.toJSON();

  const version: Version = {
    id: nanoid(),
    timestamp: new Date(),
    content,
    author: author || 'Anonymous'
  };

  note.versions.push(version);

  res.json({
    id: version.id,
    timestamp: version.timestamp,
    author: version.author
  });
});

// WebSocket handling for real-time collaboration
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let currentNoteCode: string | null = null;
  let userName: string = `User-${socket.id.slice(0, 4)}`;

  // Join a note room
  socket.on('join-note', (data: { code: string; userName?: string }) => {
    const { code, userName: providedName } = data;

    if (providedName) {
      userName = providedName;
    }

    const note = notes.get(code);

    if (!note) {
      socket.emit('error', { message: 'Note not found' });
      return;
    }

    currentNoteCode = code;
    note.activeUsers.add(socket.id);

    socket.join(code);

    // Send current state to the joining user
    const ytext = note.ydoc.getText('content');
    const state = Y.encodeStateAsUpdate(note.ydoc);

    socket.emit('note-joined', {
      noteId: note.id,
      code: note.code,
      title: note.title,
      state: Array.from(state),
      activeUsers: Array.from(note.activeUsers).map(id => ({
        id,
        name: id === socket.id ? userName : `User-${id.slice(0, 4)}`
      }))
    });

    // Notify others in the room
    socket.to(code).emit('user-joined', {
      userId: socket.id,
      userName
    });

    console.log(`User ${userName} joined note ${code}`);
  });

  // Handle Yjs updates
  socket.on('yjs-update', (data: { update: number[] }) => {
    if (!currentNoteCode) return;

    const note = notes.get(currentNoteCode);
    if (!note) return;

    // Apply update to the server's Yjs document
    const update = new Uint8Array(data.update);
    Y.applyUpdate(note.ydoc, update);

    // Broadcast to all other clients in the room
    socket.to(currentNoteCode).emit('yjs-update', {
      update: data.update,
      userId: socket.id
    });
  });

  // Handle cursor position updates
  socket.on('cursor-update', (data: { position: any; selection: any }) => {
    if (!currentNoteCode) return;

    socket.to(currentNoteCode).emit('cursor-update', {
      userId: socket.id,
      userName,
      position: data.position,
      selection: data.selection
    });
  });

  // Handle awareness updates (for collaboration cursor)
  socket.on('awareness-update', (data: { state: any }) => {
    if (!currentNoteCode) return;

    socket.to(currentNoteCode).emit('awareness-update', {
      userId: socket.id,
      userName,
      state: data.state
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    if (currentNoteCode) {
      const note = notes.get(currentNoteCode);

      if (note) {
        note.activeUsers.delete(socket.id);

        socket.to(currentNoteCode).emit('user-left', {
          userId: socket.id,
          userName
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
