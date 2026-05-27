require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const jobRoutes = require('./routes/jobs');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const auditRoutes = require('./routes/audit');
const { authenticate } = require('./middleware/auth');
const { auditLog } = require('./middleware/audit');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/candidates', authenticate, auditLog(io), candidateRoutes);
app.use('/api/applications', authenticate, auditLog(io), applicationRoutes);
app.use('/api/interviews', authenticate, auditLog(io), interviewRoutes);
app.use('/api/jobs', authenticate, auditLog(io), jobRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/audit', authenticate, auditRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
