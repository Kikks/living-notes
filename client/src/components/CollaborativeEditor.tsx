import { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { io, Socket } from 'socket.io-client';
import { getUserColor } from '../utils/colors';

interface CollaborativeEditorProps {
  noteCode: string;
  userName: string;
  onUsersUpdate: (users: any[]) => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CollaborativeEditor({
  noteCode,
  userName,
  onUsersUpdate,
}: CollaborativeEditorProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [connected, setConnected] = useState(false);
  
  // Create awareness instance
  const awareness = useMemo(() => new Awareness(ydoc), [ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable history as Yjs handles it
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: { awareness, doc: ydoc } as any,
        user: {
          name: userName,
          color: getUserColor(userName),
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
    },
  });

  useEffect(() => {
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);

      // Join the note room
      newSocket.emit('join-note', { code: noteCode, userName });
      
      // Set local awareness state
      awareness.setLocalState({
        name: userName,
        color: getUserColor(userName),
      });
    });

    newSocket.on('note-joined', (data: any) => {
      console.log('Joined note:', data);

      // Apply initial state
      if (data.state) {
        const state = new Uint8Array(data.state);
        Y.applyUpdate(ydoc, state);
      }

      // Update active users
      if (data.activeUsers) {
        onUsersUpdate(data.activeUsers);
      }
    });

    newSocket.on('yjs-update', (data: { update: number[]; userId: string }) => {
      const update = new Uint8Array(data.update);
      Y.applyUpdate(ydoc, update);
    });

    newSocket.on('user-joined', (data: { userId: string; userName: string }) => {
      console.log('User joined:', data);
      // You could show a notification here
    });

    newSocket.on('user-left', (data: { userId: string; userName: string }) => {
      console.log('User left:', data);
      // You could show a notification here
    });

    newSocket.on('awareness-update', (data: any) => {
      // Handle awareness updates from other users
      if (data.state && data.userId) {
        awareness.setLocalStateField('clients', {
          ...awareness.getStates().get(data.userId),
          [data.userId]: data.state,
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [noteCode, userName, ydoc, onUsersUpdate, awareness]);

  // Send updates to the server
  useEffect(() => {
    if (!socket || !ydoc) return;

    const updateHandler = (update: Uint8Array, origin: any) => {
      if (origin !== socket) {
        socket.emit('yjs-update', { update: Array.from(update) });
      }
    };

    ydoc.on('update', updateHandler);

    return () => {
      ydoc.off('update', updateHandler);
    };
  }, [socket, ydoc]);

  // Send awareness updates
  useEffect(() => {
    if (!socket || !awareness) return;

    const awarenessChangeHandler = () => {
      const states = awareness.getStates();
      socket.emit('awareness-update', {
        state: awareness.getLocalState(),
      });
    };

    awareness.on('change', awarenessChangeHandler);

    return () => {
      awareness.off('change', awarenessChangeHandler);
    };
  }, [socket, awareness]);

  if (!editor) {
    return <div className="p-4">Loading editor...</div>;
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} className="min-h-[500px]" />
      </div>
    </div>
  );
}

function MenuBar({ editor }: { editor: any }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('bold')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('italic')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('bulletList')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('orderedList')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Numbered List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('codeBlock')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Code Block
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive('blockquote')
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        Quote
      </button>
    </div>
  );
}
