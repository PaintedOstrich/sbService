/*
 *  Decrypts and verifies a facebook signed request
 *
 *  Example string = FrupZYf5lr42d5UgXS_E2x5mOBgp9dFr9GV4wME462c.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiIyLkFRRHBfeEZOUC1OVnd2OXguMzYwMC4xMzUyMDczNjAwLjUtNzU5ODY4OTE3fDEzNTIwNjkxMDF8QkNXQzgtQUJ6RE5PUTB0WjB1b2MyeF93SVM0IiwiaXNzdWVkX2F0IjoxMzUyMDY4ODAxLCJ1c2VyX2lkIjoiNzU5ODY4OTE3In0
 */
var crypto = require('crypto');

var has = function (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};

exports.verify = function(signedRequest, appSecret)
{
		 
    if(!signedRequest) {
        return;
    }

    if(!appSecret) {
        throw new Error('appSecret required');
    }

    split = signedRequest.split('.');

    if(split.length !== 2) {
        return;
    }

    encodedSignature = split.shift();
    encodedEnvelope = split.shift();

    if(!encodedSignature || !encodedEnvelope) {
        return;
    }

    try {
        envelope = JSON.parse(base64UrlDecode(encodedEnvelope));
    } catch (ex) {
        return;
    }

    if(!(envelope && has(envelope, 'algorithm') && envelope.algorithm.toUpperCase() === 'HMAC-SHA256')) {
        return;
    }

    hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(encodedEnvelope);
    base64Digest = hmac.digest('base64');

    // remove Base64 padding
    base64UrlDigest = base64Digest.replace(/={1,3}$/, '');

    // Replace illegal characters
    base64UrlDigest = base64UrlDigest.replace(/\+/g, '-').replace(/\//g, '_');
    
    if(base64UrlDigest !== encodedSignature) {
        return;
    }

    return envelope;
}

// Decodes a base 64 string
var base64UrlDecode = function (str) {
    var base64String = str.replace(/\-/g, '+').replace(/_/g, '/');
    var buffer = new Buffer(base64String, 'base64');
    return buffer.toString('utf8');
}