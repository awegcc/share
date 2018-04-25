#!/bin/sh

ip=127.0.0.1
port=3000
ip_port=$ip:$port

echo $ip_port

mkdir -p src dst tmp

function upload()
{
    # output: {"token":"d4bfcbe9756f1f2a1cc5c8867a107f4f5e45e0887293ec7d"}
    curl -s -XPOST "http://${ip_port}/token?entryKey=$1&entryOp=put" -o tmp/token
    eval $(awk -F\" '{printf("token=%s\n",$4)}' tmp/token)
    curl -s -XPOST "http://${ip_port}/pblocks/$1?token=$token" -H "Content-Type: application/octet-stream" --data-binary @src/$1
}

function download()
{
    curl -s -XPOST "http://${ip_port}/token?entryKey=$1&entryOp=get" -o tmp/token2
    eval $(awk -F\" '{printf("token=%s\n",$4)}' tmp/token2)
    curl -s -XGET "http://${ip_port}/pblocks/$1?token=$token" -o dst/$1
}

for((i=0;i<99999999;))
do
    filename=$i
    echo $i >> src/$filename
    upload $filename
    download $filename
    if diff src/$filename dst/$filename > /dev/null
    then
        echo "file $i ok"
        rm -f dst/$filename
    else
	echo "file $i failed"
        exit
    fi
    i=$((i+1))
    mv src/$filename src/$i
done
