(function($){
	$.fn.objDNSSettings = function(InIt) {
		var gIpCtrlDNSPrimaryDNS;
		var gIpCtrlDNSStandbyDNS;
		var gCurDnsArr = [];
		this.onLoad = function(flag){
			if(flag){
				LoadWebPage("html/homeNetwork/dns_settings.html");
			
				gIpCtrlDNSPrimaryDNS = $("#ipCtrlDNSPrimaryDNS").ip_address("DnsPrimaryDNS");
				gIpCtrlDNSSecondaryDNS = $("#ipCtrlDNSSecondaryDNS").ip_address("DnsSecondaryDNS");
				
				$('input[type="text"]').focus(function(){
					$("#dns_error").hide();
				});
			}
			getDNSConfig();
		}
		this.SaveData = function(){
			var dns1 = gIpCtrlDNSPrimaryDNS.getIP();
			var dns2 = gIpCtrlDNSSecondaryDNS.getIP();
			 if("..." == dns1) {
			 		dns1 = "disable";
			 }
			 if("..." == dns2) {
			 		dns2 = "disable";
			 }
			 if(dns1==gCurDnsArr[0] && dns2==gCurDnsArr[1]){
				return;
			 }
			 if(dns1=="disable" && dns2 != "disable"){
				 $("#dns_error").text(jQuery.i18n.prop("lt_pDNScannotbenone"));
				 $("#dns_error").show();
				 return;
			 }
			 if((dns1 != "disable" && (!gIpCtrlDNSPrimaryDNS.validIPV4() || !firstValueDNS(dns1))) || (dns2 != "disable" && (!gIpCtrlDNSSecondaryDNS.validIPV4() || !firstValueDNS(dns2)))){
				 $("#dns_error").text(jQuery.i18n.prop("lt_DNSAddrFormatError"));
				 $("#dns_error").show();
				 return;
			 }
			 if(g_bodyWidth>430){
			 	ShowDlg('setDNSConfirm', 400, 100);
			 }else{
			 	ShowDlg('setDNSConfirm', '95%', 100);
			 }
			 $("#lSetDNS").text(jQuery.i18n.prop("changeDHCP"));
			 $('#lt_btnOK').click(function(){
			 	var dnsConfig = new Map();
			 	var optionDns = dns1+','+dns2;
			 	if(dns1=="disable" && dns2 == "disable"){
			 		optionDns = 'disable';
			 	}
			 	dnsConfig.put("RGW/dns/option_dns",optionDns);
			 	ShowDlg("PleaseWait", 200, 130);
			 	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			 	var dnsTimer = setTimeout(function(){
			 			var retXml = PostXml("router","router_set_dns",dnsConfig);
			 			if("OK" == $(retXml).find("setting_response").text()){
			 				ShowDlg("PleaseWait", 300, 150);
			 				$("#lPleaseWait").text(jQuery.i18n.prop("dns_reboot"));
			 				PostXml("router","router_call_reboot");
			 				if(dnsTimer){
			 				clearTimeout(dnsTimer);
			 				}
			 				dnsTimer = setInterval(function(){CloseDlg();clearInterval(dnsTimer);clearAuthheader();}, 45000);
			 			}
			 	},100);
			 });
			 $('#lt_btnCancel').click(function(){
			 	gIpCtrlDNSPrimaryDNS.setIP(gCurDnsArr[0] == 'disable' ? '': gCurDnsArr[0]);
			 	gIpCtrlDNSSecondaryDNS.setIP(gCurDnsArr[1] == 'disable' ? '': gCurDnsArr[1]);
			 });
			 
			 
			 
			 
			 
		}
		function firstValueDNS(dns){
			var valueArr = dns.split('.');
			if(valueArr[0]>0 && valueArr[0]<224){
				return true;
			}else{
				return false;
			}
		}
		function getDNSConfig(){
			gCurDnsArr = [] ;
			var retXml = PostXml("router","router_get_dns");
			gCurDnsArr = $(retXml).find('option_dns').text().split(",");
			if(gCurDnsArr[0]==''){
				gCurDnsArr[0] = 'disable';
				}

			if(gCurDnsArr.length<2){
				gCurDnsArr[1] = 'disable';
			}
			if("disable" == gCurDnsArr[0]) {
				gIpCtrlDNSPrimaryDNS.setIP("");                    
			}else{
				gIpCtrlDNSPrimaryDNS.setIP(gCurDnsArr[0]);                    
			}

			 if("disable" == gCurDnsArr[1]) {
				gIpCtrlDNSSecondaryDNS.setIP("");                    
			}else{
				gIpCtrlDNSSecondaryDNS.setIP(gCurDnsArr[1]);                    
			}

		}
		return this;
	}
})(jQuery);