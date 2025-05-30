import schedule from 'node-schedule';
import {getTw, getTwDetail} from './twitterService.js';
import {getRecentTweet} from './dbService.js';
import config from "../config/config.js";
import {isDev} from "../utils/appUtil.js";

const jobs = {};
const recentjobs = {};


export async function scheduleJob(userId) {
    console.log('scheduleJob:', userId);
    if (jobs[userId]) {
        return {error: 'Job already running for this user'};
    }

    // await getTw(userId);
    jobs[userId] = schedule.scheduleJob('*/1 * * * *', async () => {
        if (isDev()) {
            console.log('isDev，[job]拉取twitter数据', userId);
            return;
        }
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
    console.log('recentJob:', userId);
    if (recentjobs[userId]) {
        return {error: 'Job already running for this user'};
    }
    // 先缓存最新的推文id
    if (!isDev()){
        const tweet = await getRecentTweet(userId);
        recentTweets.set(tweet.user.screenName, tweet.id);
    }
    recentjobs[userId] = schedule.scheduleJob('*/30 * * * * *', async () => {
        if (isDev()) {
            console.log('isDev，[job]是否有新推文', userId);
            return
        }
        const tweet = await getRecentTweet(userId);

        if (recentTweets.get(tweet.user.screenName) !== tweet.id) {
            recentTweets.set(tweet.user.screenName, tweet.id);
            await getTwDetail(tweet.user.screenName, tweet.id)
            tweet.images = `http://${config.remoteAddr}/static/${tweet.user.screenName}_${tweet.id}.png`
            console.log('新的推文发送n8n:', JSON.stringify(tweet));
            await fetch('https://n8n-lyb.zeabur.app/webhook/2f8209da-8332-40e0-9409-54843e0e8dbf', {
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
    console.log('jobList:', jobs);
    console.log('recentJobList:', recentjobs);
    return {
        normal: jobList,
        recent: recentJobList
    }
}
