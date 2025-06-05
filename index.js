import 'dotenv/config.js'
import express from 'express';
import userRouter from './routes/userRoutes.js';
import {scheduleJob, startRecentTweet} from "./services/jobService.js";
import {closeBrowser} from "./services/puppeteerService.js";
import {getMongoClient} from "./utils/mongoUtil.js";
import cors from 'cors';
import {isDev} from "./utils/appUtil.js";
import addIsDevField from "./middleware/addIsDevField.js";
import './utils/iLog.js';
import config from "./config/config.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(addIsDevField)
app.use('/static', express.static('images'));
app.use('/', userRouter);

const defaultStartUser = isDev() ? config.autoStartUser.dev : config.autoStartUser.prod;

app.listen(port, async () => {
    console.ilog(`Server is running at http://localhost:${port}`);
    for (const userId of defaultStartUser) {
        scheduleJob(userId)
        startRecentTweet(userId)
    }
});

process.on('uncaughtException', async (err) => {
    console.ierror('未捕获的异常:', err);
    // 执行你想要的逻辑，例如日志记录、发送通知等
    await cleanupAndExit(err);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.ierror('未处理的 Promise 拒绝:', reason);
    console.ierror('Promise:', promise);
    // 同样处理
    await cleanupAndExit(reason);
});

async function cleanupAndExit(error) {
    const errorBody = {
        time: new Date().toLocaleString(),
        env: process.env.NODE_ENV,
        error: error
    }
    console.ilog('执行清理逻辑...', errorBody);
    try {
        const url = 'https://n8n-lyb.zeabur.app/webhook/b04e5c37-1b16-4527-a061-84dc46b05d62'
        await fetch(url,{
            method: 'POST',
            body: JSON.stringify(errorBody)
        })
        await closeBrowser()
        setTimeout(() => {
            process.exit(1); // 确保退出
        }, 1000);
    } catch (err){
        console.ierror('清理逻辑执行失败:', err);
        process.exit(1); // 确保退出
    }
}

process.on('SIGINT', async () => {
    const client = await getMongoClient();
    if (client) {
        await client.close();
        console.ilog('MongoClient closed on SIGINT');
    }
    process.exit();
});
