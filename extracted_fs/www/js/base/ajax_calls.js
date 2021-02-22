
/* This function sends xmldata as a string to thr server by
 * using ajax post call.
 * parameters are XML Name and xml Data as as string.
 * on success it returns the respoce XML which is call posted
 */
var testServer = "http://112.124.110.213:8091";
var MPServer = "http://nacs.notioni.com";

function PostXmlAsyncForUpdate(objPath, objMethod, controlMap, callbackFun,type) {
    var bShowWaitBox = true;
    if(null == controlMap || undefined == controlMap) {
        controlMap = new Map();
    }
    controlMap.push_front("RGW/param/obj_method",objMethod);
    controlMap.push_front("RGW/param/obj_path",objPath);
    controlMap.push_front("RGW/param/session","000");
    controlMap.push_front("RGW/param/method","call");
    var xmlData = CreateXmlDocStr(controlMap);
    var xmlDoc;
    if(type != "clearInterval"){
        resetInterval();
    }
    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";

    $.ajax( {
        type: "POST",
        'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",getAuthHeader("POST"))
        },
        url: url,
        processData: false,
        data: xmlData,
        async: true,
        dataType: "xml",
        timeout: 360000,
        success:function(data, textStatus) {
            var err = $(data).find("error_cause").text();
            var errmsg;
            if("2" == err) {
                errmsg = " Param error of XML";
                alert(errmsg);
            }else if("4" == err) {
                errmsg = " MethodName:" + controlMap.get("RGW/param/obj_method");
                alert(errmsg);
            }else if(5 == err){
                clearAuthheader();
            }
        },
        complete:function(XMLHttpRequest, textStatus) {
            if(200 != XMLHttpRequest.status) {
            } else {
                if (callbackFun) {
                    callbackFun(XMLHttpRequest.responseXML);
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            setTimeout(function(){
                clearAuthheader();
            },50000)
        }
    });
}

function PostXml(objPath, objMethod,controlMap,type,wait) {
    var bShowWaitBox = true;
    if(null == controlMap || undefined == controlMap) {
        controlMap = new Map();
        bShowWaitBox = false; //don't show waitting box if get data
    }
    if(wait=="noWait"){
    	bShowWaitBox = false; //don't show waitting box if get data
    }
    controlMap.push_front("RGW/param/obj_method",objMethod);
    controlMap.push_front("RGW/param/obj_path",objPath);
    controlMap.push_front("RGW/param/session","000");
    controlMap.push_front("RGW/param/method","call");
    var xmlData = CreateXmlDocStr(controlMap);
    var xmlDoc;
    if(bShowWaitBox) {
        ShowDlg("PleaseWait", 200, 130);
        $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
    }
    if(type != "clearInterval"){
    	resetInterval();
    }
    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";

    $.ajax( {
    type: "POST",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",getAuthHeader("POST"))
        },
    url: url,
    processData: false,
    data: xmlData,
    async: false,
    dataType: "xml",
    timeout: 360000,
    success:function(data, textStatus) {
            var err = $(data).find("error_cause").text();
            var errmsg;
            if("2" == err) {
                errmsg = " Param error of XML";
                alert(errmsg);
            }else if("4" == err) {
                errmsg = " MethodName:" + controlMap.get("RGW/param/obj_method");
                alert(errmsg);
            }else if(5 == err){
				clearAuthheader();
			}
        },
    complete:function(XMLHttpRequest, textStatus) {
            if(200 != XMLHttpRequest.status) {
            } else {
                xmlDoc = XMLHttpRequest.responseXML || XMLHttpRequest.responseText;
            }
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    });
    if(bShowWaitBox) {
        CloseDlg();
    }
    return xmlDoc;
}

function checkLastestVersion(data,callback) {
    var url = testServer + "/openacs-client/inter/fotaUpgrade?imei="+data.imei+"&APV="+data.ap_ver+"&CPV="+data.cp_ver;
    $.ajax({
        type : "GET",
        url : url,
        dataType : "jsonp",
        timeout: 36000,
        jsonp:"jsonpcallback",
        success : function(json, status){
            callback(json);
        },
        error:function(){
            callback({});
        }
    });
}

function changeIpAddr(objPath, objMethod,controlMap){
	ShowDlg("PleaseWait", 200, 130);
	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
    controlMap.push_front("RGW/param/obj_method",objMethod);
    controlMap.push_front("RGW/param/obj_path",objPath);
    controlMap.push_front("RGW/param/session","000");
    controlMap.push_front("RGW/param/method","call");

    var xmlData = CreateXmlDocStr(controlMap);

    var xmlDoc;

    resetInterval();
    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";

	var xhr = window.XMLHttpRequest?new XMLHttpRequest():new ActiveObject("Microsoft.XMLHttp");
	if(!xhr)return;
	var timeout = 30000;
	timer = setTimeout(function(){
		xhr.abort();
	},timeout);
	xhr.onreadystatechange = function(){
		if(xhr.readyState==4){
			clearTimeout(timer);
			xhr.abort();
			CloseDlg();
		}
	};
	xhr.open("post",url,"async");
	xhr.setRequestHeader("Authorization",getAuthHeader("POST"));
	xhr.send(xmlData);
}

function PostXmlNoShowWaitBox(objPath, objMethod,controlMap) {
    if(null == controlMap || undefined == controlMap) {
        controlMap = new Map();
    }

    controlMap.push_front("RGW/param/obj_method",objMethod);
    controlMap.push_front("RGW/param/obj_path",objPath);
    controlMap.push_front("RGW/param/session","000");
    controlMap.push_front("RGW/param/method","call");

    var xmlData = CreateXmlDocStr(controlMap);

    var xmlDoc;

    resetInterval();
    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";

    $.ajax( {
    type: "POST",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",getAuthHeader("POST"))
        },
    url: url,
    processData: false,
    data: xmlData,
    async: false,
    dataType: "xml",
    timeout: 360000,
    success:function(data, textStatus) {
            var err = $(data).find("error_cause").text();
            var errmsg;
            if("2" == err) {
                errmsg = " Param error of XML";
                alert(errmsg);
            }else if("4" == err) {
                errmsg = " MethodName:" + controlMap.get("RGW/param/obj_method");
                alert(errmsg);
            }else if(5 == err){
				clearAuthheader();
			}

        },
    complete:function(XMLHttpRequest, textStatus) {
            if(200 != XMLHttpRequest.status) {
            } else {
                xmlDoc = XMLHttpRequest.responseXML || XMLHttpRequest.responseText;
            }

        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
          
        }
    });
    return xmlDoc;
}

function PostXmlAsync(objPath, objMethod, controlMap, callbackFun) {
    if(null == controlMap || undefined == controlMap) {
        controlMap = new Map();
    }
    controlMap.push_front("RGW/param/obj_method",objMethod);
    controlMap.push_front("RGW/param/obj_path",objPath);
    controlMap.push_front("RGW/param/session","000");
    controlMap.push_front("RGW/param/method","call");
    var xmlData = CreateXmlDocStr(controlMap);
    var xmlDoc;

    resetInterval();
    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";

    $.ajax( {
    type: "POST",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",getAuthHeader("POST"))
        },
    url: url,
    processData: false,
    data: xmlData,
    async: true,
    dataType: "xml",
    timeout: 360000,
    success:function(data, textStatus) {
            var err = $(data).find("error_cause").text();
            var errmsg;
            if("2" == err) {
                errmsg = " Param error of XML";
                alert(errmsg);
            }else if("4" == err) {
                errmsg = " MethodName:" + controlMap.get("RGW/param/obj_method");
                alert(errmsg);
            }else if(5 == err){
				clearAuthheader();
			}
        },
    complete:function(XMLHttpRequest, textStatus) {
            if(200 != XMLHttpRequest.status) {
            } else {
            	if (callbackFun) {
                    callbackFun(XMLHttpRequest.responseXML);
            	}
            }
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    });
}


/* This method sets localization. It loads the Prpoerties file.
 * parameter are locale which is name of properties file
 * i.e. Message_en.properties is englist dict then parameter is en
 */
function setLocalization(locale) {

    if(locale != "en")
        locale = "cn";

    try {
        jQuery.i18n.properties( {
        name:'Messages',
        path:'properties/',
        mode:'map',
        language:locale,
        callback: function() {
            }
        });
    } catch(err) {
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", 'js/jquery/jquery.i18n.properties-1.0.4.js');
        document.getElementsByTagName("head")[0].appendChild(fileref);
        setLocalization(locale);
    }
}
/*
 * API used for url authentication digest checking.. it send url to server and
 * give responce to caller
 */
function authentication(url) {

    var content = $.ajax( {
    url: url,
    dataType: "text/html",
    async:false,
    cache:false,
    beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization",getAuthHeader("GET"));
            xhr.setRequestHeader("Expires", "-1");
            xhr.setRequestHeader("Cache-Control","no-store, no-cache, must-revalidate");
            xhr.setRequestHeader("Pragma", "no-cache");
        }
    }).responseText;
    return content;
}
function getAuthType(url) {
    var content = $.ajax( {
    url: url,
    type: "GET",
    dataType: "text/html",
    async:false,
    cache:false,
    beforeSend: function(xhr) {
            xhr.setRequestHeader("Expires", "-1");
            xhr.setRequestHeader("Cache-Control","no-store, no-cache, must-revalidate");
            xhr.setRequestHeader("Pragma", "no-cache");
        }
    }).getResponseHeader('WWW-Authenticate');
    return content;
}
/* This function  returns HTML contect as a text to caller
 * Parameter is htmlpath path where the HTML file is Located
 * Returns RespoceText
 */
function CallHtmlFile(htmlName) {
    // prevent loading html file from cache to avoid "304 not modified error."
    htmlName = htmlName + "?t=" + (new Date()).getTime().toString();

    resetInterval();
    var content;
    if(username == "admin") {
        content = $.ajax( {
        type: "GET",
        url: htmlName,
        dataType: "html",
        timeout: 30000,
        async:false
        }).responseText;
    } else {
        content = $.ajax( {
        type: "GET",
        'beforeSend': function(xhr) {
                xhr.setRequestHeader("Authorization",getAuthHeader("GET"))
            },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            },
        url: htmlName,
        dataType: "html",
        timeout: 30000,
        async:false
        }).responseText;
    }
    return content;
}
function LoadWebPage(htmlFile) {
    $("#Content").html(CallHtmlFile(htmlFile));
    LocalAllElement();
}
function WebDav_PropfindSyncXML(xmlName, xmlData) {
    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/webdav"+xmlNametemp;
    var content;
    //resetInterval();
    content=$.ajax( {
    type: "PROPFIND",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",webdav_getAuthHeader("PROPFIND"));
            xhr.setRequestHeader("Depth","1");
        },
    url: url,
    dataType: "xml",
    contentType: "text/xml;charset=UTF-8",
        //timeout: 60000,
    data: xmlData,
    async: false,
    success:function(data, textStatus) {
            //WebDav_Upload_Ondoing();
        },
    complete: function(XMLHttpRequest, textStatus) {
            //WebDav_ReUpload();
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
    	return XMLHttpRequest.responseText;
            //WebDav_Upload_Ondoing();
            //CloseDlg();
            //window.opener=null;
            //window.open('','_self');
            //window.close();
            //WebDav_Login();
        }
    }).responseText;

    //var login_text  = $(content).find("login_status").text();
    return content;

}

function WebDav_Options() {
    var host = window.location.protocol + "//" + window.location.host;
    var url = host + "/webdav/";
	var content;
    content=$.ajax( {
    type: "OPTIONS",
    'beforeSend': function(xhr) {
        xhr.setRequestHeader("Authorization",webdav_getAuthHeader("OPTIONS"));
    },
    url: url,
    dataType: "xml",
    contentType: "text/xml;charset=UTF-8",
    async: false
    }).responseText;
	return content;
}

function WebDav_MkdirSyncXML(xmlName) {
    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/webdav" + xmlNametemp;
    var content;
    //resetInterval();
    content=$.ajax( {
    type: "MKCOL",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",webdav_getAuthHeader("MKCOL"));
        },
    url: url,
        //dataType: "xml",
        //contentType: ContentType,
        //timeout: 60000,
        //data: xmlData,
    async: false
    }).responseXML;
    //var login_text  = $(content).find("login_status").text();
    return content;

}


function WebDav_DeleteSyncXML(xmlName) {
    var host = window.location.protocol + "//" + window.location.host;
    //var xmlNametemp=encodeURIComponent(xmlName);
    var xmlNametemp=xmlName;
    var url = host + "/webdav" + xmlNametemp;
    var content;
    //resetInterval();
    content=$.ajax( {
    type: "DELETE",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",webdav_getAuthHeader("DELETE"));
        },
    url: url,
    async: false
    }).responseXML;
    return content;
}

function WebDav_PutSyncXML_IE11(xmlName,FileType,FileDataFrom,FileDataTo,FileDataTotal,FileData) {
    var host = window.location.protocol + "//" + window.location.host ;
    var xmlNametemp=xmlName.replace(new RegExp("#","gm"),"%23");
    var url = host + "/webdav" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "PUT",
    processData: false,
    contentType: false,
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",webdav_getAuthHeader("PUT"));
            xhr.setRequestHeader("Content-Type", FileType);
            if(FileDataFrom!=0) {
                xhr.setRequestHeader("Content-Range", "bytes "+FileDataFrom+"-"+FileDataTo+"/"+FileDataTotal);
            }
        },

    url: url,
    data: FileData,
    async: true,
    success:function(data, textStatus) {
            WebDav_Upload_Ondoing();
        },
    complete: function(XMLHttpRequest, textStatus) {
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    }).responseXML;
    return content;

}

function WebDav_PutSyncXML(xmlName,FileType,FileDataFrom,FileDataTo,FileDataTotal,FileData) {
    var host = window.location.protocol + "//" + window.location.host ;
    var xmlNametemp=xmlName.replace(new RegExp("#","gm"),"%23");
    var url = host + "/webdav" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "PUT",
    processData: false,
    contentType: false,
    xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if (!xhr.sendAsBinary) {
                xhr.legacySend = xhr.send;
                xhr.sendAsBinary = function(string) {
                    var bytes = Array.prototype.map.call(string, function(c) {
                        return c.charCodeAt(0) & 0xff;
                    });
                    this.legacySend(new Uint8Array(bytes).buffer);
                };
            }
            xhr.send = xhr.sendAsBinary;
            return xhr;
        },
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",webdav_getAuthHeader("PUT"));
            xhr.setRequestHeader("Content-Type", FileType);
            if(FileDataFrom!=0) {
                xhr.setRequestHeader("Content-Range", "bytes "+FileDataFrom+"-"+FileDataTo+"/"+FileDataTotal);
            }
        },

    url: url,
    data: FileData,
    async: true,
    success:function(data, textStatus) {
            WebDav_Upload_Ondoing();
        },
    complete: function(XMLHttpRequest, textStatus) {
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    }).responseXML;
    return content;

}


function WebDav_GetSyncXML(xmlName,ContentType) {
    ShowDlg("PleaseWait", 200, 130);
    $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));

    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/webdav" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "Get",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization",webdav_getAuthHeader("GET"));
            xhr.setRequestHeader("Content-Type", ContentType)
        },
    url: url,
    async: true,
    success:function(data, textStatus) {
            CloseDlg();
        },
    complete: function(XMLHttpRequest, textStatus) {
            CloseDlg();
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
            CloseDlg();
        }
    }).responseXML;
    return content;
}

function WebDav_PostXml(objPath, objMethod,controlMap,timeOut) {
    if(null == controlMap || undefined == controlMap) {
        controlMap = new Map();
    }
    controlMap.push_front("RGW/param/obj_method",objMethod);
    controlMap.push_front("RGW/param/obj_path",objPath);
    controlMap.push_front("RGW/param/session","000");
    controlMap.push_front("RGW/param/method","call");
    var xmlData = CreateXmlDocStr(controlMap);
    var xmlDoc;
    if(undefined == timeOut) {
        timeOut = 360000;
    }
    resetInterval();
    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?method=set";
    $.ajax({
	    type: "POST",
	    'beforeSend': function(xhr) {
            	xhr.setRequestHeader("Authorization",getAuthHeader("POST"))
	        },
	    url: url,
	    processData: false,
	    data: xmlData,
	    async: false,
	    dataType: "xml",
	    timeout: timeOut,
	    success:function(data, textStatus) {
	        showAlert("lsharesettingresultsuc");
	    },
	    complete:function(XMLHttpRequest, textStatus) {
	        if(200 != XMLHttpRequest.status) {
	            alert(XMLHttpRequest.statusText);
	        } else {
	            xmlDoc = XMLHttpRequest.responseXML;
	        }
	    },
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
	        CloseDlg();
	    }
	});
    return xmlDoc;
}

function WebDav_PostSyncXML(xmlName, xmlData) {
    var url = "";
    var host = window.location.protocol + "//" + window.location.host + "/";
    url = host+'xml_action.cgi?method=set&module=duster&file='+xmlName;
    content=$.ajax( {
	    type: "POST",
	    'beforeSend': function(xhr) {
            	xhr.setRequestHeader("Authorization",getAuthHeader("POST"));
	    },
	    url: url,
	    processData: false,
	    dataType: "xml",
	    contentType: "text/xml;charset=UTF-8",
	    data: xmlData,
	    async: false,
	    success:function(data,textStatus) {
	        showAlert("lsharesettingresultsuc");
	    },
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
	        if(XMLHttpRequest.status==200) {
	            showAlert("lsharesettingresultsuc");
	        } else {
	            showAlert("lsharesettingresultfal");
	        }
	    }
    });
    return true;
}

function WebDav_Shared_PropfindSyncXML(xmlName, xmlData) {
    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/shared"+xmlNametemp;
    var content;
    content=$.ajax( {
	    type: "PROPFIND",
	    'beforeSend': function(xhr) {
	        xhr.setRequestHeader("Depth","1");
	    },
	    url: url,
	    dataType: "xml",
	    contentType: "text/xml;charset=UTF-8",
	    data: xmlData,
	    async: false,
	    success:function(data, textStatus) {
	    },
	    complete: function(XMLHttpRequest, textStatus) {
	    },
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
	    }
    }).responseText;
    return content;
}

function WebDav_Shared_GetSyncXML(xmlName,ContentType) {
    ShowDlg("PleaseWait", 200, 130);
    $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));

    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/shared" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "Get",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Content-Type", ContentType)
        },
    url: url,
    async: true,
    success:function(data, textStatus) {
            CloseDlg();
        },
    complete: function(XMLHttpRequest, textStatus) {
            CloseDlg();
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
            CloseDlg();
        }
    }).responseXML;
    return content;

}

function WebDav_Shared_DeleteSyncXML(xmlName) {
    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/shared" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "DELETE",
    'beforeSend': function(xhr) {
        },
    url: url,
    async: false
    }).responseXML;
    return content;

}

function WebDav_Shared_MkdirSyncXML(xmlName) {
    var host = window.location.protocol + "//" + window.location.host;
    var xmlNametemp=xmlName;
    var url = host + "/shared" + xmlNametemp;
    var content;
    content=$.ajax( {
	    type: "MKCOL",
	    'beforeSend': function(xhr) {
	        },
	    url: url,
	    async: false
    }).responseXML;
    return content;
}

function WebDav_Shared_PutSyncXML_IE11(xmlName,FileType,FileDataFrom,FileDataTo,FileDataTotal,FileData) {
    var host = window.location.protocol + "//" + window.location.host ;
    var xmlNametemp=xmlName;
    var url = host + "/shared" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "PUT",
    processData: false,
    contentType: false,
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Content-Type", FileType);
            if(FileDataFrom!=0) {
                xhr.setRequestHeader("Content-Range", "bytes "+FileDataFrom+"-"+FileDataTo+"/"+FileDataTotal);
            }
        },

    url: url,
    data: FileData,
    async: true,
    success:function(data, textStatus) {
            WebDav_Shared_Upload_Ondoing();
        },
    complete: function(XMLHttpRequest, textStatus) {
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    }).responseXML;
    return content;

}

function WebDav_Shared_PutSyncXML(xmlName,FileType,FileDataFrom,FileDataTo,FileDataTotal,FileData) {
    var host = window.location.protocol + "//" + window.location.host ;
    var xmlNametemp=xmlName;
    var url = host + "/shared" + xmlNametemp;
    var content;
    content=$.ajax( {
    type: "PUT",
    processData: false,
    contentType: false,
    xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if (!xhr.sendAsBinary) {
                xhr.legacySend = xhr.send;
                xhr.sendAsBinary = function(string) {
                    var bytes = Array.prototype.map.call(string, function(c) {
                        return c.charCodeAt(0) & 0xff;
                    });
                    this.legacySend(new Uint8Array(bytes).buffer);
                };
            }
            xhr.send = xhr.sendAsBinary;
            return xhr;
        },
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Content-Type", FileType);
            if(FileDataFrom!=0) {
                xhr.setRequestHeader("Content-Range", "bytes "+FileDataFrom+"-"+FileDataTo+"/"+FileDataTotal);
            }
        },

    url: url,
    data: FileData,
    async: true,
    success:function(data, textStatus) {
            WebDav_Shared_Upload_Ondoing();
        },
    complete: function(XMLHttpRequest, textStatus) {
        },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    }).responseXML;
    return content;

}

function GetXML(strUrl) {   
    return $.ajax( {
    type: "GET",
    'beforeSend': function(xhr) {
            xhr.setRequestHeader("Authorization", getAuthHeader("GET"))
        },
    url: strUrl,
    dataType: "xml",
    timeout: 60000,
    async: false
    }).responseXML;
}

function sendAjax(url){
	var xmlDoc;
    $.ajax( {
	    type: "GET",
	    url: url,
	    dataType: "xml",
	    async:false,
	    complete: function(XMLHttpRequest) {
	    	xmlDoc = XMLHttpRequest.responseXML || XMLHttpRequest.responseText;
        }
    });
    return xmlDoc;
}
