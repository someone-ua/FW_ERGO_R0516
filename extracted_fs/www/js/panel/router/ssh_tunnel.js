var g_grenerate_key = false;
(function($){
	$.fn.objSSHTunnel = function(){ //objSSHTunnel
		var g_sshInfoObj = {};
		this.onLoad = function(flag){
			if(flag){
				LoadWebPage("html/router/ssh_tunnel.html");
				if(g_grenerate_key){
					$('#lt_ssh_download_btn').prop('disabled',false);
				}else{
					$('#lt_ssh_download_btn').prop('disabled',true);
				}
				$('#lt_ssh_generate_btn').click(function(){
					$('#ssh_infoError').hide();
					GetKey();
				});
				$('#SSHTunnel_switch').change(function(){
					if($(this).val() == '1'){
						$('#div_sshTunnel_switch').show();
					}else{
						$('#div_sshTunnel_switch').hide();
					}
				});
				$('#tunnelModeSelect').change(function(){
					$('#localPort,#remotePort,#sockPort').hide();
					var mode = $(this).val();
					if(mode == 'tunnelL'){
						$('#localPort').show();
					}else if(mode == 'tunnelR'){
						$('#remotePort').show();
					}else if(mode == 'tunnelD'){
						$('#sockPort').show();
					}
				});
				$('#lt_ssh_download_btn').click(function(){
					var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?Action=Download&file=ssh_file&command=";
					$.download(url, "", "POST");
				});
				$('input[type="text"],input[type="password"]').click(function(){
					$('#ssh_infoError').hide();
				});
				$('#lt_btnApply').click(function(){
					$('#ssh_infoError').hide();
					var enable = $('#SSHTunnel_switch').val();
					var mode = $('#tunnelModeSelect').val();
					var user = $('#text_ssh_username').val();
					var hostname = $('#text_ssh_hostname').val();
					var configMap = new Map();
					if(enable == '0'){
						if(enable == g_sshInfoObj.enable){
							return;
						}
						configMap.put("RGW/router/enable",enable);
					}else{
						var flag = false;
						var remoteaddress = '';
						var remoteport = '';
						var localport = '';
						if(!checkUser(user)){
							$('#ssh_infoError').text(jQuery.i18n.prop("lt_RuleNameError"));
							$('#ssh_infoError').show();
							return;
						}
						if($.trim(hostname) == ''){
							$('#ssh_infoError').text(jQuery.i18n.prop("lt_ssh_hostnameEmpty"));
							$('#ssh_infoError').show();
							return;
						}
						if(!checkHostName(hostname)){
							$('#ssh_infoError').text(jQuery.i18n.prop("lt_ssh_hostnameError"));
							$('#ssh_infoError').show();
							return;
						}
						
						configMap.put("RGW/router/enable",enable);
						configMap.put("RGW/router/user",user);
						configMap.put("RGW/router/hostname",hostname);
						configMap.put("RGW/router/mode",mode);
						if(mode != g_sshInfoObj.mode){
							flag = true;
						}
						if(mode == 'tunnelL'){
							remoteaddress = $('#localPort_remoteaddress').val();
							remoteport = $('#localPort_remoteport').val();
							localport = $('#localPort_localport').val();
							if(!checkPort(remoteport) || !checkPort(localport)){
								$('#ssh_infoError').text(jQuery.i18n.prop("lt_PortFormatError"));
								$('#ssh_infoError').show();
								return;
							}
							if($.trim(remoteaddress) == ''){
								$('#ssh_infoError').text(jQuery.i18n.prop("lt_ssh_remoteaddressEmpty"));
								$('#ssh_infoError').show();
								return;
							}
							if(remoteaddress != g_sshInfoObj.remoteaddress || remoteport != g_sshInfoObj.remoteport || localport != g_sshInfoObj.localport){
								flag = true;
							}
							configMap.put("RGW/router/remoteaddress",remoteaddress);
							configMap.put("RGW/router/remoteport",remoteport);
							configMap.put("RGW/router/localport",localport);
						}else if(mode == 'tunnelR'){
							remoteaddress = $('#remotePort_remoteaddress').val();
							remoteport = $('#remotePort_remoteport').val();
							localport = $('#remotePort_localport').val();
							if($.trim(remoteaddress)==''){
								$('#ssh_infoError').text(jQuery.i18n.prop("lt_ssh_remoteaddressEmpty"));
								$('#ssh_infoError').show();
								return;
							}
							if(!checkPort(remoteport) || !checkPort(localport)){
								$('#ssh_infoError').text(jQuery.i18n.prop("lt_PortFormatError"));
								$('#ssh_infoError').show();
								return;
							}
							if(remoteaddress != g_sshInfoObj.remoteaddress || remoteport != g_sshInfoObj.remoteport || localport != g_sshInfoObj.localport){
								flag = true;
							}
							configMap.put("RGW/router/localaddress",remoteaddress);
							configMap.put("RGW/router/remoteport",remoteport);
							configMap.put("RGW/router/localport",localport);
						}else if(mode == 'tunnelD'){
							localport = $('#sockPort_localport').val();
							if(!checkPort(localport)){
								$('#ssh_infoError').text(jQuery.i18n.prop("lt_PortFormatError"));
								$('#ssh_infoError').show();
								return;
							}
							if(localport != g_sshInfoObj.localport){
								flag = true;
							}
							configMap.put("RGW/router/localport",localport);
						}
						if(enable != g_sshInfoObj.enable || user != g_sshInfoObj.user || hostname != g_sshInfoObj.hostname){
							flag = true;
						}
						if(!flag){
							return;
						}
					}
					var retXml = PostXml("router","router_sshtunnel_settings",configMap);
					if("OK" == $(retXml).find("setting_response").text()) {
							GetSSHInfo();
							showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_grenerate_key_title"), jQuery.i18n.prop("dialog_message_sshtunnel_settings_success"));
					}else{
						showMsgBox(jQuery.i18n.prop("dialog_message_grenerate_key_title"), jQuery.i18n.prop("dialog_message_sshtunnel_settings_fail"));
					}
				});
			}
			GetSSHInfo();
		}
		function checkHostName(hostname){
			var r = /.*[\u0100-\uffff]+.*$/;
			if(r.test(hostname)){
				return false;
			}
			var s = /\s+/;
			if(s.test(hostname)){
				return false;
			}
			return true;
		}
		function checkUser(name){
			var r = /^[0-9a-zA-Z]{1,30}$/;
			if(!r.test(name)){
				return false;
			}
			return true;
		}
		function checkPort(port){
			var r=/[0-9]{1,5}/;
			if(!r.test(port)){
					return false
				}
			if(port<=0||port>65535){
					return false
			}
			return true;
		}
		function GetKey(){
			g_grenerate_key = false;
			ShowDlg("PleaseWait", 200, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			setTimeout(function(){
				var retXml = PostXml("router","router_grenerate_key");
				if($(retXml).find('setting_response').text() == 'OK'){
					g_grenerate_key = true;
					$('#lt_ssh_download_btn').prop('disabled',false);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_grenerate_key_title"), jQuery.i18n.prop("dialog_message_grenerate_key_success"));
				}else{
					g_grenerate_key = false;
					$('#lt_ssh_download_btn').prop('disabled',true);
					showMsgBox(jQuery.i18n.prop("dialog_message_grenerate_key_title"), jQuery.i18n.prop("dialog_message_grenerate_key_fail"));
				}
			},200);
		}
		
		function GetSSHInfo(){
			g_sshInfoObj = {};
			var retXml = PostXml("router","router_sshtunnel_info");
			var enable = $(retXml).find('enable').text();
			$('#SSHTunnel_switch').val(enable);
			if(enable == '1'){
				$('#div_sshTunnel_switch').show();
			}else{
				$('#div_sshTunnel_switch').hide();
			}
			var user = $(retXml).find('user').text();
			$('#text_ssh_username').val(user);
			var hostname = $(retXml).find('hostname').text();
			$('#text_ssh_hostname').val(hostname);
			var mode = $(retXml).find('mode').text();
			$('#tunnelModeSelect').val(mode);
			$('#localPort,#remotePort,#sockPort').hide();
			var localaddress = $(retXml).find('localaddress').text();
			var remoteaddress = $(retXml).find('remoteaddress').text();
			var remoteport = $(retXml).find('remoteport').text();
			var localport = $(retXml).find('localport').text();
			if(mode == 'tunnelL'){
				$('#localPort').show();
				$('#localPort_remoteaddress').val(remoteaddress);
				$('#localPort_remoteport').val(remoteport);
				$('#localPort_localport').val(localport);
				g_sshInfoObj.remoteaddress = remoteaddress;
			}else if(mode == 'tunnelR'){
				$('#remotePort').show();
				$('#remotePort_remoteaddress').val(localaddress);
				$('#remotePort_remoteport').val(remoteport);
				$('#remotePort_localport').val(localport);
				g_sshInfoObj.remoteaddress = localaddress;
			}else if(mode == 'tunnelD'){
				$('#sockPort').show();
				$('#sockPort_localport').val(localport);
			}
			g_sshInfoObj.enable = enable;
			g_sshInfoObj.user = user;
			g_sshInfoObj.hostname = hostname;
			g_sshInfoObj.mode = mode;
			g_sshInfoObj.remoteport = remoteport;
			g_sshInfoObj.localport = localport;
		}
		return this;
	}
})(jQuery)