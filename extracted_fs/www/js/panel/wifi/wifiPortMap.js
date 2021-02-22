(function($){
    $.fn.objWifiPortMap = function() {
				var g_PortMap_num = 0;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/wifi/wifiPortMap.html");

                $("#lt_portMap_btnAddPortMap").click(function() {
                    AddPortMapEntry();
                });

                $("#lt_portMap_btnDeletePortMap").click(function() {
                    DelPortMapEntry();
                });

            } //end flag

            GetFWPortMapInfo();
        }

        function DelPortMapEntry() {
            var entryIdxList = "";
            $("tbody tr td :checked").each(function() {
                var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
                entryIdxList = entryIdxList + entryIdx + ",";
            });
            if(""==entryIdxList) {
                return;
            }
            var entryMap = new Map();
            entryMap.put("RGW/firewall/del_port_mapping_index",entryIdxList);
						ShowDlg("PleaseWait", 200, 130);
						$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
						setTimeout(function(){
							var retXml = PostXml("firewall","delete_port_mapping_entry",entryMap);
							if("OK" == $(retXml).find("setting_response").text()) {
									GetFWPortMapInfo();
									showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_delete_success"));
							} else {
									showMsgBox(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_delete_fail"));
							}
						},200); 
        }


        function AddPortMapEntry() {
					if(g_PortMap_num >= 16){
						showMsgBox(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_add_length"));
						return;
					}
            ShowPortMapConfigDlg();
            var ipportMapIP_dest = $("#divportMapIP_dest").ip_address("divportMapIP_dest");
            clearErrorInfo();
            $("#lt_btnSave").click(function() {
                var sport = $.trim($("#txtSrcPort").val());
                var dport = $.trim($("#txtDestPort").val());
								var portName = $.trim($('#text_portMap_name').val());
                var validateMsg = ValidatePortMapEntry(portName,ipportMapIP_dest,sport,dport);
                if("ok" != validateMsg) {
                    $("#lIpFilterSetError").show().text(validateMsg);
                    return;
                }
                var entryId = $("tbody tr").size() + 1;
                var preTag = "RGW/firewall/port_mapping/entry_list/entry_" + entryId;
                var entryMap = new Map();
                entryMap.put(preTag+"/rule_name",portName);
                entryMap.put(preTag+"/dest_ip", ipportMapIP_dest.getIP());
                entryMap.put(preTag+"/src_dport", sport);
                entryMap.put(preTag+"/dest_dport", dport);
                entryMap.put(preTag+"/proto", $("#selPortMapProtocol").val());
                entryMap.put(preTag+"/enabled", $("#selPortMapStatus").val());

                CloseDlg();
								
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var retXml = PostXml("firewall","add_port_mapping_entry",entryMap);
									if("OK" == $(retXml).find("setting_response").text()) {
											GetFWPortMapInfo();
											showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_add_success"));
									} else {
											showMsgBox(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_add_fail"));
									}
								},200);

            });
        }


        function GetFWPortMapInfo() {
            $("#tbodyPortMap").empty();
            $("#tbodyPortMap_phone").empty();
            $("#DeleteAllIpEntry").prop("checked",false);
            $("#lt_portMap_btnDeletePortMap").hide();
						g_PortMap_num = 0 ;
            var retXml = PostXml("firewall","fw_get_port_mapping_info");

            var bFoundEntry = true;
            var idx = 1;
            while(bFoundEntry) {
                var entryIdx = "entry_" + idx;
                bFoundEntry = false;
                $(retXml).find(entryIdx).each(function() {
                    bFoundEntry = true;
										g_PortMap_num++;
										var name = $(this).find("rule_name").text();
                    var destPort = $(this).find("dest_dport").text();
                    var srcPort = $(this).find("src_dport").text();
                    var destIp = $(this).find("dest_ip").text();
                    var proto = $(this).find("proto").text();
                    var enabled = $(this).find("enabled").text();
										destPort = destPort=='none'?'':destPort;
                    var destPort_tab = destPort==''?'-':destPort;
                    var portMapEntryInfo = name+";" + destIp + ";"+ srcPort+ ";" + destPort + ";" + proto + ";" + enabled;
                    var statusString;
                    if(0 == enabled) {
                        statusString = jQuery.i18n.prop("lt_optDisabledSwitch");
                    } else {
                        statusString = jQuery.i18n.prop("lt_optEnableSwitch");
                    }

                    var htmlTxt = "<tr style='cursor: pointer;'name='" + portMapEntryInfo + "'><td>" + name + "</td><td>" + srcPort + "</td><td>" + destIp + "</td><td>" + destPort_tab + "</td><td>" + proto + "</td><td>"
                                  + statusString + "</td> <td><input type='checkbox'></td></tr>";
										var htmlTxt_phone = "<tr style='cursor: pointer;'name='" + portMapEntryInfo + "'><td>" + name + "</td><td>" + destIp + "</td><td>"
																	+ statusString + "</td> <td><input type='checkbox'></td></tr>";							
                    $("#tbodyPortMap").append(htmlTxt);
                    $("#tbodyPortMap_phone").append(htmlTxt_phone);
                });
                ++idx;
                $("#tbodyPortMap tr:last td:lt(6)").click(function() {
                    var entryIdx = $(this).parents("tr").prevAll("tr").length;
                    ModifyPortMapEntry(entryIdx);
                });
								$("#tbodyPortMap_phone tr:last td:lt(3)").click(function() {
										var entryIdx = $(this).parents("tr").prevAll("tr").length;
										ModifyPortMapEntry(entryIdx);
								});
            }

            $("#tableIpFilter #DeleteAllIpEntry").click(function() {
                if($(this).prop("checked")) {
                    $("#tbodyPortMap :checkbox").prop("checked",true);
                } else {
                	$("#tbodyPortMap :checkbox").prop("checked",false);
                }
                if($("#tbodyPortMap :checked").length>0) {
                    $("#lt_portMap_btnDeletePortMap").show();
                } else {
                    $("#lt_portMap_btnDeletePortMap").hide();
                }
            });
						$("#tableIpFilter_phone #DeleteAllIpEntry").click(function() {
								if($(this).prop("checked")) {
										$("#tbodyPortMap_phone :checkbox").prop("checked",true);
								} else {
									$("#tbodyPortMap_phone :checkbox").prop("checked",false);
								}
								if($("#tbodyPortMap_phone :checked").length>0) {
										$("#lt_portMap_btnDeletePortMap").show();
								} else {
										$("#lt_portMap_btnDeletePortMap").hide();
								}
						});

            $("#tbodyPortMap :checkbox").click(function() {
                if($("#tbodyPortMap :checked").length == $("#tbodyPortMap tr").length) {
                    $("#tableIpFilter #DeleteAllIpEntry").prop("checked",true);
                } else {
                    $("#tableIpFilter #DeleteAllIpEntry").prop("checked",false);
                }
                if($("#tbodyPortMap :checked").length>0) {
                    $("#lt_portMap_btnDeletePortMap").show();
                } else {
                    $("#lt_portMap_btnDeletePortMap").hide();
                }
            });
						$("#tbodyPortMap_phone :checkbox").click(function() {
								if($("#tbodyPortMap_phone :checked").length == $("#tbodyPortMap_phone tr").length) {
										$("#tableIpFilter_phone #DeleteAllIpEntry").prop("checked",true);
								} else {
										$("#tableIpFilter_phone #DeleteAllIpEntry").prop("checked",false);
								}
								if($("#tbodyPortMap_phone :checked").length>0) {
										$("#lt_portMap_btnDeletePortMap").show();
								} else {
										$("#lt_portMap_btnDeletePortMap").hide();
								}
						});
        }

        function ModifyPortMapEntry(entryIdx) {
            ShowPortMapConfigDlg();
            var ipportMapIP_dest = $("#divportMapIP_dest").ip_address("divportMapIP_dest");
            clearErrorInfo();
            var entryId = entryIdx + 1;
            var selector = "tbody tr:eq(" + entryIdx+ ")";
            var portMapEntryInfo = $(selector).attr("name").split(";");
						
						$('#text_portMap_name').val(portMapEntryInfo[0]);
            ipportMapIP_dest.setIP(portMapEntryInfo[1]);

            $("#txtSrcPort").val(portMapEntryInfo[2]);
            $("#txtDestPort").val(portMapEntryInfo[3]);
            $("#selPortMapProtocol").val(portMapEntryInfo[4]);
            $("#selPortMapStatus").val(portMapEntryInfo[5]);

            $("#lt_btnSave").click(function() {
                var sport = $.trim($("#txtSrcPort").val());
                var dport = $.trim($("#txtDestPort").val());
								var portName = $.trim($('#text_portMap_name').val());
               
                if(portMapEntryInfo[0] == portName && portMapEntryInfo[1] == ipportMapIP_dest.getIP()
									 && portMapEntryInfo[2] == sport && portMapEntryInfo[3] == dport
                   && portMapEntryInfo[4] ==  $("#selPortMapProtocol").val() && portMapEntryInfo[5] ==  $("#selPortMapStatus").val()) {
                    CloseDlg();
                    return;
                }
								
								var validateMsg = ValidatePortMapEntry(portName,ipportMapIP_dest,sport,dport);
								if("ok" != validateMsg) {
										$("#lIpFilterSetError").show().text(validateMsg);
										return;
								}
                var preTag = "RGW/firewall/port_mapping/entry_list/entry_" + entryId;
                var entryMap = new Map();
                entryMap.put(preTag+"/rule_name",portName); 
                entryMap.put(preTag+"/dest_ip",ipportMapIP_dest.getIP());
                entryMap.put(preTag+"/src_dport", sport);
                entryMap.put(preTag+"/dest_dport", dport);
                entryMap.put(preTag+"/proto", $("#selPortMapProtocol").val());
                entryMap.put(preTag+"/enabled", $("#selPortMapStatus").val());

                CloseDlg();
								
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var retXml = PostXml("firewall","edit_port_mapping_entry",entryMap);
									if("OK" == $(retXml).find("setting_response").text()) {
											GetFWPortMapInfo();
											showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_modify_success"));
									} else {
											showMsgBox(jQuery.i18n.prop("dialog_message_port_map_title"), jQuery.i18n.prop("dialog_message_port_map_modify_fail"));
									}
								},200);
                
            });
        }

        function ShowPortMapConfigDlg() {
            if(g_bodyWidth<=430){
							ShowDlg("divPortMapSetDlg",'95%',335);
						}else{
							ShowDlg("divPortMapSetDlg",410,335);
						}
            $("[name='time']").keyup(function() {
                $("#lIpFilterSetError").hide();
                if($(this).val().length == 2) {
                    $(this).nextAll(":eq(1)").focus();
                }
            });
        }

        function ValidatePortMapEntry(name,IPControl,src_port,dest_port) {
					var r = /^[0-9a-zA-Z]{1,30}$/;
					if(!r.test(name)){
						return jQuery.i18n.prop("lt_RuleNameError");
					}
            if(!IPControl.validIPV4()) {
                return jQuery.i18n.prop("lt_ipAddrFormatError");
            }
		/* 	var IPControlArr  = IPControl.getIP().split(".");
			var retXml = PostXml("router", "router_get_dhcp_settings",null,'','noWait');
			var start_ip =   $(retXml).find("start_ip").text();
			var end_ip =  $(retXml).find("end_ip").text();
			var DHCPstaripArr = start_ip.split(".");
			var DhcpendipArr  = end_ip.split(".");
			if(IPControlArr[0]!=DHCPstaripArr[0]||IPControlArr[1]!=DHCPstaripArr[1]||IPControlArr[2]!=DHCPstaripArr[2]||parseInt(IPControlArr[3]) <parseInt(DHCPstaripArr[3])||parseInt(IPControlArr[3]) >parseInt(DhcpendipArr[3]) ){
				  return jQuery.i18n.prop("lt_ipAddrRangeError1");
			} */
						
						if(!checkPort(src_port,true)){
							return jQuery.i18n.prop("lt_DestPortFormatError");
						}
						if(!checkPort(dest_port)){
							return jQuery.i18n.prop("lt_SrcPortFormatError");
						}

            return "ok";
        }
				
						function checkPort(port,type){ // type = true,cannot be empty
							if(port != ''){
								// var r=/^[0-9]{1,5}$/;
								var r = /^[1-9][0-9]{0,4}$/;
								if(!r.test(port)){
										return false
									}
								if(port<=0||port>65535){
										return false
								}
							}else{
								if(type){
									return false
								}
							}
							return true;
						}
							
				
        return this;
    }
})(jQuery);





