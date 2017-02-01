const coockiesMatch = new RegExp('setCookie[(]\'(.*)\', \'([.0-9]*)\', ([0-9]*)[)];');
module.exports = function (html) {
    let pos = html.indexOf('setCookie(\'');
    let pos2 = html.indexOf(';', pos);
    let script = html.substr(pos, pos2 - pos + 1);
    let scriptMatch = script.match(coockiesMatch);
    return scriptMatch;
};