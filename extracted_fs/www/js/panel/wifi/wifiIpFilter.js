
(function($) {
    $.fn.objWifiIpFilter = function() {
        var gDisbaledipFilter;
        var gIpFilterPolicy;
				var gIpFilter_num = 0;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/wifi/wifiIpFilter.html");
                $("#selOpenIpFilterSwitch").change(function() {
                    if(1 == $(this).val()) {
                        $("#divIpFilterPolicySwitch").hide();
                        $("#divIpFilterList").hide();
                    } else {
                        $("#divIpFilterPolicySwitch").show();
                        $("#divIpFilterList").show();
                    }
                });

                $("#selIpFilterPolicySwitch").change(function() {
                    $("#divIpFilterList").show();
                    if("ACCEPT"==$(this).val()) {
                        $("#lIpFilterListLabel").text(jQuery.i18n.prop('lt_ipFilter_AcceptHelper'));
                    } else {
                        $("#lIpFilterListLabel").text(jQuery.i18n.prop('lt_ipFilter_rejectHelper'));
                    }
                });

                $("#lt_ipFilter_btnAddIpFilter").click(function() {
                    AddIpFilterEntry();
                });

                $("#lt_ipFilter_btnDeleteIpFilter").click(function() {
                    DelIpFilterEntry();
                });
            } //end flag

            GetFWIpFilterInfo();
        }

        function DelIpFilterEntry() {
            var entryIdxList = "";
            $("tbody tr td :checked").each(function() {
                var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
                entryIdxList = entryIdxList + entryIdx + ",";
            });

            if(""==entryIdxList) {
                return;
            }

            var entryMap = new Map();
            entryMap.put("RGW/firewall/delete_ipfilter_index",entryIdxList);
            var retXml = PostXml("firewall","delete_ip_filter_entry",entryMap);
            if("OK" == $(retXml).find("setting_response").text()) {
                GetFWIpFilterInfo();
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_delete_success"));
            } else {
                showMsgBox(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_delete_fail"));
            }
            updateIpFilterStatus();
        }

        function AddIpFilterEntry() {
					if(gIpFilter_num >= 16){
						showMsgBox(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_add_length"));
						return;
					}
            if(g_bodyWidth<=430){
							ShowDlg("divIpFilterSetDlg",'95%',370);
						}else{
							ShowDlg("divIpFilterSetDlg",400,370);
						}
						var ipControl_source= $("#divipControl_source").ip_address("divipControl_source");
            var ipControl_dest = $("#divipControl_dest").ip_address("divipControl_dest"); 
						$('#txtDestPort1,#txtSrcPort1').prop('disabled',false);
           $("[name='time']").keyup(function() {
                if($(this).val().length == 2) {
                    $(this).nextAll(":eq(1)").focus();
                }
            });
            clearErrorInfo();
            $('#selIpFilterProtocol').change(function () {
                var val = $(this).val();
                if(val == 'icmp'){
                    $('#txtSrcPort1,#txtDestPort1').val('').prop('disabled',true);
                }else{
                    $('#txtSrcPort1,#txtDestPort1').prop('disabled',false);
                }
            });
            $("#lt_btnSave").click(function() {
							var src_port = $.trim($('#txtSrcPort1').val());
							var dest_port = $.trim($('#txtDestPort1').val());
							var protocol = $('#selIpFilterProtocol').val();
							var validateMsg = ValidateIPFilterEntry(ipControl_source,ipControl_dest,src_port,dest_port);
							if("ok" != validateMsg){
								$("#lIpFilterSetError").show().text(validateMsg);	
								return;
							}
                	if(protocol != 'icmp'){
                		src_port = src_port==''?'1:65535':src_port;
                		dest_port = dest_port==''?'1:65535':dest_port;
                	}
									if(src_port == 'all'){
										src_port = '1:65535';
									}
									if(dest_port == 'all'){
										dest_port = '1:65535';
									}
                var entryId = $("tbody tr").size() + 1;
                var preTag = "RGW/firewall/ip_filter/entry_list/entry_" + entryId;
                var entryMap = new Map();
                entryMap.put(preTag+"/src_ip", ipControl_source.getIP());
                entryMap.put(preTag+"/dest_ip", ipControl_dest.getIP());
                entryMap.put(preTag+"/src_port", src_port);
                entryMap.put(preTag+"/dest_port", dest_port);
                entryMap.put(preTag+"/proto", protocol);
                entryMap.put(preTag+"/target", $("#selIpFilterAction").val());
                entryMap.put(preTag+"/enabled", $("#selIpFilterStatus").val());

                CloseDlg();
                var retXml = PostXml("firewall","add_ip_filter_entry",entryMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_add_success"));
                } else {
                    showMsgBox(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_add_fail"));
                }
                updateIpFilterStatus();
            });
        }

        function GetFWIpFilterInfo() {
            var retXml = PostXml("firewall","fw_get_disable_info");
            gDisbaledipFilter = $(retXml).find("ip_filter_disable").text();
            $("#selOpenIpFilterSwitch").val(gDisbaledipFilter);
            if(1 == gDisbaledipFilter) {
                $("#divIpFilterList").hide();
                $("#divIpFilterPolicySwitch").hide();
            } else {
                $("#divIpFilterList").show();
                $("#divIpFilterPolicySwitch").show();
            }
            GetIpFilterDefaultPolicyInfo();
        }

        function GetIpFilterDefaultPolicyInfo() {
            var retXml = PostXml("firewall","fw_get_ip_filter_info");
            gIpFilterPolicy = $(retXml).find("default_policy").text();
						gIpFilter_num = 0;
            $("#selIpFilterPolicySwitch").val(gIpFilterPolicy);
            if("ACCEPT"==$("#selIpFilterPolicySwitch").val()) {
                $("#lIpFilterListLabel").text(jQuery.i18n.prop('lt_ipFilter_AcceptHelper'));
            } else {
                $("#lIpFilterListLabel").text(jQuery.i18n.prop('lt_ipFilter_rejectHelper'));
            }

            $("#tbodyIpFilter").empty();
            $("#tbodyIpFilter_phone").empty();
            $("#DeleteAllIpEntry").prop("checked",false);
						$("#lt_ipFilter_btnDeleteIpFilter").hide();					

            var bFoundEntry = true;
            var idx = 1;
            while(bFoundEntry) {
                var entryIdx = "entry_" + idx;
                bFoundEntry = false;
                $(retXml).find(entryIdx).each(function() {
										gIpFilter_num++;
                    bFoundEntry = true;
                    var srcIp = $(this).find("src_ip").text();
                    var srcPort = $(this).find("src_port").text();
                    var destIp = $(this).find("dest_ip").text();
                    var destPort = $(this).find("dest_port").text();
                    var proto = $(this).find("proto").text();
                    var target = $(this).find("target").text();
                    var enabled = $(this).find("enabled").text();
                    
										srcPort = srcPort == '1:65535'?'all':srcPort;
										destPort = destPort == '1:65535'?'all':destPort;
                    var ipFilterEntryInfo = srcIp + ";" + srcPort + ";"
                                            + destIp + ";" + destPort + ";" + proto + ";" + target  + ";" + enabled;
                    if (target == "ACCEPT") {
                    	target = jQuery.i18n.prop("lt_ipFilter_AccepPolicy");
                    } else if (target == "REJECT") {
                    	target = jQuery.i18n.prop("lt_ipFilter_rejectPolicy");
                    } else if (target == "DROP"){
                    	target = jQuery.i18n.prop("lt_ipFilter_DropPolicy");
                    }              
                    var strStatus;
                    if(1==enabled) {
                        strStatus = jQuery.i18n.prop("lt_optEnableSwitch");
                    } else {
                        strStatus = jQuery.i18n.prop("lt_optDisabledSwitch");
                    }
                    var htmlTxt = "<tr style='cursor: pointer;'name='" + ipFilterEntryInfo + "'><td>" + srcIp + "</td><td>"
                                  + srcPort + "</td><td>" + destIp + "</td><td>" + destPort + "</td><td>" + proto + "</td><td>"
                                  + target + "</td><td>" + strStatus + "</td> <td><input type='checkbox'></td></tr>";
										var htmlTxt_phone = "<tr style='cursor: pointer;'name='" + ipFilterEntryInfo + "'><td>" + srcIp + "</td><td>" + destIp + "</td><td>" + strStatus + "</td><td><input type='checkbox'></td></tr>";						
                    $("#tbodyIpFilter").append(htmlTxt);
                    $("#tbodyIpFilter_phone").append(htmlTxt_phone);
                });
                ++idx;

                $("#tbodyIpFilter tr:last td:lt(7)").click(function() {
                    var entryIdx = $(this).parents("tr").prevAll("tr").length;
                    ModifyIpFilterEntry(entryIdx);
                });
								$("#tbodyIpFilter_phone tr:last td:lt(3)").click(function() {
										var entryIdx = $(this).parents("tr").prevAll("tr").length;
										ModifyIpFilterEntry(entryIdx);
								});
            }

            $("#tableIpFilter #DeleteAllIpEntry").click(function() {
								var ii = $(this).prop("checked");
                if($(this).prop("checked")) {
                    $("#tbodyIpFilter :checkbox").prop("checked",true);
                } else {
                	$("#tbodyIpFilter :checkbox").prop("checked",false);
                }

							if($("#tbodyIpFilter :checked").length>0){
								$("#lt_ipFilter_btnDeleteIpFilter").show();	
							}else{
								$("#lt_ipFilter_btnDeleteIpFilter").hide();	
							}
            });
						$("#tableIpFilter_phone #DeleteAllIpEntry").click(function() {
							var ii = $(this).prop("checked");
							if($(this).prop("checked")) {
									$("#tbodyIpFilter_phone :checkbox").prop("checked",true);
							} else {
								$("#tbodyIpFilter_phone :checkbox").prop("checked",false);
							}

						if($("#tbodyIpFilter_phone :checked").length>0){
							$("#lt_ipFilter_btnDeleteIpFilter").show();		
						}else{
							$("#lt_ipFilter_btnDeleteIpFilter").hide();	
						}
					});

            $("#tbodyIpFilter :checkbox").click(function() {				
                if($("#tbodyIpFilter :checked").length == $("#tbodyIpFilter tr").length) {
                    $("#tbodyIpFilter #DeleteAllIpEntry").prop("checked",true);
                }else{
										$("#tbodyIpFilter  #DeleteAllIpEntry").prop("checked",false);
								}
								if($("#tbodyIpFilter :checked").length>0){
									$("#lt_ipFilter_btnDeleteIpFilter").show();					
								}else{
									$("#lt_ipFilter_btnDeleteIpFilter").hide();	
								}
            });
						$("#tbodyIpFilter_phone :checkbox").click(function() {				
								if($("#tbodyIpFilter_phone :checked").length == $("#tbodyIpFilter_phone tr").length) {
										$("#tbodyIpFilter_phone #DeleteAllIpEntry").prop("checked",true);
								}else{
										$("#tbodyIpFilter_phone #DeleteAllIpEntry").prop("checked",false);
								}
								if($("#tbodyIpFilter_phone :checked").length>0){
									$("#lt_ipFilter_btnDeleteIpFilter").show();					
								}else{
									$("#lt_ipFilter_btnDeleteIpFilter").hide();	
								}
						})
        }

        function ModifyIpFilterEntry(entryIdx) {
            if(g_bodyWidth<=430){
							ShowDlg("divIpFilterSetDlg",'95%',370);
						}else{
							ShowDlg("divIpFilterSetDlg",400,370);
						}
            clearErrorInfo();
            var entryId = entryIdx + 1;
            var selector = "tbody tr:eq(" + entryIdx+ ")";
            var ipFilterEntryInfo = $(selector).attr("name").split(";");
            var ipControl_source= $("#divipControl_source").ip_address("divipControl_source");
            var ipControl_dest = $("#divipControl_dest").ip_address("divipControl_dest"); 
            ipControl_source.setIP(ipFilterEntryInfo[0]);
						$('#txtSrcPort1').val(ipFilterEntryInfo[1]);
            ipControl_dest.setIP(ipFilterEntryInfo[2]);
						$('#txtDestPort1').val(ipFilterEntryInfo[3]);

            $("#selIpFilterProtocol").val(ipFilterEntryInfo[4]);
            if(ipFilterEntryInfo[4] == 'icmp'){
                $('#txtDestPort1,#txtSrcPort1').prop('disabled',true);
            }else{
                $('#txtDestPort1,#txtSrcPort1').prop('disabled',false);
            }
            $("#selIpFilterAction").val(ipFilterEntryInfo[5]);
            $("#selIpFilterStatus").val(ipFilterEntryInfo[6]);

            $('#selIpFilterProtocol').change(function () {
                var val = $(this).val();
                if(val == 'icmp'){
                    $('#txtSrcPort1,#txtDestPort1').val('').prop('disabled',true);
                }else{
                    $('#txtSrcPort1,#txtDestPort1').prop('disabled',false);
                }
            });

            $("#lt_btnSave").click(function() {
								var src_port = $.trim($('#txtSrcPort1').val());
								var dest_port = $.trim($('#txtDestPort1').val());
								var protocol = $('#selIpFilterProtocol').val();
                if(ipFilterEntryInfo[0] == ipControl_source.getIP()&& ipFilterEntryInfo[1] == src_port
                   && ipFilterEntryInfo[2] == ipControl_dest.getIP()&& ipFilterEntryInfo[3] == dest_port
                   && ipFilterEntryInfo[4] ==  protocol && ipFilterEntryInfo[5] ==  $("#selIpFilterAction").val()
                   && ipFilterEntryInfo[6] ==  $("#selIpFilterStatus").val()) {
                    CloseDlg();
                    return;
                }

								var validateMsg = ValidateIPFilterEntry(ipControl_source,ipControl_dest,src_port,dest_port);
								if("ok" != validateMsg){
									$("#lIpFilterSetError").show().text(validateMsg);	
									return;
								}
								if(protocol != 'icmp'){
									src_port = src_port==''?'1:65535':src_port;
									dest_port = dest_port==''?'1:65535':dest_port;
								}
								if(src_port == 'all'){
									src_port = '1:65535';
								}
								if(dest_port == 'all'){
									dest_port = '1:65535';
								}
                var preTag = "RGW/firewall/ip_filter/entry_list/entry_" + entryId;
                var entryMap = new Map();
                entryMap.put(preTag+"/src_ip", ipControl_source.getIP());
                entryMap.put(preTag+"/dest_ip", ipControl_dest.getIP());
                entryMap.put(preTag+"/src_port", src_port);
                entryMap.put(preTag+"/dest_port", dest_port);
                entryMap.put(preTag+"/proto", protocol);
                entryMap.put(preTag+"/target", $("#selIpFilterAction").val());
                entryMap.put(preTag+"/enabled", $("#selIpFilterStatus").val());

                CloseDlg();
                var retXml = PostXml("firewall","edit_ip_filter_entry",entryMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_modify_success"));
                } else {
//                    alert("edit ip filter entry failed.");
                    showMsgBox(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_modify_fail"));
                }
                updateIpFilterStatus();
            });//$("#lt_btnSave").click(function(){
        }

        this.SaveData = function() {
        	if(gDisbaledipFilter == $("#selOpenIpFilterSwitch").val() &&  $("#selIpFilterPolicySwitch").val() == gIpFilterPolicy){
        		return;
        	}
            if(gDisbaledipFilter != $("#selOpenIpFilterSwitch").val()) {
            	var ipFilterConfigMap = new Map();
                ipFilterConfigMap.put("RGW/firewall/ip_filter_disable", $("#selOpenIpFilterSwitch").val());
                var retXml = PostXml("firewall","fw_set_disable_info",ipFilterConfigMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                	gDisbaledipFilter = $("#selOpenIpFilterSwitch").val();
                } else {
//                    alert("disabled ip filter failed.");
                    showMsgBox(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_save_fail"));
                    return;
                }
            }

            var flag = false;
            if(0 == $("#selOpenIpFilterSwitch").val()
               && gIpFilterPolicy != $("#selIpFilterPolicySwitch").val()) {
            	var ipFilterConfigMap = new Map();
                ipFilterConfigMap.put("RGW/firewall/ip_filter/default_policy",$("#selIpFilterPolicySwitch").val());
                var retXml = PostXml("firewall","set_ip_filter_default_pol",ipFilterConfigMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                	gIpFilterPolicy != $("#selIpFilterPolicySwitch").val();
                	flag = true;
                } else {
//                    alert("disabled ip filter failed.");
                      showMsgBox(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_save_fail"));
                      return;
                }
            }
            GetFWIpFilterInfo();
            if (flag) {
                GetIpFilterDefaultPolicyInfo();
            }
            showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_ip_filter_title"), jQuery.i18n.prop("dialog_message_ip_filter_save_success"));
        }


		function ValidateIPFilterEntry(IPControlsrc,IPControldst,src_port,dest_port){
			if(!IPControlsrc.validIPV4()){
				return jQuery.i18n.prop("lt_ipAddrFormatError");
			}
			if(!IPControldst.validIPV4()){
				return jQuery.i18n.prop("lt_ipAddrFormatError");
			}
		/* 	var IPControlsrcArr  = IPControlsrc.getIP().split(".");
			var retXml = PostXml("router", "router_get_dhcp_settings",null,'','noWait');
			var start_ip =   $(retXml).find("start_ip").text();
			var end_ip =  $(retXml).find("end_ip").text();
			var DHCPstaripArr = start_ip.split(".");
			var DhcpendipArr  = end_ip.split(".");
			if(IPControlsrcArr[0]!=DHCPstaripArr[0]||IPControlsrcArr[1]!=DHCPstaripArr[1]||IPControlsrcArr[2]!=DHCPstaripArr[2]||parseInt(IPControlsrcArr[3]) <parseInt(DHCPstaripArr[3])||parseInt(IPControlsrcArr[3]) >parseInt(DhcpendipArr[3]) ){
				  return jQuery.i18n.prop("lt_ipAddrRangeError1");
			} */
			
			if(!checkPort(src_port)){
				return jQuery.i18n.prop("lt_SrcPortFormatError");
			}
			if(!checkPort(dest_port)){
				return jQuery.i18n.prop("lt_DestPortFormatError");
			}
			
			return "ok";
		}
		
		function checkPort(port,type){ //type==true cannot be empty
			if(port != ''){
				if(port == 'all'){return true;}
				// var r=/[0-9]{1,5}/;
				var r = /^[1-9][0-9]{0,4}$/;
				if(!r.test(port)){
						return false
					}
				if(port<=0||port>65535){
						return false
				}
				}else{
					if(type){
						return false;
					}
			}
			return true;
		}
		
		function updateIpFilterStatus(){
			if(gDisbaledipFilter != $("#selOpenIpFilterSwitch").val()) {
            	var ipFilterConfigMap = new Map();
                ipFilterConfigMap.put("RGW/firewall/ip_filter_disable", $("#selOpenIpFilterSwitch").val());
                var retXml = PostXml("firewall","fw_set_disable_info",ipFilterConfigMap);
            }

            if(0 == $("#selOpenIpFilterSwitch").val() && gIpFilterPolicy != $("#selIpFilterPolicySwitch").val()) {
            	var ipFilterConfigMap = new Map();
                ipFilterConfigMap.put("RGW/firewall/ip_filter/default_policy",$("#selIpFilterPolicySwitch").val());
                var retXml = PostXml("firewall","set_ip_filter_default_pol",ipFilterConfigMap);
            }
            GetFWIpFilterInfo();
        }
        return this;
    }
		
})(jQuery);
