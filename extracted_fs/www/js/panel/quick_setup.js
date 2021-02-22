var g_loginPasswd;
function LoadQuickSetupPage(type) {
    document.getElementById("navigation").innerHTML = "<ul id ='menu' class='menu' ><li ><a id='menuQuickSetup' class='on' onclick='quickSetup()'>Quick Setup </a> </li> </ul>";
    document.getElementById("menuQuickSetup").innerHTML = jQuery.i18n.prop('quickSetupName');
    document.getElementById("mainColumn").innerHTML= CallHtmlFile("html/quick_setup.html");
	$('#quickSetup').hide();
    if(config_hasWIFI5G){
        $('.wifi5G_qs').show();
        $('.wifiBackBtn').hide();
        $('.wifiBackBtn5G').show();
    }else{
        $('.wifi5G_qs').hide();
        $('.wifiBackBtn').show();
        $('.wifiBackBtn5G').hide();
    }
    LocalAllElement();
    if(type){
		showDiv(type);
	}else{
		showDiv("divQsUserNamePage");
	}
}


function quickSetup(type) {
	g_nav = "quicksetup";
	g_firstMenu = '';
	g_secondMenu = '';
    clearRefreshTimers();
    LoadQuickSetupPage(type);
}

function GotoQuickSetup(){
	quickSetup();
}

function SaveQsAccountSet() {
    if($("#divConfirmPasswd").is(":visible")) {
    	if($('#txtpwd').val()!=g_loginPasswd){
			$("#lPassErrorMes").show().text(jQuery.i18n.prop("lPasswdIsWrong"));
			return;
		}
        if("" == $("#txtQsRePasswd").val() || "" == $("#txtQsPasswd").val()) {
        	$("#lPassErrorMes").show().text(jQuery.i18n.prop("lPasswdIsEmpty"));
            return;
        }
        
        if($("#txtQsRePasswd").val() != $("#txtQsPasswd").val()) {
            $("#lPassErrorMes").show().text(jQuery.i18n.prop("lPassErrorMes"));
            return;
        }
        
        if ($("#txtQsPasswd").val().length < 4 ) {
        	$("#lPassErrorMes").show().text(jQuery.i18n.prop("lPasswordMinLengthError"));
        	return;
        }
        
        if ($("#txtQsPasswd").val().length > 20 ) {
        	$("#lPassErrorMes").show().text(jQuery.i18n.prop("lPasswordMaxLengthError"));
        	return;
        }
		if ($("#txtQsPasswd").val().indexOf(" ") != -1 ) {
			$("#lPassErrorMes").show().text(jQuery.i18n.prop("lPasswordError1"));
			return;
		}
        var configMap = new Map();
        configMap.put("RGW/account/user_management/action",1);
        configMap.put("RGW/account/user_management/username",g_username);
        configMap.put("RGW/account/user_management/password",$("#txtQsPasswd").val());
        var retXml = PostXml("account","set_account",configMap);
        showDiv("divQsInternetConnPage");
        if("ERROR" == $(retXml).find("setting_response").text()) {
            alert("modify password failed.");
        } else {
        	g_loginPasswd = $("#txtQsPasswd").val();
			g_pwdstrength = g_pwdstrength_changing;
        	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_user_management_title"), jQuery.i18n.prop("lt_user_management_success"));
        }
    }else{
	showDiv("divQsInternetConnPage");
    }
}

function SaveQsInternetConnSet() {
    g_objContent.SaveData();
    showDiv("divQsWifiSetPage");
}


function SaveQsWifiSet() {
	ShowDlg('confirmDlg',350,185);
	$("#lt_confirmDlg_title").text(jQuery.i18n.prop("quickSetupConfirm"));
	$("#lt_confirmDlg_msg").text(jQuery.i18n.prop("confirmmMutiSSIDUpdateSaved"));
	$("#lt_btnConfirmYes").click(function(){
		ShowDlg("PleaseWait", 200, 130);
		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
		setTimeout(function(){
		var result = "";
		if($("#selWifiEnabledSwitch").val() =="0"){
			result = g_objContent.SaveData();
			if(!result){
				CloseDlg();
			}
            selectModule();
		}else{
			g_objContent.saveDataForQuickSetup('',function (result) {
                if(result=="1"){
                    CloseDlg();
                    selectModule();
                }else if (result) {
                    selectModule();
                }
            });

		}
		},100);
	});
	$("#lt_btnConfirmNo").click(function(){
        selectModule();
	});
}
function selectModule(){
    if(config_hasWIFI5G){
        showDiv("divQsWifiSetPage5G");
    }else{
        showDiv("divQsDeviceGuidePage");
    }
}
function SaveQsWifiSet5G() {
	ShowDlg('confirmDlg',350,185);
	$("#lt_confirmDlg_title").text(jQuery.i18n.prop("quickSetupConfirm"));
	$("#lt_confirmDlg_msg").text(jQuery.i18n.prop("confirmmMutiSSIDUpdateSaved"));
	$("#lt_btnConfirmYes").click(function(){
		setTimeout(function(){
			ShowDlg("PleaseWait", 200, 130);
			$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
			var result = "";
			if($("#selWifiEnabledSwitch5G").val() =="0"){
				result = g_objContent.SaveData();
				showDiv("divQsDeviceGuidePage");
                CloseDlg();
			}else{
				g_objContent.saveDataForQuickSetup('',function(result){
                    if(result=="1"){
                        CloseDlg();
                        showDiv("divQsDeviceGuidePage");
                    }else if (result) {
                        showDiv("divQsDeviceGuidePage");
                    }
                });

			}
		},100)
	});
	$("#lt_btnConfirmNo").click(function(){
		showDiv("divQsDeviceGuidePage");
	});
}

function showDiv(divId) {
	g_firstMenu = divId;
	setCurrentPage();
    $("#divQsUserNamePage,#divQsInternetConnPage,#divQsWifiSetPage,#divQsWifiSetPage5G,#divQsDeviceGuidePage").hide();
    $("#lt_qs_h1UserSettings,#lt_qs_h1InternetConnection,#lt_qs_h1WirelessSeetings,#lt_qs_h1DevicePlaceGuid,#lt_qs_h1WirelessSeetings_5G").removeClass();
    document.getElementById(divId).style.display = "block";
	g_objContent = null;
    if("divQsUserNamePage" == divId) {
        $("#lt_qs_h1UserSettings").addClass("on");
        $("#txtQsPasswd").val('');
		$('#txtpwd').val('');
		$('#divConfirmPasswd').hide();
		$('#txtQsRePasswd').val('');
		$("#lPassErrorMes").hide();
		$("#txtQsPasswd").keyup(function(){
			var value = $(this).val();
			value = value.replace(/[\u0391-\uffe5]/gi,'');
			if(value != g_loginPasswd){
				$("#divConfirmPasswd").show();
			}
			g_pwdstrength_changing = checkPWStrength(value);
			setPWDStrengthColor(g_pwdstrength_changing);
		});
	
		$("#txtQsRePasswd,#txtQsPasswd,#textfield").mousedown(function(){
			$("#lPassErrorMes").hide();
		});
    } else if("divQsInternetConnPage" == divId) {
        $("#lt_qs_h1InternetConnection").addClass("on");
        $("#divInternetConnectSet").html(CallHtmlFile("html/internet/internet_connection.html"));
        $("#lt_interCon_helper,#divSaveInternetConn,#lt_interCon_title").hide();
        g_objContent =  $("#divQsInternetConnPage").objInternetConn();
        g_objContent.onLoad(true);

    } else if("divQsWifiSetPage" == divId) {
        $("#lt_qs_h1WirelessSeetings").addClass("on");
        $("#divPrimaryNetworkSet").html(CallHtmlFile("html/wifi/wireless_settings.html"));
        g_objContent = $("#divQsWifiSetPage").objWifiSet();
        $("#lt_wifiSet_helper,#lt_wifiSet_title,#divSaveWifiConfig").hide();
        g_objContent.onLoad(true);
    } else if("divQsDeviceGuidePage" == divId) {
        $("#lt_qs_h1DevicePlaceGuid").addClass("on");
    }else if("divQsWifiSetPage5G" == divId){
    	$("#lt_qs_h1WirelessSeetings_5G").addClass("on");
        $("#divPrimaryNetworkSet_5G").html(CallHtmlFile("html/wifi/wireless_settings_5G.html"));
        g_objContent = $("#divQsWifiSetPage5G").objWifiSet5G();
        $("#lt_wifiSet_helper,#lt_wifiSet_title,#divSaveWifiConfig5G").hide();
        g_objContent.onLoad(true);
    }
}
function ExitQuickSetup() {
	$('#quickSetup').show();
    document.getElementById("navigation").innerHTML=" <ul id ='menu' class='menu'></ul>";
    g_objContent = null;
    createMenuFromXML();
    createMenu(1);
}





