import puppeteer from "puppeteer";

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

    await page.goto(`https://x.com/${userId}`);
    twitterHomePage.set(userId, page)
    return page;
}


export async function getRecentTwitterPage(userId){
    if (recentTweetsPage.get(userId)) {
        return recentTweetsPage.get(userId);
    }
    const browser = await getBrowser();
    const page = await browser.newPage();
    recentTweetsPage.set(userId, page)
    return page
}

export function setPageOnListener(key,callback) {
    pageListener.push({key,callback})
}