https://wiki.qemu.org/Documentation/Platforms/ARM

# Install ARM Debian
https://translatedcode.wordpress.com/2017/07/24/installing-debian-on-qemus-64-bit-arm-virt-board/

## Download kernel and initrd
wget -O install-linux http://http.us.debian.org/debian/dists/stretch/main/installer-arm64/current/images/netboot/debian-installer/arm64/linux
wget -O install-initrd.gz http://http.us.debian.org/debian/dists/stretch/main/installer-arm64/current/images/netboot/debian-installer/arm64/initrd.gz

# Installatio command
## Not working ( without cpu type)
qemu-system-arm -M virt  -kernel netboot/vmlinuz -initrd netboot/initrd.gz -hda disk01.img -nographic -netdev type=tap,id=tap0 -device virtio-net-device,netdev=tap0


## Not working ( host bridge not forward guest packet)
qemu-system-aarch64 -M virt -m 1024 -cpu cortex-a53 -kernel installer-linux -initrd installer-initrd.gz -hda disk01.img -nographic -no-reboot -netdev type=tap,id=tap0 -device virtio-net-device,netdev=tap0

## Begin install, works well on Windows10,Debian9,Macos
```
qemu-system-aarch64 -M virt\
			-m 1024 -cpu cortex-a53 -smp 2\
			-kernel installer-linux\
			-initrd installer-initrd.gz\
			-drive if=none,file=disk01.img,format=qcow2,id=hd \
			-device virtio-blk-device,drive=hd \
			-nographic\
			-no-reboot\
			-netdev user,id=user0\
			-device virtio-net-device,netdev=user0
```

## Start script (Copy vmlinuz/initrd from guest disk)
```
qemu-system-aarch64 -M virt\
			-m 1024 -cpu cortex-a53 -smp 2\
			-kernel installer-linux\
			-initrd installer-initrd.gz\
			-append 'root=/dev/vda2'
			-drive if=none,file=disk01.img,format=qcow2,id=hd \
			-device virtio-blk-device,drive=hd \
			-nographic\
			-no-reboot\
			-netdev user,id=user0\
			-device virtio-net-device,netdev=user0
```


# Install ARM Ubuntu 14.04
https://www.ubuntu.com/download/alternative-downloads

