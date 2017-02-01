const fs = require('fs');
const path = require('path');
const util = require('util');

const userAgent = {
    'keep-alive': true,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:49.0) Gecko/20100101 Firefox/49.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'cookie': ''
    }
};

module.exports = class Request {

    constructor(options) {
        Request.validateCacheDir(options);
        this._options = options;
        this._options.userAgent = this._options.userAgent || userAgent;
        var Client = require('node-rest-client').Client;
        this._client = new Client();
        this._cookies = {};
    }

    static validateCacheDir(options) {
        options.useCache ? fs.accessSync(options.cacheDir, fs.W_OK) : null;
    }

    setBaseURL(URL) {
        this._options.baseURL = URL;
    }

    setCookie(c, v) {
        this._cookies[c] = v;
        this._options.userAgent.headers.cookie = Object.keys(this._cookies).map(c => c + '=' + this._cookies[c]).join('; ') + ';';
    }

    getRequest(URL, options, randomize = false, tries = 1, overwriteCache = false) {
        let scope = this;
        let callArgs = arguments;
        if (!options) {
            options = this._options.userAgent;
        }

        return new Promise((resolve, reject)=> {
            URL = this._options.baseURL + URL;
            let cacheFileName = path.resolve(this._options.cacheDir, URL.replace(/\//gi, '-').replace(/:/gi, '_') + '.cache');

            if (this._options.useCache && !overwriteCache && fs.existsSync(cacheFileName)) {
                let stats = fs.statSync(cacheFileName);
                let now = (new Date() / 1);
                let mtime = (new Date(util.inspect(stats.mtime)) / 1) + (this._options.cacheExpires || 0);

                if (now < mtime) {
                    const cache = fs.readFileSync(cacheFileName);
                    this.isUsedCacheLastTime = true;
                    return resolve(cache.toString('utf8'));
                }
            }

            this.isUsedCacheLastTime = false;
            const request = this._client.get(randomize ? URL + `?${Math.random()}` : URL, options,
                    (data, response) => {
                        if (response.statusCode >= 200 && response.statusCode < 400) {
                            if (response && response.headers && response.headers['set-cookie']) {
                                const cookies = response.headers['set-cookie'];
                                cookies.forEach(c => {
                                    const exp = c.split('; ');
                                    const cookie = exp[0].split('=');
                                    this.setCookie(cookie[0], cookie[1] || '');
                                });
                            }

                            if (response.statusCode === 302 || response.statusCode === 301) {
                                callArgs[callArgs.length - 1] = true;
                                scope.getRequest.apply(scope, callArgs).then(resolve).catch(reject);
                            } else {
                                let html = data.toString('utf8');
                                if (html.indexOf('This site requires JavaScript and Cookies to be enabled.') > -1) {
                                    const ddosCookie = require('./ddos')(html);
                                    scope.setCookie(ddosCookie[1], ddosCookie[2]);
                                    callArgs[callArgs.length - 1] = true;
                                    scope.getRequest.apply(scope, callArgs).then(resolve).catch(reject);
                                } else {
                                    this._options.useCache ? fs.writeFileSync(cacheFileName, html) : null;
                                    resolve(html);
                                }
                            }
                        } else {
                            if (tries < (this._options.retries || 3)) {
                                setTimeout(() => {
                                    console.log(`Retry #${tries}`);
                                    this.getRequest(URL, options, randomize, tries++)
                                            .then(resolve);
                                }, 1000);
                            } else {
                                reject(new Error(`Response code must be 200, ${URL}`));
                            }
                        }
                    });

            request.on('requestTimeout', function (req) {
                console.log(URL, "request has expired");
                req.abort();
            });

            request.on('responseTimeout', function (res) {
                console.log(URL, "response has expired");

            });

            request.on('error', (err) => {
                console.log(URL, 'err');
                reject(err);
            });
        });
    }
};