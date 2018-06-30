#/bin/sh
# myshare upgrade script
# Fri Jun 29 17:03:54 CST 2018
#
server_list=(
http://192.168.0.8:3000
http://192.168.1.135:3000
http://192.168.1.212:3000
)

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
  echo "[`date`] Local config is fine, continue check online version" >> $LOG_FILE
fi

if [ "X$arch_type" = "Xx86_64" ]
then
  pkg_type="x86_64"
elif [ "X$arch_type" = "Xaarch64" ]
then
  pkg_type="arm_64"
else
  echo "Not support $arch_type" >> $LOG_FILE
  exit 4
fi
echo "myshare local version[$localversion], local pkg type[$pkg_type]" >> $LOG_FILE

mkdir -p $myshare_home/upgrade
rm -rf $myshare_home/upgrade/*


# Download online version
for url in ${server_list[@]}
do
  if curl -s ${url}/version -o $myshare_home/upgrade/version
  then
    onlineversion=$(cat $myshare_home/upgrade/version)
    echo "Get online version[$onlineversion] from $url" >> $LOG_FILE
  else
    echo "Failed get online version from: $url" >> $LOG_FILE
    continue
  fi
  
  if [ $onlineversion \> $localversion ]
  then
    pkg_name="myshare_${onlineversion}_${pkg_type}.qpkg"
    echo "Begin download latest package: $pkg_name from $url" >> $LOG_FILE
    # Download online package and MD5
    if curl -s ${url}/${pkg_name} -o $myshare_home/upgrade/${pkg_name}
    then
      echo "downloaded package: $pkg_name from $url" >> $LOG_FILE
      sh $myshare_home/upgrade/$pkg_name
      echo "successfully installed new package: $pkg_name" >> $LOG_FILE
    else
      echo "failed download package: $pkg_name from $url, try another url" >> $LOG_FILE
      continue
    fi
  else
    echo "Local version[$localversion] is already the latest" >> $LOG_FILE
    break
  fi
done
