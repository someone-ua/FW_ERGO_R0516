(function($) {
    $.fn.objWifiSAC = function() {
        var g_sac_state;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/wifi/wifiSAC.html");

                $('#selOpenACLSwitch').change(function(){
                    if($(this).val() == '1'){
                        $('#divACLList').hide();
                    }else{
                        $('#divACLList').show();
                    }

                });

                $("#lt_ACL_btnAddACL").click(function() {
                    AddACLEntry();
                });

                $("#lt_ACL_btnDeleteACL").click(function() {
                    DelACLEntry();
                });

                $('#lt_btnApply').click(function(){
                    if($('#selOpenACLSwitch').val() == g_sac_state){
                        return;
                    }
                    var entryMap = new Map();
                    entryMap.put("RGW/firewall/sac_disable", $("#selOpenACLSwitch").val());
                    var retXml = PostXml("firewall","fw_set_disable_sac",entryMap);
                    if("OK" == $(retXml).find("setting_response").text()){
                        g_sac_state = $('#selOpenACLSwitch').val();
                        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_open_success"));
                    }else{
                        GetFwSacInfo();
                        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_open_fail"));
                    }
                })
            } //end flag
						GetFwSacStatus();
            GetFwSacInfo();
        };

        function DelACLEntry() {
            var entryIdxList = "";
            $("tbody tr td :checked").each(function() {
                var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
                entryIdxList = entryIdxList + entryIdx + ",";
            });

            if(""==entryIdxList) {
                return;
            }

            var entryMap = new Map();
            entryMap.put("RGW/firewall/del_sac_index",entryIdxList);
            var retXml = PostXml("firewall","delete_sac_entry",entryMap);
            if("OK" == $(retXml).find("setting_response").text()) {
                GetFwSacInfo();
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_delete_success"));
            } else {
                showMsgBox(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_delete_fail"));
            }
        }

        function AddACLEntry() {
            ShowACLConfigDlg();
            $('#selACLPort').change(function(){
                var service = selectService($(this).val());
                $('#text_ACL_service').val(service);
            });
						$('#selACLeth').change(function(){
							if($(this).val()=='lan'){
								$('#selACLTarget').val('REJECT');
							}else{
								$('#selACLTarget').val('ACCEPT');
							}
						})
            var ipACLIP_src = $("#divACLIP_src").ip_address("divACLIP_src");
            clearErrorInfo();
            $("#lt_btnSave").click(function() {

                var validateMsg = ValidateACLEntry(ipACLIP_src);
                if("ok" != validateMsg) {
                    $("#lIpFilterSetError").show().text(validateMsg);
                    return;
                }

                if($('#selOpenACLSwitch').val() != g_sac_state){
                    setACLopen();
                }

                var entryMap = new Map();
								var entryId = $("tbody tr").size() + 1;
								var preTag = "RGW/firewall/sa_control/entry_list/entry_" + entryId;
                entryMap.put(preTag+"/src_ip", ipACLIP_src.getIP());
                entryMap.put(preTag+"/dest_port", $('#selACLPort').val());
                entryMap.put(preTag+"/target",$('#selACLTarget').val() );
                entryMap.put(preTag+"/in_eth", $("#selACLeth").val());
                entryMap.put(preTag+"/enabled", $("#selACLStatus").val());

                CloseDlg();
                var retXml = PostXml("firewall","add_sac_entry",entryMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                    GetFwSacInfo();
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_add_success"));
                } else {
                    showMsgBox(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_add_failed"));
                }
            });
        }
				function GetFwSacStatus(){
					g_sac_state = '';
					var retXml = PostXml("firewall","fw_get_disable_sac");
					g_sac_state = $(retXml).find("disable").text();
					$('#selOpenACLSwitch').val(g_sac_state);
					if(g_sac_state == '1'){
						$('#divACLList').hide();
					}else{
						$('#divACLList').show();
					}
				}
        function GetFwSacInfo() {
						$("#tbodyACL").empty();
						$("#tbodyACL_phone").empty();
						$("#DeleteAllIpEntry").prop("checked",false);
						$("#DeleteAllIpEntry_phone").prop("checked",false);
						$("#lt_ACL_btnDeleteACL").hide();
            var retXml = PostXml("firewall","fw_get_sac_info");
            var bFoundEntry = true;
            var idx = 1;
            while(bFoundEntry) {
                var entryIdx = "entry_" + idx;
                bFoundEntry = false;
                $(retXml).find(entryIdx).each(function() {
                    bFoundEntry = true;
                    var destPort = $(this).find("dest_port").text();
                    var service = selectService(destPort);
                    var srcIp = $(this).find("src_ip").text();
                    var target = $(this).find("target").text();
                    var eth = $(this).find("in_eth").text();
										var enabled = $(this).find("enabled").text();
                    var ACLEntryInfo = service + ";" + srcIp + ";" + destPort + ";" + target + ";" + eth + ";" + enabled;

                    var statusString;

                    if('lan' == eth) {
                        statusString = 'LAN';
                    } else {
                        statusString = 'WAN';
                    }

                    var targetString ;
                    if(target == 'ACCEPT'){
                        targetString = jQuery.i18n.prop("lt_ACL_accept");
                    }else if(target == 'REJECT'){
                        targetString = jQuery.i18n.prop("lt_ACL_drop");
                    }
										
										var status = enabled=='1'?jQuery.i18n.prop("lt_optEnableSwitch"):jQuery.i18n.prop("lt_optDisabledSwitch");
									
                    var htmlTxt = "<tr style='cursor: pointer;'name='" + ACLEntryInfo + "'><td>"+service+"</td><td>"
                                  + srcIp + "</td><td>" + destPort + "</td><td>" + targetString + "</td><td>"
                                  + statusString + "</td><td>" + status + "</td><td><input type='checkbox'></td></tr>";
										var htmlTxt_phone = "<tr style='cursor: pointer;'name='" + ACLEntryInfo + "'><td>"+service+"</td><td>"
                                  + srcIp + "</td><td>" + status + "</td><td><input type='checkbox'></td></tr>";							
                    $("#tbodyACL").append(htmlTxt);
                    $("#tbodyACL_phone").append(htmlTxt_phone);
                });
                ++idx;
                $("#tbodyACL tr:last td:lt(6)").click(function() {
                    var entryIdx = $(this).parents("tr").prevAll("tr").length;
                    ModifySACEntry(entryIdx);
                });
								$("#tbodyACL_phone tr:last td:lt(3)").click(function() {
										var entryIdx = $(this).parents("tr").prevAll("tr").length;
										ModifySACEntry(entryIdx);
								});
            }

            $("#DeleteAllIpEntry").click(function() {
                if($(this).prop("checked")) {
                    $("#tbodyACL :checkbox").prop("checked",true);
                } else {
                	$("#tbodyACL :checkbox").prop("checked",false);
                }
                if($("#tbodyACL :checked").length>0) {
                    $("#lt_ACL_btnDeleteACL").show();
										$("#tbodyACL_phone :checkbox").prop("checked",true);
										$("#DeleteAllIpEntry_phone").prop("checked",true);
                } else {
                    $("#lt_ACL_btnDeleteACL").hide();
										$("#tbodyACL_phone :checkbox").prop("checked",false);
										$("#DeleteAllIpEntry_phone").prop("checked",false);
                }
            });

            $("#tbodyACL :checkbox").click(function() {
                if($("#tbodyACL :checked").length == $("#tbodyACL tr").length) {
                    $("#DeleteAllIpEntry").prop("checked",true);
                } else {
                    $("#DeleteAllIpEntry").prop("checked",false);
                }
                if($("#tbodyACL :checked").length>0) {
                    $("#lt_ACL_btnDeleteACL").show();
                } else {
                    $("#lt_ACL_btnDeleteACL").hide();
                }
            });
						
						$("#DeleteAllIpEntry_phone").click(function() {
								if($(this).prop("checked")) {
										$("#tbodyACL_phone :checkbox").prop("checked",true);
								} else {
									$("#tbodyACL_phone :checkbox").prop("checked",false);
								}
								if($("#tbodyACL_phone :checked").length>0) {
										$("#lt_ACL_btnDeleteACL").show();
										$("#tbodyACL :checkbox").prop("checked",true);
										$("#DeleteAllIpEntry").prop("checked",true);
								} else {
										$("#lt_ACL_btnDeleteACL").hide();
										$("#tbodyACL :checkbox").prop("checked",false);
										$("#DeleteAllIpEntry").prop("checked",false);
								}
						});

						$("#tbodyACL_phone :checkbox").click(function() {
								if($("#tbodyACL_phone :checked").length == $("#tbodyACL_phone tr").length) {
										$("#DeleteAllIpEntry").prop("checked",true);
								} else {
										$("#DeleteAllIpEntry").prop("checked",false);
								}
								if($("#tbodyACL_phone :checked").length>0) {
										$("#lt_ACL_btnDeleteACL").show();
								} else {
										$("#lt_ACL_btnDeleteACL").hide();
								}
						});
        }

        function ModifySACEntry(entryIdx) {
            ShowACLConfigDlg();
            var ipACLIP_src = $("#divACLIP_src").ip_address("divACLIP_src");
            clearErrorInfo();
						var entryId = entryIdx + 1;
            var selector = "tbody tr:eq(" + entryIdx+ ")";
            var ACLEntryInfo = $(selector).attr("name").split(";");
            $('#text_ACL_service').val(ACLEntryInfo[0]);
            ipACLIP_src.setIP(ACLEntryInfo[1]);
            $('#selACLPort').val(ACLEntryInfo[2]);
            $("#selACLTarget").val(ACLEntryInfo[3]);
            $("#selACLeth").val(ACLEntryInfo[4]);
						$('#selACLStatus').val(ACLEntryInfo[5]);

            $('#selACLPort').change(function(){
                var service = selectService($(this).val());
                $('#text_ACL_service').val(service);
            });
						
						$('#selACLeth').change(function(){
							if($(this).val()=='lan'){
								$('#selACLTarget').val('REJECT');
							}else{
								$('#selACLTarget').val('ACCEPT');
							}
						})

            $("#lt_btnSave").click(function() {
                var validateMsg = ValidateACLEntry(ipACLIP_src);
                if("ok" != validateMsg) {
                    $("#lIpFilterSetError").show().text(validateMsg);
                    return;
                }

                if(ACLEntryInfo[1] == ipACLIP_src.getIP()&& ACLEntryInfo[2] == $('#selACLPort').val()
                   && ACLEntryInfo[3] ==  $("#selACLTarget").val() && ACLEntryInfo[4] ==  $("#selACLeth").val() && ACLEntryInfo[5]==$('#selACLStatus').val()) {
                    CloseDlg();
                    return;
                }

                if($('#selOpenACLSwitch').val() != g_sac_state){
                    setACLopen();
                }

                var entryMap = new Map();
								var preTag = "RGW/firewall/sa_control/entry_list/entry_" + entryId;
                entryMap.put(preTag+"/src_ip",ipACLIP_src.getIP());
                entryMap.put(preTag+"/dest_port", $('#selACLPort').val());
                entryMap.put(preTag+"/target", $("#selACLTarget").val());
                entryMap.put(preTag+"/in_eth", $("#selACLeth").val());
                entryMap.put(preTag+"/enabled", $("#selACLStatus").val());

                CloseDlg();
                var retXml = PostXml("firewall","edit_sac_entry",entryMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                    GetFwSacInfo();
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_modify_success"));
                } else {
                    showMsgBox(jQuery.i18n.prop("dialog_message_acl_title"), jQuery.i18n.prop("dialog_message_acl_modify_fail"));
                }
            });
        }

        function setACLopen(){
            var stateMap = new Map();
            stateMap.put("RGW/firewall/sac_disable", $("#selOpenACLSwitch").val());
            var retXml = PostXml("firewall","fw_set_disable_sac",stateMap,'','noWait');
            if("OK" == $(retXml).find("setting_response").text()){
                g_sac_state = $('#selOpenACLSwitch').val();
            }
        }

        function ShowACLConfigDlg() {
					if(g_bodyWidth<450){
						ShowDlg("divACLSetDlg",'95%',320);
					}else{
						ShowDlg("divACLSetDlg",415,320);
					}
            
            $("[name='time']").keyup(function() {
                $("#lIpFilterSetError").hide();
                if($(this).val().length == 2) {
                    $(this).nextAll(":eq(1)").focus();
                }
            });
        }

        function ValidateACLEntry(IPControl) {
            if(!IPControl.validIPV4()) {
                return jQuery.i18n.prop("lt_ipAddrFormatError");
            }

            return "ok";
        }

        function selectService(port){
            var service = '';
            if(port == '21'){
                service = 'FTP'
            }else if(port == '80'){
                service = 'HTTP'
            }else if(port == '23'){
                service = 'TELENT'
            }else if(port == '25'){
                service = 'SMTP'
            }else if(port == '53'){
                service = 'DNS'
            }else if(port == '22'){
                service = 'SSH';
            }else if(port == '443'){
                service = 'HTTPS';
            }
            return service;
        }

        return this;
    }
})(jQuery);





