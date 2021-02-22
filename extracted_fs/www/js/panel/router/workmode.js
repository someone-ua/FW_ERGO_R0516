(function($){
	$.fn.objWorkMode = function(InIt) {
		var gWorkMode = ''  ;   //router  bridge
		var gEthTypeFlag = '';    //wan   lan
		var gRouterMode = '';   //wanonly lteonly wanfirst ltefirst
		var gIPStateFlag = '' ; //dhcp   static
		var gStaticObj = {};
		var gBridgeMode = '';  // 0：关闭桥接 1：LTE桥接  2：wan桥接
		var wmtimer
		this.onLoad = function(flag){
			if(flag){
				LoadWebPage("html/router/workmode.html");
				clearErrorInfo();
				$('#selWorkMode').change(function(){
					var val = $(this).val();
					$('#divRouterMode,#divBridgeMode,#divWifiExten').hide();
					if(val == 'router'){
						$('#divRouterMode').show();
						$('#SelTypeMode').prop('disabled',false);
					}else if(val == 'bridge'){
						$('#divBridgeMode').show();
					}
				});
				$('#SelTypeMode').change(function () {
						if(gEthTypeFlag == 'wan'){
								if($(this).val() == 'wan'){
										$('#wanCtr').show();
								}else{
										$('#wanCtr').hide();
								}
						}
						if($(this).val() == 'wan'){
							$('#seleBridgeMode').html("<option value='1'>"+jQuery.i18n.prop('lt_bridge_lte')+"</option><option value='2'>"+jQuery.i18n.prop('lt_bridge_wan')+"</option>");
						}else{
							$('#seleBridgeMode').html("</option><option value='1'>"+jQuery.i18n.prop('lt_bridge_lte')+"</option>");
						}
				});
				$('#IPSelect').change(function(){
					if($(this).val() == 'dhcp'){
						$('#StaticIP').hide();
						ClearStaticIP();
					}else{
						$('#StaticIP').show();
						if(gWorkMode == 'router'&& gEthTypeFlag == 'wan' && gIPStateFlag == 'static'){
							$("#txt_IPAddress").val(gStaticObj.ip);
							$("#txt_subnetMask").val(gStaticObj.netmask);
							$("#txt_Default_Gateway").val(gStaticObj.gateway);
							$("#txt_primary_DNS").val(gStaticObj.dns);
						}
					}
				});
				$('#seleBridgeMode').change(function(){
					if($(this).val() == '2'){
						$('#SelTypeMode').prop('disabled',true);
					}else{
						$('#SelTypeMode').prop('disabled',false);
					}
				});
			}
			
			getEthType();
			getWorkMode();
			getNatMode();
		};
		this.SaveData = function(){
			var workmode = $('#selWorkMode').val();
			var ethType = $('#SelTypeMode').val();
			
			var routerMode = $('#SelWANConnMode').val();
			var ipState = $('#IPSelect').val();
			var ip = $.trim($('#txt_IPAddress').val());
			var netmask = $.trim($('#txt_subnetMask').val());
			var gateway = $.trim($('#txt_Default_Gateway').val());
			var dns = $.trim($('#txt_primary_DNS').val());
			
			var bridgeMode = $('#seleBridgeMode').val();
			
			saveNatmode();
			
			if(gWorkMode == workmode){  //workmode no change
				if(workmode == 'router'){  //router
					if(ethType == gEthTypeFlag){
						if(ethType == 'lan'){
							return;
						}else{  //wan
							var rmFlag = false;
							var ipFlag = false;
							var rmMap = new Map();
							var ipMap = new Map();
							if(routerMode != gRouterMode){
								rmFlag = true; 
								rmMap.put("RGW/router/wan_mode_policy",routerMode);
							}
							if(ipState == gIPStateFlag){
								if(ipState == 'dhcp'){
									ipFlag = false;
								}else{
									if(ip == gStaticObj.ip && netmask == gStaticObj.netmask && gateway==gStaticObj.gateway && dns==gStaticObj.dns){
										ipFlag = false;
									}else{
										if(checkStaticIP(ip,netmask,gateway,dns)){
											ipFlag = true;
											ipMap.put("RGW/router/eth_type",ipState);
											ipMap.put("RGW/router/eth_ip",ip);
											ipMap.put("RGW/router/eth_netmask",netmask);
											ipMap.put("RGW/router/eth_gateway",gateway);
											ipMap.put("RGW/router/eth_pri_dns",dns);
										}else{
											return;
										}
									}
								}
							}else{
								ipFlag = true;
								if(ipState == 'dhcp'){
									ipMap.put("RGW/router/eth_type",ipState);
								}else{
									if(checkStaticIP(ip,netmask,gateway,dns)){
										ipFlag = true;
										ipMap.put("RGW/router/eth_type",ipState);
										ipMap.put("RGW/router/eth_ip",ip);
										ipMap.put("RGW/router/eth_netmask",netmask);
										ipMap.put("RGW/router/eth_gateway",gateway);
										ipMap.put("RGW/router/eth_pri_dns",dns);
									}else{
										return;
									}
								}
							}
							if(ipFlag || rmFlag){
								ShowDlg("PleaseWait", 200, 130);
								$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
								setTimeout(function(){
									var result_ipstate = true;
									var result_rm = true;
									if(ipFlag){
										result_ipstate = setWorkModeAPIS('set_eth_type',ipMap);
										if(result_ipstate){
											getIPState();
										}
									}
									if(rmFlag){
										result_rm = setWorkModeAPIS('set_router_mode',rmMap);
										gRouterMode = result_rm==true?routerMode:gRouterMode;
									}
									if(result_ipstate && result_rm){  //succ
										showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_succ"));
									}else{
										showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
									}
								},200);
								
							}else{
								return;
							}
						}
					}else{
						var ethTypeMap = new Map();
						ethTypeMap.put('RGW/router/eth_select',ethType);
						ShowDlg("PleaseWait", 200, 130);
						$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
						if(wmtimer){
							clearTimeout(wmtimer);
						}
						wmtimer = setTimeout(function(){
								if(setWorkModeAPIS('set_eth_select',ethTypeMap)){
									$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
									PostXml("router","router_call_reboot");
									if(wmtimer){
										clearTimeout(wmtimer);
									}
									wmtimer = setInterval(function(){CloseDlg();clearInterval(wmtimer);clearAuthheader();}, 45000);
								}else{
									showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
								}
						},200);
					}
					
					//bridge
				}else if(workmode == 'bridge'){
					if(ethType == gEthTypeFlag && bridgeMode == gBridgeMode){
						return ;
					}
					var ethTypeFlag = false;
					var result_ethTypeFlag = false;
					if(ethType != gEthTypeFlag ){
						ethTypeFlag = true;
						var ethTypeMap = new Map();
						ethTypeMap.put('RGW/router/eth_select',ethType);	
					}
					var bmFlag = false;
					var result_bmFlag = false;
					if(bridgeMode!= gBridgeMode){
						bmFlag = true;
						var bmMap = new Map();
						bmMap.put('RGW/router/bridge_mode_policy',bridgeMode);
					}
					ShowDlg("PleaseWait", 200, 130);
					$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
					if(wmtimer){
						clearTimeout(wmtimer);
					}
					wmtimer = setTimeout(function(){
						if(ethTypeFlag){
							result_ethTypeFlag = setWorkModeAPIS('set_eth_select',ethTypeMap);
						}
						if(bmFlag){
							result_bmFlag = setWorkModeAPIS('set_bridge_mode',bmMap);
						}
						if(result_ethTypeFlag || result_bmFlag){
							$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
							PostXml("router","router_call_reboot");
							if(wmtimer){
								clearTimeout(wmtimer);
							}
							wmtimer = setInterval(function(){CloseDlg();clearInterval(wmtimer);clearAuthheader();}, 45000);
						}else{
							showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
						}
					},200);
				}
				
			}else{   //work mode change
				var wmMap = new Map();
				wmMap.put('RGW/router/work_mode_policy',workmode);
				
				if(workmode == 'router'){
					if(ethType == gEthTypeFlag){
						if(ethType == 'lan'){
							ShowDlg("PleaseWait", 200, 130);
							$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
							setTimeout(function(){
								if(setWorkModeAPIS('set_work_mode',wmMap)){
								$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
								if(wmtimer){
									clearTimeout(wmtimer);
								}
								PostXml("router","router_call_reboot");
								wmtimer = setInterval(function(){CloseDlg();clearInterval(wmtimer);clearAuthheader();}, 45000);
								}else{
									showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
								}
							},200);
						}else{
							var ipMap = new Map();
							if(ipState == 'dhcp'){
								ipMap.put("RGW/router/eth_type",'dhcp');
							}else{
								if(checkStaticIP(ip,netmask,gateway,dns)){
									ipMap.put("RGW/router/eth_type",'static');
									ipMap.put("RGW/router/eth_ip",ip);
									ipMap.put("RGW/router/eth_netmask",netmask);
									ipMap.put("RGW/router/eth_gateway",gateway);
									ipMap.put("RGW/router/eth_pri_dns",dns);
								}else{
									return;
								}
							}
							var rmMap = new Map();
							rmMap.put("RGW/router/wan_mode_policy",routerMode);
							
							ShowDlg("PleaseWait", 200, 130);
							$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
							setTimeout(function(){
								 var result_ethType = setWorkModeAPIS('set_eth_type',ipMap);
								 var result_rm = setWorkModeAPIS('set_router_mode',rmMap)
								if(setWorkModeAPIS('set_work_mode',wmMap)){
									$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
									if(wmtimer){
										clearTimeout(wmtimer);
									}
									PostXml("router","router_call_reboot");
									wmtimer = setInterval(function(){CloseDlg();clearInterval(wmtimer);clearAuthheader();}, 45000);
								}else{
									getWorkMode();
									showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
								}
							},200);
							
						}
					}else{
						var ethTypeMap = new Map();
						ethTypeMap.put("RGW/router/eth_select",ethType);
						ShowDlg("PleaseWait", 200, 130);
						$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
						if(wmtimer){
							clearTimeout(wmtimer);
						}
						wmtimer = setTimeout(function(){
							var wm_result = setWorkModeAPIS('set_work_mode',wmMap);
							if(setWorkModeAPIS('set_eth_select',ethTypeMap)){
								$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
								if(wmtimer){
									clearTimeout(wmtimer);
								}
								PostXml("router","router_call_reboot");
								wmtimer = setInterval(function(){CloseDlg();clearInterval(wmtimer);clearAuthheader();}, 45000);
							}else{
								if(wm_result){
									gWorkMode = 'router';
								}
								showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
							}
						},200);
					}
				}else if(workmode == 'bridge'){
					var bmMap = new Map();
					bmMap.put('RGW/router/bridge_mode_policy',bridgeMode);
					ShowDlg("PleaseWait", 200, 130);
					$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
					if(wmtimer){
						clearTimeout(wmtimer);
					}
					wmtimer = setTimeout(function(){
						var wm_result = setWorkModeAPIS('set_work_mode',wmMap);
						if(wm_result){gWorkMode = 'bridge';}
						var ethTypeFlag = false;
						var result_ethTypeFlag = false;
						if(ethType != gEthTypeFlag){
							ethTypeFlag = true;
							var ethTypeMap = new Map();
							ethTypeMap.put("RGW/router/eth_select",ethType);
							result_ethTypeFlag = setWorkModeAPIS('set_eth_select',ethTypeMap);
						}
						var result_bmFlag = setWorkModeAPIS('set_bridge_mode',bmMap);
						if(result_ethTypeFlag || result_bmFlag){
							$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
							if(wmtimer){
								clearTimeout(wmtimer);
							}
							PostXml("router","router_call_reboot");
							wmtimer = setInterval(function(){CloseDlg();clearInterval(wmtimer);clearAuthheader();}, 45000);
						}else{
							showMsgBox(jQuery.i18n.prop("lt_workmode"), jQuery.i18n.prop("lt_fail"));
						}
					},200);
				}
			}
		};
		
		function saveNatmode(){
			var natMode = $("#selNatMode").val();
			if(natMode == '2'){
				var naptProto = $("#sel_napt_proto").val();
				var naptPortStart = $("#in_napt_port_start").val().trim();
				var naptPortEnd = $("#in_napt_port_end").val().trim();
				if(flag = naptPortStart < 1 || naptPortStart > 65535 || naptPortEnd < 1 || naptPortEnd > 65535 || naptPortStart > naptPortEnd) {
					$('#nat_error').text(jQuery.i18n.prop('lt_napt_mode_error')).show();
					return ;
				}
				
			    var controlMap = new Map();
				controlMap.push_front("RGW/router/nat_mode",natMode);
				controlMap.push_front("RGW/router/napt_proto",naptProto);
				controlMap.push_front("RGW/router/napt_port",naptPortStart + '-' + naptPortEnd);
				PostXml("router","router_set_nat_enable",controlMap);
			}else{
				var naptProto = $("#sel_napt_proto").val();
			    var controlMap = new Map();
				controlMap.push_front("RGW/router/nat_mode",natMode);
				PostXml("router","router_set_nat_enable",controlMap);
			}
		}
		
		function getEthType(){  //wan  lan
			var retXml = PostXml("router","get_eth_select");
			gEthTypeFlag = $(retXml).find('eth_select').text();
			$('#SelTypeMode').val($(retXml).find('eth_select').text());
			if($(retXml).find('eth_select').text() == 'wan'){
					$('#wanCtr').show(); 
					$('#seleBridgeMode').html("<option value='1'>"+jQuery.i18n.prop('lt_bridge_lte')+"</option><option value='2'>"+jQuery.i18n.prop('lt_bridge_wan')+"</option>");
					
			}else{
					$('#wanCtr').hide();
					$('#seleBridgeMode').html("<option value='1'>"+jQuery.i18n.prop('lt_bridge_lte')+"</option>");
			}
		};
		
		function getWorkMode(){ //router   bridge
			var retXml = PostXml("router","get_work_mode");
			gWorkMode = $(retXml).find('workmode').text();
			$('#selWorkMode').val(gWorkMode);
			$('.workmode').hide();
			if(gWorkMode == 'router'){
				$('#divRouterMode').show();
				getRouterMode();
				getIPState();	
			}else if(gWorkMode == 'bridge'){
				$('#divBridgeMode').show();
				getBridgeMode();
			}else{
				$('#divWifiExten').show();
			}
		};
		function getRouterMode(){   //router mode : wanonly lteonly wanfirst ltefirst
				var retXml = PostXml("router","get_router_mode");
				gRouterMode = $(retXml).find("wanmode").text();
				$('#SelWANConnMode').val(gRouterMode);
		};
		function getIPState(){   //router mode    : dhcp   static
				var retXml = PostXml("router","get_eth_type");
				gIPStateFlag = $(retXml).find('eth_type').text();
				gStaticObj = {};
				$('#IPSelect').val(gIPStateFlag);
				if(gIPStateFlag == 'dhcp'){
						$('#StaticIP').hide();
				}else{
						$('#StaticIP').show();
						var ip = $(retXml).find('ipaddr').text();
						var gateway = $(retXml).find('gateway').text();
						var netmask = $(retXml).find('netmask').text();
						var dns = $(retXml).find('dns').text();
						gStaticObj.ip = ip;
						gStaticObj.gateway = gateway;
						gStaticObj.netmask = netmask;
						gStaticObj.dns = dns;
						$('#txt_IPAddress').val(ip);
						$('#txt_subnetMask').val(netmask);
						$('#txt_Default_Gateway').val(gateway);
						$('#txt_primary_DNS').val(dns);
				}
		};
		function getNatMode(){
			var retJson = PostXml("router","router_get_nat_enable");
			var natMode = $(retJson).find('nat_mode').text();
			var naptProto = $(retJson).find('napt_proto').text();
			var naptPort =  $(retJson).find('napt_port').text();
			var ports = naptPort ? naptPort.split("-") : null;
			
			$("#selNatMode").val(natMode);
			$("#selNatMode").change(function(){
				if($("#selNatMode").val() == '2'){
					$(".workmodel_napt").show();
				}else{
					$(".workmodel_napt").hide();
				}
			});
			$("#sel_napt_proto").val(naptProto ? naptProto : "tcpudp");
			if(natMode == '2'){
				$(".workmodel_napt").show();
				
				$("#in_napt_port_start").val(ports ? ports[0] : "");
				$("#in_napt_port_end").val(ports ? ports[1] : "");
			}else{
				$(".workmodel_napt").hide();
			}
		}
		
		function getBridgeMode(){
			var retXml = PostXml("router","get_bridge_mode");
			gBridgeMode = $(retXml).find('bridge').text();
			$('#seleBridgeMode').val(gBridgeMode);
			if(gBridgeMode == '2'){
				$('#SelTypeMode').prop('disabled',true);
			}else{
				$('#SelTypeMode').prop('disabled',false);
			}
		};
		function ClearStaticIP(){
				$("#txt_IPAddress,#txt_subnetMask,#txt_Default_Gateway,#txt_primary_DNS").val('');
		};
		function checkStaticIP(ip,mask,gateway,dns){
				if(checkIP(ip)&&checkMask(mask)&&checkgateway(gateway)&&checkDNS(dns)){
						return true;
				}else{
						return false;
				}
		};
		function checkIP(ip){
				var r = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
				if(!r.test(ip)){
						$('#error').text(jQuery.i18n.prop('dialog_message_ip_error')).show();
						return false;
				}else{
						var iparr = ip.split('.');
						if(iparr[0]==0 || iparr[0]==255){
								$('#error').text(jQuery.i18n.prop('dialog_message_ip_error')).show();
								return false;
						}else{
								return true;
						}
				}
		};
		function checkMask(mask){
				var r = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
				if(r.test(mask)){
						var b = mask.split('.');
						if(b[0] ==0){
								$('#error').text(jQuery.i18n.prop('dialog_message_workmode_mask_error')).show();
								return false;
						}else{
								return true;
						}
				}else{
						$('#error').text(jQuery.i18n.prop('dialog_message_workmode_mask_error')).show();
						return false;
				}
		};
		function checkgateway(gateway){
				if(gateway == '') return true;
				var r = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
				if(r.test(gateway)){
						var b = gateway.split('.');
						if(b[0] ==0 || gateway == '127.127.127.127'|| b[3]==255){
								$('#error').text(jQuery.i18n.prop('dialog_message_gateway_error')).show();
								return false;
						}else{
								return true;
						}
				}else{
						$('#error').text(jQuery.i18n.prop('dialog_message_gateway_error')).show();
						return false;
				}
		};
		function checkDNS(dns){
				if(dns == '') return true;
				var r = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
				if(r.test(dns)){
						return true;
				}else{
						$('#error').text(jQuery.i18n.prop('dialog_message_pdns_error')).show();
						return false;
				}
		};
		function setWorkModeAPIS(apiname,configMap){
			var retXml = PostXml("router",apiname,configMap,'','noWait');
			if("OK" != $(retXml).find("setting_response").text()){
				return false;
			}else{
				return true;
			}
		}

		return this;
	}
})(jQuery)