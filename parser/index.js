exports.Request = require('./request');

exports.getParser = (name, client) => {
    const ParserClass = require('./' + name);
  return new ParserClass(client);
};