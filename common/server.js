const path = require('path');
const express = require('express');
const { Log } = require('./base');
const FileStore = require('./filestore');
const FileServer = require('./fileserver');

let ip = '0.0.0.0';
let port = 3000;

let app = express();
let logger = new Log(Log.LOGLEVEL.debug);

const data_path = process.env.DATA_HOME || '/tmp'
const LOCAL_STORE_PATH = path.join(data_path, 'filestore');
const log_file = path.join(data_path, 'fileserver.log');

logger.pipe(new Log.RotatorStream(log_file));
logger.info('start example...');

let fileServer = new FileServer(new FileStore(LOCAL_STORE_PATH, { logger: logger }), { logger: logger });

app.use((req, res, next) => {
  console.log(new Date(), req.method, req.url);
  next();
});

app.post('/pblocks/:entryKey', (req, res) => {
  fileServer.upload(req, res)
});

app.get('/pblocks/:entryKey', (req, res) => {
  fileServer.download(req, res)
});

app.post('/token', (req, res) => {
  fileServer.token(req, res)
});

console.log("Start server ", ip, port);

let server = app.listen(port, ip);

// Curl example
// curl -XPOST 'http://127.0.0.1:3000/token?entryKey=key3&entryOp=put'
// curl -XPOST 'http://127.0.0.1:3000/pblocks/key3?token=7d85fc03ca8e7e99cc9a7a07cda5862d255a704093865280' -H "Content-Type: application/octet-stream" --data-binary @/tmp/testfile
// curl -XPOST 'http://127.0.0.1:3000/token?entryKey=key3&entryOp=get'
// curl -XGET 'http://127.0.0.1:3000/pblocks/key3?token=935976dec17bcef6c303e8bf7dcb46665a38b4730032fc34'

