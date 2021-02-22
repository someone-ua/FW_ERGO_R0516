(function($) {
    $.fn.objTrafficStatistic = function(InIt) {

        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/homeNetwork/traffic_statistic.html");

                $("#lt_commTraffic_btnClearData").click(function() {
                    ClearCommData();
                });
                GetTrafficStatistic();
            }else{
            	GetTrafficStatistic('1');
            }
        }

        function ClearCommData() {
            var retXml = PostXml("statistics","stat_clear_common_data");
            if("ERROR" == $(retXml).find("setting_response").text()) {
//                alert("stat_clear_common_data failed.");
                showMsgBox(jQuery.i18n.prop("dialog_message_traffic_statistic_title"), jQuery.i18n.prop("dialog_message_traffic_statistic_clear_monitor_data_fail"));
            } else {
//            	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_traffic_statistic_title"), jQuery.i18n.prop("dialog_message_traffic_statistic_clear_monitor_data_success"));
            	$("#txtRxByteFromPower").text("0KB");
            	$("#txtTxByteFromPower").text("0KB");
            	$("#txtRxTxByteFromPower").text("0KB");
            	$("#txtErrorByteFromPower").text("0KB");
            	$("#txtRxByteFromRestoreFactory").text("0KB");
            	$("#txtTxByteFromRestoreFactory").text("0KB");
            	$("#txtRxTxByteFromRestoreFactory").text("0KB");
            	$("#txtErrorByteFromRestoreFactory").text("0KB");
            }
        }

        function GetTrafficStatistic(type) {
        	var retXml;
        	if(type=="1"){
        		retXml = PostXml("statistics","stat_get_common_data",null,"clearInterval");
        	}else{
        		retXml = PostXml("statistics","stat_get_common_data");
        	}
            if("ERROR" == $(retXml).find("setting_response").text()) {
                alert("stat_get_common_data failed.");
            }

            var rx_bytes = $(retXml).find("rx_bytes").text();
            var tx_bytes = $(retXml).find("tx_bytes").text();
            var rx_tx_bytes = $(retXml).find("rx_tx_bytes").text();
            var error_bytes = $(retXml).find("error_bytes").text();
            if (undefined != rx_bytes && "" != rx_bytes) {
                $("#txtRxByteFromPower").text(FormatDataTrafficMinUnitKB(rx_bytes));
            } else {
                $("#txtRxByteFromPower").text("0KB");
            }
            
            if (undefined != tx_bytes && "" != tx_bytes) {
                $("#txtTxByteFromPower").text(FormatDataTrafficMinUnitKB(tx_bytes));
            } else {
                $("#txtTxByteFromPower").text("0KB");
            }
            
            if (undefined != rx_tx_bytes && "" != rx_tx_bytes) {
                $("#txtRxTxByteFromPower").text(FormatDataTrafficMinUnitKB(rx_tx_bytes));
            } else {
                $("#txtRxTxByteFromPower").text("0KB");
            }
            
            if (undefined != error_bytes && "" != error_bytes) {
                $("#txtErrorByteFromPower").text(FormatDataTrafficMinUnitKB(error_bytes));
            } else {
            	$("#txtErrorByteFromPower").text("0KB");
            }
            
            var total_rx_bytes = $(retXml).find("total_rx_bytes").text();
            var total_tx_bytes = $(retXml).find("total_tx_bytes").text();
            var total_rx_tx_bytes = $(retXml).find("total_rx_tx_bytes").text();
            var total_error_bytes = $(retXml).find("total_error_bytes").text();
            
            if (undefined != total_rx_bytes && "" != total_rx_bytes) {
                $("#txtRxByteFromRestoreFactory").text(FormatDataTrafficMinUnitKB(total_rx_bytes));
            } else {
                $("#txtRxByteFromRestoreFactory").text("0KB");
            }
            
            if (undefined != total_tx_bytes && "" != total_tx_bytes) {
                $("#txtTxByteFromRestoreFactory").text(FormatDataTrafficMinUnitKB(total_tx_bytes));
            } else {
                $("#txtTxByteFromRestoreFactory").text("0KB");
            }
            
            if (undefined != total_rx_tx_bytes && "" != total_rx_tx_bytes) {
                $("#txtRxTxByteFromRestoreFactory").text(FormatDataTrafficMinUnitKB(total_rx_tx_bytes));
            } else {
                $("#txtRxTxByteFromRestoreFactory").text("0KB");
            }
            
            if (undefined != total_error_bytes && "" != total_error_bytes) {
                $("#txtErrorByteFromRestoreFactory").text(FormatDataTrafficMinUnitKB(total_error_bytes));
            } else {
                $("#txtErrorByteFromRestoreFactory").text("0KB");
            }
        }
        return this.each(function() {
        	_trafficStatisticIntervalID = setInterval("g_objContent.onLoad(false)", _trafficStatisticInterval);
        });
    }
})(jQuery);

