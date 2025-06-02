import { Router } from 'express';
import { getTw } from '../services/twitterService.js';
import {scheduleJob, cancelJob, startRecentTweet, stopRecentTweet, getJobList} from '../services/jobService.js';
import { getRecentTweet } from '../services/dbService.js';

const router = Router();

// const recentTweets = new Map();

router.get('/user/recent', async (req, res) => {
    const screenName = req.query.id;
    if (!screenName) {
        return res.status(400).send('id parameter is required');
    }
    const tweet = await getRecentTweet(screenName)
    res.send(tweet);
});

router.get('/job/start', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('userId is required');
    }

    const result = await scheduleJob(userId);
    if (result.error) {
        return res.status(400).send(result.error);
    }

    res.send({
        message: `Job started： ${userId}`
    });
});

router.get('/job/stop', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('userId is required');
    }

    const result = await cancelJob(userId);
    if (result.error) {
        return res.status(400).send(result.error);
    }

    res.send({
        message: `Job stopped：${userId}`
    });
});


router.get('/job/recent/start', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('userId is required');
    }
    const result = await startRecentTweet(userId);
    if (result.error) {
        return res.status(400).send(result.error);
    }
    res.send({
        message: `Job started：${userId}`
    });
})

router.get('/job/recent/stop', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('userId is required');
    }
    const result = await stopRecentTweet(userId);
    if (result.error) {
        return res.status(400).send(result.error);
    }
    res.send({
        message: `Job stopped：${userId}`
    });
})

router.get('/job/list', async (req, res) => {
        const jobs = await getJobList();
        res.send(jobs);
})

router.get('/images', async (req, res) => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const imagesDir = path.join(process.cwd(), 'images');
    try {
        const files = await fs.readdir(imagesDir);
        const imageUrls = files.map(file => `http://localhost:3000/static/${file}`);
        res.send(imageUrls);
    } catch (err) {
        res.status(500).send('无法读取图片目录');
    }
});

export default router;