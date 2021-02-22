(function($) {
    $.fn.objSms = function(InIt) {
        var PHONE_NUM_PER_PAGE = 10;
        var gSmsModelName = "sms";
        var menuId = InIt;
        var bSimPresent = false;
        var bPNLocked = false;
        var bPINLocked = false;
        var QueryReportTryCount = 0;

        LoadWebPage("html/sms/SMS.html");
        var phoneNumberMap = new Map();
        this.onLoad = function(flag) {
            SetLocation();
            GetSimStatus();

            UpdateSmsList(1,true);
            BindEventForSmsList();
        }

        GetPhoneBookList();


        function SetLocation() {

            $("#lt_sms_stcTitle").text(jQuery.i18n.prop(menuId));

            if ("mDeviceInbox" == menuId/* || "mSmsOutbox" == menuId*/) {
                $("#lt_sms_btnCopy").val(jQuery.i18n.prop("lt_sms_stcmeucopytosim"));
                $("#lt_sms_btnMove").val(jQuery.i18n.prop("lt_sms_stcmeumovetosim"));
            }
            if ("mSimInbox" == menuId) {
                $("#lt_sms_btnCopy").val(jQuery.i18n.prop("lt_sms_stcmeucopytolocal"));
                $("#lt_sms_btnMove").val(jQuery.i18n.prop("lt_sms_stcmeumovetolocal"));
            }

            if ("mSmsDrafts" == menuId) {
                $("#lt_sms_btnCopy").val(jQuery.i18n.prop("lt_sms_stcmeucopytosim"));
                $("#lt_sms_btnMove").val(jQuery.i18n.prop("lt_sms_stcmeumovetosim"));
                $("#lt_sms_stcRecvTime").text(jQuery.i18n.prop("lt_sms_stc_Time")); 
                $("#lt_sms_stcFrom").text(jQuery.i18n.prop("lsmsReceiver"));
            }

            if ("mSmsOutbox" == menuId) {
                $("#lt_sms_stcFrom").text(jQuery.i18n.prop("lsmsReceiver"));
                $("#lt_sms_stcRecvTime").text(jQuery.i18n.prop("lt_sms_stc_Time")); 
            }
        }

        function GetSimStatus() {
            var retXml = PostXml("sim","get_sim_status");
            if(1 == $(retXml).find("sim_status").text()) {
                bSimPresent = true;
            }
            var pinStatus = $(retXml).find("pin_status").text();
            var perso = $(retXml).find("perso_substate").text()
            if(4 == pinStatus && (perso == "3" || perso == "8")){//Lock network
            	bPNLocked = true;
	   			return;
            }
     		if(pinStatus == "2"){//Lock PIN
     			bPINLocked = true;
     			return;
     		}
        }

        function AddSmsToList(smsId,address,contactId,date,read,location,status,body,protocol,type) {

            body=body.replace(/</ig,"&lt").replace(/>/ig,"&gt").replace(/[ ]/g,"&nbsp");
            //read: UNREAD = 0, READ = 1
            //status: success = 0, send failed = 1
            //location: LOCAL = 0, SIM = 1
            var imgSrc = "";
            switch (menuId) {
                case "mDeviceInbox":
                case "mSimInbox":
                    if(1 == read) imgSrc = "images/readedSms.png";
                    else imgSrc = "images/unreadSms.png";
                    break;
                case "mSmsOutbox":
                    if(1 == status) imgSrc = "images/SmssendFailed.png";
                    else imgSrc = "images/SendSmsSuccess.png";
                    break;
                case "mSmsDrafts":
                    imgSrc = "images/drafts.png";
                    break;
            }

            //show contact name if phone number is recorded in PB, or show phone number
            var contactName = phoneNumberMap.get(address);
            var tdStyle = "";
            if(null == contactName) {
                contactName = address;
                tdStyle = " style=\"cursor:pointer;\"";
            }
            var htmlText = "<tr><td id=\"" + contactId + "\" name=\"" + address + "\"" + tdStyle + ">" + contactName + "</td>"
                           + "<td style=\"cursor: pointer;\" id=\"" + smsId + "\" class=\"row\">" + body + "</td>"
                           + "<td><span>" + date + "</span></td>"
                           + "<td> <img src=\"" + imgSrc + "\"/></td>"
                           + "<td><input type=\"checkbox\"/></td></tr>";

            $("#smsListInfo").append(htmlText);
						var htmlTextPhone = "<tr><td id=\"" + contactId + "\" name=\"" + address + "\"" + tdStyle + ">" + contactName + "</td>"
                           + "<td style=\"cursor: pointer;\" id=\"" + smsId + "\" ><div class=\"row\">" + body + "<div></td>"
                          
                           + "<td> <img src=\"" + imgSrc + "\"/></td>"
                           + "<td><input type=\"checkbox\"/></td></tr>";
													 $("#smsListInfo_phone").append(htmlTextPhone);
        }

        function InitSmsPageNum(totalPageNum,curSelPage) {
            $("#divSmsPageNum").empty();
            for (var idx = 1; idx <= totalPageNum; ++idx) {
                var htmlTxt = "<a style=\"color: red; font-weight: 700; text-decoration: underline;margin-left:3px;cursor:pointer;\" href=\"##\">" + idx + "</a>";
                $("#divSmsPageNum").append(htmlTxt);
            }

            var SelPage = curSelPage - 1;
            var $Selector = "#divSmsPageNum a:eq(" + SelPage + ")";
            $($Selector).css("color", "blue");
            $($Selector).siblings().css("color", "red");
            $($Selector).addClass("pageSelIdx");
            $($Selector).siblings().removeClass("pageSelIdx");
        }


        $("#divSmsPageNum").click(function(event) {
            if ($(event.target).is("a")) {
                $(event.target).css("color", "blue");
                $(event.target).addClass("pageSelIdx");
                $(event.target).siblings().css("color", "red");
                $(event.target).siblings().removeClass("pageSelIdx");
                var smsPageIdx = $(event.target).text();
                $("#deleteAllSms").prop("checked", false);
                $("#lt_sms_btnDelete").hide();
                $("#lt_sms_btnCopy").hide();
                $("#lt_sms_btnMove").hide();
                UpdateSmsList(smsPageIdx, false);
            }
        });




        function UpdateSmsList(curSelPage, bInitFlag) {
            $("#smsListInfo").empty();
            $("#smsListInfo_phone").empty();

            var smsListByTypeMap = new Map();
            smsListByTypeMap.put("RGW/sms_info/sms/page_index",curSelPage);
            switch (menuId) {
                case "mDeviceInbox":
                    smsListByTypeMap.put("RGW/sms_info/sms/list_type",0);
                    break;
                case "mSmsOutbox":
                    smsListByTypeMap.put("RGW/sms_info/sms/list_type",1);
                    break;
                case "mSimInbox":
                    if (!bSimPresent) {
                        showAlert("lsmsSimCardAbsent");
                        return;
                    }
                    if(bPNLocked){
                    	showMsgBox(jQuery.i18n.prop("SIMList"),jQuery.i18n.prop("lPlsUnlockPNFirst"));
                    	$("#lt_sms_btnNew").prop("disabled",true);
                    	return;
                    }
                    if(bPINLocked){
                    	showMsgBox(jQuery.i18n.prop("SIMList"),jQuery.i18n.prop("lPinEnable"));
                    	return;
                    }
                    smsListByTypeMap.put("RGW/sms_info/sms/list_type",3);
                    break;
                case "mSmsDrafts":
                    smsListByTypeMap.put("RGW/sms_info/sms/list_type",2);
                    break;
            }

            var retXml;
            if (bInitFlag) {
                retXml = PostXmlNoShowWaitBox(gSmsModelName, "sms.list_by_type", smsListByTypeMap);
                if(0 != $(retXml).find("resp").text()) {
                    return;
                }

                InitSmsPageNum($(retXml).find("page_count").text(),curSelPage);
            } else {
            	retXml = PostXmlNoShowWaitBox(gSmsModelName, "sms.list_by_type", smsListByTypeMap);
            }

            var smsCountInCurPage = parseInt($(retXml).find("count").text());
            var smsItemIdx = 1;
            while(smsItemIdx <= smsCountInCurPage) {
                var smsTag = "s" + smsItemIdx;
                $(retXml).find(smsTag).each(function() {
                    var smsId = $(this).find("id").text();
                    var address = $(this).find("address").text();
                    var contactId = $(this).find("contact_id").text();
                    var date = $(this).find("date").text().split(",");
                    var protocol= $(this).find("protocol").text();
                    var type = $(this).find("type").text();
                    var read = $(this).find("read").text();
                    var location = $(this).find("location").text();
                    var status= $(this).find("status").text();
		       
		          var totalSegment = $(this).find("totalSegment").text();
                    var body= UniDecode($(this).find("body").text());
		       if(totalSegment > 1){
 				var segment = $(this).find("segmentNum").text();
				body =  "["+segment+"/"+totalSegment+"] "+body;
			}
		       
                    var formatTime = "20" + date[0] + "/" + date[1] + "/" + date[2] + " " + date[3] + ":" + date[4] + ":" + date[5];
                    if(undefined == date[2]) { //avoid date is emtpy string.
                        formatTime = "";
                    }
                    AddSmsToList(smsId,address,contactId,formatTime,read,location,status,body,protocol,type);
                });
                ++smsItemIdx;
            }

            BindEventForSmsList();
        }



        function BindEventForSmsList() {
            $("#tableSMS #deleteAllSms").click(function() {
                if($(this).prop("checked")) {
                    $("#smsListInfo :checkbox").prop("checked",true);
                } else {
                    $("#smsListInfo :checkbox").prop("checked",false);
                }
                if($("#smsListInfo :checked").length>0) {
                    $("#lt_sms_btnDelete").show();
                    if ("mDeviceInbox" == menuId || "mSimInbox" == menuId) {
                        $("#lt_sms_btnCopy").show();
                        $("#lt_sms_btnMove").show();
                    }
                } else {
                    $("#lt_sms_btnDelete").hide();
                    $("#lt_sms_btnCopy").hide();
                    $("#lt_sms_btnMove").hide();
                }
            });
						
						$("#tableSMS_phone #deleteAllSms").click(function() {
								if($(this).prop("checked")) {
										$("#smsListInfo_phone :checkbox").prop("checked",true);
								} else {
										$("#smsListInfo_phone :checkbox").prop("checked",false);
								}
								if($("#smsListInfo_phone :checked").length>0) {
										$("#lt_sms_btnDelete").show();
										if ("mDeviceInbox" == menuId || "mSimInbox" == menuId) {
												$("#lt_sms_btnCopy").show();
												$("#lt_sms_btnMove").show();
										}
								} else {
										$("#lt_sms_btnDelete").hide();
										$("#lt_sms_btnCopy").hide();
										$("#lt_sms_btnMove").hide();
								}
						});
						
            $("#smsListInfo :checkbox").click(function() {
                if($("#smsListInfo :checked").length == $("#smsListInfo tr").length) {
                    $("#tableSMS #deleteAllSms").prop("checked",true);
                } else {
                    $("#tableSMS #deleteAllSms").prop("checked",false);
                }
                if($("#smsListInfo :checked").length>0) {
                    $("#lt_sms_btnDelete").show();
                    if ("mDeviceInbox" == menuId || "mSimInbox" == menuId) {
                        $("#lt_sms_btnCopy").show();
                        $("#lt_sms_btnMove").show();
                    }
                } else {
                    $("#lt_sms_btnDelete").hide();
                    $("#lt_sms_btnCopy").hide();
                    $("#lt_sms_btnMove").hide();
                }
            });

						$("#smsListInfo_phone :checkbox").click(function() {
								if($("#smsListInfo_phone :checked").length == $("#smsListInfo_phone tr").length) {
										$("#tableSMS_phone #deleteAllSms").prop("checked",true);
								} else {
										$("#tableSMS_phone #deleteAllSms").prop("checked",false);
								}
								if($("#smsListInfo_phone :checked").length>0) {
										$("#lt_sms_btnDelete").show();
										if ("mDeviceInbox" == menuId || "mSimInbox" == menuId) {
												$("#lt_sms_btnCopy").show();
												$("#lt_sms_btnMove").show();
										}
								} else {
										$("#lt_sms_btnDelete").hide();
										$("#lt_sms_btnCopy").hide();
										$("#lt_sms_btnMove").hide();
								}
						});
						
            $("tbody tr").each(function() {
                //read sms content.
                $(this).children("td:eq(1)").unbind("click").click(function() {
                    var smsId = $(this).attr("id");
                    var readSmsMap = new Map();
                    readSmsMap.put("RGW/sms_info/sms/id",smsId);


                    var retXml = PostXmlNoShowWaitBox(gSmsModelName, "sms.get_by_id", readSmsMap);
                    if(0 != $(retXml).find("resp").text()) {
                        return;
                    }
                    var smsContents = UniDecode($(retXml).find("body").text());
                    var contacts = $(retXml).find("address").text();
                    var date = $(retXml).find("date").text().split(",");
                    var formatTime = "20" + date[0] + "/" + date[1] + "/" + date[2] + " " + date[3] + ":" + date[4] + ":" + date[5];
                    //$("#lt_sms_meuRightClick").hide();
                    $("#divSmsList").hide();
                    $("#divSmsChatRoom").show();
                    $(".search-choice").remove();
                    $("#divRecvSmsContent").show();
                    $("#txtSmsContent").val("");
                    $("#txtSmsCharaNum").text("(0/765)");
                    $("#txtSmsItemNum").text("(0/5)");

                    if (menuId == "mSmsDrafts") {
                        $("#lt_sms_btnSend").show();
                        $("#divNewSmsContent").show();
                        $("#divRecvSmsContent").hide();
                        $("#txtSmsContent").val(smsContents);
                        $("#txtSmsContent").attr("name", smsId); //save smsId
                        SetSmsCharacterNum(smsContents);
                        $("#txtNumberList").val(contacts);
                    } else {
                        smsContents=smsContents.replace(/</ig,"&lt").replace(/>/ig,"&gt").replace(/[ ]/g,"&nbsp");
                        smsContents = EditHrefs(smsContents);

                        var contactHtmlText = "<li class=\"search-choice\"><span>" + contacts + "</span></li>";
                        $("#chosen-search-field-input").before(contactHtmlText);
                        $("#txtRecvSmsContent").html(smsContents);
                        $("#txtRecvSmsContent").attr("name", smsId);
                        document.getElementById("recvSmsTimeImg").innerHTML = formatTime;
                        $("#chosen-search-field-input").hide();
                        $("#lt_sms_btnSend").show();
                    }
                });

                //save phone number to phonebook
                $(this).children("td:eq(0)").click(function() {
                    if('pointer' != this.style.cursor) {
                        return;
                    }

                    SavePhoneBook($(this).attr("name"));
                });
            });
        }


        function SavePhoneBook(phoneNumber) {
					if(g_bodyWidth<=430){
						ShowDlg("divAddPhoneInfoDlg","95%",370);
					}else{
						ShowDlg("divAddPhoneInfoDlg",450,370);
					}
						
            $("#txtMobilePhone").val(phoneNumber);

            $("#selSaveLoc").click(function () {
                if (1 == $(this).val()) {
                    $("#divDeviceSupport").hide();
                } else {
                    $("#divDeviceSupport").show();
                }
            });


            $("#selSaveLoc").attr("disabled", false);
            $("#lt_Phonebook_stcInputCheckout").hide();
            $("#txtName,#txtMobilePhone,#txtEmail,#txtHomePhone,#txtOfficePhone").focus(function () {
                $("#lt_Phonebook_stcInputCheckout").hide();
            });

            //save contact
            $("#lt_Phonebook_btnSave").click(function () {
                var contactName = $("#txtName").val();
                var name = UniEncode($("#txtName").val());
                var mobilePhone = $("#txtMobilePhone").val();
                var saveLoc = $("#selSaveLoc").val();
                var emailAddr = UniEncode($("#txtEmail").val());
                var homePhone = $("#txtHomePhone").val();
                var officePhone = $("#txtOfficePhone").val();
                var group = $("#selGroup").val();

                if ($("#txtName").val().length == 0) {
                    $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lNameEmpty"));
                    return;
                }

                if ("" == mobilePhone) {
                    $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lMobilePhoneEmpty"));
                    return;
                }

                if(!deviceNameValidation_Contain_Chinese($("#txtName").val())) {            
            	    $("#lt_Phonebook_stcInputerror").show().text(jQuery.i18n.prop("ErrInvalidPhoneName"));         
	  		        return;            
	  	        }
                if(IsChineseChar($("#txtName").val()) && $("#txtName").val().length >6){
					 $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" +jQuery.i18n.prop("lContainsChineseNametoolong"));
	                    return;
				}
				if(!IsChineseChar($("#txtName").val()) && $("#txtName").val().length >10){
					$("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lt_Phonebook_stcName") + ":" +jQuery.i18n.prop("lNametoolong"));
                   return;
				}
                if (!IsPhoneNumber(mobilePhone)) {
                    $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lMobilePhoneError"));
                    return;
                }

                if ("1" == saveLoc) {
                    if ("" != $("#txtEmail").val() && !IsEmail($("#txtEmail").val())) {
                        $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lEmailAddrError"));
                        return;
                    }

                    if ("" != homePhone && !IsPhoneNumber(homePhone)) {
                        $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lHomePhoneError"));
                        return;
                    }

                    if ("" != officePhone && !IsPhoneNumber(officePhone)) {
                        $("#lt_Phonebook_stcInputCheckout").show().text(jQuery.i18n.prop("lOfficePhoneError"));
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
                    pbcontactMap.put("RGW/phonebook/addnew_pb/email", emailAddr);
                    pbcontactMap.put("RGW/phonebook/addnew_pb/group", group);
                }
                CloseDlg();
                var retXml = PostXmlNoShowWaitBox("phonebook", "addnew_pb", pbcontactMap);

                if (0 != $(retXml).find("result").text()) {
                    var errMsg = GetPBErrorType($(retXml).find("result").text());
                    showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), errMsg);
                } else {
                    phoneNumberMap.put(mobilePhone,contactName);
					UpdateSmsList($("#divSmsPageNum .pageSelIdx").text(), false); //refresh sms list to show contact name.
					showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_save_contact_success"));
                }

            });
        }

        function GetPBErrorType(result) {

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
            return errorTxt;

        }

        function SetSmsCharacterNum(smsContents) {
            var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            var msgLen = smsContents.length;
            var charCount, itemCount;
            if (!IsGSM7Code(smsContents)) {
                charCount = "(" + msgLen + "/335)";
                if (msgLen <= 70) {
                    itemCount = 1;
                } else {
                    itemCount = Math.floor(msgLen / 67 + (msgLen % 67 > 0 ? 1 : 0)); //one sms contains 67 characters if chinese ultra-long short message
                }
            } else { //english
                if (msgLen <= 160) {
                    itemCount = 1;
                } else {
                    itemCount = Math.floor(msgLen / 153 + (msgLen % 153 > 0 ? 1 : 0)); //one sms contains 153 characters if english ultra-long short message
                }
                charCount = "(" + msgLen + "/765)";
            }

            $("#txtSmsCharaNum").text(charCount);
            $("#txtSmsItemNum").text("(" + itemCount + "/5)");
        }

        function QuerySmsReport() {
            var _xml = PostXml("sms","sms.get_status_report");
            var response = $(_xml).find("response").text();
            if (response != "OK" && QueryReportTryCount++ < 15) {
            	setTimeout(QuerySmsReport, 2000);
            	return;
            } else if (QueryReportTryCount >= 15) {
            	QueryReportTryCount = 0;
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

        function SendSms() {
            var phoneNumber = GetSmsNumberList();
            if ("" == phoneNumber || "," == phoneNumber) {
                $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lContactIsEmpty")).show();
                return 0;
            } else {
            	$("#lt_sms_stcSmsErrorInfo").hide();
            }

            var isEmpty = true;
            for(var idx = 0; idx < phoneNumber.split(",").length; ++idx) {
                if("" != phoneNumber.split(",")[idx] && !IsPhoneNumber(phoneNumber.split(",")[idx])) {
                    $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lPhoneNumberFormatError")).show();
                    return 0;
                }
                if (isEmpty && "" == phoneNumber.split(",")[idx]) {
                	isEmpty = true;
                } else {
                	isEmpty = false;
                }
            }

            if (isEmpty) {
                $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lContactIsEmpty")).show();
                return 0;
            }

            var messageBody = $("#txtSmsContent").val();

            if("" == messageBody) {
                $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lSmsIsEmpty")).show();
                return 0;
            }

			var bGsm7Encode;
            if(IsGSM7Code(messageBody)) {
				bGsm7Encode = 1;
                if (messageBody.length > 765) {
                    $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lt_sms_stcSmsLenghtError")).show();
                    return 0;
                }
            } else {
            	bGsm7Encode = 0;
                if (messageBody.length > 335) {
                    $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lt_sms_stcSmsLenghtError")).show();
                    return 0;
                }
            }
            
            var simId = $("#txtSmsContent").attr("name");
            var smsMap = new Map();
            if (undefined != simId && "" != simId) {
                smsMap.put("RGW/sms_info/sms/id",simId);
            } else {
            	smsMap.put("RGW/sms_info/sms/id",-1);
            }
			smsMap.put("RGW/sms_info/sms/gsm7",bGsm7Encode);
            smsMap.put("RGW/sms_info/sms/address",phoneNumber);
            smsMap.put("RGW/sms_info/sms/body",UniEncode(messageBody));
            smsMap.put("RGW/sms_info/sms/date",GetSmsTime());
            smsMap.put("RGW/sms_info/sms/protocol",0);


            var retXml = PostXml(gSmsModelName, "sms.send", smsMap);
            if(0 != $(retXml).find("resp").text()) {
//            	showAlert("lt_sms_sendFailed");
            	showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_send_sms_fail"));
                return 0;
            } else {
                //showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_send_sms_success"));
            	var smsConfig = PostXml("sms","sms.get_config");
            	var report = $(smsConfig).find("report").text();
            	if (report == "1") {// == 1 open Delivery Report
            		QueryReportTryCount = 0;
            		QuerySmsReport();
            	}
            }
            return 1;
        }



        $("#lt_sms_btnSaveDraft").click(function() {

            var messageBody, smsId;

            var phoneNumber = GetSmsNumberList();
            if ("" == phoneNumber || "," == phoneNumber) {
                $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lContactIsEmpty")).show();
                return 0;
            } else {
                $("#lt_sms_stcSmsErrorInfo").hide();
            }

            var isEmpty = true;
            for(var idx = 0; idx < phoneNumber.split(",").length; ++idx) {
                if("" != phoneNumber.split(",")[idx] && !IsPhoneNumber(phoneNumber.split(",")[idx])) {
                    $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lPhoneNumberFormatError")).show();
                    return 0;
                }
                if (isEmpty && "" == phoneNumber.split(",")[idx]) {
                	isEmpty = true;
                } else {
                	isEmpty = false;
                }
            }

            if (isEmpty) {
                $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lContactIsEmpty")).show();
                return 0;
            }
            
            if ($("#divNewSmsContent").is(":visible")) { //new add draft
                messageBody = $("#txtSmsContent").val();
                smsId = -1;
            } else { //edit draft
                messageBody = $("#txtRecvSmsContent").html();
                smsId = $("#txtRecvSmsContent").attr("name");
            }

            if("" == messageBody) {
                $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lSmsIsEmpty")).show();
                return;
            }


            var bIsGSM7Code = IsGSM7Code(messageBody);


//             if( (!bIsGSM7Code && messageBody.length > 70) || (bIsGSM7Code && messageBody.length > 160)) {
//                 $("#lt_sms_stcSmsErrorInfo").text(jQuery.i18n.prop("lSaveSmsError")).show();
//                 return;
//             }
// 

            var smsMap = new Map();
            smsMap.put("RGW/sms_info/sms/id",smsId);
			smsMap.put("RGW/sms_info/sms/gsm7",bIsGSM7Code?1:0);
            smsMap.put("RGW/sms_info/sms/address",phoneNumber);
            smsMap.put("RGW/sms_info/sms/body",UniEncode(messageBody));
            smsMap.put("RGW/sms_info/sms/date",GetSmsTime());
            smsMap.put("RGW/sms_info/sms/type",2);
            smsMap.put("RGW/sms_info/sms/protocol",0);

            var retXml = PostXml(gSmsModelName, "sms.save", smsMap);
            if(0 != $(retXml).find("resp").text()) {
                alert("save draft failed.");
            }
            $("#divSmsList").show();
            $("#divSmsChatRoom").hide();
            UpdateSmsList(1,true);
        });




        $("#lt_sms_btnSend").click(function() {
            if (!bSimPresent) {
//                showAlert("lsmsSimCardAbsent");
                showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("lsmsSimCardAbsent"));
                return;
            }
            if (SendSms() == 1) {
	            $("#divSmsChatRoom").hide();
	            $("#divSmsList").show();
	            UpdateSmsList(1,true);
        	}
        });



        function GetSelSmsId() {
            var smsIdSet = "";
            $("tbody :checked").each(function() {
                smsIdSet = smsIdSet + $(this).parent().prevAll("td:eq(2)").attr("id") + ",";
            });
            smsIdSet = smsIdSet.substr(0,smsIdSet.length-1);
            return smsIdSet;
        }

        function DeleteSms() {
            var smsMap = new Map();
            smsMap.put("RGW/sms_info/sms/id",GetSelSmsId());
            var retXml = PostXml(gSmsModelName, "sms.delete", smsMap);
            if(0 == $(retXml).find("resp").text()) {
                UpdateSmsList(1,true);
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_delete_sms_success"));
            } else {
                showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_delete_sms_fail"));
            }
        }

        $("#lt_sms_btnDelete").click(function() {
            DeleteSms();
            $("#deleteAllSms").prop("checked", false);
            $("tbody :checkbox").prop("checked",false);
            $("#lt_sms_btnDelete").hide();
            $("#lt_sms_btnCopy").hide();
            $("#lt_sms_btnMove").hide();
        });


        $("#txtNumberList").click(function() {
					$('#lt_sms_stcSmsErrorInfo').hide();
            if (jQuery.i18n.prop("lt_sms_chooseNumberTip") == $("#txtNumberList").val()) {
                $("#txtNumberList").val("");
            }
        });
				$('#txtSmsContent').click(function(){
					$('#lt_sms_stcSmsErrorInfo').hide();
					})
        $("#txtNumberList").mouseup(function(event) {
            if ($(event.target).parents("#chosenUserSelectDiv").length == 0) {
                $("#chosenUserSelectDiv").hide();
            }
        });
        
        $('#txtSmsContent').on('contextmenu', function(e) {
        	e.preventDefault();
        	return false;
        });
       
        var bind_name = 'input';
        if (navigator.userAgent.indexOf("MSIE") != -1){
          bind_name = 'propertychange';
        }
        $('#txtSmsContent').bind(bind_name, function(){
        	valuateContLen();
        })
        
        function valuateContLen() {
            $("#lt_sms_stcSmsErrorInfo").hide();
            var messageBody = document.getElementById("txtSmsContent").value;
            // var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;

            var msgLen = messageBody.length;
            var charCount, itemCount;
            if (!IsGSM7Code(messageBody)) {
                if (msgLen > 335) {
                    $("#txtSmsContent").val(messageBody.substr(0, 335));
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
                    $("#txtSmsContent").val(messageBody.substr(0, 765));
                    msgLen = 765;
                }

                if (msgLen <= 160) {
                    itemCount = 1;
                } else {
                    itemCount = Math.floor(msgLen / 153 + (msgLen % 153 > 0 ? 1 : 0));
                }

                charCount = "(" + msgLen + "/765)";
            }

            $("#txtSmsCharaNum").text(charCount);
            $("#txtSmsItemNum").text("(" + itemCount + "/5)");
        }/*)*/;
        
        
        function GetSmsNumberList() {
            var phoneNumber = "";
            $(".chzn-container .chzn-choices .search-choice").each(function() {
                var contactPersonInfo = $(this).children("span").text();
                var number;
                if (-1 != contactPersonInfo.indexOf("/")) {
                    number = contactPersonInfo.substr(contactPersonInfo.indexOf("/") + 1);
                } else {
                    number = contactPersonInfo;
                }
                phoneNumber = phoneNumber + number + ";";
            });

            if ($("#txtNumberList").is(":visible")) {
                phoneNumber += $("#txtNumberList").val();
            }

            if (";" != phoneNumber.charAt(phoneNumber.length - 1)) {
                phoneNumber = phoneNumber + ";"
            }

	    /*
            if (phoneNumber.indexOf(";") == phoneNumber.length - 1) {
                phoneNumber = phoneNumber.substr(0, phoneNumber.length - 1);
            }
	    */
            phoneNumber = phoneNumber.replace(new RegExp(";", "gm"), ",");

            return phoneNumber;
        }

        $("#txtNumberList").dblclick(function() {
            if(0 == phoneNumberMap.size()) {
                return;
            }
            $("#chosenUserSelectDiv").show();
            $("#chosenUserSelect").empty();
            //load contacts list
            for (var idx = 0; idx < phoneNumberMap.size(); ++idx) {
                var pbmName = phoneNumberMap.getValue(idx);
                var pbmNumber = phoneNumberMap.getKey(idx);
                var optionNodeText = "<option value=\"" + pbmNumber + "\">" + pbmName + "/" + pbmNumber + "</option>";
                $("#chosenUserSelect").append(optionNodeText);
            }
        });

        $("#chosenUserSelect").dblclick(function() {
            var phoneInfo = $("#chosenUserSelect").find("option:selected").text();
            var number = phoneInfo.substring(phoneInfo.indexOf("/") + 1);

            var allNumber = $("#txtNumberList").val();
            if ("" == allNumber) {
                allNumber = number;
            } else {
                allNumber = allNumber + ";" + number;
            }

            $("#txtNumberList").val(allNumber);
            $("#chosenUserSelectDiv").hide();
        });



        function CopySMS() {

            if (menuId == "mDeviceInbox" || menuId == "mSmsDrafts") {

                if (!bSimPresent) {
                    showAlert("lsmsSimCardAbsent");
                    return;
                }
            }

            var smsMap = new Map();
            smsMap.put("RGW/sms_info/sms/id",GetSelSmsId());

            if (menuId == "mDeviceInbox" || menuId == "mSmsOutbox")
                smsMap.put("RGW/sms_info/sms/action",3); //COPY_SMS_TO_SIM=3
            else
                smsMap.put("RGW/sms_info/sms/action",1); //COPY_SMS_TO_LOCAL=1

            var retXml = PostXml(gSmsModelName, "sms.move", smsMap);
            UpdateSmsList(1,true);
            if(0 != $(retXml).find("resp").text()) {
            	if (2 == $(retXml).find("resp").text()) {
                	showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_move_sms_sim_full_fail"));
                } else {
//                alert("copy sms failed.");
                	showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_copy_sms_fail"));
                }
            	
            } else {
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_copy_sms_success"));
            }
        }


        function MoveSMS() {
            if (menuId == "mDeviceInbox" || menuId == "mSmsDrafts") {

                if (!bSimPresent) {
                    showAlert("lsmsSimCardAbsent");
                    return;
                }
            }

            var smsMap = new Map();
            smsMap.put("RGW/sms_info/sms/id",GetSelSmsId());

            if (menuId == "mDeviceInbox" || menuId == "mSmsOutbox")
                smsMap.put("RGW/sms_info/sms/action",2); //MOVE_SMS_TO_SIM=2
            else
                smsMap.put("RGW/sms_info/sms/action",0); //MOVE_SMS_TO_LOCAL=0

            var retXml = PostXml(gSmsModelName, "sms.move", smsMap);
            UpdateSmsList(1,true);
            if(0 == $(retXml).find("resp").text()) {
                showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_move_sms_success"));
            } else if (2 == $(retXml).find("resp").text()) {
            	showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_move_sms_sim_full_fail"));
            } else {
            	showMsgBox(jQuery.i18n.prop("dialog_message_sim_title"), jQuery.i18n.prop("dialog_message_sim_move_sms_fail"));
            }
        }

        $("#lt_sms_btnCopy").click(function() {
            CopySMS();
            $("#deleteAllSms").prop("checked", false);
            $("tbody :checkbox").prop("checked",false);
            $("#lt_sms_btnDelete").hide();
            $("#lt_sms_btnCopy").hide();
            $("#lt_sms_btnMove").hide();
        });

        $("#lt_sms_btnMove").click(function() {
            MoveSMS();
            $("#deleteAllSms").prop("checked", false);
            $("tbody :checkbox").prop("checked",false);
            $("#lt_sms_btnDelete").hide();
            $("#lt_sms_btnCopy").hide();
            $("#lt_sms_btnMove").hide();
        });

        $("#lt_sms_btnNew").click(function() {

            $("#lt_sms_meuRightClick").hide();
            $("#divSmsList").hide();
            $("#divSmsChatRoom").show();
            $("#lt_sms_stcSmsErrorInfo").hide();
            $("#deleteAllSms").prop("checked", false);
            $("#lt_sms_btnDelete").hide();
            $("#lt_sms_btnCopy").hide();
            $("#lt_sms_btnMove").hide();
            $("#divNewSmsContent").show();
            $("#divRecvSmsContent").hide();
            $("#txtSmsContent").val("");
            $("#txtSmsCharaNum").text("(0/765)");
            $("#txtSmsItemNum").text("(0/5)");

            $("#txtNumberList").css("width", "500px");
            $(".search-choice").remove();
            $("#chosen-search-field-input").show();
            $("#txtNumberList").val("");

            if ("mSmsDrafts" == menuId) {
                $("#lt_sms_btnDraftSave").show();
                $("#lt_sms_btnSend").hide();
            } else {
                $("#lt_sms_btnSend").show();
            }
        });

        $("#lt_sms_btnCancel").click(function() {
            $("#divSmsList").show();
            $("#lt_sms_stcSmsErrorInfo").hide();
            $("#divSmsChatRoom").hide();
            UpdateSmsList($("#divSmsPageNum .pageSelIdx").text(), false);
        });

        $("#forwardSmsImg").click(function() {
        	$("#lt_sms_stcSmsErrorInfo").text("");
            $(".search-choice").remove();
            $("#chosen-search-field-input").show();
            $("#divRecvSmsContent").hide();
            $("#divNewSmsContent").show();
            var smsContents = RemoveHrefs($("#txtRecvSmsContent").html());
            smsContents=smsContents.replace(/&lt;/ig,"<");
            smsContents=smsContents.replace(/&gt;/ig,">");
            smsContents=smsContents.replace(/&nbsp;/g," ");
            $("#txtSmsContent").val(smsContents);
            $("#txtNumberList").val("");
            
            var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            var msgLen = smsContents.length;
            var charCount, itemCount;
            if (patrn.exec(smsContents)) {
                charCount = "(" + msgLen + "/335)";
                if (msgLen <= 70) {
                    itemCount = 1;
                } else {
                    itemCount = Math.floor(msgLen / 67 + (msgLen % 67 > 0 ? 1 : 0)); 
                }
            } else { //english
                if (msgLen <= 160) {
                    itemCount = 1;
                } else {
                    itemCount = Math.floor(msgLen / 153 + (msgLen % 153 > 0 ? 1 : 0));
                }
                charCount = "(" + msgLen + "/765)";
            }

            $("#txtSmsCharaNum").text(charCount);
            $("#txtSmsItemNum").text("(" + itemCount + "/5)");
        });

        function GetPhoneBookList() {
            var pbcontactMap = new Map();
            pbcontactMap.put("RGW/phonebook/getcontactbypage/pagecap", PHONE_NUM_PER_PAGE);
            pbcontactMap.put("RGW/phonebook/getcontactbypage/pageindex", 0);
            var retXml = PostXmlNoShowWaitBox("phonebook", "getcontactbypage", pbcontactMap);

            if ( $(retXml).find("result").text()!=0) {
                return;
            }

            var phoneCount = parseInt($(retXml).find("contactcount").text());
            var phoneBookPageNum = Math.floor(phoneCount / PHONE_NUM_PER_PAGE);
            if (phoneCount % PHONE_NUM_PER_PAGE) {
                phoneBookPageNum = phoneBookPageNum + 1;
            }

            $(retXml).find("contactlist").each(function () {
                $(this).find("contact").each(function () {
                    phoneNumberMap.put($(this).find("mobile").text(),UniDecode($(this).find("name").text()));
                });
            });

            for(var pbPage = 1; pbPage < phoneBookPageNum; ++ pbPage) {
            	var pbcontactMap2 = new Map();
            	pbcontactMap2.put("RGW/phonebook/getcontactbypage/pagecap", PHONE_NUM_PER_PAGE);
            	pbcontactMap2.put("RGW/phonebook/getcontactbypage/pageindex", pbPage);
                retXml = PostXmlNoShowWaitBox("phonebook", "getcontactbypage", pbcontactMap2);
                if ($(retXml).find("result").text()==0) {
                    $(retXml).find("contactlist").each(function () {
                        $(this).find("contact").each(function () {
                            phoneNumberMap.put($(this).find("mobile").text(),UniDecode($(this).find("name").text()));
                        });
                    });
                }
            }
        }

        return this;
    }
})(jQuery);

