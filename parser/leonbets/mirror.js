const utils = require('../utils');
const mirrorTextTest = new RegExp('Актуальное зеркало: (.*)');

module.exports = function (window) {
    try {
        let mirrorLayer = utils.oneByCN(utils.getDocument(window), 'actualDomain', 0, true, true);
        let mirrorLayerText = mirrorLayer.textContent;

        if (mirrorTextTest.test(mirrorLayerText)) {
            let matchedMirrorLayer = mirrorLayerText.match(mirrorTextTest);
            if (matchedMirrorLayer && matchedMirrorLayer.length > 1) {
                return utils.formatParseResult(matchedMirrorLayer[1]);
            } else {
                throw new Error(`Mirror layer text match failed: "${matchedMirrorLayer}"`);
            }
        } else {
            throw new Error(`Mirror layer text test failed: "${mirrorLayerText}"`);
        }
    } catch (e) {
        return utils.formatParseResult(null, false, e.message);
    }
};