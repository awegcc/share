const fs = require('fs');
const levelup = require('levelup');
const leveldown = require('leveldown');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');

const db = levelup(leveldown('/tmp/leveldb'));

function writeObject(key, obj, cb) {
  db.put(key, obj, (err) => {
    if (err) {
      return cb(err);
    }
    return cb();
  });
}


function readObject(key, cb) {
  db.get(key, (err, value) => {
    if (err) {
      return cb(err, value);
    }
    return cb(null, value);
  });
}


function main() {
  let key;
  if (process.argv.length == 3) {
    key = Buffer.from(process.argv[2]);
  } else {
    do {
      key = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(key));

    key = key.toString('hex');
  }

  writeObject(key, `value of ${key}`, (err, ss) => {
    if (err) {
      console.log('writeObject', err);
      return;
    }

    readObject(key, (err, data) => {
      if (err) {
        console.log('readObject', err);
        return;
      }
      console.log(`key: ${key} value: ${data}`);
    });
  });
}

main();


