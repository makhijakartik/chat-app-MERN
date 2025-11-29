import express from 'express';
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js'
import cookieParser from 'cookie-parser'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5001;


app.get('/',(req,res)=>{
    res.send("server is working")
})

app.use('/api/auth',authRoutes);
app.use('/api/message',messageRoutes);

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on ${PORT}`);
    connectDB();
});
