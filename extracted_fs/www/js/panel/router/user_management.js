(function($) {
    $.fn.objAccountManage = function(InIt) {
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/user_management.html");
				$('#txtNewPwd').keyup(function(){
					var value = $(this).val();
					var strength = checkPWStrength(value);
					setPWDStrengthColor(strength);
				})
				$('#lt_pwd_showChange').change(function(){
					var isSelect = 0;
					if($(this).prop('checked')){
						isSelect = 1;
					}else{
						isSelect = 0;
					}
					SetCookie('showChangePaw',isSelect,365);
				});
            } //end flag
			if(GetCookie('showChangePaw')=='1'){
				$('#lt_pwd_showChange').prop('checked',true);
			}else{
				$('#lt_pwd_showChange').prop('checked',false);
			}
        }
        return this;
    }
})(jQuery);

function clearPasswordError(){
    $("#lAlertPasswordError").text("");
}

function ChangePassword(){
	if(g_loginPasswd != $("#txtpwd").val()){
		document.getElementById('lAlertPasswordError').innerHTML= jQuery.i18n.prop("lPasswdIsWrong");
		return;
	}
    if("" == $("#txtNewPwd").val() || "" == $("#txtNewPwd2").val()) {
    	document.getElementById('lAlertPasswordError').innerHTML= jQuery.i18n.prop("lPasswdIsEmpty");
        return;
    }
    
    if($("#txtNewPwd").val() !=  $("#txtNewPwd2").val()) {
    	document.getElementById('lAlertPasswordError').innerHTML= jQuery.i18n.prop("lPassErrorMes");
        return;
    }
    
    if ($("#txtNewPwd").val().length < 4 ) {
    	document.getElementById('lAlertPasswordError').innerHTML= jQuery.i18n.prop("lPasswordMinLengthError");
    	return;
    }
    
    if ($("#txtNewPwd").val().length > 20 ) {
    	document.getElementById('lAlertPasswordError').innerHTML= jQuery.i18n.prop("lPasswordMaxLengthError");
    	return;
    }
    
    if ($("#txtNewPwd").val().indexOf(" ") != -1) {
    	document.getElementById('lAlertPasswordError').innerHTML= jQuery.i18n.prop("lPasswordError1");
    	return;
    }
	
    var configMap = new Map();
    configMap.put("RGW/account/user_management/action",1);
    configMap.put("RGW/account/user_management/username",g_username);
    configMap.put("RGW/account/user_management/password",$("#txtNewPwd").val());
    var retXml = PostXml("account","set_account",configMap);
    if("ERROR" == $(retXml).find("setting_response").text()) {
        showMsgBox(jQuery.i18n.prop("dialog_message_user_management_title"), jQuery.i18n.prop("dialog_message_user_management_set_fail"));
    } else {
    	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_user_management_title"), jQuery.i18n.prop("lt_user_management_success"));
        $("#txtNewPwd").val("");
        $("#txtNewPwd2").val("");
    	clearPasswordError();
    	setInterval(function() {
            clearAuthheader();
        }, 2000);
    }
}

function checkPWStrength(passValue) {
	function charMode(iN) {
		if (iN>=48 && iN <=57) {
			return 1;
		} else if ((iN>=65 && iN <=90) || (iN>=97 && iN <=122)) {
			return 2;
		} else {
			return 4;
		}
	}
	function bitTotal(num) {
		var modes=0;
		var i = 0;
		for (i=0;i<3;i++) {
			if (num & 1) {
				modes++;
			}
			num>>>=1;
		}
		return modes;
	}
	var ret = 0;
	var sPWLength = passValue.length;
	var sPWModes = 0;
	var i= 0;
	for (i= 0; i < sPWLength; i++) {
		sPWModes|=charMode(passValue.charCodeAt(i));
	}
	sPWModes = bitTotal(sPWModes);
	if(sPWLength < 6 || (sPWModes == 1 && sPWLength < 10)) {
		ret = MACRO_PASSWORD_LOW;
	} else if((sPWModes == 2 && sPWLength >= 6) || (sPWModes == 1 && sPWLength >= 10)) {
		ret = MACRO_PASSWORD_MID;
	} else if(sPWModes == 3 && sPWLength >= 6) {
		ret = MACRO_PASSWORD_HIG;
	} else {
		ret = MACRO_PASSWORD_LOW;
	}
	if(2 == arguments.length){
		if(!String(passValue).localeCompare(arguments[1]) || !String(passValue).localeCompare(arguments[1].split("").reverse().join(""))){
			ret = MACRO_PASSWORD_LOW;
		}
	}
	return ret;
}

function setPWDStrengthColor(strength){
	if(strength == MACRO_PASSWORD_LOW){
		$('#lt_pwd_Low').css({"background-color": "red"});
		$('#lt_pwd_Medium,#lt_pwd_High').css({"background-color": "gray"});
	}else if(strength == MACRO_PASSWORD_MID){
		$('#lt_pwd_Low,#lt_pwd_Medium').css({"background-color": "orange"});
		$('#lt_pwd_High').css({"background-color": "gray"});
	}else if(strength == MACRO_PASSWORD_HIG){
		$('#lt_pwd_Low,#lt_pwd_Medium,#lt_pwd_High').css({"background-color": "green"});
	}
}