var wps_index;
var queryWpsResultCount = 0;
var pushOrRegisterXhr ;
var pushOrRegisterResultXhr;
var isPushing = false;
var isRegistering = false;
var WpsCancelPush = false;
var registCanclePush = false;
var gCurWifiMode = '0'; //2.4G  默认
(function($){
	$.fn.objWPSSet = function(){
		var gWPSswitch24G = '';
		var gWPSswitch5G = '';
		var wpsTimer;
		this.onLoad = function(flag){
			if(flag){
				LoadWebPage("html/wifi/wps_settings.html");
				if(config_hasWIFI5G){
					$('#divWifiAPClass').show();
				}else{
					$('#divWifiAPClass').hide();
				}
				$('#SelWifiModule').val(gCurWifiMode);
				$('#SelWifiModule').change(function(){
					RouterPinMBChange();
					var WPSswitch = '';
					gCurWifiMode = $(this).val();
					if(gCurWifiMode == '0'){  //wifi2.4G
						WPSswitch = gWPSswitch24G;
					}else{
						WPSswitch = gWPSswitch5G;
					}
					// $("input[name='wpsSwitch']").attr('checked',false);
					$("input[name='wpsSwitch'][value="+WPSswitch+"]").prop('checked',true);
					setInputStatus(WPSswitch);
				});
				$("input[name='wpsSwitch']").click(function(){
					RouterPinMBChange();
					var val = $(this).val();
					var WPSswitch = '';
					if(gCurWifiMode == '0'){
						WPSswitch = gWPSswitch24G;
					}else{
						WPSswitch = gWPSswitch5G;
					}
					if(val == WPSswitch){
						return;
					}
					ShowDlg("PleaseWait", 300, 130);
					$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
					setTimeout(function(){
						var configMap = new Map();
						configMap.put("RGW/wireless/wifi_device",gCurWifiMode);
						configMap.put("RGW/wireless/wps_enable",val);
						var retXml = PostXmlNoShowWaitBox("wireless","wifi_set_wps_disable",configMap);
						if($(retXml).find('setting_response').text() == 'OK'){
							if(gCurWifiMode == '0'){
								 gWPSswitch24G = val;
							}else{
								gWPSswitch5G = val;
							}
							setInputStatus(val);
							CloseDlg();
						}else{
							CloseDlg();
						}
					},200);
				});
				$("input[name='wpsDevice']").click(function(){
					RouterPinMBChange();
					var val = $(this).val();
					if(val=='1'){  //pbc
						$('#lt_mobile_con_pbc').show();
						$('#lt_mobile_con_pin').hide();
					}else{ //pin
						$('#lt_mobile_con_pbc').hide();
						$('#lt_mobile_con_pin').show();
					}
				});
				$('#txt_pin').focus(function(){
					RouterPinMBChange();
					$("input[name='wpsDevice'][value='0']").attr('checked',true);
				})
				$('#lt_mobile_con').click(function(){
					var wpsDevice = $("input[name='wpsDevice']:checked").val();
					if(wpsDevice == '1'){ //pbc
						pbcOperator();
					}else{ // pin
						pinOperator();
					}
				});
			}
			getWpsStatus();
			getConStatus();
		}
		function pbcOperator(){   //push
			WpsCancelPush = false;
			isPushing = true;
			getConStatus();
			wps_index = '0'; //ssid
			var wifiMethod = '';
			var method = '';
			if(gCurWifiMode == '0'){  //2.4G
				wifiMethod = "wifi_call_wps_pbc";
				method = "wifi_call_wps_result";
			}else{   //5G
				wifiMethod = "wifi_call_5G_wps_pbc";
				method = "wifi_call_5G_wps_result";
			}
// 			ShowDlg("PleaseWait", 300, 130);
// 			$("#lPleaseWait").text(jQuery.i18n.prop("wps_nectwork_con"));
			var conMap = new Map();
			conMap.put("RGW/wps/wps_index", wps_index);
			pushOrRegisterXhr = btnWPSOperateClick("wireless",wifiMethod,conMap);
			pushOrRegisterXhr.onreadystatechange = function(){
				if(pushOrRegisterXhr.readyState==4){
					CloseDlg();
					if($(pushOrRegisterXhr.responseXML).find("wps_call_pbc_result").text() == "OK"){
						queryWpsResultCount = 0;
						QueryWpsStatusEx(method);
					}else{
						showAlert("lt_wifi_wps_push_error");
								return;
					}
				}
			};
		}
		function pinOperator(){  //pin register
			WpsCancelPush = false;
			wps_index = '0';
			if(gCurWifiMode == '0'){  //2.4G
				wifiMethod = "wifi_call_wps_pin";
				method = "wifi_call_wps_result";
			}else{   //5G
				wifiMethod = "wifi_call_5G_wps_pin";
				method = "wifi_call_5G_wps_result";
			}
			var mapData = new Map();
				var client_pin = $("#txt_pin").val();
				if("-" == client_pin.substr(4,1)) {
					client = client_pin.replace("-","");
				}
			
				if((client_pin.length == 8 || client_pin.length == 4) && IsNumber(client_pin)) {
// 					ShowDlg("PleaseWait", 300, 130);
// 					$("#lPleaseWait").text(jQuery.i18n.prop("wps_nectwork_con"));
					isRegistering = true;
					registCanclePush = false;
					getConStatus();
					mapData.put("RGW/wps/wps_enable", 1);
					mapData.put("RGW/wps/wps_pin", client_pin);
					mapData.put("RGW/wps/wps_index", wps_index);
					setWPSBtnStatus(0);
					pushOrRegisterXhr = btnWPSOperateClick("wireless",wifiMethod, mapData);
					pushOrRegisterXhr.onreadystatechange = function(){
						 if(registCanclePush){
							 //cancelled
							 return;
						 }
						if(pushOrRegisterXhr.readyState==4){
							CloseDlg();
							if($(pushOrRegisterXhr.responseXML).find("wps_call_pin_result").text() == "OK"){
								queryWpsResultCount = 0;
								QueryWpsStatusEx(method);
							}else{
								showAlert("lt_wifi_wps_pin_error");
					        	return;
							}
						}
					 };
			     }else {
					$("#lWPSError").show();
					$("#lWPSError").text(jQuery.i18n.prop("lWPSPinError"));
					return;
			     }
		}
		function QueryWpsStatusEx(method) {
			if(WpsCancelPush == true){
				return;
			}
			queryWpsResultCount++;
			var resultMap = new Map();
			pushOrRegisterResultXhr = btnWPSOperateClick("wireless",method,resultMap);
			pushOrRegisterResultXhr.onreadystatechange = function(){
				if(pushOrRegisterResultXhr.readyState==4){
					var WPSStatus = $(pushOrRegisterResultXhr.responseXML).find("wifi_wps_result").text();
				    if (undefined != WPSStatus && WPSStatus.length > 2 && (WPSStatus.substr(WPSStatus.length-2,2) == "OK")) {
				    	CloseDlg();
				    	isPushing = false;
				    	isRegistering = false;
						$("#lWPSStatus").hide();
						$("#divcancel_session").hide();
						setWPSBtnStatus(1);
				    	showMsgBox(jQuery.i18n.prop("lWpsMatchTitle"),jQuery.i18n.prop("lWpsMatchSuccess"));
				    } else if (WPSStatus == "WAIT" && queryWpsResultCount <= 120) {
				        if(wpsTimer){
							clearTimeout(wpsTimer);
						}
						wpsTimer = setTimeout(function(){QueryWpsStatusEx(method)},1000); 
				    } else if (queryWpsResultCount > 120) {
				    	CloseDlg();
				    	isPushing = false;
				    	isRegistering = false;
						$("#lWPSStatus").hide();
						$("#divcancel_session").hide();
						setWPSBtnStatus(1);
				    	showMsgBox(jQuery.i18n.prop("lWpsMatchTitle"),jQuery.i18n.prop("lWpsMatchTimeout"));
				    } else {
				    	CloseDlg();
				    	isPushing = false;
				    	isRegistering = false;
						$("#lWPSStatus").hide();
						$("#divcancel_session").hide();
						setWPSBtnStatus(1);
				    	showMsgBox(jQuery.i18n.prop("lWpsMatchTitle"),jQuery.i18n.prop("lWpsMatchFailed"));
				    }
				}
			 };
		}
		function btnWPSOperateClick(objPath, objMethod,controlMap){
			controlMap.push_front("RGW/param/obj_method",objMethod);
			controlMap.push_front("RGW/param/obj_path",objPath);
			controlMap.push_front("RGW/param/session","000");
			controlMap.push_front("RGW/param/method","call");
			var xmlData = CreateXmlDocStr(controlMap);
			
			resetInterval();
			var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";
			
			var xhr = window.XMLHttpRequest?new XMLHttpRequest():new ActiveObject("Microsoft.XMLHttp");
			if(!xhr)return;
			xhr.open("post",url);
			xhr.setRequestHeader("Authorization",getAuthHeader("POST"));
			xhr.send(xmlData);
			return xhr;
		}
		function getWpsStatus(){
			var retXml = PostXml("wireless","wifi_get_wps_disable");
			gWPSswitch24G = $(retXml).find('AP0').find('wps_enable').text();
			gWPSswitch5G = $(retXml).find('AP1').find('wps_enable').text();
			var WPSswitch = gCurWifiMode == '0' ? gWPSswitch24G : gWPSswitch5G;
			$("input[name='wpsSwitch'][value="+WPSswitch+"]").attr('checked',true);
			setInputStatus(WPSswitch);
		}
		function getConStatus(){
			if(isRegistering){
				$("#lWPSStatus").text(jQuery.i18n.prop("WPSIsRegistering")).show();
				$("#divcancel_session").show();
				setWPSBtnStatus(0);
			}
			if(isPushing){
				$("#lWPSStatus").text(jQuery.i18n.prop("WPSIsPushing")).show();
				$("#divcancel_session").show();
				setWPSBtnStatus(0);
			}
		}
		function setInputStatus(status){
			if(status == '0'){
				$('#wpsDevice_pbc').prop('disabled',true);
				$('#wpsDevice_pin').prop('disabled',true);
				$('#txt_pin').prop('disabled',true);
				$('#lt_mobile_con').prop('disabled',true);
			}else{
				$('#wpsDevice_pbc').prop('disabled',false);
				$('#wpsDevice_pin').prop('disabled',false);
				$('#txt_pin').prop('disabled',false);
				$('#lt_mobile_con').prop('disabled',false);
			}
		}
		function RouterPinMBChange() {
			$("#lWPSError").hide();
		}
		
		return this;
	}
})(jQuery)

function cancelSessionClicked() {
			ShowDlg("PleaseWait", 300, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			var method;
			if(gCurWifiMode == '0'){
				method = "wifi_call_wps_cancle";
			}else{
				method = "wifi_call_5G_wps_cancle";
			}
			setTimeout(function(){
				pushOrRegisterXhr.abort();
				pushOrRegisterResultXhr.abort();
				isRegistering = false;
				isPushing = false;
				WpsCancelPush = true;
				registCanclePush = true;
				var cancelMap = new Map();
				cancelMap.put("RGW/wps/wps_index", wps_index);
				var retXml = PostXml("wireless",method,cancelMap);
				CloseDlg();
				if("OK" != $(retXml).find("wps_call_cancel_result").text()) {
				showAlert("lt_wifi_wps_cancel_error");
				    return;
				}else{
					 showAlert("lt_wifi_wps_cancel_success");
					 setWPSBtnStatus(1);
					 $("#lWPSStatus").hide();
					 $("#divcancel_session").hide();
				}
				
			},100);
		}
		function setWPSBtnStatus(status){
			if(status == '0'){
				$('#wpsDevice_pbc').prop('disabled',true);
				$('#wpsDevice_pin').prop('disabled',true);
				$('#txt_pin').prop('disabled',true);
				$('#lt_mobile_con').prop('disabled',true);
				$('#wpsSwitch_disable').prop('disabled',true);
				$('#wpsSwitch_enable').prop('disabled',true);
				$('#SelWifiModule').prop('disabled',true);
			}else{
				$('#wpsDevice_pbc').prop('disabled',false);
				$('#wpsDevice_pin').prop('disabled',false);
				$('#txt_pin').prop('disabled',false);
				$('#lt_mobile_con').prop('disabled',false);
				$('#wpsSwitch_disable').prop('disabled',false);
				$('#wpsSwitch_enable').prop('disabled',false);
				$('#SelWifiModule').prop('disabled',false)
			}
		}
