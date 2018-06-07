https://wiki.qemu.org/Documentation/Platforms/ARM

# Download kernel and initrd
wget -O install-linux http://http.us.debian.org/debian/dists/stretch/main/installer-arm64/current/images/netboot/debian-installer/arm64/linux
wget -O install-initrd.gz http://http.us.debian.org/debian/dists/stretch/main/installer-arm64/current/images/netboot/debian-installer/arm64/initrd.gz

# Not working ( without cpu type)
qemu-system-arm -M virt  -kernel netboot/vmlinuz -initrd netboot/initrd.gz -hda disk01.img -nographic -netdev type=tap,id=tap0 -device virtio-net-device,netdev=tap0


# Not working ( host bridge not forward guest packet)
qemu-system-aarch64 -M virt -m 1024 -cpu cortex-a53 -kernel installer-linux -initrd installer-initrd.gz -hda disk01.img -nographic -no-reboot -netdev type=tap,id=tap0 -device virtio-net-device,netdev=tap0

# Begin install, works well on Windows10,Debian9,
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

# Start
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
