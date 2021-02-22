var gConnNum = 1;//max connection counts
var showSSIDs = [];
var wifiDetailedInfoMap = new Map();
var wps_index;
var shownSSIDIndexs = [];
var gAutoOffEnable;
var gAutoOffTimeout;
(function($) {
    $.fn.objWifiSet = function() {
		var entryIdx = "AP0";//2.4G
		var gWirelessAPNum = "0";
		var gCurrentAPItem = "0";
		
        this.onLoad = function(flag) {
        	gAutoOffTimeout = "";
        	wifiDetailedInfoMap = new Map();
            if(flag) {
                LoadWebPage("html/wifi/wireless_settings.html");

                if(config_MulSSID){
                    $('#divAddSSID').show();
                }else{
                    $('#divAddSSID').hide();
                }
				
                $("#selWifiEnabledSwitch").change(function() {
                    if(1==$(this).val()) {
                        $("#ssids_detail,.publicInformation2,#divDisabledWifi").show();
                    } else {
                        $("#ssids_detail,.publicInformation2,#divDisabledWifi").hide();
                    }
                });

                $("#selWifiCountryCode").change(function(){
                	$("#24GChannelFor1_11").hide();
			    	$("#24GChannelFor1_13").hide();
			    	$("#24GChannelFor1_14").hide();
                	if($(this).val() == "US" ||$(this).val() == "MX"){
                		$("#24GChannelFor1_11").show();
                	}else if($(this).val() == "JP"){
    			    	$("#24GChannelFor1_14").show();
    			    }else{
    			    	$("#24GChannelFor1_13").show();
    			    }
                });

                $("#wifi_conn_num").mousedown(function() {
                    $("#wifiSetErrorLogs").hide().text("");
                    $("#wifiSetErrorLogs_0").hide().text("");
                });
                $("#selWifiEnabledSwitch,#selRfBand,#sel2_4G80211Protocol,#selWifi24GChannelFor1_11,#selWifi24GChannelFor1_13,#selWifi24GChannelFor1_14,#selWifi5GChannel," +
                		"#sel80211nBandWidth,#sel80211acBandWidth,#selWifiCountryCode,#selAutoOffWifiSwitch,#selAutoOffWifiTimeout").change(function(){
                	$("#wifiSetErrorLogs").hide().text("");
                	$("#wifiSetErrorLogs_0").hide().text("");
                });
                
                $("#selAutoOffWifiSwitch").click(function() {
                    if(1 == $(this).val()) {
                        $("#divWifiAutoOffTimeout").show();
                    } else {
                        $("#divWifiAutoOffTimeout").hide();
                    }
                });
                $("#sel2_4G80211Protocol").change(function(){
                	$("#div80211nBandWidth_forBG").hide();
                	$("#div80211nBandWidth").hide();
                	if($(this).val() == "11ng"){
                		$("#div80211nBandWidth").show();
                	}else{
				$("#div80211nBandWidth_forBG").show();
                	}
                });
                var connNumSize = "";
                for(var i=1;i<=32;i++){
                	connNumSize += "<option value='"+i+"'>"+i+"</option>"
                }
                $("#wifi_conn_num").append(connNumSize);
            } //end flag

            GetWifiDetailedInfo();
            RefreshWifiRFSwitch();
            RefreshFreqBandData();
            GetWifiAutoOffSetting();
        };

        this.initDeleteSSID = function(){
        	GetWifiDetailedInfo();
        	RefreshssidInfo();
        };

        this.SaveData = function(type,index) {
	    var entry24GSwitch = "RGW/wireless/"+entryIdx+"/wifi_if_24G/switch";
            if(0 == $("#selWifiEnabledSwitch").val()) {//close wifi
                if("on" == wifiDetailedInfoMap.get(entry24GSwitch)) {
                	ShowDlg("PleaseWait", 200, 130);
                	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
                	setTimeout(function(){
                		CloseWifi();
                	},100);
                } else {
                    return false;
                }
            } else {
            	hideError(index);
                if(type && !ValidateData(index)) {
                    return false;
                }
                var changed = changeData(type,index);
                var wifi_off_changed = wifi_autoOff_changed();
                var maxConnChanged = maxConnectNumChanged();
            	if(changed || wifi_off_changed ||maxConnChanged){
            		ShowDlg("PleaseWait", 200, 130);
            		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            		setTimeout(function(){
            			var setWifiConfigFlag = "";
            			var setWifiAutoOffFlag = "";
            			var modifyConnNumFlag = "";
	                	if(maxConnChanged){
							modifyConnNumFlag = ModifyConnNum();
							gConnNum = $("#wifi_conn_num").val();
						}
            			if(changed){
            				setWifiConfigFlag = ModifyWifiConfig(type,index);
            			}
            			if(wifi_off_changed){
            				setWifiAutoOffFlag = SetWifiAutoOffSetting();
            			}
		                CloseDlg();
		                if (modifyConnNumFlag || setWifiConfigFlag  || setWifiAutoOffFlag) {
		                	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_wifi_settings_modify_wifi_param_success"));                	
		                }
            		},100);
            	}
            }
            return true;
        };
        
        function maxConnectNumChanged(){
			if(gConnNum != $("#wifi_conn_num").val()){
				return true;
			}
			return false;
		}
        this.saveDataForQuickSetup = function(index,callback){
			var entry24GSwitch = "RGW/wireless/"+entryIdx+"/wifi_if_24G/switch";
            if(0 == $("#selWifiEnabledSwitch").val()) {//close wifi
                if("on" == wifiDetailedInfoMap.get(entry24GSwitch)) {
            		var result = CloseWifi();
            		callback(result);
                } else {
                	callback("1");
                    return false;
                }
            } else {
            	var flag = false;
            	hideError("0");
            	for(var i=0;i<4;i++){
            		if($(".ssid_"+i).is(":visible")){
            			if(!ValidateData(i)) {
            				flag = true;
            				break;
                        }
            		}
            	}
                if(flag){
                	CloseDlg();
                	return false;
                }
                var changed = changeData(true,"0");
                var wifi_off_changed = wifi_autoOff_changed();
                var maxConnChanged = maxConnectNumChanged();
                if(!changed&&!wifi_off_changed&&!maxConnChanged){
                	callback("1");
                	return "1";
                }
                var modifyConnNumFlag = "";
                var setWifiConfigFlag = "";
                var setWifiAutoOffFlag = "";
                if(maxConnChanged){
    				modifyConnNumFlag = ModifyConnNum();
    			}
                if(changed){
                	setWifiConfigFlag = ModifyWifiConfig("save","0");
                }
                if(wifi_off_changed){
                	setWifiAutoOffFlag = SetWifiAutoOffSetting();
                }
                CloseDlg();
                if (modifyConnNumFlag || setWifiConfigFlag  || setWifiAutoOffFlag) {
                	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_wifi_settings_modify_wifi_param_success"));                	
                	callback("true");
		}else if(modifyConnNumFlag == false){
			
                	showMsgBox(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_wifi_connNum_modify__fail"));
            		callback("false");
                }
                gConnNum = $("#wifi_conn_num").val();
            }
            return true;
        };
        function hideError(i){//SSID information error hide
        	$("#selCurrentSSIDStatus_"+i+",#selHideSSID_"+i+",#selWifiAuthType_"+i+",#selEncryAlg_"+i+",#selWepKeyFormat_"+i+"," +
                "#selApIsolateSwitch_"+i).change(function(){
                	$("#wifiSetErrorLogs_"+i).hide().text("");
        	});
        	$("#txtWifiSSID_"+i+",#txtPasswd_"+i+"").mousedown(function(){
        		$("#wifiSetErrorLogs_"+i).hide().text("");
        	});
        }
        this.changeAuthTypeSSID = function(ssidVal,index){
        	UpdateWifiEncryAlg($(ssidVal).val(),index);
            $("#divWpsCfgDlg_"+index).show();
            if("none" == $(ssidVal).val()) {
                $("#divEncryAlg_"+index).hide();
                $("#divPassWd_"+index).hide();
                $("#divwepKeyFormat_"+index).hide();
            } else if("WEP" == $(ssidVal).val()) {
                $("#divEncryAlg_"+index).show();
                $("#divPassWd_"+index).show();
                $("#divwepKeyFormat_"+index).show();
                $("#divWpsCfgDlg_"+index).hide();
            } else if ("WAPI-PSK" == $(ssidVal).val()) {
                $("#divEncryAlg_"+index).hide();
                $("#divPassWd_"+index).show();
                $("#divwepKeyFormat_"+index).hide();
            } else {
                $("#divEncryAlg_"+index).show();
                $("#divPassWd_"+index).show();
                $("#divwepKeyFormat_"+index).hide();
            }
            if($("#selHideSSID_"+index).val() == "1" || $("#selCurrentSSIDStatus_"+index).val() == "1"){
            	$("#divWpsCfgDlg_"+index).hide();
            }
//             if("Mixed" == $(ssidVal).val() || "WPA-PSK" == $(ssidVal).val()) {
//                 $("#divWpaGroupKey_"+index).show();
//             } else {
//                 $("#divWpaGroupKey_"+index).hide();
//             }
            
            getPwdByEncryption(index);
        };
        function GetWifiAutoOffSetting() {
            var retXml = PostXml("wireless","wifi_get_auto_off_setting");
						
			$(retXml).find(entryIdx).each(function() {
					gAutoOffEnable = $(this).find("auto_off_enable").text();
                    gAutoOffTimeout = $(this).find("auto_off_timeout").text();
             });
            $("#selAutoOffWifiSwitch").val(gAutoOffEnable);
            if(1 == gAutoOffEnable) {
                $("#divWifiAutoOffTimeout").show();
                $("#selAutoOffWifiTimeout").val(gAutoOffTimeout);
            } else {
                $("#divWifiAutoOffTimeout").hide();
            }
        }

        function SetWifiAutoOffSetting() {
            var configMap = new Map();
            var curAutoOffEnable = $("#selAutoOffWifiSwitch").val();//public info:auto close wifi
            var curTimeout = $("#selAutoOffWifiTimeout").val();
            if(1 == curAutoOffEnable && ("" == curTimeout || !IsInteger(curTimeout))) {//open auto close wifi and auto close wifi is blank
                $("#wifiSetErrorLogs").show().text(jQuery.i18n.prop('lAutoOffTimeoutError'));
                return false;
            }
            configMap.put("RGW/wireless/wifi_device","0");
            if(curAutoOffEnable != gAutoOffEnable) {
                configMap.put("RGW/wireless/auto_off_enable",curAutoOffEnable);
                if(1 == curAutoOffEnable) {
                    configMap.put("RGW/wireless/auto_off_timeout",curTimeout);
                }
            } else if (1 == curAutoOffEnable && curTimeout != gAutoOffTimeout) {
                configMap.put("RGW/wireless/auto_off_enable",1);
                configMap.put("RGW/wireless/auto_off_timeout",curTimeout);
            }

            if(configMap.isEmpty()) {
                return false;
            }
            var retXml = PostXmlNoShowWaitBox("wireless","wifi_set_auto_off_setting",configMap);

            if("OK" != $(retXml).find("setting_response").text()) {
                alert("wifi_set_auto_off_setting failed.");
            }
            GetWifiAutoOffSetting();
            return true;
        }


        function ValidateData(index) {
            //验证密码长度
            var strPasswd = $("#txtPasswd_"+index).val();
            var authType = $("#selWifiAuthType_"+index).val();
            var ssidName = $("#txtWifiSSID_"+index).val();
            var server = $("#txtEnterpriseServer_"+index).val();
            //multi SSID,name unique
            if(shownSSIDIndexs.length>1){
        		for(var i=0;i<shownSSIDIndexs.length;i++){
            		var shownSSIDName = $("#txtWifiSSID_"+shownSSIDIndexs[i]).val();
            		if(shownSSIDIndexs[i] != index && ssidName == shownSSIDName){
            			$("#wifiSetErrorLogs_"+index).show().text(jQuery.i18n.prop("dialog_message_ssidName_repeat"));
            			return false;
            		}
            	}
            }
            var ret = true;
            var strErrMsg;
            if("WEP" == authType) {
                switch($("#selWepKeyFormat_"+index).val()) {
                    case "5":
                        if(5 != strPasswd.replace(/\s+/g,"").length || IsChineseChar(strPasswd)) {
                            strErrMsg = jQuery.i18n.prop('lt_wifiset_WepPasswd5AsciiError');
                            ret = false;
                        }
                        break;
                    case "13":
                        if(13 != strPasswd.replace(/\s+/g,"").length || IsChineseChar(strPasswd)) {
                            strErrMsg = jQuery.i18n.prop('lt_wifiset_WepPasswd13AsciiError');
                            ret = false;
                        }
                        break;
                    case "10":
                        if(!IsHexStr(strPasswd) || 10 != strPasswd.replace(/\s+/g,"").length) {
                            strErrMsg = jQuery.i18n.prop('lt_wifiset_WepPasswd10HexError');
                            ret = false;
                        }
                        break;
                    case "26":
                        if(!IsHexStr(strPasswd) || 26 != strPasswd.replace(/\s+/g,"").length) {
                            strErrMsg = jQuery.i18n.prop('lt_wifiset_WepPasswd26HexError');
                            ret = false;
                        }
                        break;
                }
	    }else if ("none" != authType) {
                if(strPasswd.length > 64 || strPasswd.length < 8) {
                    strErrMsg = jQuery.i18n.prop('lt_wifiset_WPA2PSKPasswdError');
                    ret = false;
                }
                
                if (IsChineseChar(strPasswd)) {
                	strErrMsg = jQuery.i18n.prop('lt_wifiset_WPA2PSKPasswdError2');
                	ret = false;
                }
            }
            if("WPA" == authType || "WPA2" == authType){
	        	if(server == "" || server.trim() == ""){
	        		strErrMsg = jQuery.i18n.prop('lt_wifiset_EnterpriseServer_blank');
	                ret = false;
	        	}
            }
            if(IsChineseChar(server)){
            	strErrMsg = jQuery.i18n.prop('lt_wifiset_serverError');
            	ret = false;
            }

            if(ssidName== "") {
                strErrMsg = jQuery.i18n.prop('lt_wifiSet_SsidIsEmpty');
                ret = false;
            }

            if(!ret) {
                $("#wifiSetErrorLogs_"+index).show().text(strErrMsg);
                return false;
            }
            
            var curAutoOffEnable = $("#selAutoOffWifiSwitch").val();
            var curTimeout = $("#selAutoOffWifiTimeout").val();
            if(1 == curAutoOffEnable && ("" == curTimeout || !IsInteger(curTimeout))) {
                $("#wifiSetErrorLogs").show().text(jQuery.i18n.prop('lAutoOffTimeoutError'));
                return false;
            }
            return true;
        }
        
        function CloseWifi() {
        	var configMap = new Map();
            var retXml;
			var i=0;
			if("on" == wifiDetailedInfoMap.get("RGW/wireless/AP0/wifi_if_24G/switch")) {
				configMap.put("RGW/wireless/wifi_if_24G/switch","off");
				configMap.put("RGW/wireless/wifi_device",gCurrentAPItem);
				configMap.put("RGW/wireless/wifi_if_24G/multi_ssid",1);
				retXml = PostXml("wireless","wifi_set_2.4g",configMap);
				CloseDlg();
				GetWifiDetailedInfo();
				RefreshWifiRFSwitch();
				RefreshFreqBandData();
				if("OK" != $(retXml).find("setting_response").text()) {
					showMsgBox(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_wifi_settings_close_wifi_fail"));
					return "false";
				} else {
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_wifi_settings_close_wifi_success"));
					return "true";
				}
				
			}
        }

        function ModifyConnNum(){
        	var connNumMap = new Map();
        	connNumMap.put("RGW/wireless/wifi_device", gCurrentAPItem);
        	connNumMap.put("RGW/wireless/client_num", $("#wifi_conn_num").val());
        	var retXml = PostXmlNoShowWaitBox("wireless","wifi_set_client_num_setting",connNumMap);
        	if("OK" != $(retXml).find("setting_response").text()) {
            	return false;
            }
        	return true;
        }

        function  changeData(type,index){
        	if ("on" != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/switch")) {
        		return true;
          	}
        	if ($("#sel2_4G80211Protocol").val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/net_mode")) {
          		return true;
          	}
          	var country = $("#selWifiCountryCode").val();
			if(country == "US" || country == "MX"){
				if ($("#selWifi24GChannelFor1_11").val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/channel")) {
					return true;
				}
			}else if(country == "JP"){
				if ($("#selWifi24GChannelFor1_14").val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/channel")) {
					return true;
				}
			}else{
				if ($("#selWifi24GChannelFor1_13").val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/channel")) {
					return true;
				}
			}
        	if(country != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/country")){
          		return true;
          	}
            	var bandwidth = "";
            	if($("#sel2_4G80211Protocol").val() == "11ng"){
            		bandwidth = $("#sel80211nBandWidth").val();
            	}else{
            		bandwidth = "HT20";
            	}
            	if (bandwidth != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/bandwidth")) {
               	return true;
            }
            if(type){
                    if(index!=0){
                        if($("#selCurrentSSIDStatus_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/disabled")){
                            return true;
                        }
                    }
				    if($("#selHideSSID_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/hidden")) {
				    	return true;
				    }
            	if($("#selApIsolateSwitch_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/isolate")) {
				   	return true;
                }
                	
                if($("#txtWifiSSID_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/ssid")) {
				   	return true;
                }
                if($("#selApIsolateSwitch_"+index).val()=="1") {
				   	return true;
                }
            	if(GetEncryptionTag(index) != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/encryption")) {
			    	return true;
            	}
            	if("WEP" == $("#selWifiAuthType_"+index).val()) {
            		if (1 != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/key")) {
            			return true;
            		}
            		
            		if($("#txtPasswd_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/key1")) {
            			return true;
            		}
            	} else if($("#selWifiAuthType_"+index).val() != "none"){
        			if ($("#txtPasswd_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+index+"/key")) {
	            			return true;
        			}
            	}
            }
            return false;
        }
        function wifi_autoOff_changed(){
        	var curAutoOffEnable = $("#selAutoOffWifiSwitch").val();
            var curTimeout = $("#selAutoOffWifiTimeout").val();
            if(curAutoOffEnable != gAutoOffEnable) {
            	return true;
            }
            if(curTimeout != gAutoOffTimeout){
            	return true;
            }
            return false;
        }
        function ModifyWifiConfig(type,index) {
            var retXml;
            var curWifiConfigMap = new Map();
            curWifiConfigMap.put("RGW/wireless/wifi_device", gCurrentAPItem);
		    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/switch", "on");
		    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/net_mode", $("#sel2_4G80211Protocol").val());
		    var country = $("#selWifiCountryCode").val();
		    var channel = "";
		    if(country == "US" ||country == "MX"){
		    	channel = $("#selWifi24GChannelFor1_11").val();
		    }else if(country == "JP"){
		    	channel = $("#selWifi24GChannelFor1_14").val();
		    }else{
		    	channel = $("#selWifi24GChannelFor1_13").val();
		    }
		    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/country",country);
		    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/channel",channel);
		    
            	var bandwidth = "";
            	if($("#sel2_4G80211Protocol").val() == "11ng"){
            		bandwidth = $("#sel80211nBandWidth").val();
            	}else{
            		bandwidth = "HT20";
            	}
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_24G/bandwidth",bandwidth);
		    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/multi_ssid",1);
		    
		    if(type){
                    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/disabled",$("#selCurrentSSIDStatus_"+index).val());
		    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/hidden",$("#selHideSSID_"+index).val());
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_24G/isolate",$("#selApIsolateSwitch_"+index).val());
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_24G/ssid",$("#txtWifiSSID_"+index).val());
		    	
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_24G/encryption",GetEncryptionTag(index));
		    
			    curWifiConfigMap.put("RGW/wireless/wifi_if_24G/ssid_index",index);
		if("WEP" == $("#selWifiAuthType_"+index).val()) {
            		curWifiConfigMap.put("RGW/wireless/wifi_if_24G/key",1);
            		curWifiConfigMap.put("RGW/wireless/wifi_if_24G/key1",$("#txtPasswd_"+index).val());
            	} else  if("none" != $("#selWifiAuthType_"+index).val()){
            		curWifiConfigMap.put("RGW/wireless/wifi_if_24G/key",$("#txtPasswd_"+index).val());
            	}
		    }
            retXml = PostXmlNoShowWaitBox("wireless","wifi_set_2.4g",curWifiConfigMap);
            
            if("OK" != $(retXml).find("setting_response").text()) {
            	showMsgBox(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_wifi_settings_modify_wifi_param_fail"));
            	return false;
            }
            GetWifiDetailedInfo();
            RefreshWifiRFSwitch();
            RefreshFreqBandData();
            return true;
        }

        function UpdateWifiEncryAlg(strAuthType,index) {
        	$("#selEncryAlg_For_WEP_"+index).hide();
        	$("#selEncryAlg_For_WPA_PSK_"+index).hide();
            if(strAuthType=="WEP"){
            	$("#selEncryAlg_For_WEP_"+index).show();
            }else{
            	$("#selEncryAlg_For_WPA_PSK_"+index).show();
            }
        }

        function GetWifiBasicInfo() {
            wifiDetailedInfoMap.clear();
            var retXml = PostXml("wireless","wifi_get_basic_info");
            var wifi24GStatus;
            $(retXml).find("wifi_if_24G").each(function() {
                wifi24GStatus = $(this).find("switch").text();
            });

            if("off" == wifi24GStatus) {
                $("#selWifiEnabledSwitch").val(0);
                $("#divDisabledWifi,.publicInformation2").hide();
                return;
            } else {
                $("#selWifiEnabledSwitch").val(1);
                $("#divDisabledWifi,.publicInformation2").show();
                $("#selRfBand").val("2.4GHz");
            }
            GetWifiDetailedInfo();
        }

        function RefreshWifiRFSwitch() {
        	var c24GAPSwitch = wifiDetailedInfoMap.get("RGW/wireless/AP" + gCurrentAPItem+"/wifi_if_24G/switch");
            if(("off" == c24GAPSwitch || undefined == c24GAPSwitch)) {
                $("#selWifiEnabledSwitch").val(0);
                $("#divDisabledWifi,.publicInformation2").hide();
            } else {
                $("#selWifiEnabledSwitch").val(1);
                $("#divDisabledWifi,.publicInformation2").show();
                $("#selRfBand").val("2.4GHz");
            }
        }

		function RefreshssidInfo(){
            var nssid_24G = wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid_num");
            for(var i=0;i<nssid_24G;i++){
                    $("#selCurrentSSIDStatus_"+i).val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/disabled"));
	                var ssidStatus = wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/hidden");
	                $("#selHideSSID_"+i).val(ssidStatus);
                $("#selApIsolateSwitch_"+i).val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/isolate"));
                $("#txtWifiSSID_"+i).val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/ssid"));
                var encryptionMap = ParseEncryption(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/encryption"));
                UpdateWifiEncryAlg(encryptionMap.get("authType"),i);
                var anthType = encryptionMap.get("authType");
	                $("#selWifiAuthType_"+i).val(anthType);
                if(anthType == "WEP"){
                	  $("#txtPasswd_"+i).val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/key1"));
	                	  $("#selEncryAlg_For_WEP_"+i).val(encryptionMap.get("ciphers"));
                }else{
		                  $("#selEncryAlg_For_WPA_PSK_"+i).val(encryptionMap.get("ciphers"));
                	  $("#txtPasswd_"+i).val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/key"));
                }
                $("#divWpsCfgDlg_"+i).show();
                if("WEP" == anthType) {
                    $("#divwepKeyFormat_"+i).show();
                    $("#selWepKeyFormat_"+i).val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/ssid"+i+"/key1").length);
                    $("#divEncryAlg_"+i).show();
                    $("#divPassWd_"+i).show();
                    $("#divWpsCfgDlg_"+i).hide();
                }else if("none" == anthType){
                	$("#divEncryAlg_"+i).hide();
	                $("#divPassWd_"+i).hide();
	                $("#divwepKeyFormat_"+i).hide();
                }else{
                	 $("#divEncryAlg_"+i).show();
	                 $("#divPassWd_"+i).show();
	                 $("#divwepKeyFormat_"+i).hide();
                }
            
// 	            if("Mixed" == $("#selWifiAuthType_"+i).val() || "WPA-PSK" == $("#selWifiAuthType_"+i).val()) {
// 	                $("#divWpaGroupKey_"+i).show();
// 	            } else {
// 	                $("#divWpaGroupKey_"+i).hide();
// 	            }
			}
		}

        function RefreshFreqBandData() {
            $("#div2_4G80211Protocol").hide();
            $("#divwepKeyFormat").hide();

        	$("#24GChannelFor1_11").hide();
	    	$("#24GChannelFor1_13").hide();
	    	$("#24GChannelFor1_14").hide();
		    	$("#div80211nBandWidth_forBG").hide();
            	$("#div80211nBandWidth").hide();
	    	
            $("#div2_4G80211Protocol").show();
            $("#sel2_4G80211Protocol").val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/net_mode"));
            var coutryCode = wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/country");
            $("#selWifiCountryCode").val(coutryCode);
            $("#24GChannel").show();
            var channel = wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/channel");
            
		    if(coutryCode == "US" ||coutryCode == "MX"){
		    	$("#selWifi24GChannelFor1_11").val(channel);
		    	$("#24GChannelFor1_11").show();
		    }else if(coutryCode == "JP"){
		    	$("#selWifi24GChannelFor1_14").val(channel);
		    	$("#24GChannelFor1_14").show();
		    }else{
		    	$("#selWifi24GChannelFor1_13").val(channel);
		    	$("#24GChannelFor1_13").show();
		    }
            $("#selWifi5GChannel").hide();
            	if($("#sel2_4G80211Protocol").val() == "11ng"){
			$("#div80211nBandWidth").show();
            		$("#sel80211nBandWidth").val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/bandwidth"));
            	}else{
			$("#div80211nBandWidth_forBG").show();
			$("#sel80211nBandWidth_forBG").val(wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem+"/wifi_if_24G/bandwidth"));
		}

			RefreshssidInfo();
        }

        function GetWifiDetailedInfo() {
            wifiDetailedInfoMap.clear();
			$("#selWifiAPList").empty();
			var idx =0; 
			var connNum = PostXml("wireless","wifi_get_client_num_setting");
			gConnNum = $(connNum).find("AP0").find("client_num").text();
			$("#wifi_conn_num").val(gConnNum);
			var retXml = PostXml("wireless","wifi_get_detail");
            
			$(retXml).find("AP"+gCurrentAPItem).find("wifi_if_24G").each(function(){
				packageWifiDetailedInfo(this,"wifi_if_24G");
			}); 
        }
        
        function packageWifiDetailedInfo(AP0XML,type){
        	showSSIDs = [];
        	shownSSIDIndexs = [];
        	wifiDetailedInfoMap.put("RGW/wireless/AP"+gCurrentAPItem+"/"+type+"/ssid_num",$(AP0XML).find("n_ssid").text());
			wifiDetailedInfoMap.put("RGW/wireless/AP"+gCurrentAPItem+"/"+type+"/switch",$(AP0XML).find("switch").text());
			wifiDetailedInfoMap.put("RGW/wireless/AP"+gCurrentAPItem+"/"+type+"/net_mode",$(AP0XML).find("net_mode").text());
			wifiDetailedInfoMap.put("RGW/wireless/AP"+gCurrentAPItem+"/"+type+"/country",$(AP0XML).find("country").text());
			wifiDetailedInfoMap.put("RGW/wireless/AP"+gCurrentAPItem+"/"+type+"/channel",$(AP0XML).find("channel").text());
			wifiDetailedInfoMap.put("RGW/wireless/AP"+gCurrentAPItem+"/"+type+"/bandwidth",$(AP0XML).find("bandwidth").text());
			if("on" == $(AP0XML).find("switch").text()) {
                $("#ssids_detail,.publicInformation2,#divDisabledWifi").show();
            } else {
                $("#ssids_detail,.publicInformation2,#divDisabledWifi").hide();
            }
			var j=0;
			var ssidNum = $(AP0XML).find("n_ssid").text();
			
			for(;j<ssidNum;j++){
				$(AP0XML).find("ssid"+j).each(function(){
					var ssidDisabled = $(this).find("disabled").text();
					if(ssidDisabled == "0"){
						$(".ssid_"+j).show();
						shownSSIDIndexs.push(j);
					}else{
						$(".ssid_"+j).hide();
						showSSIDs.push(j);
					}
					wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/disabled",$(this).find("disabled").text());
					wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/hidden",$(this).find("hidden").text());
					wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/isolate",$(this).find("isolate").text());
					wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/ssid",$(this).find("ssid").text());
					wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/encryption",$(this).find("encryption").text());
					wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/wpa_group_rekey",$(this).find("wpa_group_rekey").text());
					//In WEP mode, this can be an integer specifying which key index to use (key1, key2, key3, or key4.)
					if("wep-open" == $(this).find("encryption").text() || "wep" == $(this).find("encryption").text()) {
						var WepKeyTag = "key" + $(this).find("key").text();
						wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/key",$(this).find("key").text());
						wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/key1",$(this).find(WepKeyTag).text());
					} else {
						wifiDetailedInfoMap.put("RGW/wireless/AP"+ gCurrentAPItem +"/"+type+"/ssid"+ j +"/key",$(this).find("key").text());
					}
				});
			}
			if(showSSIDs.length==0){
				$("#lt_btnAddSSID").attr("disabled","disabled");
			}else{
				$("#lt_btnAddSSID").removeAttr("disabled");
			}
		}

        //由认证类型和加密方式获取 encryption tag
        function GetEncryptionTag(index) {
        	var authType = $("#selWifiAuthType_"+index).val();
	    	var ciphers = "";
	    	if(authType == "WEP"){
	    		ciphers = $("#selEncryAlg_For_WEP_"+index).val();
	    		if(!ciphers){
	    			ciphers = "Shared-key";
	    			$("#selEncryAlg_For_WEP_"+index).val(ciphers);
	    		}
	    	}else{
	    		ciphers = $("#selEncryAlg_For_WPA_PSK_"+index).val();
	    		if(!ciphers){
	    			ciphers = "TKIP/AES-CCMP";
	    			$("#selEncryAlg_For_WPA_PSK_"+index).val(ciphers);
	    		}
	    	}
            switch(authType) {
                case "WPA-PSK":
                    if("AES-CCMP" == ciphers) return "psk+ccmp";
                    else if("TKIP" == ciphers) return "psk+tkip";
                    else if("TKIP/AES-CCMP" == ciphers) return "psk+tkip+ccmp";
                    break;
                case "WPA2-PSK":
                    if("AES-CCMP" == ciphers) return "psk2+ccmp";
                    else if("TKIP" == ciphers) return "psk2+tkip";
                    else if("TKIP/AES-CCMP" == ciphers) return "psk2+tkip+ccmp";
                    break;
                case "Mixed":
                    if("TKIP/AES-CCMP" == ciphers) return "psk-mixed+tkip+ccmp";
                    else if("TKIP" == ciphers) return "psk-mixed+tkip";
                    else if("AES-CCMP" == ciphers) return "psk-mixed+ccmp";
                    break;
                case "none":
                    return "none";
                    break;
                case "WEP":
                	return "wep-open";
                	break;
                default:
                    return "";
            }
        }

        //解析 encryption tag 得到认证类型和加密方式
        function ParseEncryption(encryptInfo) {
            var encryptInfoMap = new Map();
            switch(encryptInfo) {
                    //WPA-PSK
                case "psk+ccmp":
                case "psk+aes":
                    encryptInfoMap.put("authType","WPA-PSK");
                    encryptInfoMap.put("ciphers","AES-CCMP");
                    break;
                case "psk":
                case "psk+tkip":
                    encryptInfoMap.put("authType","WPA-PSK");
                    encryptInfoMap.put("ciphers","TKIP");
                    break;
                case "psk+tkip+ccmp":
                case "psk+tkip+aes":
                    encryptInfoMap.put("authType","WPA-PSK");
                    encryptInfoMap.put("ciphers","TKIP/AES-CCMP");
                    break;
                    //WPA2-PSK
                case "psk2":
                case "psk2+ccmp":
                case "psk2+aes":
                    encryptInfoMap.put("authType","WPA2-PSK");
                    encryptInfoMap.put("ciphers","AES-CCMP");
                    break;
                case "psk2+tkip+ccmp":
                case "psk2+tkip+aes":
                    encryptInfoMap.put("authType","WPA2-PSK");
                    encryptInfoMap.put("ciphers","TKIP/AES-CCMP");
                    break;
                case "psk2+tkip":
                	encryptInfoMap.put("authType","WPA2-PSK");
                    encryptInfoMap.put("ciphers","TKIP");
                    break;
                    //WPA/WPA2-MIXED
                case "psk-mixed":
                case "psk-mixed+tkip+aes":
                case "psk-mixed+tkip+ccmp":
                    encryptInfoMap.put("authType","Mixed");
                    encryptInfoMap.put("ciphers","TKIP/AES-CCMP");
                    break;
                case "psk-mixed+aes":
                case "psk-mixed+ccmp":
                    encryptInfoMap.put("authType","Mixed");
                    encryptInfoMap.put("ciphers","AES-CCMP");
                    break;
                case "psk-mixed+tkip":
                	encryptInfoMap.put("authType","Mixed");
                	encryptInfoMap.put("ciphers","TKIP");
                	break;
                    //MEP
                case "wep-open":
                    encryptInfoMap.put("authType","WEP");
                    encryptInfoMap.put("ciphers","Shared-key");
                    break;
                case "none":
                    encryptInfoMap.put("authType","none");
                    encryptInfoMap.put("ciphers","");
                    break;
                default:
                    encryptInfoMap.put("authType","");
                    encryptInfoMap.put("ciphers","");
                    break;
            }
            return encryptInfoMap;

        }
        function getPwdByEncryption(index){
        	var paramMap = new Map();
        	if($("#selWifiAuthType_"+index).val() == "none"){
        		return;
        	}
        	var encryType = GetEncryptionTag(index);
    		paramMap.put("RGW/wireless/wifi_if_24G/encryption",encryType);
    		paramMap.put("RGW/wireless/wifi_if_24G/ssid_index",index);
        	var retXml = PostXml("wireless","wifi_get_key",paramMap);
			if($("#selWifiAuthType_"+index).val()=="WEP"){
				var pwd = $(retXml).find("AP0").find("wifi_if_24G").find("key1").text();
				$("#txtPasswd_"+index).val(pwd);
				$("#selWepKeyFormat_"+index).val(pwd.length);
			}else{
				$("#txtPasswd_"+index).val($(retXml).find("AP0").find("wifi_if_24G").find("key").text());
			}
        }
        return this;
    }
})(jQuery);

function changeAuthType(ssidVal,index){
	$(ssidVal).objWifiSet().changeAuthTypeSSID(ssidVal,index);
}

function hideSSID(hideSSID,index){
	if($(hideSSID).val() == "1"){
		$("#divWpsCfgDlg_"+index).hide();
	}else if($("#selCurrentSSIDStatus_"+index).val() =="1" || $("#selWifiAuthType_"+index).val() == "WEP"){
		$("#divWpsCfgDlg_"+index).hide();
	}else{
		$("#divWpsCfgDlg_"+index).show();
	}
}
function addNewSSID(btn){
	var index = showSSIDs[0];
	$(".ssid_"+ index).show();
	$("#selCurrentSSIDStatus_"+index).val("0");
	$("#divWpsCfgDlg_"+showSSIDs[0]).hide();
	showSSIDs.splice(0,1);
	if(showSSIDs.length == 0){
		$(btn).attr("disabled","disabled");
	}
}
function hideOrShowWPSBtn(disableSSID,index){
	if($(disableSSID).val() == "1"|| $("#selWifiAuthType_"+index).val() == "WEP"){//close
		$("#divWpsCfgDlg_"+index).hide();
	}else{
		$("#divWpsCfgDlg_"+index).show();
	}
	if($(disableSSID).val() == "1"){
		if(shownSSIDIndexs.indexOf(index) != -1){
			shownSSIDIndexs.splice(shownSSIDIndexs.indexOf(index),1);
		}
	}else{
		if(shownSSIDIndexs.indexOf(index) == -1){
			shownSSIDIndexs.push(index);
		}
	}
}
function deleteThisSSID(ssidIndex){
	ShowDlg("PleaseWait", 200, 130);
	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
	setTimeout(function(){
		var delMap = new Map();
		delMap.put("RGW/wireless/wifi_if_24G/disabled","1");
		delMap.put("RGW/wireless/wifi_if_24G/multi_ssid",1);
		delMap.put("RGW/wireless/wifi_if_24G/ssid_index",ssidIndex);
		if("2.4GHz" == $("#selRfBand").val()) { //24G
			PostXmlAsync("wireless","wifi_set_2.4g",delMap,function(data){
				$("#lt_btnAddSSID").objWifiSet().initDeleteSSID();
				if("OK" == $(data).find("setting_response").text()){
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_deleteSSID_success"));
				}else{
					showMsgBox(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_deleteSSID_failed"));
				}
			});
		}else{
			PostXmlAsync("wireless","wifi_set_5g",delMap,function(data){
				$("#lt_btnAddSSID").objWifiSet().initDeleteSSID();
				if("OK" == $(data).find("setting_response").text()){
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_deleteSSID_success"));
				}else{
					showMsgBox(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_deleteSSID_failed"));
				}
			});
		}
	},100);
}

function saveSSID(ssidIndex){
	$("#lt_btnAddSSID").objWifiSet().SaveData("save",ssidIndex);
}
