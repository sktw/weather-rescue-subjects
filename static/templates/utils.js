function createUrlResolver(publicPath) {
    if (publicPath !== '/') {
        publicPath += '/';
    }

    return function(relative) {
        if (relative.charAt(0) === '/') {
            throw new Error('url must be relative');
        }
        else {
            return publicPath + relative;
        }
    };
}

function attrString(attrs) {
    var parts = [];

    for (key in attrs) {
        var value = attrs[key];
        if (value) {
            parts.push(key + '="' + value + '"');
        }
        else {
            parts.push(key);
        }
    }

    return parts.join(' ');
}

function link(attrs) {
    return '<link ' + attrString(attrs) + '>';
}

function script(attrs) {
    return '<script ' + attrString(attrs) + '></script>';
}

exports.createUrlResolver = createUrlResolver;
exports.link = link;
exports.script = script;
