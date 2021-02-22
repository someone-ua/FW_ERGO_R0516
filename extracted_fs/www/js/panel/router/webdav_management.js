

var webdav_arrayTableDataAccount = new Array(0);
(function($) {
    	$.fn.objWebDavmanagement = function(InIt) {
		
        this.onLoad = function(flag) {
            		LoadWebPage("html/router/webdav_management.html");
			
					document.getElementById("webdavSettingtitle").innerHTML = jQuery.i18n.prop("webdavSettingtitle");
					document.getElementById("webdavmangementtitle").innerHTML = jQuery.i18n.prop("webdavmangementtitle");
	
					document.getElementById("webdavSetting").value = jQuery.i18n.prop("webdavSetting");
					document.getElementById("SDcardShareSettingInfoDlgTitle").innerHTML = jQuery.i18n.prop("SDcardShareSettingInfoDlgTitle");

					//document.getElementById("setting_method").innerHTML = jQuery.i18n.prop("setting_method");
					//document.getElementById("WebDavmode").innerHTML = jQuery.i18n.prop("WebDavmode");
					//document.getElementById("Usbmode").innerHTML = jQuery.i18n.prop("Usbmode");

					document.getElementById("setting_shared_enable").innerHTML = jQuery.i18n.prop("setting_shared_enable");
					document.getElementById("shared_open").innerHTML = jQuery.i18n.prop("shared_open");
					document.getElementById("shared_close").innerHTML = jQuery.i18n.prop("shared_close");

					document.getElementById("setting_shared_mode").innerHTML = jQuery.i18n.prop("setting_shared_mode");
					document.getElementById("read_mode_show").innerHTML = jQuery.i18n.prop("read_mode_show");
					document.getElementById("readwrite_mode_show").innerHTML = jQuery.i18n.prop("readwrite_mode_show");


					document.getElementById("webdav_lUsername").innerHTML = jQuery.i18n.prop("webdav_lUsername");
					document.getElementById("webdav_lPassword").innerHTML = jQuery.i18n.prop("webdav_lPassword");
					document.getElementById("webdav_lRePassword").innerHTML = jQuery.i18n.prop("webdav_lRePassword");
					
					document.getElementById("setting_stcCancelView").value = jQuery.i18n.prop("btnModalCancle");
					
		            webdav_arrayTableDataAccount = new Array(0);
            		var indexAccount = 0;
		            var _router_username='';
					var _router_password='';
					var webdav_username_;
            		var webdav_password_;
            		var authority;
					
					//GetWebDavManageInfo();
					var retXml = PostXml("router","webdav_get_management_info");
				    var enable,shared_mode;
				    $(retXml).find("webdav_auth").each(function() {
				        webdav_username_ = decodeURIComponent($(this).find("username").text());
						webdav_password_ = decodeURIComponent($(this).find("password").text());
						authority = '1';
				    });
				    $(retXml).find("webdav_basic").each(function() {
				        enable = $(this).find("enable").text();
						shared_mode = $(this).find("shared_mode").text();
				    });



				           // _router_username = decodeURIComponent($(this).find("webdav_username").text());
				           // _router_password = decodeURIComponent($(this).find("webdav_password").text());



				                    //webdav_username_ = decodeURIComponent($(this).find("webdav_account_username").text());
				                    //webdav_password_ = decodeURIComponent($(this).find("webdav_account_password").text());
				                    
                   webdav_arrayTableDataAccount[indexAccount] = new Array(3);
                   webdav_arrayTableDataAccount[indexAccount][0] = webdav_username_;
                   webdav_arrayTableDataAccount[indexAccount][1] = webdav_password_;
                   webdav_arrayTableDataAccount[indexAccount][2] = authority;


				   

					this.loadAccountTable(webdav_arrayTableDataAccount);
					
					

				$("#webdavSetting").click(function() {
        			ShowDlg("webdavSettingDlg", 450, 150);
        			webdav_modesettingsMBAccount();

					var retXml = PostXml("router","webdav_get_management_info");
				    var enable,shared_mode;
				    //$(retXml).find("webdav_auth").each(function() {
				    //    webdav_username_ = decodeURIComponent($(this).find("username").text());
					//	webdav_password_ = decodeURIComponent($(this).find("password").text());
					//	authority = '1';
				    //});
				    $(retXml).find("webdav_basic").each(function() {
				        enable = $(this).find("enable").text();
						if(enable=="on")
						{
							WebdavSharedEnable=1;
							$("#WebDavSharedClose").prop("checked", false);
							$("#WebDavSharedOpen").prop("checked", true);
						}
						else
						{
							WebdavSharedEnable=0
							$("#WebDavSharedClose").prop("checked", true);
							$("#WebDavSharedOpen").prop("checked", false);
						}
						shared_mode = $(this).find("shared_mode").text();
						if(shared_mode=="read_only")
						{
							WebdavSharedMode=1;
							$("#readwrite_mode").prop("checked", false);
							$("#read_mode").prop("checked", true);
						}
						else
						{
							WebdavSharedMode=0;
							$("#readwrite_mode").prop("checked", true);
							$("#read_mode").prop("checked", false);
						}
						
				    });
					
        			//var xml = getData('webdav_management');
					
			         //$(xml).find("webdav_user_management").each(function() {
					//	var usb_flag=$(this).find("webdav_enable").text();
					//	if(usb_flag=="1")
					//	{
					//		WebdavUsbMode=1;
					//		$("#UsbSta").attr("checked", false);
					//		$("#WebDavSta").attr("checked", true);
					//	}
					//	else
					//	{
					//		WebdavUsbMode=0;
					//		$("#UsbSta").attr("checked", true);
					//		$("#WebDavSta").attr("checked", false);
					//	}			
					// });
					 
					 $("#lt_webdav_setting_btnSave").click(function() {
						//var itemIndex = 0;
						//mapData = null;
						//mapData = new Array();
						//mapData = putMapElement(mapData, "RGW/webdav_user_management/webdav_enable", WebdavUsbMode, itemIndex++);
						//if (mapData.length > 0) {
						//	webdav_postXML('webdav_management', g_objXML.getXMLDocToString(g_objXML.createXML(mapData)));
						//}
						var webdav_ConfigMap = new Map();
						var curConfigMap = new Map();
						//configMap.put("RGW/wireless/wifi_if_24G/switch","off");
		    			//curConfigMap.put("RGW/webdav_set_management_info/webdav_auth/username","admin");
						//curConfigMap.put("RGW/webdav_set_management_info/webdav_auth/password","admin");
						if(WebdavSharedEnable){
							curConfigMap.put("RGW/webdav_basic/enable","on");
						}else{
							curConfigMap.put("RGW/webdav_basic/enable","off");
						}
						if(WebdavSharedMode){
							curConfigMap.put("RGW/webdav_basic/shared_mode","read_only");
						}else{
							curConfigMap.put("RGW/webdav_basic/shared_mode","read_write");
						}
						var configMap = curConfigMap.getChange(webdav_ConfigMap);
						PostXml("router","webdav_set_basic_info",configMap);
						CloseDlg();
						showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_webdav_setting_title"), jQuery.i18n.prop("dialog_message_webdav_setting_set_info"));
					});
            	});	
        }
		
		this.loadAccountTable = function (arrayTableData){
            var tableUserAccount = document.getElementById('tableUserAccount');
            var tBodytable = tableUserAccount.getElementsByTagName('tbody')[0];
            clearTabaleRows('tableUserAccount');
            if (arrayTableData.length == 0) {
                var row1 = tBodytable.insertRow(0);
                var rowCol1 = row1.insertCell(0);
                rowCol1.colSpan = 3;
                rowCol1.innerHTML = jQuery.i18n.prop("tableNoData");
            } else {
                for (var i = 0; i < arrayTableData.length; i++) {
                    var arrayTableDataRow = arrayTableData[i];
                    var row = tBodytable.insertRow(-1);

                    var AccountNameCol = row.insertCell(0);
                    var AuthorityCol = row.insertCell(1);
                   // var removeCol = row.insertCell(2);

                    var _name = decodeURIComponent(arrayTableDataRow[0]);
                    AccountNameCol.innerHTML = "<a href='#' id ='table_username_link"+i+"' onclick='webdav_AccountClicked(" + i + ")'>" + _name + "</a>";

		    AuthorityCol.innerHTML = "<a href='#' id='table_remove_link"+i+"' onclick='webdav_deleteAccountItem(" + i + ")'>" +jQuery.i18n.prop("webdav_lEdit") + "</a>";
                    //if(arrayTableDataRow[2] == "1") {
                   //     AuthorityCol.innerHTML = jQuery.i18n.prop("lStandard");
                    //} else
                    //    AuthorityCol.innerHTML = jQuery.i18n.prop("lRestricted");

                    //removeCol.innerHTML = "<a href='#' id='table_remove_link"+i+"' onclick='webdav_deleteAccountItem(" + i + ")'>" +jQuery.i18n.prop("webdav_lEdit") + "</a>";

                }
            }
            //Table.stripe(tableUserAccount, "alternate", "table-stripeclass");
        }

		this.getTableAccountDataRow = function(index) {
            return webdav_arrayTableDataAccount[index];
        }

		this.postAccountItem = function(index, isDeleted, name, password, authority) {
            var itemIndex = 0;
            mapData = null;
            mapData = new Array();

            var login_username = encodeURIComponent(document.getElementById("tbrouter_username").value);
            var login_password = encodeURIComponent(document.getElementById("tbrouter_password").value);


 			//edit or add
            var item_name = encodeURIComponent(name);
            var item_password = encodeURIComponent(password);

            this.putMapElement("RGW/webdav_user_management/webdav_account_management/webdav_account_username", item_name, itemIndex++);
            this.putMapElement("RGW/webdav_user_management/webdav_account_management/webdav_account_password", item_password, itemIndex++);



            if (mapData.length > 0) {
                postXML('webdav_management', g_objXML.getXMLDocToString(g_objXML.createXML(mapData)));
            }
        }

		this.putMapElement = function(xpath, value, index) {
            mapData[index] = new Array(2);
            mapData[index][0] = xpath;
            mapData[index][1] = value;
        }
        this.onPostSuccess = function() {
            this.onLoad(true);
        }
		
        this.setXMLName = function(_xmlname) {
            xmlName = _xmlname;
        }




        return this;
    }
})(jQuery);




function webdavsetSdcardShareModeOK()
{
	ShowDlg("PleaseWait",150,100);
	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
	setTimeout('logOut()',6000);
}

var WebdavSharedEnable=0;
var WebdavSharedMode=0;

function WebDav_shared_open_Setting()
{
	$("#WebDavSharedOpen").prop("checked", true);
	$("#WebDavSharedClose").prop("checked", false);
	WebdavSharedEnable=1;
}

function WebDav_shared_close_Setting()
{
	$("#WebDavSharedClose").prop("checked", true);
	$("#WebDavSharedOpen").prop("checked", false);
	WebdavSharedEnable=0;
}


function WebDav_shared_read_Setting()
{
	$("#read_mode").prop("checked", true);
	$("#readwrite_mode").prop("checked", false);
	WebdavSharedMode=1;
}

function WebDav_shared_readwrite_Setting()
{
	$("#readwrite_mode").prop("checked", true);
	$("#read_mode").prop("checked", false);
	WebdavSharedMode=0;
}

function webdav_modesettingsMBAccount() {
	document.getElementById("SDcardShareSettingInfoDlgTitle").innerHTML = jQuery.i18n.prop("SDcardShareSettingInfoDlgTitle");

	//document.getElementById("setting_method").innerHTML = jQuery.i18n.prop("setting_method");
	//document.getElementById("WebDavmode").innerHTML = jQuery.i18n.prop("WebDavmode");
	//document.getElementById("Usbmode").innerHTML = jQuery.i18n.prop("Usbmode");

	document.getElementById("setting_shared_enable").innerHTML = jQuery.i18n.prop("setting_shared_enable");
	document.getElementById("shared_open").innerHTML = jQuery.i18n.prop("shared_open");
	document.getElementById("shared_close").innerHTML = jQuery.i18n.prop("shared_close");

	document.getElementById("setting_shared_mode").innerHTML = jQuery.i18n.prop("setting_shared_mode");
	document.getElementById("read_mode_show").innerHTML = jQuery.i18n.prop("read_mode_show");
	document.getElementById("readwrite_mode_show").innerHTML = jQuery.i18n.prop("readwrite_mode_show");

	document.getElementById("lt_webdav_setting_btnSave").value = jQuery.i18n.prop("lt_btnApply");
	document.getElementById("setting_stcCancelView").value = jQuery.i18n.prop("btnModalCancle");
}

function webdav_localizeMBAccount() {
    $("#webdav_h1AccountEdit").text(jQuery.i18n.prop("webdav_h1AccountEdit"));
    document.getElementById("webdav_lAccountName").innerHTML = jQuery.i18n.prop("webdav_lUsername");
    document.getElementById("webdav_lAccountPassword").innerHTML = jQuery.i18n.prop("webdav_lPassword");
    document.getElementById("webdav_lAccountRePassword").innerHTML = jQuery.i18n.prop("webdav_lRePassword");
    //document.getElementById("lAccountAuthority").innerHTML = jQuery.i18n.prop("lAccountAuthority");
    document.getElementById("btnCancel").value = jQuery.i18n.prop("btnCancel");
//    buttonLocaliztion(document.getElementById("btnOk").id);
    $("#btnOk").val(jQuery.i18n.prop("btnOk"));
}
  

function webdav_AccountClicked(index) {
    ShowDlg("MBAccount_Popup", 450, 200);
    webdav_localizeMBAccount();

    var data = g_objContent.getTableAccountDataRow(index);
    //var data=webdav_arrayTableDataAccount[index]

    document.getElementById("webdav_txtAccountName").value = data[0];
    document.getElementById("webdav_txtAccountPassword").value = data[1];
    document.getElementById("webdav_txtReAccountPassword").value = decodeURIComponent(data[1]);
    //document.getElementById("AccountGroupSelect").value = data[2];
    //$("#AccountGroupSelect").attr("disabled",true);
    bEditAccount = true; //edit
}


function webdav_btnOKClickedEditAccount() {
    var AccountName, AccountPassword, AccountRePassword, AccountAuthority;
	var webdav_ConfigMap = new Map();

    AccountName = document.getElementById("webdav_txtAccountName").value;
    AccountPassword = document.getElementById("webdav_txtAccountPassword").value;
    AccountRePassword = document.getElementById("webdav_txtReAccountPassword").value;
//    AccountAuthority = document.getElementById("AccountGroupSelect").value;

    if(!bEditAccount) { //add new account
        for (var idx = 0; idx < _arrayTableDataAccount.length; ++idx) {
            if (AccountName == _arrayTableDataAccount[idx][0]) {
                document.getElementById('lTablePassErrorMes').style.display = 'block';
                document.getElementById('lTablePassErrorMes').innerHTML = jQuery.i18n.prop('lAccountExist');
                return;
            }
        }
    }

    if(document.getElementById('webdav_txtAccountPassword').value != document.getElementById('webdav_txtReAccountPassword').value) {
        document.getElementById('lTablePassErrorMes').style.display = 'block';
        document.getElementById('lTablePassErrorMes').innerHTML=jQuery.i18n.prop('lPassErrorMes');
        document.getElementById("webdav_txtReAccountPassword").value = '';
    } else {
        document.getElementById('lTablePassErrorMes').style.display = 'none';
        if(webdav_isValidAccountPage()) {
            //document.getElementById('lTablePassErrorMes').style.display = 'none';
            //g_objContent.postAccountItem(0,false, AccountName,AccountPassword,AccountAuthority);
            	var curConfigMap = new Map();
			//configMap.put("RGW/wireless/wifi_if_24G/switch","off");
    			curConfigMap.put("RGW/webdav_auth/username",AccountName);
				curConfigMap.put("RGW/webdav_auth/password",AccountPassword);
				//curConfigMap.put("RGW/webdav_set_management_info/webdav_auth",AccountName);
				var configMap = curConfigMap.getChange(webdav_ConfigMap);
				PostXml("router","webdav_set_auth_info",configMap);
				GetWebDavManageInfo();
				CloseDlg();
				showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_webdav_setting_title"), jQuery.i18n.prop("dialog_message_webdav_setting_change_password"));
        }
    }
}

function webdav_deleteAccountItem(index) {

    webdav_AccountClicked(index);
}

function webdav_tablepasswordChanged() {
    document.getElementById("webdav_txtReAccountPassword").value = '';
    document.getElementById('webdav_lAccountRePassword').style.display = 'block';
    document.getElementById('webdav_txtReAccountPassword').style.display = 'block';

}

function webdav_isValidAccountPage() {
    if(!(textBoxMinLength("webdav_txtAccountName",4) && textBoxMinLength("webdav_txtAccountPassword",4))) {
        document.getElementById('lTablePassErrorMes').style.display = 'block';
        document.getElementById('lTablePassErrorMes').innerHTML = jQuery.i18n.prop('lminLengthError');
        return false;
    }
    if(!(textBoxMaxLength("webdav_txtAccountName",20) && textBoxMaxLength("webdav_txtAccountPassword",20))) {
        document.getElementById('lTablePassErrorMes').style.display = 'block';
        document.getElementById('lTablePassErrorMes').innerHTML = jQuery.i18n.prop('lmaxLengthError');
        return false;
    }
    if(!deviceNameValidation(document.getElementById('webdav_txtAccountName').value)) {
        document.getElementById('lTablePassErrorMes').style.display = 'block';
        document.getElementById('lTablePassErrorMes').innerHTML = jQuery.i18n.prop('ErrInvalidUserPass');
        return false;
    }
    if(!deviceNameValidation(document.getElementById('webdav_txtAccountPassword').value)) {
        document.getElementById('lTablePassErrorMes').style.display = 'block';
        document.getElementById('lTablePassErrorMes').innerHTML = jQuery.i18n.prop('ErrInvalidUserPass');
        return false;
    }
    return true;
}


function GetWebDavManageInfo() {

    //var retXml = PostXml("embms","webdav_get_management_info");
    
    //$(retXml).find("webdav_auth").each(function() {
    //    username = $(this).find("username").text();
	//	password = $(this).find("password").text();
    //});
   // $(retXml).find("webdav_basic").each(function() {
    //    enable = $(this).find("enable").text();
	//	shared_mode = $(this).find("shared_mode").text();
    //});

	var username,password,enable,shared_mode;
	var indexAccount = 0;
	var authority;

    
	var retXml = PostXml("router","webdav_get_management_info");
    var enable,shared_mode;
    $(retXml).find("webdav_auth").each(function() {
        username = decodeURIComponent($(this).find("username").text());
		password = decodeURIComponent($(this).find("password").text());
		authority = '1';
    });
    $(retXml).find("webdav_basic").each(function() {
        enable = $(this).find("enable").text();
		shared_mode = $(this).find("shared_mode").text();
    });


                    
   webdav_arrayTableDataAccount[indexAccount] = new Array(3);
   webdav_arrayTableDataAccount[indexAccount][0] = username;
   webdav_arrayTableDataAccount[indexAccount][1] = password;
   webdav_arrayTableDataAccount[indexAccount][2] = authority;
			   

	g_objContent.loadAccountTable(webdav_arrayTableDataAccount);

    //GetWifiDetailedInfo();
    //RefreshFreqBandData();
}