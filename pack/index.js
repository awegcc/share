
const levelup = require('levelup');
const leveldown = require('leveldown');
const fs = require('fs');

const db = levelup(leveldown('/tmp/leveldb'));

function writeObject(key, obj, cb) {

	db.put(key, obj, (err) => {
		if(err) {
			return cb(err);
		}
		return cb();
	});
}

function readObject(key, cb) {
	db.get(key, (err, value) => {
		if(err) {
			return cb(err, value);
		}
		return cb(null, value);
	});
}



writeObject('key-001', 'content  999 999 999', (err, ss) => {
	if(err) {
		console.log('writeObject', err);
	}
});

readObject('key-001', (err, data) => {
    if(err) {
	console.log(err);
    }
    console.log(`readObject: ${data}`);
});
