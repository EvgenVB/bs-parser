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
                    getLeonOffshorePromoLink('72742737', function(err, link) {
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
    redis.get('mirror', function (err, data) {
        console.log(data);
        let mirror = JSON.parse(data);
        cb(err, `https://${mirror.result}/?wm=${sub}`);
    });
}