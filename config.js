module.exports = {
    leon: {
        ios: {
            "1.0.0": {
                redirect: true,
                getRedirectData: function() {
                    return getBaseRedirectData(getLeonOffshorePromoLink('72742737'));
                }
            }
        },
        android: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function() {
                    return getBaseRedirectData(getLeonOffshorePromoLink('72742737'));
                }
            }
        }
    },
    wh: {
        ios: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function() {
                    return getBaseRedirectData(getLeonOffshorePromoLink('72742737'));
                }
            }
        },
        android: {
            "1.0.0": {
                redirect: false,
                getRedirectData: function() {
                    return getBaseRedirectData(getLeonOffshorePromoLink('72742737'));
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

function getLeonOffshorePromoLink(sub) {
    return `https://lbaddslinks.com/aff/ln/ru/${sub}?r=${Math.random()}`;
}