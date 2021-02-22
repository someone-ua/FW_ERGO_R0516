(function($) {
    $.fn.objWifiMACFilter = function() {
        var gMacDenyListStr = "";
        var gMacAllowListStr = "";
        var gMacFilterMode = "";
        var gMacDenyListStr1 = "";
        var gMacAllowListStr1 = "";
        var gMacFilterMode1 = "";
        var savedFilter = "";

        var g_macFilter_allowLenth = 0;
        var g_macFilter_denyLenth = 0;

        this.onLoad = function(flag) {
            if (flag) {
                LoadWebPage("html/wifi/wifiMacFilter.html");

                $("#selMacFilterSwitch").change(function() {
                if (0 == $("#SelWifiModule").val()) {
                    gMacFilterMode = $(this).val();
                } else {
                    gMacFilterMode1 = $(this).val();
                };
                    RefreshData($("#SelWifiModule").val());
                });

                $("#SelWifiModule").change(function() {                  
                    RefreshData($(this).val());
                });

                $("#lt_macFilter_btnAddMacFilter").click(function() {
                    AddMacFilterAddr();
                });

                $("#lt_macFilter_btnDeleteMacFilter").click(function() {
                    DeleteMacFilterAddr();
                });
            } //end flag

            GetMacFilterConfig();
        }

        function AddMacFilterAddr() {

            if("allow" == $("#selMacFilterSwitch").val()){
                if(g_macFilter_allowLenth>=16){
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_add_length"));
                    return ;
                }
            }else if("deny" == $("#selMacFilterSwitch").val()){
                if(g_macFilter_denyLenth>=16){
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_add_length"));
                    return ;
                }
            }

            if(g_bodyWidth<=430){
							ShowDlg("divMACFilterDlg", '95%', 150);
						}else{
							ShowDlg("divMACFilterDlg", 400, 150);
						}
            clearErrorInfo();
            $("[name='txtmac']").keyup(function() {
                if ($(this).val().length == 2) {
                    $(this).nextAll(":eq(1)").focus();
                }
            });

            $("#lt_btnSave").click(function() {
                var macAddr = $("#txtMac1").val() + ":" + $("#txtMac2").val() + ":" + $("#txtMac3").val() + ":"
                              + $("#txtMac4").val() + ":" + $("#txtMac5").val() + ":" + $("#txtMac6").val();

                if (!IsMACAddr(macAddr)) {
                    $("#lt_macFilter_MacError").text(jQuery.i18n.prop("lt_macFilter_MacError")).show();
                    return;
                }
                var existFlag = false;
                $("#tbodyMacAddrList tr").each(function(){
                	if($(this).find("td").eq(0).text() == macAddr){
                		existFlag = true;
                		return;
                	}
                });
                if(existFlag){
                	showMsgBox(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_addrExist"));
                	return;
                }
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var macFilterConfigMap = new Map();
									macFilterConfigMap.put("RGW/wireless/wifi_device", $("#SelWifiModule").val());
									macFilterConfigMap.put("RGW/wireless/macfilter", $("#selMacFilterSwitch").val());
									if ("allow" == $("#selMacFilterSwitch").val()) {
											if ("" == GetAllMacAddr()) {
													macFilterConfigMap.put("RGW/wireless/maclist_allow", macAddr);
	
											} else {
													macFilterConfigMap.put("RGW/wireless/maclist_allow", GetAllMacAddr() + " " + macAddr);
											}
									} else {
											if ("" == GetAllMacAddr()) {
													macFilterConfigMap.put("RGW/wireless/maclist_deny", macAddr);
	
											} else {
													macFilterConfigMap.put("RGW/wireless/maclist_deny", GetAllMacAddr() + " " + macAddr);
											}
									}
									CloseDlg();
									var retXml = PostXml("wireless", "wifi_set_mac_filter", macFilterConfigMap);
									if ("OK" == $(retXml).find("setting_response").text()) {
											GetMacFilterConfig();
											showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_add_success"));
									} else {
											showMsgBox(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_add_fail"));
									}
								},200)  
            });
        }

        function DeleteMacFilterAddr() {
						ShowDlg("PleaseWait", 200, 130);
						$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            setTimeout(function(){
														var macFilterConfigMap = new Map();
								            macFilterConfigMap.put("RGW/wireless/wifi_device", $("#SelWifiModule").val());
								            macFilterConfigMap.put("RGW/wireless/macfilter", $("#selMacFilterSwitch").val());
								            if ("allow" == $("#selMacFilterSwitch").val()) {
								                macFilterConfigMap.put("RGW/wireless/maclist_allow", GetUnCheckedMacAddr());
								            } else {
								                macFilterConfigMap.put("RGW/wireless/maclist_deny", GetUnCheckedMacAddr());
								            }
								
								            var retXml = PostXml("wireless", "wifi_set_mac_filter", macFilterConfigMap);
								            if ("OK" == $(retXml).find("setting_response").text()) {
								                GetMacFilterConfig();
								                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_delete_success"));
								            } else {
								                showMsgBox(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_delete_fail"));
								            }
						},200)
        }

        function GetMacFilterConfig() {
            var retXml = PostXml("wireless", "wifi_get_mac_filter");

            $(retXml).find("AP0").each(function() {
                gMacFilterMode = $(this).find("macfilter").text();
                gMacDenyListStr = $(this).find("maclist_deny").text();
                gMacAllowListStr = $(this).find("maclist_allow").text();
                savedFilter = gMacFilterMode;
                g_macFilter_allowLenth = gMacAllowListStr.split(' ').length;
                g_macFilter_denyLenth = gMacDenyListStr.split(' ').length;
            });

            if ($(retXml).find("wireless_num").text() > 1) {
//                $("#divWifiAPClass").show();
                $(retXml).find("AP1").each(function() {
                    gMacFilterMode1 = $(this).find("macfilter").text();
                    gMacDenyListStr1 = $(this).find("maclist_deny").text();
                    gMacAllowListStr1 = $(this).find("maclist_allow").text();
                });
            } else {
                $("#divWifiAPClass").hide();
            }
            
            RefreshData($("#SelWifiModule").val());
        }

        function RefreshData(wifiModuleIdx) {
            var macFilterMode = wifiModuleIdx == 0 ? gMacFilterMode : gMacFilterMode1;
            var macAllowListStr = wifiModuleIdx == 0 ? gMacAllowListStr : gMacAllowListStr1;
            var macDenyListStr = wifiModuleIdx == 0 ? gMacDenyListStr : gMacDenyListStr1;

            //$("#SelWifiModule").val(wifiModuleIdx);
            $("#selMacFilterSwitch").val(macFilterMode);
            $("#tbodyMacAddrList").empty();
            $("#DeleteAllIpEntry").prop("checked", false);
            $("#lt_macFilter_btnDeleteMacFilter").hide();


            var macListStr = "";
            if ("disable" == macFilterMode) {
                $("#divMacFilterList").hide();
            } else if ("allow" == macFilterMode) {
                $("#divMacFilterList").show();
                $("#lMacFilterListLabel").text(jQuery.i18n.prop('lt_macFilter_AllowMacAddrList'));
                macListStr = macAllowListStr;
            } else {
                $("#divMacFilterList").show();
                $("#lMacFilterListLabel").text(jQuery.i18n.prop('lt_macFilter_DenyMacAddrList'));
                macListStr = macDenyListStr;
            }

            if ("" == macListStr) {
                return;
            }

            var macAddrArr = macListStr.split(" ");
            for (var idx = 0; idx < macAddrArr.length; ++idx) {
                if ("" == macAddrArr[idx]) continue;
                $("#tbodyMacAddrList").append("<tr><td>" + macAddrArr[idx] + "</td> <td><input type='checkbox'></td></tr>");
            }

            $("#DeleteAllIpEntry").click(function() {
                var ii = $(this).prop("checked");
                if ($(this).prop("checked")) {
                    $("tbody :checkbox").prop("checked", true);
                } else {
                	$("tbody :checkbox").prop("checked", false);
                }
                if ($("tbody :checked").length > 0) {
                    $("#lt_macFilter_btnDeleteMacFilter").show();
                } else {
                    $("#lt_macFilter_btnDeleteMacFilter").hide();
                }
            });

            $("tbody :checkbox").click(function() {
                if ($("tbody :checked").length == $("tbody tr").length) {
                    $("#DeleteAllIpEntry").prop("checked", true);
                } else {
                    $("#DeleteAllIpEntry").prop("checked", false);
                }

                if ($("tbody :checked").length > 0) {
                    $("#lt_macFilter_btnDeleteMacFilter").show();
                } else {
                    $("#lt_macFilter_btnDeleteMacFilter").hide();
                }
            });
        }

        this.SaveData = function() {
            var macFilterConfigMap = new Map();
            if(savedFilter == $("#selMacFilterSwitch").val()){
            	return;
            }
            macFilterConfigMap.put("RGW/wireless/wifi_device", $("#SelWifiModule").val());
            macFilterConfigMap.put("RGW/wireless/macfilter", $("#selMacFilterSwitch").val());
						ShowDlg("PleaseWait", 200, 130);
						$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
						setTimeout(function(){
							var retXml = PostXml("wireless", "wifi_set_mac_filter", macFilterConfigMap);
							if ("OK" == $(retXml).find("setting_response").text()) {
									GetMacFilterConfig();
									showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_set_success"));
							} else {
									showMsgBox(jQuery.i18n.prop("dialog_message_mac_filter_title"), jQuery.i18n.prop("dialog_message_mac_filter_set_fail"));
							}
						},200);
        }

        function GetAllMacAddr() {
            var strMacList = "";
            $("tbody tr").each(function() {
                strMacList = strMacList + $(this).children("td:first").text() + " ";
            });
            return strMacList.substr(0, strMacList.length - 1);
        }

        function GetUnCheckedMacAddr() {
            var strMacList = "";
            $("tbody tr td :not(:checked)").each(function() {
                strMacList = strMacList + $(this).parent().prev().text() + " ";
            });
            if ("" == strMacList) {

                strMacList = "    ";
            }
            return strMacList.substr(0, strMacList.length - 1);
        }

        return this;
    }
})(jQuery);





