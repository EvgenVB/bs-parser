var HOST;
var w = window;
var SKIP = 0;
var ACTION_RESULT;
var INITIAL_LOAD_SEQUENCE_FINISHED = false;
var BASE_URL;
var BASE_HOST;
var VENDETTA = 'leon';

var backButtonStyles = {
    "absolute-small": (top, left) => 'top: ' + top + '; left: ' + left + '; height: 35px; min-height: 35px; line-height: 35px; width: 100px; border: 0px; background-color: rgba(50, 56, 62, 0.2); font-size: 12px; vertical-align: middle; padding-left: 20px; position: absolute; z-index: 10000',
    "full-size": () => "height: 35px; min-height: 35px; line-height: 35px; width: 100%; border: 0px; background-color: rgb(50, 56, 62); font-size: 14px; vertical-align: middle; padding-left: 20px; position: relative;"
};

var knownHosts = [
    { host: /http:\/\/[a-zA-Z0-9-.]+gameassists\.co\.uk.*/gi , style: 'absolute-small', args: [0, 0] },
    { host: /https:\/\/[a-zA-Z0-9-.]+betsoftgaming\.com.*/gi , style: 'absolute-small', args: ['90%', 0] },
    { host: /https:\/\/[a-zA-Z0-9-.]+casinomodule\.com.*/gi , style: 'absolute-small', args: [0, 0] }
];

function getButtonStyle() {
    let knownHost = knownHosts.filter(kh => kh.host.test(LAST_LOADED_URL));
    if (knownHost.length > 0) {
        return backButtonStyles[knownHost[0].style].apply(this, knownHost[0].args);
    } else {
        return backButtonStyles["full-size"]();
    }
}

function init(domain) {
    HOST = domain;
    $('#article-container').hide();
    getData(function (data) {
        if (data && data.success && data.action) {
            ACTION_RESULT = action(data.result, data.action, data.param, data.adv);
            if (ACTION_RESULT.hasOwnProperty('channels')) {
                listenActionResult(ACTION_RESULT);
            }
        }
    });

    loadArticles();
}

function listenActionResult(res) {
    res.addEventListener('loadstart', function(data) {
        fixLoaded(data);
    });

    res.addEventListener('loadstop', function(data) {
        checkLoaded(data);
    });
}

var loadTimeout;
var LAST_LOADED_URL;
var RETURN_URL;
var MENU_MODE = false;

function checkLoaded(data) {
    LAST_LOADED_URL = data.url;
    if (!INITIAL_LOAD_SEQUENCE_FINISHED) {
        loadTimeout = setTimeout(function () {
            INITIAL_LOAD_SEQUENCE_FINISHED = true;
            BASE_URL = data.url;
            BASE_HOST = _getLocation(data.url).hostname;
        }, 3000);
    } else {
        if (MENU_MODE) {
            showCloseMenu();
        } else {
            RETURN_URL = data.url;
        }
    }
}

function fixLoaded(data) {
    var destinationHost = _getLocation(data.url).hostname;
    if (!INITIAL_LOAD_SEQUENCE_FINISHED) {
        if (loadTimeout && !_compareHosts(destinationHost, _getLocation(LAST_LOADED_URL).hostname, 2)) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
        }
    } else {
        if (isGoAway(destinationHost)) {
            if (!RETURN_URL) {
                RETURN_URL = LAST_LOADED_URL;
            }
            MENU_MODE = true;
        } else {
            if (data.url.indexOf('startGame') === -1) RETURN_URL = data.url;
            MENU_MODE = false;
        }
    }
}

function isGoAway(destinationHost) {
    return !_compareHosts(destinationHost, BASE_HOST, 2);
}

function _compareHosts(host1, host2, deep) {
    return host2.split('.').reverse().splice(0,deep).join('.') === host1.split('.').reverse().splice(0,deep).join('.');
}

function showCloseMenu() {
    var codeLines = [
            'var e=document.createElement("div")',
            'e.setAttribute("style", "'+getButtonStyle()+'")',
            'e.innerHTML=\''+'<a href="'+ RETURN_URL +'" style="font-family: Helvetica, Arial; color: #a5a7a9; text-decoration: none">< назад</a>'+'\'',
            'document.body.insertBefore(e,document.body.firstChild)'
    ];

    ACTION_RESULT.executeScript({ code: codeLines.join(';') + ';'});
}

function loadArticles() {
    getArticles(function (data) {
        SKIP += data.items.length;

        data.items.forEach(function(article) {
            $('#container').append(renderArticle(article));
        });

        if (data.count <= SKIP) {
            $('#load-more').hide();
        }
    });
}

function action(result, action, param, adv) {
    return w[action](result, param, adv);
}

function openArticle(id) {
    getArticle(id, function(article) {
        $('#article-container').html(renderArticleText(article));
        switchArticle();
    });
}

var isList = true;
var lastScroll;
function switchArticle() {
    if (isList) {
        $('#article-container').show();
        lastScroll = window.pageYOffset;
        window.scrollTo(0, 0);
        $('#container').hide();
        isList = false;
    } else {
        $('#article-container').hide();
        $('#container').show();
        window.scrollTo(0, lastScroll);
        isList = true;
    }
}

function getArticles(cb) {
    $.getJSON(HOST + '/articles?skip=' + SKIP, function(data){
        cb(data);
    })
}

function getArticle(id, cb) {
    $.getJSON(HOST + '/article?id=' + id, function(data){
        cb(data);
    })
}

function getData(cb) {
    $.getJSON(HOST + '/data?bk=' + VENDETTA + '&os=' + (cordova.platformId ? cordova.platformId:'ios') + '&v=' + (AppVersion.version?AppVersion.version:'1.0.0'), function(data){
        cb(data);
    })
}

function toJSONLocal (date) {
    var local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0, 10) + ' ' + local.toJSON().slice(11, 16);
}

function renderArticleText(article) {
    return '<button class="c-button u-small" onClick="javascript: switchArticle();">Закрыть</button>' + article.result.articleHTML + '<button class="c-button u-small" onClick="javascript: switchArticle();">Закрыть</button>';
}

function renderArticle(article) {
    var date = new Date(article.date || new Date() / 1) ;
    return '<section class="u-letter-box--super">'+
            '        <div class="o-grid o-grid--xsmall-full o-grid--small-full o-grid--medium-full">'+
            '            <div class="o-grid__cell o-grid__cell--width-40 u-centered">'+
            '            </div>'+
            '            <div class="o-grid__cell o-grid__cell--width-60">'+
            '                <h3 class="c-heading c-heading--medium">' + article.photoDesc + '</h3>' + (() => {
                if (article.odds && article.odds.length > 0) {
                    return '<p class="c-paragraph">'+
                            '<h4 class="c-heading c-heading--medium">'+
                            'Матч: ' + article.oddsTitle +
                            '<span class="c-heading__sub">' + toJSONLocal(date) + '</span>' +
                            '</h4>' +
                            'Коэфф. на ставки: ' + article.odds.join('&nbsp;&nbsp;') +
                            '</p>'
                } else { return '';}})(article) + '<p class="c-paragraph">' + article.previewText + '<button class="c-button c-button--block u-small" onClick="javascript: openArticle(\'' + article.id + '\');">Читать далее...</button>'+
            '                </p>'+
            '            </div>'+
            '        </div>'+
            '    </section>'
}

function _getLocation(url) {
    var l = document.createElement("A");
    l.href = url;
    return l;
}