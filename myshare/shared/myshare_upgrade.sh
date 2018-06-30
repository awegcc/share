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
    pkg_cksum="myshare_${onlineversion}_${pkg_type}.qpkg.md5"

    # Download online pkg checksum
    echo "Begin download latest pkg md5: ${pkg_cksum} from $url" >> $LOG_FILE
    if curl -s ${url}/${pkg_cksum} -o $myshare_home/upgrade/${pkg_cksum}
    then
      cksum_value=$(awk '{printf("%s",$1);exit}' $myshare_home/upgrade/${pkg_cksum})
      echo "Downloaded file[$pkg_cksum] checksum[$cksum_value] from $url" >> $LOG_FILE
    else
      echo "Failed download file[$pkg_cksum] checksum from $url" >> $LOG_FILE
      continue
    fi

    # Download online pkg
    echo "Begin download latest pkg: $pkg_name from $url" >> $LOG_FILE
    if curl -s ${url}/${pkg_name} -o $myshare_home/upgrade/${pkg_name}
    then
      echo "downloaded pkg: $pkg_name from $url" >> $LOG_FILE
      pkg_md5=$(md5sum $myshare_home/upgrade/${pkg_name} | awk '{printf("%s",$1)}')
      if [ "X$cksum_value" != "X$pkg_md5" ]
      then
        echo "pkg md5 $pkg_md5 mismatch" >> $LOG_FILE
        continue
      fi
      sh $myshare_home/upgrade/$pkg_name
      echo "successfully installed new pkg: $pkg_name" >> $LOG_FILE
      break
    else
      echo "failed download pkg: $pkg_name from $url, try another url" >> $LOG_FILE
      continue
    fi
  else
    echo "Local version[$localversion] is already the latest" >> $LOG_FILE
    break
  fi
done
