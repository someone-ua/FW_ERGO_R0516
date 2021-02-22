#!/bin/sh
. /lib/functions.sh
. /lib/config/uci.sh
CRONTABS_PATH=/etc/crontabs/
CRONTABS_CONFIG_FILE=/etc/crontabs/root
CRONTABS_TMP=/var/crontmp

remove_wifi_task()
{
	if [ ! -f "$CRONTABS_TMP" ] ; then
		touch $CRONTABS_TMP
		chmod 666 $CRONTABS_TMP
  	fi
	echo "" > $CRONTABS_TMP
	
	if [  -f "$CRONTABS_CONFIG_FILE" ] ; then
		sed "/wifi down/d" $CRONTABS_CONFIG_FILE > $CRONTABS_TMP
		cp $CRONTABS_TMP $CRONTABS_CONFIG_FILE
	fi
	rm $CRONTABS_TMP
}
add_wifi_task()
{
	if [ ! -f "$CRONTABS_CONFIG_FILE" ] ; then
                if [ ! -d "$CRONTABS_PATH" ]; then
                        mkdir -p $CRONTAB_PATH
                fi
                touch $CRONTABS_CONFIG_FILE
        fi
	echo "$MIN $HOUR $DAY $MON * wifi down" >> $CRONTABS_CONFIG_FILE 
}

disabled_wifi()
{
	set_ifs=`uci show wireless | grep "=wifi-device" | sed -n "s/=wifi-device//gp"`
	for set_if in $set_ifs; do
		band=`uci -q get ${set_if}.band`
		if [ "$band" == "2.4G" ]; then
			uci -q set ${set_if}.disabled=1
			uci commit wireless
		fi
	done
	logger "xiehj : 2.4G disabled_wifi"
}

disabled_wifi_5g()
{
	set_ifs=`uci show wireless | grep "=wifi-device" | sed -n "s/=wifi-device//gp"`
	for set_if in $set_ifs; do
		band=`uci -q get ${set_if}.band`
		if [ "$band" == "5G" ]; then
	uci -q set ${set_if}.disabled=1
			uci commit wireless
		fi
	done
	logger "xiehj : 5G disabled_wifi"
}

remove_timer_reboot()
{
	if [ ! -f "$CRONTABS_TMP" ] ; then                              
                touch $CRONTABS_TMP                                     
                chmod 666 $CRONTABS_TMP                                 
        fi                                                              
        echo "" > $CRONTABS_TMP                                         
                                                                        
        if [  -f "$CRONTABS_CONFIG_FILE" ] ; then                       
                sed "/reboot/d" $CRONTABS_CONFIG_FILE > $CRONTABS_TMP
                cp $CRONTABS_TMP $CRONTABS_CONFIG_FILE                  
        fi                                            
        rm $CRONTABS_TMP 	
}

add_timer_reboot()
{
	if [ ! -f "$CRONTABS_CONFIG_FILE" ] ; then                      
                if [ ! -d "$CRONTABS_PATH" ]; then                      
                        mkdir -p $CRONTAB_PATH                          
                fi                                    
                touch $CRONTABS_CONFIG_FILE       
        fi
	hour_reboot=`uci -q get timer_reboot.settings.hour`  
        echo "0 ${hour_reboot} * * * reboot" >> $CRONTABS_CONFIG_FILE
	/etc/init.d/cron restart
}

init_timer_reboot()
{
	[ -e /etc/config/timer_reboot ] && {
		on=`uci -q get timer_reboot.settings.enable`
		if [ "$on" == "1" ]
		then
			add_timer_reboot
		fi
	}
}

COMMAND=$1
MON=$2
DAY=$3
HOUR=$4
MIN=$5
SEC=$6

operator=`cat /etc/operator`
case "$COMMAND" in
	"RESET_AUTO_OFF" )
	remove_wifi_task
	add_wifi_task
	;;
	"REMOVE_AUTO_OFF" )
	remove_wifi_task
	;;
	"DISABLED_WIFI_DEVICE" )
	disabled_wifi
	;;
	"DISABLED_WIFI_DEVICE_5G" )
	disabled_wifi_5g
	;;
	"INIT_TIMER_REBOOT" )
	remove_timer_reboot
	init_timer_reboot
	;;
	"RESET_TIMER_REBOOT" )
	remove_timer_reboot
	add_timer_reboot
	;;
	"REMOVE_TIMER_REBOOT" )
	remove_timer_reboot
	;;
esac
