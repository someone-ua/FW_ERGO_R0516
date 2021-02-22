var g_dhcp_lan_ip = ''; //reboot of IP
(function($) {
	$.fn.objDHCPSettings = function(InIt) {
		g_dhcp_lan_ip = '';
		var gRouterObjPath = "router";
		var gSubnetMask;
		var gIpCtrlDhcpStartAddr;
		var gIpCtrlDhcpEndAddr;
		var gIpCtrlDhcpGateway;
		var gIpCtrlDhcpClientStaticIpAddr;
		var gMacCtrlDhcpClientMacAddr;
		var gFixedIpXml;

		var gLanIpAddr = '';
		var gLanSubMask = '';
		var gDhcpCurConfig = new Map;
		var gDhcpConfug = new Map;
		var gIPconfig = new Map;
		var g_staticIP_num = 0;
		this.onLoad = function(flag) {
			gDhcpConfug.clear();
			gIPconfig.clear();
			if (flag) {
				LoadWebPage("html/homeNetwork/dhcp_settings.html");
				gSubnetMask = $("#ipCtrlDhcpNetmask").ip_address("DhcpSubnet");
				gIpCtrlDhcpStartAddr = $("#ipCtrlDhcpStartAddr").ip_address("DhcpStartAddr");
				gIpCtrlDhcpEndAddr = $("#ipCtrlDhcpEndAddr").ip_address("DhcpEndAddr");
				gIpCtrlDhcpGateway = $("#ipCtrlDhcpGateway").ip_address("DhcpGateWay");
				$("#ipCtrlDhcpStaticIp").empty();
				$("#macCtrlClientMacAddr").empty();
				if ($("#ipCtrlDhcpStaticIp").html() == "") {
					gIpCtrlDhcpClientStaticIpAddr = $("#ipCtrlDhcpStaticIp").ip_address("DhcpStaticIp");
				}
				if ($("#macCtrlClientMacAddr").html() == "") {
					gMacCtrlDhcpClientMacAddr = $("#macCtrlClientMacAddr").mac_address("DhcpStaticIp");
				}

				$("#SelDhcpServerSwitch").change(function() {
					if ("1" == $(this).val()) {
						$("#divDhcpInfo").hide();
					} else {
						$("#divDhcpInfo").show();
					}
				});

				$("#lt_dhcp_btnAddStaticIp").click(function() {
					AddStaticIp();
					if (!$("#ipCtrlDhcpStaticIp").html()) {
						gIpCtrlDhcpClientStaticIpAddr = $("#ipCtrlDhcpStaticIp").ip_address("DhcpStaticIp");
					}
					if (!$("#macCtrlClientMacAddr").html()) {
						gMacCtrlDhcpClientMacAddr = $("#macCtrlClientMacAddr").mac_address("DhcpStaticIp");
					}
					clearErrorInfo();
				});

				$("#lt_dhcp_btnDeleteStaticIp").click(function() {
					DelStaticIpEntry();
				});

				$("#txtDhcpIpAddr2,#txtDhcpIpAddr3").click(function() {
					$("#dhcpSetErrorLogs").hide();
				});
				clearErrorInfo();

			} //end flag
			GetLanIp();
			GetDhcpConfig();
			GetDhcpStaticIp();
		}

		this.SaveData = function() {
			if (validateLanIPAndDHCPConfig()) {
				var changedDhcp = validataChangeDhcp();
				if (changedDhcp) {
					SetDhcpConfig();
				}
			}
		}

		function validateLanIPAndDHCPConfig() {
			var ip2 = $("#txtDhcpIpAddr2").val();
			var ip3 = $("#txtDhcpIpAddr3").val();
			var lanIp = "192.168." + ip2 + "." + ip3;
			if (!IsIPv4(lanIp)) {
				$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lt_ipAddrFormatError"));
				$("#dhcpSetErrorLogs").show();
				return false;
			}
			if (ip3 == "255" || ip3 == "0") {
				$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lt_ipAddrLastFormatError"));
				$("#dhcpSetErrorLogs").show();
				return false;
			}
			if($('#SelDhcpServerSwitch').val()=='0'){  //enable
				var subnetMask = gSubnetMask.getIP();
				if(!checkSubMask(subnetMask)){
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("dialog_message_mask_error"));
					$("#dhcpSetErrorLogs").show();
					return false;
				}
				
				var startIP = gIpCtrlDhcpStartAddr.getIP();
				var endIP = gIpCtrlDhcpEndAddr.getIP();
				if(startIP == lanIp || endIP == lanIp){
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lt_StartEndRangeError")).show();
					return false;
				}
				var startIPArr = startIP.split('.');
				var endIPArr = endIP.split('.');

				if (parseInt(startIPArr[3]) <= 1) {
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lDhcpStartAddrError"));
					$("#dhcpSetErrorLogs").show();
					return;
				}
									
				var startBin = fillZero(parseInt(startIPArr[0]).toString(2)) + fillZero(parseInt(startIPArr[1]).toString(2)) + fillZero(parseInt(startIPArr[2]).toString(2)) + fillZero(parseInt(startIPArr[3]).toString(2));
				var endBin = fillZero(parseInt(endIPArr[0]).toString(2)) + fillZero(parseInt(endIPArr[1]).toString(2)) + fillZero(parseInt(endIPArr[2]).toString(2)) + fillZero(parseInt(endIPArr[3]).toString(2));
				if(startBin>=endBin){
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lDhcpAddrRangeError")).show();
					return false;
				}
				var maskArr = subnetMask.split('.');
				var maskBin = fillZero(parseInt(maskArr[0]).toString(2)) + fillZero(parseInt(maskArr[1]).toString(2)) + fillZero(parseInt(maskArr[2]).toString(2)) + fillZero(parseInt(maskArr[3]).toString(2));
				var num = 0;
				for(var k=0;k<maskBin.length;k++){
					if(maskBin[k] == '1'){
						num++;
					}else{
						break;
					}
				}
				var ipBin = fillZero(parseInt(192).toString(2)) + fillZero(parseInt(168).toString(2))+fillZero(parseInt(ip2).toString(2)) + fillZero(parseInt(ip3).toString(2));
				var fixIP = ipBin.substring(0,num);
				var fillNum = 32-num;
				var start = fixIP;
				var end = fixIP;
				while(fillNum){
					fillNum--;
					start+='0';
					end+='1';
				}
				var startValue = BinaryToIP(start);
				var endValue = BinaryToIP(end);
				if(startBin>end || startBin<start){
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lDhcpStartRangeError")+ startValue +' - ' + endValue).show();
					return false;
				}
				if(endBin>end || endBin<start){
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lDhcpEndRangeError")+ startValue +' - ' + endValue).show();
					return false;
				}
				if(ipBin>=startBin && ipBin<=endBin){
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lt_ipAddrRangeError")).show();
					return false;
				}
				
				var bIpInValid = false;
				if (!bIpInValid) {
					bIpInValid = !gIpCtrlDhcpStartAddr.validIPV4();
				}
				if (!bIpInValid) {
					bIpInValid = !gIpCtrlDhcpEndAddr.validIPV4();
				}
				if (bIpInValid) {
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lt_dhcpAddrFormatError"));
					$("#dhcpSetErrorLogs").show();
					return false;
				}
				if (!bIpInValid) {
					var gateway = gIpCtrlDhcpGateway.getIP();
					var firstGateway = gateway.substr(0, gateway.indexOf("."));
					var lastGateway = gateway.substr(gateway.lastIndexOf(".") + 1);
					if ("..." == gateway) {
						gateway = "disable";
					} else if ("0.0.0.0" == gateway) {
						bIpInValid = true;
					} else if (firstGateway > 223 || firstGateway < 1 || firstGateway == "127") {
						bIpInValid = true;
					} else if (lastGateway == "255") {
						bIpInValid = true;
					} else {
						bIpInValid = !gIpCtrlDhcpGateway.validIPV4();
					}
				}
				if (bIpInValid) {
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lt_gateWayAddrFormatError"));
					$("#dhcpSetErrorLogs").show();
					return false;
				}

				if (parseInt(gIpCtrlDhcpStartAddr.getIP().split(".")[3]) >= parseInt(gIpCtrlDhcpEndAddr.getIP().split(".")[3])) {
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lDhcpAddrRangeError"));
					$("#dhcpSetErrorLogs").show();
					return false;
				}

				if (parseInt(gIpCtrlDhcpStartAddr.getIP().split(".")[3]) <= 1) {
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lDhcpStartAddrError"));
					$("#dhcpSetErrorLogs").show();
					return false;
				}

				if (!IsInteger(document.getElementById('txtDhcpLeaseTime').value) || document.getElementById('txtDhcpLeaseTime').value <= 0 ||
					$("#txtDhcpLeaseTime").val().indexOf("0") == 0 || document.getElementById('txtDhcpLeaseTime').value > 10800) {
					$("#dhcpSetErrorLogs").text(jQuery.i18n.prop("lErrorNumber2"));
					$("#dhcpSetErrorLogs").show();
					return false;
				}
				
			}
			
			return true;
		}
		function BinaryToIP(bin){
			var first = parseInt(bin.substring(0,8),2);
			var sec = parseInt(bin.substring(8,16),2);
			var thrid = parseInt(bin.substring(16,24),2);
			var four = parseInt(bin.substring(24,32),2);
			return first+'.'+sec+'.'+thrid+'.'+four;
		}
		function GetLanIp() {
			gLanIpAddr = '';
			gLanSubMask = '';
            var retXml = PostXml(gRouterObjPath,"router_get_lan_ip");
            gLanIpAddr = $(retXml).find("lan_ip").text();
            var ipArr = gLanIpAddr.split(".");
            $('#txtDhcpIpAddr2').val(ipArr[2]);
            $('#txtDhcpIpAddr3').val(ipArr[3]);
            gLanSubMask = $(retXml).find("lan_netmask").text();
            gSubnetMask.setIP(gLanSubMask);
        }
		function GetDhcpConfig() {
			var retXml = PostXml(gRouterObjPath, "router_get_dhcp_settings",null,'','noWait');
			var dhcpServerDisabled = $(retXml).find("disabled").text();
			$("#SelDhcpServerSwitch").val(dhcpServerDisabled);

			if (1 == dhcpServerDisabled) {
				$("#divDhcpInfo").hide();
			} else {
				$("#divDhcpInfo").show();
			}

			var leasetime = $(retXml).find("leasetime").text();
			var leaseTimeValue = leasetime.substr(0, leasetime.length - 1);
			var leaseTimeUnit = leasetime.substr(leasetime.length - 1, 1);
			if ("h" == leaseTimeUnit) {
				leaseTimeValue = parseInt(leaseTimeValue) * 60;
			} else if ("m" == leaseTimeUnit) {
				leaseTimeValue = parseInt(leaseTimeValue);
			} else {
				leaseTimeValue = parseInt(parseFloat(leasetime) / 60);
			}
			$("#txtDhcpLeaseTime").val(leaseTimeValue);

			var start_ip = $(retXml).find("start_ip").text();
			var end_ip = $(retXml).find("end_ip").text();			
			gIpCtrlDhcpStartAddr.setIP(start_ip);
			gIpCtrlDhcpEndAddr.setIP(end_ip);
			var gateway = $(retXml).find("option_gateway").text();
			if ("disable" == gateway) {
				gIpCtrlDhcpGateway.setIP("");
			} else {
				gIpCtrlDhcpGateway.setIP(gateway);
			}

			gDhcpCurConfig.clear();
			gDhcpCurConfig.put("RGW/dhcp/disabled", dhcpServerDisabled);
			gDhcpCurConfig.put("RGW/dhcp/leasetime", leaseTimeValue*60);
			gDhcpCurConfig.put("RGW/dhcp/start_ip", start_ip);
			gDhcpCurConfig.put("RGW/dhcp/end_ip", end_ip);
			gDhcpCurConfig.put("RGW/dhcp/option_gateway", gateway==''?'disable':gateway);

		}

		function validataChangeDhcp() {
			clearDhcpSetErrorLogs();
			gIPconfig.clear();
			gDhcpConfug.clear();
			var flag = false;
			var ip2 = $("#txtDhcpIpAddr2").val();
			var ip3 = $("#txtDhcpIpAddr3").val();
			var lanIp = "192.168." + ip2 + "." + ip3;
			g_dhcp_lan_ip = lanIp;
			if (gLanIpAddr != lanIp) {
				flag = true;
				gIPconfig.clear();
				gIPconfig.put("RGW/dhcp/lan_ip", lanIp);
				gIPconfig.put("RGW/dhcp/lan_netmask", gLanSubMask);
			}
			
			var SelDhcpServerSwitch = $("#SelDhcpServerSwitch").val();
			if (SelDhcpServerSwitch != gDhcpCurConfig.get("RGW/dhcp/disabled")) {
				flag = true;
				gDhcpConfug.put("RGW/dhcp/disabled", SelDhcpServerSwitch);
			}
			if (SelDhcpServerSwitch == '1') {  //disabled
				return flag;
			}
			
			var submask = gSubnetMask.getIP();
			if(submask != gLanSubMask){
				flag = true;
				gIPconfig.clear();
				gIPconfig.put("RGW/dhcp/lan_ip", lanIp);
				gIPconfig.put("RGW/dhcp/lan_netmask", submask);
			}
			var leaseTimeValue = parseFloat($("#txtDhcpLeaseTime").val())*60;
			var startAddr = gIpCtrlDhcpStartAddr.getIP();
			var endAddr = gIpCtrlDhcpEndAddr.getIP();
			var dhcpGateWay = gIpCtrlDhcpGateway.getIP();
			if (leaseTimeValue != gDhcpCurConfig.get("RGW/dhcp/leasetime")) {
				flag = true;
				gDhcpConfug.put("RGW/dhcp/leasetime", leaseTimeValue);
			} 
			if (startAddr != gDhcpCurConfig.get("RGW/dhcp/start_ip")) {
				flag = true;
				gDhcpConfug.put("RGW/dhcp/start_ip", startAddr);
			}
			if (endAddr != gDhcpCurConfig.get("RGW/dhcp/end_ip")) {
				flag = true;
				gDhcpConfug.put("RGW/dhcp/end_ip", endAddr);
			}
			if (dhcpGateWay == "...") {
				dhcpGateWay = "disable";
			}
			if (dhcpGateWay != gDhcpCurConfig.get("RGW/dhcp/option_gateway")) {
				flag = true;
				gDhcpConfug.put("RGW/dhcp/option_gateway", dhcpGateWay);
			}
			return flag;
		}

		function SetDhcpConfig() {
			clearDhcpSetErrorLogs();
			if(gIPconfig.size()>0){
				ShowDlg('setDHCPConfirm', 400, 100);
				$("#lSetDHCP").text(jQuery.i18n.prop("changeDHCP"));
				$("#lt_btnOK").click(function() {
					ShowDlg("PleaseWait", 300, 150);
					$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
					var dhcpTimer = setTimeout(function() {
						if (gDhcpConfug.size() >0) {
							var result_dhcp = setDHCPAPIs("router_set_dhcp_settings",gDhcpConfug);
							if(result_dhcp){GetDhcpConfig();}
						}
						var result_ip = setDHCPAPIs("web_set_lan_ip",gIPconfig);
						if(result_ip){
							$("#lPleaseWait").text(jQuery.i18n.prop("dns_reboot"));
							PostXml("router","router_call_reboot");
							if(dhcpTimer){
								clearTimeout(dhcpTimer);
							}
							dhcpTimer = setInterval(function(){CloseDlg();clearInterval(dhcpTimer);clearAuthheader(g_dhcp_lan_ip);}, 45000);
						}else{
							showMsgBox(jQuery.i18n.prop("lt_dhcp_title"), jQuery.i18n.prop("lt_fail"));
						}
					}, 100);				
					
				});
				//if click cancel btn then deault the old value
				$("#lt_btnCancel").click(function() {
					$("#txtDhcpIpAddr2").val(gLanIpAddr.split(".")[2]);
					$("#txtDhcpIpAddr3").val(gLanIpAddr.split(".")[3]);

					var dhcpServerDisabled = gDhcpCurConfig.get("RGW/dhcp/disabled");
					$("#SelDhcpServerSwitch").val(dhcpServerDisabled);

					if (1 == dhcpServerDisabled) {
						$("#divDhcpInfo").hide();
					} else {
						$("#divDhcpInfo").show();
					}
					gSubnetMask.setIP(gLanSubMask);
					var leaseTimeValue = gDhcpCurConfig.get("RGW/dhcp/leasetime");
					$("#txtDhcpLeaseTime").val(parseInt(leaseTimeValue)/60);

					var start_ip = gDhcpCurConfig.get("RGW/dhcp/start_ip");
					var end_ip = gDhcpCurConfig.get("RGW/dhcp/end_ip")
					gIpCtrlDhcpStartAddr.setIP(start_ip);
					gIpCtrlDhcpEndAddr.setIP(end_ip);
					var gateway = gDhcpCurConfig.get("RGW/dhcp/option_gateway");
					if ("disable" == gateway) {
						gIpCtrlDhcpGateway.setIP("");
					} else {
						gIpCtrlDhcpGateway.setIP(gateway);
					}
				});
			}else{
				if (gDhcpConfug.size() == 0) {
					return false;
				}
				if(setDHCPAPIs("router_set_dhcp_settings",gDhcpConfug)){
					var changeKeys = gDhcpConfug.keys();
					for(var i=0;i<changeKeys.length;i++){
						gDhcpCurConfig.remove(changeKeys[i]);
						gDhcpCurConfig.put(changeKeys[i],gDhcpConfug.get(changeKeys[i]));
					}
					showMsgBoxAutoClose(jQuery.i18n.prop("lt_dhcp_title"), jQuery.i18n.prop("lt_succ"));
				}else{
					showMsgBox(jQuery.i18n.prop("lt_dhcp_title"), jQuery.i18n.prop("lt_fail"));
				}
			}
			
		}
		function setDHCPAPIs(apiname,configMap){
			var retXml = PostXml("router",apiname,configMap,'','noWait');
			if("OK" != $(retXml).find("setting_response").text()){
				return false;
			}else{
				return true;
			}
		}
		function validDHCPData() {
			var dhcpServer = $("#SelDhcpServerSwitch").val();
			var leaseTimeValue = parseFloat($("#txtDhcpLeaseTime").val())*60;
			var startAddr = gIpCtrlDhcpStartAddr.getIP();
			var endAddr = gIpCtrlDhcpEndAddr.getIP();
			var dhcpGateWay = gIpCtrlDhcpGateway.getIP();

			if (dhcpServer != gDhcpCurConfig.get("RGW/dhcp/disabled")) {
				return true;
			}
			if (leaseTimeValue != gDhcpCurConfig.get("RGW/dhcp/leasetime")) {
				return true;
			}
			if (startAddr != gDhcpCurConfig.get("RGW/dhcp/start_ip")) {
				return true;
			}
			if (endAddr != gDhcpCurConfig.get("RGW/dhcp/end_ip")) {
				return true;
			}
			if (dhcpGateWay == "...") {
				dhcpGateWay = "";
			}
			if (dhcpGateWay != gDhcpCurConfig.get("RGW/dhcp/option_gateway")) {
				return true;
			}

			return false;
		}

		function GetDhcpStaticIp() {
			g_staticIP_num = 0;
			$("#tbodyDhcpStaticIp").empty();
			$("#DeleteAllIpEntry").prop("checked", false);
			$("#lt_dhcp_btnDeleteStaticIp").hide();

			var retXml = PostXml(gRouterObjPath, "dhcp_get_fixed_ip");
			gFixedIpXml = retXml;

			var bFoundEntry = true;
			var idx = 1;
			while (bFoundEntry) {
				var entryIdx = "entry_" + idx;
				bFoundEntry = false;
				$(retXml).find(entryIdx).each(function() {
					bFoundEntry = true;
					g_staticIP_num++;
					var ip = $(this).find("ip").text();
					var mac = $(this).find("mac").text();
					var name = $(this).find("name").text();
					var EntryInfo = name + ";" + mac + ";" + ip;


					var htmlTxt = "<tr style='cursor: pointer;'name='" + EntryInfo + "'><td>" + name + "</td><td>" +
						mac + "</td><td>" + ip + "</td> <td><input type='checkbox'></td></tr>";
					$("#tbodyDhcpStaticIp").append(htmlTxt);
				});
				++idx;
				$("tbody tr:last td:lt(3)").click(function() {
					var entryIdx = $(this).parents("tr").prevAll("tr").length;
					ModifyStaticIpEntry(entryIdx);
				});
			}

			$("#DeleteAllIpEntry").click(function() {
				if ($(this).prop("checked")) {
					$("tbody :checkbox").prop("checked", true);
				} else {
					$("tbody :checkbox").prop("checked", false);
				}
				if ($("tbody :checked").length > 0) {
					$("#lt_dhcp_btnDeleteStaticIp").show();
				} else {
					$("#lt_dhcp_btnDeleteStaticIp").hide();
				}
			});

			$("tbody :checkbox").click(function() {
				if ($("tbody :checked").length == $("tbody tr").length) {
					$("#DeleteAllIpEntry").prop("checked", true);
				} else {
					$("#DeleteAllIpEntry").prop("checked", false);
				}
				if ($("tbody :checked").length > 0) {
					$("#lt_dhcp_btnDeleteStaticIp").show();
				} else {
					$("#lt_dhcp_btnDeleteStaticIp").hide();
				}
			});
		}

		function DelStaticIpEntry() {
			var entryIdxList = "";
			$("tbody tr td :checked").each(function() {
				var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
				entryIdxList = entryIdxList + entryIdx + ",";
			});

			if ("" == entryIdxList) {
				return;
			}

			var entryMap = new Map();
			entryMap.put("RGW/dhcp/del_fixed_ip_index", entryIdxList);
			var retXml = PostXml(gRouterObjPath, "dhcp_delete_fixed_ip", entryMap);
			if ("OK" == $(retXml).find("setting_response").text()) {
				GetDhcpStaticIp();
				showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_delete_static_ip_success"));
			} else {
				//                alert("dhcp_delete_fixed_ip failed.");
				showMsgBox(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_delete_static_ip_fail"));
			}
		}

		function ModifyStaticIpEntry(entryIdx) {
			if (g_bodyWidth < 430) {
				ShowDlg("MBStaticIpDlg", '95%', 270);
			} else {
				ShowDlg("MBStaticIpDlg", 440, 220);
			}
			if (!$("#ipCtrlDhcpStaticIp").html()) {
				gIpCtrlDhcpClientStaticIpAddr = $("#ipCtrlDhcpStaticIp").ip_address("DhcpStaticIp");
			}
			if (!$("#macCtrlClientMacAddr").html()) {
				gMacCtrlDhcpClientMacAddr = $("#macCtrlClientMacAddr").mac_address("DhcpStaticIp");
			}
			$("input").click(function() {
				$("#lPortTriggerSetError").hide();
			});

			var entryId = entryIdx + 1;
			var selector = "tbody tr:eq(" + entryIdx + ")";
			var EntryInfo = $(selector).children()
			$("#txtClientName").val($(EntryInfo[0]).text());
			gMacCtrlDhcpClientMacAddr.setMacAddr($(EntryInfo[1]).text());
			gIpCtrlDhcpClientStaticIpAddr.setIP($(EntryInfo[2]).text());

			$("#lt_btnSave").click(function() {

				if (!ValidateStaticIpSet()) {
					return;
				}
				if (!checkIPScope()) { //update
					return;
				}
				if (!ValidateStaticIpIsNotExistExclude($(EntryInfo[2]).text(), $(EntryInfo[1]).text())) {
					return;
				}

				if ($(EntryInfo[0]).text() == $("#txtClientName").val() &&
					$(EntryInfo[1]).text() == gMacCtrlDhcpClientMacAddr.getMacAddr() &&
					$(EntryInfo[2]).text() == gIpCtrlDhcpClientStaticIpAddr.getIP()) {
					$("#lStaticIpSetError").show();
					$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_no_data_change"));
					return;
				}

				var preTag = "RGW/dhcp/fixed_ip_list/entry_" + entryId;
				var entryMap = new Map();
				entryMap.put(preTag + "/name", $("#txtClientName").val());
				entryMap.put(preTag + "/ip", gIpCtrlDhcpClientStaticIpAddr.getIP());
				entryMap.put(preTag + "/mac", gMacCtrlDhcpClientMacAddr.getMacAddr().toLowerCase());

				CloseDlg();
				var retXml = PostXml(gRouterObjPath, "dhcp_edit_fixed_ip", entryMap);
				if ("OK" == $(retXml).find("setting_response").text()) {
					GetDhcpStaticIp();
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_modify_static_ip_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_modify_static_ip_fail"));
				}
			});
		}

		function AddStaticIp() {
			if(g_staticIP_num>=16){
				showMsgBox(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_add_static_ip_length"));
				return;
			}
			if (g_bodyWidth < 430) {
				ShowDlg("MBStaticIpDlg", '95%', 270);
			} else {
				ShowDlg("MBStaticIpDlg", 440, 220);
			}
			$("#lt_btnSave").click(function() {
				if (!ValidateStaticIpSet()) {
					return;
				}
				if (!checkIPScope()) {
					return;
				}
				if (!ValidateStaticIpIsNotExist()) {
					return;
				}

				var entryId = $("tbody tr").size() + 1;
				var preTag = "RGW/dhcp/fixed_ip_list/entry_" + entryId;
				var entryMap = new Map();
				entryMap.put(preTag + "/name", $("#txtClientName").val());
				entryMap.put(preTag + "/ip", gIpCtrlDhcpClientStaticIpAddr.getIP());
				entryMap.put(preTag + "/mac", gMacCtrlDhcpClientMacAddr.getMacAddr().toLowerCase());

				CloseDlg();
				var retXml = PostXml(gRouterObjPath, "dhcp_add_fixed_ip", entryMap);
				if ("OK" == $(retXml).find("setting_response").text()) {
					GetDhcpStaticIp();
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_add_static_ip_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_dhcp_title"), jQuery.i18n.prop("dialog_message_dhcp_add_static_ip_fail"));
				}
			});
		}

		function ValidateStaticIpSet() {
			var ip2 = $("#txtDhcpIpAddr2").val();
			var ip3 = $("#txtDhcpIpAddr3").val();
			var lanIp = "192.168." + ip2 + "." + ip3;
			var newStaticIP = gIpCtrlDhcpClientStaticIpAddr.getIP();
			if (lanIp == newStaticIP) {
				$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_ipAddrRepeatedWithLanIP")).show();
				return false;
			}
			if (!gIpCtrlDhcpClientStaticIpAddr.validIPV4()) {
				$("#lStaticIpSetError").show();
				$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_ipAddrFormatError"));
				return false;
			}

			if (!gMacCtrlDhcpClientMacAddr.validMacAddr()) {
				$("#lStaticIpSetError").show();
				$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_MacAddrFormatError"));
				return false;
			}

			if (!/^[0-9a-zA-Z]{1,30}$/.test($("#txtClientName").val())) {
				$("#lStaticIpSetError").show();
				$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_RuleNameError"));
				return false;
			}
			return true;
		}

		function checkIPScope() {
			var ipArr = gIpCtrlDhcpClientStaticIpAddr.getIP().split(".");
			var startIps = [];
			var endIps = [];
			var flag = false;
			$("#ipCtrlDhcpStartAddr input").each(function() {
				startIps.push($(this).val());
			});
			$("#ipCtrlDhcpEndAddr input").each(function() {
				endIps.push($(this).val());
			});
			for (var i = 0; i < startIps.length; i++) {
				if (i == startIps.length - 1) {
					if (ipArr[i] * 1 < startIps[i] * 1 || ipArr[i] * 1 > endIps[i] * 1) {
						flag = true;
						break
					}
				} else if (ipArr[i] != startIps[i]) {
					flag = true;
					break;
				}
			}
			if (flag) {
				$("#lStaticIpSetError").show();
				$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_ipAddrBeyondError"));
				return false;
			}
			return true;
		}

		function ValidateStaticIpIsNotExist() {
			if (undefined != gFixedIpXml && "" != gFixedIpXml) {
				var bFoundEntry = true;
				var isIpExist = false;
				var isMacExist = false;
				var idx = 1;
				while (bFoundEntry) {
					if (isIpExist || isMacExist) {
						return false;
					}
					var entryIdx = "entry_" + idx;
					bFoundEntry = false;
					$(gFixedIpXml).find(entryIdx).each(function() {
						bFoundEntry = true;
						var ip = $(this).find("ip").text();
						var mac = $(this).find("mac").text();
						var name = $(this).find("name").text();
						if (gIpCtrlDhcpClientStaticIpAddr.getIP() == ip) {
							$("#lStaticIpSetError").show();
							$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_ipAddrIsExist"));
							isIpExist = true;
							return;
						}

						if (gMacCtrlDhcpClientMacAddr.getMacAddr() == mac) {
							$("#lStaticIpSetError").show();
							$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_MacAddrIsExist"));
							isMacExist = true;
							return;
						}
					});
					++idx;
				}
			}
			return true;
		}

		function ValidateStaticIpIsNotExistExclude(excludeIp, excludeMac) {
			if (undefined != gFixedIpXml && "" != gFixedIpXml) {
				var bFoundEntry = true;
				var isIpExist = false;
				var isMacExist = false;
				var idx = 1;
				while (bFoundEntry) {
					if (isIpExist || isMacExist) {
						return false;
					}
					var entryIdx = "entry_" + idx;
					bFoundEntry = false;
					$(gFixedIpXml).find(entryIdx).each(function() {
						bFoundEntry = true;
						var ip = $(this).find("ip").text();
						var mac = $(this).find("mac").text();
						var name = $(this).find("name").text();
						if (gIpCtrlDhcpClientStaticIpAddr.getIP() == ip && excludeIp != ip) {
							$("#lStaticIpSetError").show();
							$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_ipAddrIsExist"));
							isIpExist = true;
							return;
						}

						if (gMacCtrlDhcpClientMacAddr.getMacAddr() == mac && excludeMac != mac) {
							$("#lStaticIpSetError").show();
							$("#lStaticIpSetError").text(jQuery.i18n.prop("lt_MacAddrIsExist"));
							isMacExist = true;
							return;
						}
					});
					++idx;
				}
			}
			return true;
		}
		function checkSubMask(mask){
			if(mask == '255.255.255.255' || mask == '0.0.0.0'){
				return false;
			}
			var maskArr = mask.split('.');
			var maskBin = fillZero(parseInt(maskArr[0]).toString(2)) + fillZero(parseInt(maskArr[1]).toString(2)) + fillZero(parseInt(maskArr[2]).toString(2)) + fillZero(parseInt(maskArr[3]).toString(2));
			if(maskBin.indexOf('01')>(-1)){
				return false;
			}
			return true;
		}
		function fillZero(str){
            var len = str.length;
            for(var i=0;i<8-len;i++){
                str = '0'+str;
            }
            return str;
        }
		return this;
	}
})(jQuery);

function dhcpIpAddrChange(index) {
	$("#DhcpStartAddrIPAddr" + index).val($("#txtDhcpIpAddr" + index).val());
	$("#DhcpEndAddrIPAddr" + index).val($("#txtDhcpIpAddr" + index).val());
}

function clearDhcpSetErrorLogs() {
	$("#dhcpSetErrorLogs").text("");
	$("#dhcpSetErrorLogs").hide();
}
