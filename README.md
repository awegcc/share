# share# fileserver test tools
Tool to inject massive files, upload file and download file.

## 1. create bucket
```
curl -v -X PUT "http://${bucket}.s3.mydomain.com" \  
   -H "Host: ${bucket}.s3.mydomain.com" \  
   -H "Date: ${dateValue}"\  
   -H "Authorization: AWS ${s3Key}:${signature}" 
```

## 2. upload file to bucket
```
curl -X PUT -T "${file}" \  
  -H "Host: ${bucket}.${url}" \  
  -H "Date: ${dateValue}" \  
  -H "Content-Type: ${contentType}" \  
  -H "Authorization: AWS ${s3Key}:${signature}" "http://${bucket}.${url}/${objname}"  
```

## 3. download file from bucket
```
curl -o ${file} -X GET \  
  -H "Host: ${bucket}.${url}" \  
  -H "Date: ${dateValue}" \  
  -H "Content-Type: ${contentType}" \  
  -H "Authorization: AWS ${s3Key}:${signature}" "http://${bucket}.${url}/${objname}" 
 ```
 
 ## install teamviewer
 ```
rpm -i teamviewer_13.1.8286.x86_64.rpm
warning: teamviewer_13.1.8286.x86_64.rpm: Header V4 RSA/SHA1 Signature, key ID 0c1289c0: NOKEY
error: Failed dependencies:
        libQt5Qml.so.5()(64bit) >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
        libQt5Quick.so.5()(64bit) >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
        libQt5WebKit.so.5()(64bit) >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
        libQt5WebKitWidgets.so.5()(64bit) >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
        libQt5X11Extras.so.5()(64bit) >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
        qt5-qtdeclarative >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
        qt5-qtquickcontrols >= 5.5 is needed by teamviewer-13.1.8286-0.x86_64
	
yum install epel-release
yum install qt5-qtwebkit qt5-qtx11extras qt5-qtquickcontrols
 ```

