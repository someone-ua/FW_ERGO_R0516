#!/bin/sh

cnt=0
while [ $cnt -lt 5 ]
do
	[ -e "/tmp/imei_ril" ] || {
		sleep 2
		let cnt=$cnt+1
		continue
	}
	sleep 1
	imei=`cat /tmp/imei_ril`
	logger "xiehj imei : $imei"
	break
done

if [ $cnt == 5 ]; then
	logger "xiehj key null, exit"
	[ -e /tmp/imei ] || touch /tmp/imei
	echo "fail" >> /tmp/imei
	num=`grep -c fail /tmp/imei`
	if [ $num -lt 5 ]
	then
		exit 1
	fi
fi

bak_imei=`fw_printenv | grep IMSI | awk -F "=" '{print $2}'`
echo "$bak_imei" > /tmp/test_xiehj 
if [ ! -z "${imei}" ]
then
	if [ "$bak_imei" != "$imei" ]
	then
		fw_setenv IMSI $imei
	else
		echo "imei is same" >> /tmp/test_xiehj
	fi
else
	if [ -z $bak_imei ]
	then
		echo "bak_imei is null" >> /tmp/test_xiehj
	else
		imei=${bak_imei}
	fi
fi

echo "imei : $imei" >> /tmp/test_xiehj

ssid_mac=`ifconfig -a | grep ra0 | grep HWaddr | cut -c 51-55 | sed 's/://g'`
[ -z ${ssid_mac} -o "${ssid_mac}" = "0000" ] && {
	exit 1
}

key=`echo $imei | cut -c 8-15`

vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
for vif in $vifs; do                                                              
	ifname=`echo $vif | awk -F "." '{print $2}' | awk -F "_" '{print $1}'`
	disabled=`uci -q get ${vif}.disabled`
	if [ "${disabled}" = "1" ]
	then                                                              
		uci -q set ${vif}.ssid="Ergo_${ssid_mac}_${ifname}"
	else
		uci -q set ${vif}.ssid="Ergo_${ssid_mac}"
	fi  
	uci -q set ${vif}.encryption=psk-mixed+tkip+ccmp   
	if [ -z $key ]
	then
		uci -q set ${vif}.key="12345678"     
		uci -q set ${vif}.bak_key="12345678"                         
	else
		uci -q set ${vif}.key=${key}                         
		uci -q set ${vif}.bak_key=${key}                         
	fi                    
done

set_if=`uci show wireless | grep "=wifi-settings" | sed -n "s/=wifi-settings//gp"`
uci -q set ${set_if}.need_ssid_change=0
uci commit
exit 0
