const co = require('co');
const http = require('http');
const fs = require('fs');
const url = require("url");
const path = require("path");
const querystring = require('querystring');
const PARSER_SOURCE = 'leonbets';
const REDIS_PREFIX = `BS:DATA:${PARSER_SOURCE}:`;
const Redis = require('redis');
const redis = Redis.createClient({ prefix: REDIS_PREFIX });
const config = require('./config');

redis.on("error", function (err) {
    console.log("Error " + err);
});

http.createServer(function (req, res) {
    co(function *() {
        let uri = url.parse(req.url);
        const query = querystring.parse(uri.query);
        switch (uri.pathname) {
            case '/articles':
                res.writeHead(200, {
                    'Content-Type': 'javascript/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                let skip = 0;
                if (query['skip']) {
                    skip = query['skip'];
                }

                let count = yield (next) => redis.zcount('list:items', 0, new Date() / 1, next);
                let list = yield (next) => redis.zrevrange('list:items', parseInt(skip), parseInt(skip) + 4, next);
                list = list.map(l => filterArticle(JSON.parse(l)));
                res.end(JSON.stringify({ items: list, count }));

            function filterArticle(json) {
                let { id, photoDesc, date, oddsTitle, odds, previewText } = json;
                return { id, photoDesc, date, oddsTitle, odds, previewText }
            }

                break;
            case '/article':
                res.writeHead(200, {
                    'Content-Type': 'javascript/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                if (query['id']) {
                    let article = yield (next) => redis.get(`article:${query['id']}`, next);
                    res.end(article);
                } else {
                    res.end('{}');
                }
                break;
            case '/data':
                res.writeHead(200, {
                    'Content-Type': 'javascript/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                    let redirect = false;
                    let bk = query['bk'] || 'leon';
                    let bkConfig = config[bk];
                    let os = query['os'] || 'ios';
                    let osConfig = bkConfig[os];
                    let v = query['v'] || '1.0.0';
                    let vConfig = osConfig[v] || osConfig['1.0.0'];
                    redirect = vConfig.redirect;
                if (!redirect) {
                    res.end('{success: false}');
                } else {
                    let mirror = yield (next) => redis.get('mirror', next);
                    mirror = JSON.parse(mirror);
                    res.end(JSON.stringify(vConfig.getRedirectData()));
                }

                break;
            case '/images/':
                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                if (query['id']) {
                    try {
                        yield (next) => fs.access('./cache/images/' + query['id'] + '.jpg', fs.constants.R_OK, next);
                        fs.createReadStream('./cache/images/' + query['id'] + '.jpg').pipe(res);
                    } catch (e) {
                        console.error(e);
                        res.end('');
                    }
                } else {
                    res.end('');
                }
                break;
            case '/reg':
                res.writeHead(200, {
                    'Content-Type': 'javascript/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                fs.appendFile(`./cache/regs_${query['bk']}_${query['os']}.csv`, `${new Date() / 1},"${query['v']}","${query['bh']}"\n`, function() {});
                res.end('{}');
                break;
            default:
                res.writeHead(200, {
                    'Content-Type': 'javascript/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                res.end('{}');
                break;
        }

    }).catch(e => {
        console.error(e);
    });
}).listen(3000);
