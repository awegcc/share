#!/bin/sh

ip=127.0.0.1
port=3000
ip_port=$ip:$port

echo $ip_port

mkdir -p src dst tmp

function upload()
{
    key="key$1"
    filename="$1"
    curl -s -XPOST "http://${ip_port}/token?entryKey=$key&entryOp=put" -o tmp/token
    eval $(awk -F\" '{printf("token=%s\n",$4)}' tmp/token)
    curl -s -XPOST "http://${ip_port}/pblocks/$key?token=$token" -H "Content-Type: application/octet-stream" --data-binary @src/$filename
}

function download()
{
    key="key$1"
    filename="$1"
    curl -s -XPOST "http://${ip_port}/token?entryKey=$key&entryOp=get" -o tmp/token2
    eval $(awk -F\" '{printf("token=%s\n",$4)}' tmp/token2)
    curl -s -XGET "http://${ip_port}/pblocks/$key?token=$token" -o dst/$filename
}

for((i=0;i<99999999;))
do
    filename=$i
    echo "test file content is none, and number is: $i" >> src/$filename
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
    mv -n src/$filename src/$i
done
