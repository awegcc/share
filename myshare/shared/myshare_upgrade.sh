#/bin/sh
# Fri Jun 29 17:03:54 DST 2018
#
server_url=http://192.168.0.8:3000

myshare_home=$(getcfg myshare Install_Path -d "" -f /etc/config/qpkg.conf)
myshare_data=$(getcfg myshare Data_Path -d "" -f /etc/config/qpkg.conf)
localversion=$(getcfg myshare Version -d "" -f /etc/config/qpkg.conf)
arch_type=`uname -m`

if [ "X$myshare_home" = "X" ]
then
  echo 'Can not get myshare Install_Path from qpkg.conf'
  exit 1
elif [ "X$myshare_data" = "X" ]
then
  echo 'Can not get myshare_data from qpkg.conf'
  exit 2
elif [ "X$localversion" = "X" ]
then
  echo 'Can not get myshare version from qpkg.conf'
  exit 3
else
  LOG_FILE=${myshare_data}/upgrade.log
  echo "Local config is fine[`date`], continue check online version[$server_url]" >> $LOG_FILE
fi

if [ "X$arch_type" = "Xx86_64" ]
then
  pkg_type="x86_64"
elif [ "X$arch_type" = "Xaarch64" ]
then
  pkg_type="arm_64"
else
  echo "not support $arch_type" >> $LOG_FILE
  exit 4
fi
echo "myshare local version[$localversion], local pkg type[$pkg_type]" >> $LOG_FILE

mkdir -p $myshare_home/upgrade
rm -rf $myshare_home/upgrade/*


# need to download online version number via wget, code is ToBeAdded
if curl -s ${server_url}/version -o $myshare_home/upgrade/version
then
  onlineversion=$(cat $myshare_home/upgrade/version)
  echo "Get online version: $onlineversion" >> $LOG_FILE
else
  echo "Get online error, exit" >> $LOG_FILE
fi


if [ $onlineversion \> $localversion ]
then
  pkg_name="myshare_${onlineversion}_${pkg_type}.qpkg"
  echo "Begin download latest package: $pkg_name" >> $LOG_FILE
  # need to download online upgrade package and MD5 number via wget, code is ToBeAdded
  curl -s ${server_url}/$pkg_name -o $myshare_home/upgrade/$pkg_name
  sh $myshare_home/upgrade/$pkg_name
  echo "successfully installed new package: $pkg_name" >> $LOG_FILE
else
  echo "Local version[$localversion] is already the latest" >> $LOG_FILE
fi

