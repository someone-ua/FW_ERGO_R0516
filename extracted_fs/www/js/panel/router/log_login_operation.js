(function($) {
    $.fn.objlogin_operation_Logs = function(InIt) {
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/log_login_operation.html");
                GetLog();
            }else{
            	GetLog("1");
            }
        }
        function GetLog(type) {
            $("#loginOperationLogListBody").empty();
            var retXml;
            if(type=="1"){
            	retXml = PostXml("log","userlog",null,"clearInterval");
            }else{
            	retXml = PostXml("log","userlog");
            }
            var entriesXml = $(retXml).find("log").text();
            var entries = entriesXml.split("\n");
            var length = entries.length;
            for (i = length - 2; i >=0; i--) {
				var htmlTxt = '';
				if(g_bodyWidth<=430){
					htmlTxt = "<tr><td style='text-align:left'><div class=\"online_phone pointer\" onclick=\"showpOperaLogDetail('"+entries[i]+"')\">" + entries[i] + "<div></td></tr>";
				}else{
					htmlTxt = "<tr><td style='text-align:left'>" + entries[i] + "</td></tr>";
				}
            	
            	$("#loginOperationLogListBody").append(htmlTxt);
            }
        }
        return this.each(function() {
        	_loginOperationIntervalID = setInterval("g_objContent.onLoad(false)", _loginOperationInterval);
        });
    }
})(jQuery);
function showpOperaLogDetail(message){
	showMsgBox(jQuery.i18n.prop('lt_log_login_operation_message_detail'),message);
}