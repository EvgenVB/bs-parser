const utils = require('../utils');

module.exports = function (window) {
    try {
        let document = utils.getDocument(window);
        let articleLayer = utils.oneByCN(document, 'text-wrapper', 0, true);
        let articleHTML = articleLayer.innerHTML;
        return utils.formatParseResult({articleHTML});
    } catch (e) {
        console.error(e);
        return utils.formatParseResult(null, false, e.message);
    }
};