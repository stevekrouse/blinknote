window.largeSync = function() {
    function split(obj, maxLength) {
        "undefined" == typeof maxLength && (maxLength = maxBytesPerKey);
        for (var keys = getKeys(obj), ret = {}, i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (obj.hasOwnProperty(key)) {
                for (var str = LZString.compressToBase64(JSON.stringify(obj[key])), max = calculateMaxLength(key, maxLength), j = 0, offset = 0, strLen = str.length; strLen > offset; offset += max, 
                j++) ret[getStorageKey(key, j)] = str.substring(offset, offset + max);
                ret[getStorageKey(key, "meta")] = {
                    key: key,
                    min: 0,
                    max: j,
                    hash: basicHash(str),
                    largeSyncversion: version
                };
            }
        }
        return ret;
    }
    function reconstruct(splitObjects, keys) {
        "undefined" == typeof keys && (keys = extractKeys(splitObjects));
        for (var ret = {}, i = 0; i < keys.length; i++) {
            var key = keys[i], rejoined = "", meta = splitObjects[getStorageKey(key, "meta")];
            if ("undefined" !== meta) {
                for (var j = 0; j < meta.max; j++) {
                    if ("undefined" == typeof splitObjects[getStorageKey(key, j)]) throw Error("[largeSync] - partial string missing, object cannot be reconstructed.");
                    rejoined += splitObjects[getStorageKey(key, j)];
                }
                ret[key] = JSON.parse(LZString.decompressFromBase64(rejoined));
            }
        }
        return ret;
    }
    function getStorageKey(key, postfix) {
        return keyPrefix + "__" + key + "." + postfix;
    }
    function getRequestKeys(keys) {
        for (var re = [], i = 0; i < getKeys(keys).length; i++) {
            for (var key = keys[i], j = 0; maxBytes / maxBytesPerKey > j; j++) re.push(getStorageKey(key, j));
            re.push(getStorageKey(key, "meta"));
        }
        return re;
    }
    function calculateMaxLength(key, maxLength) {
        return maxLength - (keyPrefix.length + key.length + 10);
    }
    function getKeys(keys) {
        if ("undefined" != typeof keys && null !== keys) {
            if ("Object" === keys.constructor.name) return Object.keys(keys);
            if ("Array" === keys.constructor.name || "string" == typeof keys) return Array.from(keys);
        }
        throw TypeError("[largeSync] - " + keys + ' must be of type "Object", "Array" or "string"');
    }
    function extractKeys(splitObjects) {
        var ret = Object.keys(splitObjects).map(function(x) {
            var match = x.match(keyPrefix + "__(.*?).meta");
            return null !== match ? match[1] : void 0;
        });
        return ret.filter(Boolean);
    }
    function basicHash(str) {
        var hash = 0;
        if (0 === str.length) return hash;
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr, hash &= hash;
        }
        return hash;
    }
    function get(keys, callback) {
        var reqKeys = null;
        if (null !== keys) {
            var objKeys = getKeys(keys);
            reqKeys = getRequestKeys(objKeys);
        }
        chromeSync.get(reqKeys, function(items) {
            var x = reconstruct(items);
            callback(x);
        });
    }
    function set(items, callback) {
        if (null === items || "string" == typeof items || "Array" === items.constructor.name) // will throw error from "extensions::schemaUtils"
        chromeSync.set(items, callback); else {
            var splitItems = split(items, maxBytesPerKey), splitKeys = getKeys(splitItems), reqKeys = getRequestKeys(getKeys(items)), removeKeys = reqKeys.filter(function(x) {
                return splitKeys.indexOf(x) < 0;
            });
            //remove keys that are no longer in use
            chromeSync.remove(removeKeys), chromeSync.set(splitItems, callback);
        }
    }
    function remove(keys, callback) {
        if (null === keys) // will throw error from "extensions::schemaUtils"
        chromeSync.remove(null, callback); else {
            var removeKeys = getRequestKeys(getKeys(keys));
            chromeSync.remove(removeKeys, callback);
        }
    }
    function getBytesInUse(keys, callback) {
        if (null === keys) chromeSync.getBytesInUse(null, callback); else {
            var objectKeys = getRequestKeys(getKeys(keys));
            chromeSync.getBytesInUse(objectKeys, callback);
        }
    }
    function clear(callback) {
        chromeSync.clear(callback);
    }
    function getkeyPrefix() {
        return keyPrefix;
    }
    function setkeyPrefix(val) {
        keyPrefix = val;
    }
    if ("undefined" == typeof chrome.storage || "undefined" == typeof chrome.storage.sync) return
    var chromeSync = chrome.storage.sync, keyPrefix = "LS", maxBytes = chromeSync.QUOTA_BYTES, maxBytesPerKey = chromeSync.QUOTA_BYTES_PER_ITEM, version = "0.0.4", api = {
        QUOTA_BYTES: maxBytes,
        QUOTA_BYTES_PER_ITEM: maxBytes,
        QUOTA_BYTES_PER_KEY: maxBytesPerKey,
        MAX_ITEMS: chromeSync.MAX_ITEMS,
        MAX_WRITE_OPERATIONS_PER_HOUR: chromeSync.MAX_WRITE_OPERATIONS_PER_HOUR,
        MAX_WRITE_OPERATIONS_PER_MINUTE: chromeSync.MAX_WRITE_OPERATIONS_PER_MINUTE,
        VERSION: version,
        get: get,
        set: set,
        remove: remove,
        getBytesInUse: getBytesInUse,
        clear: clear,
        _core: {
            split: split,
            reconstruct: reconstruct,
            utils: {
                basicHash: basicHash,
                getKeys: getKeys,
                extractKeys: extractKeys,
                getStorageKey: getStorageKey,
                getRequestKeys: getRequestKeys
            }
        },
        _config: {
            getkeyPrefix: getkeyPrefix,
            setkeyPrefix: setkeyPrefix
        }
    };
    return window.chrome.storage.onChanged.addListenerlargeSync = function(callback) {}, 
    window.chrome.storage.largeSync = api, api;
}