#!/bin/sh
CONF=/etc/config/qpkg.conf
QPKG_NAME="myshare"
QPKG_ROOT=`/sbin/getcfg $QPKG_NAME Install_Path -f ${CONF}`

myshare_home=$(getcfg myshare Install_Path -f /etc/config/qpkg.conf)
myshare_data=$(getcfg myshare Data_Path -f /etc/config/qpkg.conf)

function stop_services()
{
  # kill all related services
  #ps -elf | grep myshare-farmer | grep -v grep | cut -d " " -f 1 > $myshare_home/pidlist
  #ps -elf | grep myshare-s3 | grep -v grep | cut -d " " -f 1 >> $myshare_home/pidlist
  #ps -elf | grep myshare.mfs | grep -v grep | cut -d " " -f 1 >> $myshare_home/pidlist
  #ps -elf | grep mssync | grep -v grep | cut -d " " -f 1 >> $myshare_home/pidlist
  ps -elf | grep myshare-miner | grep -v grep | cut -d " " -f 1 >> $myshare_home/pidlist
  
  for i in `cat $myshare_home/pidlist`
  do
    kill $i
  done
}

case "$1" in
  start)
    ENABLED=$(/sbin/getcfg $QPKG_NAME Enable -u -d FALSE -f $CONF)
    if [ "$ENABLED" != "TRUE" ]; then
        echo "$QPKG_NAME is disabled."
        exit 1
    fi
    echo "myshare home: $myshare_home"
    echo "myshare data: $myshare_data"
    $myshare_home/myshare-miner start -d -c ${myshare_data}/myshare-conf.json
    ;;

  stop)
    : ADD STOP ACTIONS HERE
    stop_services
    ;;

  restart)
    $0 stop
    $0 start
    ;;

  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac

exit 0

