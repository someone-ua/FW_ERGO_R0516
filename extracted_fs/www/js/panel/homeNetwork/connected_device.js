var g_arrayTableData_connected_device = [];
(function ($) {
    $.fn.objConnectedDev = function (InIt) {
			g_arrayTableData_connected_device = [];
        var gconnectdevobjname = "statistics";
        var _lastSortValue='';
        var _arrayTableData=new Array(0);
        this.onLoad = function (flag) {
            _arrayTableData=new Array(0);
            var index=0;
            var name;
            var mac;
            var conn_type;
            var ip_address;
            var connected;
            if(flag)
                LoadWebPage("html/homeNetwork/connected_device.html");
								LocalAllElement();
            var retXml;
            if(flag){
            	retXml = PostXml(gconnectdevobjname, "get_conn_clients_info");
            }else{
            	retXml = PostXml(gconnectdevobjname, "get_conn_clients_info",null,"clearInterval");
            }

            $(retXml).find("one_client").each(function() {
                name = decodeURIComponent($(this).find("name").text());
                mac = $(this).find("mac").text();
                conn_type = $(this).find("type").text();
                ip_address = $(this).find("ip").text();
                conn_time =  $(this).find("cur_conn_time").text();
                _arrayTableData[index]=new Array(6);

                _arrayTableData[index][0]=index
                _arrayTableData[index][1]=name;
                _arrayTableData[index][2]=ip_address;
                _arrayTableData[index][3]=mac;
                _arrayTableData[index][4]=conn_type;
                _arrayTableData[index][5]=conn_time;
                index++;
            });
						g_arrayTableData_connected_device = _arrayTableData;
            this.loadTableData(_arrayTableData);
						this.loadTableData_phone(_arrayTableData);
						
        }
				this.loadTableData_phone = function(arrayTableData){
					var tableConnectedDevice=document.getElementById('tableConnectedDevice_phone');
					            var tBodytableConnectedDevice = tableConnectedDevice.getElementsByTagName('tbody')[0];
					            clearTabaleRows('tableConnectedDevice_phone');
					            if(arrayTableData.length==0) {
					                var row1 =  tBodytableConnectedDevice.insertRow(0);
					                var rowCol1 = row1.insertCell(0);
					                rowCol1.colSpan = 3;
					                rowCol1.innerHTML = jQuery.i18n.prop("tableNoData");
					            } else {
							for(var i=0; i<arrayTableData.length; i++) {
						    		var arrayTableDataRow=arrayTableData[i];
					                    var row =  tBodytableConnectedDevice.insertRow(i);
					                    var indexCol= row.insertCell(0);
					
					                    var nameCol = row.insertCell(1);
					                    var sortCol=row.insertCell(2);
					                   
					                    // var ipCol = row.insertCell(3);
					                    // var macCol = row.insertCell(4);
					                    var conn_typeCol = row.insertCell(3);
					                    // var conntimeCol=row.insertCell(6);
					                    indexCol.style.display='none';
					                    indexCol.innerHTML=arrayTableDataRow[0];
					                    var buttonId="button"+i;
					                    nameCol.innerHTML="<a href='#' onclick='showInfor(" + i + ")'>" + arrayTableDataRow[1] + "</a>";
					                    sortCol.innerHTML="<a><img src='images/status-icon3.png'   alt='' /></a><label style='display:none' value='"+ arrayTableDataRow[2]+"'/> ";
					                
					                    // if(arrayTableDataRow[2]!='')
					                        // ipCol.innerHTML=arrayTableDataRow[2];
					                    // else
// 					                        ipCol.innerHTML='--';
// 					                    macCol.innerHTML=arrayTableDataRow[3];
					                    conn_typeCol.innerHTML=arrayTableDataRow[4];
// 					                    var connTimeInfo = FormatSeconds(arrayTableDataRow[5]);
// 					                    conntimeCol.innerHTML = connTimeInfo;
					                }
					            }
					            Table.stripe(tableConnectedDevice,"alternate","table-stripeclass");
					            if (_lastSortValue) {
					                _lastSortValue = false;
					        Table.sort(tableConnectedDevice, {'desc':true,'re_sort':false,'col':3});
					            } else {
					            Table.sort(tableConnectedDevice, {'re_sort':true,'col':3});
					            }
				}
        this.loadTableData = function(arrayTableData) {

            var tableConnectedDevice=document.getElementById('tableConnectedDevice');
            var tBodytableConnectedDevice = tableConnectedDevice.getElementsByTagName('tbody')[0];
            clearTabaleRows('tableConnectedDevice');
            if(arrayTableData.length==0) {
                var row1 =  tBodytableConnectedDevice.insertRow(0);
                var rowCol1 = row1.insertCell(0);
                rowCol1.colSpan = 7;
                rowCol1.innerHTML = jQuery.i18n.prop("tableNoData");
            } else {
		for(var i=0; i<arrayTableData.length; i++) {
	    		var arrayTableDataRow=arrayTableData[i];
                    var row =  tBodytableConnectedDevice.insertRow(i);
                    var indexCol= row.insertCell(0);

                    var nameCol = row.insertCell(1);
                    var sortCol=row.insertCell(2);
                   
                    var ipCol = row.insertCell(3);
                    var macCol = row.insertCell(4);
                    var conn_typeCol = row.insertCell(5);
                    var conntimeCol=row.insertCell(6);
                    indexCol.style.display='none';
                    indexCol.innerHTML=arrayTableDataRow[0];
                    var buttonId="button"+i;
                    nameCol.innerHTML=arrayTableDataRow[1];
                    sortCol.innerHTML="<a><img src='images/status-icon3.png'   alt='' /></a><label style='display:none' value='"+ arrayTableDataRow[2]+"'/> ";
                
                    if(arrayTableDataRow[2]!='')
                        ipCol.innerHTML=arrayTableDataRow[2];
                    else
                        ipCol.innerHTML='--';
                    macCol.innerHTML=arrayTableDataRow[3];
                    conn_typeCol.innerHTML=arrayTableDataRow[4];
                    var connTimeInfo = FormatSeconds(arrayTableDataRow[5]);
                    conntimeCol.innerHTML = connTimeInfo;
                }
            }
            Table.stripe(tableConnectedDevice,"alternate","table-stripeclass");
            if (_lastSortValue) {
                _lastSortValue = false;
        Table.sort(tableConnectedDevice, {'desc':true,'re_sort':false,'col':3});
            } else {
            Table.sort(tableConnectedDevice, {'re_sort':true,'col':3});
            }
        }
      
        this.postItem = function(index,blockflag,mac) {
            var itemIndex=0;
            var conndevMap = new Map();
			var pbmethod;
			if(blockflag)
				pbmethod = "block_clients";
			else
				pbmethod = "unblock_clients";
			conndevMap.put("RGW/statistics/clients_mac", mac);
            var retXml = PostXml(gconnectdevobjname, pbmethod, conndevMap);
           
        }
        
        this.getTableData = function() {
            return _arrayTableData;
        }
        this.getName = function(index) {
            return _arrayTableData[index][1];
        }
        this.getBlocked = function(index) {
            return _arrayTableData[index][1];
        }
        return this.each(function () {
            _connectedDeviceIntervalID = setInterval( "g_objContent.onLoad(false)", _connectedDeviceInterval);
        });
    }
})(jQuery);
var connetedDeviceSelectedIndex=0;

function btnOkSelected() {
    _connectedDeviceIntervalID = setInterval( "g_objContent.onLoad()", _connectedDeviceInterval);

    var  index=connetedDeviceSelectedIndex;
    var strName=getID("tbModal").value;
    strName = encodeURIComponent(strName);
    if(strName!='') {
        if(deviceNameValidation(strName)) {
            g_objContent.postItem(index,g_objContent.getBlocked(index),true,strName);
            // hm('box');
        } else {
            getID("ErrInvalidName").style.display = "block";
            getID("ErrInvalidName").innerHTML = jQuery.i18n.prop("ErrInvalidName");
        }
    }
}
function btnCancelClicked() {
    _connectedDeviceIntervalID = setInterval( "g_objContent.onLoad()", _connectedDeviceInterval);
}

function btnRemoveSelected() {
    _connectedDeviceIntervalID = setInterval( "g_objContent.onLoad(false)", _connectedDeviceInterval);

    var  index=connetedDeviceSelectedIndex;
    //var strName=getID("tbModal").value;
    g_objContent.postItemRemoveDeviceEntry(index);
}

function blockUnblock(index,value) {
    g_objContent.postItem(index,value,false,null);
}


function showInfor(index){
	if(g_bodyWidth<430){
		ShowDlg("DeviceInfoDiv",'95%',340);
	}else{
		ShowDlg("DeviceInfoDiv",400,400);
	}
	var infor =  g_arrayTableData_connected_device[index];
// 	_arrayTableData[index][0]=index
// 	_arrayTableData[index][1]=name;
// 	_arrayTableData[index][2]=ip_address;
// 	_arrayTableData[index][3]=mac;
// 	_arrayTableData[index][4]=conn_type;
// 	_arrayTableData[index][5]=conn_time;
	$('#txtDeviceName').val(infor[1]);
	$('#deviceStatusSel').val(jQuery.i18n.prop("lt_connected"));
	$('#txtIpAddr').val(infor[2]==''?'--':infor[2]);
	$('#txtMac').val(infor[3]);
	$('#txtConnection').val(infor[4]);
	$('#txtTime').val(FormatSeconds(infor[5]));
	
}