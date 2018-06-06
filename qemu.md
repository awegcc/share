https://wiki.qemu.org/Documentation/Platforms/ARM

qemu-system-arm -M virt  -kernel netboot/vmlinuz -initrd netboot/initrd.gz -hda disk01.img -nographic -netdev type=tap,id=tap0 -device virtio-net-device,netdev=tap0

