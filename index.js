const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('./config/logger')
require('dotenv').config();
const env = require('./config/validateEnv');

const cors = require('cors');
const auth = require('./routes/authentication.routes');
const dashboard = require('./routes/dashboard.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); 
    }
};

// Connect to the database
connectDB();

// Routes
app.use('/api/auth', auth);
app.use('/api/dashboard', dashboard);

app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
