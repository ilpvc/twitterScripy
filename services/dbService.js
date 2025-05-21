import { MongoClient } from 'mongodb';
import config from "../config/config.js";

const uri = config.mongoUrl;

export async function insertTweets(tweets) {
    if (!tweets || tweets.length === 0) return;
    console.log('url', uri)
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        const database = client.db('twitter_db');
        const collection = database.collection('twitter');
        
        const operations = tweets.map(tweet => ({
            updateOne: {
                filter: { id: tweet.id },
                update: { $set: tweet },
                upsert: true
            }
        }));
        
        const insertResult = await collection.bulkWrite(operations);
        console.log('数据已成功更新/插入 MongoDB', insertResult);
    } catch (mongoError) {
        console.error('插入数据到 MongoDB 时出错:', mongoError);
        throw mongoError;
    } finally {
        await client.close();
    }
}

export async function getRecentTweet(userId) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('twitter_db');
        const collection = database.collection('twitter');
        
        const tweet = await collection.findOne(
            {
                'user.screenName': userId,
                'text': { $not: /^RT @/ }
            },
            { sort: { id: -1 } }
        );

        if (!tweet) {
            return { error: 'No tweets found for this user' };
        }

        return tweet;
    }catch (error) {
        console.error('Database error:', error);
    }
}