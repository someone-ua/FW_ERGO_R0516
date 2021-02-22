var g_vpnTimer ;
var g_time = 0;
(function ($) {
    $.fn.objVPNManage = function (InIt) {
        var proto;
        var server;
        var username;
        var password;
// 		var authproto;
// 		var authmode;
		var g_grePeeraddr = '';
		var g_greIpaddr = '';
		var g_greNetmask = '';
        var greTunnel_remote_IP;
        var greTunnel_inner_IP;
        var remoteIP;
        var innerIP;
        var mode;
		var gIpCtrPeerAddr;
		var gIpCtrIPAddr;
		var gIpCtrNetmask;
		var g_configMap = new Map();
		var g_vpnStatus = '';
		
        this.onLoad = function () {
            LoadWebPage("html/router/vpn.html");
			$('#selVPNautoMode').change(function(){
				if($(this).val() =='0'){
					$('#pptpSelect').hide();
				}else{
					$('#pptpSelect').show();
				}
			});
			
			gIpCtrPeerAddr = $("#grePeeraddr").ip_address("GrePeer");
			gIpCtrIPAddr = $("#greIpaddr").ip_address("GreIP");
			gIpCtrNetmask = $("#greNetmask").ip_address("GreNetmask");
			
            $("#selVPNProtocolSwitch").change(function() {
                if("none"!=$(this).val() && $(this).val() != "gre") {
                    $("#divVPNInfo").show();
                    $("#divVPNInfo_gre").hide();
                    if (proto == $(this).val()) {
                    	$("#txtVPNServer").val(server);
                        $("#txtVPNUsername").val(username);
                        $("#txtVPNPassword").val(password);
                    } else {
                    	$("#txtVPNServer").val("");
                        $("#txtVPNUsername").val("");
                        $("#txtVPNPassword").val("");
                    }
                } else if($(this).val() == "gre"){
                	$("#divVPNInfo").hide();
                	$("#divVPNInfo_gre").show();
					gIpCtrPeerAddr.setIP(g_grePeeraddr);
					gIpCtrIPAddr.setIP(g_greIpaddr);
					gIpCtrNetmask.setIP(g_greNetmask);
                }else{
                    $("#divVPNInfo").hide();
                    $("#divVPNInfo_gre").hide();
                }
				if($(this).val() != 'none'){
					if(proto == $(this).val() && g_vpnStatus == '1'){
						$('#txt_connectStatus').text(jQuery.i18n.prop("lt_connected"));
					}else{
						$('#txt_connectStatus').text(jQuery.i18n.prop("lt_disconnected"));
					}
					$('#divVPNstatus').show();
				}else{
					$('#divVPNstatus').hide();
				}
            });
			
            clearErrorInfo();
            getVPNInfo();
        }

		function getVPNStatu(){
			g_time++;
			PostXmlAsync('router', 'router_get_vpn_status', null, function(retXml){
				if($(retXml).find('status').text() == 'UP'){
					g_vpnStatus = '1';
					clearTimeout(g_vpnTimer);
					$('#txt_connectStatus').text(jQuery.i18n.prop("lt_connected"));
				}else{
					clearTimeout(g_vpnTimer);
					if(g_time < 15){
						g_vpnTimer = setTimeout(function(){
							getVPNStatu();
						},2000);
					}else{
						$('#txt_connectStatus').text(jQuery.i18n.prop("lt_disconnected"));
					}
				}
			});
		}
        function getVPNInfo() {
        	$("#vpnSetErrorLogs").hide();
			var retXml = PostXmlNoShowWaitBox("router","router_get_vpn_info");
            proto = $(retXml).find("proto").text();
            server = $(retXml).find("server").text();
            username = $(retXml).find("username").text();
            password = $(retXml).find("password").text();
			g_grePeeraddr = $(retXml).find("peeraddr").text();
			g_greIpaddr = $(retXml).find("ipaddr").text();
			g_greNetmask = $(retXml).find("netmask").text();
            if(proto == "gretap"){
            	proto = "gre";
            }
        	$("#selVPNProtocolSwitch").val(proto);
            if("none" != proto && proto != "gre") {
                 $("#divVPNInfo").show();
                 $("#divVPNInfo_gre").hide();
                 $("#txtVPNServer").val(server);
                 $("#txtVPNUsername").val(username);
                 $("#txtVPNPassword").val(password);
             } else if(proto == "gre"){
				 $("#divVPNInfo").hide();
				 $("#divVPNInfo_gre").show();
				 gIpCtrPeerAddr.setIP(g_grePeeraddr);
				 gIpCtrIPAddr.setIP(g_greIpaddr);
				 gIpCtrNetmask.setIP(g_greNetmask);
            }else{
                 $("#divVPNInfo").hide();
                 $("#divVPNInfo_gre").hide();
             }
			 if("none" != proto){
				 $('#divVPNstatus').show();
				 $('#txt_connectStatus').text(jQuery.i18n.prop("lt_connecting"));
				 g_time = 0;
				 g_vpnStatus = 0;
				 if(g_vpnTimer){
					 clearTimeout(g_vpnTimer);
				 }
				 g_vpnTimer = setTimeout(function(){
					 getVPNStatu();
				 },2000);
				 
			 }else{
				 $('#divVPNstatus').hide();
			 }
        }
        
		function changeData(){
        	var changeData = false;
        	var type = $("#selVPNProtocolSwitch").val();
        	if(proto != type){
        		changeData = true;
				return changeData;
        	}
        	if(type == "gre"){
        		var peeraddr = gIpCtrPeerAddr.getIP();
        		var ipaddr = gIpCtrIPAddr.getIP();
        		var network = gIpCtrNetmask.getIP();
				if(peeraddr != g_grePeeraddr || ipaddr != g_greIpaddr || network != gIpCtrNetmask){
					changeData = true;
					return changeData;
				}
        	}else{
				if(server != $("#txtVPNServer").val() || $("#txtVPNUsername").val() != username || $("#txtVPNPassword").val() != password){
					changeData = true;
					return changeData;
				}
        	}
        	return changeData;
        }
        
		function checkCorrect(){
        	g_configMap.clear();
        	if ("none" != $("#selVPNProtocolSwitch").val() && $("#selVPNProtocolSwitch").val() != "gre") {
        		
        		if ("" == $("#txtVPNServer").val() || $("#txtVPNServer").val().trim().length <=0) {
        			$("#vpnSetErrorLogs").text(jQuery.i18n.prop("lvpn_server_IsEmpty"));
        			$("#vpnSetErrorLogs").show();
        			return false; 
        		}
        		if(isChineseChar($("#txtVPNServer").val())){
        			$("#vpnSetErrorLogs").text(jQuery.i18n.prop("lvpn_server_containChinese"));
        			$("#vpnSetErrorLogs").show();
        			return false; 
        		}
        		if ("" == $("#txtVPNUsername").val() || $("#txtVPNUsername").val().trim().length <=0) {
        			$("#vpnSetErrorLogs").text(jQuery.i18n.prop("lvpn_username_IsEmpty"));
        			$("#vpnSetErrorLogs").show();
        			return false; 
        		}
        		
        		if ("" == $("#txtVPNPassword").val() || $("#txtVPNPassword").val().trim().length <=0) {
        			$("#vpnSetErrorLogs").text(jQuery.i18n.prop("lvpn_password_IsEmpty"));
        			$("#vpnSetErrorLogs").show();
        			return false; 
        		}
        		g_configMap.put("RGW/router/proto",$("#selVPNProtocolSwitch").val());
        		g_configMap.put("RGW/router/server",$("#txtVPNServer").val());
        		g_configMap.put("RGW/router/username",$("#txtVPNUsername").val());
        		g_configMap.put("RGW/router/password",$("#txtVPNPassword").val());
        	}else if($("#selVPNProtocolSwitch").val() == "gre"){
				var peeraddr = gIpCtrPeerAddr.getIP();
				var ipaddr = gIpCtrIPAddr.getIP();
				var netmask = gIpCtrNetmask.getIP();
				if(!IsIPv4(peeraddr) || !IsIPv4(ipaddr)){
					$("#vpnSetErrorLogs").text(jQuery.i18n.prop("lt_ipAddrFormatError"));
					$("#vpnSetErrorLogs").show();
					return false; 
				}
				if(!IsIPv4(netmask)){
					$("#vpnSetErrorLogs").text(jQuery.i18n.prop("lt_netmaskFormatError"));
					$("#vpnSetErrorLogs").show();
					return false; 
				}
        		g_configMap.put("RGW/router/proto",$("#selVPNProtocolSwitch").val());
        		g_configMap.put("RGW/router/peeraddr",peeraddr);
        		g_configMap.put("RGW/router/ipaddr",ipaddr);
        		g_configMap.put("RGW/router/netmask",netmask);
        	}else{
        		g_configMap.put("RGW/router/proto",$("#selVPNProtocolSwitch").val());
        	}
			return  true;
        }
        	
		this.SaveData = function() {
			clearTimeout(g_vpnTimer);
			if(checkCorrect()){
				if(changeData()){
					ShowDlg("PleaseWait", 200, 130);
					$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
					setTimeout(function(){
						var retXml = PostXml("router","router_set_vpn", g_configMap);
						if($(retXml).find('setting_response').text() == 'OK'){
							showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_vpn_setting_title"), jQuery.i18n.prop("dialog_message_vpn_setting_success"));
							getVPNInfo();
						}
					},200);
				}
			}
		}
        
		return this;
    }
})(jQuery);

