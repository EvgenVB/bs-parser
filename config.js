const PARSER_SOURCE = 'leonbets';
const REDIS_PREFIX = `BS:DATA:${PARSER_SOURCE}:`;
const Redis = require('redis');
const redis = Redis.createClient({ prefix: REDIS_PREFIX });
const request = require('request');

module.exports = {
    leon: {
        ios: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72742737', ip, ua,  function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72742737', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        }
    },
    wh: {
        ios: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72753408', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            },
            "1.0.1": {
                redirect: false,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72753408', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72753421', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        }
    },
    365: {
        ios: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72763823', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72763823', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        }
    },
    befair: {
        ios: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72767299', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(ip, ua, cb) {
                    getLeonOffshorePromoLink('72767299', ip, ua, function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        }
    },
    vulkan: {
        ios: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(ip, ua, cb) {
                    cb(null, getBaseRedirectData('http://start2wincash.com/?s=53&ref=wp_w19786p162_&url'));
                }
            }
        },
        android: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(ip, ua, cb) {
                    cb(null, getBaseRedirectData('http://start2wincash.com/?s=53&ref=wp_w19786p162_&url'));
                }
            }
        }
    }
};


function getBaseRedirectData(url) {
    return {
        result: url,
        action:'open',
        param: '_blank',
        adv: 'toolbar=no,location=no,clearcache=no',
        success: true
    }
}

function getLeonOffshorePromoLink(sub, ip, ua, cb) {
    request(`http://traffpanel.com/api/get_mirror/12?ip=${ip}&ua=${encodeURIComponent(ua)}`, function(error, response, body) {
        if (error) {
            return cb(error);
        }

        try {
            body = JSON.parse(body);
            if (body.error > 0) {
                return cb(new Error(body.message));
            }

            cb(null, body.url + '?wm=${sub}');
        } catch (e) {
            return cb(e);
        }

    });
    // cb(null, `https://lbllandingslinksn4.xyz/aff/ln/ru/${sub}`);
    // return;
    // redis.get('mirror', function (err, data) {
    //     console.log(data);
    //     let mirror = JSON.parse(data);
    //     cb(err, `https://${mirror.result}/?wm=${sub}`);
    // });
}