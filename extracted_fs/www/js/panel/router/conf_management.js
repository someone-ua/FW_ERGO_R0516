(function($) {
    $.fn.objConfManage = function(InIt) {
        var afterRebootID;
        this.onLoad = function(flag) {
            if(flag) {
                LoadWebPage("html/router/conf_management.html");
                $("#lt_cnf_btnExportCfgFile").click(function() {
                    var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?Action=Download&file=backup_config&command=";
                    $.download(url, "", "POST");
                });
                $("#updateCfgFile").change(function() {
                    $("#lConfigFileError").hide();
                    $("#txtCfgFileName").val($(this).val());
                });

                $("#lt_cnf_btnUpdateCfgFile").click(function() {
                    UpdateCfgFile();
                });
            }
        }

        function UpdateCfgFile() {
            var strCfgFile = $("#txtCfgFileName").val();
            if("" == strCfgFile) {
                $("#lConfigFileError").show().text(jQuery.i18n.prop("lt_cnf_FileIsEmptyError"));
                return;
            }
            if (strCfgFile.indexOf(".bin") < 0 ) {
                $("#lConfigFileError").show().text(jQuery.i18n.prop("lt_cnf_FileFormatError"));
                return;
            }
            var url = window.location.protocol + "//" + window.location.host + "/xml_action.cgi?Action=Upload&file=restore_config&command=";
            document.getElementById("uploadConfgFileForm").action = url;
            document.getElementById("uploadConfgFileForm").target = "rfFrame";
            document.getElementById("uploadConfgFileForm").submit();
			
			ShowDlg("PleaseWait", 120, 100);
            setTimeout(function() {
                url += "query_status";
                var retXml = GetXML(url);
				
                if(retXml && 0 == $(retXml).find("restore_status").text()) {
                    ShowDlg("divRebootRouterDlg", 350, 150);
                    afterRebootID = setInterval(function() {
                        CloseDlg();
                        clearInterval(afterRebootID);
                        clearAuthheader();
                    }, 45000);
                } else {
                    showMsgBox(jQuery.i18n.prop("dialog_message_config_management_title"), jQuery.i18n.prop("lt_cnf_upgradedCfgFileFailed"));
                }
            },5000);
        }
        return this;
    }
})(jQuery);
