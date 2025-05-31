# 🎬 WatchParty - Real-time Movie Streaming Platform

A collaborative movie watching platform with real-time synchronization, built with React, Node.js, and WebSocket technology.

## 🚀 Features

- **🎥 Movie Streaming**: Browse and watch movies with multiple quality options
- **👥 Watch Parties**: Create or join synchronized watch sessions with friends
- **💬 Real-time Chat**: Live chat during watch parties
- **🔄 Video Synchronization**: Host controls (play/pause/seek) sync across all participants
- **🔗 Invite System**: Share room codes or send direct invitations
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔐 User Authentication**: Secure login and registration system
- **📺 Watchlist**: Save movies to watch later

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **WebSocket** for real-time features
- **ReactPlayer** for video playback
- **CSS3** with modern styling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **WebSocket (ws)** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd OOAD_PROJECT
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Copy the JWT configuration template
cp src/config/jwt.ts.example src/config/jwt.ts
```

#### Configure Environment Variables
Edit `backend/.env`:
```env
# Server Configuration
PORT=8081
NODE_ENV=development
SEED_DB=true

# Database - Update with your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/movie-watch-party

# JWT Security - IMPORTANT: Generate a secure secret!
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000
WS_MAX_CONNECTIONS=1000
```

#### Configure JWT
Edit `backend/src/config/jwt.ts` and update the JWT_SECRET to match your .env file:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-to-something-secure';
```

#### Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
```

#### Run Database Seeds (Optional)
The app will automatically seed sample movies when `SEED_DB=true` in .env.

#### Start Backend Server
```bash
npm run dev
```
Backend will run on `http://localhost:8081`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
```bash
# Copy the environment template (if exists)
cp .env.example .env  # Optional, as frontend .env has default values
```

The frontend `.env` should contain:
```env
# API Configuration
VITE_API_URL=http://localhost:8081/api

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8081
```

#### Start Frontend Development Server
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🎮 Usage

### 1. **User Registration/Login**
- Visit `http://localhost:5173`
- Register a new account or login with existing credentials
- The app includes automatic authentication handling

### 2. **Browse Movies**
- Explore the movie catalog on the homepage
- Use filters to find specific genres or ratings
- Click on any movie to view details

### 3. **Create a Watch Party**
- Select a movie and click "Create Party"
- Fill in party details (name, description, etc.)
- Share the generated room code with friends

### 4. **Join a Watch Party**
- Click "Join Party" in the navigation
- Enter the room code shared by your friend
- You'll be redirected to the synchronized watch session

### 5. **Watch Together**
- **Host Controls**: The party creator can control playback (play/pause/seek)
- **Real-time Sync**: All participants see the same video state
- **Live Chat**: Communicate during the movie
- **Participant List**: See who's currently watching

## 🏗️ Project Structure

```
OOAD_PROJECT/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT, and other configurations
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Authentication and other middleware
│   │   ├── routes/          # API route definitions
│   │   ├── websocket/       # WebSocket handlers and party management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions and helpers
│   │   ├── seeds/           # Database seed data
│   │   └── server.ts        # Main server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Environment Variables**: Sensitive data stored in environment files
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/filtered` - Get filtered movies

### Watch Parties
- `POST /api/parties` - Create a new party
- `GET /api/parties/:id` - Get party details
- `GET /api/parties/join/:inviteCode` - Join party by invite code
- `POST /api/parties/:id/leave` - Leave a party
- `DELETE /api/parties/:id` - Delete party (host only)

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Code Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **MongoDB Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running:
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
mongod  # Manual start
```

#### 2. **WebSocket Connection Failed**
```bash
WebSocket connection to 'ws://localhost:8081' failed
```
**Solutions**:
- Ensure backend server is running on port 8081
- Check if firewall is blocking the connection
- Verify WebSocket URL in frontend `.env`

#### 3. **JWT Authentication Errors**
```bash
Token verification failed
```
**Solutions**:
- Ensure JWT_SECRET is the same in both `.env` and `jwt.ts`
- Clear browser localStorage and login again
- Check token expiration settings

#### 4. **Port Already in Use**
```bash
Error: Port 8081 is already in use
```
**Solution**:
```bash
# Kill process using the port
lsof -ti:8081 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8081   # Windows (find PID and kill)

# Or change port in backend/.env
PORT=8082
```

#### 5. **Missing Dependencies**
```bash
Module not found
```
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add proper error handling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead**: [Your Name]
- **Contributors**: [Team Member Names]

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core watch party functionality
- **v1.1.0** - Added real-time chat and improved synchronization
- **v1.2.0** - Enhanced UI/UX and mobile responsiveness

---

**Happy Watching! 🍿**
