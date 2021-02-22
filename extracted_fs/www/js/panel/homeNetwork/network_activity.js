(function ($) {
	$.fn.objAccess_Logs = function (InIt) {
		this.onLoad = function (flag) {
			if (flag) {
				LoadWebPage("html/homeNetwork/network_activity.html");

				$("#tableAccessLogs #DeleteAllPdpLog").click(function () {
					if ($(this).prop("checked")) {
						$("#pdpLogListBody :checkbox").prop("checked", true);
					} else {
						$("#pdpLogListBody :checkbox").prop("checked", false);
					}
					if ($("#pdpLogListBody :checked").length > 0) {
						$("#lt_log_btnDeletePdpLog").show();
					} else {
						$("#lt_log_btnDeletePdpLog").hide();
					}
				});
				
				$("#tableAccessLogs_phone #DeleteAllPdpLog").click(function () {
					if ($(this).prop("checked")) {
						$("#pdpLogListBody_phone :checkbox").prop("checked", true);
					} else {
						$("#pdpLogListBody_phone :checkbox").prop("checked", false);
					}
					if ($("#pdpLogListBody_phone :checked").length > 0) {
						$("#lt_log_btnDeletePdpLog").show();
					} else {
						$("#lt_log_btnDeletePdpLog").hide();
					}
				});

				$("#lt_log_btnDeletePdpLog").click(function () {
					DeletePdpLog();
				});

				$("#lt_log_btnClearPdpLog").click(function () {
					ClearAllPdpLog();
				});
				GetNetworkLog();
			} else {
				GetNetworkLog("1");
			}
		}

		function ClearAllPdpLog() {
			var entryMap = new Map();
			entryMap.put("RGW/cm/flag", 1);
			var retXml = PostXml("cm", "delete_network_activity", entryMap);
			if ("OK" != $(retXml).find("response").text()) {
				showMsgBox(jQuery.i18n.prop("dialog_message_network_activity_title"), jQuery.i18n.prop(
					"dialog_message_network_activity_clear_all_fail"));
			} else {
				showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_network_activity_title"), jQuery.i18n.prop(
					"dialog_message_network_activity_clear_all_success"));
			}
			GetNetworkLog();
		}

		function DeletePdpLog() {
			var entryMap = new Map();
			$("tbody tr td :checked").each(function () {
				entryMap.clear();
				entryMap.put("RGW/cm/flag", 0);
				entryMap.put("RGW/cm/index", $(this).parents("tr").attr("id"));
				var retXml = PostXml("cm", "delete_network_activity", entryMap);
				if ("OK" != $(retXml).find("response").text()) {
					showMsgBox(jQuery.i18n.prop("dialog_message_network_activity_title"), jQuery.i18n.prop("dialog_message_network_activity_delete_fail"));
				} else {
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_network_activity_title"), jQuery.i18n.prop("dialog_message_network_activity_delete_success"));
				}
			});
			GetNetworkLog();
		}

		function GetNetworkLog(type) {
			$("#pdpLogListBody").empty();
			$("#pdpLogListBody_phone").empty();
			var retXml;
			if (type == "1") {
				retXml = PostXml("cm", "get_network_activity", null, "clearInterval");
			} else {
				retXml = PostXml("cm", "get_network_activity");
			}

			$(retXml).find("network_activity").each(function () {
				$(this).find("Item").each(function () {
					var pdpName = $(this).find("pdp_name").text();
					var index = $(this).find("index").text();
					var cid = $(this).find("cid").text();
					var startTime = $(this).find("start_time").text();
					var endTime = $(this).find("end_time").text();
					var ip_type = $(this).find("ip_type").text();
					var ipv4Addr = $(this).find("ipv4addr").text();
					var ipv6Addr = $(this).find("ipv6addr").text();
					var ipType;
					if (0 == ip_type) {
						ipType = "IPv4v6";
					} else if (1 == ip_type) {
						ipType = "IPv4";
						ipv6Addr = "N/A";
					} else if (2 == ip_type) {
						ipType = "IPv6";
						ipv4Addr = "N/A";
					}
					var accessLog = pdpName+','+cid+','+startTime+','+endTime+','+ipType+','+ipv4Addr+','+ipv6Addr;
					var htmlTxt = "<tr id=\"" + index + "\"><td>" + pdpName + "</td><td>" + cid + "</td><td>" + startTime +
						"</td><td>" + endTime + "</td><td>" + ipType + "</td><td>" + ipv4Addr + "</td><td>" + ipv6Addr +
						"</td><td><input type=\"checkbox\"></td></tr>";
					var htmlTxt_phone = "<tr id=\"" + index + "\"><td>" + pdpName + "</td><td>" + startTime +
						"</td><td><a href=\"javascript:void(0);\" name=\""+accessLog+"\" onclick=\"showLogDetail(this)\">" + jQuery.i18n.prop('lt_detail') +
						"</a></td><td><input type=\"checkbox\"></td></tr>";
					$("#pdpLogListBody").append(htmlTxt);
					$("#pdpLogListBody_phone").append(htmlTxt_phone);
				});
			});

			$("#pdpLogListBody :checkbox").click(function () {
				if ($("#pdpLogListBody :checked").length == $("#pdpLogListBody tr").length) {
					$("#tableAccessLogs #DeleteAllPdpLog").prop("checked", true);
				} else {
					$("#tableAccessLogs #DeleteAllPdpLog").prop("checked", false);
				}

				if ($("#pdpLogListBody :checked").length > 0) {
					$("#lt_log_btnDeletePdpLog").show();
				} else {
					$("#lt_log_btnDeletePdpLog").hide();
				}
			});

			$('#pdpLogListBody :checked').click(function(){
				if ($("#pdpLogListBody :checked").length == $("#pdpLogListBody tr").length &&
					$("#pdpLogListBody :checked").length > 0) {
					$("#tableAccessLogs #DeleteAllPdpLog").prop("checked", true);
				} else {
					$("#tableAccessLogs #DeleteAllPdpLog").prop("checked", false);
				}
	
				if ($("#pdpLogListBody :checked").length > 0) {
					$("#lt_log_btnDeletePdpLog").show();
				} else {
					$("#lt_log_btnDeletePdpLog").hide();
				}
			});
			
			
			$("#pdpLogListBody_phone :checkbox").click(function () {
				if ($("#pdpLogListBody_phone :checked").length == $("#pdpLogListBody_phone tr").length) {
					$("#tableAccessLogs_phone #DeleteAllPdpLog").prop("checked", true);
				} else {
					$("#tableAccessLogs_phone #DeleteAllPdpLog").prop("checked", false);
				}

				if ($("#pdpLogListBody_phone :checked").length > 0) {
					$("#lt_log_btnDeletePdpLog").show();
				} else {
					$("#lt_log_btnDeletePdpLog").hide();
				}
			});
			$('#pdpLogListBody_phone :checked').click(function(){
				if ($("#pdpLogListBody_phone :checked").length == $("#pdpLogListBody_phone tr").length &&
					$("#pdpLogListBody_phone :checked").length > 0) {
					$("#tableAccessLogs_phone #DeleteAllPdpLog").prop("checked", true);
				} else {
					$("#tableAccessLogs_phone #DeleteAllPdpLog").prop("checked", false);
				}
	
				if ($("#pdpLogListBody_phone :checked").length > 0) {
					$("#lt_log_btnDeletePdpLog").show();
				} else {
					$("#lt_log_btnDeletePdpLog").hide();
				}
			});
			
			
		}
		return this.each(function () {
			_networkActivityIntervalID = setInterval("g_objContent.onLoad(false)", _networkActivityInterval);
		});
	}
})(jQuery);
function showLogDetail(dom){
	var detailArr = $(dom).attr('name').split(',');
	if(g_bodyWidth<=430){
		ShowDlg('divAccessLogs','95%',370);
	}else{
		ShowDlg('divAccessLogs',400,370);
	}
	$('#txt_log_PdpName').val(detailArr[0]);
	$('#txt_log_Cid').val(detailArr[1]);
	$('#txt_log_ACStartTime').val(detailArr[2]);
	$('#txt_log_ACEndTime').val(detailArr[3]);
	$('#txt_log_IPType').val(detailArr[4]);
	$('#txt_log_IPv4Addr').val(detailArr[5]);
	$('#txt_log_IPv6Addr').val(detailArr[6]);
}