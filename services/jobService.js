import schedule from 'node-schedule';
import { getTw } from './twitterService.js';
import { getRecentTweet } from './dbService.js';

const jobs = {};
const recentjobs = {};



export async function scheduleJob(userId) {
    console.log('scheduleJob:', userId);
    if (jobs[userId]) {
        return { error: 'Job already running for this user' };
    }
    
    await getTw(userId);
    jobs[userId] = schedule.scheduleJob('*/10 * * * *', async () => {
        await getTw(userId);
    });
    
    return { success: true };
}

export async function cancelJob(userId) {
    if (!jobs[userId]) {
        return { error: 'No running job for this user' };
    }
    
    jobs[userId].cancel();
    delete jobs[userId];
    return { success: true };
}

const recentTweets = new Map();

export async function startRecentTweet(userId) {
    if (recentjobs[userId]) {
        return { error: 'Job already running for this user' };
    }
    
    const tweet = await getRecentTweet(userId);

    if(recentTweets.get(tweet.user.screenName)!==tweet.id){
        recentTweets.set(tweet.user.screenName, tweet.id);
        console.log('新的推文发送n8n:', tweet);
        await fetch('https://n8n-lyb.zeabur.app/webhook/2f8209da-8332-40e0-9409-54843e0e8dbf',{
            method: 'POST',
            body: JSON.stringify(tweet)
        })
        // todo 发送消息到你n8m
    }
    recentjobs[userId] = schedule.scheduleJob('*/5 * * * * *', async () => {
        const tweet = await getRecentTweet(userId);

        if(recentTweets.get(tweet.user.screenName)!==tweet.id){
            recentTweets.set(tweet.user.screenName, tweet.id);
            console.log('新的推文发送n8n:', tweet);
            await fetch('https://n8n-lyb.zeabur.app/webhook/2f8209da-8332-40e0-9409-54843e0e8dbf',{
                method: 'POST',
                body: JSON.stringify(tweet)
            })
            // todo 发送消息到你n8m
        }   
     });
    
    return { success: true };
}

export async function stopRecentTweet(userId) {
    if (!recentjobs[userId]) {
        return { error: 'No running job for this user' };
    }
    recentjobs[userId].cancel();
    delete recentjobs[userId];
    return { success: true };
}