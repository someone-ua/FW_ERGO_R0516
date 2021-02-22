#!/bin/sh
append DRIVERS "mt7628"

. /lib/wifi/ralink_common.sh

prepare_mt7628() {
	prepare_ralink_wifi mt7628
}

scan_mt7628() {
	scan_ralink_wifi mt7628 mt7628
}


disable_mt7628() {
	disable_ralink_wifi mt7628
}

enable_mt7628() {
	enable_ralink_wifi mt7628 mt7628
}

detect_mt7628() {
#	detect_ralink_wifi mt7628 mt7628
	ssid=mt7628-`ifconfig eth0 | grep HWaddr | cut -c 51- | sed 's/://g'`
	cd /sys/module/
	[ -d $module ] || return
	[ -e /etc/config/wireless ] && {
		project=`cat /etc/operator`
		if [ "$project" = "Uganda" ]; then
			band=`grep wps_pushbutton /etc/config/wireless`
		else
			band=`grep region /etc/config/wireless`
		fi
		[ -z $band ] || return
	}
         cat <<EOF
config wifi-device 'mt7628'
        option type 'mt7628'
        option vendor 'mt7628'
        option channel '0'
	option auotch '2'
	option band '2.4G'
	option radio '1'
        option wifimode '9'
        option hwmode '11ng'
        option country 'UK'
        option htmode 'HT40'
        option bw '0'
        option disabled '0'
	option region	'0'
	option wsc_confmode '7'

config wifi-iface 'RA0_2G_if'
        option device 'mt7628'
        option network 'lan'
        option mode 'ap'
        option ifname 'ra0'
        option ssid RA0-$ssid
        option hidden '0'
        option isolate '0'
        option macfilter 'disable'
        option encryption 'psk2+ccmp'
        option key      '12345678'
	option bak_key '12345678'
	option wep_key '1'
	option key1 's:12345'
	option wpa_group_rekey '10'	
        option disabled '0'
	option wps_pushbutton '1'

config wifi-settings 'AP0_setting'
        option auto_off_enable '0'
        option auto_off_timeout '600'
        option client_num '32'
        option need_ssid_change '1'
EOF


}


