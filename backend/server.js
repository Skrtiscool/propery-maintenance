const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const publicRoutes = require('./routes/public');
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const clientBuild = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuild, 'index.html'));
    }
  });
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.createDb();

    const isMemory = db.isMemoryMode();
    const sqlFile = isMemory ? 'init.pgmem.sql' : 'init.sql';
    const initSql = fs.readFileSync(path.join(__dirname, 'models', sqlFile), 'utf8');
    await db.query(initSql);

    const seedFile = isMemory ? 'seed.pgmem.sql' : 'seed.sql';
    const seedSql = fs.readFileSync(path.join(__dirname, 'models', seedFile), 'utf8');
    await db.query(seedSql);

    const workers = [
      { email: 'worker1', full_name: 'Alice Martinez' },
      { email: 'worker2', full_name: 'Bob Chen' },
      { email: 'worker3', full_name: 'Carlos Rivera' },
    ];
    const salt = await bcrypt.genSalt(10);
    const pw = await bcrypt.hash('password123', salt);
    for (const w of workers) {
      await db.query(
        `INSERT INTO users (email, password_hash, full_name, role, force_password_change)
         VALUES ($1, $2, $3, 'WORKER', false)
         ON CONFLICT (email) DO NOTHING`,
        [w.email, pw, w.full_name]
      );
    }

    console.log('Database initialized');
  } catch (err) {
    console.error('Database init error:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
