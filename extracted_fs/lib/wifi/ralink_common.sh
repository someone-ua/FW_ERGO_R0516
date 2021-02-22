# this file will be included in 
#     /lib/wifi/mt{chipname}.sh

set_mtk_wep(){
    echo "set_mtk_wep" >>/tmp/wifi.log                                    
    vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
    echo $vifs >>/tmp/wifi.log
    
    for vif in $vifs; do                                                       
        local encryption key ifname ssid                                           
        echo  "<<<<<<<<<<<<<<<<<" >>/tmp/wifi.log          
        encryption=`uci -q get ${vif}.encryptionwebui | grep "wep"`  
	[ -z $encryption ] && break     
	key=`uci -q get ${vif}.key1`
	ifname=`uci -q get ${vif}.ifname`
	ssid=`uci -q get ${vif}.ssid`
	if [ "$encryption" == "wep" ];
	then
	    iwpriv $ifname set AuthMode=OPEN
	    iwpriv $ifname set EncrypType=NONE
	else
 	    iwpriv $ifname set AuthMode=SHARED                                        
            iwpriv $ifname set EncrypType=WEP
	    iwpriv $ifname set Key1=$key
	    iwpriv $ifname set DefaultKeyID=1
	fi

	iwpriv ra0 set IEEE8021X=0
	#iwpriv ra0 set SSID=$ssid
	if [ "$ifname" == "ra0" ]
	then
		ubus send ssid.stat.change ' { "ifname" : "0" } '
	elif [ "$ifname" == "ra1" ]
	then
		ubus send ssid.stat.change ' { "ifname" : "1" } '
	elif [ "$ifname" == "ra2" ]
	then
		ubus send ssid.stat.change ' { "ifname" : "2" } '
	elif [ "$ifname" == "ra3" ]
	then
		ubus send ssid.stat.change ' { "ifname" : "3" } '
	else
		echo  "$ifname not support" >>/tmp/wifi.log
	fi
        echo  ">>>>>>>>>>>>>>>>>" >>/tmp/wifi.log                             
    done 

}

set_mtk_hwmode(){
    echo "set_mtk_hwmode" >>/tmp/wifi.log                         
    dev_ifs=`uci show wireless | grep "=wifi-device" | sed -n "s/=wifi-device//gp"`
    echo $dev_ifs >>/tmp/wifi.log                                   
                                                                              
    for dev_if in ${dev_ifs}; do                               
        local hwmode ifname disabled                                     
        echo  "<<<<<<<<<<<<<<<<<" >>/tmp/wifi.log        
        hwmode=`uci -q get ${dev_if}.hwmode`
	vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
	for vif in $vifs; do
		disabled=`uci -q get ${vif}.disabled`
		[ "$disabled" == "1" ] && continue
		ifname=`uci -q get ${vif}.ifname`

		case "$hwmode" in
	    		"11n")
				iwpriv $ifname set WirelessMode=6
			;; 
	    		"11ng")
				iwpriv $ifname set WirelessMode=9
			;; 
	    		"11bg")
				iwpriv $ifname set WirelessMode=0
			;; 
	    		"11b")
				iwpriv $ifname set WirelessMode=1
			;; 
	    		"11g")
				iwpriv $ifname set WirelessMode=4
			;; 
		esac      
	done           
        echo  ">>>>>>>>>>>>>>>>>" >>/tmp/wifi.log  
    done      
}

set_mtk_isolate(){
    local device="$1"                                       
    config_get vifs "$device" vifs
    echo "set_mtk_isolate" >>/tmp/wifi.log
    #vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
    echo $vifs >>/tmp/wifi.log
	
    for vif in $vifs; do
	local isolate ifname
	vif=wireless.$vif
	echo  "<<<<<<<<<<<<<<<<<" >>/tmp/wifi.log
	ifname=`uci -q get ${vif}.ifname`
	isolate=`uci -q get ${vif}.isolate`
	if [ "$isolate" == "1" ];
	then
	    iwpriv $ifname set NoForwarding=1
	else
	    iwpriv $ifname set NoForwarding=0
	fi
	echo  ">>>>>>>>>>>>>>>>>" >>/tmp/wifi.log
    done
}

set_mtk_macfilter(){
    local device="$1"                                       
    config_get vifs "$device" vifs
    echo "set_mtk_macfilter" >>/tmp/wifi.log
    #vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
    echo $vifs >>/tmp/wifi.log

    for vif in $vifs; do
	local maclist macfilter ifname
	vif=wireless.$vif
	echo  "<<<<<<<<<<<<<<<<<" >>/tmp/wifi.log
	maclist=`uci -q get ${vif}.maclist | grep ":"`
	macfilter=`uci -q get ${vif}.macfilter`
	ifname=`uci -q get ${vif}.ifname`
	maclist_block=`uci -q get ${vif}.maclist_block | grep ":"`

	if [ "$maclist" == "" ]
	then
	    echo  "maclist is null" >>/tmp/wifi.log
	else
	    maclist=`echo ${maclist// /;}`
	    echo  "maclist is $maclist" >>/tmp/wifi.log
	fi
	
	case "$macfilter" in
	    disable)
		    	if [ -z $maclist_block ]
		    	then
		    iwpriv $ifname set ACLClearAll=1
		    iwpriv $ifname set AccessPolicy=0
			else
				mac_block=`echo ${maclist_block// /;}`
				iwpriv $ifname set ACLClearAll=1
				iwpriv $ifname set AccessPolicy=2
				iwpriv $ifname set ACLAddEntry="$mac_block"
			fi
		;;
	    allow)
		    iwpriv $ifname set ACLClearAll=1
		    iwpriv $ifname set AccessPolicy=1
		    iwpriv $ifname set ACLAddEntry="$maclist"
		;;
	    deny)
                        if [ -z $maclist_block ]                                  
                        then                                                       
		    iwpriv $ifname set ACLClearAll=1
		    iwpriv $ifname set AccessPolicy=2
		    iwpriv $ifname set ACLAddEntry="$maclist"
                        else                                                      
                                block=`echo ${maclist_block// /;}`
				maclist=${maclist}";"${block}             
                                iwpriv $ifname set ACLClearAll=1                   
                                iwpriv $ifname set AccessPolicy=2                  
                                iwpriv $ifname set ACLAddEntry="$maclist"        
                        fi 	
		;;
	esac
	echo  ">>>>>>>>>>>>>>>>>>>>" >>/tmp/wifi.log
    done
}

set_mtk_maxsta(){
    local device="$1"
    local num 
    local ifname
    echo  "<<<<<<<<<<<<<<<<<<<<" >>/tmp/wifi.log
    echo "set_mtk_maxsta" >>/tmp/wifi.log
    #vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
    echo $vifs >>/tmp/wifi.log

    if [ "mt7628" == "$device" ]
    then
	num=`uci -q get wireless.AP0_setting.client_num`
	ifname=ra0
    elif [ "mt7612e" == "$device" ]
    then
	num=`uci -q get wireless.AP1_setting.client_num`
	ifname=rai0
    fi 
    iwpriv $ifname set MaxCliNum=$num
    echo  ">>>>>>>>>>>>>>>>>>>>" >>/tmp/wifi.log
}

repair_wireless_uci() {
    echo "repair_wireless_uci" >>/tmp/wifi.log
    vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
    echo $vifs >>/tmp/wifi.log

    ifn5g=0
    ifn2g=0
    for vif in $vifs; do
        local netif nettype device netif_new
        echo  "<<<<<<<<<<<<<<<<<" >>/tmp/wifi.log
        netif=`uci -q get ${vif}.ifname`
        nettype=`uci -q get ${vif}.network`
        device=`uci -q get ${vif}.device`
        if [ "$device" == "" ]; then
            echo "device cannot be empty!!" >>/tmp/wifi.log
            return
        fi
        echo "device name $device!!" >>/tmp/wifi.log
        echo "netif $netif" >>/tmp/wifi.log
        echo "nettype $nettype" >>/tmp/wifi.log
    
        case "$device" in
            mt7620 | mt7602e | mt7603e | mt7628 | mt7688)
                netif_new="ra"${ifn2g}
                ifn2g=$(( $ifn2g + 1 ))
                ;;
            mt7610e | mt7612e )
                netif_new="rai"${ifn5g}
                ifn5g=$(( $ifn5g + 1 ))
                ;;
            * )
                echo "device $device not recognized!! " >>/tmp/wifi.log
                ;;
        esac                    
    
        echo "ifn5g = ${ifn5g}, ifn2g = ${ifn2g}" >>/tmp/wifi.log
        echo "netif_new = ${netif_new}" >>/tmp/wifi.log
            
        if [ "$netif" == "" ]; then
            echo "ifname empty, we'll fix it with ${netif_new}" >>/tmp/wifi.log
            uci -q set ${vif}.ifname=${netif_new}
        fi
        if [ "$nettype" == "" ]; then
            nettype="lan"
            echo "nettype empty, we'll fix it with ${nettype}" >>/tmp/wifi.log
            uci -q set ${vif}.network=${nettype}
        fi
        echo  ">>>>>>>>>>>>>>>>>" >>/tmp/wifi.log
    done
    uci changes >>/tmp/wifi.log
    uci commit
}


sync_uci_with_dat() {
    echo "sync_uci_with_dat($1,$2,$3,$4)" >>/tmp/wifi.log
    local device="$1"
    local datpath="$2"
    uci2dat -d $device -f $datpath > /tmp/uci2dat.log
}



chk8021x() {
        local x8021x="0" encryption device="$1" prefix
        #vifs=`uci show wireless | grep "=wifi-iface" | sed -n "s/=wifi-iface//gp"`
        echo "u8021x dev $device" > /tmp/802.$device.log
        config_get vifs "$device" vifs
        for vif in $vifs; do
                config_get ifname $vif ifname
                echo "ifname = $ifname" >> /tmp/802.$device.log
                config_get encryption $vif encryption
                echo "enc = $encryption" >> /tmp/802.$device.log
                case "$encryption" in
                        wpa+*)
                                [ "$x8021x" == "0" ] && x8021x=1
                                echo 111 >> /tmp/802.$device.log
                                ;;
                        wpa2+*)
                                [ "$x8021x" == "0" ] && x8021x=1
                                echo 1l2 >> /tmp/802.$device.log
                                ;;
                        wpa-mixed*)
                                [ "$x8021x" == "0" ] && x8021x=1
                                echo 1l3 >> /tmp/802.$device.log
                                ;;
                esac
                ifpre=$(echo $ifname | cut -c1-3)
                echo "prefix = $ifpre" >> /tmp/802.$device.log
                if [ "$ifpre" == "rai" ]; then
                    prefix="rai"
                else
                    prefix="ra"
                fi
                if [ "1" == "$x8021x" ]; then
                    break
                fi
        done
        echo "x8021x $x8021x, pre $prefix" >>/tmp/802.$device.log
        if [ "1" == $x8021x ]; then
            if [ "$prefix" == "ra" ]; then
                echo "killall 8021xd" >>/tmp/802.$device.log
                killall 8021xd
                echo "/bin/8021xd -d 9" >>/tmp/802.$device.log
                /bin/8021xd -d 9 >> /tmp/802.$device.log 2>&1
            else # $prefixa == rai
                echo "killall 8021xdi" >>/tmp/802.$device.log
                killall 8021xdi
                echo "/bin/8021xdi -d 9" >>/tmp/802.$device.log
                /bin/8021xdi -d 9 >> /tmp/802.$device.log 2>&1
            fi
        else
            if [ "$prefix" == "ra" ]; then
                echo "killall 8021xd" >>/tmp/802.$device.log
                killall 8021xd
            else # $prefixa == rai
                echo "killall 8021xdi" >>/tmp/802.$device.log
                killall 8021xdi
            fi
        fi
}


# $1=device, $2=module
reinit_wifi() {
    echo "reinit_wifi($1,$2,$3,$4)" >>/tmp/wifi.log
    local device="$1"
    local module="$2"
    config_get vifs "$device" vifs

    # shut down all vifs first
    for vif in $vifs; do
        config_get ifname $vif ifname
        ifconfig $ifname down
    done

    # in some case we have to reload drivers. (mbssid eg)
    #ref=`cat /sys/module/$module/refcnt`
    #if [ $ref != "0" ]; then
    #    # but for single driver, we only need to reload once.
    #    echo "$module ref=$ref, skip reload module" >>/tmp/wifi.log
    #else
    #    echo "rmmod $module" >>/tmp/wifi.log
    #    rmmod $module
    #    echo "insmod $module" >>/tmp/wifi.log
    #    insmod $module
    #fi

    # bring up vifs
    for vif in $vifs; do
        config_get ifname $vif ifname
        config_get disabled $vif disabled
        echo "ifconfig $ifname down" >>/tmp/wifi.log
        if [ "$disabled" == "1" ]; then
            echo "$ifname marked disabled, skip" >>/tmp/wifi.log
            continue
        else
            echo "ifconfig $ifname up" >>/tmp/wifi.log
            ifconfig $ifname up
        fi
    done

    chk8021x $device
}

prepare_ralink_wifi() {
    echo "prepare_ralink_wifi($1,$2,$3,$4)" >>/tmp/wifi.log
    local device=$1
    config_get channel $device channel
    config_get ssid $2 ssid
    config_get mode $device mode
    config_get ht $device ht
    config_get country $device country
    config_get regdom $device regdom

    # HT40 mode can be enabled only in bgn (mode = 9), gn (mode = 7)
    # or n (mode = 6).
    HT=0
    [ "$mode" = 6 -o "$mode" = 7 -o "$mode" = 9 ] && [ "$ht" != "20" ] && HT=1

    # In HT40 mode, a second channel is used. If EXTCHA=0, the extra
    # channel is $channel + 4. If EXTCHA=1, the extra channel is
    # $channel - 4. If the channel is fixed to 1-4, we'll have to
    # use + 4, otherwise we can just use - 4.
    EXTCHA=0
    [ "$channel" != auto ] && [ "$channel" -lt "5" ] && EXTCHA=1
    
}

scan_ralink_wifi() {
    local device="$1"
    local module="$2"
    echo "scan_ralink_wifi($1,$2,$3,$4)" >>/tmp/wifi.log
    repair_wireless_uci
    sync_uci_with_dat $device /etc/wireless/$device/$device.dat
}

disable_ralink_wifi() {
    echo "disable_ralink_wifi($1,$2,$3,$4)" >>/tmp/wifi.log
    local device="$1"
    config_get vifs "$device" vifs
    for vif in $vifs; do
        config_get ifname $vif ifname
        ifconfig $ifname down
    done
    [ -e /etc/wifi_addr ] && {
    	cat /etc/wifi_addr > /tmp/wifi_addr
    }
    #[ -e /sys/class/leds/wled/brightness ] && { 
    #	echo 0 > /sys/class/leds/wled/brightness
    #}
    if [ "$device" == "mt7628" ]
    then
    	ubus send wifi.stat.change '{"stat_2g":"off"}'
   	[ -e /sys/class/leds/wled/brightness ] && { 
    		echo 0 > /sys/class/leds/wled/brightness
    	}
    elif [ "$device" == "mt7612e" ]
    then
    	ubus send wifi.stat.change '{"stat_5g":"off"}'
    else
	echo "undefine device:$device" >> /tmp/wifi.log
    fi
    # kill any running ap_clients
    killall ap_client || true
}

enable_ralink_wifi() {
    echo "enable_ralink_wifi($1,$2,$3,$4)" >>/tmp/wifi.log
    local device="$1"
    local macaddr
    local enable_2g=0
    local enable_5g=0
    config_get vifs "$device" vifs

    # bring up vifs
    for vif in $vifs; do
        config_get ifname $vif ifname
        config_get encryption $vif encryption
        config_get disabled $vif disabled
	config_get radio $device radio
        ifconfig $ifname down
        echo "ifconfig $ifname down" >>/dev/null
        if [ "$disabled" == "1" ]; then
            echo "$ifname marked disabled, skip" >>/dev/null
	    #ubus send wifi.stat.change '{"stat":"off"}'
            continue
        else
            echo "ifconfig $ifname up" >>/dev/null
            ifconfig $ifname up
	    #[ -e /sys/class/leds/wled/brightness ] && {
	    #     echo 1 > /sys/class/leds/wled/brightness
	    #}
            if [ "$device" == "mt7628" ]
	    then
		enable_2g=1
	    elif [ "$device" == "mt7612e" ]
	    then
		enable_5g=1
	    fi
        fi
	#Radio On/Off only support iwpriv command but dat file
        [ "$radio" == "0" ] && iwpriv $ifname set RadioOn=0
        local net_cfg bridge
        net_cfg="$(find_net_config "$vif")"
        [ -z "$net_cfg" ] || {
            bridge="$(bridge_interface "$net_cfg")"
            config_set "$vif" bridge "$bridge"
            start_net "$ifname" "$net_cfg"
        }
	chk8021x $device
        set_wifi_up "$vif" "$ifname"
	encryp=`echo $encryption | grep wep`
	if [ -n "$encryp" ]
	then
    	#iwpriv $ifname set WscConfMode=7
	#else
    		iwpriv $ifname set WscConfMode=0
	fi
	ubus send wifi.stat.change '{"stat":"start"}'
    done 
	macaddr=`ifconfig -a |grep ra0 | grep HWaddr | awk -F " " '{print $5}'`
	echo "$macaddr" > /tmp/wifi_addr
	echo "$macaddr" > /etc/wifi_addr
    set_mtk_maxsta $1
    set_mtk_macfilter $1
    set_mtk_isolate $1
		
    if [ "$enable_2g" == "1" ]
    then
    	ubus send wifi.stat.change '{"stat_2g":"on"}'
	[ -e /sys/class/leds/wled/brightness ] && {
	     echo 1 > /sys/class/leds/wled/brightness
	}
	brctlshow=`brctl show | grep "ra0"`
	[ -z $brctlshow ] && {
		sleep 3
		echo "luow: force to add ra0 to br-lan" >> /tmp/wifi.log
		brctl addif br-lan ra0
		brctlshow2=`brctl show | grep "ra0"`
		[ -z $brctlshow2 ] && {
                	sleep 3
                	echo "luow: force to add ra0 to br-lan again" >> /tmp/wifi.log
                	brctl addif br-lan ra0
		}
	}
    elif [ "$enable_5g" == "1" ]
    then
    	ubus send wifi.stat.change '{"stat_5g":"on"}'
	brctlshow_5g=`brctl show | grep "rai0"`
        [ -z $brctlshow_5g ] && {
                sleep 3
                echo "luow: force to add rai0 to br-lan" >> /tmp/wifi.log
                brctl addif br-lan rai0
                brctlshow2_5g=`brctl show | grep "rai0"`
                [ -z $brctlshow2_5g ] && {
                        sleep 3
                        echo "luow: force to add rai0 to br-lan again" >> /tmp/wifi.log
                        brctl addif br-lan rai0
                }
        }
    fi
    echo "enable_2g=$enable_2g" >>/tmp/wifi.log
    echo "enable_5g=$enable_5g" >>/tmp/wifi.log
}

detect_ralink_wifi() {
    echo "detect_ralink_wifi($1,$2,$3,$4)" >>/tmp/wifi.log
    local channel
    local device="$1"
    local module="$2"
    local band
    local ifname
    cd /sys/module/
    [ -d $module ] || return
    config_get channel $device channel
    [ -z "$channel" ] || return
    case "$device" in
        mt7620 | mt7602e | mt7603e | mt7628 )
            ifname="ra0"
            band="2.4G"
            ;;
        mt7610e | mt7612e )
            ifname="rai0"
            band="5G"
            ;;
        * )
            echo "device $device not recognized!! " >>/tmp/wifi.log
            ;;
    esac                    
    cat <<EOF
config wifi-device    $device
    option type     $device
    option vendor   ralink
    option band     $band
    option channel  0
    option autoch   2

config wifi-iface
    option device   $device
    option ifname    $ifname
    option network  lan
    option mode     ap
    option ssid OpenWrt-$device
    option encryption psk2
    option key      12345678

EOF
}



