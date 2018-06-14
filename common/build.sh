#!/bin/sh

sed -i 's/myshare-core/..\/..\/core/' fileserver/benchmark/fileserver-write-get.js
sed -i 's/myshare-base/..\/..\/base/' fileserver/benchmark/fileserver-write-get.js
sed -i 's/myshare-filestore/..\/..\/filestore/' fileserver/benchmark/fileserver-write-get.js

sed -i 's/myshare-base/..\/..\/base/' core/lib/token.js
sed -i 's/myshare-base/..\/..\/base/' core/lib/user.js

sed -i 's/myshare-base/..\/..\/base/' filestore/lib/file-chunk-manager.js

sed -i 's/myshare-base/..\/..\/base/' filestore/lib/raw-fs.js

sed -i 's/myshare-base/..\/..\/base/' filestore/lib/file-store.js

sed -i 's/myshare-base/..\/..\/base/' fileserver/lib/file-server.js


pkg -t node8-linux-x64 fileserver/benchmark/fileserver-write-get.js

