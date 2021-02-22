#!/bin/sh
. /lib/functions.sh
. /lib/config/uci.sh

QOS_FILE="qos"

DN_DEV="br-lan"
UP_DEV="eth1"

g_qos_up_bd=""
g_qos_dn_bd=""
g_qos_enable=""
g_qos_filter_mode=""
g_qos_total_dn_limit=""
g_qos_total_up_limit=""

get_qos_ctrl_setting()
{
	config_load "$QOS_FILE"
	
	config_get g_qos_up_band qos_ctrl up_bandwidth
	config_get g_qos_down_band qos_ctrl down_bandwidth
	
	if [ -z "$g_qos_up_band" -o -z "$g_qos_down_band" ] ; 
	then
		exit 0
	fi
	
	echo "$g_qos_up_band $g_qos_down_band"
}

get_ip_rate_limit_setting()
{
	config_load "$QOS_FILE"
	
	config_get g_client_mac qos_client_limit mac
	config_get g_client_up_band qos_client_limit up_bandwidth
	config_get g_client_down_band qos_client_limit down_bandwidth
	config_get g_client_ip qos_client_limit ipaddr

	if [ -z "$g_client_mac" -o -z "$g_client_up_band" -o -z "$g_client_down_band" -o -z "$g_client_ip" ]
	then
		exit 0
	fi
	echo "$g_client_mac $g_client_up_band $g_client_down_band $g_client_ip"
}

get_ip_last_number()
{
	echo "$1" | awk -F '.' '{print $4}'
}

set_tc_class_filter()
{
	local tag=$1
	local ip_last_number
	local client_up_band=$2
	local client_down_band=$3
	local client_priority=$4
	local ip=$5
	
	#UP_speed
	tc class add dev $UP_DEV parent 10: classid 10:1$tag htb rate ${client_up_band}kbit ceil ${client_up_band}kbit burst 15k prio 0
	tc class add dev $UP_DEV parent 10:1$tag classid 10:2$tag htb rate ${client_up_band}kbit ceil ${client_up_band}kbit burst 15k prio $client_priority
	tc qdisc add dev $UP_DEV parent 10:2$tag handle 2$tag: sfq
	tc filter add dev $UP_DEV parent 10: protocol ip prio $client_priorit u32 match ip src $ip classid 10:2$tag

	#down_speed
	tc class add dev $DN_DEV parent 11: classid 11:1$tag htb rate ${client_down_band}kbit ceil ${client_down_band}kbit burst 15k prio 0
	tc class add dev $DN_DEV parent 11:1$tag classid 11:2$tag htb rate ${client_down_band}kbit ceil ${client_down_band}kbit burst 15k prio $client_priority
	tc qdisc add dev $DN_DEV parent 11:2$tag handle 2$tag: sfq
	tc filter add dev $DN_DEV parent 11: protocol ip prio $client_priorit u32 match ip dst $ip classid 11:2$tag
}


clear_tc_setting()
{
	#clear root queue
	tc qdisc del dev $UP_DEV root 2> /dev/null
	tc qdisc del dev $DN_DEV root 2> /dev/null
}

clear_all_client_rate_limit(){
	iptables -t mangle -F CLIENT_LIMIT_DEAL
	iptables -t mangle -F PACKAGE_PRI_DEAL
}

#qos_init
init_qos(){
	#add new son-list in magnle-prerouting
	iptables -t mangle -N PACKAGE_PRI_DEAL
	iptables -t mangle -N CLIENT_LIMIT_DEAL
	iptables -t nat -N BOLT_REDIRECT

	iptables -t mangle -I PREROUTING -i $UP_DEV -j PACKAGE_PRI_DEAL
	iptables -t mangle -I PREROUTING -i $DN_DEV -j CLIENT_LIMIT_DEAL
	iptables -t nat -I PREROUTING -i $DN_DEV -j BOLT_REDIRECT
}

#qos_enable
enable_qos_setting(){
	#add root queue 
	tc qdisc add dev $UP_DEV root handle 10: htb default 256
	tc qdisc add dev $DN_DEV root handle 11: htb default 256

}

qos_set_client_limit(){
	local config=$1
	local client_tag
	local client_up_bd
	local client_dn_bd
	local client_mac
	local client_ip
	local total_dn_limit=$g_qos_total_dn_limit
	local total_up_limit=$g_qos_total_up_limit
	
	config_get client_mac $config mac
	config_get client_ip $config ipaddr
	config_get client_up_bd $config up_bandwidth
	config_get client_dn_bd $config down_bandwidth

	if [ -z "$client_mac" -o -z "$client_ip" ] ; 
	then
		exit 0
	fi

	client_tag=$(get_ip_last_number $client_ip)
	echo "$client_tag"
	
	if [ -n "$client_up_bd" -a "0" != "$client_up_bd" ] ; 
	then
		g_qos_total_up_limit=$total_up_limit+$client_up_bd
		tc class add dev $UP_DEV parent 10:1 classid 10:2$client_tag htb rate ${client_up_bd}kbit ceil ${client_up_bd}kbit burst 15k
		tc qdisc add dev $UP_DEV parent 10:2$client_tag handle 2$tag: sfq
		iptables -t mangle -A CLIENT_LIMIT_DEAL -s $client_ip/32 -j MARK --set-mark $client_tag
		iptables -t mangle -A CLIENT_LIMIT_DEAL -s $client_ip/32 -j RETURN
		tc filter add dev $UP_DEV parent 10:0 protocol ip prio 10 handle $client_tag fw classid 10:2$client_tag
		#tc filter add dev $UP_DEV parent 10:0 protocol ip prio 10 u32 match ip src $client_ip classid 10:2$client_tag
		
		#iptables -A CLIENT_LIMIT_DEAL -s $client_ip/32 ! -d 127.0.0.1 -m limit --limit $client_up_bd/s -j RETURN
		#iptables -A CLIENT_LIMIT_DEAL -s $client_ip/32 ! -d 127.0.0.1 -j DROP

	fi

	if [ -n "$client_dn_bd" -a "0" != "$client_dn_bd" ] ; 
	then
		g_qos_total_dn_limit=$total_dn_limit+$client_dn_bd
		tc class add dev $DN_DEV parent 11:1 classid 11:2$client_tag htb rate ${client_dn_bd}kbit ceil ${client_dn_bd}kbit burst 15k
		tc qdisc add dev $DN_DEV parent 11:2$client_tag handle 2$tag: sfq
		tc filter add dev $DN_DEV parent 11:0 protocol ip prio 10 u32 match ip dst $client_ip classid 11:2$client_tag
	fi
}

qos_set_proto_limit(){
	local config=$1
	local client_tag
	local client_up_bd
	local client_dn_bd
	local client_proto
	local total_dn_limit=$g_qos_total_dn_limit
	local total_up_limit=$g_qos_total_up_limit
	
	config_get client_proto $config proto
	config_get client_tag $config port
	config_get client_up_bd $config up_bandwidth
	config_get client_dn_bd $config down_bandwidth
	
	if [ -z "$client_proto" -o -z "$client_tag" ] ; 
	then
		exit 0
	fi

	client_tag=$(get_ip_last_number $client_ip)
	echo "$client_tag"
	
	if [ -n "$client_up_bd" -a "0" != "$client_up_bd" ] ; 
	then
		g_qos_total_up_limit=$total_up_limit+$client_up_bd
		
		iptables -t mangle -A CLIENT_LIMIT_DEAL -p tcp --dport $client_tag -j MARK --set-mark $client_tag
		iptables -t mangle -A CLIENT_LIMIT_DEAL -p tcp --dport $client_tag -j RETURN

		iptables -t mangle -A CLIENT_LIMIT_DEAL -p udp --dport $client_tag -j MARK --set-mark $client_tag
		iptables -t mangle -A CLIENT_LIMIT_DEAL -p udp --dport $client_tag -j RETURN

		tc class add dev $UP_DEV parent 10:1 classid 10:2$client_tag htb rate ${client_up_bd}kbit ceil ${client_up_bd}kbit burst 15k
		tc qdisc add dev $UP_DEV parent 10:2$client_tag handle 2$tag: sfq	
		tc filter add dev $UP_DEV parent 10:0 protocol ip prio 10 handle $client_tag fw flowid 10:2$client_tag
		
		#tc filter add dev $UP_DEV parent 10:0 protocol ip prio 10 u32 match ip src $client_ip 0xffff flowid 10:2$client_tag
		#iptables -A CLIENT_LIMIT_DEAL -s $client_ip/32 ! -d 127.0.0.1 -m limit --limit $client_up_bd/s -j RETURN
		#iptables -A CLIENT_LIMIT_DEAL -s $client_ip/32 ! -d 127.0.0.1 -j DROP
	fi

	if [ -n "$client_dn_bd" -a "0" != "$client_dn_bd" ] ; 
	then
		g_qos_total_dn_limit=$total_dn_limit+$client_dn_bd
		
		tc class add dev $DN_DEV parent 11:1 classid 11:2$client_tag htb rate ${client_dn_bd}kbit ceil ${client_dn_bd}kbit burst 15k
		tc qdisc add dev $DN_DEV parent 11:2$client_tag handle 2$tag: sfq
		tc filter add dev $DN_DEV parent 11:0 protocol ip prio 10 u32 match ip sport $client_tag 0xffff flowid 11:2$client_tag
		
		#tc filter add dev $DN_DEV parent 11:0 protocol ip prio 10 u32 match u8 0x$client_tag 0xff at 9 flowid 11:2$client_tag
	fi
}


qos_set_pkg_pri(){
	local config=$1
	local qos_pk_type
	local qos_pk_pri

	config_get qos_pk_type $config type
	config_get qos_pk_pri $config pkg_pri

	if [ -z "$qos_pk_type" -o -z "$qos_pk_pri" ] ; then
	    exit 0
	fi

	iptables -t mangle -A PACKAGE_PRI_DEAL -i $UP_DEV -p $qos_pk_type -j TOS --set-tos $qos_pk_pri

}

qos_set_enable(){
	local client_ip
	
	config_get g_qos_up_bd qos_ctrl up_bandwidth
	config_get g_qos_dn_bd qos_ctrl down_bandwidth
	config_get g_qos_filter_mode qos_ctrl mode

	if [ -z "$g_qos_up_bd" -o -z "$g_qos_dn_bd" ] ; 
	then
		exit 0
	fi

	echo "$g_qos_up_bd $g_qos_dn_bd $g_qos_filter_mode"
	
	if [ "0" != "$g_qos_up_bd" ] ; 
	then
		tc qdisc add dev $UP_DEV root handle 10: htb default 256
		tc class add dev $UP_DEV parent 10: classid 10:1 htb rate ${g_qos_up_bd}kbit burst 15k
	fi

	if [ "0" != "$g_qos_dn_bd" ] ; 
	then
		tc qdisc add dev $DN_DEV root handle 11: htb default 256
		tc class add dev $DN_DEV parent 11: classid 11:1 htb rate ${g_qos_dn_bd}kbit burst 15k

	fi

	g_qos_total_dn_limit=0 
	g_qos_total_up_limit=0

	if [ "dev" == "$g_qos_filter_mode" ] ; 
	then
		
		config_foreach qos_set_client_limit qos_client_limit
		
		echo "dn_total_limit : $g_qos_total_dn_limit"
		echo "up_total_limit : $g_qos_total_up_limit"
		
		if [ "0" = "$g_qos_total_dn_limit" -a "0" != "$g_qos_dn_bd" ] ; 
		then
			echo "only dn total bandwidth"
			tc filter add dev $DN_DEV parent 11:0 protocol ip prio 1 u32 match ip dst 192.168.1.0/24 classid 11:1
		else
			tc class add dev $DN_DEV parent 11:1 classid 11:256 htb rate ${g_qos_dn_bd}kbit ceil ${g_qos_dn_bd}kbit burst 15k
		fi

		if [ "0" = "$g_qos_total_up_limit" -a "0" != "$g_qos_up_bd" ] ; 
		then
			echo "only up total bandwidth"
			tc filter add dev $UP_DEV parent 10:0 protocol ip prio 1 u32 match ip dst 0.0.0.0/0 classid 10:1
		else
			tc class add dev $UP_DEV parent 10:1 classid 10:256 htb rate ${g_qos_up_bd}kbit ceil ${g_qos_up_bd}kbit burst 15k
		fi
	fi

	if [ "proto" == "$g_qos_filter_mode" ] ; 
	then 
		config_foreach qos_set_proto_limit qos_proto_limit

		echo "dn_total_limit : $g_qos_total_dn_limit"
		echo "up_total_limit : $g_qos_total_up_limit"

		if [ "0" = "$g_qos_total_dn_limit" -a "0" != "$g_qos_dn_bd" ] ; 
		then
			echo "only dn total bandwidth"
			tc filter add dev $DN_DEV parent 11:0 protocol ip prio 1 u32 match ip dst 192.168.1.0/24 classid 11:1
		else
			tc class add dev $DN_DEV parent 11:1 classid 11:256 htb rate ${g_qos_dn_bd}kbit ceil ${g_qos_dn_bd}kbit burst 15k
		fi

		if [ "0" = "$g_qos_total_up_limit" -a "0" != "$g_qos_up_bd" ] ; 
		then
			echo "only up total bandwidth"
			tc filter add dev $UP_DEV parent 10:0 protocol ip prio 1 u32 match ip dst 0.0.0.0/0 classid 10:1
		else
			tc class add dev $UP_DEV parent 10:1 classid 10:256 htb rate ${g_qos_up_bd}kbit ceil ${g_qos_up_bd}kbit burst 15k
		fi
	fi

	config_foreach qos_set_pkg_pri qos_pkg_pri
}

#reload
qos_reload(){

	clear_tc_setting
	clear_all_client_rate_limit
	
	config_load "$QOS_FILE"
	config_get g_qos_enable qos_ctrl enable
	
	if [ -z "$g_qos_enable" ] ; 
	then
		exit 0
	fi
	
	echo "$g_qos_enable"

	if [ "$g_qos_enable" = "enable" ] ; 
	then
		qos_set_enable
	fi
}

INPUT_TYPE=$1
client_ipaddr=$2
up_bandwidth=$3
dn_bandwidth=$4
priority=$5
case $INPUT_TYPE in
	"reload")
	qos_reload ;;

	"qos_init")
	init_qos ;;
esac                       



