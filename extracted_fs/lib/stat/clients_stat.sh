#!/bin/sh

INTERNAL_NETMASK=127.0.0.1
CLIENTS_TRAFFIC_IN_FILE=/etc/stat/client/traffic_in_tmp
CLIENTS_TRAFFIC_OUT_FILE=/etc/stat/client/traffic_out_tmp
CLIENTS_MANAGE_PATH=/etc/stat/client/client_manage
CLIENTS_DAILY_PATH=/etc/stat/client/client_daily
STAT_DAILY_PATH=/etc/stat/monitor/daily
STAT_IDLE_PATH=/etc/stat/monitor/idle_daily
STAT_PERIOD_PATH=/etc/stat/monitor/period_daily
CRONTABS_PATH=/etc/crontabs/
CRONTABS_CONFIG_FILE=/etc/crontabs/root

WAN_IFACE=eth1
LAN_IFACEs=lan

lock()
{
  while [ -f /tmp/wrtbwmon.lock ]; do
    if [ ! -d /proc/$(cat /tmp/wrtbwmon.lock) ]; then
     # echo "WARNING : Lockfile detected but process $(cat /tmp/wrtbwmon.lock) does not exist !"
      rm -f /tmp/wrtbwmon.lock
    fi
    sleep 1
  done
  echo $$ > /tmp/wrtbwmon.lock
}

unlock()
{
  rm -f /tmp/wrtbwmon.lock
}

usage()
{
  echo "Usage : $0 {remove|setup| resetup}} "
  exit 1
}
update_ip_rules()
{
	
	 for LAN_IFACE in ${LAN_IFACEs}; do
        #For each host in the ARP table
        grep ${LAN_IFACE} /proc/net/arp | while read IP TYPE FLAGS MAC MASK IFACE
        do
          #Add iptables rules (if non existing).
          iptables -nL ACCOUNTING_IN | grep "${IP} " > /dev/null
          if [ $? -ne 0 ]; then
            iptables -A ACCOUNTING_IN -d ${IP} -s ${INTERNAL_NETMASK} -j RETURN
            iptables -A ACCOUNTING_IN -d ${IP} ! -s ${INTERNAL_NETMASK} -j RETURN
    
            iptables -A ACCOUNTING_OUT -s ${IP} -d ${INTERNAL_NETMASK} -j RETURN
            iptables -A ACCOUNTING_OUT -s ${IP} ! -d ${INTERNAL_NETMASK} -j RETURN
          fi
        done
    done
}
update_wan_ifaces()
{    
      # insert new jump rules at start of FORWARD chain
    for WAN_IFACE in ${WAN_IFACEs}; do
    	iptables  -L FORWARD -v | grep WAN_IFACE | grep ACCOUNTING_IN
    	if [ $? -ne 0 ]; then
      	iptables -I FORWARD -i ${WAN_IFACE} -j ACCOUNTING_IN
      fi
       iptables  -L FORWARD -v | grep WAN_IFACE | grep ACCOUNTING_OUT
     	if [ $? -ne 0 ]; then
      	iptables -I FORWARD -o ${WAN_IFACE} -j ACCOUNTING_OUT
			fi
    done
}
add_day_change_task()
{
	if [ ! -f "$CRONTABS_CONFIG_FILE" ] ; then
                if [ ! -d "$CRONTABS_PATH" ]; then
                        mkdir -p $CRONTAB_PATH
                fi
                touch $CRONTABS_CONFIG_FILE
        fi
    sed -i '/day_change/'d "$CRONTABS_CONFIG_FILE"
	echo "0 0 * * * ubus call statistics day_change" >> $CRONTABS_CONFIG_FILE 
}

# check command line args
[ -z "${1}" ] && echo "ERROR : Missing argument 1: command" && usage
COMMAND=${1}
WAN_IFACEs=${2}
case ${COMMAND} in

  "remove" )
    # echo "removing jumps to accounting chains"
    iptables -D FORWARD $(iptables -L FORWARD --line-numbers | grep ACCOUNTING | grep -m 1 -o [0-9]*)
    while [ $? -eq 0 ]; do
      iptables -D FORWARD $(iptables -L FORWARD --line-numbers | grep ACCOUNTING | grep -m 1 -o [0-9]*)
    done
    # echo "flushing accounting chains"
    iptables -F ACCOUNTING_IN
    iptables -F ACCOUNTING_OUT
    # echo "removing accounting chains"
    iptables -X ACCOUNTING_IN
    iptables -X ACCOUNTING_OUT
    ;;

  "setup" )

	add_day_change_task
	if [ ! -d "$CLIENTS_MANAGE_PATH" ]; then
		mkdir -p "$CLIENTS_MANAGE_PATH"
	fi
	if [ ! -d "$CLIENTS_DAILY_PATH" ]; then
		mkdir -p "$CLIENTS_DAILY_PATH"
	fi	
	if [ ! -d "$STAT_DAILY_PATH" ]; then
		mkdir -p "$STAT_DAILY_PATH"
	fi
	if [ ! -d "$STAT_IDLE_PATH" ]; then
		mkdir -p "$STAT_IDLE_PATH"
	fi
	if [ ! -d "$STAT_PERIOD_PATH" ]; then
		mkdir -p "$STAT_PERIOD_PATH"
	fi

    if [[ ! -z "$LAN_IFACEs" ]]; then
        #LAN_IFACEs="$LAN_IFACE"
        echo ""
    fi

    # create the ACCOUNTING chains
    iptables -N ACCOUNTING_IN 2> /dev/null
    iptables -N ACCOUNTING_OUT 2> /dev/null

    # check if jumps to the ACCOUNTING chains are still at the start of the FORWARD chain
    iptables -L FORWARD --line-numbers -n | grep "ACCOUNTING" | grep "^1 "
    if [ $? -eq 0 ]; then
      # remove old jump rules
      iptables -D FORWARD $(iptables -L FORWARD --line-numbers | grep ACCOUNTING | grep -m 1 -o "[0-9]*")
      while [ $? -eq 0 ]; do
        iptables -D FORWARD $(iptables -L FORWARD --line-numbers | grep ACCOUNTING | grep -m 1 -o "[0-9]*")
      done
    fi
      # insert new jump rules at start of FORWARD chain
      iptables -I FORWARD -i ${WAN_IFACE} -j ACCOUNTING_IN
      iptables -I FORWARD -o ${WAN_IFACE} -j ACCOUNTING_OUT

    #
    for LAN_IFACE in ${LAN_IFACEs}; do
        #For each host in the ARP table
        grep ${LAN_IFACE} /proc/net/arp | while read IP TYPE FLAGS MAC MASK IFACE
        do
          #Add iptables rules (if non existing).
          iptables -nL ACCOUNTING_IN | grep "${IP} " > /dev/null
          if [ $? -ne 0 ]; then
            iptables -A ACCOUNTING_IN -d ${IP} -s ${INTERNAL_NETMASK} -j RETURN 2> /dev/null
            iptables -A ACCOUNTING_IN -d ${IP} ! -s ${INTERNAL_NETMASK} -j RETURN 2> /dev/null
    
            iptables -A ACCOUNTING_OUT -s ${IP} -d ${INTERNAL_NETMASK} -j RETURN 2> /dev/null
            iptables -A ACCOUNTING_OUT -s ${IP} ! -d ${INTERNAL_NETMASK} -j RETURN 2> /dev/null
          fi
        done
    done
    ;;
  "update" )
 
    lock
    #Read and reset counters
    iptables -L ACCOUNTING_IN -vnxZ -t filter > /tmp/traffic_in_$$.tmp
    iptables -L ACCOUNTING_OUT -vnxZ -t filter > /tmp/traffic_out_$$.tmp

    grep 0x /proc/net/arp | egrep "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | while read IP TYPE FLAGS MAC MASK IFACE
    do
      # echo "Updating stats for ${IP} ${MAC}"

      # incoming traffic
      grep ${IP} /tmp/traffic_in_$$.tmp | while read PKTS BYTES TARGET PROT OPT IFIN IFOUT SRC DST
      do
        # check for exclude filter, to distinguish external and internal traffic
        echo "${SRC} ${DST}" | grep "!" > /dev/null
        if [ $? -ne 0 ]; then
         # echo "Adding internal traffic from ${SRC} to ${DST}"
          [ "${DST}" = "${IP}" ] && echo ${IP} ${BYTES} >> /tmp/in_$$.tmp
        else
         # echo "Adding external traffic from ${SRC} to ${DST}"
          [ "${DST}" = "${IP}" ] && echo ${IP} ${BYTES} >> /tmp/in_external_$$.tmp
        fi
      done
      # outgoing traffic
      grep ${IP} /tmp/traffic_out_$$.tmp | while read PKTS BYTES TARGET PROT OPT IFIN IFOUT SRC DST
      do
        # check for exclude filter, to distinguish external and internal traffic
        echo "${SRC} ${DST}" | grep "!" > /dev/null
        if [ $? -ne 0 ]; then
        #  echo "Adding internal traffic from ${SRC} to ${DST}"
          [ "${SRC}" = "${IP}" ] && echo ${IP} ${BYTES} >> /tmp/out_$$.tmp
        else
         # echo "Adding external traffic from ${SRC} to ${DST}"
          [ "${SRC}" = "${IP}" ] && echo ${IP} ${BYTES} >> /tmp/out_external_$$.tmp
        fi
      done
    done
		mv /tmp/in_external_$$.tmp ${CLIENTS_TRAFFIC_IN_FILE}
		mv /tmp/out_external_$$.tmp ${CLIENTS_TRAFFIC_OUT_FILE}
		
    #Free some memory
    rm -f /tmp/*_$$.tmp
    unlock
    ;;
   "update_ip" )
   update_ip_rules
   ;;
   "update_wan" )
   update_wan_ifaces
   ;;
   "cl_monitor_data" )
   rm /etc/stat/monitor/daily/*
   rm /etc/stat/monitor/idle_daily/*
   rm /etc/stat/monitor/period_daily/*
   ;;
   "cl_common_data" )
   rm /etc/stat/monitor/common_stat
   ;;
   "cl_client_info" )
   rm /etc/stat/client/client_daily/*
   #rm /etc/stat/client/client_manage/conn_info
   true >etc/stat/client/client_manage/conn_info
   ;;
   "cl_client_data")
   rm /etc/stat/client/client_daily/*
   ;;
   "send_usb_conn")
   `ubus send usb_event '{"usb_state":"connect"}'`
   ;;
   "send_usb_disconn")
   `ubus send usb_event '{"usb_state":"disconnect"}'`
   ;;
  *)
    usage
    ;;

esac
