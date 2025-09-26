// src/app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { urlencoded } from 'express';

const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(cookieParser())
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
import { errorMiddleware } from './middlewares/error.middleware.js';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import chatRoute from './routes/chat.route.js';

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);


// app.use('/api/v1/auth',)
app.use(errorMiddleware);
export default app;