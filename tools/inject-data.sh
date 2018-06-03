#!/bin/sh
#
#
print_usage()
{
    local base_name=`basename $0`
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
eval $(awk 'BEGIN{srand(); printf("random=%05d",rand()*100000)}')
pkey="$prefix-$random"

mkdir -p tmp

upload()
{
    key="$1"
    up_fname="$2"
    curl ${options} -XPOST -o tmp/.${pkey}.put "http://${host_port}/token?entryKey=$key&entryOp=put"
    eval $(awk -F\" '{printf("ptoken=%s\n",$4)}' tmp/.${pkey}.put)
    curl ${options} -XPOST "http://${host_port}/pblocks/$key?token=$ptoken" -H "Content-Type: application/octet-stream" --data-binary @$up_fname
}

download()
{
    key="$1"
    down_fname="$2"
    curl ${options} -XPOST -o tmp/.${pkey}.get "http://${host_port}/token?entryKey=$key&entryOp=get"
    eval $(awk -F\" '{printf("gtoken=%s\n",$4)}' tmp/.${pkey}.get)
    curl ${options} -XGET "http://${host_port}/pblocks/$key?token=$gtoken" -o $down_fname
}

i=0
while [ $i -lt $count ]
do
    key="${pkey}_$i"
    filename="tmp/${pkey}_$i"
    echo "Just test file contents with( $filename )" >> $filename
    upload $key ${filename}
    download $key ${filename}.down
    if ! [ -f ${filename}.down ]
    then
        if [ "X$ignore" = "X" ]
        then
            echo " download ${filename}.down file not find"
            break
        else
            echo " download ${filename}.down file not find" | tee -a tmp/${pkey}.log
	fi
    elif cksum ${filename} ${filename}.down | awk '{array[$1]++}END{for(i in array)count++;if(count==1)exit 0; else exit 1}'
    then
        echo " download ${filename}.down ok"
        rm -f ${filename}.down
    else
        if [ "X$ignore" = "X" ]
        then
            echo " download ${filename}.down failed"
            break
        else
            echo " download ${filename}.down failed" | tee -a tmp/${pkey}.log
	fi
    fi
    i=$((i+1))
    mv -n $filename tmp/${pkey}_$i
done

