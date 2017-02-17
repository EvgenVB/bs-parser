const PARSER_SOURCE = 'leonbets';
const REDIS_PREFIX = `BS:DATA:${PARSER_SOURCE}:`;
const Redis = require('redis');
const redis = Redis.createClient({ prefix: REDIS_PREFIX });

module.exports = {
    leon: {
        ios: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72742737', function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72742737', function(err, link) {
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
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72753408', function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72753421', function(err, link) {
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
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72742737', function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72763823', function(err, link) {
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
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72742737', function(err, link) {
                        cb(err, getBaseRedirectData(link));
                    })

                }
            }
        },
        android: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function(cb) {
                    getLeonOffshorePromoLink('72767299', function(err, link) {
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
                getRedirectData: function(cb) {
                    cb(null, getBaseRedirectData('http://start2wincash.com/?s=53&ref=wp_w19786p162_&url'));
                }
            }
        },
        android: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function(cb) {
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

function getLeonOffshorePromoLink(sub, cb) {
    cb(null, `https://lbaddslinks.com/aff/ln/ru/${sub}`);
    return;
    redis.get('mirror', function (err, data) {
        console.log(data);
        let mirror = JSON.parse(data);
        cb(err, `https://${mirror.result}/?wm=${sub}`);
    });
}