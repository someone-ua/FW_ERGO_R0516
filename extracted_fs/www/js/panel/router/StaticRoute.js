(function($) {
    $.fn.objStaticRoute = function() {
        G_currentSR = '';
        G_SRlist = [];
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/StaticRoute.html");

                $("#lt_SR_btnAddSR").click(function() {
                    AddSREntry();
                });

                $("#lt_SR_btnDeleteSR").click(function() {
                    DelSREntry();
                });

            } //end flag
						getVPNproto();
            GetStaticRouteInfo();
        };
				function getVPNproto(){
					var retXml = PostXml("router","router_get_vpn_info");
					var proto = $(retXml).find("proto").text();
					if(proto == 'gre'){
						$('#divSRSetDlg #selSR_interface').html("<option value='lan'>LAN</option><option value='wan'>WAN</option><option value='gre_tunnel'>GRE</option>");
					}else{
						$('#divSRSetDlg #selSR_interface').html("<option value='lan'>LAN</option><option value='wan'>WAN</option>");
					}
				}

        function DelSREntry() {
            var entryIdxList = "";
            $("tbody tr td :checked").each(function() {
                var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
                entryIdxList = entryIdxList + entryIdx + ",";
            });
            if(""==entryIdxList) {
                return;
            }
            var entryMap = new Map();
            entryMap.put("RGW/router/delete_static_routing_index",entryIdxList);
            var retXml = PostXml("router","delete_static_routing",entryMap);
            if("OK" == $(retXml).find("setting_response").text()) {
                GetStaticRouteInfo();
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_static_route_title"), jQuery.i18n.prop("dialog_message_static_route_delete_success"));
            } else {
                showMsgBox(jQuery.i18n.prop("dialog_message_static_route_title"), jQuery.i18n.prop("dialog_message_static_route_delete_fail"));
            }
        }

        function AddSREntry() {
            ShowSRConfigDlg();
            var SR_IpAddr = $("#divSR_IpAddr").ip_address("divSR_IpAddr");
            var SR_netmask = $("#divSR_netmask").ip_address("divSR_netmask");
            var SR_gateway = $("#divSR_gateway").ip_address("divSR_gateway");
            clearErrorInfo();
            $("#lt_btnSave").click(function() {
                var lan = $('#selSR_interface').val();
                var ip = SR_IpAddr.getIP();
                var netmask = SR_netmask.getIP();
                var gateway = SR_gateway.getIP();
                var validateMsg = ValidateSREntry(SR_IpAddr,SR_netmask,gateway);
                if("ok" != validateMsg) {
                    $("#SRSetError").show().text(validateMsg);
                    return;
                }
                var info = lan+";"+ip+";"+netmask+";"+gateway;
                var ret = isExixt(info);
                if(ret != 'ok'){
                    $("#SRSetError").show().text(ret);
                    return;
                }
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var entryMap = new Map();
									entryMap.put("RGW/router/interface",lan);
									entryMap.put("RGW/router/target",ip);
									entryMap.put("RGW/router/netmask",netmask);
									entryMap.put("RGW/router/gateway",gateway);
									var retXml = PostXml("router","add_static_routing",entryMap);
									if("OK" == $(retXml).find("setting_response").text()) {
											GetStaticRouteInfo();
											showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_static_route_title"), jQuery.i18n.prop("dialog_message_static_route_add_success"));
									} else {
											showMsgBox(jQuery.i18n.prop("dialog_message_static_route_title"), jQuery.i18n.prop("dialog_message_static_route_add_fail"));
									}
								},200)
                
            });
        }

        function GetStaticRouteInfo() {
            G_currentSR = '';
            G_SRlist = [];
            $("#tbodySR").empty();
            $("#DeleteAllIpEntry").prop("checked",false);
            $("#lt_SR_btnDeleteSR").hide();

            var retXml = PostXml("router","get_static_routing");

            var bFoundEntry = true;
            var idx = 1;
            while(bFoundEntry) {
                var entryIdx = "entry_" + idx;
                bFoundEntry = false;
                $(retXml).find(entryIdx).each(function() {
                    bFoundEntry = true;
                    var interface = $(this).find("interface").text();
                    var _interface;
                    if(interface=='lan'){
                        _interface = 'LAN';
                    }else if(interface=='wan'){
                        _interface = 'WAN';
                    }else if(interface=='gre_tunnel'){
											_interface = 'GRE';
										}

                    var ipAddr = $(this).find("target").text();
                    var netmask = $(this).find("netmask").text();
                    var gateway = $(this).find("gateway").text();

                    var SREntryInfo = interface + ";" + ipAddr + ";" + netmask + ";" + gateway ;
                    G_SRlist.push(SREntryInfo);
                    var htmlTxt = "<tr style='cursor: pointer;'name='" + SREntryInfo + "'><td>"
                                  + ipAddr + "</td><td>" + netmask + "</td><td>" + gateway + "</td><td>" + _interface + "</td><td><input type='checkbox'></td></tr>";
                    $("#tbodySR").append(htmlTxt);
                });
                ++idx;
                $("tbody tr:last td:lt(4)").click(function() {
                    var entryIdx = $(this).parents("tr").prevAll("tr").length;
                    ModifySREntry(entryIdx);
                });
            }

            $("#DeleteAllIpEntry").click(function() {
                if($(this).prop("checked")) {
                    $("tbody :checkbox").prop("checked",true);
                } else {
                	$("tbody :checkbox").prop("checked",false);
                }
                if($("tbody :checked").length>0) {
                    $("#lt_SR_btnDeleteSR").show();
                } else {
                    $("#lt_SR_btnDeleteSR").hide();
                }
            });

            $("tbody :checkbox").click(function() {
                if($("tbody :checked").length == $("tbody tr").length) {
                    $("#DeleteAllIpEntry").prop("checked",true);
                } else {
                    $("#DeleteAllIpEntry").prop("checked",false);
                }
                if($("tbody :checked").length>0) {
                    $("#lt_SR_btnDeleteSR").show();
                } else {
                    $("#lt_SR_btnDeleteSR").hide();
                }
            });
        }

        function ModifySREntry(entryIdx) {
            ShowSRConfigDlg();
            var SR_IpAddr = $("#divSR_IpAddr").ip_address("divSR_IpAddr");
            var SR_netmask = $("#divSR_netmask").ip_address("divSR_netmask");
            var SR_gateway = $("#divSR_gateway").ip_address("divSR_gateway");
            clearErrorInfo();
            var selector = "tbody tr:eq(" + entryIdx+ ")";
            var SREntryInfo = $(selector).attr("name").split(";");

            $('#selSR_interface').val(SREntryInfo[0]);
            SR_IpAddr.setIP(SREntryInfo[1]);
            SR_netmask.setIP(SREntryInfo[2]);
            SR_gateway.setIP(SREntryInfo[3]);

            $("#lt_btnSave").click(function() {
                var lan = $('#selSR_interface').val();
                var ip = SR_IpAddr.getIP();
                var netmask = SR_netmask.getIP();
                var gateway = SR_gateway.getIP();
                var validateMsg = ValidateSREntry(SR_IpAddr,SR_netmask,gateway);
                if("ok" != validateMsg) {
                    $("#SRSetError").show().text(validateMsg);
                    return;
                }

                if(SREntryInfo[0] == $('#selSR_interface').val() && SREntryInfo[1] == SR_IpAddr.getIP()
                   && SREntryInfo[2] == SR_netmask.getIP()&& SREntryInfo[3] == SR_gateway.getIP()) {
                    CloseDlg();
                    return;
                }
                var info = lan+";"+ip+";"+netmask+";"+gateway;
                var ret = isExixt(info,entryIdx);
                if(ret != 'ok'){
                    $("#SRSetError").show().text(ret);
                    return;
                }
                var entryMap = new Map();
                entryMap.put("RGW/router/interface",lan);
                entryMap.put("RGW/router/target",ip);
                entryMap.put("RGW/router/netmask",netmask);
                entryMap.put("RGW/router/gateway",gateway);
                entryMap.put("RGW/router/edit_static_routing_index",entryIdx+1);

                CloseDlg();
                var retXml = PostXml("router","edit_static_routing",entryMap);
                if("OK" == $(retXml).find("setting_response").text()) {
                    GetStaticRouteInfo();
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_static_route_title"), jQuery.i18n.prop("dialog_message_static_route_modify_success"));
                } else {
                    showMsgBox(jQuery.i18n.prop("dialog_message_static_route_title"), jQuery.i18n.prop("dialog_message_static_route_modify_fail"));
                }
            });
        }

        function isExixt(srInfo,index){
            if(index){
                for(var i = 0;i<G_SRlist.length;i++){
                    if(i!=index && srInfo == G_SRlist[i]){
                        return jQuery.i18n.prop("lt_staticRouterExist");
                    }
                }
            }else{
                for(var i = 0;i<G_SRlist.length;i++){
                    if(srInfo == G_SRlist[i]){
                        return jQuery.i18n.prop("lt_staticRouterExist");
                    }
                }
            }
            return "ok";
        }
        
				function ShowSRConfigDlg() {
            if(g_bodyWidth<=430){
									ShowDlg("divSRSetDlg","95%",300);
							}else{
									ShowDlg("divSRSetDlg",410,285);
							}
            $("[name='time']").keyup(function() {
                $("#SRSetError").hide();
                if($(this).val().length == 2) {
                    $(this).nextAll(":eq(1)").focus();
                }
            });
        }

        function ValidateSREntry(IPControl,maskControl,gateway) {

            if(!IPControl.validIPV4()) {
                return jQuery.i18n.prop("lt_netAddrFormatError");
            }

            if(!maskControl.validIPV4()){
                return jQuery.i18n.prop("lt_netmaskFormatError");
            }
						if(!IsIPv4(gateway)){
							return jQuery.i18n.prop("lt_gateWayAddrFormatError");
						}
            var firstGateway = gateway.substr(0,gateway.indexOf("."));
            var lastGateway = gateway.substr(gateway.lastIndexOf(".")+1);
            if("0.0.0.0" == gateway) {
                return jQuery.i18n.prop("lt_gateWayAddrFormatError");
            } else if(firstGateway>223 || firstGateway<1 || firstGateway == "127"){
                return jQuery.i18n.prop("lt_gateWayAddrFormatError");
            }else if(lastGateway == "255"){
                return jQuery.i18n.prop("lt_gateWayAddrFormatError");
            }

            return "ok";
        }
        
				return this;
    }
})(jQuery);





