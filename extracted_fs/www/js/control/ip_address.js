(function ($) {
    $.fn.ip_address = function (oInit) {
        var divID = oInit;
      
        this.setIP = function (ip) {
            if(ip=='' || undefined == ip || "NaN" == ip){
              for(var i=0;i<4;i++)
                document.getElementById(divID+"IPAddr"+i).value = '';
            }else {
            var ary = ip.split(".");
            for(i=0;i<4;i++)
                document.getElementById(divID+"IPAddr"+i).value = ary[i];
            }
        };
       
        this.getIP = function () {
            var ip="";
            for(var i=0;i<3;i++)
                ip+=document.getElementById(divID+"IPAddr"+i).value+".";
            ip+=document.getElementById(divID+"IPAddr3").value;
            return ip;
        };
        this.validIPV4 = function () {
            return IsIPv4(this.getIP());
        };

	    this.validIPV6 = function () {
            return IsIPv6(this.getIP());
        };
        this.disableIP = function (var0,var1,var2,var3) {
 
            document.getElementById(divID+"IPAddr0").readOnly = var0;
            document.getElementById(divID+"IPAddr1").readOnly = var1;
            document.getElementById(divID+"IPAddr2").readOnly = var2;
            document.getElementById(divID+"IPAddr3").readOnly = var3;
            document.getElementById(divID+"IPAddr0").disabled = var0;
            document.getElementById(divID+"IPAddr1").disabled = var1;
            document.getElementById(divID+"IPAddr2").disabled = var2;
            document.getElementById(divID+"IPAddr3").disabled = var3;
        };

        this.getDivID = function () {
            return divID;
        };
        this.clearHTML = function () {
            this.innerHTML = "";
        };
        this.formatIP = function (ip){
            var ary = ip.split(".");
            document.getElementById(divID+"IPAddr0").value =  ary[0];
            document.getElementById(divID+"IPAddr2").value =  ary[1];
            this.formatIP2();
        };
        this.formatIP2 = function () {
            document.getElementById(divID+"IPAddr2").value = document.getElementById("IPAddr3").value;
        };

		return this.each(function () {
            var id1=divID+"IPAddr0";
            var id2=divID+"IPAddr1";
            var id3=divID+"IPAddr2";
            var id4=divID+"IPAddr3";

            var HTML ="<input type='text' id="+ id1+ "  maxlength='3' class='sml' onkeyup='setFocusIP(\""+id1+"\")'> </input><strong class='strong'>&middot;</strong>";
                HTML+="<input type='text' id="+ id2 +"  maxlength='3' class='sml' onkeyup='setFocusIP(\""+id2+"\")'> </input><strong class='strong'>&middot;</strong>";
                HTML+="<input type='text' id="+ id3 +"  maxlength='3' class='sml' onkeyup='setFocusIP(\""+id3+"\")'> </input><strong class='strong'>&middot;</strong>";
                HTML+="<input type='text' id="+ id4 +"  maxlength='3' class='sml' onkeyup='clearSpace(\""+id4+"\")'>";
            this.innerHTML += HTML;
        });
    }
})(jQuery);
function setFocusIP(controlID){
    var dom = document.getElementById(controlID);
    var str=dom.value;
    str = str.replace(/(^\s*)|(\s*$)/g, "");
	var skip = false;
	if( str.indexOf('.')>-1){
		skip = true;
		str = str.substring(0,str.length-1);
	}
    dom.value = str;
	
    if(str.length==3||skip){
        var c = controlID.toString().charAt(controlID.length-1);
        c++;
        controlID = controlID.substring(0, controlID.length-1);
        controlID=controlID+c;
        document.getElementById(controlID.toString()).focus();
    }
}
function clearSpace(controlID){
    var dom = document.getElementById(controlID);
    var str=dom.value;
    str = str.replace(/(^\s*)|(\s*$)|(\.*$)|(^\.*)/g, "");
    dom.value = str;
}