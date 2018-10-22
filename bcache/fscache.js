const fs = require('fs');
const path = require('path');
const lru = require('lru-cache');
// lru-diskcache

const DEFAULT_OPTS = {
    max: 10 * 1024 * 1024,
    maxFiles: 1024,
    maxAge: undefined
}
class FSCache {
    constructor(rootPath, opts = {}) {
        this.root = rootPath;
        this.opts = Object.assign({}, DEFAULT_OPTS, opts);

        if (!this.opts.logger) {
            this.logger = this.opts.logger;
        } else {
            this.logger = console;
        }

        this.lru = lru({
            max: this.opts.maxFiles || this.opts.max,
            maxAge: this.opts.maxAge,
            dispose: this._dispose,
            length: this._length
        });
    }

    // Init(reset) cache
    init() {
        this.reset();
    }

    // Reset cache
    reset() {
        let self = this;
        if (fs.existsSync(self.root)) {
            fs.removeSync(self.root);
        }

        fs.mkdirsSync(self.root);
        self.lru.reset();
    }

    // Return true if key exists
    has(key) {
        return this.lru.has(key) && fs.existsSync(this._filename(key));
    }

    // Get a readable stream
    getStream(key) {
        let rs = null;
        try {
            rs = fs.createReadStream(this._filename(key));
        } catch (err) {
            this.logger.error('getStream error: ', err);
        }
        return rs;
    }

    // Writes a data or stream to disk
    set(key, stream, size, cb) {
        let self = this;
        let filename = self._filename(key)
        if (self.has(key)) {
            // update recentness
            self.lru.get(key);
            cb(null);
        } else {
            let ws = fs.createWriteStream(filename);
            stream.pipe(ws);
            ws.once('finish', () => {
                self.lru.set(key, size);
            });
        }
    }

    load(cb) {
        let self = this;
        fs.readdir(self.root, (err, files) => {
            if (err) {
                self.logger.error('readdir error', self.root, err);
                return cb(err);
            }
            files.forEach((f) => {
                let filepath = path.join(p, f);
                fs.stat(filepath, (err, stats) => {
                    if (err) {
                        self.logger.error('failed stat file: ', filepath, err);
                    } else {
                        // add filename to cache
                        if (stats.isFile()) {
                            self.lru.set(f, stats.size);
                        } else {
                            self.logger.error('invalid file: ', filepath)
                        }
                    }
                });
            });
            cb(null);
        });
    }

    // Deletes a key
    del(key) {
        return this.lru.del(key);
    }

    // Total length
    size() {
        return this.lru.length;
    }

    // prune old entries
    prune() {
        return this.lru.prune();
    }

    // filename of the key
    _filename(key) {
        return path.join(this.root, key);
    }

    // Methods for lru-cache
    _dispose(key, value) {
        try {
            fs.unlinkSync(this._filename(key));
        } catch (err) {
            this.logger.error('dispose error: ', key, value, err);
        }
    }
}

module.exports = FSCache;
