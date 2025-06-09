import puppeteer from "puppeteer";
import {sendAlertEmail} from "../api/n8n.js";

let browser = null;
let twitterHomePage = new Map();
let recentTweetsPage = new Map();
let pageListener = []

export async function getBrowser() {
    if (browser) {
        return browser;
    }
    console.ilog('start Browser');
    browser = await puppeteer.launch({
        headless: false,
        userDataDir: 'C:\\temp\\chrome-debug'
    });
    return browser;
}


export async function closeBrowser() {
    await browser.close();
    console.ilog('browser closed');
}

export async function getTwitterHomePage(userId) {
    if (twitterHomePage.get(userId)) {
        return twitterHomePage.get(userId);
    }
    const browser = await getBrowser();
    const page = await browser.newPage();
    for (let item of pageListener) {
        page.on(item.key, item.callback)
    }

    let retryCount = 0;
    while (retryCount < 3) {
        try {
            await page.goto(`https://x.com/${userId}`, { timeout: 30000 });
            twitterHomePage.set(userId, page);
            return page;
        } catch (error) {
            retryCount++;
            if (retryCount === 3) {
                console.ierror(`Failed to load Twitter page after 3 attempts: ${error}`);
                await sendAlertEmail({
                    time: new Date().toLocaleString(),
                    env: process.env.NODE_ENV,
                    error: error
                })
                throw error;
            }
            console.warn(`Retry ${retryCount} loading Twitter page for user ${userId}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}


export async function getRecentTwitterPage(userId){
    if (recentTweetsPage.get(userId)) {
        return recentTweetsPage.get(userId);
    }
    const browser = await getBrowser();
    const page = await browser.newPage();

    let retryCount = 0;
    while (retryCount < 3) {
        try {
            await page.goto(`https://x.com/${userId}/with_replies`, { timeout: 30000 });
            recentTweetsPage.set(userId, page);
            return page;
        } catch (error) {
            retryCount++;
            if (retryCount === 3) {
                console.ierror(`Failed to load recent tweets page after 3 attempts: ${error}`);
                await sendAlertEmail({
                    time: new Date().toLocaleString(),
                    env: process.env.NODE_ENV,
                    error: error
                })
                throw error;
            }
            console.warn(`Retry ${retryCount} loading recent tweets for user ${userId}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

export function setPageOnListener(key,callback) {
    pageListener.push({key,callback})
}