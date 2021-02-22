#! /bin/sh

`ubus send dhcp_action '{"action":"'$1'","mac":"'$2'","ip":"'$3'","name":"'$4'"}'`
