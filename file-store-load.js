
const FileStore = require('../lib/file-store');
const assert = require('assert');
const async = require('async');
const rimraf = require('rimraf');
const {expect} = require('chai');
const error = require('../lib/error');
const fs = require('fs');
const crypto = require('crypto');
//const MAX_OBJ_SIZE = 256*1024*1024;
const MAX_OBJ_SIZE = 2;
const Log = require('../../base/lib/logger');


var logger  = new Log( Log.LOGLEVEL.debug);
logger.pipe(new Log.RotatorStream('/tmp/filestore-test.log'));
logger.info('start example...');

var buffer = Buffer.alloc(MAX_OBJ_SIZE);

const LOCAL_STORE_PATH = '/tmp/filestore.test';
const LOCAL_FILE = '/tmp/.localfile.dat';
var localStore = new FileStore(LOCAL_STORE_PATH, {logger:logger});

for(let i=1; i<=MAX_OBJ_SIZE; i++) {
  buffer.write(i.toString(), i-1);
  let key1 = crypto.createHash('sha1').update(buffer.slice(0,i)).digest('hex');
  localStore.createWriteStream(key1, (err, stream) => {
    stream.on('finish', () => {
      /*
      localStore.readObject(key1, (err, value) => {
         let key2 = crypto.createHash('sha1').update(value).digest('hex');
         let key3 = crypto.createHash('sha1').update(buffer.slice(0, value.length)).digest('hex');
         console.log(`length: ${value.length} , key1: ${key1}, key2: ${key2}, key3: ${key3}`);
      });
      */
      console.log(i, "write finished");
    });
    stream.write(buffer.slice(0,i));
    stream.end();
  });
  console.log(i, buffer.toString('utf8', 0, i), key1);
}

console.log("creat write done");
localStore.closeAllStores((err) => {
    if(err) {
        console.log(`closeAllStores ${err}`);
    }
});

rimraf(LOCAL_STORE_PATH + '/*', {}, (err) => {
  if(err) {
    console.log(`rimraf ${LOCAL_STORE_PATH}`);
  }
});

