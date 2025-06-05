import schedule from 'node-schedule';
import {getTw, getTwDetail} from './twitterService.js';
import {getRecentTweet} from './dbService.js';
import config from "../config/config.js";
import {isDev} from "../utils/appUtil.js";
import {getSupabaseUrl} from "../utils/urlUtil.js";
import {getFileUrl} from "../utils/s3Utils.js";

const jobs = {};
const recentjobs = {};


export async function scheduleJob(userId) {
    console.ilog('scheduleJob:', userId);
    if (jobs[userId]) {
        return {error: 'Job already running for this user'};
    }

    // await getTw(userId);
    jobs[userId] = schedule.scheduleJob('*/1 * * * *', async () => {
        if (isDev()) {
            console.ilog('isDev，[job]拉取twitter数据', userId);
            return;
        }
        console.ilog('[job]拉取twitter数据', userId);
        await getTw(userId);
    });

    return {success: true};
}

export async function cancelJob(userId) {
    if (!jobs[userId]) {
        return {error: 'No running job for this user'};
    }

    jobs[userId].cancel();
    delete jobs[userId];
    return {success: true};
}

const recentTweets = new Map();

export async function startRecentTweet(userId) {
    console.ilog('recentJob:', userId);
    if (recentjobs[userId]) {
        return {error: 'Job already running for this user'};
    }
    // 先缓存最新的推文id
    // TODO 如果是没有推文的用户会报错，后续处理
    const tweet = await getRecentTweet(userId) || {id: 0,user: {screenName: ''}};
    recentTweets.set(tweet.user.screenName, tweet.id);

    recentjobs[userId] = schedule.scheduleJob('*/30 * * * * *', async () => {

        if (isDev()) {
            console.ilog('isDev,[job]是否有新推文',userId);
            return
        }
        console.ilog('[job]是否有新推文', userId);
        const tweet = await getRecentTweet(userId);

        if (recentTweets.get(tweet.user.screenName) !== tweet.id) {
            recentTweets.set(tweet.user.screenName, tweet.id);
            const detailRes = await getTwDetail(tweet.user.screenName, tweet.id)
            console.log('detailRes: ',detailRes)
            if (config.imageStorageType === 'local'){
                tweet.images = `http://${config.remoteAddr}/static/${tweet.user.screenName}_${tweet.id}.png`
            }else if (config.imageStorageType === 's3'){
                tweet.images = getSupabaseUrl(await getFileUrl(detailRes))
            }

            tweet.isDev = isDev()
            console.ilog('新的推文发送n8n:', JSON.stringify(tweet));
            const url = 'https://n8n-lyb.zeabur.app/webhook/2f8209da-8332-40e0-9409-54843e0e8dbf'
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(tweet)
            })
        }
    });

    return {success: true};
}

export async function stopRecentTweet(userId) {
    if (!recentjobs[userId]) {
        return {error: 'No running job for this user'};
    }
    recentjobs[userId].cancel();
    delete recentjobs[userId];
    return {success: true};
}

export async function getJobList() {
    const jobList = Object.keys(jobs)
    const recentJobList = Object.keys(recentjobs)
    console.ilog('jobList:', jobs);
    console.ilog('recentJobList:', recentjobs);
    return {
        normal: jobList,
        recent: recentJobList
    }
}
