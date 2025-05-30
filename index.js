import express from 'express';
import userRouter from './routes/userRoutes.js';
import {scheduleJob, startRecentTweet} from "./services/jobService.js";
import {closeBrowser, getBrowser} from "./services/puppeteerService.js";
import config from 'dotenv'

config.config();
const app = express();
const port = 3000;

app.use('/static', express.static('images'));
app.use('/', userRouter);

app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    scheduleJob('TrumpDailyPosts')
    startRecentTweet('TrumpDailyPosts')
});

process.on('uncaughtException', async (err) => {
    console.error('未捕获的异常:', err);
    // 执行你想要的逻辑，例如日志记录、发送通知等
    await cleanupAndExit(err);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
    // 同样处理
    await cleanupAndExit(reason);
});

async function cleanupAndExit(error) {
    const errorBody = {
        time: new Date().toLocaleString(),
        error: error
    }
    console.log('执行清理逻辑...', errorBody);
    await fetch('https://n8n-lyb.zeabur.app/webhook-test/b04e5c37-1b16-4527-a061-84dc46b05d62',{
        method: 'POST',
        body: JSON.stringify(errorBody)
    })
    await closeBrowser()
    setTimeout(() => {
        process.exit(1); // 确保退出
    }, 1000);
}