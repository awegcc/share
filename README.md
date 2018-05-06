# share# fileserver test tools
Tool to inject massive files, upload file and download file.

## inject-data.sh
```
 Usage:  sh inject-data.sh [options...]
 -h host    Host address(default 127.0.0.1)
 -p port    port(default 3000)
 -k key     key prefix(default k)
 -n count   inject and download times(default 8192)
 -o options curl options
 ```

 eg.
 `./inject-data.sh -h 192.168.1.7 -p 3000 -k Key -n 9999`

## upload.sh
```
 Usage:  sh upload.sh [options...]
 -h host  Host address(default 127.0.0.1)
 -p port  port(default 3000)
 -k key   Object key(default random num)
 -f file  filename
 -o options  curl options
 ```
eg.
`./upload.sh -f /tmp/test.dat`

## download.sh
```
 Usage:  download.sh [options...]
 -h host  Host address(default 127.0.0.1)
 -p port  port(default 3000)
 -k key   Object key(default random num)
 -n times  download times(download and compare)
 -f filename (default dst/key)
 -o options  curl options
```

 eg.
 `./download.sh -k key-001`

