(function($) {
    $.fn.objWifiDmzSet = function() {
        var gDMZHostIpAdrrCtrl;
        var dmzMode;
        var gIpCtrlDMZAddr;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/wifi/wifiDmzSet.html");

                $("#selDmzSwitch").change(function() {
                    if("1"==$(this).val()) {
                        $("#divDmzIpAddr").hide();
                    } else {
                        $("#divDmzIpAddr").show();
                    }
                });

                $("#lt_dmz_btnAddDmzIpAddr").click(function() {
                    AddDmzIpAddr();
                });

                $("#lt_dmz_btnDeleteDmzIpAddr").click(function() {
                    DeleteDmzIpAddr();
                });

                $("#lt_dmz_btnEditDmzIpAddr").click(function() {
                    ModifyDmzIpAddr();
                });

                gDMZHostIpAdrrCtrl = $("#divhostIpAddrctrl").ip_address("divhostIpAddrctrl");
                gDMZHostIpAdrrCtrl.disableIP(true,true,true,true);

            } //end flag

            GetFWDmzInfo();
            GetDmzIpAddr();
        }

        function DeleteDmzIpAddr() {
			ShowDlg("PleaseWait", 200, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			setTimeout(function(){
				//enable DMZ
				if(dmzMode != $("#selDmzSwitch").val()) {
					enableDmz();
				}
	
				var retXml = PostXml("firewall","delete_dmz");
				if("OK" != $(retXml).find("setting_response").text()) {
					showMsgBox(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_ip_delete_fail"));
				} else {
					SetDmzIpAddrVal('');
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_ip_delete_success"));
				}
			},100);
        }

        function validateDMZIPAddr(ipAddr){
            if(!IsIPv4(ipAddr)) {
                $("#lt_dmz_ipAddrError").show().text(jQuery.i18n.prop("lt_ipAddrFormatError"));
                return false;
            }
            /* var retXml = PostXml("router","router_get_lan_ip");
            var LanIpAddr = $(retXml).find("lan_ip").text();
            var DHCPIPAddrArr = LanIpAddr.split(".");
             
            var dhcpRetXml = PostXml("router","router_get_dhcp_settings"); */
            /* var start = $(dhcpRetXml).find("start").text();
            var end = parseInt(start) + parseInt($(dhcpRetXml).find("limit").text()) - 1; */
			/* var start = $(dhcpRetXml).find("start_ip").text();
			var end = $(dhcpRetXml).find("end_ip").text();
			var startArr = start.split(".");
			var endArr =  end.split(".");
            
            var dmzHostArr = ipAddr.split(".");
            for(var i=0;i<3;i++){
            	if(DHCPIPAddrArr[i] != dmzHostArr[i]){
            		$("#lt_dmz_ipAddrError").show().text(jQuery.i18n.prop("lt_ipAddrBeyondScale"));
            		return false;
            	}
            }
            if(Number(dmzHostArr[3])>Number(endArr[3])   || Number(dmzHostArr[3])<Number(startArr[3])){
            	$("#lt_dmz_ipAddrError").show().text(jQuery.i18n.prop("lt_ipAddrBeyondScale"));
            	return false;
            } */
            return true;
        }
        	
        function AddDmzIpAddr() {
            if(g_bodyWidth<=430){
				ShowDlg("divDmzSetDlg",'95%',160);
			}else{
				ShowDlg("divDmzSetDlg",410,160);
			}
            gIpCtrlDMZAddr = $("#divdmzdlgipControl").ip_address("divdmzdlgipControl");
            clearErrorInfo();
            $("#lt_btnSave").click(function() {
            	var ipAddr = gIpCtrlDMZAddr.getIP();
            	var dmzAddrValidate = validateDMZIPAddr(ipAddr);
            	if(dmzAddrValidate == false){
            		return;
            	}
                ShowDlg("PleaseWait", 200, 130);
                $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
                setTimeout(function(){
					//enable DMZ
					if(dmzMode != $("#selDmzSwitch").val()) {
						enableDmz();
					}
	
					var entryMap = new Map();
					entryMap.put("RGW/firewall/dmz_dest_ip",ipAddr);
					CloseDlg();
					var retXml = PostXml("firewall","fw_add_dmz_entry",entryMap);
				   
					if("OK" != $(retXml).find("setting_response").text()) {
						showMsgBox(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_ip_add_fail"));
					} else {
						SetDmzIpAddrVal(ipAddr);
						showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_ip_add_success"));
					}
				},100);
			})
        }

        function GetFWDmzInfo() {
            var retXml = PostXml("firewall","fw_get_disable_info");
            dmzMode = $(retXml).find("dmz_disable").text();
            $("#selDmzSwitch").val(dmzMode);
            if(1 == dmzMode) {
                $("#divDmzIpAddr").hide();
            } else {
                $("#divDmzIpAddr").show();
            }

        }

        function GetDmzIpAddr() {
            var retXml = PostXml("firewall","fw_get_dmz_info");
            var hostIpAddr = $(retXml).find("dmz_dest_ip").text();
            SetDmzIpAddrVal(hostIpAddr);
        }
		
		function SetDmzIpAddrVal(IpAddr){
			if(""==IpAddr) {
				$("#divIpAddr").hide();
				$("#lt_dmz_btnAddDmzIpAddr").show();
				$("#lt_dmz_btnDeleteDmzIpAddr").hide();
				$("#lt_dmz_btnEditDmzIpAddr").hide();
			} else {
				$("#divIpAddr").show();
				$("#lt_dmz_btnAddDmzIpAddr").hide();
				$("#lt_dmz_btnDeleteDmzIpAddr").show();
				$("#lt_dmz_btnEditDmzIpAddr").show();

				gDMZHostIpAdrrCtrl.setIP(IpAddr);
			}
		}
		
		function enableDmz(){
			var configMap = new Map();
			configMap.put("RGW/firewall/dmz_disable",$("#selDmzSwitch").val());
			var retXml = PostXml("firewall","fw_set_disable_info",configMap);
			if($(retXml).find('setting_response').text()=="OK"){
				dmzMode = $("#selDmzSwitch").val();
			}
		}
		
        function ModifyDmzIpAddr() {
			if(g_bodyWidth<=430){
				ShowDlg("divDmzSetDlg",'95%',170);
			}else{
				ShowDlg("divDmzSetDlg",410,170);
			}
            gIpCtrlDMZAddr = $("#divdmzdlgipControl").ip_address("divdmzdlgipControl");
            clearErrorInfo();
            var curIpAddr = gDMZHostIpAdrrCtrl.getIP();
            gIpCtrlDMZAddr.setIP(curIpAddr);
            
            $("#lt_btnSave").click(function() {
            	var newIpAddr = gIpCtrlDMZAddr.getIP();
            	if(newIpAddr == curIpAddr) {
            		return;
            	}
            	var dmzAddrValidate = validateDMZIPAddr(newIpAddr);
            	if(dmzAddrValidate == false){
            		return;
            	}
				ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
				setTimeout(function(){
					//enable DMZ
					if(dmzMode != $("#selDmzSwitch").val()) {
						enableDmz();
					}
	
					var entryMap = new Map();
					entryMap.put("RGW/firewall/dmz_dest_ip", newIpAddr);
					var retXml = PostXml("firewall","fw_edit_dmz_entry",entryMap);
					if("OK" != $(retXml).find("setting_response").text()) {
						showMsgBox(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_ip_modify_fail"));
					} else {
						SetDmzIpAddrVal(newIpAddr);
						showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_ip_modify_success"));
					}
					
				},100);	
            });
        }

        this.SaveData = function() {
            if(dmzMode == $("#selDmzSwitch").val()) {
                return;
            }
			ShowDlg("PleaseWait", 200, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			setTimeout(function(){
				var configMap = new Map();
				configMap.put("RGW/firewall/dmz_disable",$("#selDmzSwitch").val());
				var retXml = PostXml("firewall","fw_set_disable_info",configMap);
				if("OK" == $(retXml).find("setting_response").text()) {
					dmzMode = $("#selDmzSwitch").val();
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_set_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_dmz_title"), jQuery.i18n.prop("dialog_message_dmz_set_fail"));
				}
			},100);
        }
        return this;
    }
})(jQuery);





