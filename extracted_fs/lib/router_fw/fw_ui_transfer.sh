#!/bin/sh
. /lib/functions.sh
. /lib/config/uci.sh

FW="firewall"
UI_FW_FILE="firewall"
UI_DHCP_FILE="dhcp"
NTP_CONF_FILE="system"
NETWORK_CONF_FILE="network"
DN_FILTER_ADDN_FILE="/etc/dns_blacklist"
DN_REDIRECT_URL="192.168.111.1"
IP_FILTER_DISABLE_TYPE="FW"
IP_FILTER_ENABLE_TYPE="FW"
IP_FILTER_DISABLE="1"
DN_FILTER_DISABLE="1"
SIP_ALG_ENABLE="1"
WAN_PING_DISABLE="1"
DMZ_DISABLE="1"
FIND_ADDNHOSTS="0"
CRONTABS_PATH="/etc/crontabs/"
CRONTABS_CONFIG_FILE="/etc/crontabs/root"
CRONTABS_TMP="/var/crontmp"
CHECK_DNFILTER_CRON="/lib/router_fw/fw_ui_transfer.sh DN_RESET"
DNS_MSG_RESTRAT="/etc/init.d/dnsmasq"
DN_CONFIG_FILE="/etc/dnsmasq.conf"
DN_RESOLV_FILE="/tmp/resolv.conf.auto"

foreach_ip_disable()
{
   echo "enter $FUNCNAME"
   local config="$1"
   local fw_type;
   local after_enabled;
   config_get fw_type "$config" "filter_type" "unset"
   echo "filter type: $fw_type"
   if [ "$fw_type" == "ip_filter" ] ;then
       uci_set "$FW" "$config" "enabled" "0"
       if [ "$IP_FILTER_DISABLE_TYPE" == "UI" ];then
           echo "set ui_enabled 0"
           uci_set "$FW" "$config" "ui_enabled" "0"
       fi
   fi
   config_get after_enabled "$config" "enabled" "unset"
   echo "after $after_enabled"

}
foreach_dmz_disable()
{
   echo "enter $FUNCNAME"
   local config="$1"
   local fw_type;
   local after_enabled;
   config_get fw_type "$config" "fw_type" "unset"
   echo "filter type: $fw_type"
   if [ "$fw_type" == "dmz" ] ;then
       uci_set "$FW" "$config" "enabled" "0"
       if [ "$IP_FILTER_DISABLE_TYPE" == "UI" ];then
           echo "set ui_enabled 0"
           uci_set "$FW" "$config" "ui_enabled" "0"
       fi
   fi
   config_get after_enabled "$config" "enabled" "unset"
   echo "after $after_enabled"

}
foreach_port_mapping_disable()
{
   echo "enter $FUNCNAME"
   local config="$1"
   local fw_type;
   local after_enabled;
   config_get fw_type "$config" "fw_type" "unset"
   echo "filter type: $fw_type"
   if [ "$fw_type" == "mapping" ] ;then
       uci_set "$FW" "$config" "enabled" "0"
       if [ "$IP_FILTER_DISABLE_TYPE" == "UI" ];then
           echo "set ui_enabled 0"
           uci_set "$FW" "$config" "ui_enabled" "0"
       fi
   fi
   config_get after_enabled "$config" "enabled" "unset"
   echo "after $after_enabled"

}

set_dmz_disable()
{
	config_foreach foreach_dmz_disable redirect
}
set_port_mapping_disable()
{
	config_foreach foreach_port_mapping_disable redirect

}

set_ip_filter_disable()
{
   IP_FILTER_DISABLE_TYPE=$1;
   config_foreach foreach_ip_disable rule
}

foreach_ip_enable()
{
   local config="$1"
   local fw_type;
   local ui_setting;
   config_get fw_type "$config" "filter_type" "unset"
   if [ "$fw_type" == "ip_filter" ];then
      if [ "$IP_FILTER_ENABLE_TYPE" == "FW" ] ;then
        config_get ui_setting "$config" "ui_enabled"
        if [ -n ui_setting ];then
          uci_set "$FW" "$config" "enabled" $ui_setting
        fi
      elif [ "$IP_FILTER_ENABLE_TYPE" == "UI" ];then
        uci_set "$FW" "$config" "enabled" "1"
        uci_set "$FW" "$config" "ui_enabled" "1"
      fi
   fi
}
foreach_dmz_enable()
{
   local config="$1"
   local fw_type;
   local ui_setting;
   config_get fw_type "$config" "fw_type" "unset"
   if [ "$fw_type" == "dmz" ];then
      if [ "$DMZ_DISABLE" == "1" ] ;then
        if [ -n ui_setting ];then
          uci_set "$FW" "$config" "enabled" "0"
        fi
      elif [ "$DMZ_DISABLE" == "0" ];then
        uci_set "$FW" "$config" "enabled" "1"
      fi
   fi
}
foreach_port_mapping_enable()
{
   local config="$1"
   local fw_type;
   local ui_setting;
   config_get fw_type "$config" "fw_type" "unset"
   if [ "$fw_type" == "mapping" ];then
      if [ "$DMZ_DISABLE" == "1" ] ;then
        if [ -n ui_setting ];then
          uci_set "$FW" "$config" "enabled" "0"
        fi
      elif [ "$DMZ_DISABLE" == "0" ];then
        uci_set "$FW" "$config" "enabled" "1"
      fi
   fi
}

set_dmz_enable()
{
   config_foreach foreach_dmz_enable redirect
}
set_dmz_enable()
{
   config_foreach foreach_port_mapping_enable redirect
}

set_ip_filter_enable()
{
   IP_FILTER_ENABLE_TYPE=$1;
   config_foreach foreach_ip_enable rule
}
foreach_defaults()                                  
{                                                      
  local config="$1"                                    
  config_get IP_FILTER_DISABLE "$config" "ip_filter_disable"
  config_get DN_FILTER_DISABLE "$config" "dn_filter_disable"
  config_get WAN_PING_DISABLE "$config" "wan_ping"
  config_get DMZ_DISABLE "$config" "dmz_disable"
  config_get SIP_ALG_ENABLE "$config" "sip_alg_enable"
}                                
foreach_rules_enable()                                  
{                                                      
  local config="$1"
  local rule_name;
  config_get rule_name "$config" "name"

  echo "$rule_name"
  if [ "$rule_name" == "Allow-Ping" ]; then	
  	if [ "$WAN_PING_DISABLE" == "1" ]; then
		uci_set "$FW" "$config" "target" "REJECT"
		iptables -I input_rule -p icmp --icmp-type 8 -j DROP
	elif [ "$WAN_PING_DISABLE" == "0" ] ;then
		uci_set "$FW" "$config" "target" "ACCEPT"
		iptables -F input_rule
  	fi
  fi

  uci_commit "$FW"
}
foreach_rules_disable()                                  
{                                                      
  local config="$1"
  local rule_name;
  config_get rule_name "$config" "name"

  echo "$rule_name"
  if [ "$rule_name" == "Allow-Ping" ]; then	
		iptables -I input_rule -p icmp --icmp-type 8 -j DROP
		uci_set "$FW" "$config" "target" "REJECT"
  fi

  uci_commit "$FW"
}

handle_addnhosts()
{
  local value="$1"

  if [ "$value" == "$DN_FILTER_ADDN_FILE" ]; then
	FIND_ADDNHOSTS=1
  fi 
}
foreach_handle_dnsmasq()
{
   local config="$1"
   config_list_foreach "$config" "addnhosts" handle_addnhosts
}
foreach_add_addnhosts()
{
	echo "enter add addnhosts"
	local config="$1"
	config_add_list "$config" "addnhosts" "$DN_FILTER_ADDN_FILE"
}
check_addn_path()
{

	#check if /etc/config/dhcp include "addnhosts"
	config_load "$UI_DHCP_FILE"
	FIND_ADDNHOSTS=0
	config_foreach foreach_handle_dnsmasq "dnsmasq"
	uci_commit "$UI_DHCP_FILE"
	if [ "$FIND_ADDNHOSTS" -eq 0 ];then
		uci export dhcp
	  	uci add_list dhcp.@dnsmasq[0].addnhosts="$DN_FILTER_ADDN_FILE"
		uci commit
		#config_foreach foreach_add_addnhosts "dnsmasq"
	fi
}

check_ntp_config(){
	local ntp_enable
	
	config_load "$NTP_CONF_FILE"
	config_get ntp_enable ntp ntp_disable

	echo "$ntp_enable"

	if [ "$ntp_enable" = "1" ] ; 
	then
		echo "stop ntp"
		/etc/init.d/sysntpd stop
	else
		echo "start ntp"
		/etc/init.d/sysntpd start
	fi
}

remove_dns_from_cron()
{
	if [ ! -f "$CRONTABS_TMP" ] ;then
		touch $CRONTABS_TMP
		chmod 666 $CRONTABS_TMP
	fi 
	echo "" > $CRONTABS_TMP

	if [ -f "$CRONTABS_CONFIG_FILE" ] ; then
		sed "/fw_ui_transfer.sh/d" $CRONTABS_CONFIG_FILE > $CRONTABS_TMP
	        cp $CRONTABS_TMP $CRONTABS_CONFIG_FILE
	fi
	rm $CRONTABS_TMP	
}

foreach_addinto_addnhost()
{
	local config="$1"
	local start_time
	local stop_time
	local start_sec
	local stop_sec
	local cur_sec
	local cur_date
	local start_date_time
	local stop_date_time
	local enabled
	
	config_get enabled "$config"	"enabled"
	if [ $enabled == "0" ]; then
		return 0
	fi 
	
	config_get start_time "$config"	"start_time"
	config_get stop_time	"$config"	"stop_time"
	cur_date=$(date +%Y-%m-%d)

	start_date_time=$cur_date" "$start_time":00"
	stop_date_time=$cur_date" "$stop_time":00"	
	cur_sec=$(date +%s)

	start_sec=$(date -d "$start_date_time"	+%s)
	stop_sec=$(date -d "$stop_date_time"	+%s)

	if [ $cur_sec -ge $start_sec ]; then

		if [ $cur_sec -lt $stop_sec ]; then
			config_get domain_url "$config"	"domain_name"
		        echo "$DN_REDIRECT_URL $domain_url" >> $DN_FILTER_ADDN_FILE
		fi
	fi			
}	

foreach_addinto_conf()
{
	local config="$1"
	local start_date_time
	local stop_date_time
	local enabled
	
	config_get enabled "$config"	"enabled"
	if [ $enabled == "0" ]; then
		return 0
	fi 

	if [ $cur_sec -ge $start_sec ]; then

		if [ $cur_sec -lt $stop_sec ]; then
			config_get domain_url "$config"	"domain_name"
		        echo "server=/.$domain_url/8.8.8.8" >> $DN_CONFIG_FILE
		fi
	fi			

}


foreach_addinto_cron()
{
	local config="$1"
	local start_time;
	local stop_time;
	local hour;
	local min;
	
	config_get start_time "$config"	"start_time"
	config_get stop_time	"$config"	"stop_time"
	
	hour=${start_time%:*}
	min=${start_time#*:}
	
	echo "$min $hour * * * $CHECK_DNFILTER_CRON" >> $CRONTABS_CONFIG_FILE
	
	unset hour
	unset min
	hour=${stop_time%:*}
        min=${stop_time#*:}

        echo "$min $hour * * * $CHECK_DNFILTER_CRON" >> $CRONTABS_CONFIG_FILE
	
}

add_dnfilter_to_addnhosts()
{
	rm -f "$DN_FILTER_ADDN_FILE"
   	config_foreach foreach_addinto_addnhost "dnsblacklist"
   	if [ ! -f "$DN_FILTER_ADDN_FILE" ]; then
        	touch $DN_FILTER_ADDN_FILE
        	echo "" > $DN_FILTER_ADDN_FILE
   	fi

}
add_dn_whiltelist_to_conf()
{
	config_foreach foreach_addinto_conf "dnswhitelist"
	if [ ! -f "$DN_CONFIG_FILE" ]; then
        	touch $DN_CONFIG_FILE
        	echo "" > $DN_CONFIG_FILE
   	fi
}

check_addinto_cron()
{
	local count;
	remove_dns_from_cron;
	
    if [ ! -f "$CRONTABS_CONFIG_FILE" ] ; then
	 	if [ ! -d "$CRONTABS_PATH" ]; then
			mkdir -p $CRONTAB_PATH
		fi
		touch $CRONTABS_CONFIG_FILE		
	fi

	count=`ps | grep -c cron`
	echo "$count"
	if [ $count -eq 1 ] ; then
		/etc/init.d/cron restart
	fi
	
	config_foreach foreach_addinto_cron "dnsblacklist"
}

restart_dns()
{
	"$DNS_MSG_RESTRAT" restart
}

set_dn_filter_enable()                               
{
   	rm -f "$DN_FILTER_ADDN_FILE"
   	check_addinto_cron
	add_dnfilter_to_addnhosts
}

set_dn_white_reset()
{
	rm -f "$DN_CONFIG_FILE"
	add_dn_whiltelist_to_conf
}

set_dn_filter_disable()                              
{
   	remove_dns_from_cron	
	
   	echo "" > $DN_FILTER_ADDN_FILE
}

set_dn_white_disable()
{
	echo "" > $DN_CONFIG_FILE
}
set_dn_black_disable()
{
	echo "" > $DN_RESOLV_FILE
}
set_wan_ping_disable()
{
	config_foreach foreach_rules_disable rule
}

set_wan_ping_enable()
{
	config_foreach foreach_rules_enable rule
}

set_fw_disable()                                            
{

  set_ip_filter_disable "FW"
  set_dn_filter_disable
  set_wan_ping_disable
  set_dmz_disable
}

set_fw_enable()                                     
{
  config_foreach foreach_defaults defaults

  if [ "$IP_FILTER_DISABLE" == "0" ] ;then
    set_ip_filter_enable "FW"
  fi
  
  if [ "$DN_FILTER_DISABLE" == "0" ];then
     set_dn_filter_enable "FW"
  fi

  if [ "$WAN_PING_DISABLE" == "0" ] ;then
  	set_wan_ping_enable
  fi

  if [ "$DMZ_DISABLE" == "0" ] ;then
  	set_dmz_enable
  fi

  
}

set_sip_alg_disable(){
	rmmod /lib/modules/3.10.14/nf_nat_sip.ko
	rmmod /lib/modules/3.10.14/nf_conntrack_sip.ko
}

set_sip_alg_enable(){
	insmod /lib/modules/3.10.14/nf_conntrack_sip.ko
	insmod /lib/modules/3.10.14/nf_nat_sip.ko
}

set_sip_alg_reset(){
	config_foreach foreach_defaults defaults
  if [ "$SIP_ALG_ENABLE" == "0" ] ;then
	set_sip_alg_disable "FW"
  fi
  if [ "$SIP_ALG_ENABLE" == "1" ] ;then
	set_sip_alg_enable "FW"
  fi
}

isnumber()
{
  ret=`expr match $1 "[0-9][0-9]*$"`
  if [ $ret -gt 0 ];then
        return 0
  else
        return 1
  fi
}

del_trigger_rule()
{
	local del_list;
	local keys;
	local revert_list;
   	del_list=`iptables -L --line-number | grep TRIGGER | cut -d ' ' -f 1 | tr "\n" " "`

	for keys in $del_list
	do
	  revert_list=$keys' '$revert_list
	done

	for keys in $revert_list
	do
	  iptables -D FORWARD $keys
	done
	
	unset del_list
	unset revert_list
	del_list=`iptables -t nat -L --line-number | grep TRIGGER | cut -d ' ' -f 1 | tr "\n" " "`
        for keys in $del_list                                                                    
        do                                                                                       
          revert_list=$keys' '$revert_list                                                       
        done                                                                                     
        for keys in $revert_list                                                                 
        do                                                                                       
          iptables -t nat -D PREROUTING $keys                                                              
        done     

}
foreach_trigger_rule()
{

	local config="$1"
	local enabled;
	local out_port;
	local out_proto;
	local in_port;
	local in_proto;

	config_get enabled "$config" "enabled" "unset"

	if [ $enabled == "0" ]; then
		return 0
	fi
	
	config_get out_port "$config" "out_port"
	config_get in_port "$config"	"in_port"
	config_get in_proto "$config"	"in_proto"
	config_get out_proto	"$config"	"out_proto"

	echo "$out_port $out_port $in_proto $out_proto"

	iptables -I FORWARD -p $out_proto --dport $out_port -j TRIGGER --trigger-type out --trigger-match $out_port --trigger-relate $in_port --trigger-proto $in_proto
 }

get_ip_third_number()
{
	echo "$1" | awk -F '.' '{print $3}'
}

get_gateway_ip(){
	local gate_ip;
	local ip_1;
	local ip;
	
	config_load "$NETWORK_CONF_FILE"
	config_get gate_ip lan ipaddr
	echo "$gate_ip"
	ip_2=$(get_ip_third_number $gate_ip)
	ip_1=${gate_ip:0:7}
	ip=$ip_1.$ip_2.0
	echo "new ip :$ip"
	`iptables -t nat -A PREROUTING ! -s $ip/24 -j TRIGGER --trigger-type dnat`

}

set_trigger_rule()
{
	local ip;
	
	#`iptables -I FORWARD -j TRIGGER --trigger-type in`
	config_foreach foreach_trigger_rule "port_trigger_rule"
	get_gateway_ip
	#`iptables -t nat -A PREROUTING ! -s $ip/24 -j TRIGGER --trigger-type dnat`
}

INPUT_TYPE="$1"                                             
echo "input : $INPUT_TYPE"                           
echo "$UI_FW_FILE"                                  
config_load "$UI_FW_FILE"        
case "$INPUT_TYPE" in                                       
   "FW_DISABLE" )                                           
    set_fw_disable
    restart_dns ;;
   "FW_ENABLE" )                             
    set_fw_enable 
    restart_dns ;;                                 
   "SIP_ALG_RESET" )
   	set_sip_alg_reset ;;
   "IP_ENABLE" )                                     
    set_ip_filter_enable "UI" ;;                   
   "IP_DISABLE" )                                   
    set_ip_filter_disable "UI" ;;                           
   "DN_DISABLE" )                                            
    set_dn_filter_disable "UI"
   	restart_dns ;;
    "DN_RESET" )
    set_dn_filter_enable 
    restart_dns ;;
   "DN_ENABLE" )                                   
    set_dn_filter_enable
    restart_dns ;;
   "DN_WHITE_RESET" )
	set_dn_white_reset 
	restart_dns ;;
   "DN_WHITE_DISABLE" )
   	set_dn_white_disable ;; 
   "DN_BLACK_DISABLE" )
   	set_dn_black_disable ;; 
    "PORT_TRIGGER_RESET")
     echo "here"
     del_trigger_rule
     set_trigger_rule ;;
esac                                                 
uci_commit "$UI_FW_FILE" 

check_addn_path;
check_ntp_config;
