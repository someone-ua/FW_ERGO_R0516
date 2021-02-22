(function($) {
    $.fn.objDiagnostics = function(InIt) {
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/diagnostics.html");
                
                $("#lt_mdiagnostics_ping").html(jQuery.i18n.prop("mdiagnostics_ping"));
                $("#lt_diagnostic_pingExcute").click(function() {
					$("#diagnostics_info").html("");
                	var addr = $("#diagnostics_addr").val();
                	var type = $("#SelDiagnostics").val();
                	if(addr.trim() =="" || addr.length>64){
                		$("#diagnostics_error_info").text(jQuery.i18n.prop("lt_diagnostics_AddrError")).show();
                		return;
                	}
                	ShowDlg("PleaseWait", 200, 130);
                	$("#lPleaseWait").text(type +'... '+ jQuery.i18n.prop("h1PleaseWait"));
					setTimeout(function(){
						var pingMap = new Map();
						pingMap.put("RGW/diagnostics/data",addr);
						var pingResultXml;
						if(type == "ping"){
							pingResultXml = PostXml("diagnostics","ping",pingMap);
						}else if(type == "nslookup"){
							pingResultXml = PostXml("diagnostics","nslookup",pingMap);
						}else{
							pingResultXml = PostXml("diagnostics","traceroute",pingMap);
						}
						CloseDlg();
						var pingResultStatus = $(pingResultXml).find("code").text();
						var pingResultMsg = "";
						if(pingResultXml == null || pingResultXml == ""){
							showMsgBox(jQuery.i18n.prop("mdiagnostics_ping"),jQuery.i18n.prop("lt_diagnostics_timeout"));
							return;
						}
						if(pingResultStatus && pingResultStatus == 0){
							var pingResultInfo = $(pingResultXml).find("stdout").text();
							if(pingResultInfo){
								pingResultInfo = pingResultInfo.split("\n");
								if(pingResultInfo && pingResultInfo.length>0){
									for(var i=0;i<pingResultInfo.length;i++){
										pingResultMsg += "<span>"+pingResultInfo[i]+"</span><br/>";
									}
								}
								$("#diagnostics_info").html(pingResultMsg).css("color","black");
							}
						}else{
							var pingResultInfo = $(pingResultXml).find("stderr").text()||$(pingResultXml).find("stdout").text();
							if(pingResultInfo){
								pingResultInfo = pingResultInfo.split("\n");
								if(pingResultInfo && pingResultInfo.length>0){
									for(var i=0;i<pingResultInfo.length;i++){
										pingResultMsg += "<span>"+pingResultInfo[i]+"</span><br/>";
									}
								}
							}
							$("#diagnostics_info").html(pingResultMsg).css("color","red");
						}
					},200);
                	
                });

                $("#diagnostics_addr").mousedown(function(){
                	$("#diagnostics_error_info").hide();
                });
            }
        }
        return this;
    }
})(jQuery);










