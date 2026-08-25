require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('JWT Auth API is running');
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
