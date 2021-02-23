#!/bin/sh

sshpass -p 'notion' scp -oKexAlgorithms=+diffie-hellman-group1-sha1 mtd root@192.168.1.1:/sbin/mtd
sshpass -p 'notion' scp -oKexAlgorithms=+diffie-hellman-group1-sha1 public root@192.168.1.1:/etc/public
sshpass -p 'notion' scp -oKexAlgorithms=+diffie-hellman-group1-sha1 decrypted_firmware_V005.bin root@192.168.1.1:/tmp/f.bin
sshpass -p 'notion' ssh -oKexAlgorithms=+diffie-hellman-group1-sha1 root@192.168.1.1 'sysupgrade -n /tmp/f.bin'

