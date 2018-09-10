// fetch override to call apps script back end

function Response(res) {
    this.res = res;
}

Object.defineProperties(Response.prototype, {
    headers: {
        get: function() {
            return this.res.headers;
        }
    },

    status: {
        get: function() {
            return parseInt(this.res.statusCode);
        }
    },

    ok: {
        get: function() {
            var status = this.status;
            return 200 <= status && status < 300;
        }
    }
});

Response.prototype.json = function() {
    return Promise.resolve(JSON.parse(this.res.body));
}

Response.prototype.text = function() {
    return Promise.resolve(this.body);
}

var doFetch = window.fetch;

window.fetch = function(input, init) {
    init || (init = {});
    var req = {
        url: input,
        method: init.method || 'GET',
        headers: init.headers || {},
        body: init.body || ''
    };

    return new Promise(function(resolve, reject) {
        doFetch('https://script.google.com/macros/s/AKfycbwTZKXJe0ZSaeXAbLYC4KuqLD5rW_PXAHkZgsUPMy7DJpvfdg/exec', {
            method: 'POST',
            body: JSON.stringify(req)
        }).then(function(res) {
            return res.json();
        }).then(function(json) {
            return resolve(new Response(json));
        }).catch(reject);
    });
}
