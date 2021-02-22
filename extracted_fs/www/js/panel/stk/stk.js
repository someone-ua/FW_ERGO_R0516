(function ($) {
    $.fn.objStk = function (InIt) {
        var gstkobjname = "stk";
        this.onLoad = function () {
          $("#mainColumn").html(CallHtmlFile("html/stk.html"));
			//var stkindications= "D081B4010301250002028182050B80795E5DDE884C592957300F0A01808F7B677E95EE50190F0A028077ED4FE17FA453D10F0E058000530049004D84254E1A53850F0A068059296C1467E58BE20F080780624B673A62A50F0608805F6994C30F10098065E07EBF97F34E504FF14E5090E80F140A80003100320035003800304FE1606F67E58BE20F0A0B805B9E75284FE1606F0F080C80519C4FE1901A0F080D8068218BAF901A0F0E048000530049004D53614FE1606F"
            var stkindications= "D05E010302250002028182050F80005500530049004D53615E9475280F081180624B673A62A50F0C3180624B673A84254E1A53850F06328070AB94C30F0A338065B095FB5A314E500F0A5180638C4E0A80A15E020F0A52805FBD547365E07A77";
			ParseResponseString(stkindications);
            LocalAllElement();
		    $("tr").click(function () {
                var menuselectionType = "D3";
				var itemid = $(this).attr("name");
				SendEnvelopCmd(menuselectionType,itemid,"");
            });
        }
        function enableSTK(){
			  var stkResponseMap = new Map();
			  var retXml = PostXml(gstkobjname, "enable_stk_service", stkResponseMap);
			  if ("OK" != $(retXml).find("setting_response").text()) {
                                          
					alert("enableSTK error");
					return false;
              }
              return true;  
	  	}

	   function ParseResponseString(responsedata){
		var DataResponse = String(responsedata);
		var commandType;
		if(DataResponse.length>1){
         var offset =0;
         var header = DataResponse.substr(offset,2);
		 var commanddetails;
		 var DeviceIdentifier;
		 offset+=2;
		 var datalength;
		 if(header=="D0"){
		 	var lengthheader = DataResponse.substr(offset,2);
			 offset+=2;
		 	if(lengthheader=="81" ){ //length is 1 or 2
				 datalength = DataResponse.substr(offset,2);
				 offset+=2;
				 datalength= parseInt(datalength,16);
				 if(datalength<128)
				 	return false;
		 		}
			else{	
				 datalength= lengthheader;
				 if(parseInt(datalength,16)>127)
				 	return false;
				}
             commanddetails = DataResponse.substr(offset,10);
			 offset+=10;
			 commandType = commanddetails.substr(6,2);
			 DeviceIdentifier = DataResponse.substr(offset,8);
			 offset+=8;
			 switch(commandType) {
                case "10"://SET UP CALL
				break;
				case "13"://SEND SHORT MESSAGE
				break;
				case "21": //DISPLAY TEXT
				break;
				case "23"://GET INPUT
				break;
				case "24"://SELECT ITEM
				break;
				case "25"://SETUP MENU
				     var setupmenudata = DataResponse.substr(offset,DataResponse.length-offset);
				     SetUpMenu(setupmenudata);
				break;
			 	}
		 	}
		}
	  	}
	  function SendTerminalResponse(commandType){
              //TerminalResponseResult,TerminalResponseAddResult,DataCodeSceme,responseString
			  var stkResponseMap = new Map();
			   switch(commandType) {
                case "10"://SET UP CALL
				break;
				case "13"://SEND SHORT MESSAGE
				break;
				case "21": //DISPLAY TEXT
				break;
				case "23"://GET INPUT
				break;
				case "24"://SELECT ITEM
				break;
				case "25"://SETUP MENU
				     stkResponseMap.put("RGW/stk/commandType", commandType);
                     stkResponseMap.put("RGW/stk/TerminalResponseResult", "00");
				break;
			 	}
			 
			  var retXml = PostXml(gstkobjname, "send_stk_terminal_response", stkResponseMap);
			  if ("OK" != $(retXml).find("setting_response").text()) {
					alert("Terminal response error");
					return false;
              }
              return true;  
	  	}
	   function SendEnvelopCmd(envelopCmd,envelopData1,envelopData2){
			  var stkResponseMap = new Map();
			   stkResponseMap.put("RGW/stk/envelopType", envelopCmd);
               stkResponseMap.put("RGW/stk/envelopData1", envelopData1);
			   stkResponseMap.put("RGW/stk/envelopData2", envelopData2);
			  var retXml = PostXml(gstkobjname, "send_stk_terminal_response", stkResponseMap);
			  if ("OK" != $(retXml).find("setting_response").text()) {
					alert("SendEnvelopCmd error");
					return false;
              }
              return true;  
	  	}
	   function DisplayText(Data){
	   	var TextDatastring = String(Data);
			var textflag;
			var offset =0;
			var textflag = TextDatastring.substr(offset,2);
			 offset+=2;
			if(alphaflag!="0D"&&alphaflag!="8D")
				return false;
			var textlength = TextDatastring.substr(offset,2);
				offset+=2;
			var textdisplay = TextDatastring.substr(offset,textlength);
				offset+= parseInt(textlength,16);
			while(offset<TextDatastring.length){
            	var IconFlag = TextDatastring.substr(offset,2);
				offset+=2;
				if(IconFlag!="1E"&&MenuItemflag!="9E")
					return false;
				var IconItemlength = TextDatastring.substr(offset,2);
				offset+=2;
				var IconQualifier  = TextDatastring.substr(offset,2);
				offset+=2;
				var Iconid  = TextDatastring.substr(offset,2);
			}
	   }

	   function SetUpMenu(Data){
	   		var MenuDatastring = String(Data);
			var alphaflag;
			var offset =0;
			var alphaflag = MenuDatastring.substr(offset,2);
			 offset+=2;
			if(alphaflag!="05"&&alphaflag!="85")
				return false;
			var alphaflaglength = MenuDatastring.substr(offset,2);
				offset+=2;
			alphaflaglength = parseInt(alphaflaglength,16);
				offset+= (alphaflaglength*2);
			var html="";
			while(offset<MenuDatastring.length){

            	var MenuItemflag = MenuDatastring.substr(offset,2);
				offset+=2;
				if(MenuItemflag!="0F"&&MenuItemflag!="8F")
					return false;
				var MenuItemlength = parseInt(MenuDatastring.substr(offset,2),16);
				offset+=2;
				var ItemRemainLength  = MenuItemlength*2;
				var i=0;
				var Itemid;
				var terminalRestring;
				if(MenuItemlength>0){
					Itemid = MenuDatastring.substr(offset,2);
					offset+=2;
					ItemRemainLength-=2;
					var itemcodeflag = MenuDatastring.substr(offset,2);
					offset+=2;
					ItemRemainLength-=2;
					var itemstring;
					if(itemcodeflag=="80")
						itemstring = UniDecode(MenuDatastring.substr(offset,ItemRemainLength));
					offset+=ItemRemainLength;
				}
                 html+= "<tr style='cursor: pointer;'name='" + Itemid + "'><td>" + itemstring + "</td></tr>"
				i++;
			}
			$("#stkmenulist").append(html);
	   }
	   function SetUpCall(Data){
	   }
	   
	   function GetInput(Data){
	   }

	   function SendShortMessage(Data){
	   }
       return this;
    }
})(jQuery);	

	  