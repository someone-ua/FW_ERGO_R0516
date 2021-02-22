(function ($) {
    $.fn.mac_address = function (oInit) {
        var divID = oInit;

        this.setMacAddr = function (macAddr) {
            if(macAddr=='' || undefined == macAddr || "NaN" == macAddr) {
                for(var i=0; i<6; i++)
                    document.getElementById(divID+"MacAddr"+i).value = '';
            } else {
                var ary = macAddr.split(":");
                for(i=0; i<6; i++)
                    document.getElementById(divID+"MacAddr"+i).value = ary[i];
            }
        }

        this.getMacAddr = function () {
            var macAddr="";
            for(var i=0; i<5; i++)
                macAddr += document.getElementById(divID+"MacAddr"+i).value+":";
            macAddr += document.getElementById(divID+"MacAddr5").value;
            return macAddr;
        }


        this.validMacAddr = function () {
            return IsMACAddr(this.getMacAddr());
        }

        this.getDivID = function () {
            return divID;
        }
        this.clearHTML = function () {
            this.innerHTML = "";
        }




        return this.each(function () {
            var id1=divID+"MacAddr0";
            var id2=divID+"MacAddr1";
            var id3=divID+"MacAddr2";
            var id4=divID+"MacAddr3";
            var id5=divID+"MacAddr4";
            var id6=divID+"MacAddr5";


            var HTML = "<input type='text' id="+ id1+ "  maxlength='2' class='sml' onkeyup='setFocusMac(\""+id1+"\")'> </input><strong>:</strong>"
                       + "<input type='text' id="+ id2 +"  maxlength='2' class='sml' onkeyup='setFocusMac(\""+id2+"\")'> </input><strong>:</strong>"
                       + "<input type='text' id="+ id3 +"  maxlength='2' class='sml' onkeyup='setFocusMac(\""+id3+"\")'> </input><strong>:</strong>"
                       + "<input type='text' id="+ id4 +"  maxlength='2' class='sml' onkeyup='setFocusMac(\""+id4+"\")'> </input><strong>:</strong>"
                       + "<input type='text' id="+ id5 +"  maxlength='2' class='sml' onkeyup='setFocusMac(\""+id5+"\")'> </input><strong>:</strong>"
                       + "<input type='text' id="+ id6 +"  maxlength='2' class='sml'>";
            this.innerHTML += HTML;
        });
    }
})(jQuery);


function setFocusMac(controlID) {
    var str=document.getElementById(controlID).value;
    if(str.length==2) {
        var c = controlID.toString().charAt(controlID.length-1);
        c++;
        controlID = controlID.substring(0, controlID.length-1);
        controlID=controlID+c;
        document.getElementById(controlID.toString()).focus();
    }
}