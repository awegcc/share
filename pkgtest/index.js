const levelup = require('levelup');
const leveldown = require('leveldown');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const path = require('path');

const dbpath = path.join('/tmp', 'levelup');
const db = levelup(leveldown(dbpath));

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
const msg = randomBytes(32)
   
  // generate privKey
  let privKey
  do {
    privKey = randomBytes(32)
  } while (!secp256k1.privateKeyVerify(privKey))
   
  // get the public key in a compressed format
  const pubKey = secp256k1.publicKeyCreate(privKey)
   
  // sign the message
  const sigObj = secp256k1.sign(msg, privKey)
   
  // verify the signature
  console.log("pubKey verify: ", secp256k1.verify(msg, sigObj.signature, pubKey))

  let hrtime = process.hrtime()
  let key = hrtime[0]
  let value = hrtime[1]

  writeObject(key, value, (err, ss) => {
    if (err) {
      console.log('writeObject', err);
      return;
    }
    console.log("write:", key, value);

    readObject(key, (err, data) => {
      if (err) {
        console.log('readObject', err);
        return;
      }
      console.log("read :", key, data.toString());
    });
  });
}

main();


