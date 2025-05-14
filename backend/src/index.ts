import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Basic route handler
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Watch Party API' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watch-party')
    .then(() => {
        console.info('MongoDB connected');
        app.listen(PORT, () => {
            console.info(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    }); 