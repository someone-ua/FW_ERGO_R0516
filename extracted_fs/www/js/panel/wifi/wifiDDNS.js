var g_cancel_$Tr = '';
var g_old_domain_name = '';
var g_dnameArr = [];
(function($) {
    $.fn.objWifiDDNS = function() {
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/wifi/wifiDDNS.html");
                $('#isShow').click(function(){
                    if($(this).prop('checked')){
                        $('input.ddns_password').attr('type','text') ;
                    }else{
                        $('input.ddns_password').attr('type','password') ;
                    }
                });
                $('#lt_wifiDNSS_add').click(function(){
                    if(g_bodyWidth>430){
						$('.button-key').addClass('disabled');
						var passwordType ;
						if($('#isShow').prop('checked')){
							passwordType = 'text';
						}else{
							passwordType =  'password';
						};
						var html = '<tr id="edit_index">'
									+'<td><img src="../../images/not_connected.png" alt=""></td>'
									+'<td>DynDNS.org</td>'
									+'<td>'
										+'<select class="editor">'
										+'<option value="0">Off</option>'
										+'<option value="1">On</option>'
										+'</select>'
									+'</td>'
									+'<td><input type="text" value="" class="ddns_dname editor"></td>'
									+'<td><input type="text" value="" class="ddns_uname editor"></td>'
									+'<td><input type="'+passwordType+'" value="" class="ddns_password editor"></td>'
									+'<td>'
										+'<span onclick="okDDNS(this)">'+jQuery.i18n.prop("lt_wifiDDNS_OK")+'</span>'
										+'<span onclick="cancleDDNS(this)">'+jQuery.i18n.prop("lt_wifiDDNS_cancle")+'</span>'
									+'</td>'
									+'</tr>';
						$("#tbodyWifiDDNS_list").append(html);
						$('#tbodyWifiDDNS_list input').mouseup(function(){
							$('#ddnsError').text('');
						});
					}else{
						addDDNS_phone();
					}
                });
            } //end flag
            getDDNSlist();
        };
		function addDDNS_phone(){
			ShowDlg('divTableConfig','95%',345);
			clearErrorInfo();
			$('#lt_BtnOk').click(function(){
				var status = $('#txt_wifiDDNS_status').val();
				var dname = $('#txt_wifiDDNS_dn').val();
				var duname = $('#txt_wifiDDNS_un').val();
				var dpassword = $('#txt_wifiDDNS_password').val();
				// var r = /^[A-Za-z][\w]*\.[\w\.]+$/;
				var r = /^[A-Za-z][-A-Za-z0-9]*\.[-A-Za-z0-9\.]+$/;
				if(!r.test(dname)){
					$('#lDDNSError').text(jQuery.i18n.prop("DDNS_formateError")).show();
					$('#txt_wifiDDNS_dn').focus();
					return;
				}
				for(var i=0;i<g_dnameArr.length;i++){
					if(dname == g_dnameArr[i]){
						$('#lDDNSError').text(jQuery.i18n.prop("DDNS_unique")).show();
						$('#txt_wifiDDNS_dn').focus();
						return;
					}
				}
				if(!$.trim(duname)){
					$('#lDDNSError').text(jQuery.i18n.prop("DDNS_blank")).show();
					$('#txt_wifiDDNS_un').focus();
					return;
				}
				if(!checkDDNSNamePass(duname)){
					$('#lDDNSError').text(jQuery.i18n.prop("DDNS_ERROE")).show();
					$('#txt_wifiDDNS_un').focus();
					return;
					 
				}
				if(!$.trim(dpassword)){
					$('#lDDNSError').text(jQuery.i18n.prop("DDNS_blank")).show();
					$('#txt_wifiDDNS_password').focus();
					return;
				}
				if(!checkDDNSNamePass(dpassword)){
					$('#lDDNSError').text(jQuery.i18n.prop("DDNS_ERROE")).show();
					$('#txt_wifiDDNS_password').focus();
					return;
					 
				}
				ShowDlg("PleaseWait", 200, 130);
				$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
				setTimeout(function(){
					var configMap = new Map();
					configMap.put("RGW/router/ddns_enable",status);
					configMap.put("RGW/router/ddns_domain_name",dname);
					configMap.put("RGW/router/ddns_user_name",duname);
					configMap.put("RGW/router/ddns_password",dpassword);
					// configMap.put("RGW/router/ddns_old_domain",ddnsInfo[1]);
					configMap.put("RGW/router/ddns_operate",'add');
					var retXml = PostXml("router","router_set_ddns",configMap);
					if($(retXml).find('setting_response').text() == 'OK'){
						getDDNSlist();
						showMsgBox(jQuery.i18n.prop("dialog_message_ddns_add_title"), jQuery.i18n.prop("dialog_message_ddns_add_succes"));
					}else{
						showMsgBox(jQuery.i18n.prop("dialog_message_ddns_add_title"), jQuery.i18n.prop("dialog_message_ddns_add_fail"));
					}
				},200);
			});
		}
		
		
        return this;
    }
})(jQuery);
function getDDNSlist(){
    $("#tbodyWifiDDNS_list").empty();
    $("#tbodyWifiDDNS_list_phone").empty();
    g_dnameArr = [];
    var retXml = PostXml("router","router_get_ddns");
    var html = '';;
	var phone_html = ''
    $(retXml).find('ddns_list').each(function(){
        var status;
        if($(this).find('enabled').text()=='0'){
            status = 'Off';
        }else{
            status = 'On';
        }
		var dname = $(this).find('domain').text();
		var duname = $(this).find('username').text();
		var dpassword = $(this).find('password').text();
		var enabled = $(this).find('enabled').text();
        g_dnameArr.push(dname);
        html += '<tr>'
            +'<td>'
            +'<img src="../../images/connection_failed.png" alt="">'
            +'</td>'
            +'<td>DynDNS.org</td>'
            +'<td>'+status+'</td>'
            +'<td><input type="text" value="'+ dname +'" class="ddns_dname" readonly></td>'
            +'<td><input type="text" value="'+ duname +'" class="ddns_uname" readonly></td>'
            +'<td><input type="password" value="'+ dpassword +'" class="ddns_password" readonly></td>'
            +'<td>'
            +'<span onclick="editDDNS(this)" class="button-key">'+jQuery.i18n.prop("lt_wifiDDNS_edit")+'</span>'
            +'<span onclick="delectDDNS(this)" class="button-key">'+jQuery.i18n.prop("lt_wifiDDNS_Delete")+'</span>'
            +'</td>'
            +'</tr>';
		var DDNSinfo = enabled+';'+dname+';'+duname+';'+dpassword;
		phone_html += '<tr name="'+DDNSinfo+'">'
            +'<td>'+status+'</td>'
            +'<td><input type="text" value="'+ dname +'" class="ddns_dname" readonly></td>'
            +'<td><input type="text" value="'+ duname +'" class="ddns_uname" readonly></td>'
            +'<td><input type="password" value="'+ dpassword +'" class="ddns_password" readonly></td>'
            +'<td>'
            +'<span onclick="delectDDNS(this)">'+jQuery.i18n.prop("lt_wifiDDNS_Delete")+'</span>'
            +'</td>'
            +'</tr>';
    });
    $("#tbodyWifiDDNS_list").html(html);
    $('#tbodyWifiDDNS_list input').mouseup(function(){
        $('#ddnsError').text('');
    });
	$("#tbodyWifiDDNS_list_phone").html(phone_html);
	$("#tbodyWifiDDNS_list_phone tr td:lt(4)").click(function(){
		var ddnsInfo = $(this).parent('tr').attr("name").split(";");
		editDDNS_phone(ddnsInfo);
	});
}
function editDDNS_phone(ddnsInfo){
	ShowDlg('divTableConfig','95%',345);
	clearErrorInfo();
	$('#wifiDDNS_connection').attr('src','../../images/connection_failed.png');
	$('#txt_wifiDDNS_status').val(ddnsInfo[0]);
	$('#txt_wifiDDNS_dn').val(ddnsInfo[1]);
	$('#txt_wifiDDNS_un').val(ddnsInfo[2]);
	$('#txt_wifiDDNS_password').val(ddnsInfo[3]);
	$('#lt_BtnOk').click(function(){
		var status = $('#txt_wifiDDNS_status').val();
		var dname = $('#txt_wifiDDNS_dn').val();
		var duname = $('#txt_wifiDDNS_un').val();
		var dpassword = $('#txt_wifiDDNS_password').val();
		if(status == ddnsInfo[0] && dname == ddnsInfo[1] && duname == ddnsInfo[2] && dpassword[3]){
			return;
		}
		// var r = /^[A-Za-z][\w]*\.[\w\.]+$/;
		var r = /^[A-Za-z][-A-Za-z0-9]*\.[-A-Za-z0-9\.]+$/;
		if(!r.test(dname)){
			$('#lDDNSError').text(jQuery.i18n.prop("DDNS_formateError")).show();
			$('#txt_wifiDDNS_dn').focus();
			return;
		}
		if(dname!=ddnsInfo[1]){
			for(var i=0;i<g_dnameArr.length;i++){
				if(dname == g_dnameArr[i]){
					$('#lDDNSError').text(jQuery.i18n.prop("DDNS_unique")).show();
					$('#txt_wifiDDNS_dn').focus();
					return;
				}
			}
		}
		if(!$.trim(duname)){
			$('#lDDNSError').text(jQuery.i18n.prop("DDNS_blank")).show();
			$('#txt_wifiDDNS_un').focus();
			return;
		}
		if(!checkDDNSNamePass(duname)){
			$('#lDDNSError').text(jQuery.i18n.prop("DDNS_ERROE")).show();
			$('#txt_wifiDDNS_un').focus();
			return;
			
		}
		if(!$.trim(dpassword)){
			$('#lDDNSError').text(jQuery.i18n.prop("DDNS_blank")).show();
			$('#txt_wifiDDNS_password').focus();
			return;
		}
		if(!checkDDNSNamePass(dpassword)){
			$('#lDDNSError').text(jQuery.i18n.prop("DDNS_ERROE")).show();
			$('#txt_wifiDDNS_password').focus();
			return;
		
		}
		ShowDlg("PleaseWait", 200, 130);
		$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
		setTimeout(function(){
			var configMap = new Map();
			configMap.put("RGW/router/ddns_enable",status);
			configMap.put("RGW/router/ddns_domain_name",dname);
			configMap.put("RGW/router/ddns_user_name",duname);
			configMap.put("RGW/router/ddns_password",dpassword);
			configMap.put("RGW/router/ddns_old_domain",ddnsInfo[1]);
			configMap.put("RGW/router/ddns_operate",'edit');
			var retXml = PostXml("router","router_set_ddns",configMap);
			if($(retXml).find('setting_response').text() == 'OK'){
				getDDNSlist();
				showMsgBox(jQuery.i18n.prop("dialog_message_ddns_edit_title"), jQuery.i18n.prop("dialog_message_ddns_edit_succes"));
			}else{
				showMsgBox(jQuery.i18n.prop("dialog_message_ddns_edit_title"), jQuery.i18n.prop("dialog_message_ddns_edit_fail"));
			}
		},200);
	});
}
function editDDNS(that){
    $('#ddnsError').text('');
    var $tr = $(that).parent().parent();
    g_cancel_$Tr = $tr;
    g_old_domain_name = '';
    $tr.find('input').removeAttr("readonly");
    var $tds = $tr.children('td');
    var service = $tds.eq(1).text();
    var status;
    if($tds.eq(2).text() == 'Off'){
        status = 0;
    }else{
        status = 1;
    }
    var dname = $tds.find('.ddns_dname').val();
    g_old_domain_name = dname;
    var uname = $tds.find('.ddns_uname').val();
    var password = $tds.find('.ddns_password').val();
    var statusHtml = '<select>'
        +'<option value="0">Off</option>'
        +'<option value="1">On</option>'
        +'</select>';
    $tds.eq(2).html(statusHtml).children('select').val(status);
    var operatHtml = '<span onclick="okDDNS(this)">'+jQuery.i18n.prop("lt_wifiDDNS_OK")+'</span>'
        +'<span onclick="cancleDDNS(\'\',\''+service+'\',\''+status+'\',\''+dname+'\',\''+uname+'\',\''+password+'\')">'+jQuery.i18n.prop("lt_wifiDDNS_cancle")+'</span>';
    $tds.eq(6).html(operatHtml);
    $tr.find('input').addClass('editor');
    $tr.find('select').addClass('editor');
    $('.button-key').addClass('disabled');
}
function delectDDNS(that){
    $('#ddnsError').text('');
    ShowDlg("isDelectDDNSlist",350,150);
    document.getElementById("isDelectDDNSlist_title").innerHTML = jQuery.i18n.prop("isDelectDDNSlist_title");
    document.getElementById("isDelectDDNSlist_text").innerHTML = jQuery.i18n.prop("isDelectDDNSlist_text");
    $('#isDelectDDNSlist_sure').click(function(){
        CloseDlg();
        var $tr = $(that).parent().parent();
        var $tds = $tr.children('td');
        var dname = $tds.find('.ddns_dname').val();
        var status = $tds.eq(2).text();
        if(status == 'Off'){
            status = 0;
        }else{
            status = 1;
        }
        var configMap = new Map();
        configMap.put("RGW/router/ddns_old_domain",dname);
        configMap.put("RGW/router/ddns_enable",status);
        configMap.put("RGW/router/ddns_operate",'delete');
        var retXml = PostXml("router","router_set_ddns",configMap);
        if($(retXml).find('setting_response').text() == 'OK'){
            $tr.hide();
            g_dnameArr = delectArrValue(dname,g_dnameArr);
            showMsgBox(jQuery.i18n.prop("dialog_message_ddns_delete_title"), jQuery.i18n.prop("dialog_message_ddns_delete_succes"));
        }else{
            showMsgBox(jQuery.i18n.prop("dialog_message_ddns_delete_title"), jQuery.i18n.prop("dialog_message_ddns_delete_fail"));
        }
    });
}
function okDDNS(that){
    $('#ddnsError').text('');
    var $tr = $(that).parent().parent();
    var $tds = $tr.children('td');
    var status = $tds.find('select').val();
    var dname = $tds.find('.ddns_dname').val();
    var uname = $tds.find('.ddns_uname').val();
    var password = $tds.find('.ddns_password').val();
    // var r = /^[A-Za-z][\w]*\.[\w\.]+$/;
	var r = /^[A-Za-z][-A-Za-z0-9]*\.[-A-Za-z0-9\.]+$/;
    if(!r.test(dname)){
        $('#ddnsError').text(jQuery.i18n.prop("DDNS_formateError"));
        $tds.find('.ddns_dname').focus();
        return;
    }

    if(g_old_domain_name){ //edit
        if(g_old_domain_name!=dname){
            for(var i=0;i<g_dnameArr.length;i++){
                if(dname == g_dnameArr[i] && dname != g_old_domain_name){
                    $('#ddnsError').text(jQuery.i18n.prop("DDNS_unique"));
                    $tds.find('.ddns_dname').focus();
                    return;
                }
            }
        }
    }else{
        for(var i=0;i<g_dnameArr.length;i++){
            if(dname == g_dnameArr[i]){
                $('#ddnsError').text(jQuery.i18n.prop("DDNS_unique"));
                $tds.find('.ddns_dname').focus();
                return;
            }
        }
    }
    if(!$.trim(uname)){
        $('#ddnsError').text(jQuery.i18n.prop("DDNS_blank"));
        $tds.find('.ddns_uname').focus();
        return;
    }
	
	if(!checkDDNSNamePass(uname)){
		 $('#ddnsError').text(jQuery.i18n.prop("DDNS_ERROE"));
		$tds.find('.ddns_uname').focus();
		return;
	}
    if(!$.trim(password)){
        $('#ddnsError').text(jQuery.i18n.prop("DDNS_blank"));
        $tds.find('.ddns_password').focus();
        return;
    }
	if(!checkDDNSNamePass(password)){
		  $('#ddnsError').text(jQuery.i18n.prop("DDNS_ERROE"));
		$tds.find('.ddns_password').focus();
		return;
	}
	
    var configMap = new Map();
    configMap.put("RGW/router/ddns_enable",status);
    configMap.put("RGW/router/ddns_domain_name",dname);
    configMap.put("RGW/router/ddns_user_name",uname);
    configMap.put("RGW/router/ddns_password",password);
    configMap.put("RGW/router/ddns_old_domain",g_old_domain_name);
    if(g_old_domain_name){ //edit
        configMap.put("RGW/router/ddns_operate",'edit');
    }else{ //add
        configMap.put("RGW/router/ddns_operate",'add');
    }
    var retXml = PostXml("router","router_set_ddns",configMap);
    if($(retXml).find('setting_response').text() == 'OK'){
        $tr.find('img').attr('src','../../images/connection_failed.png');
        $('.button-key').removeClass('disabled');
        $tr.find('td').eq(6).html('<span onclick="editDDNS(this)" class="button-key">'+jQuery.i18n.prop("lt_wifiDDNS_edit")+'</span><span onclick="delectDDNS(this)" class="button-key">'+jQuery.i18n.prop("lt_wifiDDNS_Delete")+'</span>');
        if(status=='0'){
            $tr.find('td').eq(2).html('Off');
        }else{
            $tr.find('td').eq(2).html('On');
        }
        $tr.find('input').attr("readonly","readonly").removeClass('editor');
        if(g_old_domain_name){
            if(g_old_domain_name!= dname){
                for(var i=0;i<g_dnameArr.length;i++){
                    if(g_old_domain_name == g_dnameArr[i]){
                        g_dnameArr[i] = dname;
                        break;
                    }
                }
            }
            g_old_domain_name = '';
            showMsgBox(jQuery.i18n.prop("dialog_message_ddns_edit_title"), jQuery.i18n.prop("dialog_message_ddns_edit_succes"));
        }else{
            g_old_domain_name = '';
            g_dnameArr.push(dname);
            showMsgBox(jQuery.i18n.prop("dialog_message_ddns_add_title"), jQuery.i18n.prop("dialog_message_ddns_add_succes"));
        }
    }else{
        if(g_old_domain_name){
            showMsgBox(jQuery.i18n.prop("dialog_message_ddns_edit_title"), jQuery.i18n.prop("dialog_message_ddns_edit_fail"));
        }else{
            showMsgBox(jQuery.i18n.prop("dialog_message_ddns_add_title"), jQuery.i18n.prop("dialog_message_ddns_add_fail"));
        }

    }
}

function checkDDNSNamePass(str){
	var str = $.trim(str);
	var r = /[\x00-\x1f]/;
	var s = /\s/;
	
	if(r.test(str)||s.test(str)||IsChineseChar(str)||!checkInputChar(str)){
		return false;
	}else{
		return true;
	}
}

function cancleDDNS(that,service,status,dname,uname,password){
    $('#ddnsError').text('');
    g_old_domain_name = '';
    $('.button-key').removeClass('disabled');
    var $tr ;
    if(that){
        $tr = $(that).parent().parent();
        $tr.hide();
        return;
    }
    $tr = g_cancel_$Tr;
    if(status == 0){
        status = 'Off';
    }else if(status == 1){
        status = 'On';
    }
    var passwordType ;
    if($('#isShow').prop('checked')){
        passwordType = 'text';
    }else{
        passwordType =  'password';
    };
    var html = '<td>'
        +'<img src="../../images/connection_failed.png" alt="">'
        +'</td>'
        +'<td>'+service+'</td>'
        +'<td>'+status+'</td>'
        +'<td><input type="text" value="'+dname+'" class="ddns_dname" readonly></td>'
        +'<td><input type="text" value="'+uname+'" class="ddns_uname" readonly></td>'
        +'<td><input type="'+passwordType+'" value="'+password+'" class="ddns_password" readonly></td>'
        +'<td>'
        +'<span class="button-key" onclick="editDDNS(this)">'+jQuery.i18n.prop("lt_wifiDDNS_edit")+'</span>'
        +'<span class="button-key" onclick="delectDDNS(this)">'+jQuery.i18n.prop("lt_wifiDDNS_Delete")+'</span>'
        +'</td>';
    $tr.html(html);
    $('.button-key').removeClass('disabled');
    g_cancel_$Tr = '';
}
function delectArrValue(val,arr){
    for(var i=0;i<arr.length;i++){
        if(val==arr[i]){
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
}
