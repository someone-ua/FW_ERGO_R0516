#!/bin/sh
local i=0
local sign=1

pptp_option_mschapv2() {
	echo "refuse-eap" >/etc/ppp/options.pptp
	echo "refuse-pap" >>/etc/ppp/options.pptp
	echo "refuse-chap" >>/etc/ppp/options.pptp
	echo "refuse-mschap" >>/etc/ppp/options.pptp
	echo "noipdefault" >>/etc/ppp/options.pptp
	echo "nobsdcomp" >>/etc/ppp/options.pptp
	echo "nodeflate" >>/etc/ppp/options.pptp
	echo "idle 0" >>/etc/ppp/options.pptp
	echo "mppe required,no40,no56,stateless" >>/etc/ppp/options.pptp
	echo "maxfail 0" >>/etc/ppp/options.pptp
}

pptp_option_nomppe() {
	echo "noipdefault" >/etc/ppp/options.pptp
	echo "nobsdcomp" >>/etc/ppp/options.pptp
	echo "nodeflate" >>/etc/ppp/options.pptp
	echo "idle 0" >>/etc/ppp/options.pptp
	echo "maxfail 0" >>/etc/ppp/options.pptp
}

rm -f /tmp/pptpfail
rm -f /tmp/chapc
while true
do
	ifcestatus=`ifconfig | grep pptp-vpn`
	if [ -n "$ifcestatus" ]; then
		break
	fi
	
	if [ $i -eq 10 ] || [ -f "/tmp/pptpfail" ]; then
		pppstatus=`echo -n | cat /tmp/pptpfail`
		[ "$pppstatus" = "1" ] && {
			ubus call network.interface.vpn down            
            pidct=`ps ww | grep pppd | grep -v grep | wc -l`
            [ "$pidct" != "0" ] && killall pppd
            ubus call network.interface.vpn up
			rm -f /tmp/pptpfail
		}
		
		if [ $i -eq 10 ] || [ "$pppstatus" = "2" ]; then
			ubus call network.interface.vpn down
			pidct=`ps ww | grep pppd | grep -v grep | wc -l`
			[ "$pidct" != "0" ] && killall pppd
			if [ $sign -eq 1 ] ; then
				pptp_option_mschapv2
				sign=2
			else
				pptp_option_nomppe
				sign=1	
			fi
			ubus call network.interface.vpn up
			rm -f /tmp/pptpfail
		fi
		i=0
	fi
	let i+=1
	sleep 1
done
