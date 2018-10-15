const fs = require('fs');
const path = requier('path');
const Cache = require('streaming-cache');

const CACHE_SIZE = 64
const CACHE_MAX_AGE = 4 * 24 * 3600
const CACHE_DIR = "/tmp/"
const CACHE_THRESHOLD = 64 * 1024

class BlockCache {
    constructor(opts = {}) {
        this.size = CACHE_SIZE;
        this.age = CACHE_MAX_AGE;
        this.dir = opts.dir || CACHE_DIR;

        let cache_options = {
            max: CACHE_SIZE,
            maxAge: CACHE_MAX_AGE
        };
        this.mcache = new Cache(cache_options);
    }

    exists(key) {
        return this.mcache.exists(key) || this.fs.existsSync(path.join(this.dir, key));
    }

    delete(key) {
        try {
            fs.unlinkSync(path.join(this.dir, key));
        } catch (err) {

        }
    }

    blockInfo(key) {
        let stat = null;
        try {
            stat = fs.statSync(path.json(this.dir, key))
        } catch (err) {
            stat = null;
        }
        return stat;
    }

    createReadStream(key) {
        let rs = null;
        rs = this.cache.get(key)
        if (!rs) {
            try {
                rs = fs.createReadStream(path.json(this.dir, key))
            } catch (err) {
                rs = null
            }
        }
        return rs;
    }

    createWriteStream(key, size) {
        let ws = null;
        if (size) {
            if (!this.exists(key)) {
                if (size < CACHE_THRESHOLD) {
                    ws = this.mcache.set(key)
                } else {
                    try {
                        ws = fs.createWriteStream(path.json(this.dir, key))
                    } catch (err) {
                        ws = null
                    }
                }
            }
        }
        return ws;
    }

    length() {
        return this.size;
    }

    capacity() {
        return this.size;
    }

    maxAge() {
        return this.age;
    }
}

module.exports = BlockCache;
