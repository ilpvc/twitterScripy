import express from 'express';
import userRouter from './routes/userRoutes.js';
import {scheduleJob, startRecentTweet} from "./services/jobService.js";
import {closeBrowser, getBrowser} from "./services/puppeteerService.js";
import {getMongoClient} from "./utils/mongoUtil.js";
import config from 'dotenv'
import {isDev} from "./utils/appUtil.js";
import { loggerMiddleware, errorLogStreamInstance } from './utils/logger.js';


config.config();
const app = express();
const port = 3000;

app.use(loggerMiddleware);
app.use((err, req, res, next) => {
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.stack || err}\n`;
    errorLogStreamInstance.write(logLine);
    res.status(500).send('服务器内部错误');
});

app.use((err, req, res, next) => {
    console.log('req:', req);
    console.log('res:', res);
    next()
})

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
    console.error('Promise:', promise);
    // 同样处理
    await cleanupAndExit(reason);
});

async function cleanupAndExit(error) {
    const errorBody = {
        time: new Date().toLocaleString(),
        env: process.env.NODE_ENV,
        error: error
    }
    console.log('执行清理逻辑...', errorBody);
    try {
        const url = isDev()?'https://n8n-lyb.zeabur.app/webhook-test/b04e5c37-1b16-4527-a061-84dc46b05d62':
            'https://n8n-lyb.zeabur.app/webhook/b04e5c37-1b16-4527-a061-84dc46b05d62'
        await fetch(url,{
            method: 'POST',
            body: JSON.stringify(errorBody)
        })
        await closeBrowser()
        setTimeout(() => {
            process.exit(1); // 确保退出
        }, 1000);
    } catch (err){
        console.error('清理逻辑执行失败:', err);
        process.exit(1); // 确保退出
    }
}

process.on('SIGINT', async () => {
    const client = await getMongoClient();
    if (client) {
        await client.close();
        console.log('MongoClient closed on SIGINT');
    }
    process.exit();
});
