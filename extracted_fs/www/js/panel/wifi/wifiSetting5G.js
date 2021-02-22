var gConnNum5G = 1;//max connection counts
var showSSIDs5G = [];
var wifiDetailedInfoMap5G = new Map();
var wps_index5G;
var shownSSIDIndexs5G = [];
var gAutoOffEnable5G;
var gAutoOffTimeout5G;
(function($) {
    $.fn.objWifiSet5G = function() {
		var entryIdx5G = "AP1";//5G
		var gWirelessAPNum5G = "0";
		var gCurrentAPItem5G = "1";
		
        this.onLoad = function(flag) {
        	gAutoOffTimeout5G = "";
        	wifiDetailedInfoMap5G = new Map();
            if(flag) {
                LoadWebPage("html/wifi/wireless_settings_5G.html");
				
                $("#selWifiEnabledSwitch5G").change(function() {
                    if(1==$(this).val()) {
                        $("#ssids_detail5G,.publicInformation2,#divDisabledWifi5G").show();
                    } else {
                        $("#ssids_detail5G,.publicInformation2,#divDisabledWifi5G").hide();
                    }
                });

                $("#wifi_conn_num5G").mousedown(function() {
                    $("#wifiSetErrorLogs5G").hide().text("");
                    $("#wifiSetErrorLogs5G_0").hide().text("");
                });
                $("#selWifiEnabledSwitch5G,#selRfBand5G,#sel5G80211Protocol,#selWifi5GChannelFor1_11,#selWifi5GChannelFor1_13,#selWifi5GChannelFor1_14,#selWifi5Channel," +
                		"#sel80211nBandWidth5G_channel_165,#sel80211nBandWidth5G,#sel80211acBandWidth5G,#selAutoOffWifiSwitch5G,#selAutoOffWifiTimeout5G").change(function(){
                	$("#wifiSetErrorLogs5G").hide().text("");
                	$("#wifiSetErrorLogs5G_0").hide().text("");
                });
                
                $("#selAutoOffWifiSwitch5G").click(function() {
                    if(1 == $(this).val()) {
                        $("#divWifiAutoOffTimeout5G").show();
                    } else {
                        $("#divWifiAutoOffTimeout5G").hide();
                    }
                });
                
                $("#selWifi5GChannel5G").change(function(){
                	$("#div80211nBandWidth5G_channel_165").hide();
                	$("#div80211nBandWidth5G").hide();
                	if($(this).val() == "165"){
                		$("#div80211nBandWidth5G_channel_165").show();
                	}else{
                		$("#div80211nBandWidth5G").show();
                	}
                });
                var connNumSize = "";
                for(var i=1;i<=32;i++){
                	connNumSize += "<option value='"+i+"'>"+i+"</option>"
                }
                $("#wifi_conn_num5G").append(connNumSize);
            } //end flag
						if(config_hasWIFI5G && hasPower){
							isHasPower();
						}
						
            GetWifiDetailedInfo();
            RefreshWifiRFSwitch();
            RefreshFreqBandData();
            GetWifiAutoOffSetting();
        };

        this.SaveData = function(type,index) {
			var entry5GSwitch = "RGW/wireless/"+entryIdx5G+"/wifi_if_5G/switch";
            if(0 == $("#selWifiEnabledSwitch5G").val()) {//close wifi
                if("on" == wifiDetailedInfoMap5G.get(entry5GSwitch)) {
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
							gConnNum5G = $("#wifi_conn_num5G").val();
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
        }
        
				function isHasPower(){
						var retXml = PostXml('wireless','wifi_get_power_status');
						if($(retXml).find('power_on').text() == '0'){   //没有电源
								$('#selWifiEnabledSwitch5G').prop('disabled',true);
								$('#lt_btnApply').prop('disabled',true);
						}else{
								$('#selWifiEnabledSwitch5G').prop('disabled',false);
								$('#lt_btnApply').prop('disabled',false);
						}
				}
				
        function maxConnectNumChanged(){
			if(gConnNum5G != $("#wifi_conn_num5G").val()){
				return true;
			}
			return false;
		}
        this.saveDataForQuickSetup = function(index,callback){
			var entry5GSwitch = "RGW/wireless/"+entryIdx5G+"/wifi_if_5G/switch";
            if(0 == $("#selWifiEnabledSwitch5G").val()) {
            	//close wifi
            	if("on" == wifiDetailedInfoMap5G.get(entry5GSwitch)) {
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
                gConnNum5G = $("#wifi_conn_num5G").val();
            }
            return true;
        };
        function hideError(i){//SSID information error hide
        	$("#selCurrentSSIDStatus5G_"+i+",#selWifiAuthType5G_"+i+",#selEncryAlg5G_"+i+",#selWepKeyFormat5G_"+i+"," +
                "#selCurrentSSIDStatus5G_"+i+",#selApIsolateSwitch5G_"+i).change(function(){
                	$("#wifiSetErrorLogs5G_"+i).hide().text("");
        	});
        	$("#txtWifiSSID5G_"+i+",#txtPasswd5G_"+i+",#txtWpaGroupKeyUpdateInterval5G_"+i+"").mousedown(function(){
        		$("#wifiSetErrorLogs5G_"+i).hide().text("");
        	});
        }
        this.changeAuthTypeSSID = function(ssidVal,index){
        	UpdateWifiEncryAlg($(ssidVal).val(),index);
            $("#divWpsCfgDlg5G_"+index).show();
            if("none" == $(ssidVal).val()) {
                $("#divEncryAlg5G_"+index).hide();
                $("#divPassWd5G_"+index).hide();
                $("#divwepKeyFormat5G_"+index).hide();
            } else if("WEP" == $(ssidVal).val()) {
                $("#divEncryAlg5G_"+index).show();
                $("#divPassWd5G_"+index).show();
                $("#divwepKeyFormat5G_"+index).show();
                $("#divWpsCfgDlg5G_"+index).hide();
            } else if ("WAPI-PSK" == $(ssidVal).val()) {
                $("#divEncryAlg5G_"+index).hide();
                $("#divPassWd5G_"+index).show();
                $("#divwepKeyFormat5G_"+index).hide();
            } else {
                $("#divEncryAlg5G_"+index).show();
                $("#divPassWd5G_"+index).show();
                $("#divwepKeyFormat5G_"+index).hide();
            }
            if($("#selCurrentSSIDStatus5G_"+index).val() == "1"){
            	$("#divWpsCfgDlg5G_"+index).hide();
            }
            if("Mixed" == $(ssidVal).val() || "WPA-PSK" == $(ssidVal).val()) {
                $("#divWpaGroupKey5G_"+index).show();
            } else {
                $("#divWpaGroupKey5G_"+index).hide();
            }
            
            getPwdByEncryption(index);
        };
        function GetWifiAutoOffSetting() {
            var retXml = PostXml("wireless","wifi_get_auto_off_setting");
						
			$(retXml).find(entryIdx5G).each(function() {
				gAutoOffEnable5G = $(this).find("auto_off_enable").text();
                gAutoOffTimeout5G = $(this).find("auto_off_timeout").text();
            });
			
            
            $("#selAutoOffWifiSwitch5G").val(gAutoOffEnable5G);
            if(1 == gAutoOffEnable5G) {
                $("#divWifiAutoOffTimeout5G").show();
                $("#selAutoOffWifiTimeout5G").val(gAutoOffTimeout5G);
            } else {
                $("#divWifiAutoOffTimeout5G").hide();
            }
        }

        function SetWifiAutoOffSetting() {
            var configMap = new Map();
            configMap.put("RGW/wireless/wifi_device",gCurrentAPItem5G);
            var curAutoOffEnable = $("#selAutoOffWifiSwitch5G").val();//public info:auto close wifi
            var curTimeout = $("#selAutoOffWifiTimeout5G").val();
            if(1 == curAutoOffEnable && ("" == curTimeout || !IsInteger(curTimeout))) {//open auto close wifi and auto close wifi is blank
                $("#wifiSetErrorLogs5G").show().text(jQuery.i18n.prop('lAutoOffTimeoutError'));
                return false;
            }

            if(curAutoOffEnable != gAutoOffEnable5G) {
                configMap.put("RGW/wireless/auto_off_enable",curAutoOffEnable);
                if(1 == curAutoOffEnable) {
                    configMap.put("RGW/wireless/auto_off_timeout",curTimeout);
                }
            } else if (1 == curAutoOffEnable && curTimeout != gAutoOffTimeout5G) {
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
            var strPasswd = $("#txtPasswd5G_"+index).val();
            var authType = $("#selWifiAuthType5G_"+index).val();
            var ssidName = $("#txtWifiSSID5G_"+index).val();
            var server = $("#txtEnterpriseServer5G_"+index).val();
            //multi SSID,name unique
            if(shownSSIDIndexs5G.length>1){
        		for(var i=0;i<shownSSIDIndexs5G.length;i++){
            		var shownSSIDName = $("#txtWifiSSID5G_"+shownSSIDIndexs5G[i]).val();
            		if(shownSSIDIndexs5G[i] != index && ssidName == shownSSIDName){
            			$("#wifiSetErrorLogs5G_"+index).show().text(jQuery.i18n.prop("dialog_message_ssidName_repeat"));
            			return false;
            		}
            	}
            }
            var ret = true;
            var strErrMsg;
            if("WEP" == authType) {
                switch($("#selWepKeyFormat5G_"+index).val()) {
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
            if("WPA-PSK" == authType || "Mixed" == authType) {
                var WpaGroupKeyUpdateInterval = $("#txtWpaGroupKeyUpdateInterval5G_"+index).val();
                if("" == WpaGroupKeyUpdateInterval || !IsNumber(WpaGroupKeyUpdateInterval) ||parseInt(WpaGroupKeyUpdateInterval)>100
                	|| parseInt(WpaGroupKeyUpdateInterval)<1 || WpaGroupKeyUpdateInterval.indexOf("0")==0) {
                    strErrMsg = jQuery.i18n.prop('lt_wifiset_WPAGroupRekeyError');
                    ret = false;
                }
            }

            if(ssidName== "") {
                strErrMsg = jQuery.i18n.prop('lt_wifiSet_SsidIsEmpty');
                ret = false;
            }

            if(!ret) {
                $("#wifiSetErrorLogs5G_"+index).show().text(strErrMsg);
                return false;
            }
            
            var curAutoOffEnable = $("#selAutoOffWifiSwitch5G").val();
            var curTimeout = $("#selAutoOffWifiTimeout5G").val();
            if(1 == curAutoOffEnable && ("" == curTimeout || !IsInteger(curTimeout))) {
                $("#wifiSetErrorLogs5G").show().text(jQuery.i18n.prop('lAutoOffTimeoutError'));
                return false;
            }
            return true;
        }
        
        function CloseWifi() {
        	var configMap = new Map();
            var retXml;
			var i=0;
			if("on" == wifiDetailedInfoMap5G.get("RGW/wireless/AP1/wifi_if_5G/switch")) {
				configMap.put("RGW/wireless/wifi_if_5G/switch","off");
				configMap.put("RGW/wireless/wifi_device",gCurrentAPItem5G);
				configMap.put("RGW/wireless/wifi_if_5G/multi_ssid",1);
				retXml = PostXml("wireless","wifi_set_5g",configMap);

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
        	connNumMap.put("RGW/wireless/wifi_device", gCurrentAPItem5G);
        	connNumMap.put("RGW/wireless/client_num", $("#wifi_conn_num5G").val());
        	var retXml = PostXmlNoShowWaitBox("wireless","wifi_set_client_num_setting",connNumMap);
        	if("OK" != $(retXml).find("setting_response").text()) {
            	return false;
            }
        	return true;
        }

        function  changeData(type,index){
        	if ("on" != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/switch")) {
        		return true;
          	}
        	if ($("#sel5G80211Protocol").val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/net_mode")) {
          		return true;
          	}
			if ($("#selWifi5GChannel5G").val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/channel")) {
				return true;
			}
			var bandwidth = "";
		    if($("#selWifi5GChannel5G").val() == "165"){
		    	bandwidth = "HT20";
		    }else{
		    	bandwidth = $("#sel80211nBandWidth5G").val();
		    }
            if (bandwidth != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/bandwidth")) {
               	return true;
            }
            if(type){
		if(index!=0){
                        if($("#selCurrentSSIDStatus5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/disabled")){
                            return true;
                        }
                    }
				    if($("#selHideSSID5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/hidden")) {
				    	return true;
				    }
            	if($("#selApIsolateSwitch5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/isolate")) {
				   	return true;
                }
                	
                if($("#txtWifiSSID5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/ssid")) {
				   	return true;
                }
                if($("#selApIsolateSwitch5G_"+index).val() == "1" && $("#txtWpaGroupKeyUpdateInterval5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/wpa_group_rekey")) {
				   	return true;
                }
            	if(GetEncryptionTag(index)!= wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/encryption")) {
			    	return true;
            	}
            	if("WEP" == $("#selWifiAuthType5G_"+index).val()) {
            		if (1 != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/key")) {
            			return true;
            		}
            		
            		if($("#txtPasswd5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/key1")) {
            			return true;
            		}
            	} else if("none" != $("#selWifiAuthType5G_"+index).val()) {
            		if("Mixed" == $("#selWifiAuthType5G_"+index).val() || "WPA-PSK" == $("#selWifiAuthType5G_"+index).val()){
            			if ($("#txtWpaGroupKeyUpdateInterval5G_"+index).val() != wifiDetailedInfoMap.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/wpa_group_rekey")) {
            				return true;
            			}
            		}
        			if ($("#txtPasswd5G_"+index).val() != wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+index+"/key")) {
	            			return true;
        			}
            	}
            }
            return false;
        }
        function wifi_autoOff_changed(){
        	var curAutoOffEnable = $("#selAutoOffWifiSwitch5G").val();
            var curTimeout = $("#selAutoOffWifiTimeout5G").val();
            if(curAutoOffEnable != gAutoOffEnable5G) {
            	return true;
            }
            if(curTimeout != gAutoOffTimeout5G){
            	return true;
            }
            return false;
        }
        function ModifyWifiConfig(type,index) {
            var retXml;
            var curWifiConfigMap = new Map();
            curWifiConfigMap.put("RGW/wireless/wifi_device", gCurrentAPItem5G);
		    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/switch", "on");
		    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/net_mode", $("#sel5G80211Protocol").val());
	    	channel = $("#selWifi5GChannel5G").val();
		    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/channel",channel);
		    
        	var bandwidth = "";
		    if(channel == "165"){
		    	bandwidth = "HT20";
		    }else{
		    	bandwidth = $("#sel80211nBandWidth5G").val();
		    }
	    	curWifiConfigMap.put("RGW/wireless/wifi_if_5G/bandwidth",bandwidth);
		    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/multi_ssid",1);
		    
		    if(type){
                    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/disabled",$("#selCurrentSSIDStatus5G_"+index).val());
		    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/hidden",$("#selHideSSID5G_"+index).val());
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_5G/isolate",$("#selApIsolateSwitch5G_"+index).val());
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_5G/ssid",$("#txtWifiSSID5G_"+index).val());
		    	
		    	curWifiConfigMap.put("RGW/wireless/wifi_if_5G/encryption",GetEncryptionTag(index));
		    
			    curWifiConfigMap.put("RGW/wireless/wifi_if_5G/ssid_index",index);
			    if("WEP" == $("#selWifiAuthType5G_"+index).val()) {
            		curWifiConfigMap.put("RGW/wireless/wifi_if_5G/key",1);
            		curWifiConfigMap.put("RGW/wireless/wifi_if_5G/key1",$("#txtPasswd5G_"+index).val());
            	} else if("none" != $("#selWifiAuthType5G_"+index).val()){
            		if($("#selWifiAuthType5G_"+index).val() == "Mixed" || $("#selWifiAuthType5G_"+index).val() == "WPA-PSK"){
            			curWifiConfigMap.put("RGW/wireless/wifi_if_5G/wpa_group_rekey",$("#txtWpaGroupKeyUpdateInterval5G_"+index).val());
			}
			curWifiConfigMap.put("RGW/wireless/wifi_if_5G/key",$("#txtPasswd5G_"+index).val());
            	}
		
		    }
            retXml = PostXmlNoShowWaitBox("wireless","wifi_set_5g",curWifiConfigMap);
            
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
        	$("#selEncryAlg_For_WEP5G_"+index).hide();
        	$("#selEncryAlg_For_WPA_PSK5G_"+index).hide();
            if(strAuthType=="WEP"){
            	$("#selEncryAlg_For_WEP5G_"+index).show();
            }else{
            	$("#selEncryAlg_For_WPA_PSK5G_"+index).show();
            }
        }

        function RefreshWifiRFSwitch() {
        	var c5GAPSwitch = wifiDetailedInfoMap5G.get("RGW/wireless/AP" + gCurrentAPItem5G+"/wifi_if_5G/switch");
            if(("off" == c5GAPSwitch || undefined == c5GAPSwitch)) {
                $("#selWifiEnabledSwitch5G").val(0);
                $("#divDisabledWifi5G,.publicInformation2").hide();
            } else {
                $("#selWifiEnabledSwitch5G").val(1);
                $("#divDisabledWifi5G,.publicInformation2").show();
                $("#selRfBand5G").val("5GHz");
            }
        }

		function RefreshssidInfo(){
            var nssid_24G = wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid_num");
            for(var i=0;i<nssid_24G;i++){
								$("#selCurrentSSIDStatus5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/disabled"));
								var ssidStatus = wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/hidden");
								$("#selHideSSID5G_"+i).val(ssidStatus);
                $("#selApIsolateSwitch5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/isolate"));
                $("#txtWifiSSID5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/ssid"));
                $("#txtWpaGroupKeyUpdateInterval5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/wpa_group_rekey"));

                var encryptionMap = ParseEncryption(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/encryption"));
                UpdateWifiEncryAlg(encryptionMap.get("authType"),i);
                var anthType = encryptionMap.get("authType");
	        $("#selWifiAuthType5G_"+i).val(anthType);
                if(anthType == "WEP"){
                	  $("#txtPasswd5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/key1"));
	                	  $("#selEncryAlg_For_WEP5G_"+i).val(encryptionMap.get("ciphers"));
                }else{
		                  $("#selEncryAlg_For_WPA_PSK5G_"+i).val(encryptionMap.get("ciphers"));
                	  $("#txtPasswd5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/key"));
                }
                $("#divWpsCfgDlg5G_"+i).show();
                if("WEP" == anthType) {
                    $("#divwepKeyFormat5G_"+i).show();
                    $("#selWepKeyFormat5G_"+i).val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/ssid"+i+"/key1").length);
                    $("#divEncryAlg5G_"+i).show();
                    $("#divPassWd5G_"+i).show();
                    $("#divWpsCfgDlg5G_"+i).hide();
                }else if("none" == anthType){
                	$("#divEncryAlg5G_"+i).hide();
	                $("#divPassWd5G_"+i).hide();
	                $("#divwepKeyFormat5G_"+i).hide();
                }else{
                	 $("#divEncryAlg5G_"+i).show();
	                 $("#divPassWd5G_"+i).show();
	                 $("#divwepKeyFormat5G_"+i).hide();
                }
            
	            if("Mixed" == $("#selWifiAuthType5G_"+i).val() || "WPA-PSK" == $("#selWifiAuthType5G_"+i).val()) {
	                $("#divWpaGroupKey5G_"+i).show();
	            } else {
	                $("#divWpaGroupKey5G_"+i).hide();
	            }
			}
		}

        function RefreshFreqBandData() {
            $("#div5G80211Protocol5G").hide();
            $("#divwepKeyFormat5G").hide();
            $("#div80211nBandWidth5G_channel_165").hide();
            $("#div80211nBandWidth5G").hide();
	    	
            $("#div5G80211Protocol").show();
            $("#sel5G80211Protocol").val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/net_mode"));
            var channel = wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/channel");
            
        	if(channel == "165"){
        		$("#div80211nBandWidth5G_channel_165").show();
        		$("#sel80211nBandWidth5G_channel_165").val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/bandwidth"));
        	}else{
        		$("#div80211nBandWidth5G").show();
        		$("#sel80211nBandWidth5G").val(wifiDetailedInfoMap5G.get("RGW/wireless/AP"+gCurrentAPItem5G+"/wifi_if_5G/bandwidth"));
        	}
            $("#selWifi5GChannel5G").val(channel);
			RefreshssidInfo();
        }

        function GetWifiDetailedInfo() {
            wifiDetailedInfoMap5G.clear();
			$("#selWifiAPList5G").empty();
			var idx =0; 
			var connNum = PostXml("wireless","wifi_get_client_num_setting");
			gConnNum5G = $(connNum).find("AP1").find("client_num").text();
			$("#wifi_conn_num5G").val(gConnNum5G);
			var retXml = PostXml("wireless","wifi_get_detail");
            
			$(retXml).find("AP"+gCurrentAPItem5G).find("wifi_if_5G").each(function(){
				packageWifiDetailedInfo(this,"wifi_if_5G");
			}); 
        }
        
        function packageWifiDetailedInfo(AP0XML,type){
        	showSSIDs5G = [];
        	shownSSIDIndexs5G = [];
        	wifiDetailedInfoMap5G.put("RGW/wireless/AP"+gCurrentAPItem5G+"/"+type+"/ssid_num",$(AP0XML).find("n_ssid").text());
			wifiDetailedInfoMap5G.put("RGW/wireless/AP"+gCurrentAPItem5G+"/"+type+"/switch",$(AP0XML).find("switch").text());
			wifiDetailedInfoMap5G.put("RGW/wireless/AP"+gCurrentAPItem5G+"/"+type+"/net_mode",$(AP0XML).find("net_mode").text());
			wifiDetailedInfoMap5G.put("RGW/wireless/AP"+gCurrentAPItem5G+"/"+type+"/country",$(AP0XML).find("country").text());
			wifiDetailedInfoMap5G.put("RGW/wireless/AP"+gCurrentAPItem5G+"/"+type+"/channel",$(AP0XML).find("channel").text());
			wifiDetailedInfoMap5G.put("RGW/wireless/AP"+gCurrentAPItem5G+"/"+type+"/bandwidth",$(AP0XML).find("bandwidth").text());
			if("on" == $(AP0XML).find("switch").text()) {
                $("#ssids_detail5G,.publicInformation2,#divDisabledWifi5G").show();
            } else {
                $("#ssids_detail5G,.publicInformation2,#divDisabledWifi5G").hide();
            }
			var j=0;
			var ssidNum = $(AP0XML).find("n_ssid").text();
			
			for(;j<ssidNum;j++){
				$(AP0XML).find("ssid"+j).each(function(){
					var ssidDisabled = $(this).find("disabled").text();
					if(ssidDisabled == "0"){
						$(".ssid_"+j).show();
						shownSSIDIndexs5G.push(j);
					}else{
						$(".ssid_"+j).hide();
						showSSIDs5G.push(j);
					}
					wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/disabled",$(this).find("disabled").text());
					wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/hidden",$(this).find("hidden").text());
					wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/isolate",$(this).find("isolate").text());
					wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/ssid",$(this).find("ssid").text());
					wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/encryption",$(this).find("encryption").text());
					wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/wpa_group_rekey",$(this).find("wpa_group_rekey").text());
					//In WEP mode, this can be an integer specifying which key index to use (key1, key2, key3, or key4.)
					if("wep-open" == $(this).find("encryption").text() || "wep" == $(this).find("encryption").text()) {
						var WepKeyTag = "key" + $(this).find("key").text();
						wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/key",$(this).find("key").text());
						wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/key1",$(this).find(WepKeyTag).text());
					} else {
						wifiDetailedInfoMap5G.put("RGW/wireless/AP"+ gCurrentAPItem5G +"/"+type+"/ssid"+ j +"/key",$(this).find("key").text());
					}
				});
			}
			if(showSSIDs5G.length==0){
				$("#lt_btnAddSSID5G").attr("disabled","disabled");
			}else{
				$("#lt_btnAddSSID5G").removeAttr("disabled");
			}
		}

        //由认证类型和加密方式获取 encryption tag
        function GetEncryptionTag(index) {
        	var authType = $("#selWifiAuthType5G_"+index).val();
	    	var ciphers = "";
	    	if(authType == "WEP"){
	    		ciphers = $("#selEncryAlg_For_WEP5G_"+index).val();
	    		if(!ciphers){
	    			ciphers = "Shared-key";
	    			$("#selEncryAlg_For_WEP5G_"+index).val(ciphers);
	    		}
	    	}else{
	    		ciphers = $("#selEncryAlg_For_WPA_PSK5G_"+index).val();
	    		if(!ciphers){
	    			ciphers = "TKIP/AES-CCMP";
	    			$("#selEncryAlg_For_WPA_PSK5G_"+index).val(ciphers);
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
        	if($("#selWifiAuthType5G_"+index).val() == "none"){
        		return;
        	}
        	var encryType = GetEncryptionTag(index);
        	paramMap.put("RGW/wireless/wifi_device",gCurrentAPItem5G);
    		paramMap.put("RGW/wireless/wifi_if_5G/encryption",encryType);
    		paramMap.put("RGW/wireless/wifi_if_5G/ssid_index",index);
        	var retXml = PostXml("wireless","wifi_get_key",paramMap);
			if($("#selWifiAuthType5G_"+index).val()=="WEP"){
				var pwd = $(retXml).find("AP1").find("wifi_if_5G").find("key1").text();
				$("#txtPasswd5G_"+index).val(pwd);
				$("#selWepKeyFormat5G_"+index).val(pwd.length);
			}else{
				$("#txtPasswd5G_"+index).val($(retXml).find("AP1").find("wifi_if_5G").find("key").text());
				$("#txtWpaGroupKeyUpdateInterval5G_"+index).val($(retXml).find("AP1").find("wifi_if_5G").find("wpa_group_rekey").text());
			}
        }
        return this;
    }
})(jQuery);

function changeAuthType5G(ssidVal,index){
	$(ssidVal).objWifiSet5G().changeAuthTypeSSID(ssidVal,index);
}

function hideSSID5G(hideSSID,index){
	if($(hideSSID).val() == "1"){
		$("#divWpsCfgDlg_"+index).hide();
	}else if($("#selCurrentSSIDStatus_"+index).val() =="1" || $("#selWifiAuthType_"+index).val() == "WEP"){
		$("#divWpsCfgDlg_"+index).hide();
	}else{
		$("#divWpsCfgDlg_"+index).show();
	}
}
function addNewSSID5G(btn){
	$(".ssid_"+showSSIDs5G[0]).show();
	$("#divWpsCfgDlg5G_"+showSSIDs5G[0]).hide();
	showSSIDs5G.splice(0,1);
	if(showSSIDs5G.length == 0){
		$(btn).attr("disabled","disabled");
	}
}
function hideOrShowWPSBtn5G(disableSSID,index){
	if($(disableSSID).val() == "1"|| $("#selWifiAuthType5G_"+index).val() == "WEP"){//close
		$("#divWpsCfgDlg5G_"+index).hide();
	}else{
		$("#divWpsCfgDlg5G_"+index).show();
	}
	if($(disableSSID).val() == "1"){
		if(shownSSIDIndexs5G.indexOf(index) != -1){
			shownSSIDIndexs5G.splice(shownSSIDIndexs5G.indexOf(index),1);
		}
	}else{
		if(shownSSIDIndexs5G.indexOf(index) == -1){
			shownSSIDIndexs5G.push(index);
		}
	}
}
function deleteThisSSID5G(ssidIndex){
	var delMap = new Map();
	delMap.put("RGW/wireless/wifi_if_5G/disabled","1");
	delMap.put("RGW/wireless/wifi_if_5G/multi_ssid",1);
	delMap.put("RGW/wireless/wifi_if_5G/ssid_index",ssidIndex);
	var delStatus;
	delStatus = PostXmlNoShowWaitBox("wireless","wifi_set_5g",delMap);
	if("OK" == $(delStatus).find("setting_response").text()){
		if(shownSSIDIndexs5G.indexOf(ssidIndex) != -1 || shownSSIDIndexs5G.indexOf(Number(ssidIndex)) != -1){
			shownSSIDIndexs5G.splice(shownSSIDIndexs5G.indexOf(ssidIndex),1);
		}
		showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_deleteSSID_success"));
		$(".ssid_"+ssidIndex).hide();
		showSSIDs5G.push(ssidIndex);
		$("#lt_btnAddSSID5G").removeAttr("disabled");
	}else{
		showMsgBox(jQuery.i18n.prop("dialog_message_wifi_settings_title"), jQuery.i18n.prop("dialog_message_deleteSSID_failed"));
	}
}

function saveSSID5G(ssidIndex){
	$("#lt_btnAddSSID5G").objWifiSet5G().SaveData("save",ssidIndex);
}
