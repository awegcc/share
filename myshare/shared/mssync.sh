#/bin/sh
myshare_home=$(getcfg myshare Install_Path -f /etc/config/qpkg.conf)
myshare_data=$myshare_home/../../mysharedata

du -sh $myshare_data/filestore | awk '{print $1}' >  /share/Web/myshareweb/myshareweb/data.json

ps -fe|grep s3srv |grep -v grep
if [ $? -ne 0 ]
then
  node $myshare_home/myshare.s3srv/myshare-s3 start -r $myshare_data/s3srvdata
  sleep 15
fi

ps -fe|grep myshare-farmer |grep -v grep
if [ $? -ne 0 ]
then
  node  $myshare_home/myshare/myshare-farmer startall -r $myshare_data/data/
  sleep 10
fi

ps -fe|grep goofys |grep -v grep
if [ $? -ne 0 ]
then
  umount $myshare_data/fsmount/
  rm -rf $myshare_data/fsmount/*
  node $myshare_home/myshare.mfs/bin/mfs.js s3 -e 'http://127.0.0.1:9091' -b myshare -m $myshare_data/fsmount
fi

mysharepid=`cat /var/run/myshare.pid`

#Replace old mssync if upgrading is in progress
if [ -f $myshare_home/upgrading ]
then
  ps -elf | grep -w $mysharepid  | grep -v grep | awk '{print $1}' | xargs kill
  rm $myshare_home/upgrading
  sleep 1
fi

ps -elf | grep -w $mysharepid | grep -v grep
if [ $? -ne 0 ]
then
  echo $$ > /var/run/myshare.pid
  while true
  do
    ps -fe | grep inotifywait |grep -v grep
    if [ $? -ne 0 ]
    then
      /usr/sbin/inotifywait -mrq --format '%w %f' -e close_write $myshare_data/mycloud | while read DIR FILE; do echo "$DIR$FILE" >> $myshare_data/synctodo; done &
    fi

    if [ -s $myshare_data/synctodo ]
    then
      #remove absolution path header $myshare_data/mycloud/ as rsync doesn't need it
      temp1=$myshare_data/mycloud/
      temp2=$(echo $temp1 | sed "s/\//\\\\\//g")
      sed -i "s/$temp2//g" $myshare_data/synctodo
      
      ps -fe|grep s3srv |grep -v grep
      if [ $? -eq 0 ]
      then
        ps -fe|grep goofys |grep -v grep
        if [ $? -eq 0 ]
        then
          cat $myshare_data/synctodo | uniq >> $myshare_data/syncing
          cat /dev/null > $myshare_data/synctodo
          rsync --temp-dir=$myshare_data/rsynctemp --files-from=$myshare_data/syncing $myshare_data/mycloud/ $myshare_data/fsmount/
          if [ $? -eq 0 ]
          then
            cat $myshare_data/syncing | uniq >> $myshare_data/synced
            cat /dev/null > $myshare_data/syncing
          else
            cat $myshare_data/syncing >> $myshare_data/syncpend
            cat /dev/null > $myshare_data/syncing
          fi
      
        fi
      fi
    
    fi
    sleep 1
  done
fi

