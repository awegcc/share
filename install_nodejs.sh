#!/bin/sh

NODE_HOME=`pwd`

if ! [ -f bin/node ]
then
    echo 'Please run this scritp in node dir'
    exit 1
fi

ln -s ${NODE_HOME}/bin/node /usr/local/bin/node
ln -s ${NODE_HOME}/lib/node_modules /lib/node_modules
ln -s /lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
ln -s /lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

