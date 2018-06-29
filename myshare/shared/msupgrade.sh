#/bin/sh

myshare_home=$(getcfg myshare Install_Path -f /etc/config/qpkg.conf)
myshare_data=$myshare_home/../../mysharedata
hwtype=`uname -m`

server_url=http://192.168.1.1

mkdir -p $myshare_home
mkdir -p $myshare_home/upgrade
rm -rf $myshare_home/upgrade/* 

# need to download online version number via wget, code is ToBeAdded
onlineversion=`cat $myshare_home/upgrade/msver`
offlineversion=`cat $myshare_home/version`
if [ $onlineversion \> $offlineversion ]
then
  # need to download online upgrade package and MD5 number via wget, code is ToBeAdded
  onlinemd5=`cat $myshare_home/upgrade/$onlineversion.$hwtype.qnap.md5`
  offlinemd5=`md5sum $myshare_home/upgrade/$onlineversion.$hwtype.qnap.tar.gz  | cut -d " " -f 1`
  if [ $onlinemd5 \= $offlinemd5 ]
  then
    tar xf $myshare_home/upgrade/$onlineversion.$hwtype.qnap.tar.gz -C $myshare_home/../
    rm -f $myshare_home/upgrade/*
    #kill farmer service
    ps -elf | grep myshare-farmer | grep -v grep | awk '{print $1}' | xargs kill
    # need to restart farmer service, code is ToBeAdded

    #kill s3 service
    ps -elf | grep myshare-s3 | grep -v grep | awk '{print $1}' | xargs kill
    # need to restart farmer service, code is ToBeAdded

    #kill mfs service and umount mount point
    ps -elf | grep myshare.mfs | grep -v grep | awk '{print $1}' | xargs kill
    umount myshare
    rm $myshare_data/fsmount/* -rf
    node $myshare_home/myshare.mfs/bin/mfs.js s3 -e 'http://127.0.0.1:9091' -b myshare -m $myshare_data/fsmount
    
  fi
fi

