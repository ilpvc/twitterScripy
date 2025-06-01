module.exports = {
    apps: [
        {
            name: 'twitter-scripy',
            script: './index.js',
            output: './logs/out.log',
            error: './logs/error.log',
            log: './logs/app.log',
        },
    ],
};
