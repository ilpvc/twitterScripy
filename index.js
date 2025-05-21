import express from 'express';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = 3000;

app.use('/', userRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
