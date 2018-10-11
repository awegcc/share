const fs = require('fs')
const path = require('path')

const CACHE_SIZE = 64
const CACHE_MAX_AGE = 4 * 24 * 3600
const CACHE_DIR = "/tmp/"

class BlockCache {
    constructor(opts = {}) {
        this.size = CACHE_SIZE;
        this.age = CACHE_MAX_AGE;
        this.dir = opts.dir || CACHE_DIR;
    }

    exists(key) {
        return fs.existsSync(path.join(this.dir, key));
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
        try {
            rs = fs.createReadStream(path.json(this.dir, key))
        } catch (err) {
            rs = null
        }
        return rs;
    }

    createWriteStream(key) {
        let ws = null;
        if (!this.exists(key)) {
            try {
                ws = fs.createWriteStream(path.json(this.dir, key))
            } catch (err) {
                ws = null
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
