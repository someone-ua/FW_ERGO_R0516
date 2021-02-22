(function($) {
    $.fn.objDeviceTraffic = function(InIt) {
        var gconnectdevobjname = "statistics";
       
        var _lastSortValue = '';
        var _arrayTableData = new Array(0);
        this.onLoad = function(flag) {
          if(flag)
                LoadWebPage("html/homeNetwork/connectdevice_traffic.html");

            LocalAllElement();

            var retXml = PostXml(gconnectdevobjname, "get_all_clients_info");

            _arrayTableData.length = 0;
            getAccurTraffic(_arrayTableData,retXml)
            this.loadTableData(_arrayTableData);
						this.loadTableData_phone(_arrayTableData);
        }
				this.loadTableData_phone = function(arrayTableData){
					var tableDeviceInfo = document.getElementById('tableDeviceInfo_phone');
					var tBodyDeviceInfo = tableDeviceInfo.getElementsByTagName('tbody')[0];
					clearTabaleRows('tableDeviceInfo_phone');
					if (arrayTableData.length == 0) {
							var row1 = tBodyDeviceInfo.insertRow(0);
							var rowCol1 = row1.insertCell(0);
							rowCol1.colSpan = 3;
							rowCol1.innerHTML = jQuery.i18n.prop("tableNoData");
							$("#divResetAllDevices").hide();
					} else {
							$("#divResetAllDevices").show();
							for (var i = 0; i < arrayTableData.length; i++) {
									var arrayTableDataRow = arrayTableData[i];
									var row = tBodyDeviceInfo.insertRow(i);
									var nameCol = row.insertCell(0);
									var deviceStatusCol = row.insertCell(1);
									var actionCol = row.insertCell(2);

									nameCol.innerHTML = "<a href='#' onclick='ShowDeviceInfo(" + i + ")'>" + arrayTableDataRow[1] + "</a>";

									var connType = arrayTableDataRow[3];
									actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lBlock") + "\" onclick='SetBlockStatus(" + i + ")'/>";
									switch (arrayTableDataRow[2]) {
											case "conn":
													deviceStatusCol.innerHTML = jQuery.i18n.prop("lConnection");
													if(connType=="" || connType=="USB" || connType=="LAN"){
														actionCol.innerHTML = "";
													}else{
															actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lBlock") + "\" onclick='SetBlockStatus(" + i + ")'/>";
													}
													break;
											case "block":
													deviceStatusCol.innerHTML = jQuery.i18n.prop("lBlocked");
													if(connType=="" || connType=="USB" || connType=="LAN"){
														actionCol.innerHTML = "";
													}else{
															actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lUnBlock") + "\" onclick='SetUnblockStatus(" + i + ")'/>";
													}
													break;
											case "dis_conn":
													deviceStatusCol.innerHTML =  jQuery.i18n.prop("lDisConnection");
													if(connType=="" || connType=="USB" || connType=="LAN"){
														actionCol.innerHTML = "";
													}else{
															actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lBlock") + "\" onclick='SetBlockStatus(" + i + ")'/>";
													}
													break;
											default:
													deviceStatusCol.innerHTML =  jQuery.i18n.prop("lUnkownStatus");
									}
							}
					}
					Table.stripe(tableDeviceInfo, "alternate", "table-stripeclass");
				}
        this.loadTableData = function(arrayTableData) {
            var tableDeviceInfo = document.getElementById('tableDeviceInfo');
            var tBodyDeviceInfo = tableDeviceInfo.getElementsByTagName('tbody')[0];
            clearTabaleRows('tableDeviceInfo');
            if (arrayTableData.length == 0) {
                var row1 = tBodyDeviceInfo.insertRow(0);
                var rowCol1 = row1.insertCell(0);
                rowCol1.colSpan = 7;
                rowCol1.innerHTML = jQuery.i18n.prop("tableNoData");
                $("#divResetAllDevices").hide();
            } else {
                $("#divResetAllDevices").show();
                for (var i = 0; i < arrayTableData.length; i++) {
                    var arrayTableDataRow = arrayTableData[i];
                    var row = tBodyDeviceInfo.insertRow(i);
                    var nameCol = row.insertCell(0);
                    var macAddrCol = row.insertCell(1);
                    var connTimeCol = row.insertCell(2);
                    var deviceStatusCol = row.insertCell(3);
                    var actionCol = row.insertCell(4);

                    nameCol.innerHTML = "<a href='#' onclick='ShowDeviceInfo(" + i + ")'>" + arrayTableDataRow[1] + "</a>";
                    macAddrCol.innerHTML = arrayTableDataRow[5];
                    connTimeCol.innerHTML = FormatSeconds(arrayTableDataRow[7]);
                    
                    var connType = arrayTableDataRow[3];
                    actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lBlock") + "\" onclick='SetBlockStatus(" + i + ")'/>";
                    switch (arrayTableDataRow[2]) {
                        case "conn":
                            deviceStatusCol.innerHTML = jQuery.i18n.prop("lConnection");
                            if(connType=="" || connType=="USB" || connType=="LAN"){
                            	actionCol.innerHTML = "";
                            }else{
                                actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lBlock") + "\" onclick='SetBlockStatus(" + i + ")'/>";
                            }
                            break;
                        case "block":
                            deviceStatusCol.innerHTML = jQuery.i18n.prop("lBlocked");
                            if(connType=="" || connType=="USB" || connType=="LAN"){
                            	actionCol.innerHTML = "";
                            }else{
                                actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lUnBlock") + "\" onclick='SetUnblockStatus(" + i + ")'/>";
                            }
                            break;
                        case "dis_conn":
                            deviceStatusCol.innerHTML =  jQuery.i18n.prop("lDisConnection");
                            if(connType=="" || connType=="USB" || connType=="LAN"){
                            	actionCol.innerHTML = "";
                            }else{
                                actionCol.innerHTML = "<input type=\"button\" class=\"btn-apply\" value=\"" +  jQuery.i18n.prop("lBlock") + "\" onclick='SetBlockStatus(" + i + ")'/>";
                            }
                            break;
                        default:
                            deviceStatusCol.innerHTML =  jQuery.i18n.prop("lUnkownStatus");
                    }
                }
            }
            Table.stripe(tableDeviceInfo, "alternate", "table-stripeclass");
        }

        this.getTableRowData = function(index) {
            return _arrayTableData[index];
        }

        this.getTableData = function() {
            return _arrayTableData;
        }

        return this;
    }
})(jQuery);


function FormatDataTraffic(dataByte) {
    var formatData;
    if (dataByte > 1024 * 1024 * 1024) {
        var dataInGB = dataByte / (1024 * 1024 * 1024);
        formatData = dataInGB.toFixed(2) + "GB";
    } else if (dataByte > 1024 * 1024) {
        var dataInMB = dataByte / (1024 * 1024);
        formatData = dataInMB.toFixed(2) + "MB";
    } else if (dataByte > 1024) {
        var dataInKB = dataByte / 1024;
        formatData = dataInKB.toFixed(2) + "KB";
    } else {
        formatData = dataByte + "B";
    }

    return formatData;
}

function ShowDeviceInfo(index) {
	var _arrayData = new Array(0);
	var retXml = PostXml("statistics", "get_all_clients_info");
    var deviceItemInfo = getAccurTraffic(_arrayData,retXml)[index];
    if(g_bodyWidth<430){
			ShowDlg("DeviceInfoDiv",'95%','95%');
		}else{
			ShowDlg("DeviceInfoDiv",400,720);
		}
    LocalAllElement();
    $("#txtDeviceName").val(deviceItemInfo[1]);
    var status = deviceItemInfo[2];
	 switch(status){
   	 case "conn":
   		 status = jQuery.i18n.prop("lt_connected");
   		 break;
   	 case "block":
   		 status = jQuery.i18n.prop("lt_connecting");
   		 break;
   	 case "dis_conn":
   		 status = jQuery.i18n.prop("lt_disconnected");
   		 break;
	 }
    $("#deviceStatusSel").val(status);
    $("#ConnTypeSel").val(deviceItemInfo[3]);
    $("#txtIpAddr").val(deviceItemInfo[4]);
    $("#txtMacAddr").val(deviceItemInfo[5]);
    $("#txtCurConTime").val(FormatSeconds(deviceItemInfo[6]));
    $("#txtTotalConTime").val(FormatSeconds(deviceItemInfo[7]));
    $("#txtLastConTime").val(deviceItemInfo[8]);
	$("#txtMonthRecvData").val(FormatDataTraffic(parseInt(deviceItemInfo[9])));
    $("#txtMonthSendData").val(FormatDataTraffic(parseInt(deviceItemInfo[10])));
    $("#txtMonthTotalData").val(FormatDataTraffic(parseInt(deviceItemInfo[11])));
    $("#txtLast3DayRecvData").val(FormatDataTraffic(parseInt(deviceItemInfo[12])));
    $("#txtLast3DaySendData").val(FormatDataTraffic(parseInt(deviceItemInfo[13])));
    $("#txtLast3DayTotalData").val(FormatDataTraffic(parseInt(deviceItemInfo[14])));
    $("#txtTotalRecvData").val(FormatDataTraffic(parseInt(deviceItemInfo[15])));
    $("#txtTotalSendData").val(FormatDataTraffic(parseInt(deviceItemInfo[16])));
    $("#txtTotalData").val(FormatDataTraffic(parseInt(deviceItemInfo[17])));
}

function SetBlockStatus(index) {
    var tableData = g_objContent.getTableData();
    var deviceInfo = g_objContent.getTableRowData(index);
    var macAddr = deviceInfo[5];
    var allConndevMap = new Map();
	allConndevMap.put("RGW/statistics/clients_mac", macAddr);
	ShowDlg("PleaseWait", 200, 130);
	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
	setTimeout(function(){
	    var retXml = PostXml("statistics", "block_clients", allConndevMap,"","noWait");
	    setTimeout(function(){
	    	CloseDlg();
			if("ERROR"==$(retXml).find("setting_response").text()) {
		        showMsgBox(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_set_block_fail"));
			} else {
				g_objContent.onLoad(true);
		        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_set_block_success"));
			}
	    },15000);
	},100);
}


function SetUnblockStatus(index) {
    var tableData = g_objContent.getTableData();
    var deviceInfo = g_objContent.getTableRowData(index);
    var macAddr = deviceInfo[5];
    var allConndevMap = new Map();
	allConndevMap.put("RGW/statistics/clients_mac", macAddr);
	ShowDlg("PleaseWait", 200, 130);
	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
	setTimeout(function(){
	    var retXml = PostXml("statistics", "unblock_clients", allConndevMap,"","noWait");
	    setTimeout(function(){
	    	CloseDlg();
			if("ERROR"==$(retXml).find("setting_response").text()) {
		        showMsgBox(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_set_unblock_fail"));
			} else {
				g_objContent.onLoad(true);
		        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_set_unblock_success"));
			}
	    },15000);
	},100);
}


function ResetClientsInfo() {
    var allConndevMap = new Map();
    var retXml = PostXml("statistics", "clear_history_clients_info", allConndevMap);
	if("ERROR"==$(retXml).find("setting_response").text()) {
        showMsgBox(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_reset_clients_info_fail"));
	} else {
		g_objContent.onLoad(true);
        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_reset_clients_info_success"));
	}
}

function ResetClientTrafficData() {
   
     var allConndevMap = new Map();
    var retXml = PostXml("statistics", "clear_history_clients_data", allConndevMap);
	if("ERROR"==$(retXml).find("setting_response").text()) {
        showMsgBox(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_reset_clients_traffic_fail"));
	} else {
		g_objContent.onLoad(true);
        showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_connectdevice_traffic_title"), jQuery.i18n.prop("dialog_message_connectdevice_traffic_reset_clients_traffic_success"));
	}
}

function getAccurTraffic(_arrayTrafficData,retXml){
	 var index = 0;
	 $(retXml).find("clients_info").each(function() {
         $(this).find("one_client").each(function() {
        	 _arrayTrafficData[index] = new Array(18);
        	 _arrayTrafficData[index][0] = index;
        	 _arrayTrafficData[index][1] = decodeURIComponent($(this).find("name").text());
        	 _arrayTrafficData[index][2] = $(this).find("status").text();
        	 _arrayTrafficData[index][3] = $(this).find("type").text();
        	 _arrayTrafficData[index][4] = $(this).find("ip").text();
        	 _arrayTrafficData[index][5] = $(this).find("mac").text();
        	 _arrayTrafficData[index][6] = $(this).find("cur_conn_time").text();
        	 _arrayTrafficData[index][7] = $(this).find("total_conn_time").text();
        	 _arrayTrafficData[index][8] = $(this).find("last_conn_time").text();
        	 _arrayTrafficData[index][9] = $(this).find("mon_rx_bytes").text();
        	 _arrayTrafficData[index][10] = $(this).find("mon_tx_bytes").text();
        	 _arrayTrafficData[index][11] = $(this).find("mon_total_bytes").text();
        	 _arrayTrafficData[index][12] = $(this).find("last_3days_rx_bytes").text();
        	 _arrayTrafficData[index][13] = $(this).find("last_3days_tx_bytes").text();
        	 _arrayTrafficData[index][14] = $(this).find("last_3days_total_bytes").text();
        	 _arrayTrafficData[index][15] = $(this).find("total_rx_bytes").text();
        	 _arrayTrafficData[index][16] = $(this).find("total_tx_bytes").text();
        	 _arrayTrafficData[index][17] = $(this).find("total_bytes").text();
			index++;
         });
     });
	 return _arrayTrafficData;
}


