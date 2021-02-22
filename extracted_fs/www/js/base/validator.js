/*apn not support char*/
var MACRO_SUPPORT_CHAR_MIN = 32;
var MACRO_SUPPORT_CHAR_MAX = 126;
var MACRO_NOT_SUPPORT_CHAR_COMMA = 44; //,
var MACRO_NOT_SUPPORT_CHAR_QUOTATION_MARK = 34; //"
var MACRO_NOT_SUPPORT_CHAR_COLON = 58; //:
var MACRO_NOT_SUPPORT_CHAR_SEMICOLON = 59; //;
var MACRO_NOT_SUPPORT_BACKSLASH_MARK = 92; //\
var MACRO_NOT_SUPPORT_CHAR_38 = 38; //&
var MACRO_NOT_SUPPORT_CHAR_37 = 37; //%
var MACRO_NOT_SUPPORT_CHAR_43 = 43; //+
var MACRO_NOT_SUPPORT_CHAR_39 = 39; //'
var MACRO_NOT_SUPPORT_CHAR_60 = 60; //<
var MACRO_NOT_SUPPORT_CHAR_62 = 62; //>
var MACRO_NOT_SUPPORT_CHAR_63 = 63; //?

function IsNumber(obj) {
    if( typeof(obj) === 'string' )
    {
		var r = /^-?\d+$/;
		return r.test(obj); 
    }
    if(typeof(obj) === "number")
    {
    	if(obj.toString().indexOf(".") != -1)
		return false;
	else
		return true;
    }
    return false;
}

function IsInteger(str) {
	return /^\d+$/.test(str);
}

function isFloat(oNum) {
	if (!oNum)
		return false;
	var strP = /^\d+(\.\d+)?$/;
	if (!strP.test(oNum))
		return false;
	try {
		if (parseFloat(oNum) != oNum)
			return false;
	} catch (ex) {
		return false;
	}
	return true;
}

function textBoxMinLength(control,value) {
    if(document.getElementById(control).value.length < value)
        return false;
    else
        return true;
}
function IsChineseChar(value) {
	if(/.*[\u0100-\uffff]+.*$/.test(value))
	{
		return true;
	}
	else
	{
		return false;
	}
}

function textBoxMaxLength(control,value) {
    if(document.getElementById(control).value.length > value)
        return false;
    else
        return true;
}

function textBoxLength(control,value) {
    if(document.getElementById(control).value.length == value)
        return true;
    else
        return false;
}

function IsEmail(emailAddr) {
    var pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (pattern.test(emailAddr)) {
        return true;
    }
    else {
        return false;
    }
}

function IsPhoneNumber(phoneNumber) {
    var pattern = /(^[0-9]{3,4}\-[0-9]{3,8}$)|(^\+?[0-9]{3,15}$)|(^\([0-9]{3,4}\)[0-9]{3,8}$)/;
    if (pattern.test(phoneNumber)) {
        return true;
    }
    else {
        return false;
    }
}


function isChineseChar(value) {
	if(/.*[\u0100-\uffff]+.*$/.test(value))
	{
		return true;
	}
	else
	{
		return false;
	}
}

function deviceNameValidation(str) {
    if (isChineseChar(str)) {
        return false;   }

	if (str.toString().indexOf("#") != -1)
	    return false;
	else if (str.toString().indexOf(":") != -1)
	    return false;
	else if (str.toString().indexOf(" ") != -1)
	    return false;
	else if (str.toString().indexOf("&") != -1)
	    return false;
	else if (str.toString().indexOf(";") != -1)
	    return false;
	else if (str.toString().indexOf("~") != -1)
	    return false;
	else if (str.toString().indexOf("|") != -1)
	    return false;
	else if (str.toString().indexOf("<") != -1)
	    return false;
	else if (str.toString().indexOf(">") != -1)
	    return false;
	else if (str.toString().indexOf("$") != -1)
	    return false;
	else if (str.toString().indexOf("%") != -1)
	    return false;
	else if (str.toString().indexOf("^") != -1)
	    return false;
	else if (str.toString().indexOf("!") != -1)
	    return false;
	else if (str.toString().indexOf("@") != -1)
	    return false;
	else if (str.toString().indexOf(",") != -1)
	    return false;
	else if (str.toString().indexOf("(") != -1)
		return false;
	else if (str.toString().indexOf(")") != -1)
		return false;
	else if (str.toString().indexOf("{") != -1)
		return false;
	else if (str.toString().indexOf("}") != -1)
		return false;
	else if (str.toString().indexOf("[") != -1)
		return false;
	else if (str.toString().indexOf("]") != -1)
		return false;
	else if (str.toString().indexOf("*") != -1)
		return false;
	else
	    return true;}


function deviceNameValidation_Contain_Chinese(str) {
	if (str.toString().indexOf("#") != -1)
	    return false;
	else if (str.toString().indexOf(":") != -1)
	    return false;
	else if (str.toString().indexOf(" ") != -1)
	    return false;
	else if (str.toString().indexOf("&") != -1)
	    return false;
	else if (str.toString().indexOf(";") != -1)
	    return false;
	else if (str.toString().indexOf("~") != -1)
	    return false;
	else if (str.toString().indexOf("|") != -1)
	    return false;
	else if (str.toString().indexOf("<") != -1)
	    return false;
	else if (str.toString().indexOf(">") != -1)
	    return false;
	else if (str.toString().indexOf("$") != -1)
	    return false;
	else if (str.toString().indexOf("%") != -1)
	    return false;
	else if (str.toString().indexOf("^") != -1)
	    return false;
	else if (str.toString().indexOf("!") != -1)
	    return false;
	else if (str.toString().indexOf("@") != -1)
	    return false;
	else if (str.toString().indexOf(",") != -1)
	    return false;
	else if (str.toString().indexOf("*") != -1)
	    return false;
	else if (str.toString().indexOf("\\") != -1)
	    return false;
	else
	    return true;}

function IsIPv6(ipv6Addr) {
    return ipv6Addr.match(/:/g) != null
        && ipv6Addr.match(/:/g).length <= 15
		&& /::/.test(str)
		? /^([\da-f]{1,4}(:|::)){1,6}[\da-f]{1,4}$/i.test(str)
		: /^([\da-f]{1,4}:){15}[\da-f]{1,4}$/i.test(str);
}

function IsIPv4(ipv4Addr) {
   var exp=/^([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9][0-9]|1\d\d|2[0-4]\d|25[0-5])$/; 
   return null == ipv4Addr.match(exp) ? false: true;    
}

function IsUrl(strUrl){
	var regUrl = /(http\:\/\/)?([\w.]+)(\/[\w- \.\/\?%&=]*)?/gi;  
	if (regUrl.test(strUrl)) {
        return true;
    }
    else {
        return false;
    }
}

function IsHexStr(str){
	pattern =  /^[0-9a-fA-F]+$/;
	if (pattern.test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function IsASCIIStr(str){
	pattern = /^[0-9a-zA-Z]+$/;
	if (pattern.test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function IsEnglishLetter(str){
	pattern = /[a-zA-Z]+/;
	if (pattern.test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function IsMACAddr(mac) {
var regex = /^([0-9a-fA-F]{2}([:-]|$)){6}$|([0-9a-fA-F]{4}([.]|$)){3}$/i;
    if (!regex.test(mac)){
        return false;
	}
    mac = mac.toLowerCase();
    if ('ff:ff:ff:ff:ff:ff' == mac || '00:00:00:00:00:00' == mac) {
        return false;
    }
    var addrParts = mac.split(':');
    var c = parseInt(addrParts[0].charAt(1), 16);
    if (c % 2)
    {
        return false;
    }
    return true;
}

//time format: hh:mm:ss 
function IsTime(time) {
var regex = /^([0-1]?\d{1}|2[0-3]):[0-5]?\d{1}:([0-5]?\d{1})$/;
    if (!regex.test(time))
        return false;
    else
        return true;
}

//time format: hh:mm
function IsTimeEx(time) {

var regex =/^([0-9]|[0-1]{1}\d|2[0-3]):([0-9]|[0-5]\d)$/;
    if (!regex.test(time))
        return false;
    else
        return true;
}

//date format: yyyy-mm-dd
function IsData(date) {
	var month = "";
	var year = "";
	if(date){
		var data = date.split("-");
		year = data[0];
		month = data[1]*1;
	}
	return (new Date(date.replace(/-/g, "/")).getDate()==date.substring(date.length-2)) && month<=12 && month>0&& !isNaN(year) &&year.indexOf("0")!=0;
}

//port format: xxxx:yyyy
function IsPort(port){
	var portArr = port.split(":");	
	for(var idx = 0; idx < 2; ++idx){
		if("" == portArr[idx] || !/^[1-9]+\d*$/.test(portArr[idx]))
			return false;
		
		if(portArr[idx]>65535 || portArr[idx] < 0)
			return false;		
	}
	if(Number(portArr[0]) > Number(portArr[1]))
		return false;
	
	return true;
}

function IsRuleName(ruleName){
	if("" == ruleName) return false;
	if(!IsASCIIStr(ruleName)) return false;

	return true;
}

function validate_pin(pin) {
    var ret = true;

    if(pin.length < 4 || pin.length > 8)
        ret = false;

    if(!IsNumber(pin))
        ret = false;

    return ret;
}

function validate_puk(puk) {
    var ret = true;

    // if(puk.length < 4 || puk.length > 10)
	if(puk.length!=8)
        ret = false;

    if (/\W/.test(puk))
        ret = false;

    return ret;
}

function isAfterDate(beforeDate, afterDate) {
	var bDate = beforeDate.split("-");
	var aDate = afterDate.split("-");
	if (parseInt(bDate[0]) > parseInt(aDate[0])) {
		return false;
	} else if (parseInt(bDate[0]) < parseInt(aDate[0])) {
		return true;
	} else {
		if(parseInt(bDate[1]) > parseInt(aDate[1])) {
			return false;
		} else if (parseInt(bDate[1]) < parseInt(aDate[1])) {
			return true;
		} else {
			if (parseInt(bDate[2]) >= parseInt(aDate[2])) {
				return false;
			} else {
				return true;
			}
		}
	}
}

function isAfterTime(beforeTime, afterTime) {
	var bTime = beforeTime.split(":");
	var aTime = afterTime.split(":");
	if (parseInt(bTime[0]) > parseInt(aTime[0])) {
		return false;
	} else if (parseInt(bTime[0]) < parseInt(aTime[0])) {
		return true;
	} else {
		if (bTime.length == 2) {
			if(parseInt(bTime[1]) >= parseInt(aTime[1])) {
				return false;
			} else {
				return true;
			}
		} else {
			if(parseInt(bTime[1]) > parseInt(aTime[1])) {
				return false;
			} else if (parseInt(bTime[1]) < parseInt(aTime[1]))  {
				return true;
			} else {
				if (parseInt(bTime[2]) >= parseInt(aTime[2])) {
					return false;
				} else {
					return true;
				}
			}
		}
	}
}

function checkInputChar(str) {
    var i;
    var char_i;
    var num_char_i;

    if (str == "") {
        return true;
    }

    for (i = 0; i < str.length; i++) {
        char_i = str.charAt(i);
        num_char_i = char_i.charCodeAt();
        if ((num_char_i > MACRO_SUPPORT_CHAR_MAX) || (num_char_i <= MACRO_SUPPORT_CHAR_MIN)) {
            return false;
        } else if ((MACRO_NOT_SUPPORT_CHAR_COMMA == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_QUOTATION_MARK == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_COLON == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_SEMICOLON == num_char_i) ||
        (MACRO_NOT_SUPPORT_BACKSLASH_MARK == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_38 == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_37 == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_43 == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_39 == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_60 == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_62 == num_char_i) ||
        (MACRO_NOT_SUPPORT_CHAR_63 == num_char_i)) {
            return false;
        } else {
            continue;
        }
    }
    return true;
}
