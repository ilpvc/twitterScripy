import {getDb} from "../utils/mongoUtil.js";


export async function insertTweets(tweets) {
    if (!tweets || tweets.length === 0) return;

    try {
        const database = await getDb('twitter_db');
        const collection = database.collection('twitter');

        const operations = tweets.map(tweet => ({
            updateOne: {
                filter: {id: tweet.id},
                update: {$set: tweet},
                upsert: true
            }
        }));

        const insertResult = await collection.bulkWrite(operations);
        console.ilog('数据已成功更新/插入 MongoDB', insertResult);
    } catch (mongoError) {
        console.ierror('插入数据到 MongoDB 时出错:', mongoError);
        throw mongoError;
    }
}

export async function getRecentTweet(userId) {
    try {
        const database = await getDb('twitter_db');
        const collection = database.collection('twitter');

        const tweet = await collection.findOne(
            {
                'user.screenName': userId,
                'text': {$not: /^RT @/}
            },
            {sort: {id: -1}}
        );

        if (!tweet) {
            return {error: 'No tweets found for this user'};
        }
        return tweet;
    } catch (error) {
        console.ierror('Database error:', error);
    }
}