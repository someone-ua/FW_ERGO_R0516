(function ($) {

    $.fn.objPinPuk = function (InIt) {

        var gpinpukubusobjname = "sim";
		var glastpinattempts;
		var glastpukattempts;
		var pinattempts;
		var pinstatus ;
		var simstatus ;
		var pukattempts;
	    var pinenabled;
        this.onLoad = function (operateType,isDisOrEnablePIN) {
          LoadWebPage("html/internet/pin_puk.html");
          Refresh();
//		  var pinpukMap = new Map();//no params,but will lead to loading
          var retXml = PostXml(gpinpukubusobjname, "get_sim_status");
			   
          if( $(retXml).find("setting_response").text()=="OK"){
        	  pnStatus = $(retXml).find("pn_status").text();
        	  pinstatus = $(retXml).find("pin_status").text(); //<!--0: unkown  1: detected 2: need pin 3: need puk 5: ready-->
        	  if(pinstatus ==4){
        		  if($(retXml).find("perso_substate").text() == "3"||$(retXml).find("perso_substate").text()=="8"){
        			  if(g_bodyWidth<=360){
									ShowDlg("confirmDlg",300,150);
								}else{
									ShowDlg("confirmDlg",350,150);
								}
        			  $("#lt_btnConfirmNo").hide();
        			  if(operateType == "provide_pin"){
        				  $("#lt_confirmDlg_msg").text(jQuery.i18n.prop("lRightPin_PlsUnlockPn"));
        			  }else{
        				  showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("lPlsUnlockPNFirst"));
        			  }
        			  if($("#mMEPSetting") && $("#mMEPSetting")!=undefined &&$("#mMEPSetting").length!=0){
        				  $("#lt_btnConfirmYes").click(function() {
        					  displayForm("mMEPSetting");
        					  CloseDlg();
        				  });
        			  }else{
        				  $("#lt_btnConfirmYes").click(function() {
        					  CloseDlg();
        				  });
        			  }
        			  return;
        		  }
        	  }
         	  pinattempts = $(retXml).find("pin_attempts").text();
			  simstatus = $(retXml).find("sim_status").text(); //0: sim absent 1:sim present  2: sim error 3: unknown error
              pukattempts = $(retXml).find("puk_attempts").text(); 
              pinenabled = $(retXml).find("pin_enabled").text();
			  glastpinattempts = pinattempts;
			  glastpukattempts = pukattempts;
           
          	}else{
			        showMsgBox(jQuery.i18n.prop("lFailedWithUnkown"),jQuery.i18n.prop("lPINResponseError"));
          	}
         
            document.getElementById("vPinAttmepts").innerHTML = jQuery.i18n.prop("lt_pinAttempts")+" : "+pinattempts;
            document.getElementById("vPukAttmepts").innerHTML = jQuery.i18n.prop("lt_pukAttempts")+" : "+pukattempts;

            if(simstatus != "1") {
                showAlert("lUnknownNoSIM");
            }
			
			
			if(pinattempts == "0" && pukattempts == "0") {
                showAlert("lPukExhausted");
            } 
			

			if(pinstatus == "3" && pukattempts != "0") {
                showAlert("lPinExhausted");
                document.getElementById("PinPukAttempts").style.display="block";
                document.getElementById("ResetPinUsingPuk").style.display="block";
                document.getElementById("btUpdate0").value = jQuery.i18n.prop("lt_btUpdate");
            }

			
            if(pinstatus == "2"&&pinattempts!="0") {
                    document.getElementById("PinPukAttempts").style.display="block";
                    document.getElementById("ProvidePin").style.display="block";
                   
                    document.getElementById("btUpdate").value = jQuery.i18n.prop("lt_btUpdate");
            }

			
			if(pinstatus == "5") {
                document.getElementById("PinPukAttempts").style.display="block";
                document.getElementById("EnableDisablePin").style.display="block";
                if(pinenabled == "0") {
                    document.getElementById("lt_EnableDisablePin").innerHTML=jQuery.i18n.prop("lt_EnablePin");
                    document.getElementById("btUpdate1").value = jQuery.i18n.prop("lt_EnablePin");
                } else {
                    document.getElementById("lt_EnableDisablePin").innerHTML=jQuery.i18n.prop("lt_DisablePin");
                    document.getElementById("btUpdate1").value = jQuery.i18n.prop("lt_DisablePin");
                    document.getElementById("btUpdate2").value = jQuery.i18n.prop("btUpdate2");
                    document.getElementById("ChangePin").style.display="block";
                    
                }
            }
			if(operateType == "provide_pin"){
				if(pinattempts=="3"){
					showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("rightPin")+":"+pinattempts);
				}else{
					showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("wrondPin")+":"+pinattempts);
				}
			}else if(operateType == "resetPnPuk"){
				if(pinattempts=="3" && pukattempts=="10"){
					showMsgBoxAutoClose(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("pinPukResetSuccess")+":"+pinattempts+","+jQuery.i18n.prop("pukRemainingAttemps")+":"+pukattempts);
				}else{
					showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("wrongPuk")+":"+pukattempts);
				}
			}else if(operateType == "disOrEnablePIN" && isDisOrEnablePIN=="0"){
				if(pinattempts=="3"){
					showMsgBoxAutoClose(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("enableSuccess")+":"+pinattempts);
				}else{
					showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("wrondPin")+":"+pinattempts);
				}
			}else if(operateType == "disOrEnablePIN" && isDisOrEnablePIN=="1"){
				if(pinattempts=="3"){
					showMsgBoxAutoClose(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("disableSuccess")+":"+pinattempts);
				}else{
					showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("wrondPin")+":"+pinattempts);
				}
			}else if(operateType == "change_pin"){
				if(pinattempts=="3"){
					showMsgBoxAutoClose(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("lPINChangeSuccess")+":"+pinattempts);
				}else{
					showMsgBox(jQuery.i18n.prop("operatePIN"),jQuery.i18n.prop("lPINChangeFailed")+":"+pinattempts);
				}
			}
            LocalAllElement();

        }

		function Refresh(){
			  document.getElementById("ResetPinUsingPuk").style.display="none";
              document.getElementById("ProvidePin").style.display="none";
			  document.getElementById("PinPukAttempts").style.display="none";
              document.getElementById("EnableDisablePin").style.display="none";
			  document.getElementById("ChangePin").style.display="none";
		}
			
        
        this._ProvidePin = function() {
            

            var pin = document.getElementById('txtPin').value;
            if(! validate_pin(pin)) {
                document.getElementById('lAlertError').innerHTML= jQuery.i18n.prop("linvalidPin");
                return;
            }

			var pinpukMap = new Map();
			pinpukMap.put("RGW/sim/pin_puk/pin", pin);
			            
            var retXml = PostXml(gpinpukubusobjname, "provide_pin", pinpukMap);
            if( $(retXml).find("setting_response").text()=="ERROR"){
				 			 
                 if(glastpinattempts>$(retXml).find("pin_attempts").text()){
				 		showMsgBox(jQuery.i18n.prop("lPINResponseError"),jQuery.i18n.prop("lIncorrectPin"));
                 	}
				 else{
				 		showMsgBox(jQuery.i18n.prop("lFailedWithUnkown"),jQuery.i18n.prop("lPINResponseError"));
				 	}
           
          	}else{
          			g_objContent.onLoad("provide_pin");
          		}
            
        }

        this._resetPinUsingPuk = function() {
          

            var puk = document.getElementById('txtPuk0').value;
            var new_pin = document.getElementById('txtNewPin0').value;
           
            if(! validate_puk(puk)) {
                document.getElementById('lAlertError0').innerHTML= jQuery.i18n.prop("linvalidPuk");
                return;
            }

            if(! validate_pin(new_pin)) {
                document.getElementById('lAlertError0').innerHTML= jQuery.i18n.prop("linvalidPin");
                return;
            }
            var pinpukMap = new Map();
			pinpukMap.put("RGW/sim/pin_puk/puk", puk);
			pinpukMap.put("RGW/sim/pin_puk/new_pin", new_pin);
			
			var retXml = PostXml(gpinpukubusobjname, "reset_pin_using_puk", pinpukMap);
            if( $(retXml).find("setting_response").text()=="ERROR"){

				  if(glastpukattempts>$(retXml).find("puk_attempts").text()){
				  	 	document.getElementById('lAlertError0').innerHTML= jQuery.i18n.prop("lIncorrectPuk");
                    	 return;
                 	}
				 else{
				 		showMsgBox(jQuery.i18n.prop("lFailedWithUnkown"),jQuery.i18n.prop("lPINResponseError"));
				 	}
           
           
            }else{
			
          			g_objContent.onLoad("resetPnPuk");
          		}
        }

        this._EnableDisablePin = function() {
            var pinpukMap = new Map();
			var usbubusmethod;
            var pin = document.getElementById('txtPin1').value;
           
            if(! validate_pin(pin)) {
                document.getElementById('lAlertError1').innerHTML= jQuery.i18n.prop("linvalidPin");
                return;
            }

		    pinpukMap.put("RGW/sim/pin_puk/pin", pin);
			
            if("1"==pinenabled){
				
				usbubusmethod = "disable_pin";
            }
			else{
				
				usbubusmethod = "enable_pin";
			}
				
              
			var retXml = PostXml(gpinpukubusobjname, usbubusmethod, pinpukMap);
            if( $(retXml).find("setting_response").text()=="ERROR"){

                 if(glastpinattempts>$(retXml).find("pin_attempts").text()){
				  	 	document.getElementById('lAlertError1').innerHTML= jQuery.i18n.prop("lIncorrectPin");
                    	 return;
                 	}
				 else{
				 		 showMsgBox(jQuery.i18n.prop("lPINResponseError"),jQuery.i18n.prop("lFailedWithUnkown"));
				 	}

           
          	}else{
			
          			g_objContent.onLoad("disOrEnablePIN",pinenabled);
          		}

        }

        this._ChangePin = function() {
            
            var pin = document.getElementById('txtPin2').value;
            var new_pin = document.getElementById('txtNewPin2').value;

            //added by notion ggj 20140310 for PIN double input begin         	
    	     if(new_pin !=document.getElementById('txtNewPin3').value) {
                document.getElementById('lAlertError2').innerHTML= jQuery.i18n.prop("linvalidNewPin");
		  return;		
    	     } 
	     //added by notion ggj 20140310 for PIN double input end   		 

            if(! validate_pin(pin)) {
                document.getElementById('lAlertError2').innerHTML= jQuery.i18n.prop("linvalidPin");
                return;
            }

            if(! validate_pin(new_pin)) {
                document.getElementById('lAlertError2').innerHTML= jQuery.i18n.prop("linvalidPin");
                return;
            }

            if(pin == new_pin) {
                document.getElementById('lAlertError2').innerHTML= jQuery.i18n.prop("lNewPinSameWithOld");
                return;
            }

			var pinpukMap = new Map();
			pinpukMap.put("RGW/sim/pin_puk/pin", pin);
			pinpukMap.put("RGW/sim/pin_puk/new_pin", new_pin);
			
			var retXml = PostXml(gpinpukubusobjname, "change_pin", pinpukMap);
            if( $(retXml).find("setting_response").text()=="ERROR"){

				  if(glastpinattempts>$(retXml).find("pin_attempts").text()){
				  	 	document.getElementById('lAlertError2').innerHTML= jQuery.i18n.prop("lIncorrectPin");
                    	 return;
                 	}
				 else{
				 		 showMsgBox(jQuery.i18n.prop("lPINResponseError"),jQuery.i18n.prop("lFailedWithUnkown"));
				 	}
           
          	}else{
			
          			g_objContent.onLoad("change_pin");
          		}
           
        }
        return this.each(function () {
        });
    }
})(jQuery);

function ProvidePin() {
    g_objContent._ProvidePin();
}
function resetPinUsingPuk() {
    g_objContent._resetPinUsingPuk();
}

function EnableDisablePin() {
    g_objContent._EnableDisablePin();
}

function ChangePin() {
    g_objContent._ChangePin();
}



function clearAlertError()
{
    $("#lAlertError").text("");
}
function clearAlertError0()
{
    $("#lAlertError0").text("");
}

function clearAlertError1()
{
    $("#lAlertError1").text("");
}

function clearAlertError2()
{
    $("#lAlertError2").text("");
}
