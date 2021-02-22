(function($) {
    $.fn.objManualNetwork = function(InIt) {
        var gLteBgScanTime;
        var needSave = false;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/internet/manual_network.html");
            }

            $("#lt_ManualNet_btnSearchNetwork").click(function () {
                if(!IsSimPresent()) {
                	showMsgBox(jQuery.i18n.prop("dialog_message_manual_network_title"), jQuery.i18n.prop("lsmsSimCardAbsent"));
                    return;
                }
                var retXml = PostXml("sim", "get_sim_status");
                pinstatus = $(retXml).find("pin_status").text(); //<!--0: unkown  1: detected 2: need pin 3: need puk 5: ready-->
          	  	if(pinstatus ==2){
          	  		showMsgBox(jQuery.i18n.prop("dialog_message_manual_network_title"),jQuery.i18n.prop("lPinEnable"));
          	  		return;
          	  	}
                SearchNetWork();
            });
            if (manual_network_bgscan_time == 0) {
            	$("#BgScanNetwork").hide();
            } else {
            	$("#BgScanNetwork").show();
            	GetLteBgScanTime();
            }
            
            $("#BgScanTimedropdown").change(function(){
            	needSave = true;
            });
            $("#SelRearchNetworkList").change(function(){
            	needSave = true;
            });
            addAutoOption();
        }

        function addAutoOption() {
            var opt_auto = document.createElement("option");
            document.getElementById("SelRearchNetworkList").options.add(opt_auto);
            opt_auto.id = 'dropdownAuto';
            opt_auto.text = jQuery.i18n.prop("lt_ManualNet_auto");
            opt_auto.value = '30';
        }
        
        function GetLteBgScanTime() {
        	if (manual_network_bgscan_time == 0) {
        		return;
        	}
            var retXml = PostXml("util_wan","get_bgscan_time");
            gLteBgScanTime = $(retXml).find("bgscan_time").text();
            $("#BgScanTimedropdown").val(gLteBgScanTime);
        }

        function SetLteBgScanTime() {
        	if (manual_network_bgscan_time == 0) {
        		return;
        	}
            if(gLteBgScanTime == $("#BgScanTimedropdown").val()) {
                return;
            }

            var configMap = new Map();
            configMap.put("RGW/wan/bgscan_time",$("#BgScanTimedropdown").val());

            PostXml("util_wan","set_bgscan_time",configMap);

        }

        function IsSimPresent() {
            var retXml = PostXml("sim","get_sim_status");
            if(1 == $(retXml).find("sim_status").text()) {
                return true;
            }
            return false;
        }


        function SearchNetWork() {
            ShowDlg("ManualScanConfigure", 300, 150);
            $("#lt_ManualNet_btnConfirm").click(function () {
                CloseDlg();
                ShowDlg("PleaseWait", 200, 130);
                $("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
                PostXmlAsync("util_wan", "search_network", null, function(xmlDoc) {
                	if("ERROR" == $(xmlDoc).find("setting_response").text()){
        				showMsgBox(jQuery.i18n.prop("dialog_message_manual_network_title"), jQuery.i18n.prop("dialog_message_manual_network_search_fail"));
        				return;
        			}
        			$("#SelRearchNetworkList").empty();
                    $(xmlDoc).find("network_list").each(function() {
                        $(this).find("Item").each(function() {
                            var network_plmn = $(this).find("plmn").text();
                            var network_name = $(this).find("isp_name").text();
                            var network_act = $(this).find("act").text();

                            var optText = network_name + ' ' + network_act;
                            var optValue = network_act + '%' + network_plmn;
                            var opt = document.createElement("option");
                            document.getElementById("SelRearchNetworkList").options.add(opt);
                            opt.text = optText;
                            opt.value = optValue;
                        });
                    });
        			addAutoOption();
        			needSave = true;
        			CloseDlg();
                    showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_manual_network_title"), jQuery.i18n.prop("dialog_message_manual_network_search_success"));
                });
            });
        }
        
        this.SaveData = function() {
            SetLteBgScanTime();

			if(null == $("#SelRearchNetworkList").val() || "" == $("#SelRearchNetworkList").val() || needSave == false){
				return;
			}
            var configMap = new Map();
            configMap.put("RGW/wan/network_param",$("#SelRearchNetworkList").val());
            var retXml = PostXml("util_wan","select_network",configMap);

            if("ERROR" == $(retXml).find("setting_response").text()) {
            	showMsgBox(jQuery.i18n.prop("dialog_message_manual_network_title"), jQuery.i18n.prop("dialog_message_manual_network_save_network_mode_failed"));
            } else {
            	showMsgBoxAutoClose(jQuery.i18n.prop("dialog_message_manual_network_title"), jQuery.i18n.prop("dialog_message_manual_network_save_network_mode_success"));
            }
            needSave = false;
        }
        
        return this;
    }
})(jQuery);
