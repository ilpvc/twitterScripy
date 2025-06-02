import { MongoClient } from 'mongodb';
import config from "../config/config.js";

const clients = {}; // 以 mongoUrl 为 key 缓存 client 实例

const localMongo = 'localMongo'

export async function getMongoClient() {
    const uri = config.mongoUrl;

    if (!clients[localMongo]) {
        const client = new MongoClient(uri, {
            // 可调节连接池参数
            maxPoolSize: 10,   // 最大连接数
            minPoolSize: 1,    // 最小连接数
        });

        await client.connect();
        clients[localMongo] = client;
        console.ilog('[MongoDB] Connected and cached client');
    }

    return clients[localMongo];
}

export async function getDb(databaseName) {
    const client = await getMongoClient();
    return client.db(databaseName);
}

export async function clearDB(databaseName) {
    const db = await getDb(databaseName); // 替换为实际数据库名
    const now = new Date();
    const result = await db.collection('tweets').deleteMany({ createdAt: { $lt: now } });
    console.ilog('[MongoDB] Deleted:', result.deletedCount);
}

export async function closeClient(){
    const client = await getMongoClient();
    client.close();
}
