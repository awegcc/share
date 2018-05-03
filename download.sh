#!/bin/sh

function print_usage()
{
    local base_name=$(basename $0)
    echo -e "\033[0;31m Usage: \033[0m $base_name [options...]"
    echo -e " -h host  Host address(default 127.0.0.1)"
    echo -e " -p port  port(default 3000)"
    echo -e " -k key   Object key(default random num)"
    echo -e " -n times  download times(download and compare)"
    echo -e " -f filename (default dst/key)"
    echo -e " -o options  curl options"
    exit 1
}

host=127.0.0.1
port=3000
key=$RANDOM
options='-s'
count=1

while getopts ':h:p:k:n:f:o:v' opt
do
    case $opt in
    h) host=$OPTARG
    ;;
    p) port="${OPTARG}"
    ;;
    k) key=$OPTARG
    ;;
    n) count=$OPTARG
    ;;
    f) filename=$OPTARG
    ;;
    o) options="-$OPTARG"
    ;;
    v) print_usage
    ;;
    ?) echo '  error'
       print_usage
    ;;
    esac
done

mkdir -p dst
host_port=${host}:${port}
if [ "X$filename" == "X" ]
then
    filename="dst/$key"
fi

function download()
{
    key="$1"
    _filename="$2"
    eval $(curl -s -XPOST "http://${host_port}/token?entryKey=$key&entryOp=get" | awk -F\" '{printf("token=%s\n",$4)}')
    curl ${options} -XGET "http://${host_port}/pblocks/$key?token=$token" -o $_filename
}

download $key $filename
echo "key: $key file: dst/$key"

for((i=1; i<count; i++))
do
    download $key ${key}.$i
    if diff dst/$key dst/${key}.$i > /dev/null
    then
        echo "file dst/${key}.$i ok"
        rm -f dst/${key}.$i
    else
        echo "file dst/${key}.$i failed"
        break
    fi
done

