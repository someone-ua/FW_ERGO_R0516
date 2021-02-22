#!/bin/sh

		echo "swdl_linux_notion.sh start"
		#step1: kill ori process
		killall swdl_linux_notion

		#step2: tar 
		cd /tmp
		####yasuo cheng gz
		#tar zcvf swd.tar.gz SWD/
		#echo "swdl_linux_notion.sh compress ok"
		#exit 0
		####jieya and delete
		tar zxvf swd.tar.gz
		rm -rf swd.tar.gz

		#step3: exec
		cd SWD
		rm -rf AbsBlfTemp
		rm -rf temp
		chmod +x swdl_linux_notion

		BLF_NAME=`find -name *.blf | cut -c 3-`
		echo "BLF_NAME=$BLF_NAME"
		#./swdl_linux_notion -D Nezha_MiFi5_LWG_Only_Nontrusted.blf &
		./swdl_linux_notion -D $BLF_NAME -S
		#sleep 10
		#echo 1 > /sys/class/leds/reset_cp/shot
		
echo "swdl_linux_notion.sh ok"
exit 0