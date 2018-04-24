#!/bin/sh

ip=127.0.0.1
port=3000
ip_port=$ip:$port

echo $ip_port

# output: {"token":"d4bfcbe9756f1f2a1cc5c8867a107f4f5e45e0887293ec7d"}
curl -XPOST "http://${ip_port}/token?entryKey=$1&entryOp=put" -o .token
eval $(awk -F\" '{printf("token=%s\n",$4)}' .token)
echo $token
curl -v -XPOST "http://${ip_port}/pblocks/$1?token=$token" -H "Content-Type: application/octet-stream" --data-binary @/tmp/$1

curl -XPOST "http://${ip_port}/token?entryKey=$1&entryOp=get" -o .token2
eval $(awk -F\" '{printf("token=%s\n",$4)}' .token2)
echo $token
curl -v -XGET "http://${ip_port}/pblocks/$1?token=$token" -o $1

