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
                    let ip = req.headers['x-forwarded-for'] ||
                            req.connection.remoteAddress ||
                            req.socket.remoteAddress ||
                            req.connection.socket.remoteAddress;
                    if (ip.indexOf(',') > -1) {
                        ip = ip.split(',');
                        ip = ip[0];
                    }

                    let ua = req.headers['user-agent'];
                    console.log(new Date(), '|', ip, '|', ua);
                    vConfig.getRedirectData(ip, ua, function (err, data) {
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
            case '/script':
                res.writeHead(200, {
                    'Content-Type': 'text/javascript',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
                });
                    let bk_ = query['bk'] || 'leon';
                    let os_ = query['os'] || 'ios';
                    let v_ = query['v'] || '1.0.0';

                if (!scriptsCache.hasOwnProperty(bk_ + '_' + os_ + '_' + v_)) {
                    try {
                        fs.access(fs.realpathSync(`./cordova/${bk_}`), fs.constants.F_OK, (err) => {
                            if (err) bk_ = 'leon';
                            fs.access(fs.realpathSync(`./cordova/${bk_}/script/${os_}`), fs.constants.F_OK, (err) => {
                                if (err) os_ = 'ios';
                                fs.access(fs.realpathSync(`./cordova/${bk_}/script/${os_}/${v_}.js`), fs.constants.F_OK, (err) => {
                                    if (err) v_ = '1.0.0';
                                    fs.readFile(fs.realpathSync(`./cordova/${bk_}/script/${os_}/${v_}.js`), function (err, data) {
                                        if (err) return res.end('{}');
                                        scriptsCache[bk_ + '_' + os_ + '_' + v_] = data;
                                        res.end(scriptsCache[bk_ + '_' + os_ + '_' + v_]);
                                    });
                                });
                            });
                        });
                    } catch (e) {
                        res.end('{}');
                    }
                } else {
                    res.end(scriptsCache[bk_ + '_' + os_ + '_' + v_]);
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
