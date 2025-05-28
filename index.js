import express from 'express';
import userRouter from './routes/userRoutes.js';
import {scheduleJob} from "./services/jobService.js";
import {closeBrowser, getBrowser} from "./services/puppeteerService.js";

const app = express();
const port = 3000;

app.use('/static', express.static('images'));
app.use('/', userRouter);

app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    await scheduleJob('TrumpDailyPosts')
});

process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    // 执行你想要的逻辑，例如日志记录、发送通知等
    cleanupAndExit();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
    // 同样处理
    cleanupAndExit();
});

async function cleanupAndExit() {
    console.log('执行清理逻辑...');
    await closeBrowser()
    setTimeout(() => {
        process.exit(1); // 确保退出
    }, 1000);
}