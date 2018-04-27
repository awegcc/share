
const fs = require('fs')
const {Writable} = require('stream')

class WritableCacheStream extends Writable {
  constructor(options) {
    super();
    this._cache = options.cache;
    this._objectKey = options.objectKey;
    this._internalBuf = Buffer([], 'binary');
  }

  _write(bytes, encoding, cb) {
    // todo: return if exceed internalBuf max size
    this._internalBuf = Buffer.concat([this._internalBuf, bytes]);
    cb();
  }

  _final(cb) {
    //this._cache._cache.set(this._objectKey, this._internalBuf);
    console.log(this._internalBuf.toString());
    cb();
  }
}

function writeObject(key, obj, cb) {
    const writeStream =  new WritableCacheStream({
      cache: this,
      objectKey: key
    });

    writeStream.on('finish', () => {
      cb();
    });

    writeStream.on('error', (err) => {
      writeStream.removeAllListeners();
      cb(err);
    });
    writeStream.write(obj);
    writeStream.end();
}


writeObject('key-001', 'content  999 999 999', (err, ss) => {
	if(err) {
		console.log(err);
	}
	});
