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
const scriptsCache = {};

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
                    vConfig.getRedirectData(function (err, data) {
                        res.end(JSON.stringify(data));
                    });
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
            case '/script/index.js':
                res.writeHead(200, {
                    'Content-Type': 'text/javascript',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                    let bk = query['bk'] || 'leon';
                    let os = query['os'] || 'ios';
                    let v = query['v'] || '1.0.0';

                if (!scriptsCache.hasOwnProperty(bk + '_' + os + '_' + v)) {
                    let file = yield (next) => fs.readFile(`./cordova/${bk}/${os}/${v}.js`, next);
                    scriptsCache[bk + '_' + os + '_' + v] = file;
                }

                res.end(scriptsCache[bk + '_' + os + '_' + v]);
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
