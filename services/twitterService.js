import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTweetInfo } from '../utils/twitter.js';
import { insertTweets } from './dbService.js';
import { getRecentTwitterPage, getTwitterHomePage, setPageOnListener} from "./puppeteerService.js";
import imageStorage from '../utils/imageStorage.js';
import config from '../config/config.js';

export async function getTw(userId) {
    try {
        let content = '';
        let contentIds = [];
        let max = '';
        let resultContent = [];
        setPageOnListener('response', async (response) => {
            const status = response.status();
            if (status >= 300 && status < 400) {
                console.ilog(`重定向响应，跳过获取内容: ${response.url()}`);
                return;
            }

            const url = response.url();
            if (url.includes('UserTweets')) {
                const json = await response.json();
                console.ilog('JSON 响应:', json.data.user.result);
                const instruction = json.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                content = instruction ? instruction.entries : [];

                content.forEach(element => {
                    contentIds.push(element.entryId.split('-')[1]);
                });

                max = contentIds.reduce((a, b) => a.length > b.length || (a.length === b.length && a > b) ? a : b);
                resultContent = extractTweetInfo(content);
                await insertTweets(resultContent);
                console.ilog('max', max);
            }
        })
        const page = await getTwitterHomePage(userId);
        await page.reload()
        console.ilog('content数量：', content.length);
        return resultContent;
    } catch (e) {
        console.ilog(e);
        throw e;
    }
}



export async function getTwDetail(userId, tweetId) {
    try {
        const page = await getRecentTwitterPage(userId)
        await page.goto(`https://x.com/${userId}/status/${tweetId}`);
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('页面加载超时（15秒）'));
            }, 15000);
        });

        await Promise.race([
            page.waitForSelector('article[data-testid="tweet"]'),
            timeoutPromise
        ]);

        const article = await page.$('article[data-testid="tweet"]');
        console.ilog('article', article);
        if (article) {
            return await imageStorage.save({
                userId,
                tweetId,
                element: article,
                storageType: config.imageStorageType
            });
        }
    } catch (e) {
        console.ilog(e);
    }
}