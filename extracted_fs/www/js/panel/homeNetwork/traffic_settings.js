(function($) {
    $.fn.objTrafficSettings = function(InIt) {
        var GB_UNIT = 1024*1024*1024;
        var MB_UNIT = 1024*1024;
        var KB_UNIT = 1024;
        var startSetting;
        var usedStatic;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/homeNetwork/traffic_settings.html");
                for(var idx = 0; idx < 24; ++idx) {
                    var hour = String(idx);
                    if(1 == hour.length) {
                        hour = "0" + hour;
                    }
                    hour += ":00";
                    $("#SelIdleStartTime,#SelIdleEndTime").append("<option value='" + hour + "'>"+hour+"</option>");
                }
				$('#txtMonthlyTotalTraffic').blur(function(){
					var usedValue = GetTrafficDataFromElements("txtMonthlyUsedTraffic","MonthUsedDataUnitSel");
					var limitValue = GetTrafficDataFromElements("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel");
					if(usedValue>limitValue){
						$('#monthTip').html(jQuery.i18n.prop("UsedMonthOutRange")).show();
					}else{
						$('#monthTip').hide();
					}
				});
				$('#MonthTotaldDataUnitSel').change(function(){
					var usedValue = GetTrafficDataFromElements("txtMonthlyUsedTraffic","MonthUsedDataUnitSel");
					var limitValue = GetTrafficDataFromElements("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel");
					if(usedValue>limitValue){
						$('#monthTip').html(jQuery.i18n.prop("UsedMonthOutRange")).show();
					}else{
						$('#monthTip').hide();
					}
				});
                $('#txtIdleTotalTraffic').blur(function(){
					var usedValue = GetTrafficDataFromElements("txtIdleUsedTraffic","idleUsedDataUnitSel");
					var limitValue = GetTrafficDataFromElements("txtIdleTotalTraffic","IdleTotaldDataUnitSel");
					if(usedValue>limitValue){
						$('#idleTip').html(jQuery.i18n.prop("UsedIdleOutRange")).show();
					}else{
						$('#idleTip').hide();
					}
				});
				$('#IdleTotaldDataUnitSel').change(function(){
					var usedValue = GetTrafficDataFromElements("txtIdleUsedTraffic","idleUsedDataUnitSel");
					var limitValue = GetTrafficDataFromElements("txtIdleTotalTraffic","IdleTotaldDataUnitSel");
					if(usedValue>limitValue){
						$('#idleTip').html(jQuery.i18n.prop("UsedIdleOutRange")).show();
					}else{
						$('#idleTip').hide();
					}
                });
                $('#txtPeriodTotalTraffic').blur(function(){
					var usedValue = GetTrafficDataFromElements("txtMonthlyUsedTraffic","PeriodUsedDataUnitSel");
					var limitValue = GetTrafficDataFromElements("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel");
					if(usedValue>limitValue){
						$('#PeriodTip').html(jQuery.i18n.prop("UsedPeriodOutRange")).show();
					}else{
						$('#PeriodTip').hide();
					}
				});
				$('#PeriodTotaldDataUnitSel').change(function(){
					var usedValue = GetTrafficDataFromElements("txtMonthlyUsedTraffic","PeriodUsedDataUnitSel");
					var limitValue = GetTrafficDataFromElements("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel");
					if(usedValue>limitValue){
						$('#PeriodTip').html(jQuery.i18n.prop("UsedPeriodOutRange")).show();
					}else{
						$('#PeriodTip').hide();
					}
				});

                $("#SelMonthlyTrafficEnabledSwitch").change(function() {
                    if(1 == $(this).val()) {
                        $("#divMonthlyTrafficSet").show();
                    } else {
                        $("#divMonthlyTrafficSet").hide();
                    }
                });

                $("#SelIdleTrafficEnbledSwitch").change(function() {
                    if(1 == $(this).val()) {
                        $("#divIdleTrafficSet").show();
                    } else {
                        $("#divIdleTrafficSet").hide();
                    }
                });


                $("#SelPeriodTrafficEnbledSwitch").change(function() {
                    if(1 == $(this).val()) {
                        $("#divPeriodTrafficSet").show();
                    } else {
                        $("#divPeriodTrafficSet").hide();
                        $("#trafficSetErrorLogs").hide();
                    }
                });

                $("#SelOverTrafficWarning").change(function() {
                    if(1 == $(this).val()) {
                        $("#divTrafficOverWarningPercent").show();
                    } else {
                        $("#divTrafficOverWarningPercent").hide();
                    }
                });

                $("#SelOverTrafficDisconnect").change(function() {
                    if(1 == $(this).val()) {
                        $("#divTrafficOverDisconnectPercent").show();
                    } else {
                        $("#divTrafficOverDisconnectPercent").hide();
                    }
                });
                
                $("#lt_trafficSet_btnCalibrationMonthUsedTraffic").click(function() {
                    CalUsedTraffic("month",GetTrafficDataFromElements("txtMonthlyUsedTraffic","MonthUsedDataUnitSel"),GetTrafficDataFromElements("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel"));
                });

                $("#lt_trafficSet_btnCalibrationIdleUsedTraffic").click(function() {
                    CalUsedTraffic("idle",GetTrafficDataFromElements("txtIdleUsedTraffic","idleUsedDataUnitSel"),GetTrafficDataFromElements("txtIdleTotalTraffic","IdleTotaldDataUnitSel"));
                });

                $("#lt_trafficSet_btnCalibrationPeriodUsedTraffic").click(function() {
                    CalUsedTraffic("period",GetTrafficDataFromElements("txtPeriodUsedTraffic","PeriodUsedDataUnitSel"),GetTrafficDataFromElements("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel"));
                });


                $("#lt_trafficSet_btnChangeMonthlySettlementDay").click(function() {
                    ChangeMonthSettleDay($(this).prev().val());
                });

                $("#lt_trafficSet_btnClearData").click(function() {
                    ClearMonitorData();
                });
                
                clearErrorInfo();
            }

            GetStatSetting();
            GetCurUsedStatValue();
            //statistic traffic
            if($(startSetting).find("statistics").find("general").find("warn_enable").text()==1){//give note
            	var warnLine = $(startSetting).find("statistics").find("general").find("warn_percent").text();
            	var noticeMsg = "";
            	//month traffic management
            	if($(startSetting).find("statistics").find("basic_mon").find("enable").text()==1){
            		var total_monTraffic = $(startSetting).find("statistics").find("basic_mon").find("avl_data").text();
            		var usedMonTraffic = $(usedStatic).find("statistics").find("basic_mon_used").text();
            		noticeMsg = convertToTraffic(total_monTraffic,usedMonTraffic,"month",warnLine,noticeMsg);
            	}
            	//idle traffic management
            	if($(startSetting).find("statistics").find("idle").find("enable").text()==1){
            		var totalIdleTraffic = $(startSetting).find("statistics").find("idle").find("avl_data").text();
            		var usedIdleTraffic = $(usedStatic).find("statistics").find("idle_used").text();
            		
            		noticeMsg = convertToTraffic(totalIdleTraffic,usedIdleTraffic,"idle",warnLine,noticeMsg);
            	}
            	//period traffic management
            	if($(startSetting).find("statistics").find("period").find("enable").text()==1){
            		var totalPeriodTraffic = $(startSetting).find("statistics").find("period").find("avl_data").text();
            		var usedPeriodTraffic = $(usedStatic).find("statistics").find("period_used").text();
            		noticeMsg = convertToTraffic(totalPeriodTraffic,usedPeriodTraffic,"period",warnLine,noticeMsg);
            	}
            	if(noticeMsg){
            		showMsgBox(jQuery.i18n.prop("dialog_message_traffic_title"), noticeMsg.substr(0,noticeMsg.length-2));
            	}
            }
        }
        
        function convertToTraffic(total_Traffic,used_Traffic,status,warnLine,noticeMsg){
       	 	var tTrafficData = total_Traffic*1;
       	 	var uTrafficData = used_Traffic*1;
            
            if(!isNaN(tTrafficData)){
            	if(tTrafficData==0 && uTrafficData>tTrafficData){
            		if(status=="period"){
            			noticeMsg += jQuery.i18n.prop("periodTrafficStatistics")+" "+warnLine+"%, ";
            		}else if(status=="idle"){
            			noticeMsg += jQuery.i18n.prop("idleTrafficStatistics")+" "+warnLine+"%, ";
            		}else{
            			noticeMsg += jQuery.i18n.prop("monthTrafficStatistics")+" "+warnLine+"%, ";
            		}
            	}else{
	            	var usedPercent = uTrafficData/tTrafficData*100;
	            	if(usedPercent>=warnLine){
	            		if(status=="period"){
	            			noticeMsg += jQuery.i18n.prop("periodTrafficStatistics")+" "+warnLine+"%, ";
	            		}else if(status=="idle"){
	            			noticeMsg += jQuery.i18n.prop("idleTrafficStatistics")+" "+warnLine+"%, ";
	            		}else{
	            			noticeMsg += jQuery.i18n.prop("monthTrafficStatistics")+" "+warnLine+"%, ";
	            		}
	            	}
            	}
            }
    		return noticeMsg;
       }
        
        function ClearMonitorData () {
            ShowDlg("PleaseWait", 200, 130);
            $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            var retXml = PostXml("statistics","stat_clear_monitor_data");
            CloseDlg();
            if(g_objContent!=null)
                g_objContent.onLoad(false);
            if("ERROR" == $(retXml).find("setting_response").text()) {
                showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("dialog_message_traffic_settings_clear_monitor_data_fail"));
            } else {
            	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("dialog_message_traffic_settings_clear_monitor_data_success"));
            }
        }

        function GetCurUsedStatValue() {
            var retXml = PostXml("statistics","stat_get_cur_value");
            usedStatic = retXml;
            SetTrafficData("txtMonthlyUsedTraffic","MonthUsedDataUnitSel",$(retXml).find("basic_mon_used").text());
            SetTrafficData("txtIdleUsedTraffic","idleUsedDataUnitSel",$(retXml).find("idle_used").text());
            SetTrafficData("txtPeriodUsedTraffic","PeriodUsedDataUnitSel",$(retXml).find("period_used").text());
        }

        function GetStatSetting() {
            var retXml = PostXml("statistics","stat_get_settings");
            startSetting = retXml;
            $(retXml).find("basic_mon").each(function() {
                var basicMonthEnable = $(this).find("enable").text();
                var basicMonthAvlData = $(this).find("avl_data").text();
                var basicMonthPayday = $(this).find("payday").text();

                $("#SelMonthlyTrafficEnabledSwitch").val(basicMonthEnable);
                $("#txtMonthlySettlementDay").val(basicMonthPayday=="0"?"1":basicMonthPayday);
                SetTrafficData("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel",basicMonthAvlData);
                if(1 == basicMonthEnable) {
                    $("#divMonthlyTrafficSet").show();
                } else {
                    $("#divMonthlyTrafficSet").hide();
                }
            });

            $(retXml).find("idle").each(function() {
                var idleEnable = $(this).find("enable").text();
                var idleAvlData = $(this).find("avl_data").text();
                var idleStartHour = $(this).find("start_hour").text();
                var idleEndHour = $(this).find("end_hour").text();

                $("#SelIdleTrafficEnbledSwitch").val(idleEnable);
                $("#SelIdleStartTime").val(idleStartHour);
                $("#SelIdleEndTime").val(idleEndHour);
                SetTrafficData("txtIdleTotalTraffic","IdleTotaldDataUnitSel",idleAvlData);
                if(1 == idleEnable) {
                    $("#divIdleTrafficSet").show();
                } else {
                    $("#divIdleTrafficSet").hide();
                }
            });

            $(retXml).find("period").each(function() {
                var periodEnable = $(this).find("enable").text();
                var periodAvlData = $(this).find("avl_data").text();
                var periodStartDate = $(this).find("start_date").text();
                var periodEndDate = $(this).find("end_date").text();

                if(1 == periodEnable) {
                    $("#divPeriodTrafficSet").show();
                } else {
                    $("#divPeriodTrafficSet").hide();
                }
                
                if ("0" != periodStartDate) {
                	SetDateToElement("txtStartDate",periodStartDate);
                }
                
                if ("0" != periodEndDate) {
                	SetDateToElement("txtEndDate",periodEndDate);
                }
                
                $("#SelPeriodTrafficEnbledSwitch").val(periodEnable);
                SetTrafficData("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel",periodAvlData);
            });

            $(retXml).find("general").each(function() {
                var warnEnable = $(this).find("warn_enable").text();
                var warnPercent = $(this).find("warn_percent").text();
                var disEnable = $(this).find("dis_enable").text();
                var disPercent = $(this).find("dis_percent").text();

                $("#SelOverTrafficWarning").val(warnEnable);
                $("#SelOverTrafficDisconnect").val(disEnable);
                $("#txtOverWarningPercent").val(warnPercent);
                $("#txtOverDisconnectPercent").val(disPercent);

                if(1 == warnEnable) {
                    $("#divTrafficOverWarningPercent").show();
                } else {
                    $("#divTrafficOverWarningPercent").hide();
                }

                if(1 == disEnable) {
                    $("#divTrafficOverDisconnectPercent").show();
                } else {
                    $("#divTrafficOverDisconnectPercent").hide();
                }
            });
        }

        function SetTrafficData(trafficDataEditBox,trafficDataUnitSelBox,strtrafficValue) {
            var nTrafficData = parseInt(strtrafficValue);
            var unitValue;
            var trafficValue;
            if(nTrafficData >= GB_UNIT) {
                unitValue = 3;
                var dataInGB = nTrafficData / GB_UNIT;
                trafficValue = dataInGB.toFixed(3);
            } else if(nTrafficData >= MB_UNIT) {
                unitValue = 2;
                var dataInMB = nTrafficData / MB_UNIT;
                trafficValue = dataInMB.toFixed(3);
            } else {
                unitValue = 1;
                var dataInKB = nTrafficData / KB_UNIT;
                trafficValue = dataInKB.toFixed(3);
            }
            if(trafficDataUnitSelBox == "MonthUsedDataUnitSel" ||trafficDataUnitSelBox == "idleUsedDataUnitSel"
            	|| trafficDataUnitSelBox == "PeriodUsedDataUnitSel"){
            	switch(unitValue){
	            	case 1:
	            		unitValue = "KB";
	            		break;
	            	case 2:
	            		unitValue = "MB";
	            		break;
	            	case 3:
	            		unitValue = "GB";
	            		break;
	            	default:
	            		unitValue = unitValue;
	            	break;
            	}
            }
            var selUnitCtrlId = "#" + trafficDataUnitSelBox;
            var valueCtrlId = "#" + trafficDataEditBox;
            $(selUnitCtrlId).val(unitValue);
            $(valueCtrlId).val(trafficValue);

        }
        
        function ChangeMonthSettleDay(curSettleDay) {
            ShowDlg("divMonthlySettlementDaySetting",460,150);
            for(var idx = 1; idx <= 31; ++idx) {
                $("#selMonthlySettleDay").append("<option value='" + idx + "'>"+idx+"</option>");
            }
            $("#selMonthlySettleDay").val(curSettleDay);
            $("#lt_btnSave").click(function() {
                if(curSettleDay == $("#selMonthlySettleDay").val()) {
                    CloseDlg();
                    return;
                }
                var settleDay = $("#selMonthlySettleDay").val();
                var configMap = new Map();
                configMap.put("RGW/statistics/payday",settleDay);
                retXml = PostXml("statistics","stat_adjust_payday",configMap);

                if("OK" != $(retXml).find("setting_response").text()) {
                    showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("stat_adjust_payday_failed"));
                } else {
                    $("#txtMonthlySettlementDay").val(settleDay);
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("stat_adjust_payday_success"));
                }
            });
        }

        function CalUsedTraffic(type,curValue,limitValue) {
            ShowDlg("divTrafficSetting",360,150);
            if(curValue>limitValue){
                var msg = '';
                if(type == "month"){
                    msg = jQuery.i18n.prop("UsedMonthOutRange");
                }else if(type == "idle"){
                    msg = jQuery.i18n.prop("UsedIdleOutRange");
                }else{
                    msg = jQuery.i18n.prop("UsedPeriodOutRange");
                }
                $("#lTrafficSetError").text(msg).show();
            }
			$('#txtNewTrafficData').blur(function(){
				var newValue = GetTrafficDataFromElements("txtNewTrafficData","newTrafficSel");
				if(newValue>limitValue){
                    var msg = '';
                    if(type == "month"){
                        msg = jQuery.i18n.prop("UsedMonthOutRange");
                    }else if(type == "idle"){
                        msg = jQuery.i18n.prop("UsedIdleOutRange");
                    }else{
                        msg = jQuery.i18n.prop("UsedPeriodOutRange");
                    }
					$("#lTrafficSetError").text(msg).show();
				}else{
                    $("#lTrafficSetError").hide();
                }
            });
            $('#txtNewTrafficData').keyup(function(){
				var newValue = GetTrafficDataFromElements("txtNewTrafficData","newTrafficSel");
				if(newValue>limitValue){
                    var msg = '';
                    if(type == "month"){
                        msg = jQuery.i18n.prop("UsedMonthOutRange");
                    }else if(type == "idle"){
                        msg = jQuery.i18n.prop("UsedIdleOutRange");
                    }else{
                        msg = jQuery.i18n.prop("UsedPeriodOutRange");
                    }
					$("#lTrafficSetError").text(msg).show();
				}else{
                    $("#lTrafficSetError").hide();
                }
            });
			$('#txtNewTrafficData').focus(function(){
				$("#lTrafficSetError").hide();
			});
            if("month" == type) {
                $("#lt_trafficSet_stcTrafficSettingTitle").text(jQuery.i18n.prop("lMonthlyTrafficCalibration"));
            } else if("idle" == type) {
                $("#lt_trafficSet_stcTrafficSettingTitle").text(jQuery.i18n.prop("lIdleTrafficCalibration"));
            } else {
                $("#lt_trafficSet_stcTrafficSettingTitle").text(jQuery.i18n.prop("lPeriodTrafficCalibration"));
            }
            SetTrafficData("txtNewTrafficData","newTrafficSel",curValue);
            $("#lt_btnSave").click(function() {
            	if (!isFloat($("#txtNewTrafficData").val())) {
            		showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_float_error"));
            		return;
            	}

            	if(!validataTrafficData("txtNewTrafficData","newTrafficSel")){
            		$("#lTrafficSetError").text(jQuery.i18n.prop("lt_maximum_error")).show();
            		return false;
            	}
                var newValue = GetTrafficDataFromElements("txtNewTrafficData","newTrafficSel");
                if(newValue == curValue) {
                    CloseDlg();
                    return;
                }
                var newTrafficData = $("#txtNewTrafficData").val();
                var newTrafficSel = $("#newTrafficSel").val();
                
                var configMap = new Map();
                configMap.put("RGW/statistics/adjust_value",newValue);
                var retXml = null;
                if("month" == type) {
                    retXml = PostXml("statistics","stat_adjust_used_mon",configMap);
                } else if("idle" == type) {
                    retXml = PostXml("statistics","stat_adjust_used_idle",configMap);
                } else {
                    retXml = PostXml("statistics","stat_adjust_used_period",configMap);
                }

                if("OK" != $(retXml).find("setting_response").text()) {
                    alert("adjust_used_traffic failed.");
                } else {
                	switch(newTrafficSel){
	                	case "1":
	                		newTrafficSel = "KB";
	                		break;
	                	case "2":
	                		newTrafficSel = "MB";
	                		break;
	                	case "3":
	                		newTrafficSel = "GB";
	                		break;
                		default:
                			newTrafficSel = newTrafficSel;
                			break;
                	}
                	if("month" == type) {
                		$("#txtMonthlyUsedTraffic").val(newTrafficData);
                		$("#MonthUsedDataUnitSel").val(newTrafficSel);
                    } else if("idle" == type) {
                		$("#txtIdleUsedTraffic").val(newTrafficData);
                		$("#idleUsedDataUnitSel").val(newTrafficSel);
                    } else {
                		$("#txtPeriodUsedTraffic").val(newTrafficData);
                		$("#PeriodUsedDataUnitSel").val(newTrafficSel);
                    }
                	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("used_traffic_set_success"));
                }
            });
        }

        function GetTrafficDataFromElements(valueCtrl,unitCtrl) {
            var valueCtrlId = "#" + valueCtrl;
            var unitCtrlId = "#" + unitCtrl;
            var traffic = parseFloat($(valueCtrlId).val());
            var unit = $(unitCtrlId).val();
            switch(unit){
	            case "KB":
	            	unit = "1";
	            	break;
	            case "MB":
	            	unit = "2";
	            	break;
	            case "GB":
	            	unit = "3";
	            	break;
	            default:
	            	unit = unit;
	            	break;
            }
            if(1 == unit) {
                traffic = traffic*KB_UNIT;
            } else if(2 == unit) {
                traffic = traffic*MB_UNIT;
            } else if(3 == unit) {
                traffic = traffic*GB_UNIT;
            }
            return parseInt(traffic);
        }


        function SetStatSetting() {
        	
            var configMap = new Map();
            var warnEnable =  $("#SelOverTrafficWarning").val();
            var disEnable =  $("#SelOverTrafficDisconnect").val();
            configMap.put("RGW/statistics/general/warn_enable",warnEnable);
            if(1 == warnEnable) {
                configMap.put("RGW/statistics/general/warn_percent", $("#txtOverWarningPercent").val());
            }

            configMap.put("RGW/statistics/general/dis_enable",disEnable);
            if(1 == disEnable) {
                configMap.put("RGW/statistics/general/dis_percent", $("#txtOverDisconnectPercent").val());
            }

            var basicMonthEnable = $("#SelMonthlyTrafficEnabledSwitch").val();
            configMap.put("RGW/statistics/basic_mon/enable", basicMonthEnable);
            if(1 == basicMonthEnable) {
                configMap.put("RGW/statistics/basic_mon/avl_data",GetTrafficDataFromElements("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel"));
            }

            var idleEnable = $("#SelIdleTrafficEnbledSwitch").val();
            configMap.put("RGW/statistics/idle/enable", idleEnable);
            if(1 == idleEnable) {
                configMap.put("RGW/statistics/idle/avl_data",GetTrafficDataFromElements("txtIdleTotalTraffic","IdleTotaldDataUnitSel"));
                configMap.put("RGW/statistics/idle/start_hour", $("#SelIdleStartTime").val());
                configMap.put("RGW/statistics/idle/end_hour", $("#SelIdleEndTime").val());
            }

            var periodEnable = $("#SelPeriodTrafficEnbledSwitch").val();
            configMap.put("RGW/statistics/period/enable", periodEnable);
            if(1 == periodEnable) {
            	var startDate = GetDateFromElement("txtStartDate");
            	var endDate = GetDateFromElement("txtEndDate");
                configMap.put("RGW/statistics/period/avl_data",GetTrafficDataFromElements("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel"));
                configMap.put("RGW/statistics/period/start_date",startDate);
                configMap.put("RGW/statistics/period/end_date", endDate);
            }

            var retXml = PostXml("statistics","stat_set_settings",configMap);
            GetStatSetting();
            GetCurUsedStatValue();
            if("ERROR" == $(retXml).find("setting_response").text()) {
                showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("dialog_message_traffic_settings_set_param_fail"));
            } else {
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("dialog_message_traffic_settings_set_param_success"));
            }
        }

        this.SaveData = function() {
        	if(validateData()){
	        	if(dataChanged()){
	        		SetStatSetting();
	        	}
        	}
        }
        
        function validateData(){
        	if(1 == $("#SelOverTrafficWarning").val()) {
            	//warning_percent must between 0--100 and must be number 
            	if(($("#txtOverWarningPercent").val()>100 || $("#txtOverWarningPercent").val()<0) || !/^[0-9]+$/.test($("#txtOverWarningPercent").val())){
            		$("#trafficSetErrorLogs").show().text(jQuery.i18n.prop("lt_warning_percent_error"));
            		return;
            	}
            }
        	 if(1 == $("#SelOverTrafficDisconnect").val()) {
             	//disconnect_percent must between 0--100 and must be number 
 	        	if(($("#txtOverDisconnectPercent").val()>100 || $("#txtOverDisconnectPercent").val()<0) || !/^[0-9]+$/.test($("#txtOverDisconnectPercent").val())){
 	        		$("#trafficSetErrorLogs").show().text(jQuery.i18n.prop("lt_disconnect_percent_error"));
 	        		return;
 	        	}
             }
        	if($("#SelMonthlyTrafficEnabledSwitch").val() == "1"){
        		if($("#txtMonthlyTotalTraffic").val() == ""){
        			showMsgBox(jQuery.i18n.prop("dialog_message_traffic_title"), jQuery.i18n.prop("dialog_message_Monthtraffic_blank"));
        			return false;
        		}else if (!isFloat($("#txtMonthlyTotalTraffic").val())) {
            		showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_float_error"));
            		return;
            	}
        		if(!validataTrafficData("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel")){
        			showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_maximum_error"));
            		return false;
        		}
        	}
        	if($("#SelIdleTrafficEnbledSwitch").val() == "1"){
        		if(!$("#SelIdleStartTime").val() || !$("#SelIdleEndTime").val()){
        			showMsgBox(jQuery.i18n.prop("dialog_message_traffic_title"), jQuery.i18n.prop("dialog_message_traffic_blank"));
        			return false;
        		}else if (!isFloat($("#txtIdleTotalTraffic").val())) {
            		showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_float_error"));
            		return;
            	}
        		if(!validataTrafficData("txtIdleTotalTraffic","IdleTotaldDataUnitSel")){
        			showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_maximum_error"));
            		return false;
        		}
        	}
        	 var periodEnable = $("#SelPeriodTrafficEnbledSwitch").val();
             if(1 == periodEnable) {
             	var startDate = GetDateFromElement("txtStartDate");
             	var endDate = GetDateFromElement("txtEndDate");
                 if(!IsData(startDate) || !IsData(endDate) ||startDate.indexOf("0") == "0" || endDate.indexOf("0") == "0") {
                     $("#trafficSetErrorLogs").show();
                     $("#trafficSetErrorLogs").text(jQuery.i18n.prop("lt_DateFormatError"));
                     return;
                 }
                 var endYear = endDate.substring(0,4);
              	if(endYear*1>2035){
              		$("#trafficSetErrorLogs").text(jQuery.i18n.prop("endYearBeyond2035")).show();
              		return;
              	}
                 if (!isAfterDate(GetDateFromElement("txtStartDate"), GetDateFromElement("txtEndDate"))) {
                     $("#trafficSetErrorLogs").show();
                     $("#trafficSetErrorLogs").text(jQuery.i18n.prop("lt_DateAfterError"));
                     return;
                 }
                 if(!validataTrafficData("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel")){
          			showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_maximum_error"));
              		return false;
          		}
                 if (!isFloat($("#txtPeriodTotalTraffic").val())) {
             		showMsgBox(jQuery.i18n.prop("dialog_message_traffic_settings_title"), jQuery.i18n.prop("lt_float_error"));
             		return;
             	}
             }
        	return true;
        }

        function validataTrafficData(id,unitId){
        	//not more than 99999GB
        	var maxmun = 99999;
        	var data = $("#"+id).val();
        	var unit = $("#"+unitId).val();
        	var data_;
        	switch(unit){
	        	case "1":
	        		data_=data/1024/1024;
	        		break;
	        	case "2":
	        		data_=data/1024;
	        		break;
	        	case "3":
	        		data_=data;
	        		break;
        	}
        	if(data_>maxmun){
        		return false;
        	}
        	return true;
        }
        function dataChanged(){
        	if($("#SelOverTrafficWarning").val() != $(startSetting).find("general").find("warn_enable").text()){
        		return true;
        	}
        	if($("#SelOverTrafficWarning").val() == "1"){
        		if($("#txtOverWarningPercent").val() != $(startSetting).find("general").find("warn_percent").text()){
        			return true;
        		}
        	}
        	if($("#SelOverTrafficDisconnect").val() != $(startSetting).find("general").find("dis_enable").text()){
        		return true;
        	}
        	if($("#SelOverTrafficDisconnect").val() == "1"){
        		if($("#txtOverDisconnectPercent").val() != $(startSetting).find("general").find("dis_percent").text()){
        			return true;
        		}
        	}
        	if($("#SelMonthlyTrafficEnabledSwitch").val() == "1"){
        		if(GetTrafficDataFromElements("txtMonthlyTotalTraffic","MonthTotaldDataUnitSel") != $(startSetting).find("basic_mon").find("avl_data").text()){
        			return true;
        		}
        	}
        	if($("#SelMonthlyTrafficEnabledSwitch").val() != $(startSetting).find("basic_mon").find("enable").text()){
        		return true;
        	}
        	
        	if($("#SelIdleTrafficEnbledSwitch").val() == "1"){
        		if($("#SelIdleStartTime").val() != $(startSetting).find("idle").find("start_hour").text()){
        			return true;
        		}
        		if($("#SelIdleEndTime").val() != $(startSetting).find("idle").find("end_hour").text()){
        			return true;
        		}
        		if(GetTrafficDataFromElements("txtIdleTotalTraffic","IdleTotaldDataUnitSel") != $(startSetting).find("idle").find("avl_data").text()){
        			return true;
        		}
        	}
        	if($("#SelIdleTrafficEnbledSwitch").val() != $(startSetting).find("idle").find("enable").text()){
        		return true;
        	}
        	
        	if($("#SelPeriodTrafficEnbledSwitch").val() == "1"){
        		if(GetDateFromElement("txtStartDate") != $(startSetting).find("period").find("start_date").text()){
        			return true;
        		}
        		if(GetDateFromElement("txtEndDate") != $(startSetting).find("period").find("end_date").text()){
        			return true;
        		}
        		if(GetTrafficDataFromElements("txtPeriodTotalTraffic","PeriodTotaldDataUnitSel") != $(startSetting).find("period").find("avl_data").text()){
        			return true;
        		}
        	}
        	if($("#SelPeriodTrafficEnbledSwitch").val() != $(startSetting).find("period").find("enable").text()){
        		return true;
        	}
        	return false;
        }
        return this;
    }
})(jQuery);


