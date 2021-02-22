(function($) {
    $.fn.objProfileManagement = function(InIt) {
        var gProfileArr;
        /*define array subscript index*/
        var gProfileNameEnumIdx = 0;
        var gPdpTypeEnumIdx = 1;
        var gConnNumEnumIdx = 2;
        var gTypeEnumIdx = 3;
        var gAutoApnEnumIdx = 4;
        var gConnModeEnumIdx = 5;
        var gLteDefaultEnumIdx = 6;
        var gDataOnRoamEnumIdx = 7;
        var gPdpNameEnumIdx = 8;
        var gEnabledEnumIdx = 9;
        var gIpTypeEnumIdx = 10;
        var gApnEnumIdx = 11;
        var gLteApnEnumIdx = 12;
        var gUser23gEnumIdx = 13;
        var gPsswd23gEnumIdx = 14;
        var gAuthType23gEnumIdx = 15;
        var gUser4gEnumIdx = 16;
        var gPsswd4gEnumIdx = 17;
        var gAuthType4gEnumIdx = 18;
        var gMtuEnumIdx = 19;
		var gModifiable = 20;
		var gShowProfileNameIdx = 21;
        var lastestProfile = "";
	    var pdpInfoChanged = false;
	    var SelIpTypeChanged = false;
	    var profileNameChange = false;
		var lastPdp = {};
		var g_simStatus = '';
		var g_default_APNList = {'default':'Auto','Kyivstar_Prepaid':'Kyivstar Prepaid','Kyivstar_Contract':'Kyivstar Contract','Kyivstar_3G':'Kyivstar 3G','Vodafon_3G':'Vodafon 3G','Utel_Ukraine':'Utel Ukraine','LifeCell_3G_4G':'LifeCell 3G/4G'};
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/internet/profileManagement.html");

                $("#txtAPNname,#txt2G3GUser,#txt2G3GPassword").keyup(function(){
        	    	if($("#txtAPNname").val() != lastPdp.apnName || $("#txt2G3GUser").val() != lastPdp.user || $("#txt2G3GPassword").val() != lastPdp.pwd){
        	    		pdpInfoChanged = true;
        	    	}else{
        	    		pdpInfoChanged = false;
        	    	}
        	    	if(SelIpTypeChanged || pdpInfoChanged || profileNameChange){
            	    	$("#lt_btnApply").prop("disabled",false);
            	    }else{
            	    	$("#lt_btnApply").prop("disabled",true);
            	    }
        	    	$("#lPdpSetError").text("");
        	    });
        	    
                $("#selPdpProfileName").change(function() {
                	$("#lPdpSetError").text("");
                    if($(this).val() != lastPdp.profile){
                    	profileNameChange = true;
        	    	}else{
        	    		profileNameChange = false;
        	    	}
        	    	if(SelIpTypeChanged || pdpInfoChanged || profileNameChange){
            	    	$("#lt_btnApply").prop("disabled",false);
            	    }else{
            	    	$("#lt_btnApply").prop("disabled",true);
                    }
                    initPdpListData($(this).val());
                });

                $("#SelIpType").change(function(){
                	$("#lPdpSetError").text("");
        	    	if($(this).val() != lastPdp.ipType){
        	    		SelIpTypeChanged = true;
        	    	}else{
        	    		SelIpTypeChanged = false;
        	    	}
        	    	if(SelIpTypeChanged || pdpInfoChanged || profileNameChange){
            	    	$("#lt_btnApply").prop("disabled",false);
            	    }else{
            	    	$("#lt_btnApply").prop("disabled",true);
            	    }
        	    });
                $("#txtPdpProfileName_popup,#txtAPNname_popup,#txt2G3GUser_popup,#txt2G3GPassword_popup").keyup(function(){
                	$("#lPdpSetError_popup").text("");
                });
                $("#lt_new_profile").click(function(){
                	AddPdp();
                })
                $("#lt_del_profile").click(function(){
                	DelPdp($("#selPdpProfileName").val());
                })
                $("#lt_btnApply").click(function(){
                	ModifyPdp($("#selPdpProfileName").val());
                })
			} //end flag
			g_simStatus = checkSimStatus();
            GetWanConfig("init");
			initAddPdpBtn();
        }
        
        function initAddPdpBtn(){
        	var retXml = PostXml("cm","get_multi_apn_profile_ability");
        	var support = $(retXml).find("support").text();
        	if(support == "0"){
        		$("#lt_new_profile").hide();
        	}else{
        		$("#lt_new_profile").show();
        	}
        }
        
        function GetWanConfig(type) {
        	$("#lPdpSetError_popup").text("");
        	$("#lPdpSetError").text("");
        	pdpInfoChanged = false;
    	    SelIpTypeChanged = false;
    	    profileNameChange = false;
            var retXml = PostXml("cm","get_wan_configs",new Map());
            
            var activeProfile = $(retXml).find("actived_profile").text();
            lastestProfile = activeProfile;
            var profile_names = $(retXml).find("profile_names").text();

            if("," == profile_names.substr(profile_names.length-1,1)) {
                profile_names = profile_names.substr(0,profile_names.length-1)
            }
            var profileNameArr = profile_names.split(",");

            gProfileArr = new Array();
			var showProfileArr = [];
            for(var profileIdx = 0; profileIdx < profileNameArr.length; ++ profileIdx) {
                gProfileArr[profileIdx] = new Array();
				var pdpIdx = 0;
				var profieName = profileNameArr[profileIdx];
                $(retXml).find(profieName).each(function() {
                    $(this).find("Item").each(function() {
                        var ptype = $(this).children()[0].nodeName;
                        gProfileArr[profileIdx][pdpIdx] = new Array();
						gProfileArr[profileIdx][pdpIdx][gProfileNameEnumIdx] = profieName;
						var profie = {};
						var showProfieName = g_default_APNList[profieName];
						if(!showProfieName){
							profie.showProfieName = profieName;
							gProfileArr[profileIdx][pdpIdx][gShowProfileNameIdx] = profieName;
						}else{
							profie.showProfieName = showProfieName;
							gProfileArr[profileIdx][pdpIdx][gShowProfileNameIdx] = showProfieName;
						}
						profie.profieName = profieName;
						showProfileArr.push(profie);
                        gProfileArr[profileIdx][pdpIdx][gPdpTypeEnumIdx] = ptype;
                        gProfileArr[profileIdx][pdpIdx][gConnNumEnumIdx] = $(this).find("connection_num").text();
                        gProfileArr[profileIdx][pdpIdx][gTypeEnumIdx] = $(this).find("type").text();
                        gProfileArr[profileIdx][pdpIdx][gAutoApnEnumIdx] = $(this).find("auto_apn").text();
                        gProfileArr[profileIdx][pdpIdx][gConnModeEnumIdx] = $(this).find("connect_mode").text();
                        gProfileArr[profileIdx][pdpIdx][gLteDefaultEnumIdx] = $(this).find("lte_default").text();
                        gProfileArr[profileIdx][pdpIdx][gDataOnRoamEnumIdx] = $(this).find("data_on_roaming").text();
                        gProfileArr[profileIdx][pdpIdx][gPdpNameEnumIdx] = $(this).find("pdp_name").text();
                        gProfileArr[profileIdx][pdpIdx][gEnabledEnumIdx] = $(this).find("enable").text();
                        gProfileArr[profileIdx][pdpIdx][gIpTypeEnumIdx] = $(this).find("ip_type").text();
                        gProfileArr[profileIdx][pdpIdx][gApnEnumIdx] = $(this).find("apn").text();
                        gProfileArr[profileIdx][pdpIdx][gLteApnEnumIdx] = $(this).find("lte_apn").text();
                        gProfileArr[profileIdx][pdpIdx][gUser23gEnumIdx] = $(this).find("usr_2g3g").text();
                        gProfileArr[profileIdx][pdpIdx][gPsswd23gEnumIdx] = $(this).find("pswd_2g3g").text();
                        gProfileArr[profileIdx][pdpIdx][gAuthType23gEnumIdx] = $(this).find("authtype_2g3g").text();
                        gProfileArr[profileIdx][pdpIdx][gUser4gEnumIdx] = $(this).find("usr_4g").text();
                        gProfileArr[profileIdx][pdpIdx][gPsswd4gEnumIdx] = $(this).find("pswd_4g").text();
                        gProfileArr[profileIdx][pdpIdx][gAuthType4gEnumIdx] = $(this).find("authtype_4g").text();
                        gProfileArr[profileIdx][pdpIdx][gMtuEnumIdx] = $(this).find("mtu").text()=="0"?"1000":$(this).find("mtu").text();
                        gProfileArr[profileIdx][pdpIdx][gModifiable] = $(this).find("modifiable").text();
                        ++pdpIdx;
                    });
                });
            }

            $("#selPdpProfileName").empty();
            for(var profileIdx = 0; profileIdx < showProfileArr.length; ++profileIdx) {
            	if(showProfileArr[profileIdx]){
	                var optHtml = "<option value=" + showProfileArr[profileIdx]['profieName'] + ">" + showProfileArr[profileIdx]['showProfieName'] + "</option>";
	                $("#selPdpProfileName").append(optHtml);
            	}
            }
            $("#selPdpProfileName").val(activeProfile);
            initPdpListData(activeProfile,type);
        }
        
        function initPdpListData(activeProfile,type){
        	var pdpArr = GetSelectedPdpInfo(activeProfile);
            if("0" == pdpArr[gModifiable]) {
                $("#lt_del_profile").prop("disabled",true);
                DisableEnablePDPParam("1");
            } else {
                $("#lt_del_profile").prop("disabled",false);
                DisableEnablePDPParam("0");
            }
        	if(pdpArr && pdpArr.length>0){
        		$("#txtAPNname").val(pdpArr[gApnEnumIdx]);
        		$("#txt2G3GUser").val(pdpArr[gUser23gEnumIdx]);
        		if(pdpArr[gPsswd23gEnumIdx] != ""){
        			$("#txt2G3GPassword").attr("type","password");
        		}
        		$("#txt2G3GPassword").val(pdpArr[gPsswd23gEnumIdx]);
        		$("#SelIpType").val(pdpArr[gIpTypeEnumIdx]);
        		if(type=="init"){
        			$("#lt_btnApply").prop("disabled",true);
        			lastPdp.profile = activeProfile;
        			lastPdp.apnName = pdpArr[gApnEnumIdx];
        			lastPdp.user = pdpArr[gUser23gEnumIdx];
        			lastPdp.pwd = pdpArr[gPsswd23gEnumIdx];
        			lastPdp.ipType = pdpArr[gIpTypeEnumIdx];
        		}
        	}
        }
        
        function ModifyPdp(profileName) {
        	if(!g_simStatus){
        		showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("pleaseCheckSIMStatus"));
        		return false;
        	}
			if(g_default_APNList[profileName]){
				ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
				setTimeout(function(){
					var configMap = new Map();
					configMap.put("RGW/wan/profile/profile_name",profileName);
					configMap.put("RGW/wan/profile/action", 3);
	
					var retXml = PostXml("cm","configs_handler",configMap);
					GetWanConfig("init");
					if("OK" == $(retXml).find("response_status").text()) {
						showMsgBoxAutoClose(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_switch_pdp_profile_success"));
					} else {
						showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_pdp_fail"));
					}
					return;
				},500)
			}else{
				var updateArr = {};
				updateArr.profileName = profileName;
				updateArr.pswd_2g3g = $("#txt2G3GPassword").val();
				updateArr.usr_2g3g = $("#txt2G3GUser").val();
				updateArr.apn = $("#txtAPNname").val();
				updateArr.ip_type = $("#SelIpType").val();
				updateArr.isNew = false;
				
				var pdpInfoSaveResult;
				if(promag_validInput(updateArr) == false){
					return;
				}
				ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
				setTimeout(function(){
					pdpInfoSaveResult = savePDPInfor(updateArr);
					if(!pdpInfoSaveResult){
						showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_pdp_fail"));
					}else{
						GetWanConfig("init");
						showMsgBoxAutoClose(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_change_pdp_success"));
					}
				},500);
			}	
        }
        function checkSimStatus(){
        	var retXml = PostXml("sim","get_sim_status");
        	var simStatus = $(retXml).find("sim_status").text();
        	if(simStatus != "1"){
        		return false;
        	}
        	return true;
        }

        function AddPdp() {
        	if(!g_simStatus){
        		showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("pleaseCheckSIMStatus"));
        		return false;
        	}
        	var existPDPCounts = $("#selPdpProfileName option").length;
        	if(existPDPCounts == 10){
        		showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("pdp_not_more_than_10"));
        		return;
        	}
			if(g_bodyWidth>430){
				ShowDlg("divPDPSetting",400,430);
			}else{
				ShowDlg("divPDPSetting",'95%',500);
			}
			$("#txtPdpProfileName_popup,#txtAPNname_popup,#txt2G3GUser_popup,#txt2G3GPassword_popup").focus(function(){
				$("#lPdpSetError_popup").text("");
			});
        	
            $("#lt_btnSave").click(function() {
            	var profileNameSaveResult;

            	var valideProName = validateProfileName();
                if(valideProName == "exist") {
                    var strMsg=jQuery.i18n.prop("lt_interCon_pdp_add_existed1")  + " \"" + $("#txtPdpProfileName_popup").val() 
				                    + "\" " + jQuery.i18n.prop("lt_interCon_pdp_add_existed2");
                    showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), strMsg);
                    return;
                }
                
                var newPdpInfo = {
                		"profile_name": $("#txtPdpProfileName_popup").val(),
                		"pswd_2g3g":	$("#txt2G3GPassword_popup").val(),
                		"usr_2g3g":		$("#txt2G3GUser_popup").val(),
                		"apn":			$("#txtAPNname_popup").val(),
                		"ip_type":		$("#SelIpType_popup").val(),
                		"isNew":true
                }
                if(promag_validInput(newPdpInfo) == false){
            		return;
            	}
                
        		profileNameSaveResult = saveProfileName();
            	if(profileNameSaveResult == false){
            		showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_pdp_fail"));
            		return;
            	}
            	
                var configMap = new Map();

                configMap.put("RGW/wan/profile/profile_name",newPdpInfo.profile_name);
                configMap.put("RGW/wan/pdp_info/pswd_2g3g",newPdpInfo.pswd_2g3g);
                configMap.put("RGW/wan/pdp_info/usr_2g3g",newPdpInfo.usr_2g3g);
                configMap.put("RGW/wan/pdp_info/apn",newPdpInfo.apn);
                configMap.put("RGW/wan/pdp_info/ip_type", newPdpInfo.ip_type);
                configMap.put("RGW/wan/profile/action",4);

                CloseDlg();
                ShowDlg("PleaseWait", 200, 130);
        		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
        		setTimeout(function(){
	                var retXml = PostXml("cm","configs_handler",configMap);
	                if("OK" == $(retXml).find("response_status").text()) {
	                	GetWanConfig("init");
	                    showMsgBoxAutoClose(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_add_pdp_success"));
	                } else {
	                	showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_pdp_fail"));
	                }
        		},500);
            });
        }

        function GetSelectedPdpInfo(pdpType) {
            var pdpArr=[];
            var bFound = false;
            for(var profileIdx = 0; profileIdx < gProfileArr.length; ++profileIdx) {
                for(var pdpIdx = 0; pdpIdx < gProfileArr[profileIdx].length; ++pdpIdx) {
                    if($("#selPdpProfileName").val() == gProfileArr[profileIdx][pdpIdx][gProfileNameEnumIdx]) {
	                    pdpArr = gProfileArr[profileIdx][pdpIdx];
	                    bFound = true;
	                    break;
                    }
                }
                if(bFound) {
                    break;
                }
            }
            return pdpArr;
        }

		function DisableEnablePDPParam(disable_flag) {
			if (disable_flag == "1") {
				$("#txt2G3GUser").prop("disabled", true);
				$("#txt2G3GPassword").prop("disabled", true);
				$("#SelIpType").prop("disabled", true);
				$("#txtAPNname").prop("disabled", true);
				$("select:disabled").css("background-color","rgb(235, 235, 228)");
				$("input[type='text']:disabled").css("background-color","rgb(235, 235, 228)");
				$("input[type='password']:disabled").css("background-color","rgb(235, 235, 228)");
			} else {
				$("#txt2G3GUser").prop("disabled", false);
				$("#txt2G3GPassword").prop("disabled", false);
				$("#SelIpType").prop("disabled", false);
				$("#txtAPNname").prop("disabled", false);
				$("select").css("background-color","#fff");
				$("input[type='text']").css("background-color","#fff");
				$("input[type='password']").css("background-color","#fff");
			}
	    }
		
		function saveProfileName(){
			var configMap = new Map();
            configMap.put("RGW/wan/profile/profile_name",$("#txtPdpProfileName_popup").val());
            configMap.put("RGW/wan/profile/action", 1);

            var retXml = PostXmlNoShowWaitBox("cm","configs_handler",configMap);
            if("OK" == $(retXml).find("response_status").text()) {
                return true;
            } else {
                return false;
            }
		}
        function savePDPInfor(updateArr){
        	var configMap = new Map();
            configMap.put("RGW/wan/profile/profile_name",updateArr.profileName);
            configMap.put("RGW/wan/profile/action",6);
            configMap.put("RGW/wan/pdp_info/pswd_2g3g",updateArr.pswd_2g3g);
            configMap.put("RGW/wan/pdp_info/usr_2g3g",updateArr.usr_2g3g);
            configMap.put("RGW/wan/pdp_info/ip_type", updateArr.ip_type);
            configMap.put("RGW/wan/pdp_info/apn",updateArr.apn);
            
            var retXml = PostXml("cm","configs_handler",configMap);
            if("OK" == $(retXml).find("response_status").text()) {
            	return true;
            } else {
            	return false;
            }
        }
        
        function DelPdp(pdpType) {
        	if(!g_simStatus){
        		showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("pleaseCheckSIMStatus"));
        		return false;
        	}
            var pdpArr =GetSelectedPdpInfo(pdpType);
            
            if(g_bodyWidth<=360){
				ShowDlg("confirmDlg",300,150);
			}else{
				ShowDlg("confirmDlg",350,150);
			}
            var titleMsg = jQuery.i18n.prop("lt_interCon_delete_pdp_title");
            var strMsg = jQuery.i18n.prop("lt_interCon_delete_pdp_info") + " \"" + $("#selPdpProfileName").val() + "\"?";
            $("#lt_confirmDlg_title").text(titleMsg);
            $("#lt_confirmDlg_msg").text(strMsg);
            $("#lt_btnConfirmYes").click(function() {
            	CloseDlg();
            	ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            	setTimeout(function(){
            		var configMap = new Map();
            		configMap.put("RGW/wan/profile/profile_name",pdpArr[gProfileNameEnumIdx]);
            		configMap.put("RGW/wan/profile/action", 2);
            		configMap.put("RGW/wan/profile/connection_num", pdpArr[gConnNumEnumIdx]);
            		configMap.put("RGW/wan/profile/type", pdpType);
            		
            		var retXml = PostXml("cm","configs_handler",configMap);
            		if("OK" == $(retXml).find("response_status").text()) {
            			GetWanConfig("init");
            			showMsgBoxAutoClose(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_delete_pdp_success"));
            		} else {
            			showMsgBox(jQuery.i18n.prop("lt_profileManagement_title"), jQuery.i18n.prop("dialog_message_internet_connection_pdp_fail"));
            		}
            	},100);
            });
        }

        function promag_validInput(obj) {
            var flag = true;
            var msg = "";
            if(obj.isNew) {
                //Valid profile name
                flag = validateProfileName();
                if(!flag){
                	return flag;
                }
            } 
            //Valid Username
            if ('' != obj.usr_2g3g && false == checkInputChar(obj.usr_2g3g)) {
                flag = false;
                msg = jQuery.i18n.prop("lUsernameInvalidTip");
            }
            //Vaild user password
            if ('' != obj.pswd_2g3g && false == checkInputChar(obj.pswd_2g3g)) {
                flag = false;
                msg = jQuery.i18n.prop("lpwdInvalidTip");
            }
            //Valid apn name
            if (false == checkInputChar(obj.apn) || -1 < obj.apn.indexOf(" ") || obj.apn=="") {
                flag = false;
                msg = jQuery.i18n.prop("lApnNameInvalidTip");
            }
            if(obj.isNew){
            	$("#lPdpSetError_popup").show().text(msg);
            }else{
            	$("#lPdpSetError").show().text(msg);
            }
            return flag;
        }
        
		function validateProfileName(){
			 var profieName = $("#txtPdpProfileName_popup").val();
             if("" == profieName) {
                 $("#lPdpSetError_popup").show().text(jQuery.i18n.prop("EMPTY_PROFILE_NAME"));
                 return false;
             }

             if( !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(profieName)|| !IsEnglishLetter(profieName[0])) {
                 $("#lPdpSetError_popup").show().text(jQuery.i18n.prop("lPdpProfileNameFormatError"));
                 return false;
             }
             for(var profileIdx = 0; profileIdx < gProfileArr.length; ++profileIdx) {
                 for(var pdpIdx = 0; pdpIdx < gProfileArr[profileIdx].length; ++pdpIdx) {
                     if($("#txtPdpProfileName_popup").val() == gProfileArr[profileIdx][pdpIdx][gProfileNameEnumIdx]) {
                    	 return "exist";
                     }
                 }
             }
             return true;
		}
        return this;
    }
})(jQuery);

