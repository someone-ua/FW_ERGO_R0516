var lastUnreadIds = "";
(function ($) {
    $.fn.objdashboard = function (oInit) {
        var gWanConfigProto;
        var noSim = false;
        var netLock = false;
        var pinLock = false;
        var internetDisabled = false;
        var g_network_dashboard = '';
        this.onLoad = function (flag) {
            if (flag) {
                $("#mainColumn").html(CallHtmlFile("html/dashboard.html"));
                LocalAllElement();
                $("#lChangeConnStatus").click(function () {
                    var configMap = new Map();
                    configMap.put("RGW/wan/connect_switch/proto", gWanConfigProto);
                    configMap.put("RGW/wan/connect_switch/dial_switch", $(this).attr("name"));

                    PostXml("cm", "connection_switch", configMap);
                    GetWanConfig();
                    GetLinkContext();

                });

                $("#lt_dashbd_resetTrafficStatistic").click(function () {
                    var retXml = PostXml("statistics", "stat_clear_common_data");
                    if ("ERROR" == $(retXml).find("setting_response").text()) {
                        alert("stat_clear_common_data failed.");
                    } else {
                        $("#txtRecPackets").text(FormatDataTrafficMinUnitKB(0));
                        $("#txtsentPackets").text(FormatDataTrafficMinUnitKB(0));
                    }
                    setTimeout(GetTrafficStaticInfo, 3000);
                });
                $("#lt_ussd_btnSend").click(function () {
                    var ussd_value = $.trim($('#txtUssdServiceNumber').val());
                    if (ussd_value == '') {
                        $("#dialParamError").text(jQuery.i18n.prop("lt_ussd_input_error"));
                        $("#dialParamError").show();
                        return;
                    }

                    var r = /^[\d]+$/;
                    findValue = ussd_value;
                    if (r.test(ussd_value)) {
                        SendIndicationResponse(ussd_value);
                    } else {
                        UssdDialUp(ussd_value);
                    }

                });
                $('#txtUssdServiceNumber').focus(function(){
                    $('#dialParamError').hide();
                })

                InitUssdStatus();
                GetTrafficStaticInfo();
                GetSimStatus();
                GetWifiStatus();
                GetLinkContext();
                GetRouterInfo();
                GetWanConfig();
                //GetBatteryConfig();
                GetConnectedDeviceInfo();
                GetVersionInfo();
                GetUnReadSms();
            } else {
                GetTrafficStaticInfo();
                GetSimStatus("1");
                GetWifiStatus("1");
                GetLinkContext("1");
                GetRouterInfo("1");
                GetWanConfig("1");
                //GetBatteryConfig("1");
                GetConnectedDeviceInfo("1");
                GetVersionInfo("1");
            }
            hideOrShowPdplist();
        }
        function GetUnReadSms() {
            var smsMap = new Map();
            smsMap.put("RGW/sms_info/sms/type", 0);
            smsMap.put("RGW/sms_info/sms/read", 0);
            smsMap.put("RGW/sms_info/sms/location", 2);
            var retXml = PostXmlNoShowWaitBox("sms", "sms.query", smsMap);
            var unreadCount = $(retXml).find("count").text();
            if (unreadCount >= 1) {
                var unReadIds = $(retXml).find("ids").text();

                var newArrs = unReadIds.split(",");
                var lastArrs = lastUnreadIds.split(",");
                var i, j;
                var newCount = 0;
                for (i = 0; i < newArrs.length; i++) {
                    var found = false;
                    for (j = 0; j < lastArrs.length; j++) {
                        if (newArrs[i] == lastArrs[j]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        newCount++;
                    }
                }
                lastUnreadIds = unReadIds;
                if (newCount > 0) {
                    var MessAgeNotification = "";
                    if (1 == newCount)
                        MessAgeNotification = newCount + " " + jQuery.i18n.prop("lsmsOneNewArrivedSMS");
                    else
                        MessAgeNotification = newCount + " " + jQuery.i18n.prop("lsmsMoreNewArrivedSMS");
                    showMsgBox(jQuery.i18n.prop("lsmsNotification"), MessAgeNotification);
                }
            }
        }

        function GetEngLteInfo(EngModeFlag, type) {
            if (EngModeFlag == 1)
                $("#engModeLTEInfo").show();
            else
                $("#engModeLTEInfo").hide();

            if (EngModeFlag != 1)
                return;
            var retXml;
            if (type == "1") {
                retXml = PostXml("cm", "get_eng_info", null, "clearInterval");
            } else {
                retXml = PostXml("cm", "get_eng_info");
            }
            if ("OK" == $(retXml).find("response_status").text()) {
                var lte_mcc = $(retXml).find("mcc").text();
                if (lte_mcc == "")
                    $("#div_txtLTE_mcc").hide();
                var lte_mnc = $(retXml).find("mnc").text();
                if (lte_mnc == "")
                    $("#div_txtLTE_mnc").hide();
                var lte_phy_cellid = $(retXml).find("phy_cell_id").text();
                if (lte_phy_cellid == "")
                    $("#div_txtLTE_phy_cellid").hide();
                var lte_cellid = $(retXml).find("cell_id").text();
                if (lte_cellid == "")
                    $("#div_txtLTE_cellid").hide();
                var lte_dl_euarfcn = $(retXml).find("dl_euarfcn").text();
                if (lte_dl_euarfcn == "")
                    $("#div_txtLTE_dl_euarfcn").hide();
                var lte_ul_euarfcn = $(retXml).find("ul_euarfcn").text();
                if (lte_ul_euarfcn == "")
                    $("#div_txtLTE_ul_euarfcn").hide();
                var lte_dl_bandwidth = $(retXml).find("dl_bandwidth").text();
                if (lte_dl_bandwidth == "")
                    $("#div_txtLTE_dl_bandwidth").hide();
                var lte_transmission_mode = $(retXml).find("transmission_mode").text();
                if (lte_transmission_mode == "")
                    $("#div_txtLTE_transmission_mode").hide();
                var lte_main_rsrp = $(retXml).find("main_rsrp").text();
                if (lte_main_rsrp == "") {
                    $("#div_txtLTE_main_rsrp").hide();
                } else {
                    lte_main_rsrp = (parseFloat(lte_main_rsrp) - 141) + ' dBm';
                }

                var lte_diversity_rsrp = $(retXml).find("diversity_rsrp").text();
                if (lte_diversity_rsrp == "") {
                    $("#div_txtLTE_diversity_rsrp").hide();
                } else {
                    lte_diversity_rsrp = (parseFloat(lte_diversity_rsrp) - 141) + ' dBm';
                }
                var lte_main_rsrq = $(retXml).find("main_rsrq").text();
                if (lte_main_rsrq == "") {
                    $("#div_txtLTE_main_rsrq").hide();
                } else {
                    lte_main_rsrq = (parseFloat(lte_main_rsrq) / 2 - 20) + ' dB';
                }
                var lte_diversity_rsrq = $(retXml).find("diversity_rsrq").text();
                if (lte_diversity_rsrq == "") {
                    $("#div_txtLTE_diversity_rsrq").hide();
                } else {
                    lte_diversity_rsrq = (parseFloat(lte_diversity_rsrq) / 2 - 20) + ' dB';
                }
                var lte_sinr = $(retXml).find("sinr").text();
                if (lte_sinr == "") {
                    $("#div_txtLTE_sinr").hide();
                } else {
                    lte_sinr = lte_sinr + ' dB';
                }
                var lte_rssi = $(retXml).find("rssi").text();
                if (lte_rssi == "") {
                    $("#div_txtLTE_rssi").hide();
                } else {
                    if (g_network_dashboard == '3G') {
                        lte_rssi = (parseFloat(lte_rssi) - 95) + ' dBm';
                    } else if (g_network_dashboard == '4G') {
                        lte_rssi = (parseFloat(lte_rssi) - 128) + ' dBm';
                    } else if (g_network_dashboard == '2G') {
                        lte_rssi = (parseFloat(lte_rssi) - 111) + ' dBm';
                    }
                }
                var lte_dl_bler = $(retXml).find("dl_bler").text();
                if (lte_dl_bler == "")
                    $("#div_txtLTE_dl_bler").hide();
                var lte_ul_bler = $(retXml).find("ul_bler").text();
                if (lte_ul_bler == "")
                    $("#div_txtLTE_ul_bler").hide();

                $("#txtLTE_mcc").text(lte_mcc);
                $("#txtLTE_mnc").text(lte_mnc.length == 1 ? "0" + lte_mnc : lte_mnc);
                $("#txtLTE_phy_cellid").text(lte_phy_cellid);
                $("#txtLTE_cellid").text(lte_cellid);
                $("#txtLTE_dl_euarfcn").text(lte_dl_euarfcn);
                $("#txtLTE_ul_euarfcn").text(lte_ul_euarfcn);
                $("#txtLTE_dl_bandwidth").text(lte_dl_bandwidth);
                $("#txtLTE_transmission_mode").text(lte_transmission_mode);
                $("#txtLTE_main_rsrp").text(lte_main_rsrp);
                $("#txtLTE_diversity_rsrp").text(lte_diversity_rsrp);
                $("#txtLTE_main_rsrq").text(lte_main_rsrq);
                $("#txtLTE_diversity_rsrq").text(lte_diversity_rsrq);
                $("#txtLTE_sinr").text(lte_sinr);
                $("#txtLTE_rssi").text(lte_rssi);
                $("#txtLTE_dl_bler").text(lte_dl_bler);
                $("#txtLTE_ul_bler").text(lte_ul_bler);
            }
            else
                $("#engModeLTEInfo").hide();
        }

        function GetVersionInfo(type) {
            var retXml;
            if (type == "1") {
                retXml = PostXml("version", "get_version", null, "clearInterval");
            } else {
                retXml = PostXml("version", "get_version");
            }
            if ("OK" == $(retXml).find("setting_response").text()) {
                $("#txtRouterMAC").text($(retXml).find("mac_addr").text());
                $("#txtSoftVersion").text($(retXml).find("sw_version").text());
                $("#txtHardVersion").text($(retXml).find("hdware_ver").text());
                $("#txtBaseBandVersion").text($(retXml).find("baseband_version").text());
            }
        }

        function GetConnectedDeviceInfo(type) {
            var retXml;
            if (type == "1") {
                retXml = PostXml("statistics", "get_active_clients_num", null, "clearInterval");
            } else {
                retXml = PostXml("statistics", "get_active_clients_num");
            }
            document.getElementById("lConnDeviceValue").innerHTML = $(retXml).find("active_clients_num").text();
        }

        function GetBatteryConfig(type) {
            var retXml;
            if (type == "1") {
                retXml = PostXml("charger", "get_chg_info", null, "clearInterval");
            } else {
                retXml = PostXml("charger", "get_chg_info");
            }
            var err = $(retXml).find("error_cause").text();
            var bIsChargernotrun = false;

            if ("3" == err) {
                bIsChargernotrun = true;
            }
            if (bIsChargernotrun) {
                $("#lDashChargeStatus").text(jQuery.i18n.prop("lNoBattery"));
                $("#lDashBatteryQuantity").text(jQuery.i18n.prop("lNoBattery"));
                return;
            }
            var Batterystatus = $(retXml).find("bat_status").text();
            var Batterypercent = $(retXml).find("capacity").text();
            var Battery_connect = $(retXml).find("present").text();
            if (Battery_connect == 0) {
                $("#divbatteryinfo").hide();
                $("#lDashChargeStatus").text(jQuery.i18n.prop("lNoBattery"));
                $("#lDashBatteryQuantity").text(jQuery.i18n.prop("lNoBattery"));
            } else if (Battery_connect == 1) {
                $("#divbatteryinfo").show();
                if (Batterystatus == "0")
                    $("#lDashChargeStatus").text(jQuery.i18n.prop("lBatteryUnknownError"));
                if (Batterystatus == "1")
                    $("#lDashChargeStatus").text(jQuery.i18n.prop("lCharging"));
                if (Batterystatus == "2")
                    $("#lDashChargeStatus").text(jQuery.i18n.prop("lUncharged"));
                if (Batterystatus == "3")
                    $("#lDashChargeStatus").text(jQuery.i18n.prop("lBatteryUnchargewithconnect"));
                if (Batterystatus == "4")
                    $("#lDashChargeStatus").text(jQuery.i18n.prop("lFullycharged"));
                var Battery_charge_percent = Batterypercent + '%';
                $("#lDashBatteryQuantity").text(Battery_charge_percent);
            }
        }

        function GetWanConfig(type) {
            var retXml;
            if (type == "1") {
                retXml = PostXml("cm", "get_wan_configs", null, "clearInterval");
            } else {
                retXml = PostXml("cm", "get_wan_configs");
            }
            gWanConfigProto = $(retXml).find("proto").text();

            if ("cellular" == $(retXml).find("dial_switch").text()) {
                internetDisabled = false;
                $("#lCurConnStatus").text(jQuery.i18n.prop("lt_optEnableSwitch"));
                $("#lChangeConnStatus").text(jQuery.i18n.prop("lt_optDisable"));
                $("#lChangeConnStatus").attr("name", "disabled");
                if (noSim || netLock || pinLock) {
                    $("#divInternetPdpList").hide();
                } else {
                    $("#divInternetPdpList").show();
                }
            } else {
                internetDisabled = true;
                $("#lCurConnStatus").text(jQuery.i18n.prop("lt_optDisabledSwitch"));
                $("#lChangeConnStatus").text(jQuery.i18n.prop("lt_optEnable"));
                $("#lChangeConnStatus").attr("name", "cellular");
                $("#divInternetPdpList").hide();
            }
            var EngModeFlag = $(retXml).find("eng_mode").text();
            GetEngLteInfo(EngModeFlag, type);
        }
        function GetRouterInfo(type) {
            var retXml;
            if (type == "1") {
                retXml = PostXml("router", "router_get_dhcp_settings", null, "clearInterval");
            } else {
                retXml = PostXml("router", "router_get_dhcp_settings");
            }
            if (1 == $(retXml).find("disabled").text()) {
                $("#imgDhcpServerSwitch").attr("src", "images/status-icon2.png");
                $("#lDhcpServerSwitch").text(jQuery.i18n.prop("lt_optDisabledSwitch"));
            } else {
                $("#imgDhcpServerSwitch").attr("src", "images/status-icon3.png");
                $("#lDhcpServerSwitch").text(jQuery.i18n.prop("lt_optEnableSwitch"));
            }

            if (type == "1") {
                retXml = PostXml("router", "router_get_lan_ip", null, "clearInterval");
            } else {
                retXml = PostXml("router", "router_get_lan_ip");
            }
            $("#txtRouterLanIP").text($(retXml).find("lan_ip").text());
            $("#txtRouterMask").text($(retXml).find("lan_netmask").text());

            if (type == "1") {
                retXml = PostXml("router", "get_router_runtime", null, "clearInterval");
            } else {
                retXml = PostXml("router", "get_router_runtime");
            }
            var days = $(retXml).find("run_days").text();
            var hour = $(retXml).find("run_hours").text();
            var min = $(retXml).find("run_min").text();
            var sec = $(retXml).find("run_sec").text();
            var strRunTime = "";
            if (parseInt(days) > 0) {
                strRunTime = strRunTime + days + jQuery.i18n.prop("ldDay");
            }
            strRunTime = strRunTime + " " + formatTimehhmmss(hour, min, sec);
            $("#txtDashRouterRunTime").text(strRunTime);
        }
        function SetPdpConnectIcon() {
            $("#globeImage").attr("src", "images/globe.png");
            $("#imgGlobalConnArrow").attr("src", "images/con-arrow.png");
        }

        function SetPdpDisconnectIcon() {
            $("#globeImage").attr("src", "images/globe_gr.png");
            $("#imgGlobalConnArrow").attr("src", "images/discon-arrow.png");
        }

        function GetLinkContext(type) {
            var retXml;
            if (type == "1") {
                retXml = PostXml("cm", "get_link_context", null, "clearInterval");
            } else {
                retXml = PostXml("cm", "get_link_context");
            }
            /*************************** parse cellular basic info. **********************/
            g_imei = $(retXml).find("IMEI").text();
            $("#txtRouterIMEI").text(g_imei == '' ? 'N/A' : g_imei);
            var phoneNum = $(retXml).find("MSISDN").text();
            if (!noSim) {
                $(".dashbd_phoneNum").show();
                if (phoneNum && phoneNum != "") {
                    $("#txtRouterPhoneNum").text(phoneNum);
                } else {
                    $("#txtRouterPhoneNum").text("N/A");
                }
            } else {
                $(".dashbd_phoneNum").hide();
            }

            var networkOperate = "";
            if (1 == $(retXml).find("roaming").text()) {
                networkOperate = $(retXml).find("roaming_network_name").text();
                $("#divRoamingStatus").show();
            } else {
                networkOperate = $(retXml).find("network_name").text();
                $("#divRoamingStatus").hide();
            }
            if (networkOperate && networkOperate.startsWith("80")) {
                networkOperate = UniDecode(networkOperate.substr(2));
            }
            $("#txtNetworkOperator").text(networkOperate);
            //<sys_mode/> <!-- 0: no service  1:2G3G  2:LTE-->
            var cellularSysNetworkMode = $(retXml).find("sys_mode").text();
            //<data_mode/> <!-- 1: GPRS 2: EDGE 9: HSPDA 10: HSUPA 11:HSPA 14: LTE -->
            var cellularDataConnMode = $(retXml).find("data_mode").text();
            if (0 == cellularSysNetworkMode) {
                $("#txtSystemNetworkMode").text(jQuery.i18n.prop("lt_dashbd_NoService"));
            } else if (1 == cellularSysNetworkMode) {
                if (cellularDataConnMode != 1 && cellularDataConnMode != 2 && cellularDataConnMode != 16) {
                    //3G
                    $("#txtSystemNetworkMode").text("3G");
                } else {
                    $("#txtSystemNetworkMode").text("2G");
                }
            } else if (2 == cellularSysNetworkMode) {
                $("#txtSystemNetworkMode").text("LTE");
            }

            if (1 == cellularDataConnMode) {
                $("#txtDataConnMode").text("GPRS");
            } else if (2 == cellularDataConnMode) {
                $("#txtDataConnMode").text("EDGE");
            } else if (3 == cellularDataConnMode) {
                $("#txtDataConnMode").text("UMTS");
            } else if (4 == cellularDataConnMode) {
                $("#txtDataConnMode").text("IS95A");
            } else if (5 == cellularDataConnMode) {
                $("#txtDataConnMode").text("IS95B");
            } else if (6 == cellularDataConnMode) {
                $("#txtDataConnMode").text("1xRTT");
            } else if (7 == cellularDataConnMode) {
                $("#txtDataConnMode").text("EVD0_0");
            } else if (8 == cellularDataConnMode) {
                $("#txtDataConnMode").text("EVD0_A");
            } else if (9 == cellularDataConnMode) {
                $("#txtDataConnMode").text("HSUPA");
            } else if (10 == cellularDataConnMode) {
                $("#txtDataConnMode").text("HSDPA");
            } else if (11 == cellularDataConnMode) {
                $("#txtDataConnMode").text("HSPA");
            } else if (12 == cellularDataConnMode) {
                $("#txtDataConnMode").text("EVD0_B");
            } else if (13 == cellularDataConnMode) {
                $("#txtDataConnMode").text("EHRPD");
            } else if (14 == cellularDataConnMode) {
                $("#txtDataConnMode").text("LTE");
            } else if (15 == cellularDataConnMode) {
                $("#txtDataConnMode").text("HSPAP");
            } else if (16 == cellularDataConnMode) {
                $("#txtDataConnMode").text("GSM");
            } else if (17 == cellularDataConnMode) {
                $("#txtDataConnMode").text("TD_SCDMA");
            } else if (19 == cellularDataConnMode) {
                $("#txtDataConnMode").text("4G+");
            }
            var rssi = $(retXml).find("rssi").text();
            if (config_signal == 3) {
                SetSignalStrength(rssi, cellularSysNetworkMode, cellularDataConnMode);
            } else {
                SetSignalStrength_5(rssi, cellularSysNetworkMode, cellularDataConnMode);
            }
            /********************************** parse PDP infor. *********************************************/
            $("#txtPdpconnStatus,#txtPdpApn").text("");
            $("#txtPdpIpv4Addr").text("");
            $("#txtPdpIpv4Dns1").text("");
            $("#txtPdpIpv4Dns2").text("");
            $("#txtPdpIpv4GateWay").text("");
            $("#txtPdpIpv4NetMask").text("");
            $("#txtPdpIpv6Addr").text("");
            $("#txtPdpIpv6Dns1").text("");
            $("#txtPdpIpv6Dns2").text("");
            $("#txtPdpIpv6GateWay").text("");
            $("#txtPdpIpv6NetMask").text("");

            $(retXml).find("contextlist").each(function () {
                if ($(this).find("Item") && $(this).find("Item").length > 0) {
                    $(this).find("Item").each(function () {
                        /*0-disconnect;1-connected;2-connecting*/
                        var connetStatus = $(retXml).find("connection_status").text();  //
                        /*0- secondary pdp;1-primary pdp*/
                        var pdpType = $(retXml).find("pdp_type").text();
                        /*0-ipv4v6;1-ipv4;2-ipv6*/
                        var ipType = $(retXml).find("ip_type").text();
                        if (0 == connetStatus) {
                            $("#txtPdpconnStatus").text(jQuery.i18n.prop("pdpConnStatus_disconnected"));
                            SetPdpDisconnectIcon();
                        } else if (1 == connetStatus) {
                            $("#txtPdpconnStatus").text(jQuery.i18n.prop("pdpConnStatus_connected"));
                            SetPdpConnectIcon();
                        } else if (2 == connetStatus) {
                            $("#txtPdpconnStatus").text(jQuery.i18n.prop("pdpConnStatus_connecting"));
                            SetPdpDisconnectIcon();
                        }


                        if (2 == cellularSysNetworkMode) { /*LTE*/
                            var lteApn = $(retXml).find("lte_apn").text();
                            if ("" == lteApn) {
                                $("#txtPdpApn").text($(retXml).find("apn").text());
                            } else {
                                $("#txtPdpApn").text($(retXml).find("lte_apn").text());
                            }

                        } else {
                            $("#txtPdpApn").text($(retXml).find("apn").text());
                        }

                        $("#txtPdpIpv4Addr").text($(retXml).find("ipv4_ip").text());
                        $("#txtPdpIpv4Dns1").text($(retXml).find("ipv4_dns1").text());
                        $("#txtPdpIpv4Dns2").text($(retXml).find("ipv4_dns2").text());
                        $("#txtPdpIpv4GateWay").text($(retXml).find("ipv4_gateway").text());
                        $("#txtPdpIpv4NetMask").text($(retXml).find("ipv4_submask").text());

                        $("#txtPdpIpv6Addr").text($(retXml).find("ipv6_ip").text());
                        $("#txtPdpIpv6Dns1").text($(retXml).find("ipv6_dns1").text());
                        $("#txtPdpIpv6Dns2").text($(retXml).find("ipv6_dns2").text());
                        $("#txtPdpIpv6GateWay").text($(retXml).find("ipv6_gateway").text());
                        $("#txtPdpIpv6NetMask").text($(retXml).find("ipv6_submask").text());

                        if (0 == ipType) {
                            $("#pdpIpv4Info").show();
                            $("#pdpIpv6Info").show();
                        } else if (1 == ipType) {
                            $("#pdpIpv4Info").show();
                            $("#pdpIpv6Info").hide();
                        } else if (2 == ipType) {
                            $("#pdpIpv4Info").hide();
                            $("#pdpIpv6Info").show();
                        }
                    });
                } else {
                    SetPdpDisconnectIcon();
                }
            });
        }
        function GetSimStatus(type) {
            $("#divSimCardAbsent").hide();
            $("#divRequiredPinPuk").hide();
            $("#divCellularConn").hide();
            $("#divNetworkLocked").hide();
            var retXml;
            if (type == "1") {
                retXml = PostXml("sim", "get_sim_status", null, "clearInterval");
            } else {
                retXml = PostXml("sim", "get_sim_status");
            }
            if ("OK" != $(retXml).find("setting_response").text()) {
                //alert("Get Sim Status failed.");
                //return;
            }
            //sim_status: <!--0: sim absent 1:sim present  2: sim error 3: unknown error-->
            //pin_status: <!--0: unkown  1: detected 2: need pin 3: need puk 5: ready-->
            //pn_status: <!--0: unLock    1: Lock net PN     2: Lock net PUK-->
            var simStatus = $(retXml).find("sim_status").text();
            var pinStatus = $(retXml).find("pin_status").text();
            var pnStatus = $(retXml).find("pn_status").text();
            if (0 == simStatus) {
                noSim = true;
                $("#divSimCardAbsent").show();
                $("#divInternetPdpList").hide();
                $("#mTraffic_Statistical").hide();//hide traffic statics area if no SIM
                $(".homeBox").css("min-height", "150px");
                $("#txtSimStatus").text(jQuery.i18n.prop("lSimStatusAbsent"));
            } else if (1 == simStatus) {
                $("#divNetworkLocked").hide();
                $("#divInternetPdpList").show();
                if (2 == pinStatus) {
                    pinLock = true;
                    $("#divRequiredPinPuk").show();
                    $("#txtPinPuk").text("PIN");
                    $("#mTraffic_Statistical").hide();
                    $("#divInternetPdpList").hide();
                } else if (3 == pinStatus) {
                    pinLock = true;
                    $("#divRequiredPinPuk").show();
                    $("#txtPinPuk").text("PUK");
                } else if (4 == pinStatus) {
                    if ($(retXml).find("perso_substate").text() == "3") {
                        netLock = true;
                        $("#divNetworkLocked").show();
                        $("#divInternetPdpList").hide();
                    } else if ($(retXml).find("perso_substate").text() == "8") {
                        netLock = true;
                        $("#divNetworkLocked").show();
                        $("#divInternetPdpList").hide();
                        $("#lt_txtNetLocked").text(jQuery.i18n.prop("lt_txt_pnpuk_locked"));
                    }
                } else {
                    $("#divCellularConn").show();
                }

            } else if (2 == simStatus) {
                $("#divSimCardAbsent").show();
                $("#txtSimStatus").text(jQuery.i18n.prop("lSimStatusError"));
            } else if (3 == simStatus) {
                $("#divSimCardAbsent").show();
                $("#txtSimStatus").text(jQuery.i18n.prop("lSimStatusUnknownError"));
            }
        }
        function GetWifiStatus(type) {
            if (config_hasWIFI5G) {
                $('#divWifiStatus5G').show();
            } else {
                $('#divWifiStatus5G').hide();
            }
            var retXml;
            if (type == "1") {
                retXml = PostXml("wireless", "wifi_get_detail", null, "clearInterval");
            } else {
                retXml = PostXml("wireless", "wifi_get_detail");
            }
            var wifi24GStatus;
            $(retXml).find("wifi_if_24G").each(function () {
                wifi24GStatus = $(this).find("switch").text();
            });
            if ("on" == wifi24GStatus) {
                $("#imgWifiConnStatus").attr("src", "images/status-icon3.png");
            } else {
                $("#imgWifiConnStatus").attr("src", "images/status-icon2.png");
            }
            initWifiInfo24G(retXml);

            var wifi5GStatus;
            $(retXml).find("wifi_if_5G").each(function () {
                wifi5GStatus = $(this).find("switch").text();
            });
            if ("on" == wifi5GStatus) {
                $("#imgWifiConnStatus5G").attr("src", "images/status-icon3.png");
            } else {
                $("#imgWifiConnStatus5G").attr("src", "images/status-icon2.png");
            }
            initWifiInfo5G(retXml);

            if ("on" == wifi5GStatus || "on" == wifi24GStatus) {
                $("#imgWifiConnArrow").attr("src", "images/con-arrow.png");
                $("#imgNetwork").attr("src", "images/network.png");
            } else {
                $("#imgWifiConnArrow").attr("src", "images/discon-arrow.png");
                $("#imgNetwork").attr("src", "images/network_gr.png");
            }
        }
        function initWifiInfo24G(retXml) {
            var wifi24GStatus;
            $(retXml).find("wifi_if_24G").each(function () {
                wifi24GStatus = $(this).find("switch").text();
            });
            if ("on" != wifi24GStatus) {
                $("#lWLANStatus").text(jQuery.i18n.prop("lt_optDisabledSwitch"));
                $("#divWifiSet").hide();
                return;
            }
            $("#lWLANStatus").text(jQuery.i18n.prop("lt_optEnableSwitch"));
            $("#divWifiSet").show();

            $(retXml).find("wifi_if_24G").each(function () {
                $("#txtWifiSSID").text($(this).find("ssid0").find("ssid").text());
                if ($(this).find("channel").text() == "0") {
                    $("#txtWifiChannel").text(jQuery.i18n.prop("txtWifiChannel_auto"));
                } else {
                    $("#txtWifiChannel").text($(this).find("channel").text());
                }
                $("#txtWifiSecMode").text(GetAuthType($(this).find("ssid0").find("encryption").text()));
            });
        }
        function initWifiInfo5G(retXml) {
            var wifi5GStatus;
            $(retXml).find("wifi_if_5G").each(function () {
                wifi5GStatus = $(this).find("switch").text();
            });
            if ("on" != wifi5GStatus) {
                $("#lWLANStatus5G").text(jQuery.i18n.prop("lt_optDisabledSwitch"));
                $("#divWifiSet5G").hide();
                return;
            }
            $("#lWLANStatus5G").text(jQuery.i18n.prop("lt_optEnableSwitch"));
            $("#divWifiSet5G").show();

            $(retXml).find("wifi_if_5G").each(function () {
                $("#txtWifiSSID5G").text($(this).find("ssid0").find("ssid").text());
                if ($(this).find("channel").text() == "0") {
                    $("#txtWifiChannel5G").text(jQuery.i18n.prop("txtWifiChannel_auto"));
                } else {
                    $("#txtWifiChannel5G").text($(this).find("channel").text());
                }
                $("#txtWifiSecMode5G").text(GetAuthType($(this).find("ssid0").find("encryption").text()));
            });
        }
        function SetSignalStrength(rssi, cellularSysNetworkMode, cellularDataConnMode) {
            if (0 == cellularSysNetworkMode) {
                document.getElementById("imgSignalStrength").src = "images/signal0.png";
            } else if (1 == cellularSysNetworkMode) { //GSM 2G3G
                if (cellularDataConnMode != 1 && cellularDataConnMode != 2 && cellularDataConnMode != 16) {
                    //3G
                    g_network_dashboard = '3G';
                    if (rssi < 22)
                        document.getElementById("imgSignalStrength").src = "images/signal0.png";
                    else if (rssi < 27)
                        document.getElementById("imgSignalStrength").src = "images/signal1.png";
                    else if (rssi < 36)
                        document.getElementById("imgSignalStrength").src = "images/signal2.png";
                    else
                        document.getElementById("imgSignalStrength").src = "images/signal3.png";
                } else {
                    //2G
                    g_network_dashboard = '2G';
                    if (rssi < 6)
                        document.getElementById("imgSignalStrength").src = "images/signal0.png";
                    else if (rssi < 12)
                        document.getElementById("imgSignalStrength").src = "images/signal1.png";
                    else if (rssi < 24)
                        document.getElementById("imgSignalStrength").src = "images/signal2.png";
                    else
                        document.getElementById("imgSignalStrength").src = "images/signal3.png";
                }
            } else if (2 == cellularSysNetworkMode) { //LTE
                g_network_dashboard = '4G';
                if (rssi < 21) {
                    document.getElementById("imgSignalStrength").src = "images/signal0.png";
                } else if (rssi < 31)
                    document.getElementById("imgSignalStrength").src = "images/signal1.png";
                else if (rssi < 41)
                    document.getElementById("imgSignalStrength").src = "images/signal2.png";
                else
                    document.getElementById("imgSignalStrength").src = "images/signal3.png";
            }
        }
        function SetSignalStrength_5(rssi, cellularSysNetworkMode, cellularDataConnMode) {
            if (0 == cellularSysNetworkMode) {
                document.getElementById("imgSignalStrength").src = "images/signal0.png";
            } else if (1 == cellularSysNetworkMode) { //GSM 2G3G
                if (cellularDataConnMode != 1 && cellularDataConnMode != 2 && cellularDataConnMode != 16) {
                    //3G
                    g_network_dashboard = '3G';
                    if (rssi < 17) {
                        document.getElementById("imgSignalStrength").src = "images/signal0.png";
                    } else if (rssi < 22)
                        document.getElementById("imgSignalStrength").src = "images/signal1.png";
                    else if (rssi < 27)
                        document.getElementById("imgSignalStrength").src = "images/signal2.png";
                    else if (rssi < 31)
                        document.getElementById("imgSignalStrength").src = "images/signal3.png";
                    else if (rssi < 36)
                        document.getElementById("imgSignalStrength").src = "images/signal4.png";
                    else
                        document.getElementById("imgSignalStrength").src = "images/signal5.png";
                } else {
                    //2G
                    g_network_dashboard = '2G';
                    if (rssi < 3) {
                        document.getElementById("imgSignalStrength").src = "images/signal0.png";
                    } else if (rssi < 6)
                        document.getElementById("imgSignalStrength").src = "images/signal1.png";
                    else if (rssi < 12)
                        document.getElementById("imgSignalStrength").src = "images/signal2.png";
                    else if (rssi < 18)
                        document.getElementById("imgSignalStrength").src = "images/signal3.png";
                    else if (rssi < 24)
                        document.getElementById("imgSignalStrength").src = "images/signal4.png";
                    else
                        document.getElementById("imgSignalStrength").src = "images/signal5.png";
                }
            } else if (2 == cellularSysNetworkMode) { //LTE
                g_network_dashboard = '4G';
                if (rssi < 21) {
                    document.getElementById("imgSignalStrength").src = "images/signal0.png";
                } else if (rssi < 26)
                    document.getElementById("imgSignalStrength").src = "images/signal1.png";
                else if (rssi < 31)
                    document.getElementById("imgSignalStrength").src = "images/signal2.png";
                else if (rssi < 36)
                    document.getElementById("imgSignalStrength").src = "images/signal3.png";
                else if (rssi < 44)
                    document.getElementById("imgSignalStrength").src = "images/signal4.png";
                else
                    document.getElementById("imgSignalStrength").src = "images/signal5.png";
            }
        }
        function hideOrShowPdplist() {
            if (noSim == true || netLock == true || pinLock == true || internetDisabled == true) {
                $("#divInternetPdpList").hide();
            }
        }
        function GetAuthType(encryptInfo) {
            var authType;
            switch (encryptInfo) {
                //WPA-PSK
                case "psk+ccmp":
                case "psk+aes":
                case "psk":
                case "psk+tkip":
                case "psk+tkip+ccmp":
                case "psk+tkip+aes":
                    authType = "WPA-PSK";
                    break;
                //WPA2-PSK
                case "psk2":
                case "psk2+ccmp":
                case "psk2+aes":
                case "psk2+tkip+ccmp":
                case "psk2+tkip+aes":
                case "psk2+tkip":
                    authType = jQuery.i18n.prop("lt_wifiSet_WPA2");
                    break;
                //WPA/WPA2-MIXED
                /*case "mixed-psk":
                case "mixed-psk+tkip+aes":
                case "mixed-psk+tkip+ccmp":
                case "mixed-psk+aes":
                case "mixed-psk+ccmp":
                	*/
                case "psk-mixed":
                case "psk-mixed+aes":
                case "psk-mixed+ccmp":
                case "psk-mixed+tkip":
                case "psk-mixed+tkip+aes":
                case "psk-mixed+tkip+ccmp":
                    authType = jQuery.i18n.prop("lt_wifiSet_WPAWPA2");
                    break;
                //MEP
                case "wep":
                case "wep-open":
                    authType = jQuery.i18n.prop("lt_wifiSet_WEP");
                    break;
                case "none":
                    authType = jQuery.i18n.prop("lt_wifiSet_None");
                    break;
                default:
                    authType = "Unknow Error";
                    break;
            }
            return authType;
        }

        function displayConfigViews() {
            if (dashboard_batteryinfo == 0) {
                $("#divbatteryinfo").hide();
            } else {
                $("#divbatteryinfo").show();
            }

        }
        function GetTrafficStaticInfo() {
            var retXml = PostXmlAsync("statistics", "stat_get_common_data", null, function (retXml) {
                if ("ERROR" != $(retXml).find("setting_response").text()) {
                    var rx_bytes = $(retXml).find("total_rx_bytes").text();
                    var tx_bytes = $(retXml).find("total_tx_bytes").text();
                    var upthrpt = parseFloat($(retXml).find("upthrpt").text());
                    var dnthrpt = parseFloat($(retXml).find("dnthrpt").text());
                    if (undefined != rx_bytes && "" != rx_bytes) {
                        $("#txtRecPackets").text(FormatDataTrafficMinUnitKB(rx_bytes));
                    }
                    $('#txtSendSpeed').text(changeBytes(upthrpt));
                    if (undefined != tx_bytes && "" != tx_bytes) {
                        $("#txtsentPackets").text(FormatDataTrafficMinUnitKB(tx_bytes));
                    }
                    $('#txtReceivedSpeed').text(changeBytes(dnthrpt));

                }
            });
        }
        function changeBytes(bytes) {
            var val = bytes + ' B/s';
            if (bytes > 1024) {
                val = (bytes / 1024).toFixed(2) + ' KB/s';
            }
            if (bytes / 1024 > 1024) {
                val = (bytes / 1024 / 1024).toFixed(2) + ' MB/s';
            }
            if (bytes / 1024 / 1024 > 1024) {
                val = (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB/s';
            }
            return val;
        }

        function InitUssdStatus() {
            var retXml = PostXml("ussd", "get_ussd_ind");
            var ussdType = $(retXml).find("ussd_type").text();

            if ("0" == ussdType || "1" == ussdType) {
                var ussdStr = $(retXml).find("ussd_str").text().replace(/\s/ig, '0');
                var msg = UniDecode(ussdStr);
                appendResult(msg);
            }

        }
        function validRspParam(param) {
            var regex = /[0-9]{1}/;
            if (!regex.test(param))
                return false;
            else
                return true;
        }

        function SendIndicationResponse(param) {
            action = 3;
            var mapData = new Map();
            mapData.put("RGW/ussd/action", action);
            mapData.put("RGW/ussd/param", param);
            PostXml("ussd", "send_ussd", mapData);
            ShowDlg("PleaseWait", 200, 130);
            $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            $("#txtUssdServiceNumber").val("");
            timeoutCount = 0;
            setTimeout(QueryUssdNetworkStatus, 6000);
        }

        function CanCelUssdService() {
            action = 2;

            var mapData = new Map();
            mapData.put("RGW/ussd/action", action);
            PostXml("ussd", "send_ussd", mapData);


            $("#lt_ussd_btnDial").attr("disabled", false);
            $("#divUssdInteract").hide();
            //setTimeout(QueryUssdNetworkStatus,1000);
        }

        function validDialParam(param) {
            var regex = /^[*]{1}[0-9]{2,10}[#]{1}$/;
            if (!regex.test(param))
                return false;
            else
                return true;
        }
        function UssdDialUp(param) {
            action = 1;
            var mapData = new Map();
            mapData.put("RGW/ussd/action", action);
            mapData.put("RGW/ussd/param", param);
            PostXml("ussd", "send_ussd", mapData);

            ShowDlg("PleaseWait", 200, 130);
            $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));

            $("#txtUssdServiceNumber").val("");
            timeoutCount = 0;
            setTimeout(QueryUssdNetworkStatus, 6000);
        }

        function QueryUssdNetworkStatus() {
            var retXml = PostXml("ussd", "get_ussd_ind");

            var ussdType = $(retXml).find("ussd_type").text();
            if (timeoutCount > 15) {
                CloseDlg();
                return;
            }

            if ("" == ussdType) {
                ++timeoutCount;
                setTimeout(QueryUssdNetworkStatus, 1000);
            } else if ("0" == ussdType || "1" == ussdType) {
                CloseDlg();
                var ussdStr = $(retXml).find("ussd_str").text().replace(/\s/ig, '0');
                var msg = UniDecode(ussdStr);
                appendResult(msg);

            } else {
                CloseDlg();
                var msg;
                if ("2" == ussdType) {
                    //                    showAlert("lt_ussd_error_type2");
                    msg = jQuery.i18n.prop("lt_ussd_error_type2");
                } else if ("3" == ussdType) {
                    //                    showAlert("lt_ussd_error_type3");
                    msg = jQuery.i18n.prop("lt_ussd_error_type3");
                } else if ("4" == ussdType) {
                    //                    showAlert("lt_ussd_error_type4");
                    msg = jQuery.i18n.prop("lt_ussd_error_type4");
                } else if ("5" == ussdType) {
                    //                    showAlert("lt_ussd_error_type5");
                    msg = jQuery.i18n.prop("lt_ussd_error_type5");
                } else {
                    //                    showAlert("lt_ussd_unknow_error");
                    msg = jQuery.i18n.prop("lt_ussd_unknow_error");
                }
                appendResult(msg);
            }
        }

        function appendResult(msg) {
            var html = '<ul>'
                + '<li>'
                + '<span>' + jQuery.i18n.prop("Sent") + '</span>'
                + '<span>' + findValue + '</span>'
                + '</li>'
                + '<li>'
                + '<span>' + jQuery.i18n.prop("Received") + '</span>'
                + '<textarea readonly="readonly">' + msg + '</textarea>'
                + '</li>'
                + '</ul>';
            $('#return_information').prepend(html);
            $('textarea').each(function () {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            });
        }


        return this.each(function () {
            _dashboardIntervalID = setInterval("g_objContent.onLoad(false)", _dashboardInterval);
        });
    }
})(jQuery);