(function($) {
	$.fn.objWifiDnfilter = function() {
		var gDisbaledDnFilter;
		var g_DnFilter_num = 0;
		this.onLoad = function(flag) {
			if (flag) {
				LoadWebPage("html/wifi/wifiDnfilter.html");

				$("#lt_dnfilter_btnAddDnfilter").click(function() {
					AddDnfilterEntry();
				});

				$("#lt_dnfilter_btnDeleteDnfilter").click(function() {
					DelDnFilterEntry();
				});
				$("#selOpenDnFilterSwitch").change(function() {
					if (1 == $(this).val()) {
						$("#divDnFilterList").hide();
					} else {
						$("#divDnFilterList").show();
					}
				});
			} //end flag

			GetFWDnfilterInfo();
			GetFWDnfilterInfolist();
		}

		function DelDnFilterEntry() {
			var entryIdxList = "";
			$("tbody tr td :checked").each(function() {
				var entryIdx = $(this).parents("tr").prevAll("tr").length + 1;
				entryIdxList = entryIdxList + entryIdx + ",";
			});

			if ("" == entryIdxList) {
				return;
			}

			var entryMap = new Map();
			entryMap.put("RGW/firewall/del_dn_filter_index", entryIdxList);
			
			ShowDlg("PleaseWait", 200, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			setTimeout(function(){
				var retXml = PostXml("firewall", "delete_dn_filter_entry", entryMap);
				if ("OK" == $(retXml).find("setting_response").text()) {
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_delete_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_delete_fail"));
				}
				updateSaveData();
			},200);
			
		}

		function AddDnfilterEntry() {
			if(g_DnFilter_num >= 16){
				showMsgBox(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_add_length"));
				return;
			}
			ShowDnfilterConfigDlg();
			clearErrorInfo();
			$("#lt_btnSave").click(function() {

				var validateMsg = ValidateDnfilterEntry();
				if ("ok" != validateMsg) {
					$("#lDnFilterSetError").show().text(validateMsg);
					return;
				}
				formatTime();
				var entryId = $("tbody tr").size() + 1;
				var preTag = "RGW/firewall/dn_filter/entry_list/entry_" + entryId;
				var entryMap = new Map();
				entryMap.put(preTag + "/start_time", GetTimeFromElementEx("txtStartTime"));
				entryMap.put(preTag + "/stop_time", GetTimeFromElementEx("txtStopTime"));
				entryMap.put(preTag + "/domain_name", $("#txtDomainName").val());
				entryMap.put(preTag + "/enabled", $("#selDnfilterStatus").val());
				CloseDlg();
				ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
				setTimeout(function(){
					var retXml = PostXml("firewall", "add_dn_filter_entry", entryMap);
					if ("OK" == $(retXml).find("setting_response").text()) {
						showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_add_success"));
					} else {
						showMsgBox(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_add_fail"));
					}
					updateSaveData();
				},200);
			});
		}

		function formatTime() {
			var startTime = GetTimeFromElementEx("txtStartTime").split(":");
			var start_0 = startTime[0];
			var start_1 = startTime[1];
			var endTime = GetTimeFromElementEx("txtStopTime").split(":");
			var end_0 = endTime[0];
			var end_1 = endTime[1];
			var regExp = /^[0-9]$/;
			if (regExp.test(start_0)) {
				$("#txtStartTime1").val("0" + start_0);
			}
			if (regExp.test(start_1)) {
				$("#txtStartTime2").val("0" + start_1);
			}
			if (regExp.test(end_0)) {
				$("#txtStopTime1").val("0" + end_0);
			}
			if (regExp.test(end_1)) {
				$("#txtStopTime2").val("0" + end_1);
			}
		}

		function GetFWDnfilterInfo() {
			var retXml = PostXml("firewall", "fw_get_disable_info");
			gDisbaledDnFilter = $(retXml).find("dn_filter_disable").text();
			$("#selOpenDnFilterSwitch").val(gDisbaledDnFilter);
			if (1 == gDisbaledDnFilter) {
				$("#divDnFilterList").hide();
				return;
			} else {
				$("#divDnFilterList").show();
			}
		}


		function GetFWDnfilterInfolist() {
			$("#tbodydnfilter").empty();
			$("#DeleteAlldnfilterEntry").prop("checked", false);
			$("#lt_dnfilter_btnDeleteDnfilter").hide();
			g_DnFilter_num = 0;
			var retXml = PostXml("firewall", "fw_get_dn_filter_info");
			var bFoundEntry = true;
			var idx = 1;
			while (bFoundEntry) {
				var entryIdx = "entry_" + idx;
				bFoundEntry = false;
				$(retXml).find(entryIdx).each(function() {
					bFoundEntry = true;
					g_DnFilter_num++;
					var startTime = $(this).find("start_time").text();
					var StopTime = $(this).find("stop_time").text();
					var domainName = $(this).find("domain_name").text();
					var enabled = $(this).find("enabled").text();
					var dnfilterEntryInfo = startTime + ";" + StopTime + ";" + domainName + ";" + enabled;
					if (0 == enabled) {
						statusString = jQuery.i18n.prop("lt_optDisabledSwitch");
					} else {
						statusString = jQuery.i18n.prop("lt_optEnableSwitch");
					}
					var htmlTxt = "<tr style='cursor: pointer;'name='" + dnfilterEntryInfo + "'><td>" + startTime + "</td><td>" +
						StopTime + "</td><td>" + domainName + "</td><td>" + statusString +
						"</td> <td><input type='checkbox'></td></tr>";
					$("#tbodydnfilter").append(htmlTxt);
				});
				++idx;
				$("tbody tr:last td:lt(4)").click(function() {
					var entryIdx = $(this).parents("tr").prevAll("tr").length;
					ModifyDnfilterEntry(entryIdx);
				});
			}

			$("#DeleteAlldnfilterEntry").click(function() {
				if ($(this).prop("checked")) {
					$("tbody :checkbox").prop("checked", true);
				} else {
					$("tbody :checkbox").prop("checked", false);
				}
				if ($("tbody :checked").length > 0) {
					$("#lt_dnfilter_btnDeleteDnfilter").show();
				} else {
					$("#lt_dnfilter_btnDeleteDnfilter").hide();
				}
			});

			$("tbody :checkbox").click(function() {
				if ($("tbody :checked").length == $("tbody tr").length) {
					$("#DeleteAlldnfilterEntry").prop("checked", true);
				} else {
					$("#DeleteAlldnfilterEntry").prop("checked", false);
				}
				if ($("tbody :checked").length > 0) {
					$("#lt_dnfilter_btnDeleteDnfilter").show();
				} else {
					$("#lt_dnfilter_btnDeleteDnfilter").hide();
				}
			});
		}

		function ModifyDnfilterEntry(entryIdx) {
			ShowDnfilterConfigDlg();
			clearErrorInfo();
			var entryId = entryIdx + 1;
			var selector = "tbody tr:eq(" + entryIdx + ")";
			var dnfilterEntryInfo = $(selector).attr("name").split(";");
			
			SetTimeToElementEx("txtStartTime", dnfilterEntryInfo[0]);
			SetTimeToElementEx("txtStopTime", dnfilterEntryInfo[1]);
			$("#txtDomainName").val(dnfilterEntryInfo[2]);
			$("#selDnfilterStatus").val(dnfilterEntryInfo[3]);

			$("#lt_btnSave").click(function() {
				var validateMsg = ValidateDnfilterEntry();
				if ("ok" != validateMsg) {
					$("#lDnFilterSetError").show().text(validateMsg);
					return;
				}
				formatTime();
				if (dnfilterEntryInfo[0] == GetTimeFromElementEx("txtStartTime") && dnfilterEntryInfo[1] ==
					GetTimeFromElementEx("txtStopTime") &&
					dnfilterEntryInfo[0] == $("#txtDomainName").val() && dnfilterEntryInfo[3] == $("#selDnfilterStatus").val()) {
					CloseDlg();
					return;
				}
				
				var preTag = "RGW/firewall/dn_filter/entry_list/entry_" + entryId;
				var entryMap = new Map();
				entryMap.put(preTag + "/start_time", GetTimeFromElementEx("txtStartTime"));
				entryMap.put(preTag + "/stop_time", GetTimeFromElementEx("txtStopTime"));
				entryMap.put(preTag + "/domain_name", $("#txtDomainName").val());
				entryMap.put(preTag + "/enabled", $("#selDnfilterStatus").val());

				CloseDlg();
				ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
				setTimeout(function(){
					var retXml = PostXml("firewall", "edit_dn_filter_entry", entryMap);
					if ("OK" == $(retXml).find("setting_response").text()) {
						showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_modify_success"));
					} else {
						showMsgBox(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_modify_fail"));
					}
					updateSaveData();
				},200);
				
			});
		}

		function ShowDnfilterConfigDlg() {
			if (g_bodyWidth < 430) {
				ShowDlg("divDnfilterSetDlg", '95%', 260);
			} else {
				ShowDlg("divDnfilterSetDlg", 410, 260);
			}
			$("[name='time']").keyup(function() {
				$("#lDnFilterSetError").hide();
				if ($(this).val().length == 2) {
					$(this).nextAll(":eq(1)").focus();
				}
			});

		}
		this.SaveData = function() {
			if (gDisbaledDnFilter == $("#selOpenDnFilterSwitch").val()) {
				return;
			}
			var configMap = new Map();
			configMap.put("RGW/firewall/dn_filter_disable", $("#selOpenDnFilterSwitch").val());
			
			ShowDlg("PleaseWait", 200, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			setTimeout(function(){
				var retXml = PostXml("firewall", "fw_set_disable_info", configMap);
				if ("OK" == $(retXml).find("setting_response").text()) {
					gDisbaledDnFilter = $("#selOpenDnFilterSwitch").val();
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_set_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_dn_filter_title"), jQuery.i18n.prop("dialog_message_dn_filter_set_fail"));
				}
			},200);
		}

		function ValidateDnfilterEntry() {
			if (!IsTimeEx(GetTimeFromElementEx("txtStartTime")) || !IsTimeEx(GetTimeFromElementEx("txtStopTime"))) {
				return jQuery.i18n.prop("lt_TimeFormatError");
			}
			if (!isAfterTime(GetTimeFromElementEx("txtStartTime"), GetTimeFromElementEx("txtStopTime"))) {
				return jQuery.i18n.prop("lt_TimeAfterError");
			}
			var name = $("#txtDomainName").val();
			if(!/^[0-9a-zA-Z\.\-\:]+$/.test(name)){
				return jQuery.i18n.prop("lt_DomainNameError");
			}
			
			return "ok";
		}

		function updateSaveData() {
			GetFWDnfilterInfolist();
			if (gDisbaledDnFilter == $("#selOpenDnFilterSwitch").val()) {
				return;
			}
			var configMap = new Map();
			configMap.put("RGW/firewall/dn_filter_disable", $("#selOpenDnFilterSwitch").val());
			var retXml = PostXml("firewall", "fw_set_disable_info", configMap);

			GetFWDnfilterInfo();
		}

		return this;
	}
})(jQuery);
