#/bin/bash

myshare_home=$(getcfg myshare Install_Path -f /etc/config/qpkg.conf)
myshare_data=$(getcfg myshare Data_Path -f /etc/config/qpkg.conf)
arch_type=`uname -m`

LOG_FILE=${myshare_data}/upgrade.log
:>$LOG_FILE

server_url=http://192.168.1.1

pkg_type=""
if [ "X$arch_type" = "Xx86_64" ]
then
  pkg_type="x86_64"
elif [ "X$arch_type" = "Xaarch64" ]
then
  pkg_type="arm_64"
else
  echo "not support $arch_type" >> $LOG_FILE
  exit 1
fi

mkdir -p $myshare_home/upgrade
rm -rf $myshare_home/upgrade/*


# need to download online version number via wget, code is ToBeAdded

onlineversion='1.0.3'
localversion='1.0.2'
pkg_name="myshare_${onlineversion}_${pkg_type}.qpkg"

echo "download latest package: $pkg_name" >> $LOG_FILE

if [ $onlineversion \> $localversion ]
then
  # need to download online upgrade package and MD5 number via wget, code is ToBeAdded
  echo "install new package: $pkg_name" >> $LOG_FILE
fi

