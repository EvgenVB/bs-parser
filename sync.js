const co = require('co');
const PARSER_SOURCE = 'leonbets';
const REDIS_PREFIX = `BS:DATA:${PARSER_SOURCE}:`;
const Redis = require('redis');
const redis = Redis.createClient({ prefix: REDIS_PREFIX });
var https = require('https');
var fs = require('fs');

let imagesDoneCounter = 1;

redis.on("error", function (err) {
    console.log("Error " + err);
});

const Parser = require('./parser');
const clientOptions = {
    useCache: true,
    cacheDir: './cache',
    cacheExpires: 1000 * 60 * 60, // 1 hour
    retries: 5
};
const client = new Parser.Request(clientOptions);
const parser = Parser.getParser(PARSER_SOURCE, client);

co(function *() {
    const articles = yield parser.getArticles();
    if (!articles.success) {
        return;
    }

    for (let i = 0; i < articles.result.length; i++) {
        const a = articles.result[i];
        const id = a.id;
        const exists = yield (next) => redis.exists('article:' + id, next);
        if (!exists) {
            yield (next) => redis.zadd('list:items', a.parseTime, JSON.stringify(a), next);
            const article = yield parser.getArticle(a.link);
            yield (next) => redis.set('article:' + id, JSON.stringify(article), next);

            if (a.photo) {
                yield saveImage(a);
            }
        }
    }

    const mirror = yield parser.getMirror();
    yield (next) => redis.set('mirror', JSON.stringify(mirror), next);

    redis.quit();
}).catch((e) => {
    console.error(e);
    redis.quit();
});

const saveImage = function (a) {
    var image = fs.createWriteStream(`./cache/images/${a.id}.jpg`);
    return new Promise((resolve, reject)=> {
        https.get('https:' + a.photo, (request) => {
            request.pipe(image);
            image.once('finish', () => {
                resolve();
            });
        }).on('error', reject)
    })
};