export default {
    // mongoUrl: 'mongodb://root:123456@127.0.0.1:27017'
    mongoUrl: 'mongodb://root:123456@192.168.3.34:27017',
    remoteAddr: '150.158.176.172:20002',
    imageStorageType: 's3', // 支持 local/s3

    autoStartUser: {
        dev: ['CatriceJes47876'],
        prod: ['TrumpDailyPosts']
    }
}