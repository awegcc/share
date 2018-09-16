const ipUtil = require('ip');
const util = require('util');
const natUpnp = require('nat-upnp');

const client = natUpnp.createClient();

const getMappings = util.promisify(client.getMappings).bind(client);
const portMapping = util.promisify(client.portMapping).bind(client);
const externalIp = util.promisify(client.externalIp).bind(client);

async function upnpCheck() {

  let port =  20000 + Math.floor(Math.random() * Math.floor(10000));

  try {
    await portMapping({ public: port, private: port, ttl: 10, description: 'share' });
  } catch (err) {
    console.error('UPnP Test failed, can not map port, Error: ', err.message);
    return;
  }

  let ip;
  try {
    ip = await externalIp();
    if (!ipUtil.isPublic(ip)) {
      console.error('UPnP Test failed, Not a public addr: ', ip);
      return;
    }
    console.info('UPnP Test success');
  } catch (err) {
    console.error('UPnP Test failed, can not get public ip.Error: ', err.message);
    return;
  }
}
