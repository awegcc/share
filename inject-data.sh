#!/bin/bash

function print_usage()
{
    local base_name=$(basename $0)
    echo -e "\033[0;31m  Usage: \033[0m $base_name [options...]"
    echo -e " -h host    Host address(default 127.0.0.1)"
    echo -e " -p port    port(default 3000)"
    echo -e " -k key     key prefix(default k)"
    echo -e " -n count   inject and download times(default 8192)"
    echo -e " -i ignore  ignore failed download(default false)"
    echo -e " -o options curl options"
    exit 1
}

host=127.0.0.1
port=3000
prefix='k'
count=8192
options='-s'

while getopts ':h:p:k:n:o:i' opt
do
    case $opt in
    h) host=$OPTARG
    ;;
    p) port="${OPTARG}"
    ;;
    k) prefix="${OPTARG}"
    ;;
    n) count="${OPTARG}"
    ;;
    i) ignore=TRUE
    ;;
    o) options="-$OPTARG"
    ;;
    ?) echo '  error'
       print_usage
    ;;
    esac
done

host_port=$host:$port
pkey="$prefix-$RANDOM"

mkdir -p tmp

function upload()
{
    key="$1"
    up_fname="$2"
    eval $(curl -s -XPOST "http://${host_port}/token?entryKey=$key&entryOp=put" | awk -F\" '{printf("token=%s\n",$4)}')
    curl ${options} -XPOST "http://${host_port}/pblocks/$key?token=$token" -H "Content-Type: application/octet-stream" --data-binary @$up_fname
}

function download()
{
    key="$1"
    down_fname="$2"
    eval $(curl -s -XPOST "http://${host_port}/token?entryKey=$key&entryOp=get" | awk -F\" '{printf("token=%s\n",$4)}')
    curl -s -XGET "http://${host_port}/pblocks/$key?token=$token" -o $down_fname
}

for((i=0;i<count;))
do
    key="${pkey}_$i"
    filename="tmp/${pkey}_$i"
    echo "test file content($filename), and number is: $i" >> $filename
    upload $key ${filename}
    download $key ${filename}.down
    if md5sum ${filename} ${filename}.down | awk '{array[$1]++}END{if(length(array)==1)exit 0;else exit 1}'
    then
        echo " download ${filename}.down ok"
        rm -f ${filename}.down
    else
        echo " download ${filename}.down failed"
        [ "X$ignore" == "X" ] && exit
    fi
    i=$((i+1))
    mv -n $filename tmp/${pkey}_$i
done

