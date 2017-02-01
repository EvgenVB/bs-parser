const jsdom = require("jsdom");

module.exports = class LeonBets {

    constructor(client) {
        this._client = client;
        this._client.setBaseURL('https://ru.leonbets.net/');
    }

    _getParser(name) {
        return require('./' + name);
    }

    _parse(URL, parser, args = [], overwriteCache = false) {
        const scope = this;
        const currentArgs = arguments;
        return this._client.getRequest(URL, null, null, null, overwriteCache)
                .then(this.loadHTML.bind(scope))
                .then((window) => {
                    if (Array.isArray(parser)) {
                        var results = [];
                        parser.forEach(parser => results.push(this._getParser(parser).apply(null, [window].concat(args))));
                    } else {
                        return this._getParser(parser).apply(null, [window].concat(args));
                    }
                }).catch(err => {
                    console.error(err);
                });
    }

    loadHTML(html) {
            return new Promise((resolve, reject) => {
                try {
                    if (html) {
                        jsdom.env(html, [], (err, window) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(window);
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
    }

    getArticles() {
        return this._parse('sportanalytics', 'articles');
    }

    getMirror() {
        return this._parse('sportanalytics', 'mirror');
    }

    getArticle(path) {
        return this._parse(path, 'article');
    }

    getFullData() {
        return this._parse('sportanalytics', ['articles', 'mirror']);
    }
};

var counter = 0;