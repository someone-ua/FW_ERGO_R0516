var g_roamingState;
(function($) {
    $.fn.objInternetConn = function(InIt) {
        var gProto;
        var gDialSwitch;
        var gNetworkMode;
        var gNetworkMode_;
        var gPerferMode;
        var gNetworkMode_band;
        //var gLtePerMode;
        var gAutoVersionSwithFlag;
        var gVersionSwitchFlag;
		var gEngModeFlag;
        var gRoamingStatu;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/internet/internet_connection.html");
                workModeCon();

                displayConfigViews();

                $("#SelInterConnMode").change(function() {
                    if("cellular" == $(this).val()) {
                        $("#divCellularConn").show();
                    } else {
                        $("#divCellularConn").hide();
                    }
                });

                $('input[name="roaming"]').click(function(){
                    $(this).attr('checked',true);
                    $(this).siblings('input').attr('checked',false);
                });

                $("#selWorkMode").change(function() {
                	if (internet_connection_Prefer_network == 0) {
                		HideNetPerferModeDiv();
                		return;
                	}
                    var netMode = $(this).val();
                    HideNetPerferModeDiv();
                    switch($(this).val()) {
                        case "1":
                            $("#div4G3G2GPrefer").show();
                            break;
                        case "3":
                            $("#div4G3GPrefer").show();
                            break;
                        case "4":
                            $("#div3G2GPrefer").show();
                            break;
                        default:
                        	HideNetPerferModeDiv();
                    }
                });
            } //end flag
            GetWanConfig();
            GetNetworkMode();
            GetVersionSwitch();
            GetAutoSwithInfo();
	    if(config_roam){
	    	$('#roamBox').show();
	    	GetRoamingStatu();
	    }else{
	    	$('#roamBox').hide();
	    }
        };
        function workModeCon() {
            var html = '';
            if(config_network == 'both'){
                html = "<option value='2'>"+jQuery.i18n.prop("lt_interCon_dropdown4Gonly")+"</option>"
                     + "<option value='3'>"+jQuery.i18n.prop("lt_interCon_dropdown43Gonly")+"</option>"
                     + "<option value='5'>"+jQuery.i18n.prop("lt_interCon_dropdown3Gonly")+"</option>"
                     + "<option value='band28'>LTE 700</option>"
                     + "<option value='band8'>LTE 900</option>"
                     + "<option value='band3'>LTE 1800</option>"
                     + "<option value='band7'>LTE 2600</option>";
                $('#selWorkMode').html(html);
            }else if(config_network == '4'){
                html = "<option value='2'>"+jQuery.i18n.prop("lt_interCon_dropdown4Gonly")+"</option>";
                $('#selWorkMode').html(html);
            }else if(config_network == '3'){
                html = "<option value='5'>"+jQuery.i18n.prop("lt_interCon_dropdown3Gonly")+"</option>";
                $('#selWorkMode').html(html);
            }
        };
        this.SaveData = function() {
        	ShowDlg("PleaseWait", 200, 130);
        	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            setTimeout(function(){
							var setWanFlag = SetWanConfig();
							var setNetoworkFlag = SetNetworkMode();
							var setVersionSwitchFlag = SetVersionSwitch();
							var setAutoSwitchFlag = SetAutoSwith();
							var setEngModeFlag = SetEngMode();
							var setRoamingStatu = false;
							if(config_roam){
								setRoamingStatu = SetRoaming();
							}
							CloseDlg();
							if (!setWanFlag && !setNetoworkFlag && !setVersionSwitchFlag && !setAutoSwitchFlag && !setEngModeFlag &&!setRoamingStatu) {
							} else {
									showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_internet_connection_title"), jQuery.i18n.prop("dialog_message_internet_connection_set_success"));
							}
						},100)
        }
	function SetRoaming(){
            if($('input[name="roaming"][checked]').val() == gRoamingStatu){
                return false;
            }else{
                var roamMap = new Map();
                roamMap.put('RGW/cm/switch',$('input[name="roaming"][checked]').val());
                PostXmlNoShowWaitBox("cm","set_roaming_switch",roamMap);
                GetRoamingStatu();
                return true;
            }
        }
        function GetRoamingStatu(){
            var retXml = PostXml("cm","get_roaming_switch");
            gRoamingStatu = $(retXml).find("switch").text();
            $('input[name="roaming"][value='+gRoamingStatu+']').attr('checked',true);
        }
        function displayConfigViews () {
        	if (internet_connection_AutoVersionSwitch == 0) {
        		 $("#divAutoVersionSwitch").hide();
        	} else {
        		 $("#divAutoVersionSwitch").show();
        	}
        	
        	if (internet_connection_VersionSwitch == 0) {
        		$("#divVersionSwitch").hide();
        	} else {
        		$("#divVersionSwitch").show();
        	}
        	
        	if (internet_connection_NetworkMode == 0) {//for 4G
        		$("#divNetworkMode").hide();
        	} else {
        		$("#divNetworkMode").show();
        	}
        	
        	if (internet_connection_engmode == 0) {
        		$("#divEngmode").hide();
        	} else {
        		$("#divEngmode").show();
        	}
        	
        	if (internet_connection_Prefer_network == 0) {
        		HideNetPerferModeDiv();
        	}
        }

        function GetAutoSwithInfo() {
        	if (internet_connection_AutoVersionSwitch == 0) {
        		return;
        	}
            var retXml = PostXml("cm","get_auto_switch");
            gAutoVersionSwithFlag = $(retXml).find("enable").text();
            $("#SelAutoVersionSwitch").val(gAutoVersionSwithFlag);
        }

        function SetAutoSwith() {
        	if (internet_connection_AutoVersionSwitch == 0) {
        		return false;
        	}
            if("cellular" != $("#SelInterConnMode").val() || gAutoVersionSwithFlag == $("#SelAutoVersionSwitch").val()) {
                return false;
            }
			
            var mapConfig = new Map();
            mapConfig.put("RGW/wan/enable",$("#SelAutoVersionSwitch").val());
            PostXmlNoShowWaitBox("cm","set_auto_switch",mapConfig);
            GetAutoSwithInfo();
            return true;
        }

		function SetEngMode() {
            if("cellular" != $("#SelInterConnMode").val() ||
               gEngModeFlag == $("#SelEngModeSwitch").val()) {
                return false;
            }
			
            var mapConfig = new Map();
            mapConfig.put("RGW/wan/mode",$("#SelEngModeSwitch").val());
            PostXmlNoShowWaitBox("cm","set_eng_mode",mapConfig);
            GetWanConfig();
            return true;
        }

        function SetWanConfig() {
            if( gDialSwitch == $("#SelInterConnMode").val()) {
                return false;
            }
            var configMap = new Map();
            configMap.put("RGW/wan/connect_switch/proto",gProto);
            configMap.put("RGW/wan/connect_switch/dial_switch",$("#SelInterConnMode").val());

            var retXml = PostXmlNoShowWaitBox("cm","connection_switch",configMap);
            if("OK" != $(retXml).find("response_status").text()) {
            	showMsgBox(jQuery.i18n.prop("dialog_message_internet_connection_title"), jQuery.i18n.prop("dialog_message_internet_connection_switch_fail"));
                return false;
            }
            GetWanConfig();
            return true;
        }

        function GetNetworkMode() {
        	if (internet_connection_Prefer_network == 0) {
        		HideNetPerferModeDiv();
        		return;
        	}
        	
            var retXml = PostXml("util_wan","get_network_mode");
            gNetworkMode = $(retXml).find("nw_mode").text();
            gPerferMode = $(retXml).find("prefer_mode").text();
            gNetworkMode_band = $(retXml).find("band").text();
            if(gNetworkMode == '2'){
                if(gNetworkMode_band == '0'){
                    gNetworkMode_ = gNetworkMode;
                }else if(gNetworkMode_band == '3'){
                    gNetworkMode_ = 'band3';
                }else if(gNetworkMode_band == '7'){
                    gNetworkMode_ = 'band7';
                }else if(gNetworkMode_band == '8'){
                    gNetworkMode_ = 'band8';
                }else if(gNetworkMode_band == '28'){
                    gNetworkMode_ = 'band28';
                }
            }else{
                gNetworkMode_ = gNetworkMode;
            }

            $("#selWorkMode").val(gNetworkMode_);
            switch(gNetworkMode) {
                case "1":
                    $("#div4G3G2GPrefer").show();
                    $("#sel4G3G2GPreferMode").val(gPerferMode);
                    break;
                case "3":
                    if (4 != gPerferMode) {
                        gPerferMode = 3;
                    }
                    $("#div4G3GPrefer").show();
                    $("#sel4G3GPreferMode").val(gPerferMode);
                    break;
                case "4":
                    if (5 != gPerferMode) {
                        gPerferMode = 6;
                    }
                    $("#div3G2GPrefer").show();
                    $("#sel3G2GPreferMode").val(gPerferMode);
                    break;
            }
        }

        function SetNetworkMode() {
            if("cellular" != $("#SelInterConnMode").val()) {
                return false;
            }
            if (internet_connection_Prefer_network == 0) {
        		return false;
        	}
            var NetworkMode = $("#selWorkMode").val();
            var preferMode; 
            switch(NetworkMode) {
                case "1":
                    preferMode = $("#sel4G3G2GPreferMode").val();
                    break;
                case "3":
                    preferMode = $("#sel4G3GPreferMode").val();
                    break;
                case "4":
                    preferMode = $("#sel3G2GPreferMode").val();
                    break;
            }
            var configMap = new Map();
            var networkChange = false;
            if(gNetworkMode_ != NetworkMode) {
            	networkChange = true;
            }
            if(gPerferMode != preferMode && preferMode != undefined) {
            	networkChange = true;
            }

            if(!networkChange) {
                return false;
            } else {
                if(NetworkMode == "2"){
                    configMap.put("RGW/wan/nw_mode",2);
                    configMap.put("RGW/wan/band",0);
                }else if(NetworkMode == "band3"){
                    configMap.put("RGW/wan/nw_mode",2);
                    configMap.put("RGW/wan/band",3);
                }else if(NetworkMode == "band7"){
                    configMap.put("RGW/wan/nw_mode",2);
                    configMap.put("RGW/wan/band",7);
                }else if(NetworkMode == "band8"){
                    configMap.put("RGW/wan/nw_mode",2);
                    configMap.put("RGW/wan/band",8);
                }else if(NetworkMode == "band28"){
                    configMap.put("RGW/wan/nw_mode",2);
                    configMap.put("RGW/wan/band",28);
                }else{
                    configMap.put("RGW/wan/nw_mode",NetworkMode);
                }
            	configMap.put("RGW/wan/prefer_mode",preferMode);
            }

            var retXml = PostXmlNoShowWaitBox("util_wan","set_network_mode",configMap);
            if("ERROR" == $(retXml).find("setting_response").text()) {
            	showMsgBox("Set Network Mode failed.");
            	return false;
            } else {
                GetNetworkMode();
            }
            return true;
        }

        function GetWanConfig() {
            var retXml = PostXml("cm","get_wan_configs",new Map());
            gProto = $(retXml).find("proto").text();
            gDialSwitch = $(retXml).find("dial_switch").text();
            
            gEngModeFlag = $(retXml).find("eng_mode").text();
            if ("" == gEngModeFlag || undefined == gEngModeFlag) {
            	$("#SelEngModeSwitch").val(0);
            } else {
            	$("#SelEngModeSwitch").val(gEngModeFlag);
            }

            $("#SelInterConnMode").val(gDialSwitch);
            if("cellular" == gDialSwitch) {
                $("#divCellularConn").show();
            } else {
                $("#divCellularConn").hide();
            }
        }

        function GetVersionSwitch() {
        	if (internet_connection_VersionSwitch == 0) {
        		return;
        	}
            var retXml = PostXml("cm","cm_get_image_type");
            gVersionSwitchFlag = $(retXml).find("Image_type").text();
            $("#SelVersionSwitch").val(gVersionSwitchFlag);
        }

        function SetVersionSwitch() {
        	if (internet_connection_VersionSwitch == 0) {
        		return false;
        	}
        	
            if("cellular" != $("#SelInterConnMode").val() ||
               gVersionSwitchFlag == $("#SelVersionSwitch").val())
                return false;

            var mapConfig = new Map();
            mapConfig.put("RGW/wan/Image_type",$("#SelVersionSwitch").val());
            PostXmlNoShowWaitBox("cm","cm_set_image_type",mapConfig);
            GetVersionSwitch();
            return true;
        }

        function HideNetPerferModeDiv() {
            $("#div4G3G2GPrefer").hide();
            $("#div3G2GPrefer").hide();
            $("#div4G3GPrefer").hide();
        }

        return this;
    }
})(jQuery);

