# Living Notes 📝

A modern, real-time collaborative note-taking application where you can see other users' cursors, track version history, and collaborate seamlessly.

![Living Notes](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit the same note simultaneously
- **Live Cursors**: See exactly where other collaborators are working
- **Version History**: Create snapshots and track changes over time
- **Share with Ease**: Generate unique codes to share notes instantly
- **Rich Text Editing**: Full-featured editor with formatting options
- **Clean, Modern UI**: Built with Tailwind CSS for a sleek experience
- **No Auth Required**: Jump right in and start collaborating

## 🚀 Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite** - Fast, modern development
- **Tailwind CSS** - Utility-first styling
- **Tiptap** - Extensible rich text editor
- **Yjs** - CRDT-based real-time collaboration
- **Socket.io Client** - WebSocket communication
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - Server framework
- **Socket.io** - Real-time bidirectional communication
- **TypeScript** - Type-safe backend code
- **Yjs** - Document synchronization

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd living-notes
   ```

2. **Install dependencies**

   For the backend:
   ```bash
   cd server
   npm install
   ```

   For the frontend:
   ```bash
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Client (create `client/.env`):
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the development servers**

   In one terminal, start the backend:
   ```bash
   cd server
   npm run dev
   ```

   In another terminal, start the frontend:
   ```bash
   cd client
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## 📖 How to Use

### Creating a New Note

1. Go to the homepage
2. Enter a title for your note (optional)
3. Click "Create Note"
4. You'll be redirected to your new collaborative note
5. Share the note code with others to collaborate

### Joining an Existing Note

1. Get a note code from someone
2. On the homepage, enter the code in "Join Existing Note"
3. Click "Join Note"
4. Enter your name when prompted
5. Start collaborating!

### Version History

1. While editing a note, click the "Versions" button
2. Click "+ Create Snapshot" to save the current state
3. View previous versions by clicking on them
4. Each version shows who created it and when

### Collaboration Features

- **Live Editing**: Changes appear instantly for all users
- **Cursor Tracking**: See colored cursors showing where others are working
- **Active Users**: View who's currently online in the sidebar
- **Real-time Sync**: Uses Yjs CRDTs to handle conflicts automatically

## 🏗️ Project Structure

```
living-notes/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── CollaborativeEditor.tsx
│   │   │   └── VersionHistory.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx
│   │   │   └── Note.tsx
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   │   ├── api.ts
│   │   │   └── colors.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
│
└── server/                # Backend Node.js application
    ├── src/
    │   └── index.ts       # Main server file
    ├── package.json
    └── tsconfig.json
```

## 🔧 API Endpoints

### REST API

- `POST /api/notes` - Create a new note
- `GET /api/notes/:code` - Get note details
- `POST /api/notes/:code/versions` - Create a version snapshot
- `GET /api/notes/:code/versions/:versionId` - Get version details

### WebSocket Events

**Client → Server:**
- `join-note` - Join a note room
- `yjs-update` - Send document updates
- `awareness-update` - Send cursor position

**Server → Client:**
- `note-joined` - Confirmation with initial state
- `yjs-update` - Document updates from other users
- `awareness-update` - Cursor updates from other users
- `user-joined` - New user joined notification
- `user-left` - User left notification

## 🎨 Customization

### Adding New Editor Features

Edit `client/src/components/CollaborativeEditor.tsx` and add Tiptap extensions:

```typescript
import NewExtension from '@tiptap/extension-new-feature';

const editor = useEditor({
  extensions: [
    StarterKit,
    NewExtension,
    // ... other extensions
  ],
});
```

### Styling

The app uses Tailwind CSS. Customize colors and theme in:
- `client/tailwind.config.js`
- `client/src/index.css`

## 🚢 Production Deployment

### Build the frontend
```bash
cd client
npm run build
```

### Build the backend
```bash
cd server
npm run build
```

### Start production server
```bash
cd server
npm start
```

Serve the built frontend files from `client/dist` using a static file server or CDN.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Known Issues

- Version history stores content in memory (consider adding database persistence)
- No user authentication (notes are accessible to anyone with the code)
- No note deletion feature yet

## 🔮 Future Enhancements

- [ ] Persistent storage (PostgreSQL/MongoDB)
- [ ] User authentication and permissions
- [ ] Note templates
- [ ] Export to PDF/Markdown
- [ ] Rich media support (images, videos)
- [ ] Comments and suggestions
- [ ] Dark mode
- [ ] Mobile app

## 💬 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using modern web technologies
