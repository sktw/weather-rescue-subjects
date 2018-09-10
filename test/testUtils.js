import {objectAssign} from '../src/utils';
import sinon from 'sinon';

export class ImmutableChecker {
    setState(state) {
        this.state = state;
        this.signature = JSON.stringify(state);
    }

    check() {
        return JSON.stringify(this.state) === this.signature;
    }
}

export function createEvent(attrs) {
    return objectAssign({preventDefault: () => {}}, attrs);
}

export class Response {
    constructor({statusCode, headers={}, body=''}) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }

    get status() {
        return parseInt(this.statusCode);
    }

    get ok() {
        const status = this.status;
        return 200 <= status && status < 300;
    }

    json() {
        return Promise.resolve(JSON.parse(this.body));
    }
}

export function createJSONResponse(statusCode, json) {
    return new Response({statusCode, body: JSON.stringify(json)});
}

export function mockFetch({resolve=null, reject=null}) {
    return sinon.spy(() => {
        if (resolve) {
            return Promise.resolve(resolve);
        }
        else if (reject) {
            return Promise.reject(reject);
        }
    });
}
