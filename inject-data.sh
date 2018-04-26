#!/bin/sh

function print_usage()
{
    local base_name=$(basename $0)
    echo -e "\033[0;31m Usage: \033[0m $base_name [options...]"
    echo -e " -h host  Host address(default 127.0.0.1)"
    echo -e " -p port  port(default 3000)"
    echo -e " -k key   key prefix"
    echo -e " -o options  curl options"
    exit 1
}

host=127.1.1.1
port=3000
prefix='k'

while getopts ':h:p:k:f:o:' opt
do
    case $opt in
    h) host=$OPTARG
    ;;
    p) port="${OPTARG}"
    ;;
    k) prefix="${OPTARG}"
    ;;
    o)
       options="-$OPTARG"
    ;;
    ?) echo '  error'
       print_usage
    ;;
    esac
done

host_port=$host:$port
pkey="$prefix-$RANDOM"

mkdir -p src dst tmp

function upload()
{
    key="$1"
    filename="$1"
    curl -s -XPOST "http://${host_port}/token?entryKey=$key&entryOp=put" -o tmp/token
    eval $(awk -F\" '{printf("token=%s\n",$4)}' tmp/token)
    curl -s -XPOST "http://${host_port}/pblocks/$key?token=$token" -H "Content-Type: application/octet-stream" --data-binary @src/$filename
}

function download()
{
    key="$1"
    filename="$1"
    curl -s -XPOST "http://${host_port}/token?entryKey=$key&entryOp=get" -o tmp/token2
    eval $(awk -F\" '{printf("token=%s\n",$4)}' tmp/token2)
    curl -s -XGET "http://${host_port}/pblocks/$key?token=$token" -o dst/$filename
}

for((i=0;i<9999999999;))
do
    filename="${pkey}_$i"
    echo "test file content($filename), and number is: $i" >> src/$filename
    upload $filename
    download $filename
    if diff src/$filename dst/$filename > /dev/null
    then
        echo " ${pkey}_$i ok"
        rm -f dst/$filename
    else
	echo " ${pkey}_$i failed"
        exit
    fi
    i=$((i+1))
    mv -n src/$filename src/${pkey}_$i
done