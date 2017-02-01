exports.formatParseResult = (result, success = true, reason = null) => {
        return {result, success, reason};
};

exports.getDocument = (window) => {
    if (window) {
        const document = window.document;
        if (document) {
            return document;
        } else {
            throw new Error(`No window.document object was found`);
        }
    } else {
        throw new Error(`No window object was found`);
    }
};

exports.oneByCN = (root, cn, index = 0, mustHave = true, mustBeSingle = false) => {
    let elems = root.getElementsByClassName(cn);
    if (elems && elems.length > 0) {
        if (mustBeSingle && elems.length > 1) {
            throw new Error(`More than one elements was found by cn(.${cn}) query`);
        }

        return elems[index];
    } else if (mustHave) {
        throw new Error(`No elements was found by cn(.${cn}) query`);
    } else {
        return null;
    }
};

exports.oneByTag = (root, tag, index = 0, mustHave = true, mustBeSingle = false) => {
    let elems = root.getElementsByTagName(tag);
    if (elems && elems.length > 0) {
        if (mustBeSingle && elems.length > 1) {
            throw new Error(`More than one elements was found by tag(.${tag}) query`);
        }

        return elems[index];
    } else if (mustHave) {
        throw new Error(`No elements was found by tag(.${tag}) query`);
    } else {
        return null;
    }
};

exports.manyByCN = (root, cn, mustHave = true) => {
    let elems = root.getElementsByClassName(cn);
    if (elems && elems.length > 0) {
        return Array.prototype.slice.call(elems);
    } else if (mustHave) {
        throw new Error(`No elements was found by cn(.${cn}) query`);
    } else {
        return [];
    }
};

exports.manyByTag = (root, tag, mustHave = true) => {
    let elems = root.getElementsByTagName(tag);
    if (elems && elems.length > 0) {
        return Array.prototype.slice.call(elems);
    } else if (mustHave) {
        throw new Error(`No elements was found by tag(.${tag}) query`);
    } else {
        return [];
    }
};