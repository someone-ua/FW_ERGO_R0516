var timeout = "";
/*
 *Login Variables
 */
var AuthQop,username="",passwd="",GnCount=1,Authrealm,Gnonce,nonce;
var _resetTimeOut=600000;
var authHeaderIntervalID = 0;

function clearErrorInfo(){
	$("input[type='text']").mousedown(function(){
		$(".error").text("").hide();
	});
	$("select").change(function(){
		$(".error").text("").hide();
	});
	$('input[type="radio"]').click(function(){
		$(".error").text("").hide();
	});
	$('input[type="checkbox"]').click(function(){
		$(".error").text("").hide();
	});
	
}
/*
 * clear the Authheader from the coockies
 */
function clearAuthheader(ip) {
    //clearing coockies
    Authheader = "";
    AuthQop = "";
    username = "";
    passwd = "";
    GnCount = "";
    Authrealm = "";
		g_nav = "";g_firstMenu="";g_secondMenu="";
		setCurrentPage();
    //window.location.reload();
    var address = window.location;
    if(ip){
			window.location.href =  address.protocol+"//"+ip;
		}else{
			//window.location="index.html";
			window.location.href = address.protocol+'//'+address.host+'/index.html';
		}
}

/**
 * clear all cookies
 */
function clearCookies(){
	var keys = document.cookie.match(/[^=;]+(?=\=)/g);
	if(keys){
		for(var i=0;i<keys.length;i++){
			document.cookie = keys[i]+"=0;expires="+new Date(0).toUTCString();
		}
	}
}
/*
* Reset the authHeader
*/
function resetInterval() {
    if(authHeaderIntervalID > 0)
        clearInterval(authHeaderIntervalID);
    authHeaderIntervalID = setInterval( "clearAuthheader()", _resetTimeOut);

}


/*
 * Check the login responce as the 200 OK or not.
 */
function login_done(urlData) {
    if(urlData && urlData.indexOf("200 OK") != -1 ) {
        return true;
    } else {
        return false;
    }
}
function getValue(authstr) {
    var arr=authstr.split("=");
    return arr[1].substring(1,arr[1].indexOf('\"',2) );
}
/*
 * as name suggest it is function which does the authentication
 * and put the AuthHeader in the Cookies. Uses Digest Auth method
 */
function doLogin(username1,passwd1) {
    var url = window.location.protocol + "//" + window.location.host + "/login.cgi";
    var loginParam =  getAuthType(url);
    if(loginParam!=null) {
        var loginParamArray = loginParam.split(" ");
        if(loginParamArray[0] =="Digest") {
            Authrealm   = getValue(loginParamArray[1]);
            nonce = getValue(loginParamArray[2]);
            AuthQop = getValue(loginParamArray[3]);

            username = username1;
            passwd = passwd1;
            var rand, date, salt, strResponse;

            Gnonce = nonce;
            var tmp, DigestRes;
            var HA1, HA2;

            HA1 = hex_md5(username+ ":" + Authrealm + ":" + passwd);
            HA2 = hex_md5("GET" + ":" + "/cgi/xml_action.cgi");

            rand = Math.floor(Math.random()*100001)
                   date = new Date().getTime();

            salt = rand+""+date;
            tmp = hex_md5(salt);
            AuthCnonce = tmp.substring(0,16);

            
            var strhex = hex(GnCount);
            var temp = "0000000000" + strhex;
            var  Authcount = temp.substring(temp.length-8);
            DigestRes = hex_md5(HA1 + ":" + nonce + ":" + Authcount + ":" + AuthCnonce + ":" + AuthQop + ":" + HA2);

            url = window.location.protocol + "//" + window.location.host + "/login.cgi?Action=Digest&username="+username+"&realm="+Authrealm+"&nonce="+nonce+"&response="+DigestRes+"&qop="+AuthQop+"&cnonce="+AuthCnonce + "&nc="+Authcount+"&temp=marvell";
            if(login_done(authentication(url))) {
                strResponse = "Digest username=\"" + username + "\", realm=\"" + Authrealm + "\", nonce=\"" + nonce + "\", uri=\"" + "/cgi/protected.cgi" + "\", response=\"" + DigestRes + "\", qop=" + AuthQop + ", nc=00000001" + ", cnonce=\"" + AuthCnonce + "\"" ;

                return 1;
            } else {
                return 0;
            }
            return strResponse;
        }
    }
    return -1;
}

function getAuthHeader(requestType,file) {
    var rand, date, salt, strAuthHeader;
    var  tmp, DigestRes,AuthCnonce_f;
    var HA1, HA2;

    HA1 = hex_md5(username+ ":" + Authrealm + ":" + passwd);
    HA2 = hex_md5( requestType + ":" + "/cgi/xml_action.cgi");

    rand = Math.floor(Math.random()*100001)
    date = new Date().getTime();

    salt = rand+""+date;
    tmp = hex_md5(salt);
    AuthCnonce_f = tmp.substring(0,16);

    var strhex = hex(GnCount);
    var temp = "0000000000" + strhex;
    var  Authcount = temp.substring(temp.length-8);
    DigestRes =hex_md5(HA1 + ":" + nonce + ":" + Authcount + ":" + AuthCnonce_f  + ":" + AuthQop + ":"+ HA2);

    GnCount++;
    strAuthHeader = "Digest " + "username=\"" + username + "\", realm=\"" + Authrealm + "\", nonce=\"" + nonce + "\", uri=\"" + "/cgi/xml_action.cgi" + "\", response=\"" + DigestRes + "\", qop=" + AuthQop + ", nc=" + Authcount + ", cnonce=\"" + AuthCnonce_f  + "\"" ;
    DigestHeader = strAuthHeader ;
    return strAuthHeader;
}

function logOut() {
	ShowDlg("confirmDlg",350,150);
    var strMsg = jQuery.i18n.prop("lt_confirm_loginOut");
    var titleMsg = jQuery.i18n.prop("it_confirm_loginOut_tittle");
    $("#lt_confirmDlg_msg").text(strMsg);
    $("#lt_confirmDlg_title").text(titleMsg);
    $("#lt_btnConfirmYes").val(jQuery.i18n.prop("lt_btnConfirmYes"));
    $("#lt_btnConfirmNo").val(jQuery.i18n.prop("lt_btnConfirmNo"));
    $("#lt_btnConfirmYes").click(function() {
	    var host = window.location.protocol + "//" + window.location.host + "/";
	    var url = host+'xml_action.cgi?Action=logout';
	    $.ajax( {
	    type: "GET",
	    url: url,
	    dataType: "html",
	    async:false,
	    complete: function() {
	            clearAuthheader();
	        }
	    });
    });
}
function  getHeader (AuthMethod,file,page) {
    var rand, date, salt, setResponse;
    var  tmp, DigestRes,AuthCnonce_f;
    var HA1, HA2;

    HA1 = hex_md5(username + ":" + Authrealm + ":" + passwd);
    HA2 = hex_md5(AuthMethod + ":" + "/cgi/xml_action.cgi");

    rand = Math.floor();
    date = new Date().getTime();

    salt = rand+""+date;
    tmp = hex_md5(salt);
    AuthCnonce = tmp.substring(0,16);
    AuthCnonce_f = tmp;

    var strhex = hex(GnCount);
    var temp = "0000000000" + strhex;
    var  Authcount = temp.substring(temp.length-8);

    DigestRes =hex_md5(HA1 + ":" + Gnonce + ":" + Authcount + ":" + AuthCnonce_f  + ":" + AuthQop + ":"+ HA2);

    ++GnCount;

    if("GET" == AuthMethod) {
        if("upgrade" == file) {
            setResponse= "/xml_action.cgi?Action=Upload&file=upgrade&command=";
        }else if("inner_upgrade" == file){
					setResponse= "/xml_action.cgi?Action=Upload&file=upgrade&command=";
				}else if(file=="iflogin"){
					setResponse = "/xml_action.cgi?Action=SaveHTML&file=get";
				}else if("cp_upgrade" == file){
        	setResponse= "/xml_action.cgi?Action=Upload&file=cp_upgrade&command=";
        }else if("config_backup" == file) {
            setResponse= "/xml_action.cgi?Action=Upload&file=backfile&config_backup=";
        } else if(file == "ca" || file == "cert" || file == "key" || file == "dh"){
        	 setResponse= "/xml_action.cgi?Action=Upload&file=" + file + "&command=";
        } else if(file == "ipsec_ca" || file == "ipsec_cert" || file == "ipsec_private"){
        	 setResponse= "/xml_action.cgi?Action=Upload&file=" + file + "&command=";
        } else {
            setResponse = "/login.cgi?Action=Download&file=" + file + "&username=" +  username + "&realm=" + Authrealm + "&nonce=" + Gnonce + "&response=" +  DigestRes + "&cnonce=" + AuthCnonce_f + "&nc=" + Authcount + "&qop=" + AuthQop + "&temp=marvell";
        }
    }
    if("POST"==AuthMethod) {
			if(file=="iflogin"){
				setResponse = "/xml_action.cgi?Action=SaveHTML&file=set&command="+page;
			}else{
				setResponse = "/login.cgi?Action=Upload&file=" + file + "&username=" +  username + "&realm=" + Authrealm + "&nonce=" + Gnonce + "&response=" +  DigestRes + "&cnonce=" + AuthCnonce_f + "&nc=" + Authcount + "&qop=" + AuthQop + "&temp=marvell";
			}
        
    }
    return setResponse;
}

/*
 * return the cookie parameter is Coockie name
 */
function GetCookie(c_name) {
    if (document.cookie.length>0) {
        c_start=document.cookie.indexOf(c_name + "=");
        if (c_start!=-1) {
            c_start=c_start + c_name.length+1;
            c_end=document.cookie.indexOf(";",c_start);
            if (c_end==-1) c_end=document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}
/*
 * set cookie of browser it has expiry days after which it expires
 */
function SetCookie(c_name,value,expiredays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}


function ElementLocaliztion(pElementArray) {
    for(var i=0; i<pElementArray.length; i++) {
        if(jQuery.i18n.prop(pElementArray[i].id)!=null)
            document.getElementById(pElementArray[i].id).innerHTML = jQuery.i18n.prop(pElementArray[i].id);
    }
}
function LocalElementById(elementId) {
    if("input" == document.getElementById(elementId).tagName.toLowerCase()) {
        document.getElementById(elementId).value = jQuery.i18n.prop(elementId);
    } else {
        document.getElementById(elementId).innerHTML = jQuery.i18n.prop(elementId);
    }

}

function LocalElementByTagName(elementTagName) {
    if("button" == elementTagName) {
        $(":button").each(function() {
            $(this).val(jQuery.i18n.prop($(this).attr("id")));
        })
    } else {
        $(elementTagName).each(function() {
            $(this).text(jQuery.i18n.prop($(this).attr("id")));
        })
    }
}

function LocalAllElement(){
	 $("[id^='lt_']").each(function() {
	 	if("input" == document.getElementById($(this).attr("id")).tagName.toLowerCase()) {
			$(this).val(jQuery.i18n.prop($(this).attr("id"))); 
	 	}else{
			$(this).text(jQuery.i18n.prop($(this).attr("id")));
		}
     });   
}


function hex(d) {
    var hD="0123456789ABCDEF";
    var h = hD.substr(d&15,1);
    while(d>15) {
        d>>=4;
        h=hD.substr(d&15,1)+h;
    }
    return h;

}

function clearTabaleRows(tableId) {
    var i=document.getElementById(tableId).rows.length;
    while(i!=1) {
        document.getElementById(tableId).deleteRow(i-1);
        i--;
    }
}

/* Converts timezone offset expressed in minutes to string */
function GetMachineTimezoneGmtOffsetStr(tzGmtOffset ) {
    var gmtOffsetStr =""+ getAbsValue(tzGmtOffset/60);
    var tempInt = tzGmtOffset;

    if(tempInt < 0) {
        tempInt = 0 - tempInt;
    }

    if(( tempInt % 60 ) != 0 ) {
        gmtOffsetStr += ":" + ( tempInt % 60 );
    }
    return gmtOffsetStr;
}
/* Find out timezone offset settings from connected device. If dst is observed we should see
    *  difference in Jan and July timezone offset.Pick the max one */
function GetMachineTimezoneGmtOffset() {
    var rightNow = new Date();

    var JanuaryFirst= new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0,0);
    var JulyFirst= new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0,0);

    var JanOffset,JulyOffset;
    var tzGmtOffset;

    JanOffset = JanuaryFirst.getTimezoneOffset();
    JulyOffset = JulyFirst.getTimezoneOffset();

    if(JulyOffset > JanOffset) {
        tzGmtOffset= JulyOffset;
    } else {
        tzGmtOffset = JanOffset;
    }
    return tzGmtOffset;
}

/* Get the connected device's day light saving settings in string format e.g. M3.5.0 or J81  */
function GetMachineTimezoneDstStartStr(StandardGMToffset) {
    var rightNow = new Date();

    var JanuaryFirst = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0,0);
    var JulyFirst= new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0,0);
    var HoursInSixMonths =((JulyFirst.getTime() - JanuaryFirst.getTime()) / (1000 * 60 * 60));
    var dstStartStr = "";
    var  i ;
    var JanOffset, JulyOffset;
    var hourStart, hourEnd;

    /* If there are dst settings to be considered we should get them by checking in 6 months time interval */
    JanOffset = JanuaryFirst.getTimezoneOffset();
    JulyOffset = JulyFirst.getTimezoneOffset();

    if(JanOffset > JulyOffset) {
        hourStart = 0;
        hourEnd = HoursInSixMonths;
    } else {
        hourStart = HoursInSixMonths;
        hourEnd = HoursInSixMonths * 2;
    }

    var tempDate = getDstStartTime(hourStart,hourEnd, rightNow.getYear(),StandardGMToffset);

    if(tempDate != null) {
        var changeWeek = getChangeWeek(hourStart,hourEnd, tempDate.getYear(),StandardGMToffset);

        switch(changeWeek) {
            case -1:
                break;
            case -2: // Some regions have fixed day for start of dst setting which is expressed with J
                dstStartStr ="J" + (((tempDate.getTime()-JanuaryFirst.getTime())/(24 * 60 * 60* 1000) ) + 1);
                break;
            default:
                dstStartStr = "M" + (tempDate.getMonth() + 1) + "." + changeWeek + "." + tempDate.getDay();
                break;
        }
    }
    return dstStartStr;
}

function getDstStartTime(hourStart,hourEnd, year,StandardGMToffset) {
    var i;
    for(i = hourStart; i < hourEnd; i++) {
        var dSampleDate = new Date(year,0, 1, 0, 0, 0,0);
        dSampleDate.setHours(i);

        var CurrentGMToffset  = dSampleDate.getTimezoneOffset();

        if(CurrentGMToffset < StandardGMToffset) {
            return dSampleDate;
        }
    }
    return null;

}
function setConnectedDeviceTimezoneStr(gmtOffset,dstStart,timezoneStringArray) {
    var i,j;
    var startIndex = -1;
    var count = 0;
    var index = -1;

    var tempGmtString;
    var tempDstString;

    for(j = 0; j < timezoneStringArray[1].length ; j++) {
        var  charArr = toCharArray(timezoneStringArray[1][j]);
        count = 0;
        tempGmtString = "";
        tempDstString = "";
        startIndex = -1;

        for(i = 0; i < timezoneStringArray[1][j].split(",",3)[0].length; i++) {
            if(((charArr[i] >= '0') && (charArr[i] <= '9')) ||(charArr[i] == '-') || (charArr[i] == ':')) {
                count++;
                if(startIndex == -1) {
                    startIndex = i;
                }
                tempGmtString = tempGmtString + charArr[i];
            }
        }

        if(tempGmtString == gmtOffset) {
            if(timezoneStringArray[1][j].split(",",3).length > 1) {
                tempDstString = timezoneStringArray[1][j].split(",",3)[1];
            } else {
                tempDstString = "";
            }
            if((dstStart.length == 0) && (tempDstString.length != 0)) {
                continue;
            }
            if(tempDstString.substring(0,dstStart.length) == dstStart) {
                index = j;
                break;
            } else {
                continue;
            }

        } else {
            continue;
        }
    }

    if(index == -1) {
        return -1;
    } else {
        return index;
    }
}
function toCharArray(str) {
    var charArray = new Array(0);
    for(var i=0; i<str.length; i++)
        charArray[i]=str.charAt(i);
    return charArray;
}

/* We know the day of month but not the week. We can find day of the month for few years
     * and guess which week of the month it would be */
function getChangeWeek( hourStart, hourEnd, year, StandardGMToffset) {
    var i;
    var min = 32 , max = 0, dom = 0;

    for(i = year; i < year + 20 ; i++) {
        dom =(getDstStartTime(hourStart,hourEnd,i,StandardGMToffset)).getDate();
        if(dom > max) {
            max = dom;
        }
        if(dom < min) {
            min = dom;
        }
    }

    if(max == min) {
        return -1;
    }

    /* Some regions have fixed day for start of dst settings. e.g 1 April
         * We handle it as special case */
    if(max - min != 6) {
        return -2;
    }
    //new XDialog("Error","max " + max + "min " + min + " dom " + dom).alert();
    return getAbsValue((((max + 6)/7)));
}

function getAbsValue(i) {
    return i.toString().split(".")[0];
}

function getHelp(helpPage) {
	var langXml = PostXml("router","get_language_choice");
	var lang = $(langXml).find("language").text();
	if(lang != "en"){
		lang = "cn";
	}
	htmlFilename = "help_" + lang+".html";
    var host = window.location.protocol + "//" + window.location.host + "/";
    var url = host + htmlFilename + "#" + helpPage;
    var newTab=window.open(url,'_blank');
}
function getMainHelp() {
   getHelp("");
}
function showAlert(msgLanguageID) {
    if(g_bodyWidth<=360){
			ShowDlg("alertMB","95%",150);
		}else{
			ShowDlg("alertMB",350,150);
		}
    document.getElementById("lAlertMessage").innerHTML = jQuery.i18n.prop(msgLanguageID);
    document.getElementById("lAlert").innerHTML = jQuery.i18n.prop("lAlert");
    LocalElementById("btnModalOk");
}

function showAlertAutoClose(msgLanguageID) {
    if(g_bodyWidth<=360){
    	ShowDlg("alertMB","95%",150);
    }else{
    	ShowDlg("alertMB",350,150);
    }
    document.getElementById("lAlertMessage").innerHTML = jQuery.i18n.prop(msgLanguageID);
    document.getElementById("lAlert").innerHTML = jQuery.i18n.prop("lAlert");
    LocalElementById("btnModalOk");
    timeout = setTimeout(CloseDlg,5000);
}

function UniEncode(string) {
    if (undefined == string) {
        return "";
    }
    var code = "";
    for (var i = 0; i < string.length; ++i) {
        var charCode = string.charCodeAt(i).toString(16);
        var paddingLen = 4 - charCode.length;
        for (var j = 0; j < paddingLen; ++j) {
            charCode = "0" + charCode;
        }
        code += charCode;
    }
    return code;
}

function GetSmsTime() {
    var date = new Date();
    var fullYear = new String(date.getFullYear());
    var year = fullYear.substr(2, fullYear.length - 1);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mimute = date.getMinutes();
    var second = date.getSeconds();
    var timeZone = 0 - date.getTimezoneOffset() / 60;
    var timeZoneStr = "";
    if (timeZone > 0) {
        timeZoneStr = "%2B" + timeZone;
    } else {
        timeZoneStr = "-" + timeZone;
    }
    if (month < 10) {
    	month = "0" + month;
    }
    if (day < 10) {
    	day = "0" + day;
    }
    if (hour < 10) {
    	hour = "0" +hour;
	}
    if (mimute < 10) {
    	mimute = "0" + mimute;
    }
    if (second < 10) {
    	second = "0" + second;
    }
    var smsTime = year + "," + month + "," + day + "," + hour + "," + mimute + "," + second + "," + timeZoneStr;
    return smsTime;
}

function UniDecode(encodeString) {
    if (undefined == encodeString) {
        return "";
    }
    var deCodeStr = "";

    var strLen = encodeString.length / 4;
    for (var idx = 0; idx < strLen; ++idx) {
        deCodeStr += String.fromCharCode(parseInt(encodeString.substr(idx * 4, 4), 16));
    }
    return deCodeStr;
}

function showMsgBox(title, message) {
	if(g_bodyWidth<=360){
		ShowDlg("alertMB","95%", 150);
	}else{
		ShowDlg("alertMB", 350, 150);
	}
    
    document.getElementById("lAlertMessage").innerHTML = message;
    document.getElementById("lAlert").innerHTML = title;
 	document.getElementById("btnModalOk").value = jQuery.i18n.prop("btnModalOk");
}

function showMsgBoxAutoClose(title, message) {
    if(g_bodyWidth<=360){
			ShowDlg("alertMB", "95%", 150);
		}else{
			ShowDlg("alertMB", 350, 150);
		}
    document.getElementById("lAlertMessage").innerHTML = message;
    document.getElementById("lAlert").innerHTML = title;
 	document.getElementById("btnModalOk").value = jQuery.i18n.prop("btnModalOk");
 	timeout = setTimeout(CloseDlg,5000);
}

function GetBrowserType() {
    var usrAgent = navigator.userAgent;
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        var b_version = navigator.appVersion
        var version = b_version.split(";");
        var trim_Version = version[1].replace(/[ ]/g, "");
        if (trim_Version == "MSIE6.0") {
            return "IE6";
        } else if(trim_Version == "MSIE7.0") {
            return "IE7";
        } else if (trim_Version == "MSIE8.0") {
            return "IE8";
        } else if (trim_Version == "MSIE9.0") {
            return "IE9";
        }
    }
    if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
        return "Firefox";
    }
    if (isSafari = navigator.userAgent.indexOf("Safari") > 0) {
        return "Safari"; //google
    }
    if (isCamino = navigator.userAgent.indexOf("Camino") > 0) {
        return "Camino";
    }
    if (isMozilla = navigator.userAgent.indexOf("Gecko/") > 0) {
        return "Gecko";
    }
}

function IsGSM7Code(str) {
    var len = 0;
    for( var i = 0; i < str.length; i++) {
        var chr = str.charCodeAt(i);
        if(((chr>=0x20&&chr<=0x7f)||0x20AC==chr||0x20AC==chr||0x0c==chr||0x0a==chr||0x0d==chr||0xa1==chr||0xa3==chr||0xa5==chr||0xa7==chr
            ||0xbf==chr||0xc4==chr||0xc5==chr||0xc6==chr||0xc7==chr||0xc9==chr||0xd1==chr||0xd6==chr||0xd8==chr||0xdc==chr||0xdf==chr
            ||0xe0==chr||0xe4==chr||0xe5==chr||0xe6==chr||0xe8==chr||0xe9==chr||0xec==chr||0xf11==chr||0xf2==chr||0xf6==chr||0xf8==chr||0xf9==chr||0xfc==chr
            ||0x3c6==chr||0x3a9==chr||0x3a8==chr||0x3a3==chr||0x3a0==chr||0x39e==chr||0x39b==chr||0x398==chr||0x394==chr||0x393==chr)
           && 0x60 != chr) {
            ++len;
        }
    }
    return len == str.length;
}

function EditHrefs(s_html) {
    var s_str = new String(s_html);
    s_str = s_str.replace(/\bhttp\:\/\/www(\.[\w+\.\:\/\_]+)/gi, "http\:\/\/&not;&cedil;$1");
    s_str = s_str.replace(/\b(http\:\/\/\w+\.[\w+\.\:\/\_]+)/gi, "<a target=\"_blank\" href=\"$1\">$1<\/a>");
    s_str = s_str.replace(/\b(www\.[\w+\.\:\/\_]+)/gi,"<a  target=\"_blank\" href=\"http://$1\">$1</a>");
    s_str = s_str.replace(/\bhttp\:\/\/&not;&cedil; (\.[\w+\.\:\/\_]+)/gi,"<a  target=\"_blank\" href=\"http\:\/\/www$1\">http\:\/\/www$1</a>");
    s_str = s_str.replace(/\b(\w+@[\w+\.?]*)/gi,"<a href=\"mailto\:$1\">$1</a>");
    return s_str;
}

function RemoveHrefs(str) {
    str = str.replace(/<a.*?>/ig,"");
    str = str.replace(/<\/a>/ig,"");
    return str;
}



function GetIpAddr(elementId){
	var ipAddr="";
	for(var idx = 1; idx < 5; ++idx){
		var selectorId = "#" + elementId + idx;
		ipAddr = ipAddr + $(selectorId).val() + ".";
	}
	return ipAddr.substr(0,ipAddr.length-1);
}


function SetIpAddr(elementId, ipAddr){
	var IpAddrArr = ipAddr.split(".");
	for(var idx = 1; idx < 5; ++idx){
		var selectorId = "#" + elementId + idx;
		$(selectorId).val(IpAddrArr[idx-1]);
	}
}

//time format: hh:mm:ss
function GetTimeFromElement(elementId){
	var strTime="";
	for(var idx = 1; idx < 4; ++idx){
		var selectorId = "#" + elementId + idx;
		if ($(selectorId).val().length == 1) {
			strTime = strTime + "0" + $(selectorId).val() + ":";
		} else {
			strTime = strTime + $(selectorId).val() + ":";
		}
	}
	return strTime.substr(0,strTime.length-1);
}

//time format: hh:mm:ss
function SetTimeToElement(elementId,time){
	var timeArr = time.split(":");
	for(var idx = 1; idx < 4; ++idx){
		var selectorId = "#" + elementId + idx;
		if (timeArr[idx-1].length == 1) {
			$(selectorId).val("0" + timeArr[idx-1]);
		} else {
			$(selectorId).val(timeArr[idx-1]);
		}
	}
}


//date format: yyyy-mm-dd
function SetDateToElement(elementId,date){
	var timeArr = date.split("-");
	for(var idx = 1; idx < 4; ++idx){
		var selectorId = "#" + elementId + idx;
		if ((idx == 2 || idx == 3) && timeArr[idx-1].length == 1) {
			$(selectorId).val("0" + timeArr[idx-1]);
		} else {
			$(selectorId).val(timeArr[idx-1]);
		}
	}
}

//date format: yyyy-mm-dd
function GetDateFromElement(elementId){
	var strDate = "";
	for(var idx = 1; idx < 4; ++idx){
		var selectorId = "#" + elementId + idx;
		if((idx == 2 || idx == 3) && $(selectorId).val().length == 1) {
			strDate = strDate + "0" + $(selectorId).val() + "-";
		} else {
			strDate = strDate + $(selectorId).val() + "-";
		}
	}
	return strDate.substr(0,strDate.length-1);
}

//time format: hh:mm
function GetTimeFromElementEx(elementId) {
    var strTime = "";
    for (var idx = 1; idx < 3; ++idx) {
        var selectorId = "#" + elementId + idx;
        strTime = strTime + $(selectorId).val() + ":";
    }
    return strTime.substr(0, strTime.length - 1);
}

//time format: hh:mm
function SetTimeToElementEx(elementId, timectrl) {
    var timeArr = timectrl.split(":");
    for (var idx = 1; idx < 3; ++idx) {
        var selectorId = "#" + elementId + idx;
        $(selectorId).val(timeArr[idx - 1]);
    }
}

function GetPortFromElement(elementId){
	var strPort="";
	for(var idx = 1; idx < 3; ++idx){
		var selectorId = "#" + elementId + idx;
		strPort = strPort + $(selectorId).val() + ":";
	}
	return strPort.substr(0,strPort.length-1);
}

//port format: xxxx:yyyy
function SetPortToElement(elementId,port){
	var portArr = port.split(":");
	for(var idx = 1; idx < 3; ++idx){
		var selectorId = "#" + elementId + idx;
		$(selectorId).val(portArr[idx-1]);
	}
}

function FormatSeconds(longTime) {
    var time = parseFloat(longTime);
    var d=0;
    var h=0;
    var m=0;
    var s=0;
    if (time != null && time != ""){
        if (time < 60) {
            s = time;
        } else if (time > 60 && time < 3600) {
             m = parseInt(time / 60);
             s = parseInt(time % 60);
        } else if (time >= 3600 && time < 86400) {
            h = parseInt(time / 3600);
            m = parseInt(time % 3600 / 60);
            s = parseInt(time % 3600 % 60 % 60);
        } else if (time >= 86400) {
            d = parseInt(time / 86400);
            h = parseInt(time % 86400 / 3600);
            m = parseInt(time % 86400 % 3600 / 60)
            s = parseInt(time % 86400 % 3600 % 60 % 60);
        }
    }  
	time = d+" - "+fix(h,2)+":"+fix(m,2)+":"+fix(s,2)+("(Days - hh:mm:ss)");
    return time;   
}

function fix(num, length) {
  return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
}

function FormatDataTrafficMinUnitKB(dataByte) {
    var formatData;
    if (dataByte > 1024 * 1024 * 1024) {
        var dataInGB = dataByte / (1024 * 1024 * 1024);
        formatData = dataInGB.toFixed(2) + "GB";
    } else if (dataByte > 1024 * 1024) {
        var dataInMB = dataByte / (1024 * 1024);
        formatData = dataInMB.toFixed(2) + "MB";
    } else {
        var dataInKB = dataByte / 1024;
        formatData = dataInKB.toFixed(2) + "KB";
    }

    return formatData;
}
//hh:mm:ss
function formatTimehhmmss(hour, minute, second) {
	var time = "";
	if (hour < 10) {
		time += "0" +hour;
	} else {
		time += hour;
	}
	time += ":";
	if (minute < 10) {
		time += "0" + minute;
	} else {
		time += minute;
	}
	time += ":";
	if (second < 10) {
		time += "0" + second;
	} else {
		time += second;
	}
	return time;
}
//rewrite startWith
if(typeof String.prototype.startsWith != 'function'){
	String.prototype.startsWith = function(str){
		if(str=="" || str==null || str==undefined || str.length>this.length){
			return false;
		}
		if(this.substr(0,str.length) == str){
			return true;
		}
		return false;
	}
}
$.fn.scrollUnit = function(){
	return $(this).each(function(){
		var type="mousewheel";
		if(document.mozFullScreen != undefined){
			type="DOMMouseScroll";
		}
		$(this).on(type,function(event){
			var scrollTop = this.scrollTop,scrollHeight = this.scrollHeight,height = this.clientHeight;
			var delta = (event.originalEvent.wheelDelta)?(event.originalEvent.wheelDelta):-(event.originalEvent.detail||0);
			if(delta>0 && scrollTop<delta || delta<0 && scrollHeight-height-scrollTop < -1*delta){
				this.scrollTop = delta>0?0:scrollHeight;
				event.preventDefault();
			}
		});
	});
}
function getFileMD5(id,callback){
	var file = document.getElementById(id).files;
	if(file){
		file = file[0];
	}else{
		callback({"md5":"error"});
		return;
	}
	var md5 = "";
	var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice, 
	fileSize = file.size,readSize = 2097152,
	readCounts = Math.ceil(fileSize/readSize),currentCount = 0;
	var spark = new SparkMD5.ArrayBuffer();
	var fileOnload = function(e){
		spark.append(e.target.result);
		currentCount ++;
		if(currentCount < readCounts){
			loadNext();
		}else{
			md5 = spark.end();
			var data = {"md5":md5,"size":fileSize};
			callback(data);
			return false;
		}
	};
	var fileLoadError = function(){
		callback({"md5":false});
		return;
	};
	function loadNext(){
		var fileReader = new FileReader();
		fileReader.onload = fileOnload;
		fileReader.onerror = fileLoadError;
		var startSize = currentCount*readSize;
		var endSize = startSize + readSize>=fileSize?fileSize:(startSize + readSize);
		fileReader.readAsArrayBuffer(fileSlice.call(file,startSize,endSize));
	}
	loadNext();
}


