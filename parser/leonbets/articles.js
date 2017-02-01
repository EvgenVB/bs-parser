const utils = require('../utils');
const photoLayerStyleRE = new RegExp('url[(](.*)[)]');
const crypto = require('crypto');

module.exports = function (window) {
    try {
        let document = utils.getDocument(window);

        let oddsData = {};
        let html = document.body.innerHTML;
        let oddsDataPos = html.indexOf('window.sportAnalyticsEvents');
        if (oddsDataPos > -1) {
            let oddsDataPosEnd = html.indexOf('}];', oddsDataPos);
            let oddsDataText = html.substr(oddsDataPos, oddsDataPosEnd + 3);

            let oddsDataMatched = oddsDataText.match(new RegExp('window[.]sportAnalyticsEvents [=] (.*);'));
            if (oddsDataMatched && oddsDataMatched.length > 1) {
                oddsData = JSON.parse(oddsDataMatched[1]);
            }
        }
        let articlesHoldersArray = utils.manyByCN(document, 'sportsnews-holder', true);
        let parseTime = (new Date() / 1);
        let articlesArray = articlesHoldersArray.map((articleHolder, i) => {
            // parse photo block *optional
            let photoLayer = utils.oneByCN(articleHolder, 'news-photo', 0, false);
            let photo = null;
            let photoDesc = '';
            if (photoLayer) {
                // parse article photo
                let matchedPhoto = photoLayer.style['background-image'].match(photoLayerStyleRE);
                if (matchedPhoto && matchedPhoto.length > 1) {
                    photo = matchedPhoto[1];
                }

                // parse photo desc
                let photoDescLayer = utils.oneByCN(photoLayer, 'news-title', 0, false);
                if (photoDescLayer) {
                    photoDesc = photoDescLayer.textContent || '';
                    photoDesc = photoDesc.trim();
                }
            }

            // parse article text block
            let articleTextLayer = utils.oneByCN(articleHolder, 'news-excerpt');

            // parse article date and odds *opional
            let articleDateAndOddsLayer = utils.oneByCN(articleTextLayer, 'sportAnonsOddsRows', 0, true);
            let date = null;
            let oddsTitle = null;
            let odds = [];

            if (articleDateAndOddsLayer && oddsData) {

                let angularOddsLayer = articleDateAndOddsLayer.firstElementChild;
                if (angularOddsLayer) {
                    let ngOddsId = parseInt(angularOddsLayer.getAttribute('id'));

                    let oddObject = oddsData.filter(o => o.id === ngOddsId);
                    if (oddObject && oddObject.length > 0) {
                        oddObject = oddObject[0];
                        date = oddObject.tm;
                        odds = oddObject.odds.map(o => o.odd);
                        oddsTitle = oddObject.title;
                    }
                }
            }

            // parse article preview
            let articlePreviewLayer = utils.oneByCN(articleTextLayer, 'text');
            let previewText = articlePreviewLayer.firstChild.textContent;
            previewText = previewText.trim();
            // parse article link
            let articleLinkLayer = utils.oneByCN(articleTextLayer, 'read-more');
            let articleLink = utils.oneByTag(articleLinkLayer, 'A');
            let link = articleLink.href;
            parseTime = parseTime - i;
            let md5sum = crypto.createHash('md5');
            let id = md5sum.update(link).digest('hex');
            return { id, photo, photoDesc, date, oddsTitle, odds,  previewText, link, parseTime };
        });

        return utils.formatParseResult(articlesArray);
    } catch (e) {
        console.error(e);
        return utils.formatParseResult(null, false, e.message);
    }
};