
//const FileStore = require('../lib/file-store');
//const assert = require('assert');
//const async = require('async');
//const rimraf = require('rimraf');
//const {expect} = require('chai');
//const error = require('../lib/error');
const fs = require('fs');
const crypto = require('crypto');

var sha1 = crypto.createHash('sha1');

var result = sha1.update('x').digest('hex');

console.log(`sha1(x) is ${result}`);



const LOCAL_STORE_PATH = '/tmp/filestoretest';
const LOCAL_FILE = '/tmp/.localfile.dat';
//var localStore = new FileStore(LOCAL_STORE_PATH);

fs.open(LOCAL_FILE, 'w+', (err, fd) => {
    if (err) {
      console.log(err);
    }

    fs.write(fd, 'x', (err) => {
        if(err) {
            console.log(err);
        }
    })

    fs.write(fd, 'y', (err) => {
        if(err) {
            console.log(err);
        }
    });

    //fs.read(fd, buff,)

    fs.close(fd, (err) => {
        if(err) {
            console.log(err);
        }
    });
  });

//fs.writeFile(LOCAL_FILE, 'a', (err) => {console.log(err)});
  
/*
rimraf(LOCAL_STORE_PATH + '/*', {}, (err) => {
localStore.closeAllStores((err) => {
    });
});
*/



