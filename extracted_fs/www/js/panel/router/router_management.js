(function ($) {
    $.fn.objRouterManage = function (InIt) {
        var afterRebootID;
		 var saveData = {};
        this.onLoad = function () {
            LoadWebPage("html/router/router_management.html");
            displayConfigViews();

            $("#lt_rm_btnPowerOff").click(function() {
                PowerOffRouter();
            });

            $("#lt_rm_btnResetFactory").click(function() {
                ResetRouter();
            });

			$("#lt_rm_btnReboot").click(function() {
                RebootRouter();
            });
			var connNumSize = "";
			for(var i=0;i<24;i++){
				if(i<10){
					connNumSize += "<option id='lt_scheduled_reboot_"+i+"' value='"+i+"'>0"+i+":00</option>"
				}else if(i<20){
					connNumSize += "<option id='lt_scheduled_reboot_"+i+"' value='"+i+"'>"+i+":00</option>"
				}else{
					connNumSize += "<option id='lt_scheduled_reboot_"+i+"' value='"+i+"'>"+i+":00</option>"
				}
			}
			$("#scheduled_reboot_time").append(connNumSize);
			getAutoRebootData();
        }
		
		  this.SaveData = function(){
			var enable = $("#scheduled_reboot_switch").val();
			if((enable == saveData.autoRebootStatus && enable ==0) || ($("#scheduled_reboot_time").val() == saveData.autoRebootTime &&(enable == saveData.autoRebootStatus && enable ==1))){
				return false;
			}
			
			if(saveAutoRebootData()){
				getAutoRebootData();
				showMsgBox(jQuery.i18n.prop("lt_rm_title"), jQuery.i18n.prop("lt_set_succ"));
			}else{
				showMsgBox(jQuery.i18n.prop("lt_rm_title"), jQuery.i18n.prop("lt_set_fail"));
			}
		}
		
		  function getAutoRebootData(){
			 saveData={};
			 var retXml = PostXml("router","router_call_get_timer_reboot");
			 var enable = $(retXml).find("enable").text();
			 var time = $(retXml).find("hour").text();
			 saveData.autoRebootStatus = enable;
			 saveData.autoRebootTime = time;
			 $("#scheduled_reboot_switch").val(enable);
			 $("#scheduled_reboot_time").val(time);
			 if(enable == "1"){
				 $("#schedule_reboot_time").show();
			 }else{
				 $("#schedule_reboot_time").hide();
			 }
			 $("#scheduled_reboot_switch").change(function(){
				 if($(this).val() == "1"){
					 $("#schedule_reboot_time").show();
		    	 }else{
		    		 $("#schedule_reboot_time").hide();
		    	 }
			 })
			
		}
		
		  function saveAutoRebootData(){
			var autoRebootMap = new Map();
			var enable = $("#scheduled_reboot_switch").val();
			autoRebootMap.put("RGW/router/enable",enable);
			if(enable == "1"){
				autoRebootMap.put("RGW/router/hour",$("#scheduled_reboot_time").val());
			}
			var xml = PostXml("router","router_call_set_timer_reboot",autoRebootMap);
			return $(xml).find("setting_response").text()=="OK"?true:false;
		}

        function displayConfigViews () {
        	if (router_management_poweroff == 0) {
        		 $("#divpowerOff").hide();
        	} else {
        		 $("#divpowerOff").show();
        	}
        }
        
		function PowerOffRouter(){
			 ShowDlg('MBRouterManageDlg',400,100);
            $("#lQueryRouterInfo").text(jQuery.i18n.prop("lt_rm_QeuryPoweroff"));

            $("#lt_btnOK").click(function() { 
                ShowDlg("PleaseWait", 300, 150);
                setTimeout(function(){
                	PostXml("router","router_poweroff");            
                },100);
            });
		}

        function RebootRouter() {
            ShowDlg('MBRouterManageDlg',400,100);
            $("#lQueryRouterInfo").text(jQuery.i18n.prop("lt_rm_QueryRebootedRouter"));

            $("#lt_btnOK").click(function() {
                ShowDlg("PleaseWait", 300, 150);
				$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_reboot"));
                setTimeout(function(){
                	PostXml("router","router_call_reboot");
                	afterRebootID =  setInterval(function(){CloseDlg();clearAuthheader();}, 45000);
                },100);
            });
        }

        function ResetRouter() {
            ShowDlg('MBRouterManageDlg',400,100);
            $("#lQueryRouterInfo").text(jQuery.i18n.prop("lt_rm_QueryResetRouter"));

            $("#lt_btnOK").click(function() {
                ShowDlg("PleaseWait", 300, 150);
				$("#lPleaseWait").text(jQuery.i18n.prop("lt_succ_restore"));
                setTimeout(function(){
					var retXml = PostXml("router","router_get_default_lan_ip");
					var default_ip = $(retXml).find('default_lan_ip').text();
                	PostXml("router","router_call_rst_factory");
                	afterRebootID = setInterval(function(){
						CloseDlg();clearInterval(afterRebootID);clearCookies();clearAuthheader(default_ip);
					}, 45000);
                },100);
            });
        }
        return this;
    }
})(jQuery);

