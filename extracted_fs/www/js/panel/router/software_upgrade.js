(function ($) {
    $.fn.objSoftUpdate = function (InIt) {
        var cp_url = "";
    	var ap_url = "";
    	var md5 = "";
    	var fileSize = "";
    	var cp_md5 = '';
        var cp_fileSize = '';
    	var md5Data_ = {};
        var ap_version = "";
        var cp_version = "";
    	var md5Data_cp = {};
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/software_upgrade.html");

                if(config_cp_local){  //is cp local
                    $('#cp_upgradeSoftwareForm').show();
                }else{
                    $('#cp_upgradeSoftwareForm').hide();
                }

                if(config_fota_ap){  //is fota
                    $('#upgrade_status').show();
                }else{
                    $('#upgrade_status').hide();
                }

            }
            getCpUpdateStatus();
            GetSWVersionInfo();

            $('#lt_cp_upgrade_checkbox').change(function(){
                var cpMap = new Map();
                var flag ;
                if($(this).prop("checked")){
                    flag = 1;
                    cpMap.put('RGW/router/enable','1');
                }else{
                    flag = 0;
                    cpMap.put('RGW/router/enable','0');
                }
                PostXmlAsync('router', 'router_enable_cp_update', cpMap,function(result){
                    if($(result).find('setting_response').text() == 'OK'){
                        if(flag){
                            showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_cp_upgrade_title"), jQuery.i18n.prop("dialog_message_cp_upgrade_content_setting_success"));
                        }else{
                            showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_cp_upgrade_title"), jQuery.i18n.prop("dialog_message_cp_upgrade_content_cancel_success"));
                        }

                    }else{
                        getCpUpdateStatus();
                        if(flag){
                            showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_cp_upgrade_title"), jQuery.i18n.prop("dialog_message_cp_upgrade_content_setting_fail"));
                        }else{
                            showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_cp_upgrade_title"), jQuery.i18n.prop("dialog_message_cp_upgrade_content_cancel_fail"));
                        }
                    }
                });

            });

            $("#lt_sw_btnUpgrade").click(function(){
            	var result = upgradeRouterSoftWare("upgradeSoftwareForm","upgrade",md5Data_);
            	return result;
            });
            $("#lt_cp_sw_btnUpgrade").click(function() {
		ShowDlg("PleaseWait", 200, 130);
		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
                setTimeout(function() {
                    $("#lt_cp_sw_btnUpgrade_submit").click();
                },100);
            });
            $("#lt_cp_sw_btnUpgrade_submit").click(function(){
				var result ;
				if(config_platform == '1802'){
					result = upgradeCPRouterSoftWare_1802('cp_upgradeSoftwareForm','cp_upgrade',md5Data_cp);
				}else if(config_platform == '1826'){
					result = upgradeCPRouterSoftWare_1826('cp_upgradeSoftwareForm','cp_upgrade',md5Data_cp);
				} 
				return result;
            });
            $("#softVersionUpdateFile").change(function() {
                var strFullFileName = $("#softVersionUpdateFile").val();
                var pos = strFullFileName.lastIndexOf("\\");
                var strFileName;
                if(-1 == pos)
                    strFileName = strFullFileName;
                else
                    strFileName = strFullFileName.substring(pos+1, strFullFileName.length);
                $("#txtUpgratedFileName").val(strFileName);
                if(strFileName != ""){
                	getFileMD5("softVersionUpdateFile",function(data){
                		md5Data_ = data;
                	});
                }
            });
            $("#cp_softVersionUpdateFile").change(function() {
            	var strFullFileName = $("#cp_softVersionUpdateFile").val();
            	var pos = strFullFileName.lastIndexOf("\\");
            	var strFileName;
            	if(-1 == pos)
            		strFileName = strFullFileName;
            	else
            		strFileName = strFullFileName.substring(pos+1, strFullFileName.length);
            	$("#cp_txtUpgratedFileName").val(strFileName);
                if(strFileName != ""){
                    getFileMD5("cp_softVersionUpdateFile",function(data){
                        md5Data_cp = data;
                    });
                }
            });
            $("#lt_check_upgrade_version").click(function(){
                    checkVersionUpdate();
                });

            $("#lt_execute_upgrade_version").click(function(){
                autoUpgradeVersion();
            });
        };

        function GetSWVersionInfo() {
            var retXml = PostXml("version","get_version");
            if("OK" == $(retXml).find("setting_response").text()) {
                $("#txtCurrentSoftwareVersion").text($(retXml).find("sw_version").text());
                $("#txtCurrentSoftwareDate").text($(retXml).find("build_time").text());
                ap_version = $(retXml).find("sw_version").text();
                cp_version = $(retXml).find("baseband_version").text();
                if(checkVersionUpdate && config_fota_ap){
                    checkVersionUpdate();
                }
            }
        }
	function checkVersionUpdate(){
        	var data = {};
        	data.imei = g_imei;
        	data.ap_ver = ap_version;
        	data.cp_ver = cp_version;
        	checkLastestVersion(data,function(json){
        		if(json && $.isEmptyObject(json)){
        			$("#upgrade_status_text").text(jQuery.i18n.prop("no_version_new"));
        			$("#lt_execute_upgrade_version").attr("disabled",true);
        			return;
        		}else{
        			ap_url = json.ap;
        			md5 = json.md5;
        			fileSize = json.fileSize;

                    cp_url = json.cp;
                    cp_md5 = json.cpmd5;
                    cp_fileSize = json.cpfileSize;
                    if(ap_url && md5 && fileSize){
                        $("#upgrade_status_text").text(jQuery.i18n.prop("has_version_new"));
                        $("#lt_execute_upgrade_version").attr("disabled",false);
                    }else{
                        $("#upgrade_status_text").text(jQuery.i18n.prop("no_version_new"));
                        $("#lt_execute_upgrade_version").attr("disabled",true);
                    }

        			return;
        		}
        	});
        }
        function autoUpgradeVersion(){
            ShowDlg("updateConfirmAlert",400,100);
            $("#update_confirm_title").text(jQuery.i18n.prop("checked_update_version"));
            $("#lt_update_confirm_btnOK").click(function(){
                CloseDlg();
                // if((md5=="" || fileSize=="" || fileSize==0 || ap_url=="")&&(cp_md5=="" || cp_fileSize=="" || cp_fileSize==0 || cp_url=="")){
                //     showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_autoUpgrated_getFileFailed"));
                //     return;
                // }
                if(md5=="" || fileSize=="" || fileSize==0 || ap_url==""){
                    showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_autoUpgrated_getFileFailed"));
                    return;
                }
                var configMap = new Map();
                configMap.put("RGW/tr069/ap_onekey_upgrade_url",ap_url);
                configMap.put("RGW/tr069/md5",md5);
                configMap.put("RGW/tr069/fileSize",fileSize);
                ShowDlg("PleaseWait", 200, 130);
		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
                setTimeout(function(){
                    PostXmlAsyncForUpdate("tr069","tr069_set_onekey_upgrade_url",configMap,function(data){
                        var response = $(data).find("response").text();
                        if(response == "0"){
                            QueryAutoProgradeStatus();
                        }else{
                            if(response == "1"){
                                showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_autoUpgrated_flash_small"));
                            }else if(response == "2"){
                                showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_autoUpgrated_connect_failed"));
                            }else{
                                showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_autoUpgrated_failed"));
                            }
                        }
                    });
                },100);
                return false;
            });
        }
	function QueryAutoProgradeStatus(){
        	PostXmlAsyncForUpdate("tr069","tr069_get_onekey_upgrade_status",new Map(),function(data){
        		var responseValue = $(data).find("ap_onekey_upgrade_status").text();
        		if("2" == responseValue) {
        			CloseDlg();
        			showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_autoUpgrated_failed"));
        		} else if("0" == responseValue) {
        			setTimeout(function(){
        				CloseDlg();
    	    			clearAuthheader();
    	    		},40000)
        		} else {
        			setTimeout(QueryAutoProgradeStatus,1000);
        		}
        	});
        }
        function getCpUpdateStatus(){
            if(config_cp){
                $('#triggerCPbox').show();
                var retXml = PostXml("router","router_get_cp_update_status");
                if("1" == $(retXml).find("update_status").text()){
                    $('#lt_cp_upgrade_checkbox').prop('checked',true);
                }else{
                    $('#lt_cp_upgrade_checkbox').prop('checked',false);
                }
            }else{
                $('#triggerCPbox').hide();
            }
        }

        function QueryOtaStatus() {
			var configMap = new Map();
			configMap.put("RGW/ota/type",1);

            var retXml = PostXml("ota","query",configMap);
            var responseValue = $(retXml).find("response").text();
            if("updating" == responseValue) {
                setTimeout(QueryOtaStatus,10000);
            } else if("success" == responseValue) {
                PostXml("router","router_call_reboot");
                $("#lt_sw_WarningLine1").hide(jQuery.i18n.prop("lt_sw_UpgradeSuccessWarningLine1"));
                $("#lt_sw_WarningLine2").text(jQuery.i18n.prop("lt_sw_UpgradeSuccessWarningLine2"));
                setTimeout(function() {
                    CloseDlg();
                    clearAuthheader();
                },50000);
            } else {
                $(".loading").hide();
                $("#lt_sw_WarningLine2").hide();
                $("#lt_sw_WarningLine1").text(jQuery.i18n.prop("lt_sw_UpgradeFailedWarningLine1"));
            }
        }

        function upgradeRouterSoftWare(id,file,data) {
            var strFile = $("#softVersionUpdateFile").val();
            if("" == strFile) {
            	showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileIsEmpty"));
                return false;
            }
            if(-1 == strFile.lastIndexOf(".bin")) {
            	showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileFormatWrong"));
                return false;
            }
        	var localFileMd5 = data.md5;
        	var size = data.size;
        	ShowDlg("PleaseWait", 200, 130);
		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
        	var url = window.location.protocol + "//" + window.location.host + getHeader("GET",file);
        	
        	if(!localFileMd5 || localFileMd5=="error"){
        		document.getElementById("upgradeSoftwareForm").action = url;
            	document.getElementById("upgradeSoftwareForm").target="rfFrame";
            	document.getElementById("upgradeSoftwareForm").submit();
        	}else{
        		url += "&md5="+localFileMd5+"&size="+size;
        		var options = {
    				url:url,
    				type:"POST",
    				async:false,
    				success:function(data){
    					var result = $(data).find("error_cause").text(); 
    					if(result != ""){
    						CloseDlg();
    						showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileFailed"));
    						return false;
    					}
    				}
        		};
        		$("#"+id).submit(function(){
        			$(this).ajaxSubmit(options);
        			return false;
        		});
        	}
        	setTimeout(function() {
                CloseDlg();
                clearAuthheader();
            },100000);
        }
        function upgradeCPRouterSoftWare_1802(id,file,data) {
			var strFile = $("#cp_softVersionUpdateFile").val();
			if("" == strFile) {
				showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileIsEmpty"));
				return false;
			}
			if(-1 == strFile.lastIndexOf(".gz")) {
				showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileFormatWrong"));
				return false;
			}
			var localFileMd5 = data.md5;
			var size = data.size;
			var url = window.location.protocol + "//" + window.location.host + getHeader("GET",file);
			if(!localFileMd5 || localFileMd5=="error"){
				document.getElementById("cp_upgradeSoftwareForm").action = url;
				document.getElementById("cp_upgradeSoftwareForm").target="rfFrame";
				document.getElementById("cp_upgradeSoftwareForm").submit();
			}else{
				url += "&md5="+localFileMd5+"&size="+size;
				var options = {
					url:url,
					type:'POST',
					async:true,
					success:function(data){}
				};
				$("#"+id).submit(function(){
					$(this).ajaxSubmit(options);
					return false;
				});

			}
			setTimeout(function() {
				CloseDlg();
				clearAuthheader();
			},300000);
		}
		function upgradeCPRouterSoftWare_1826(id,file,data) {
			var strFile = $("#cp_softVersionUpdateFile").val();
			if("" == strFile) {
				showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileIsEmpty"));
				return false;
			}
			/*
			if(-1 == strFile.lastIndexOf(".gz")) {
				showMsgBox(jQuery.i18n.prop("dialog_message_software_upgrade_title"), jQuery.i18n.prop("lt_sw_UpgratedFileFormatWrong"));
				return false;
			}*/
			var roamMap = new Map();
			roamMap.put('RGW/util_wan/ip',"192.168.8.1");
			var retXML = PostXmlNoShowWaitBox("util_wan","switch_network",roamMap);
			if($(retXML).find('setting_response').text()=='OK'){
				var localFileMd5 = data.md5;
				var size = data.size;
				var url = window.location.protocol + "//" + "192.168.8.1" + "/xml_action.cgi?Action=Upload&file=cp_upgrade_1826&command=";
				url += "&md5="+localFileMd5+"&size="+size;

				document.getElementById("cp_upgradeSoftwareForm").action = url;
				document.getElementById("cp_upgradeSoftwareForm").target="rfFrame";
				document.getElementById("cp_upgradeSoftwareForm").submit();

				setTimeout(function() {
					CloseDlg();
					clearAuthheader();
				},300000);
			}
		}
                
		this.SaveData = function() {
        	$("#lt_sw_btnUpgrade").click();
        };
        
        return this;
    }
})(jQuery);





