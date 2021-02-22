
(function($) {

    $.fn.objTimeSetting = function(InIt) {
        var gTimeZone,gDate,gTime,gNtpServerStatus,gNtpServer1,gNtpServer2,gformatDate,gformatTime;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/time_setting.html");
                $("#SelDhcpServerSwitch").change(function() {
                    if("1"==$(this).val()) {
                        $("#divDhcpInfo").hide();
                    } else {
                        $("#divDhcpInfo").show();
                    }
                });
                
                $("#lt_tz_btnGetGmtTime").click(function() {
                	ShowDlg("PleaseWait", 120, 100);
                    var retXml = PostXml("router","router_invoke_ntp");
                    if("OK" != $(retXml).find("setting_response").text()) {
                        showMsgBox(jQuery.i18n.prop("dialog_message_time_setting_title"), jQuery.i18n.prop("dialog_message_time_setting_get_gmt_fail"));
                    } else {
                        GetTimeInfo();
                        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_time_setting_title"), jQuery.i18n.prop("dialog_message_time_setting_get_gmt_loading"));
                    }
                });

                $("#SelNtpServerSwitch").change(function() {
                    if(1 == $(this).val()) {
                        $("#divNtpServer").show();
                        var retXml = PostXml("router","router_get_time_info");
                        gNtpServer1 = $(retXml).find("ntp_server_1").text();
                        gNtpServer2 = $(retXml).find("ntp_server_2").text();
                        $("#divNtpServer").show();
    					$("#txtNtpServer1").val(gNtpServer1);
    	                $("#txtNtpServer2").val(gNtpServer2);  
                    } else {
                        $("#divNtpServer").hide();
                    }
                });
                clearErrorInfo();
            } //end flag


            GetTimeInfo();
        }

        this.SaveData = function() {
        	if(timeChanged()){
        		SetTimeInfo();
        	}
        }
        
        function timeChanged(){
        	if(gTimeZone != $("#SelTimeZone").val() || GetDateFromElement("txtdate") != gformatDate
        			|| GetTimeFromElement("txtTime") != gformatTime){
        		return true;
        	}
        	if(gNtpServerStatus != $("#SelNtpServerSwitch").val()){
        		return true;
        	}
        	if($("#SelNtpServerSwitch").val() =="1"){
        	    if(gNtpServer1 != $("#txtNtpServer1").val() || gNtpServer2 != $("#txtNtpServer2").val()){
	        		return true;
	        	}
        	}
        	return false;
        }
        function  GetTimeInfo() {
            var retXml = PostXml("router","router_get_time_info");
            
            var year = $(retXml).find("year").text();
            var month = $(retXml).find("month").text();
            var day = $(retXml).find("day").text();
           
            gTimeZone = $(retXml).find("timezone").text();
           
            gformatDate =  year + "-" + (month<10?"0"+month:month) + "-" + (day<10?"0"+day:day);
            gDate = year + "-" + month + "-" + day;
            
            var hour = $(retXml).find("hour").text();
            var min = $(retXml).find("min").text();
            var sec = $(retXml).find("sec").text();
           
            gformatTime = (hour<10?"0"+hour:hour) + ":" + (min<10?"0"+min:min) + ":" + (sec<10?"0"+sec:sec);
            gTime = hour+":"+min+":"+sec;

            gNtpServerStatus = $(retXml).find("ntp_server_enable").text();
            gNtpServer1 = $(retXml).find("ntp_server_1").text();
            gNtpServer2 = $(retXml).find("ntp_server_2").text();

            $("#SelTimeZone").val(gTimeZone);

			SetDateToElement("txtdate",gDate)
            SetTimeToElement("txtTime",gTime);
            $("#SelNtpServerSwitch").val(gNtpServerStatus);
            if(1 == gNtpServerStatus) {
                $("#divNtpServer").show();
				$("#txtNtpServer1").val(gNtpServer1);
                $("#txtNtpServer2").val(gNtpServer2);           
            } else {
                $("#divNtpServer").hide();
            }
        }

        function SetTimeInfo() {
            var time = GetTimeFromElement("txtTime");
            var date = GetDateFromElement("txtdate");
            if(!IsTime(time)) {
                $("#tzSetErrorLogs").show();
                $("#tzSetErrorLogs").text(jQuery.i18n.prop("lt_TimeFormatError"));
                return;
            }

            if(!IsData(date)) {
                $("#tzSetErrorLogs").show();
                $("#tzSetErrorLogs").text(jQuery.i18n.prop("lt_DateFormatError"));
                return;
            }

            var configMap = new Map();
            if(time != gTime) {
                configMap.put("RGW/time_setting/hour",$("#txtTime1").val());
                configMap.put("RGW/time_setting/min",$("#txtTime2").val());
                configMap.put("RGW/time_setting/sec",$("#txtTime3").val());
            }

            if(date != gDate) {
                configMap.put("RGW/time_setting/year",$("#txtdate1").val());
                configMap.put("RGW/time_setting/month",$("#txtdate2").val());
                configMap.put("RGW/time_setting/day",$("#txtdate3").val());
            }

            if(gTimeZone != $("#SelTimeZone").val()) {
                configMap.put("RGW/time_setting/timezone",$("#SelTimeZone").val());
            }

            if(gNtpServerStatus != $("#SelNtpServerSwitch").val()) {
                configMap.put("RGW/time_setting/ntp_server_enable",$("#SelNtpServerSwitch").val());
            }

            if(1 == $("#SelNtpServerSwitch").val()) {
                var ntpServer1 = $("#txtNtpServer1").val();
                var ntpServer2 = $("#txtNtpServer2").val();

               /* if(!IsUrl(ntpServer1) || !IsIPv4(ntpServer1)
                   || !IsUrl(ntpServer2) || !IsIPv4(ntpServer2)) {
                    $("#tzSetErrorLogs").show();
                    $("#tzSetErrorLogs").text(jQuery.i18n.prop("lt_serverFormatError"));
                    return;
                }*/

                if(gNtpServer1 != ntpServer1) {
                    configMap.put("RGW/time_setting/ntp_server_1",ntpServer1);
                }
                if(gNtpServer2 != ntpServer2) {
                    configMap.put("RGW/time_setting/ntp_server_2",ntpServer2);
                }
            }

            if(configMap.size() == 0) {
                return;
            }

            var retXml = PostXml("router","router_set_time_info",configMap);
            if("OK" != $(retXml).find("setting_response").text()) {
                showMsgBox(jQuery.i18n.prop("dialog_message_time_setting_title"), jQuery.i18n.prop("dialog_message_time_setting_set_fail"));
            } else {
                GetTimeInfo();
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_time_setting_title"), jQuery.i18n.prop("dialog_message_time_setting_set_success"));
            }

        }

        return this;
    }
})(jQuery);










