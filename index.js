require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect DB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

// Basic health
// Serve static client in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ ok: true, name: 'teamcollab-server' }));
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket events
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  // join room for team collaboration
  socket.on('joinTeam', ({ teamId, userId }) => {
    socket.join(`team_${teamId}`);
    console.log(`${userId} joined team ${teamId}`);
  });

  // Task updates
  socket.on('taskUpdated', (data) => {
    // broadcast to room
    if (data?.teamId) {
      io.to(`team_${data.teamId}`).emit('taskUpdated', data);
    }
  });

  // New chat message
  socket.on('newMessage', (data) => {
    if (data?.teamId) {
      io.to(`team_${data.teamId}`).emit('newMessage', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { io };
