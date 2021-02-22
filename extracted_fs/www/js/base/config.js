/*
 *config Variables
 */
var g_imei;
var g_username;
var g_pwdstrength;
var g_pwdstrength_changing;
var internet_connection_AutoVersionSwitch = 0;
var internet_connection_VersionSwitch = 0;
var internet_connection_NetworkMode = 1;
var internet_connection_engmode = 1;
var internet_connection_Prefer_network = 1;
var manual_network_bgscan_time = 1;
var router_management_poweroff = 0;
var dashboard_batteryinfo = 1;
var wifi_only_2G = 1;
var only_for_4G = 0;//hide 2G3G relative help information
var forbiddenMouseRightBtn = false;
// password strength
MACRO_PASSWORD_LOW = 'low';
MACRO_PASSWORD_MID = 'mid';
MACRO_PASSWORD_HIG = 'hig';
//for mtk navigation
var manuNavigation = ["internet","homeNetwork","phoneBook","sms","wireless","router"];
var subNavigation = [
                     ["internetConnection","profileManagement","manueNetwork","PINManagement"],
                     ["DHCPSetting","dnsSettings","deviceManagement","trafficManagement"],
                     ["all","location","SIM"],
                     ["localInbox","SIMInbox","sendbox","draft","smsSetting"],
                     ["wifiSetting","WPSSettings","wifiMac","dnFilter"],
		     ["userManagement","accountManagement","softUpgrade","configManagement","NetworkActivity","VPNSetting","timeSetting","mdiagnostics_ping","mstaticRoute"]
                     ];



//,"USSD" ,  "wifiSetting5G" ,  mstaticRoute  "SSHTunnel",
var config_hasWIFI5G = 0;   //0 NO 5G;  has 5G
var hasPower = 0 ;

var config_langue = 'both';   //both;  en ; ch;
var config_network = 'both'; //both; 3 3G; 4 4G; '':all
var config_MulSSID = 0;
var config_cp = 1;   //0  no cp; 1 has cp
var config_signal = 3 ;  //3 3ke;  5   5ke

var config_cp_local = 0;   //0 no; 1 has
var config_fota_ap = 0;  //0 no;1 has

var config_roam = 1; //0 off ;1 on

var config_platform = '1802';    // 1802  1826