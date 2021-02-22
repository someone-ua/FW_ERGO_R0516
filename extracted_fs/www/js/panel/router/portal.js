(function ($) {
    $.fn.objPortal = function (InIt) {
        var afterRebootID;
        var savedInfo = {};
        this.onLoad = function () {
            LoadWebPage("html/router/portal.html");
            $("#selPortalStatusSwitch").change(function() {
            	 if(1==$(this).val()) {
                     $("#divPortalUrl").show();
                     $("#divPortalKey").show();
                 } else {
                	 $("#divPortalUrl").hide();
                     $("#divPortalKey").hide();
                     clearInputError();
                 }
            });
            getPortalData();
        }
        
        function getPortalData() {
        	var configMap = new Map();
            configMap.put("RGW/uci/config","nodogsplash");
            configMap.put("RGW/uci/section","nodogsplash");
            var retXml = PostXmlNoShowWaitBox("uci","get", configMap);
            
            var enabled = $(retXml).find("enabled").text();
            var redirecturl = $(retXml).find("redirecturl").text();
            var aeskey = $(retXml).find("aeskey").text();
            
            if ("1" == enabled) {
            	$("#divPortalUrl").show();
                $("#divPortalKey").show();
            } else {
            	$("#divPortalUrl").hide();
                $("#divPortalKey").hide();
            }
            $("#selPortalStatusSwitch").val(enabled);
            $("#textPortalUrl").val(redirecturl?redirecturl:"http://");
            $("#textPortalKey").val(aeskey);
            savedInfo.enabled = enabled;
            savedInfo.redirecturl = redirecturl;
            savedInfo.aeskey = aeskey;
        }
        
        this.SaveData = function() {
        	if(savedInfo.enabled == $("#selPortalStatusSwitch").val() && "0" == $("#selPortalStatusSwitch").val()
        		||savedInfo.enabled == $("#selPortalStatusSwitch").val() && savedInfo.redirecturl == $("#textPortalUrl").val()){
        		return;
        	}
        	var configMap = new Map();
        	configMap.put("RGW/uci/config","nodogsplash");
            configMap.put("RGW/uci/section","nodogsplash");
            configMap.put("RGW/uci/values/enabled",$("#selPortalStatusSwitch").val());
        	if("1" == $("#selPortalStatusSwitch").val()) {
        		var url = $("#textPortalUrl").val();
            	if ("" == url ||  url.indexOf("http://") != 0) {
            		$("#lPortalAlertError").show().text(jQuery.i18n.prop('lt_protal_url_error'));
            		return;
            	}
            	if(url.substr("http://".length).trim() == ""){
            		$("#lPortalAlertError").show().text(jQuery.i18n.prop('lt_protal_url_blank'));
            		return;
            	}
            	if(/.*[\u0100-\uffff]+.*$/.test(url)){
            		$("#lPortalAlertError").show().text(jQuery.i18n.prop('lt_protal_url_chinese'));
            		return;
            	}
            	configMap.put("RGW/uci/values/redirecturl",$("#textPortalUrl").val());
            	configMap.put("RGW/uci/values/aeskey",$("#textPortalKey").val());
        	}
        	PostXml("uci","set", configMap);
        	var commitMap = new Map();
        	commitMap.put("RGW/uci/config","nodogsplash");
        	PostXml("uci","commit", commitMap);
        	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_portal_setting_title"), jQuery.i18n.prop("dialog_message_portal_setting_success"));
        	getPortalData();
            return true;
        }
        return this;
    }
})(jQuery);
function clearInputError() {
	$("#lPortalAlertError").text("");
}