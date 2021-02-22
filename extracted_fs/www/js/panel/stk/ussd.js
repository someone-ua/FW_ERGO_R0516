
/*
 Post
 <ussd>
 <action/> <!-1: start session 2: end session 3: send indication response-->
 <ussd_param/><!-only make sense when action is 1 or 3, should be encoded by UCS2-->
 </ussd>

 Get
 <ussd>
 <ussd_type/><!-0: USSD notify 1: USSD-request 2: session terminated by network 3: other local client had responded 4:operation not supported 5: network timeout-->
 <ussd_str/><!-USSD string encoded by UCS2-->
 </ussd>*/
(function ($) {
    $.fn.objussd = function (InIt) {
        var timeoutCount = 0;
        var findValue='';
        var action = 1;//1: start session 2: end session 3: send indication response
        this.onLoad = function (flag) {
            LoadWebPage("html/stk/ussd.html");
            LocalAllElement();
            $("#lt_ussd_btnSend").click(function() {
                var ussd_value = $.trim($('#txtUssdServiceNumber').val());
                if(ussd_value == ''){
                    $("#dialParamError").text(jQuery.i18n.prop("lt_ussd_input_error"));
                    $("#dialParamError").show();
                    return;
                }
                var r = /^[\d]+$/;
                findValue = ussd_value;
                if(r.test(ussd_value)){
                    SendIndicationResponse(ussd_value);
                }else{
                    UssdDialUp(ussd_value);
                }

            });
            $("#txtUssdServiceNumber").mousedown(function(){
                $("#dialParamError").hide();
            });
            InitUssdStatus();
        }

        function InitUssdStatus() {
            var retXml = PostXml("ussd","get_ussd_ind");
            var ussdType = $(retXml).find("ussd_type").text();
            if("0" == ussdType ||  "1" == ussdType) {
                               var ussdStr = $(retXml).find("ussd_str").text().replace(/\s/ig,'0');
                var msg = UniDecode(ussdStr);
                appendResult(msg);
            }
        }
        function validRspParam(param) {
            var regex = /[0-9]{1}/;
            if (!regex.test(param))
                return false;
            else
                return true;
        }

        function SendIndicationResponse(param) {
            action = 3;
            var mapData = new Map();
            mapData.put("RGW/ussd/action", action);
            mapData.put("RGW/ussd/param", param);
            PostXml("ussd","send_ussd",mapData);
            ShowDlg("PleaseWait",200,130);
            $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
            $("#txtUssdServiceNumber").val("");
            timeoutCount = 0;
            setTimeout(QueryUssdNetworkStatus,6000);
        }

        function CanCelUssdService() {
            action = 2;

            var mapData = new Map();
            mapData.put("RGW/ussd/action",action);
            PostXml("ussd","send_ussd",mapData);


            $("#lt_ussd_btnDial").attr("disabled",false);
            $("#divUssdInteract").hide();
            //setTimeout(QueryUssdNetworkStatus,1000);
        }

        function validDialParam(param) {
            var regex = /^[*]{1}[0-9]{2,10}[#]{1}$/;
            if (!regex.test(param))
                return false;
            else
                return true;
        }
        function UssdDialUp(param) {
            action = 1;
            var mapData = new Map();
            mapData.put("RGW/ussd/action", action);
            mapData.put("RGW/ussd/param", param);
            PostXml("ussd","send_ussd",mapData);

            ShowDlg("PleaseWait",200,130);
            $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));

            $("#txtUssdServiceNumber").val("");
            timeoutCount = 0;
            setTimeout(QueryUssdNetworkStatus,6000);
        }

        function QueryUssdNetworkStatus() {
            var retXml = PostXml("ussd","get_ussd_ind");

            var ussdType = $(retXml).find("ussd_type").text();
            if(timeoutCount > 15) {
                CloseDlg();
                return;
            }

            if("" == ussdType) {
                ++timeoutCount;
                setTimeout(QueryUssdNetworkStatus,1000);
            } else if("0" == ussdType ||  "1" == ussdType) {
                CloseDlg();
                var ussdStr = $(retXml).find("ussd_str").text().replace(/\s/ig,'0');
                var msg = UniDecode(ussdStr);
                appendResult(msg);

            } else {
                CloseDlg();
                var msg;
                if("2" == ussdType) {
//                    showAlert("lt_ussd_error_type2");
                    msg = jQuery.i18n.prop("lt_ussd_error_type2");
                } else if("3" == ussdType) {
//                    showAlert("lt_ussd_error_type3");
                    msg = jQuery.i18n.prop("lt_ussd_error_type3");
                } else if("4" == ussdType) {
//                    showAlert("lt_ussd_error_type4");
                    msg = jQuery.i18n.prop("lt_ussd_error_type4");
                } else if("5" == ussdType) {
//                    showAlert("lt_ussd_error_type5");
                    msg = jQuery.i18n.prop("lt_ussd_error_type5");
                } else {
//                    showAlert("lt_ussd_unknow_error");
                    msg = jQuery.i18n.prop("lt_ussd_unknow_error");
                }
                appendResult(msg);
            }
        }

        function  appendResult(msg){
            var html = '<ul>'
                +'<li>'
                +'<span>'+jQuery.i18n.prop("Sent")+'</span>'
                +'<span>'+findValue+'</span>'
                +'</li>'
                +'<li>'
                +'<span>'+jQuery.i18n.prop("Received")+'</span>'
                +'<textarea readonly="readonly">'+msg+'</textarea>'
                +'</li>'
                +'</ul>';
            $('#return_information').append(html);
            $('textarea').each(function () {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            });
        }

        return this;
    }
})(jQuery);

