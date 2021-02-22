(function($) {
    $.fn.objWifiPortTrigger = function() {
			var g_portTrigger_num = 0;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/wifi/wifiPortTrigger.html");

                $("#lt_portTrigger_btnAdd").click(function() {
                    AddPortTriggerEntry();
                });

                $("#lt_portTrigger_btnDelete").click(function() {
                    DelPortTriggerEntry();
                });
            } //end flag
            GetFWPortTriggerInfo();
        }

        function DelPortTriggerEntry() {
            var entryIdxList = "";
            $("tbody tr td :checked").each(function() {
                var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
                entryIdxList = entryIdxList + entryIdx + ",";
            });

            if(""==entryIdxList) {
                return;
            }

            var entryMap = new Map();
            entryMap.put("RGW/firewall/del_port_trigger_index",entryIdxList);
						ShowDlg("PleaseWait", 200, 130);
						$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
						setTimeout(function(){
							var retXml = PostXml("firewall","delete_port_trigger_entry",entryMap);
							if("OK" == $(retXml).find("setting_response").text()) {
									GetFWPortTriggerInfo();
									showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_port_trigger_title"), jQuery.i18n.prop("dialog_message_port_trigger_delete_success"));
							} else {
									showMsgBox(jQuery.i18n.prop("dialog_message_port_trigger_title"), jQuery.i18n.prop("dialog_message_port_trigger_delete_fail"));
							}
						},200);
            
        }

        function AddPortTriggerEntry() {
					if(g_portTrigger_num >= 16){
								showMsgBox(jQuery.i18n.prop("dialog_message_port_trigger_title"), jQuery.i18n.prop("dialog_message_port_trigger_add_length"));
								return;
						}
            if(g_bodyWidth<=450){
							ShowDlg("divPortTriggerSetDlg",'95%',335);
						}else{
							ShowDlg("divPortTriggerSetDlg",410,335);
						}
            clearErrorInfo();
            $("#lt_btnSave").click(function() {
								var txtOutPort = $.trim($('#txtOutPort1').val());
								var txtInPort = $.trim($('#txtInPort1').val());
                if(!checkPort(txtOutPort) || !checkPort(txtInPort)) {
                    $("#lPortTriggerSetError").show();
                    $("#lPortTriggerSetError").text(jQuery.i18n.prop("lt_PortFormatError"));
                    return;
                }

                if(!IsRuleName( $("#txtPortTriggerRule").val())) {
                    $("#lPortTriggerSetError").show();
                    $("#lPortTriggerSetError").text(jQuery.i18n.prop("lt_RuleNameError"));
                    return;
                }

                var entryId = $("tbody tr").size() + 1;
                var preTag = "RGW/firewall/port_trigger/entry_list/entry_" + entryId;
                var entryMap = new Map();
                entryMap.put(preTag+"/rule_name", $("#txtPortTriggerRule").val());
                entryMap.put(preTag+"/out_port",txtOutPort);
                entryMap.put(preTag+"/in_port",txtInPort);
                entryMap.put(preTag+"/out_proto", $("#selPortTriggerOutProtocol").val());
                entryMap.put(preTag+"/in_proto", $("#selPortTriggerInProtocol").val());
                entryMap.put(preTag+"/enabled", $("#selPortTriggerStatus").val());

                CloseDlg();
								
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var retXml = PostXml("firewall","add_port_trigger_entry",entryMap);
									if("OK" == $(retXml).find("setting_response").text()) {
											GetFWPortTriggerInfo();
											showMsgBoxAutoClose(jQuery.i18n.prop("lt_portTrigger_PortTriggerSetDlgTitle"), jQuery.i18n.prop("dialog_message_port_trigger_add_success"));
									} else {
											showMsgBox(jQuery.i18n.prop("lt_portTrigger_PortTriggerSetDlgTitle"), jQuery.i18n.prop("dialog_message_port_trigger_add_fail"));
									}
								},200);
              
            });
        }

        function GetFWPortTriggerInfo() {
            $("#tbodyPortTrigger").empty();
            $("#tbodyPortTrigger_phone").empty();
            $("#DeleteAllIpEntry").prop("checked",false);
            $("#lt_portTrigger_btnDelete").hide();
						g_portTrigger_num = 0;
            var retXml = PostXml("firewall","fw_get_port_trigger_info");

            var bFoundEntry = true;
            var idx = 1;
            while(bFoundEntry) {
                var entryIdx = "entry_" + idx;
                bFoundEntry = false;
                $(retXml).find(entryIdx).each(function() {
                    bFoundEntry = true;
										g_portTrigger_num++;
                    var rule = $(this).find("rule_name").text();
                    var outPort = $(this).find("out_port").text();
                    var inPort = $(this).find("in_port").text();
                    var outProto = $(this).find("out_proto").text();
                    var inProto = $(this).find("in_proto").text();
                    var enabled = $(this).find("enabled").text();
                    var portEntryInfo = rule + ";" + outPort + ";" + inPort + ";" + outProto + ";" + inProto + ";" + enabled;

                    var strStatus="";
                    if(1 == enabled) {
                        strStatus = jQuery.i18n.prop("lt_optEnableSwitch");
                    } else {
                        strStatus = jQuery.i18n.prop("lt_optDisabledSwitch");
                    }

                    var htmlTxt = "<tr style='cursor: pointer;'name='" + portEntryInfo + "'><td>" + rule + "</td><td>"
                                  + outPort + "</td><td>" + inPort + "</td><td>" + outProto + "</td><td>" + inProto + "</td><td>"
                                  + strStatus + "</td> <td><input type='checkbox'></td></tr>";
																	
										var htmlTxt_phone = "<tr style='cursor: pointer;'name='" + portEntryInfo + "'><td>" + rule + "</td><td>"
																	+ outPort + "</td><td>"
																	+ strStatus + "</td> <td><input type='checkbox'></td></tr>";
																	
                    $("#tbodyPortTrigger").append(htmlTxt);
                    $("#tbodyPortTrigger_phone").append(htmlTxt_phone);
                });
                ++idx;
                $("#tbodyPortTrigger tr:last td:lt(6)").click(function() {
                    var entryIdx = $(this).parents("tr").prevAll("tr").length;
                    ModifyPortTriggerEntry(entryIdx);
                });
								$("#tbodyPortTrigger_phone tr:last td:lt(3)").click(function() {
										var entryIdx = $(this).parents("tr").prevAll("tr").length;
										ModifyPortTriggerEntry(entryIdx);
								});
            }

            $("#tableIpFilter #DeleteAllIpEntry").click(function() {
                if($(this).prop("checked")) {
                    $("#tbodyPortTrigger :checkbox").prop("checked",true);
                } else {
                	$("#tbodyPortTrigger :checkbox").prop("checked",false);
                }
                if($("#tbodyPortTrigger :checked").length>0) {
                    $("#lt_portTrigger_btnDelete").show();
                } else {
                    $("#lt_portTrigger_btnDelete").hide();
                }
            });
						$("#tableIpFilter_phone #DeleteAllIpEntry").click(function() {
								if($(this).prop("checked")) {
										$("#tbodyPortTrigger_phone :checkbox").prop("checked",true);
								} else {
									$("#tbodyPortTrigger_phone :checkbox").prop("checked",false);
								}
								if($("#tbodyPortTrigger_phone :checked").length>0) {
										$("#lt_portTrigger_btnDelete").show();
								} else {
										$("#lt_portTrigger_btnDelete").hide();
								}
						});
						
            $("#tbodyPortTrigger :checkbox").click(function() {
                if($("#tbodyPortTrigger :checked").length == $("#tbodyPortTrigger tr").length) {
                    $("#tableIpFilter #DeleteAllIpEntry").prop("checked",true);
                } else {
                    $("#tableIpFilter #DeleteAllIpEntry").prop("checked",false);
                }
                if($("#tbodyPortTrigger :checked").length>0) {
                    $("#lt_portTrigger_btnDelete").show();
                } else {
                    $("#lt_portTrigger_btnDelete").hide();
                }
            });
						$("#tbodyPortTrigger_phone :checkbox").click(function() {
								if($("#tbodyPortTrigger_phone :checked").length == $("#tbodyPortTrigger_phone tr").length) {
										$("#tableIpFilter_phone #DeleteAllIpEntry").prop("checked",true);
								} else {
										$("#tableIpFilter_phone #DeleteAllIpEntry").prop("checked",false);
								}
								if($("#tbodyPortTrigger_phone :checked").length>0) {
										$("#lt_portTrigger_btnDelete").show();
								} else {
										$("#lt_portTrigger_btnDelete").hide();
								}
						});
        }

        function ModifyPortTriggerEntry(entryIdx) {
						if(g_bodyWidth<=450){
							ShowDlg("divPortTriggerSetDlg",'95%',335);
						}else{
							ShowDlg("divPortTriggerSetDlg",410,335);
						}
            clearErrorInfo();
            var entryId = entryIdx + 1;
            var selector = "tbody tr:eq(" + entryIdx+ ")";
            var portTriggerEntryInfo = $(selector).attr("name").split(";");

            $("#txtPortTriggerRule").val(portTriggerEntryInfo[0]);
						$('#txtOutPort1').val(portTriggerEntryInfo[1]);
						$('#txtInPort1').val(portTriggerEntryInfo[2]);
            $("#selPortTriggerOutProtocol").val(portTriggerEntryInfo[3]);
            $("#selPortTriggerInProtocol").val(portTriggerEntryInfo[4]);
            $("#selPortTriggerStatus").val(portTriggerEntryInfo[5]);

            $("#lt_btnSave").click(function() {
							var txtOutPort = $.trim($('#txtOutPort1').val());
							var txtInPort = $.trim($('#txtInPort1').val());
                if(!checkPort(txtOutPort) || !checkPort(txtInPort)) {
                    $("#lPortTriggerSetError").show();
                    $("#lPortTriggerSetError").text(jQuery.i18n.prop("lt_PortFormatError"));
                    return;
                }

                if(!IsRuleName( $("#txtPortTriggerRule").val())) {
                    $("#lPortTriggerSetError").show();
                    $("#lPortTriggerSetError").text(jQuery.i18n.prop("lt_RuleNameError"));
                    return;
                }

                if(portTriggerEntryInfo[0] == $("#txtPortTriggerRule").val() && portTriggerEntryInfo[1] == txtOutPort
                   && portTriggerEntryInfo[2] == txtInPort && portTriggerEntryInfo[3] == $("#selPortTriggerOutProtocol").val()
                   && portTriggerEntryInfo[4] == $("#selPortTriggerInProtocol").val() && portTriggerEntryInfo[5] ==  $("#selPortTriggerStatus").val()) {
                    CloseDlg();
                    return;
                }

                var preTag = "RGW/firewall/port_trigger/entry_list/entry_" + entryId;
                var entryMap = new Map();
                entryMap.put(preTag+"/rule_name", $("#txtPortTriggerRule").val());
                entryMap.put(preTag+"/out_port",txtOutPort);
                entryMap.put(preTag+"/in_port",txtInPort);
                entryMap.put(preTag+"/out_proto", $("#selPortTriggerOutProtocol").val());
                entryMap.put(preTag+"/in_proto", $("#selPortTriggerInProtocol").val());
                entryMap.put(preTag+"/enabled", $("#selPortTriggerStatus").val());

                CloseDlg();
								
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var retXml = PostXml("firewall","edit_port_trigger_entry",entryMap);
									if("OK" == $(retXml).find("setting_response").text()) {
											GetFWPortTriggerInfo();
											showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_port_trigger_title"), jQuery.i18n.prop("dialog_message_port_trigger_modify_success"));
									} else {
											showMsgBox(jQuery.i18n.prop("dialog_message_port_trigger_title"), jQuery.i18n.prop("dialog_message_port_trigger_modify_fail"));
									}
								},200);
                
            });
        }
				function checkPort(port){
						// var r=/^[0-9]{1,5}$/;
						var r = /^[1-9][0-9]{0,4}$/;
						if(!r.test(port)){
								return false
							}
						if(port<=0||port>65535){
								return false
						}
						
					return true;
				}
				
        return this;
    }
})(jQuery);
