(function($) {
	$.fn.objPhoneBook = function(InIt) {

		var menuId = InIt;
		var gPBubusobjectname = "phonebook";
		var currentActivePageIdx = 1;
		var PHONE_NUM_PER_PAGE = 10;
		var MAX_NAME_LEN = 10;
		var g_bSimCardExist = false;
		var QueryReportTryCount = 0;
		LoadWebPage("html/phonebook/phonebook.html");

		this.onLoad = function(flag) {
			UpdatePhoneBookList("1", true);
		}

		function UpdatePhoneBookList(pageNumber, bInitFlag) {
			$("#PhoneBookList").empty();
			$("#deleteAllPhone").prop("checked", false);
			RefreshDeleteBtn(true);

			var pbcontactMap = new Map();
			var pbMehod;
			var simStatusXml = PostXml("sim", "get_sim_status");
			var pinStatus = $(simStatusXml).find("pin_status").text();
			var perso = $(simStatusXml).find("perso_substate").text();
			if ("mAllContact" == menuId) {
				if (4 == pinStatus && (perso == "3" || perso == "8")) {
					pblocation = "0";
					pbcontactMap.put("RGW/phonebook/getcontactbylocation/pagecap", PHONE_NUM_PER_PAGE);
					pbcontactMap.put("RGW/phonebook/getcontactbylocation/pageindex", pageNumber - 1);
					pbcontactMap.put("RGW/phonebook/getcontactbylocation/location", pblocation);
					pbMehod = "getcontactbylocation";
				} else {
					pbMehod = "getcontactbypage";
					pbcontactMap.put("RGW/phonebook/getcontactbypage/pagecap", PHONE_NUM_PER_PAGE);
					pbcontactMap.put("RGW/phonebook/getcontactbypage/pageindex", pageNumber - 1);
				}

			} else {
				var pblocation = "1";
				var contactgroup;

				if (menuId == "mLoactionCommon" || menuId == "mLoactionFriends" || menuId == "mLoactionFamliy" || menuId ==
					"mLoactionColleague") {
					if (menuId == "mLoactionCommon")
						contactgroup = "0";

					if (menuId == "mLoactionFamliy")
						contactgroup = "1";

					if (menuId == "mLoactionFriends")
						contactgroup = "2";

					if (menuId == "mLoactionColleague")
						contactgroup = "3";

					pblocation = "0";
					pbMehod = "getcontactbygroup";
					pbcontactMap.put("RGW/phonebook/getcontactbygroup/pagecap", PHONE_NUM_PER_PAGE);
					pbcontactMap.put("RGW/phonebook/getcontactbygroup/pageindex", pageNumber - 1);
					pbcontactMap.put("RGW/phonebook/getcontactbygroup/group", contactgroup);

				} else {
					//check sim card status
					if (menuId == "mSimContact") {
						if (1 != $(simStatusXml).find("sim_status").text()) { //no SIM
							showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop("lsmsSimCardAbsent"));
							return;
						}
						if (4 == pinStatus && (perso == "3" || perso == "8")) {
							showMsgBox(jQuery.i18n.prop("SIMList"), jQuery.i18n.prop("lPlsUnlockPNFirst"));
							$("#lt_Phonebook_btnNew").prop("disabled", true);
							return;
						}

						if (pinStatus == "2") { //Lock PIN
							showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop("lPinEnable"));
							return;
						}
					}

					if (menuId == "mLoactionAll") {
						pblocation = "0";
					}
					pbMehod = "getcontactbylocation";
					pbcontactMap.put("RGW/phonebook/getcontactbylocation/pagecap", PHONE_NUM_PER_PAGE);
					pbcontactMap.put("RGW/phonebook/getcontactbylocation/pageindex", pageNumber - 1);
					pbcontactMap.put("RGW/phonebook/getcontactbylocation/location", pblocation);
				}
			}

			var retXml = PostXmlNoShowWaitBox(gPBubusobjectname, pbMehod, pbcontactMap);

			if ($(retXml).find("result").text() != 0) {
				showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), GetErrorType($(retXml).find("result").text()));

			}


			if (bInitFlag) {
				var phoneCount = parseInt($(retXml).find("contactcount").text());

				var phoneBookPageNum = Math.floor(phoneCount / PHONE_NUM_PER_PAGE);
				if (phoneCount % PHONE_NUM_PER_PAGE) {
					phoneBookPageNum = phoneBookPageNum + 1;
				}
				InitPhoneBookPageNum(phoneBookPageNum);
				var SelPage = pageNumber - 1;
				var $Selector = "#divPhoneBookPageNum a:eq(" + SelPage + ")";

				$($Selector).css("color", "blue");
				$($Selector).siblings().css("color", "red");
				$($Selector).addClass("pageSelIdx");
				$($Selector).siblings().removeClass("pageSelIdx");
			}

			$(retXml).find("contactlist").each(function() {
				$(this).find("contact").each(function() {
					var pbmId = $(this).find("index").text();
					var pbmLocation = $(this).find("location").text();
					var pbmName = UniDecode($(this).find("name").text());
					var pbmMobile = $(this).find("mobile").text();
					var pbmHomeNum;
					var pbmOfficeNum;
					var pbmEmail;
					var pbmGroup;
					if (pbmLocation == "0") {

						pbmHomeNum = $(this).find("home").text();
						pbmOfficeNum = $(this).find("office").text();
						pbmEmail = UniDecode($(this).find("email").text());
						pbmGroup = $(this).find("group").text();
					}

					AddPhoneToList(pbmId, pbmLocation, pbmName, pbmMobile, pbmHomeNum, pbmOfficeNum, pbmEmail, pbmGroup);

				});
			});
			var contactcount = $(retXml).find("contactcount").text();
			if (undefined == contactcount || "" == contactcount) {
				contactcount = "0";
			}
			var msg = contactcount == '1' ? jQuery.i18n.prop("lt_Phonebook_contactcount") : jQuery.i18n.prop(
				"lt_Phonebook_contactcounts");
			$("#lt_Phonebook_stcFormTitle").text(jQuery.i18n.prop("lt_Phonebook_stcFormTitle") +
				" (" + jQuery.i18n.prop(menuId) + ")" + " (" + contactcount + " " + msg + ")");
		}

		function RefreshDeleteBtn(bDisabledBtn) {
			if (bDisabledBtn) {
				$("#lt_Phonebook_btnDelete").attr("disabled", true);
				$("#lt_Phonebook_btnDelete").parent(".btnWrp:first").addClass("disabledBtn");

			} else {
				$("#lt_Phonebook_btnDelete").attr("disabled", false);
				$("#lt_Phonebook_btnDelete").parent(".btnWrp:first").removeClass("disabledBtn");

			}
		}

		function AddPhoneToList(pbmId, pbmLocation, pbmName, pbmMobileNumber, pbmHomeNum, pbmOfficeNum, pbmEmail, pbmGroup) {
			var logInfo = pbmId + "$" + pbmLocation + "$" + pbmName + "$" + pbmMobileNumber +
				"$" + pbmHomeNum + "$" + pbmOfficeNum + "$" + pbmEmail + "$" + pbmGroup;

			if (0 == pbmLocation) {
				locImage = "images/device.png";
			} else {
				locImage = "images/sim.png";
			}


			if (pbmMobileNumber.indexOf("86") == 0) {
				pbmMobileNumber = "+" + pbmMobileNumber;
			}

			var strGroup;

			if ("0" == pbmGroup)
				strGroup = jQuery.i18n.prop("mLoactionCommon");
			else if ("1" == pbmGroup)
				strGroup = jQuery.i18n.prop("mLoactionFamliy");
			else if ("2" == pbmGroup)
				strGroup = jQuery.i18n.prop("mLoactionFriends");
			else if ("3" == pbmGroup)
				strGroup = jQuery.i18n.prop("mLoactionColleague");
			else
				strGroup = "";

			var htmlTxtNode = "<tr name=\"" + logInfo +
				"\"><td class=\"pointer\" style=\"text-align:center;cursor: pointer;\"><span>" + pbmName +
				"</span><img align=\"right\" class=\"sendMessage\" src=\"images/icon-file.png\" /></td>" +
				"<td style=\"text-align:center\">" + pbmMobileNumber + " </td>" +
				"<td style=\"text-align:center\">" + strGroup + " </td>" +
				"<td style=\"text-align:center\"><img class=\"saveLocImg\" style=\"cursor: pointer;\" align=\"center\" src=\"" +
				locImage + "\"/></td>" +
				" <td style=\"text-align:center;\"><input class=\"delCheckBox\" type=\"checkbox\" id=\"" + pbmId +
				"\"></td></tr>";

			$("#PhoneBookList").append(htmlTxtNode);
			$("#PhoneBookList .sendMessage:last").attr("title", jQuery.i18n.prop("lt_Phonebook_stcNewMessage"));
			$("#PhoneBookList .saveLocImg:last").attr("title", jQuery.i18n.prop("lt_Phonebook_stcCopyMoveTitle"));


			$(".delCheckBox:last").click(function() {
				if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
					$("#deleteAllPhone").prop("checked", true);
				} else {
					$("#deleteAllPhone").prop("checked", false);
				}
				if ($(".delCheckBox:checked").length >= 1) {
					RefreshDeleteBtn(false);
				} else {
					RefreshDeleteBtn(true);
				}
			});

			$("#deleteAllPhone").click(function() {
				if ($("#deleteAllPhone").prop("checked")) {
					$(".delCheckBox").each(function() {
						$(this).prop("checked", true);
					});
					RefreshDeleteBtn(false);
				} else {
					$(".delCheckBox").each(function() {
						$(this).prop("checked", false);
					});
					RefreshDeleteBtn(true);
				}
			});

			$(".sendMessage:last").click(function() {
				SendMessage(pbmMobileNumber)
			});

			$(".pointer:last").click(function(event) {
				if ($(event.target).is("img")) {
					return;
				}
				ShowPhoneInfoDlg(logInfo);
			});

			$(".saveLocImg:last").click(function() {
				var phoneInfo = $(this).parent().parent().attr("name").split("$");
				CopyMovePhone(phoneInfo[1], phoneInfo[0]);
			});

		}

		function CopyMovePhone(actionFlag /*0:from device to sim;1:from sim to device*/ , id) {
			if (g_bodyWidth <= 430) {
				ShowDlg("DivCopyMoveContact", '95%', 200);
			} else {
				ShowDlg("DivCopyMoveContact", 450, 170);
			}
			//            $("#moveContact").attr("checked", true);
			if ("1" == actionFlag) {
				$("#lt_Phonebook_stcMove").text(jQuery.i18n.prop("lt_Phonebook_moveToDevice"));
				$("#lt_Phonebook_stcCopy").text(jQuery.i18n.prop("lt_Phonebook_copyToDevice"));
				$("#lt_Phonebook_stcCopy").text(jQuery.i18n.prop("lt_Phonebook_copyToDevice"));
			} else {
				$("#lt_Phonebook_stcMove").text(jQuery.i18n.prop("lt_Phonebook_moveToSim"));
				$("#lt_Phonebook_stcCopy").text(jQuery.i18n.prop("lt_Phonebook_copyToSim"));

			}
			$("#lt_Phonebook_btnCopyMove").val(jQuery.i18n.prop("lt_Phonebook_btnOK"));
			$("#lt_Phonebook_stcCancel").text(jQuery.i18n.prop("lt_Phonebook_stcCancelView"));
			$("#lt_Phonebook_btnCopyMove").click(function() {
				var retXml = PostXml("sim", "get_sim_status");
				if (1 == $(retXml).find("sim_status").text()) {
					g_bSimCardExist = true;
				} else {
					g_bSimCardExist = false;
				}
				if (!g_bSimCardExist) {
					//showAlert("lsmsSimCardAbsent");
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop("lsmsSimCardAbsent"));
					return;
				}
				CloseDlg();
				var pbMethod;
				var pbxmltag;
				if (document.getElementById("moveContact").checked) {
					if ("0" == actionFlag) {
						pbMethod = "movefromlocaltosim";
						pbxmltag = "movefromlocaltosim";
					} else {
						pbMethod = "movefromsimtolocal";
						pbxmltag = "movefromsimtolocal";
					}
				} else {
					if ("0" == actionFlag) {
						pbMethod = "copyfromlocaltosim";
						pbxmltag = "copyfromlocaltosim";
					} else {
						pbMethod = "copyfromsimtolocal";
						pbxmltag = "copyfromsimtolocal";
					}
				}

				var mvCpId = id + ",";
				var pbcontactMap = new Map();
				var xmlIndextag = "RGW/phonebook/" + pbxmltag + "/indexcount";
				var xmlIndexarraytag = "RGW/phonebook/" + pbxmltag + "/indexarray";
				pbcontactMap.put(xmlIndextag, 1);
				pbcontactMap.put(xmlIndexarraytag, mvCpId);

				var retXml = PostXml(gPBubusobjectname, pbMethod, pbcontactMap);

				if (0 == $(retXml).find("result").text()) {
					var msg;
					if ("movefromlocaltosim" == pbMethod) {
						msg = jQuery.i18n.prop("dialog_message_phonebook_device_move_sim_success");
					} else if ("copyfromlocaltosim" == pbMethod) {
						msg = jQuery.i18n.prop("dialog_message_phonebook_device_copy_sim_success");
					} else if ("movefromsimtolocal" == pbMethod) {
						msg = jQuery.i18n.prop("dialog_message_phonebook_sim_move_device_success");
					} else if ("copyfromsimtolocal" == pbMethod) {
						msg = jQuery.i18n.prop("dialog_message_phonebook_sim_copy_device_success");
					} else {
						msg = "Error no method!";
					}
					UpdatePhoneBookList(currentActivePageIdx, true);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"), msg);
				} else {
					//showMsgBox(jQuery.i18n.prop("lPBResponseError"),GetErrorType($(retXml).find("result").text()));
					var errMsg = GetErrorType($(retXml).find("result").text());
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), errMsg);
				}
			});
		}

		function InitPhoneBookPageNum(totalPageNum) {
			var htmlTxt = "";
			for (var idx = 1; idx <= totalPageNum; ++idx) {
				var html =
					"<a style=\"color: red; font-weight: 700; text-decoration: underline;margin-left:3px;cursor:pointer;\" href=\"##\">" +
					idx + "</a>";

				htmlTxt += html;

			}
			document.getElementById("divPhoneBookPageNum").innerHTML = htmlTxt;

			$("#divPhoneBookPageNum").click(function(event) {
				if ($(event.target).is("a")) {
					$(event.target).css("color", "blue");
					$(event.target).addClass("pageSelIdx");
					$(event.target).siblings().css("color", "red");
					$(event.target).siblings().removeClass("pageSelIdx");
					var PBPageIdx = $(event.target).text();
					currentActivePageIdx = PBPageIdx;
					$("#deleteAllPhone").prop("checked", false);
					RefreshDeleteBtn(true);
					UpdatePhoneBookList(PBPageIdx, false);
				}
			});
		}


		function ShowPhoneInfoDlg(phoneInfo) {
			var arrPhoneInfo = phoneInfo.split("$");
			var pbmNumber = arrPhoneInfo[3];
			var pbmHomeNum = arrPhoneInfo[4];
			var pbmOfficeNum = arrPhoneInfo[5];
			var pbmEmail = arrPhoneInfo[6];
			if ("NONE" == pbmHomeNum) {
				pbmHomeNum = "";
			}
			if ("NONE" == pbmOfficeNum) {
				pbmOfficeNum = "";
			}

			if ("NONE" == pbmEmail)
				pbmEmail = "";

			if ("NONE" == pbmNumber)
				pbmNumber = "";

			if (g_bodyWidth <= 430) {
				if (arrPhoneInfo[1] == '1') {
					ShowDlg("phoneInfoDlg", '95%', 220);
				} else {
					ShowDlg("phoneInfoDlg", '95%', 370);
				}

			} else {
				if (arrPhoneInfo[1] == '1') {
					ShowDlg("phoneInfoDlg", 450, 220);
				} else {
					ShowDlg("phoneInfoDlg", 450, 370);
				}
			}
			arrayLabels = document.getElementsByTagName("option");
			//lableLocaliztion(arrayLabels);
			$("#txtName").val(arrPhoneInfo[2]);
			$("#txtMobilePhone").val(pbmNumber);
			$("#selSaveLoc").val(arrPhoneInfo[1]);
			$("#selSaveLoc").attr("disabled", true); //不允许修改存储位置
			if (arrPhoneInfo[1] == '1') { //0 dev  ;  1 sim
				$('#divDeviceSupport').hide();
			} else {
				$('#divDeviceSupport').show();
			}
			$("#selGroup").val(arrPhoneInfo[7]);


			$("#txtEmail").val(pbmEmail);
			$("#txtHomePhone").val(pbmHomeNum);
			$("#txtOfficePhone").val(pbmOfficeNum);

			var phoneIdx = arrPhoneInfo[0];

			clearErrorInfo();

			$("#selSaveLoc").change(function() {
				if (1 == $("#selSaveLoc").val()) { //sim
					$("#divDeviceSupport").hide();
					if (g_bodyWidth <= 430) { //change tankuang de height
						document.getElementById('mbox').style.height = '220px';
					}
				} else {
					$("#divDeviceSupport").show();
					if (g_bodyWidth <= 430) {
						document.getElementById('mbox').style.height = '370px';
					}
				}
			});

			$("#selSaveLoc").trigger("click");
			var arrayLabels = document.getElementsByTagName("h1");
			// lableLocaliztion(arrayLabels);
			arrayLabels = document.getElementsByTagName("label");
			//lableLocaliztion(arrayLabels);
			$("#lt_Phonebook_btnSave").val(jQuery.i18n.prop("lt_Phonebook_btnSave"));
			$("#lt_Phonebook_stcCancelView").text(jQuery.i18n.prop("lt_Phonebook_stcCancelView"));


			//save contact
			$("#lt_Phonebook_btnSave").click(function() {
				var name = UniEncode($("#txtName").val());
				var mobilePhone = $("#txtMobilePhone").val();
				var saveLoc = $("#selSaveLoc").val();
				var email = UniEncode($("#txtEmail").val());
				var homePhone = $("#txtHomePhone").val();
				var officePhone = $("#txtOfficePhone").val();
				var group = $("#selGroup").val();

				$("#lt_Phonebook_stcInputerror").hide();
				if ($("#txtName").val().length == 0) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" + jQuery.i18n.prop(
						"lNameEmpty"));
					return;
				}
				if (IsChineseChar($("#txtName").val()) && $("#txtName").val().length > 6) {
					//if contains chinese character,then the max length is 6
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" + jQuery.i18n.prop(
						"lContainsChineseNametoolong"));
					return;
				}
				if (!IsChineseChar($("#txtName").val()) && $("#txtName").val().length > 10) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" + jQuery.i18n.prop(
						"lNametoolong"));
					return;
				}

				if (!deviceNameValidation_Contain_Chinese($("#txtName").val())) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("ErrInvalidPhoneName"));
					return;
				}


				if ($("#txtMobilePhone").val().length == 0) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcMobileNum") + ":" + jQuery.i18n
						.prop("lMobilePhoneEmpty"));
					return;
				}

				if (!textBoxMaxLength("txtMobilePhone", 15) || mobilePhone.length < 3) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcMobileNum") + ":" + jQuery.i18n
						.prop("lphoneNumbertoolong"));
					return;
				}

				if (!IsPhoneNumber(mobilePhone)) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcMobileNum") + ":" + jQuery.i18n
						.prop("lMobilePhoneError"));
					return;
				}

				if ("0" == saveLoc) {
					if ("" != $("#txtEmail").val() && !IsEmail($("#txtEmail").val())) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcEmail") + ":" + jQuery.i18n.prop(
							"lEmailAddrError"));
						return;
					}

					if (!textBoxMaxLength("txtEmail", 40)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcEmail") + ":" + jQuery.i18n.prop(
							"lNumbertoolong"));
						return;
					}

					if ("" != homePhone && !IsPhoneNumber(homePhone)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcHomeNum") + ":" + jQuery.i18n.prop(
							"lHomePhoneError"));
						return;
					}

					if ("" != homePhone && (!textBoxMaxLength("txtHomePhone", 15) || homePhone.length < 3)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcHomeNum") + ":" + jQuery.i18n.prop(
							"lphoneNumbertoolong"));
						return;
					}

					if ("" != officePhone && !IsPhoneNumber(officePhone)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcOfficeNum") + ":" + jQuery.i18n
							.prop("lOfficePhoneError"));
						return;
					}

					if ("" != officePhone && (!textBoxMaxLength("txtOfficePhone", 15) || officePhone.length < 3)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcOfficeNum") + ":" + jQuery.i18n
							.prop("lphoneNumbertoolong"));
						return;
					}
				}

				var pbcontactMap = new Map();
				pbcontactMap.put("RGW/phonebook/update_pb/location", saveLoc);
				pbcontactMap.put("RGW/phonebook/update_pb/index", phoneIdx);
				pbcontactMap.put("RGW/phonebook/update_pb/name", name);
				pbcontactMap.put("RGW/phonebook/update_pb/mobile", mobilePhone);
				if ("0" == saveLoc) {
					pbcontactMap.put("RGW/phonebook/update_pb/home", homePhone);
					pbcontactMap.put("RGW/phonebook/update_pb/office", officePhone);
					pbcontactMap.put("RGW/phonebook/update_pb/email", email);
					pbcontactMap.put("RGW/phonebook/update_pb/group", group);
				}
				var retXml = PostXml(gPBubusobjectname, "update_pb", pbcontactMap);


				if (0 == $(retXml).find("result").text()) {
					UpdatePhoneBookList("1", true);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop(
						"dialog_message_phonebook_save_contact_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), GetErrorType($(retXml).find("result").text()));
				}


			});
		}

		$("#lt_Phonebook_btnNew").click(function() {
			if (g_bodyWidth < 430) {
				ShowDlg("phoneInfoDlg", '95%', 370);
			} else {
				ShowDlg("phoneInfoDlg", 450, 370);
			}
			$("#selSaveLoc").attr("disabled", false);
			$("#lt_Phonebook_stcInputCheckout").hide();
			clearErrorInfo();
			$("#selSaveLoc").change(function() {
				if (1 == $("#selSaveLoc").val()) {
					$("#divDeviceSupport").hide();
					// 										if(g_bodyWidth<430){  //change tankuang de height
					// 											document.getElementById('mbox').style.height = '220px';
					// 											}
					document.getElementById('mbox').style.height = '220px'; //change tankuang de height
				} else {
					$("#divDeviceSupport").show();
					// 										if(g_bodyWidth<430){  //change tankuang de height
					// 											document.getElementById('mbox').style.height = '370px';
					// 											}
					document.getElementById('mbox').style.height = '370px'; //change tankuang de height
				}
			});

			var pbGroup;
			switch (menuId) {
				case "mLoactionAll":
					pbGroup = "common";
					$("#selGroup").val("0");
					break;
				case "mLoactionCommon":
					pbGroup = "common";
					$("#selGroup").val("0");
					break;

				case "mLoactionFriends":
					pbGroup = "friend";
					$("#selGroup").val("2");
					break;
				case "mLoactionFamliy":
					pbGroup = "family";
					$("#selGroup").val("1");
					break;
				case "mLoactionColleague":
					pbGroup = "colleague";
					$("#selGroup").val("3");
					break;
			}

			if ("mLocationContact" == menuId || "mAllContact" == menuId ||
				"mLoactionAll" == menuId || "mLoactionCommon" == menuId ||
				"mLoactionFriends" == menuId || "mLoactionFamliy" == menuId ||
				"mLoactionColleague" == menuId) {
				$("#selSaveLoc").trigger("click");
			} else {
				$("#selSaveLoc").val(1);
				document.getElementById('mbox').style.height = '220px';
				$("#selSaveLoc").attr("disabled", true);
				if (1 == $("#selSaveLoc").val()) {
					$("#divDeviceSupport").hide();
				} else {
					$("#divDeviceSupport").show();
				}
			}

			var arrayLabels = document.getElementsByTagName("h1");

			arrayLabels = document.getElementsByTagName("label");

			arrayLabels = document.getElementsByTagName("option");

			$("#lt_Phonebook_stcCancelView").text(jQuery.i18n.prop("lt_Phonebook_stcCancelView"));
			$("#lt_Phonebook_btnSave").val(jQuery.i18n.prop("lt_Phonebook_btnSave"));

			//save contact
			$("#lt_Phonebook_btnSave").click(function() {
				var name = UniEncode($("#txtName").val());
				var mobilePhone = $("#txtMobilePhone").val();
				var saveLoc = $("#selSaveLoc").val();
				var email = UniEncode($("#txtEmail").val());
				var homePhone = $("#txtHomePhone").val();
				var officePhone = $("#txtOfficePhone").val();
				var group = $("#selGroup").val();

				$("#lt_Phonebook_stcInputerror").hide();
				if ($("#txtName").val().length == 0) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" + jQuery.i18n.prop(
						"lNameEmpty"));
					return;
				}

				if (IsChineseChar($("#txtName").val()) && $("#txtName").val().length > 6) {
					//if contains chinese character,then the max length is 6
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" + jQuery.i18n.prop(
						"lContainsChineseNametoolong"));
					return;
				}
				if (!IsChineseChar($("#txtName").val()) && $("#txtName").val().length > 10) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" + jQuery.i18n.prop(
						"lNametoolong"));
					return;
				}

				if (!deviceNameValidation_Contain_Chinese($("#txtName").val())) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("ErrInvalidPhoneName"));
					return;
				}

				if ($("#txtMobilePhone").val().length == 0) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcMobileNum") + ":" + jQuery.i18n
						.prop("lMobilePhoneEmpty"));
					return;
				}

				if (!textBoxMaxLength("txtMobilePhone", 15) || mobilePhone.length < 3) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcMobileNum") + ":" + jQuery.i18n
						.prop("lphoneNumbertoolong"));
					return;
				}

				if (!IsPhoneNumber(mobilePhone)) {
					$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcMobileNum") + ":" + jQuery.i18n
						.prop("lMobilePhoneError"));
					return;
				}

				if ("0" == saveLoc) {
					if ("" != $("#txtEmail").val() && !IsEmail($("#txtEmail").val())) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcEmail") + ":" + jQuery.i18n.prop(
							"lEmailAddrError"));
						return;
					}

					if (!textBoxMaxLength("txtEmail", 40)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcEmail") + ":" + jQuery.i18n.prop(
							"lNumbertoolong"));
						return;
					}

					if ("" != homePhone && !IsPhoneNumber(homePhone)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcHomeNum") + ":" + jQuery.i18n
							.prop("lHomePhoneError"));
						return;
					}

					if ("" != homePhone && (!textBoxMaxLength("txtHomePhone", 15) || homePhone.length < 3)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcHomeNum") + ":" + jQuery.i18n
							.prop("lphoneNumbertoolong"));
						return;
					}

					if ("" != officePhone && !IsPhoneNumber(officePhone)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcOfficeNum") + ":" + jQuery.i18n
							.prop("lOfficePhoneError"));
						return;
					}

					if ("" != officePhone && (!textBoxMaxLength("txtOfficePhone", 15) || officePhone.length < 3)) {
						$("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("lt_Phonebook_stcOfficeNum") + ":" + jQuery.i18n
							.prop("lphoneNumbertoolong"));
						return;
					}
				}

				var pbcontactMap = new Map();
				pbcontactMap.put("RGW/phonebook/addnew_pb/location", saveLoc);
				pbcontactMap.put("RGW/phonebook/addnew_pb/name", name);
				pbcontactMap.put("RGW/phonebook/addnew_pb/mobile", mobilePhone);

				if ("0" == saveLoc) { //save in device
					pbcontactMap.put("RGW/phonebook/addnew_pb/home", homePhone);
					pbcontactMap.put("RGW/phonebook/addnew_pb/office", officePhone);
					pbcontactMap.put("RGW/phonebook/addnew_pb/email", email);
					pbcontactMap.put("RGW/phonebook/addnew_pb/group", group);
				}

				var retXml = PostXml(gPBubusobjectname, "addnew_pb", pbcontactMap);

				if (0 == $(retXml).find("result").text()) {
					CloseDlg();
					UpdatePhoneBookList("1", true);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop(
						"dialog_message_phonebook_save_contact_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), GetErrorType($(retXml).find("result").text()));
				}
			});
		});


		$("#lt_Phonebook_btnDelete").click(function() {
			var delIdinSim = "";
			var delIdinLocation = "";
			var Simdeletecount = 0;
			var Locationdeletecount = 0;
			var retXmlSim;
			var retXmlLoc;
			$(".delCheckBox:checked").each(function() {
				saveLoc = $(this).parents("tr").attr("name").split("$")[1];
				if (saveLoc == "0") {
					delIdinLocation = delIdinLocation + $(this).attr("id") + ",";
					Locationdeletecount++;
				} else {
					delIdinSim = delIdinSim + $(this).attr("id") + ",";
					Simdeletecount++;
				}
			});

			if (Simdeletecount != 0) {
				var pbcontactMap = new Map();
				pbcontactMap.put("RGW/phonebook/delete_pb/location", "1");
				pbcontactMap.put("RGW/phonebook/delete_pb/count", Simdeletecount);
				pbcontactMap.put("RGW/phonebook/delete_pb/indexarray", delIdinSim);
				retXmlSim = PostXml(gPBubusobjectname, "delete_pb", pbcontactMap);
			}
			if (Locationdeletecount != 0) {
				var pbcontactMap = new Map();
				pbcontactMap.put("RGW/phonebook/delete_pb/location", "0");
				pbcontactMap.put("RGW/phonebook/delete_pb/count", Locationdeletecount);
				pbcontactMap.put("RGW/phonebook/delete_pb/indexarray", delIdinLocation);
				retXmlLoc = PostXml(gPBubusobjectname, "delete_pb", pbcontactMap);
			}

			if (Simdeletecount != 0 && Locationdeletecount != 0) {
				if (0 == $(retXmlSim).find("result").text() && 0 == $(retXmlLoc).find("result").text()) {
					if (currentActivePageIdx != 1 && $("#deleteAllPhone").prop("checked")) {
						currentActivePageIdx--;
					}
					$("#deleteAllPhone").prop("checked", false);
					UpdatePhoneBookList(currentActivePageIdx, true);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop(
						"dialog_message_phonebook_delete_contacts_success"));
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop(
						"dialog_message_phonebook_delete_contacts_fail"));
				}
			}

			if (Simdeletecount == 0 && Locationdeletecount != 0) {
				var mag_succ = '';
				var mag_fail = '';
				if(Locationdeletecount>1){
					mag_succ = jQuery.i18n.prop("dialog_message_phonebook_delete_contacts_success");
					mag_fail = jQuery.i18n.prop("dialog_message_phonebook_delete_contacts_fail");
				}else{
					mag_succ = jQuery.i18n.prop("dialog_message_phonebook_delete_contact_success");
					mag_fail = jQuery.i18n.prop("dialog_message_phonebook_delete_contact_fail");
				}
				if (0 == $(retXmlLoc).find("result").text()) {
					if (currentActivePageIdx != 1 && $("#deleteAllPhone").prop("checked")) {
						currentActivePageIdx--;
					}
					$("#deleteAllPhone").prop("checked", false);
					UpdatePhoneBookList(currentActivePageIdx, true);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"), mag_succ);
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), mag_fail);
				}
			}

			if (Simdeletecount != 0 && Locationdeletecount == 0) {
				var mag_succ = '';
				var mag_fail = '';
				if(Simdeletecount>1){
					mag_succ = jQuery.i18n.prop("dialog_message_phonebook_delete_contacts_success");
					mag_fail = jQuery.i18n.prop("dialog_message_phonebook_delete_contacts_fail");
				}else{
					mag_succ = jQuery.i18n.prop("dialog_message_phonebook_delete_contact_success");
					mag_fail = jQuery.i18n.prop("dialog_message_phonebook_delete_contact_fail");
				}
				if (0 == $(retXmlSim).find("result").text()) {
					if (currentActivePageIdx != 1 && $("#deleteAllPhone").prop("checked")) {
						currentActivePageIdx--;
					}
					$("#deleteAllPhone").prop("checked", false);
					UpdatePhoneBookList(currentActivePageIdx, true);
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"), mag_succ);
				} else {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), GetErrorType($(retXmlSim).find("result").text()));
				}

			}

		});

		function QuerySmsReport() {
			var _xml = PostXml("sms", "sms.get_status_report");
			var response = $(_xml).find("response").text();
			if (response != "OK" && ++QueryReportTryCount < 5) {
				setTimeout(QuerySmsReport, 1000);
				return;
			}
			QueryReportTryCount = 0;

			var status = $(_xml).find("report").text();
			var tmp = status.split("#");
			var msg = "";
			var phoneNumber = tmp[0];
			if ("1" == tmp[1].substr(0, 1)) {
				msg = phoneNumber + " " + jQuery.i18n.prop("lMessageReportSuccessReceive");
			} else {
				msg = phoneNumber + " " + jQuery.i18n.prop("lMessageReportFailedReceive");
			}
			showMsgBox(jQuery.i18n.prop("lMessageReportTitle"), msg);
		}

		function SendMessage(mobilePhone) {
			if (g_bodyWidth < 430) {
				ShowDlg("divSendMessageInPhoneBook", '95%', 320);
			} else {
				ShowDlg("divSendMessageInPhoneBook", 450, 250);
			}

			$("#txtContact").val(mobilePhone).css("background", "#ccc");
			//           LocalAllElement();

			$('#txtSmsContentInPhoneBook').on('contextmenu', function(e) {
				e.preventDefault();
				return false;
			});

			var bind_name = 'input';
			if (navigator.userAgent.indexOf("MSIE") != -1) {
				bind_name = 'propertychange';
			}
			$('#txtSmsContentInPhoneBook').bind(bind_name, function() {
				checkLength();
			})
			$("#lt_Phonebook_btnSendMsg").click(function() {
				var retXml = PostXml("sim", "get_sim_status");
				if (1 == $(retXml).find("sim_status").text()) {
					g_bSimCardExist = true;
				} else {
					g_bSimCardExist = false;
				}
				if (!g_bSimCardExist) {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop("lsmsSimCardAbsent"));
					return;
				}

				var messageBody = $("#txtSmsContentInPhoneBook").val();

				if ("" == messageBody) {
					document.getElementById("lt_phonebook_stcSmsErrorInfo").style.display = "inline";
					$("#lt_phonebook_stcSmsErrorInfo").text(jQuery.i18n.prop("lSmsIsEmpty"));
					return;
				}

				var bGsm7Encode = 0;
				if (IsGSM7Code(messageBody)) {
					bGsm7Encode = 1;
					if (messageBody.length > 765) {
						$("#lt_phonebook_stcSmsErrorInfo").text(jQuery.i18n.prop("lt_sms_stcSmsLenghtError"));
						document.getElementById("lt_phonebook_stcSmsErrorInfo").style.display = "inline";
						return;
					}
				} else {
					bGsm7Encode = 0;
					if (messageBody.length > 335) {
						$("#lt_phonebook_stcSmsErrorInfo").text(jQuery.i18n.prop("lt_sms_stcSmsLenghtError"));
						document.getElementById("lt_phonebook_stcSmsErrorInfo").style.display = "inline";
						return;
					}
				}



				var smsMap = new Map();
				smsMap.put("RGW/sms_info/sms/id", -1);
				smsMap.put("RGW/sms_info/sms/gsm7", bGsm7Encode);
				smsMap.put("RGW/sms_info/sms/address", mobilePhone + ",");
				smsMap.put("RGW/sms_info/sms/body", UniEncode(messageBody));
				smsMap.put("RGW/sms_info/sms/date", GetSmsTime());
				smsMap.put("RGW/sms_info/sms/protocol", 0);


				var retXml = PostXml("sms", "sms.send", smsMap);
				if (0 != $(retXml).find("resp").text()) {
					showMsgBox(jQuery.i18n.prop("dialog_message_phonebook_title"), jQuery.i18n.prop("lt_sms_sendFailed"));
				} else {
					//showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_phonebook_title"),jQuery.i18n.prop("dialog_message_phonebook_send_sms_success"));
					var smsConfig = PostXml("sms", "sms.get_config");
					var report = $(smsConfig).find("report").text();
					if (report == "1") { // == 1 open Delivery Report
						QueryReportTryCount = 0;
						QuerySmsReport();
					}
				}
			});
		}

		function checkLength() {
			$("#lt_phonebook_stcSmsErrorInfo").hide();
			var messageBody = $("#txtSmsContentInPhoneBook").val();
			var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;

			var msgLen = messageBody.length;
			var charCount, itemCount;
			if (!IsGSM7Code(messageBody)) {
				if (msgLen > 335) {
					$("#txtSmsContentInPhoneBook").val(messageBody.substr(0, 335));
					msgLen = 335;
				}
				charCount = "(" + msgLen + "/335)";
				if (msgLen <= 70) {
					itemCount = 1;
				} else {
					itemCount = Math.floor(msgLen / 67 + (msgLen % 67 > 0 ? 1 : 0));
				}

			} else { //english
				if (msgLen > 765) {
					document.getElementById("lt_phonebook_stcSmsErrorInfo").style.display = "inline";
					$("#lt_phonebook_stcSmsErrorInfo").text(jQuery.i18n.prop("lt_sms_stcSmsLenghtError"));
					$("#txtSmsContentInPhoneBook").val(messageBody.substr(0, 765));
					msgLen = 765;
				}
				var specString = "^{}\\[]~|";
				for (var idx = 0; idx < messageBody.length; ++idx) {
					if (-1 != specString.indexOf(messageBody[idx])) {
						++msgLen;
					}
				}
				if (msgLen <= 160) {
					itemCount = 1;
				} else {

					if (-1 != specString.indexOf(messageBody[152])) {
						++msgLen;
					}
					itemCount = Math.floor(msgLen / 153 + (msgLen % 153 > 0 ? 1 : 0)); //3¤?ìD???ì??ìD???óD153 ??×?·?
				}

				charCount = "(" + msgLen + "/765)";
			}

			$("#inputcountInPhoneBook").text(charCount);
			$("#inputItemCountInPhoneBook").text("(" + itemCount + "/5)");
		}


		function GetErrorType(result) {

			var errorTxt = "";

			if ("-1" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetfailedErr");
			}
			if ("-2" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetfileErr");
			}
			if ("-3" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetSIMFullErr");
			}
			if ("-4" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetlocationFlashFullErr");
			}
			if ("-5" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetArgErr");
			}
			if ("-6" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetNoConactErr");
			}
			if ("-7" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetlocInitErr");
			}
			if ("-8" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetSIMInitErr");
			}
			if ("-9" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetNametoolongErr");
			}
			if ("-10" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetNullNameErr");
			}
			if ("-11" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetEmailtoolongErr");
			}
			if ("-12" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetNumbertoolongErr");
			}
			if ("-13" == result) {
				errorTxt = jQuery.i18n.prop("lPBRetNoMemoryErr");
			}
			return errorTxt;

		}

		return this;
	}
})(jQuery);
