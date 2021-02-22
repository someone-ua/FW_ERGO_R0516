var g_menues = new Object();
var g_objContent = null;
var g_navtabNum = 0;
var g_objXML = $().XML_Operations();
var _dashboardInterval = 10000;
var _dashboradtrafficStaticInterval = 1000;
var _connectedDeviceInterval = 60000;
var _trafficstatisticsInterval = 60000;
var _networkActivityInterval = 60000;
var _loginOperationInterval = 30000;
var _storageSettingsInterval = 30000;
var _WiFiInterval = 25000;
var _trafficStatisticInterval = 5000;
var _dashboradsignalRefreshInterval = 5000;

var _dashboardIntervalID;
var _dashboradtrafficStaticIntervalID;
var _connectedDeviceIntervalID;
var _trafficstatisticsIntervalID;
var _networkActivityIntervalID;
var _loginOperationIntervalID;
var _storageSettingsIntervalID;
var _WiFiIntervalID;
var _trafficStatisticIntervalID;
var _dashboradsignalRefreshIntervalID;

var g_nav = "",g_firstMenu="",g_secondMenu="";
/* This function get the XML from the server via ajax.
 *  Get is Method and success fucntion is callback funciton when the request success
 */
document.onkeydown = function(e) {
	if (null == g_objContent)
		return true;
	var ev = window.event || e;
	var code = ev.keyCode || ev.which;
	if (code == 116) {
		ev.keyCode ? ev.keyCode = 0 : ev.which = 0;
		cancelBubble = true;
		g_objContent.onLoad(true);
		return false;
	}
}

function callXML(xml, sFucntion) {
	$.ajax({
		type: "GET",
		url: xml,
		dataType: "xml",
		async: false,
		success: sFucntion

	});
}

/* This is important function which parses the UIxml file
 * Creates the Menu and submenu depending upon XML items
 *
 */
function parseXml(xml) {
	var menuIndex = 0;
	g_menues = xml;
	var thirdlevelmeunstr;
	var tabName;
	var meun;
	$(xml).find("Tab").each(function() {
		tabName = jQuery.i18n.prop($(this).attr("Name").toString());
		menuIndex++;
		document.getElementById('menu').innerHTML += "<li><a href='#' id=" + menuIndex + " onClick='createMenu(" +
			menuIndex + ")'>" + tabName + "</a></li>";
	});
	g_navtabNum = menuIndex;
}
/*
 * Create the submeny from XML items
 */

function createMenu(index, bDisplayForm,isRefresh) {
	g_nav = "",g_firstMenu="",g_secondMenu="";
	removeMenuClass();
	document.getElementById(index.toString()).className = "on";
	var idx = 0;
	g_nav = index;
	$(g_menues).find("Tab").each(function() {
		if (idx == index - 1) {
			var tabName = jQuery.i18n.prop($(this).attr("Name").toString());
			if ($(this).attr("type").toString() == 'submenuabsent') {
				$('#media_sub_menu').hide();
				var bodyW = parseInt(document.body.offsetWidth);
				if (bodyW <= maxWindowW) {
					$('#navigation').hide();
				} else {
					$('#navigation').show();
				}
				clearRefreshTimers();
				g_objContent = eval('$("#mainColumn").' + $(this).attr("implFunction").toString() + '({})');
				g_objContent.onLoad(true);
				setCurrentPage();
			} else {
				var bodyW = parseInt(document.body.offsetWidth);
				if (bodyW <= maxWindowW) {
					$('#media_sub_menu').show();
				} else {
					$('#media_sub_menu').hide();
				}
				document.getElementById('mainColumn').innerHTML = "<div class='leftBar'><ul class='leftMenu' id='submenu'></ul></div><div id='Content' class='content'></div><br class='clear' /><br class='clear' />";
				var firstmenu;
				var firstmenuisSubMenu = false;
				var i = 0;
				$(this).find("Menu").each(function() {
					var menustr = "\"" + $(this).attr("id").toString() + "\"";
					if (i == 0) {
						firstmenu = $(this).attr("id").toString();
						if ($(this).attr("type").toString() == 'submenupresent')
							firstmenuisSubMenu = true;
					}
					if ($(this).attr("type").toString() == 'submenupresent') {
						document.getElementById('submenu').innerHTML += "<li id=" + menustr +
							"><a href=\"#\" onClick='displaySubForm(" + menustr + ")'>" + jQuery.i18n.prop($(this).attr("id").toString()) +
							"</a></li>";
						var html = "<li class='hide'><ul class='thirdmenu'>";
						$(this).find("ThirdlevelMenu").each(function() {
							var thirdlevelmeunstr = "\"" + $(this).attr("id").toString() + "\"";
							var strImplFunction = " name=\"" + $(this).attr("implFunction").toString() + "\"";
							html += "<li style ='list-style:none' class='menu-three-level' id=" + thirdlevelmeunstr + strImplFunction +
								"><a href=\"#\" onClick='displayForm(" + thirdlevelmeunstr + ",1)'>" + jQuery.i18n.prop($(this).attr("id").toString()) +
								"</a></li>";
						});
						html += "</ul></li>";
						document.getElementById('submenu').innerHTML += html;

					} else {
						var strImplFunction = " name=\"" + $(this).attr("implFunction").toString() + "\"";
						document.getElementById('submenu').innerHTML += "<li id=" + menustr + strImplFunction +
							"><a href=\"#\" onClick='displayForm(" + menustr + ")'>" + jQuery.i18n.prop($(this).attr("id").toString()) +
							"</a></li>";
					}
					i++;
				});
				if (undefined == bDisplayForm) {
					if (!firstmenuisSubMenu) {
						displayForm(firstmenu);
					} else {
						displaySubForm(firstmenu);
					}
				}

			}
		}
		idx++;
	});
}
//var helpPage = "help_en.html";
function removeMenuClass() {
	if (g_navtabNum > 0)
		for (var j = 1; j <= g_navtabNum; j++)
			document.getElementById(j.toString()).className = "";
}
/*
 * Function for passing the JavaScript
 */
function createMenuFromXML() {
	callXML("xml/ui_" + g_platformName + ".xml", parseXml);
	var bodyW = parseInt(document.body.offsetWidth);
	if (bodyW > maxWindowW) {
		$(".navigation ul li").width($(".header").width() / g_navtabNum);
	} else { //phone
		$(".navigation ul li").width("100%");
	}
	$("#media_menu").unbind("click");
	$('#media_menu').click(function() {
		$('#navigation').toggle();
		$('#submenu').hide();
	});
	$("#media_sub_menu").unbind("click");
	$('#media_sub_menu').click(function() {
		$('#navigation').hide();
		$('#submenu').toggle();
	})
}
/*
 * Check which item is selected and take appropriate action to execute the
 * panel class, and call his onLoad function as well as set the XML Name
 */

function displaySubForm(clickedItem) {
	g_firstMenu = clickedItem;
	g_secondMenu = "";
	clearRefreshTimers();
	if (g_bodyWidth < 430) {
		$('#submenu').hide();
	}
	$(".leftMenu .on").removeClass("on");
	var menuSelector = "#" + clickedItem;
	$(menuSelector).siblings(".hide").css("display", "none").end()
		.next(".hide").css("display", "list-item");
	$(menuSelector).addClass("on");
	var threeMenuObj = $(menuSelector).next(".hide:first").children(".thirdmenu:first").children(".menu-three-level:first");
	threeMenuObj.addClass("on");
	g_objContent = eval('$("#Content").' + threeMenuObj.attr("name") + '("' + threeMenuObj.attr("id") + '")');
	g_objContent.onLoad(true);
	g_secondMenu = threeMenuObj.attr("id");
	setCurrentPage();
}

function displayForm(clickedItem,type) {
	if(type){
		g_secondMenu = clickedItem;
	}else{
		g_firstMenu = clickedItem;
		g_secondMenu = "";
	}
	setCurrentPage();
	var bodyW = parseInt(document.body.offsetWidth);
	if (bodyW <= maxWindowW) {
		$('#navigation,#submenu').hide();
	} else {
		$('#navigation,#submenu').show();
	}

	clearRefreshTimers();

	var menuSelector = "#" + clickedItem;
	if (!$(menuSelector).parents("ul").hasClass("thirdmenu")) {
		$(".leftMenu .hide").css("display", "none");
	}
	$(menuSelector).siblings().removeClass("on").end().addClass("on");

	g_objContent = eval('$("#Content").' + $(menuSelector).attr("name") + '("' + $(menuSelector).attr("id") + '")');
	g_objContent.onLoad(true);

	if (g_objContent == null){
		document.getElementById("Content").innerHTML = "";
	}
}

function clearRefreshTimers() {
	clearInterval(_dashboardIntervalID);
	clearInterval(_dashboradtrafficStaticIntervalID);
	clearInterval(_connectedDeviceIntervalID);
	clearInterval(_trafficstatisticsIntervalID);
	clearInterval(_networkActivityIntervalID);
	clearInterval(_storageSettingsIntervalID);
	clearInterval(_WiFiIntervalID);
	clearInterval(_trafficStatisticIntervalID);
	clearInterval(_loginOperationIntervalID);
	clearInterval(_dashboradsignalRefreshIntervalID);
	clearTimeout(g_vpnTimer);
}

function dashboardOnClick(subMenuID) {
	var selMenuIdx = 1;
	$(g_menues).find("Tab").each(function() {
		$(this).find("Menu").each(function() {
			var menuId = $(this).attr("id").toString();
			if ("submenupresent" == $(this).attr("type")) {
				$(this).find("ThirdlevelMenu").each(function() {
					if (subMenuID == $(this).attr("id").toString()) {
						createMenu(selMenuIdx, false);
						var menuSelector = "#" + menuId;
						var submenuSelector = "#" + subMenuID;
						$(menuSelector).siblings().removeClass("on").end().addClass("on").next(".hide").css("display", "list-item");
						$(submenuSelector).addClass("on");
						displayForm(subMenuID);
						return;
					}
				});
			} else if (subMenuID == menuId) {
				createMenu(selMenuIdx, false);
				displayForm(subMenuID);
				return;
			}
		});
		++selMenuIdx;
	});
}

function setData() {
	if (g_objContent != null)
		g_objContent.SaveData();
}
function setCurrentPage(){
	var page = g_nav+":"+g_firstMenu+":"+g_secondMenu + "&name="+g_username+"&password="+g_loginPasswd;
	var url = window.location.protocol + "//" + window.location.host + getHeader("POST","iflogin",page);
	var result = sendAjax(url);
	return result;
}