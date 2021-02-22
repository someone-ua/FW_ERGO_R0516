var Shared_read_mode=0;
var Shared_Path_Name='/';
var Shared_Path_Name_Record='/';
var Shared_Path_Name_Flag=0;


var Shared_Order_Mode=1;
var Shared_NameOrder_flag=1;
var Shared_SizeOrder_flag=1;
var Shared_FileDateOrder_flag=1;
var WebdavSharedFileListArray = new Array();

function ShareFileShowInit(){
	document.getElementById("lacopyright_share").innerHTML = jQuery.i18n.prop("lt_lacopyright");
	document.getElementById('webdavSharedDelete').value = jQuery.i18n.prop("webdavDelete");
	document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
	document.getElementById('webdavSharedMkdir').value = jQuery.i18n.prop("webdavMkdir");
	//buttonLocaliztion("lt_Mkdir_btnSave");
	document.getElementById("lt_Mkdir_btnSave").value = jQuery.i18n.prop("lt_Mkdir_btnSave");
	
	
	document.getElementById('mkdir_stcCancelView').value=jQuery.i18n.prop("mkdir_stcCancelView");
	document.getElementById('mkdir_stcName').innerHTML=jQuery.i18n.prop("mkdir_stcName");
	document.getElementById('mkdirInfoDlgTitle').innerHTML=jQuery.i18n.prop("mkdirInfoDlgTitle");		
	
	document.getElementById('webdav_Shared_name').innerHTML=jQuery.i18n.prop("webdav_name")+"<img id=\"NameOrder\" src=../images/ico_webdav_up.png style=\"display: none\">";
	document.getElementById('webdav_Shared_size').innerHTML=jQuery.i18n.prop("webdav_size")+"<img id=\"SizeOrder\" src=../images/ico_webdav_up.png style=\"display: none\">";
	document.getElementById('webdav_Shared_date').innerHTML=jQuery.i18n.prop("webdav_date")+"<img id=\"FiledateOrder\" src=../images/ico_webdav_up.png style=\"display: none\">";
	
	document.getElementById('webdavuploadschedule_pause').value = jQuery.i18n.prop("webdavuploadschedule_pause");
	document.getElementById('webdavuploadscheduleDlgTitle').innerHTML=jQuery.i18n.prop("webdavuploadscheduleDlgTitle");	
	document.getElementById('upload_stcCancelView').value=jQuery.i18n.prop("mkdir_stcCancelView");
	document.getElementById('lt_btnConfirmYes').value=jQuery.i18n.prop("lt_btnConfirmYes");
	document.getElementById('lt_btnConfirmNo').value=jQuery.i18n.prop("lt_btnConfirmNo");
	var sdStatus = PostXml("sdcard","get_sdcard_status");
	if($(sdStatus).find("status").text() == "0"){
		showMsgBox(jQuery.i18n.prop("lTitleShareFile"), jQuery.i18n.prop("lsdcardstatus"));
		$("#btnModalOk").click(function(){
			CloseDlg();
		});
		return;
	}
	var retXml = PostXml("router","webdav_get_shared_auth");
	if("on" != $(retXml).find("enable").text()) {
		ShowDlg("alertMBExit",350,150);
	    document.getElementById("lAlertMessageExit").innerHTML = jQuery.i18n.prop("webdav_shared_message_no_open");
	    document.getElementById("lAlertExit").innerHTML = jQuery.i18n.prop("lAlert");
	    LocalElementById("btnModalOkExit");
        return;
    }

	if ("read_write" != $(retXml).find("shared_mode").text()) {
		$("#webdav_shared_function").hide();
	} else {
		$("#webdav_shared_function").show();
	}
		if(isBrowser()=="IE8")
		{
			$("#WebdavSharedFileToUpload").bind("change",function() {
				showAlert("lupdateBrowser");
			});
		}
		else
		{
			$("#WebdavSharedFileToUpload").on("change", null,function() {
		 		WebDav_Shared_Upload_Change();
			});
		}

		$("#webdavSharedMkdir").click(function() {
				ShowDlg("mkdirInfoDlg", 450, 150);
				$("#selSaveLoc").attr("disabled", false);
				$("#mkdir_stcInputCheckout").hide();
				
				$("#lt_Mkdir_btnSave").click(function() {

	                var FolderName = $("#mkdirtxtName").val();
	                FolderName = FolderName.replace(/(^\s*)|(\s*$)/g,'');
					if ($("#mkdirtxtName").val().length == 0) {
						$("#mkdir_stcInputCheckout").show().text(jQuery.i18n.prop("mkdir_stcInputCheckout1"));
					    //$("#mkdir_stcInputCheckout").show().text("Please Input the name!");
					    return;
					}
					if((FolderName.indexOf("%")==-1)&&(FolderName.indexOf("*")==-1)&&(FolderName.indexOf("|")==-1)
					&&(FolderName.indexOf(":")==-1)&&(FolderName.indexOf("\\")==-1)&&(FolderName.indexOf("/")==-1)
					&&(FolderName.indexOf("?")==-1)&&(FolderName.indexOf("\"")==-1)&&(FolderName.indexOf("<")==-1)
					&&(FolderName.indexOf(">")==-1)&&(FolderName.indexOf("#")==-1))
					{
							
						WebDav_Shared_Mkdir(FolderName);
						CloseDlg();
					}
					else
					{
						$("#mkdir_stcInputCheckout").show().text(jQuery.i18n.prop("mkdir_stcInputCheckout2"));
						//$("#mkdir_stcInputCheckout").show().text("A file name can't contain any of following characters:/ \\ : * ? \" < > | #");
						return;
					}

				});                      
	    });
				
		function GetSharedSelWebdavFileId() {
		    var smsIdSet = "";
		    $(".delCheckBox:checked").each(function() {
		        smsIdSet = smsIdSet+$(this).parents("tr:first").attr("id")+"/";
		    });
			
		    return smsIdSet;
		}

		$("#webdavSharedDelete").click(function() {
	    	
			var fileName=GetSharedSelWebdavFileId();
			WebDav_Shared_Delete(fileName);
		});
		
		
		$("#deleteSharedAllWebdavFile").click(function() {
			if ($("#deleteSharedAllWebdavFile").prop("checked")) {
                $(".delCheckBox").prop("checked", true);
            } else {
                $(".delCheckBox").prop("checked", false);
            }
			
			if ($(".delCheckBox:checked").length >= 1) {
				$("#webdav_Shared_Delete_Button").show();
				$("#webdav_Shared_Upload_Button").hide();
				$("#webdav_Shared_Mkdir_Button").hide();
            } 
			else {
            	$("#webdav_Shared_Delete_Button").hide();
//				$("#webdav_Shared_Upload_Button").show();
//				$("#webdav_Shared_Mkdir_Button").show();
            	displayUploadButton(Shared_Path_Name);
            }
        });
		
		/*
      	var xml= callProductXML_webdavshare("get_shared_file_info");
        $(xml).find("response").each(function() {

			var sd_flag=$(this).find("sd_state").text();
			if(sd_flag=='0')
			{
				$("#webdav_Shared_Upload_Button").hide();
				$("#webdav_Shared_Mkdir_Button").hide();
				$("#webdav_Share_Button").hide();
				$("#webdav_Shared_Delete_Button").hide();
				showAlert(jQuery.i18n.prop("lsdcardstatus"));
				return;
			}
			var usb_flag=$(this).find("webdav_enable").text();	
			if(usb_flag=='0')
			{
				$("#webdav_Shared_Upload_Button").hide();
				$("#webdav_Shared_Mkdir_Button").hide();
				$("#webdav_Share_Button").hide();
				$("#webdav_Shared_Delete_Button").hide();
				showAlert(jQuery.i18n.prop("lwebdavusbflag"));
				return;
			}
			var enable=$(this).find("web_shared_enable").text();
			var read_mode=$(this).find("web_shared_only_read").text();
			var path=$(this).find("web_shared_file_path").text();
			
				if(enable=="1")
				{
					$("#deleteSharedAllWebdavFile").attr("checked", false);
					Shared_Path_Name_Flag=0;
					$("#webdav_Shared_Path_NoRoot").hide();
					$("#webdav_Shared_Path_Root").show();

					document.getElementById('webdav_Shared_Path_Root').innerHTML=jQuery.i18n.prop("webdav_Shared_Path_Root");
					var zoom=document.getElementById('webdav_Shared_Path_Root');
					zoom.style.fontWeight="bold";
					//document.getElementById('webdav_Shared_Path_record').innerHTML="All Shared Files ";
					if(read_mode=="1")
					{
						Shared_read_mode=1;
						$("#webdav_shared_function").hide();
					}
					else
					{
						Shared_read_mode=0;
						$("#webdav_Shared_Upload_Button").hide();
						$("#webdav_Shared_Mkdir_Button").hide();
						$("#webdav_Share_Button").hide();
						$("#webdav_Shared_Delete_Button").hide();
						
					}


					$("#deleteSharedAllWebdavFile").click(function() {
			            if ($("#deleteSharedAllWebdavFile").attr("checked")) {
			                $(".delCheckBox").attr("checked", true);
			            } else
			                $(".delCheckBox").attr("checked", false);

						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1)
					            {
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
					            }
					            else
					            {
				                	$("#webdav_Shared_Delete_Button").hide();
									$("#webdav_Shared_Upload_Button").show();
									$("#webdav_Shared_Mkdir_Button").show();					
					            }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

			        });
					if(path=='')
					{
						$("#WebdavSharedFileListInfo").empty();		
						showAlert(jQuery.i18n.prop("webdav_Shared_File_No_Exist"));
						$("#webdav_shared_function").hide();
					}
					else if(path=='/')
					{
						Shared_Path_Name='/';
						Shared_Path_Name_Record=Shared_Path_Name;
						WebDav_Shared_PROPFIND ('/');
					}
					else
					{
						WebdavSharedFileListArray.length = 0;
						var Contenttype=$(this).find("web_shared_contenttype").text();
						var Contentlenth=$(this).find("web_shared_contentlength").text();
						var Lastmodified=$(this).find("web_shared_lastmodified").text();
						var FileTypeImage;
						var FileSize;
						var FileSize_flag;
						var FileNameArray = new Array();
						FileNameArray =path.split("/");
						var len=FileNameArray.length;
						if(len>2)
						{
							Shared_Path_Name='/';
							for(var i=1;i<len-1;i++)
							{
								Shared_Path_Name=Shared_Path_Name+WebDav_Utf8_To_Char(FileNameArray[i])+'/';
							}
						}
						else
						{
							Shared_Path_Name='/';
						}
						
						if(len>1)
						{
							Shared_Path_Name_Record='/';
							for(var i=0;i<len;i++)
							{
								if(FileNameArray[i]!='')
								{
									Shared_Path_Name_Record=Shared_Path_Name_Record+WebDav_Utf8_To_Char(FileNameArray[i])+'/';
								}
							}
						}
						else
						{
							Shared_Path_Name_Record='/';
						}
						//Shared_Path_Name_Record=Shared_Path_Name;
						var FileName=WebDav_Utf8_To_Char(FileNameArray[len-1]);
						if(Contenttype=="httpd/directory")
						{
							FileSize="-";
							FileTypeImage="ico_webdav_directory.png"
						}
						else
						{					
							//FileSize=$(this).find("getcontentlength").text();
							FileSize_flag=Contentlenth;
							if(parseInt(Contentlenth)<1024)
							{
								FileSize=Contentlenth+'B';
							}else if(parseInt(Contentlenth)<1048576)
							{
								var size=parseInt((parseInt(Contentlenth)/1024)*100);
								FileSize=size/100+'K';
							}
							else
							{
								var size=parseInt((parseInt(Contentlenth)/1048576)*100);
								FileSize=size/100+'M';
							}
							FileTypeImage=WebDav_GetImage_By_FileType(Contenttype);
							
						}
						//WebDav_Shared_PROPFIND("/");
						$("#WebdavSharedFileListInfo").empty();

						var htmlText ;
						htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + FileName + "\">"
							   + "<td><div>"
							   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
							   +"<img src=\"images/"+FileTypeImage+"\" align=\"right\"/>"
							   +"</div></td>"
							   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+Contenttype+"',\'"+FileName+"\')\"><span>"+FileName+"</span></td>"
							   + "<td><div><span>"+FileSize+"</span></div></td>"
							   + "<td><span>"+Lastmodified+"</span></td></tr>"

						WebdavSharedFileListArray.length=WebdavSharedFileListArray.length+1;
						var len;
						len=WebdavSharedFileListArray.length;
						WebdavSharedFileListArray[len-1]=FileName+"?"+FileSize+"?"+Lastmodified+"?"+Contenttype+"?"+FileTypeImage+"?"+FileSize_flag;
						  
						$("#WebdavSharedFileListInfo").append(htmlText);
							
						$(".delCheckBox:last").click(function() {
				                if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
				                    $("#deleteSharedAllWebdavFile").attr("checked", true);
				                } 
								else {
				                    $("#deleteSharedAllWebdavFile").attr("checked", false);
				                }
								
								if(Shared_read_mode==0)
								{
									if(Shared_Path_Name_Flag==1)
									{
										if ($(".delCheckBox:checked").length >= 1) {
											
											
											$("#webdav_Shared_Delete_Button").show();
											$("#webdav_Shared_Upload_Button").hide();
											$("#webdav_Shared_Mkdir_Button").hide();
						                    
						                } 
										else {
						                	
						                	$("#webdav_Shared_Delete_Button").hide();
											$("#webdav_Shared_Upload_Button").show();
											$("#webdav_Shared_Mkdir_Button").show();
						                }
									}
									else
									{
										if ($(".delCheckBox:checked").length >= 1) 
										{						
											$("#webdav_Shared_Delete_Button").show();
						                    
						                } 
										else 
										{
						                	
						                	$("#webdav_Shared_Delete_Button").hide();
						                }
									}
								}

									
				            });
						}
						
					}
					else
					{
						showAlert(jQuery.i18n.prop("lsdcardsharestatus"));
						$("#webdav_shared_function").hide();
					}


        });
		*/
	WebDav_Shared_PROPFIND ('/');
	return;
}

function shareExit() 
{
	CloseDlg();
	logOut();
}

function WebDav_Shared_BackOnClick()
{

	var path='';
	var name=new Array();
	name =Shared_Path_Name.split("/");
	var i=0;
	if(name.length>2)
	{
		for(i=0;i<name.length-2;i++)
		{
			path=path+encodeURIComponent(name[i])+'/';
		}
	}
	else
	{
		var path='/';
	}
	WebDav_Shared_PROPFIND(path);
/*
	var path='';
	var name=new Array();
	name =Shared_Path_Name.split("/");
	var i=0;
	if(name.length>2)
	{
		for(i=0;i<name.length-2;i++)
		{
			path=path+name[i]+'/';
		}
	}
	else
	{
		path='/';
	}
	if((Shared_Path_Name_Record==Shared_Path_Name)&&(Shared_Path_Name_Record!='/'))
	{
		WebdavSharedFileListArray.length = 0;
		$("#webdav_Shared_Path_NoRoot").hide();
		$("#webdav_Shared_Path_Root").show();
		//document.getElementById('webdav_Shared_Path_record').innerHTML="All Shared Files ";
		document.getElementById('webdav_Shared_Path_record').innerHTML=jQuery.i18n.prop("webdav_Shared_Path_Root");
		var zoom=document.getElementById('webdav_Shared_Path_record');
		zoom.style.fontWeight="bold";
		
		var xml= callProductXML_webdavshare("get_shared_file_info");
        $(xml).find("response").each(function() {

			var usb_flag=$(this).find("sd_state").text();	
			if(usb_flag!='0')
			{
				//showAlert(jQuery.i18n.prop("lwebdavusbflag"));
				//return;
			}
			var enable=$(this).find("webdav_enable").text();
			var read_mode=$(this).find("web_shared_only_read").text();
			var path=$(this).find("web_shared_file_path").text();
				if(enable=="1")
				{
					Shared_Path_Name_Flag=0;
					$("#deleteSharedAllWebdavFile").attr("checked", false);
					if(read_mode=="1")
					{
						Shared_read_mode=1;
						$("#webdav_shared_function").hide();
					}
					else
					{
						Shared_read_mode=0;
						//$("#webdav_Shared_Delete_Button").show();
						$("#webdav_Shared_Upload_Button").hide();
						$("#webdav_Shared_Mkdir_Button").hide();
						$("#webdav_Share_Button").hide();
						$("#webdav_Shared_Delete_Button").hide();
						
					}
					var Contenttype=$(this).find("web_shared_contenttype").text();
					var Contentlenth=$(this).find("web_shared_contentlength").text();
					var Lastmodified=$(this).find("web_shared_lastmodified").text();
					var FileTypeImage;
					var FileSize;
					var FileSize_flag;
					var FileNameArray = new Array();
					FileNameArray =path.split("/");
					var len=FileNameArray.length;
					
					if(len>2)
					{
						Shared_Path_Name='/';
						for(var i=1;i<len-1;i++)
						{
							Shared_Path_Name=Shared_Path_Name+WebDav_Utf8_To_Char(FileNameArray[i])+'/';
						}
					}
					else
					{
						Shared_Path_Name='/';
					}
					
					if(len>1)
					{
						Shared_Path_Name_Record='/';
						for(var i=0;i<len;i++)
						{
							if(FileNameArray[i]!='')
							{
								Shared_Path_Name_Record=Shared_Path_Name_Record+WebDav_Utf8_To_Char(FileNameArray[i])+'/';
							}
						}
					}
					else
					{
						Shared_Path_Name_Record='/';
					}
					
					//Shared_Path_Name_Record=Shared_Path_Name;
					var FileName=WebDav_Utf8_To_Char(FileNameArray[len-1]);
					if(Contenttype=="httpd/directory")
					{
						FileSize="-";
						FileTypeImage="ico_webdav_directory.png"
					}
					else
					{					
						FileSize_flag=FileSize;
						if(parseInt(Contentlenth)<1024)
						{
							FileSize=Contentlenth+'B';
						}else if(parseInt(Contentlenth)<1048576)
						{
							var size=parseInt((parseInt(Contentlenth)/1024)*100);
							FileSize=size/100+'K';
						}
						else
						{
							var size=parseInt((parseInt(Contentlenth)/1048576)*100);
							FileSize=size/100+'M';
						}
						FileTypeImage=WebDav_GetImage_By_FileType(Contenttype);
						
					}
					$("#WebdavSharedFileListInfo").empty();
					var htmlText ;
					htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + FileName + "\">"
						   + "<td><div>"
						   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
						   +"<img src=\"images/"+FileTypeImage+"\" align=\"right\"/>"
						   +"</div></td>"
						   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+Contenttype+"',\'"+FileName+"\')\"><span>"+FileName+"</span></td>"
						   + "<td><div><span>"+FileSize+"</span></div></td>"
						   + "<td><span>"+Lastmodified+"</span></td></tr>"

					WebdavSharedFileListArray.length=WebdavSharedFileListArray.length+1;
					var len;
					len=WebdavSharedFileListArray.length;
					WebdavSharedFileListArray[len-1]=FileName+"?"+FileSize+"?"+Lastmodified+"?"+Contenttype+"?"+FileTypeImage+"?"+FileSize_flag;
					  
					$("#WebdavSharedFileListInfo").append(htmlText);

					
					$(".delCheckBox:last").click(function() {
		                if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
		                    $("#deleteSharedAllWebdavFile").attr("checked", true);
		                } 
						else {
		                    $("#deleteSharedAllWebdavFile").attr("checked", false);
		                }
						
						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1) {
									
									
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
				                    
				                } 
								else {
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
									$("#webdav_Shared_Upload_Button").show();
									$("#webdav_Shared_Mkdir_Button").show();
				                }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

							
		            });

							
				}
				else
				{
					showAlert(jQuery.i18n.prop("lsdcardsharestatus"));
					$("#webdav_shared_function").hide();
				}

        });
	}
	else
	{
		var str_path=path;
		var temp_path=new Array();
		temp_path=str_path.split("/");
		var path_2='/';
		for(var k=0;k<temp_path.length;k++)
		{
			if(temp_path[k]!='')
			{
				path_2=path_2+encodeURIComponent(temp_path[k])+"/";
			}
		}
		WebDav_Shared_PROPFIND(path_2);
	}
	*/

}

function WebDav_Shared_GetFileOnClick(FileType,FileName)
{
	FileName=encodeURIComponent(FileName);
	var str_path=Shared_Path_Name;
	var temp=new Array();
	temp=str_path.split("/");
	var path='/';
	for(var i=0;i<temp.length;i++)
	{
		if(temp[i]!='')
		{
			path=path+encodeURIComponent(temp[i])+"/";
		}
	}
	if(FileType=="httpd/unix-directory")
	{
		WebDav_Shared_PROPFIND(path+FileName+"/");
	}
	else
	{
		WebDav_Shared_Get_Open(path+FileName);
	}
}


function WebDav_Shared_Get_Open(path) 
{
	var contentType="";
	var xml_content=WebDav_Shared_GetSyncXML(path,contentType);
	window.open("/shared"+path, '_blank');

}


function WebDav_Shared_Mkdir(FolderName) 
{
	FolderName=encodeURIComponent(FolderName);

	var path=Shared_Path_Name;
	var name=new Array();
	name =path.split("/");
	var str_path='/';
	var i=0;
	for(i=0;i<name.length;i++)
	{
		if(name[i]!='')
		{
			str_path=str_path+encodeURIComponent(name[i])+'/';
		}

	}
	var prop_path=str_path;
	str_path=str_path+FolderName;


	//path=path+FolderName;
	var xml_content=WebDav_Shared_MkdirSyncXML(str_path);

	WebDav_Shared_PROPFIND(prop_path);

}


function WebDav_chines_utf8(chines_path)
{
	var path=chines_path;
	var name=new Array();
	name =path.split("/");
	var str_path='/';
	var i=0;
	for(i=0;i<name.length;i++)
	{
		if(name[i]!='')
		{
			str_path=str_path+encodeURIComponent(name[i])+'/';
		}

	}
	return str_path;
}



function WebDav_Shared_Delete(FileName) 
{
		
	var FileNameArray = new Array();
	FileNameArray =FileName.split("/");
	var path;
	var i=0;
	var currnwin;
	ShowDlg("PleaseWait", 150, 100);
	$("#lPleaseWait").text(jQuery.i18n.prop("h1PleaseWait"));
	for(i=0;i<FileNameArray.length;i++)
	{
		if(FileNameArray[i]!="")
		{
			FileNameArray[i]=encodeURIComponent(FileNameArray[i]);
			path=WebDav_chines_utf8(Shared_Path_Name);
			path=path+FileNameArray[i];
			var xml_content=WebDav_Shared_DeleteSyncXML(path);
		}		
	}
	CloseDlg();
	//if((WebDav_Utf8_To_Char(path)+'/')==Shared_Path_Name_Record)
	//{
	//	$("#WebdavSharedFileListInfo").empty();
	//	$("#deleteSharedAllWebdavFile").attr("checked", false);

	//	$("#webdav_Shared_Upload_Button").hide();
	//	$("#webdav_Shared_Mkdir_Button").hide();
	//	$("#webdav_Share_Button").hide();
	//	$("#webdav_Shared_Delete_Button").hide();
		
	//	WebdavSharedFileListArray.length = 0;
	//	$("#webdav_shared_function").hide();
	//}
	//else
	//{

		var pro_path=WebDav_chines_utf8(Shared_Path_Name);
		WebDav_Shared_PROPFIND(pro_path);
	//}

}

function WebDav_Shared_NameOrderOnClick()
{
    //$("#webdav_Download_Button").hide();
    Shared_Order_Mode=1;
    var Nameimg = document.getElementById("NameOrder");
    if(Shared_NameOrder_flag)
    {
    	Nameimg.src="../images/ico_webdav_down.png";
		Shared_NameOrder_flag=0;
    }
	else
	{
		Shared_NameOrder_flag=1;
		Nameimg.src="../images/ico_webdav_up.png";
	}
	
	if(WebdavSharedFileListArray.length>0)
	{
		$("#WebdavSharedFileListInfo").empty();
		var WebdavNameListArray = new Array(); 
		WebdavNameListArray.length=WebdavSharedFileListArray.length;
		for(var i=0;i<WebdavSharedFileListArray.length;i++)
		{
			var temp=new Array();
			temp=WebdavSharedFileListArray[i].split("?");
			WebdavNameListArray[i]=temp[0].toLowerCase(); 
		}
		if(Shared_NameOrder_flag)
		{
			WebdavNameListArray.sort(function(a,b){return a<b?1:-1});
		}
		else
		{
			WebdavNameListArray.sort(function(a,b){return a>b?1:-1});
		}
		for(var i=0;i<WebdavSharedFileListArray.length;i++)
		{
			for(var j=0;j<WebdavSharedFileListArray.length;j++)
			{
				var temp=new Array();
				temp=WebdavSharedFileListArray[j].split("?");
				if(WebdavNameListArray[i]==temp[0].toLowerCase())
				{
					var htmlText ;
					htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp[0] + "\">"
						   + "<td><div>"
						   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
						   +"<img src=\"images/"+temp[4]+"\" align=\"right\"/>"
						   +"</div></td>"
						   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp[3]+"',\'"+temp[0]+"\')\"><span>"+temp[0]+"</span></td>"
						   + "<td><div><span>"+temp[1]+"</span></div></td>"
						   + "<td><span>"+temp[2]+"</span></td></tr>"
					  
					$("#WebdavSharedFileListInfo").append(htmlText);

					$(".delCheckBox:last").click(function() {
			            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
			                $("#deleteSharedAllWebdavFile").prop("checked", true);
			            } 
						else {
			                $("#deleteSharedAllWebdavFile").prop("checked", false);
			            }
						
						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1) {
									
									
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
				                    
				                } 
								else {
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
//									$("#webdav_Shared_Upload_Button").show();
//									$("#webdav_Shared_Mkdir_Button").show();
				                	displayUploadButton(Shared_Path_Name);
				                }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

							
			        });
					
				}
			}

			
		}
	}


	$("#NameOrder").show();
	setTimeout("clear_order_image_function(\"Nameimg\");",500);
}


function WebDav_Shared_SizeOrderOnClick()
{
	Shared_Order_Mode=2;
    var Sizeimg = document.getElementById("SizeOrder");
    if(Shared_SizeOrder_flag)
    {
    	Sizeimg.src="../images/ico_webdav_down.png";
		Shared_SizeOrder_flag=0;
    }
	else
	{
		Shared_SizeOrder_flag=1;
		Sizeimg.src="../images/ico_webdav_up.png";
	}

	if(WebdavSharedFileListArray.length>0)
	{
		$("#WebdavSharedFileListInfo").empty();
		var WebdavFolderListArray = new Array(); 
		var WebdavSizeListArray = new Array(); 

		for(var i=0;i<WebdavSharedFileListArray.length;i++)
		{
			var temp=new Array();
			temp=WebdavSharedFileListArray[i].split("?");
			if(temp[1]=="-")
			{
				WebdavFolderListArray.length=WebdavFolderListArray.length+1;
				var len=WebdavFolderListArray.length;
				WebdavFolderListArray[len-1]=WebdavSharedFileListArray[i];
			}
			else
			{
				WebdavSizeListArray.length=WebdavSizeListArray.length+1;
				var len=WebdavSizeListArray.length;
				WebdavSizeListArray[len-1]=WebdavSharedFileListArray[i];
			}
		}
		if(Shared_SizeOrder_flag)
		{
			for(var j=0;j<WebdavFolderListArray.length;j++)
			{
				var temp=new Array();
				temp=WebdavFolderListArray[j].split("?");
				var htmlText ;
				htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp[0] + "\">"
					   + "<td><div>"
					   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
					   +"<img src=\"images/"+temp[4]+"\" align=\"right\"/>"
					   +"</div></td>"
					   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp[3]+"',\'"+temp[0]+"\')\"><span>"+temp[0]+"</span></td>"
					   + "<td><div><span>"+temp[1]+"</span></div></td>"
					   + "<td><span>"+temp[2]+"</span></td></tr>"
				  
				$("#WebdavSharedFileListInfo").append(htmlText);
				
				$(".delCheckBox:last").click(function() {
			            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
			                $("#deleteSharedAllWebdavFile").prop("checked", true);
			            } 
						else {
			                $("#deleteSharedAllWebdavFile").prop("checked", false);
			            }
						
						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1) {
									
									
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
				                    
				                } 
								else {
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
//									$("#webdav_Shared_Upload_Button").show();
//									$("#webdav_Shared_Mkdir_Button").show();
				                	displayUploadButton(Shared_Path_Name);
				                }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

							
			        });
			}

			var int_File_Size=new Array();
			for(var k=0;k<WebdavSizeListArray.length;k++)
			{
				var temp=new Array();
				temp=WebdavSizeListArray[k].split("?");
				int_File_Size.length=int_File_Size.length+1;
				var len=int_File_Size.length;
				int_File_Size[len-1]=parseInt(temp[5]);
							
			}		
			int_File_Size.sort(function(a,b){return a<=b?1:-1});
			for(var k=0;k<WebdavSizeListArray.length;k++)
			{
				for(var m=0;m<WebdavSizeListArray.length;m++)
				{
					var temp=new Array();
					temp=WebdavSizeListArray[m].split("?");
					if(int_File_Size[k]==parseInt(temp[5]))
					{
						WebdavSizeListArray[m]="";
						var htmlText ;
						htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp[0] + "\">"
							   + "<td><div>"
							   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
							   +"<img src=\"images/"+temp[4]+"\" align=\"right\"/>"
							   +"</div></td>"
							   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp[3]+"',\'"+temp[0]+"\')\"><span>"+temp[0]+"</span></td>"
							   + "<td><div><span>"+temp[1]+"</span></div></td>"
							   + "<td><span>"+temp[2]+"</span></td></tr>"
						  
						$("#WebdavSharedFileListInfo").append(htmlText);

						$(".delCheckBox:last").click(function() {
			            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
			                $("#deleteSharedAllWebdavFile").prop("checked", true);
			            } 
						else {
			                $("#deleteSharedAllWebdavFile").prop("checked", false);
			            }
						
						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1) {
									
									
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
				                    
				                } 
								else {
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
//									$("#webdav_Shared_Upload_Button").show();
//									$("#webdav_Shared_Mkdir_Button").show();
				                	displayUploadButton(Shared_Path_Name);
				                }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

							
			        });
					}
				}
			}
		}
		else
		{
			var int_File_Size=new Array();
			for(var k=0;k<WebdavSizeListArray.length;k++)
			{
				var temp=new Array();
				temp=WebdavSizeListArray[k].split("?");
				int_File_Size.length=int_File_Size.length+1;
				var len=int_File_Size.length;
				int_File_Size[len-1]=parseInt(temp[5]);
							
			}		
			int_File_Size.sort(function(a,b){return a>=b?1:-1});
			for(var k=0;k<WebdavSizeListArray.length;k++)
			{
				for(var m=0;m<WebdavSizeListArray.length;m++)
				{
					var temp=new Array();
					temp=WebdavSizeListArray[m].split("?");
					if(int_File_Size[k]==parseInt(temp[5]))
					{	
						WebdavSizeListArray[m]="";
						var htmlText ;
						htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp[0] + "\">"
							   + "<td><div>"
							   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
							   +"<img src=\"images/"+temp[4]+"\" align=\"right\"/>"
							   +"</div></td>"
							   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp[3]+"',\'"+temp[0]+"\')\"><span>"+temp[0]+"</span></td>"
							   + "<td><div><span>"+temp[1]+"</span></div></td>"
							   + "<td><span>"+temp[2]+"</span></td></tr>"
						  
						$("#WebdavSharedFileListInfo").append(htmlText);

						$(".delCheckBox:last").click(function() {
			            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
			                $("#deleteSharedAllWebdavFile").prop("checked", true);
			            } 
						else {
			                $("#deleteSharedAllWebdavFile").prop("checked", false);
			            }
						
						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1) {
									
									
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
				                    
				                } 
								else {
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
//									$("#webdav_Shared_Upload_Button").show();
//									$("#webdav_Shared_Mkdir_Button").show();
				                	displayUploadButton(Shared_Path_Name);
				                }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

							
			        });
					}
				}
			}
			for(var j=0;j<WebdavFolderListArray.length;j++)
			{
				var temp=new Array();
				temp=WebdavFolderListArray[j].split("?");
				var htmlText ;
				htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp[0] + "\">"
					   + "<td><div>"
					   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
					   +"<img src=\"images/"+temp[4]+"\" align=\"right\"/>"
					   +"</div></td>"
					   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp[3]+"',\'"+temp[0]+"\')\"><span>"+temp[0]+"</span></td>"
					   + "<td><div><span>"+temp[1]+"</span></div></td>"
					   + "<td><span>"+temp[2]+"</span></td></tr>"
				  
				$("#WebdavSharedFileListInfo").append(htmlText);
				$(".delCheckBox:last").click(function() {
			            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
			                $("#deleteSharedAllWebdavFile").prop("checked", true);
			            } 
						else {
			                $("#deleteSharedAllWebdavFile").prop("checked", false);
			            }
						
						if(Shared_read_mode==0)
						{
							if(Shared_Path_Name_Flag==1)
							{
								if ($(".delCheckBox:checked").length >= 1) {
									
									
									$("#webdav_Shared_Delete_Button").show();
									$("#webdav_Shared_Upload_Button").hide();
									$("#webdav_Shared_Mkdir_Button").hide();
				                    
				                } 
								else {
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
									$("#webdav_Shared_Upload_Button").show();
									$("#webdav_Shared_Mkdir_Button").show();
				                }
							}
							else
							{
								if ($(".delCheckBox:checked").length >= 1) 
								{						
									$("#webdav_Shared_Delete_Button").show();
				                    
				                } 
								else 
								{
				                	
				                	$("#webdav_Shared_Delete_Button").hide();
				                }
							}
						}

							
			        });
			}

		}
		
	}
	
	$("#SizeOrder").show();
	setTimeout("clear_order_image_function(\"Sizeimg\");",500);
}

function WebDav_Shared_FileDateOrderOnClick()
{
	Shared_Order_Mode=3;
    var Filedateimg = document.getElementById("FiledateOrder");
    if(Shared_FileDateOrder_flag)
    {
    	Filedateimg.src="../images/ico_webdav_down.png";
		Shared_FileDateOrder_flag=0;
    }
	else
	{
		Shared_FileDateOrder_flag=1;
		Filedateimg.src="../images/ico_webdav_up.png";
	}
	var WebdavFileDateListArray = new Array();  
	if(WebdavSharedFileListArray.length>0)
	{
		$("#WebdavSharedFileListInfo").empty();
		var WebdavFileListArray_temp=new Array();
		WebdavFileListArray_temp.length=WebdavSharedFileListArray.length;

		for(var i=0;i<WebdavSharedFileListArray.length;i++)
		{
			var temp=new Array();

			WebdavFileListArray_temp[i]=WebdavSharedFileListArray[i];
			temp=WebdavSharedFileListArray[i].split("?");
			temp[2]=temp[2].replace("-","");
			temp[2]=temp[2].replace("-","");
			temp[2]=temp[2].replace(" ","");
			temp[2]=temp[2].replace(":","");
			temp[2]=temp[2].replace(":","");


			WebdavFileDateListArray.length=WebdavFileDateListArray.length+1;
			var len=WebdavFileDateListArray.length;
			WebdavFileDateListArray[len-1]=parseInt(temp[2]);
		}
		
		
		
		
		if(Shared_FileDateOrder_flag)
		{		
			WebdavFileDateListArray.sort(function(a,b){return a<=b?1:-1});
			for(var k=0;k<WebdavSharedFileListArray.length;k++)
			{
				for(var m=0;m<WebdavSharedFileListArray.length;m++)
				{
					if(WebdavFileListArray_temp[m]=="")
					{
						continue;
					}
					else
					{
						var temp1=new Array();
						temp1=WebdavFileListArray_temp[m].split("?");
						var temp2=temp1[2];
						
						temp2=temp2.replace("-","");
						temp2=temp2.replace("-","");
						temp2=temp2.replace(" ","");
						temp2=temp2.replace(":","");
						temp2=temp2.replace(":","");
						if(WebdavFileDateListArray[k]==parseInt(temp2))
						{
							WebdavFileListArray_temp[m]="";
							var htmlText ;
							htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp1[0] + "\">"
								   + "<td><div>"
								   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
								   +"<img src=\"images/"+temp1[4]+"\" align=\"right\"/>"
								   +"</div></td>"
								   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp1[3]+"',\'"+temp1[0]+"\')\"><span>"+temp1[0]+"</span></td>"
								   + "<td><div><span>"+temp1[1]+"</span></div></td>"
								   + "<td><span>"+temp1[2]+"</span></td></tr>"
							  
							$("#WebdavSharedFileListInfo").append(htmlText);
							$(".delCheckBox:last").click(function() {
						            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
						                $("#deleteSharedAllWebdavFile").prop("checked", true);
						            } 
									else {
						                $("#deleteSharedAllWebdavFile").prop("checked", false);
						            }
									
									if(Shared_read_mode==0)
									{
										if(Shared_Path_Name_Flag==1)
										{
											if ($(".delCheckBox:checked").length >= 1) {
												
												
												$("#webdav_Shared_Delete_Button").show();
												$("#webdav_Shared_Upload_Button").hide();
												$("#webdav_Shared_Mkdir_Button").hide();
							                    
							                } 
											else {
							                	
							                	$("#webdav_Shared_Delete_Button").hide();
//												$("#webdav_Shared_Upload_Button").show();
//												$("#webdav_Shared_Mkdir_Button").show();
							                	displayUploadButton(Shared_Path_Name);
							                }
										}
										else
										{
											if ($(".delCheckBox:checked").length >= 1) 
											{						
												$("#webdav_Shared_Delete_Button").show();
							                    
							                } 
											else 
											{
							                	
							                	$("#webdav_Shared_Delete_Button").hide();
							                }
										}
									}

										
						        });

							break;
						}
					}

				}
			}
		}
		else
		{
			WebdavFileDateListArray.sort(function(a,b){return a>=b?1:-1});
			for(var k=0;k<WebdavSharedFileListArray.length;k++)
			{
				for(var m=0;m<WebdavSharedFileListArray.length;m++)
				{
					if(WebdavFileListArray_temp[m]=="")
					{
						continue;
					}
					else
					{
						var temp1=new Array();
						temp1=WebdavFileListArray_temp[m].split("?");
						var temp2=temp1[2];
						
						temp2=temp2.replace("-","");
						temp2=temp2.replace("-","");
						temp2=temp2.replace(" ","");
						temp2=temp2.replace(":","");
						temp2=temp2.replace(":","");
						if(WebdavFileDateListArray[k]==parseInt(temp2))
						{
							WebdavFileListArray_temp[m]="";
							var htmlText ;
							htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + temp1[0] + "\">"
								   + "<td><div>"
								   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\"/>"
								   +"<img src=\"images/"+temp1[4]+"\" align=\"right\"/>"
								   +"</div></td>"
								   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+temp1[3]+"',\'"+temp1[0]+"\')\"><span>"+temp1[0]+"</span></td>"
								   + "<td><div><span>"+temp1[1]+"</span></div></td>"
								   + "<td><span>"+temp1[2]+"</span></td></tr>"
							  
							$("#WebdavSharedFileListInfo").append(htmlText);
							$(".delCheckBox:last").click(function() {
						            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
						                $("#deleteSharedAllWebdavFile").prop("checked", true);
						            } 
									else {
						                $("#deleteSharedAllWebdavFile").prop("checked", false);
						            }
									
									if(Shared_read_mode==0)
									{
										if(Shared_Path_Name_Flag==1)
										{
											if ($(".delCheckBox:checked").length >= 1) {
												
												
												$("#webdav_Shared_Delete_Button").show();
												$("#webdav_Shared_Upload_Button").hide();
												$("#webdav_Shared_Mkdir_Button").hide();
							                    
							                } 
											else {
							                	
							                	$("#webdav_Shared_Delete_Button").hide();
//												$("#webdav_Shared_Upload_Button").show();
//												$("#webdav_Shared_Mkdir_Button").show();
							                	displayUploadButton(Shared_Path_Name);
							                }
										}
										else
										{
											if ($(".delCheckBox:checked").length >= 1) 
											{						
												$("#webdav_Shared_Delete_Button").show();
							                    
							                } 
											else 
											{
							                	
							                	$("#webdav_Shared_Delete_Button").hide();
							                }
										}
									}

										
						        });

							break;
						}
					}

				}
			}
		}
		
	}
	$("#FiledateOrder").show();
	setTimeout("clear_order_image_function(\"Filedateimg\");",500);
}

function WebDav_Shared_PROPFIND (path) 
{ 		
	var xml = '<?xml version=\"1.0\" encoding=\"utf-8\"?>\n';
	xml += '<D:propfind xmlns:D=\"DAV:\">\n';
	xml += '<D:prop>\n';
	xml += '<D:displayname/>\n';
	xml += '<D:getcontentlength/>\n';
	xml += '<D:getcontenttype/>\n';
	xml += '<D:resourcetype/>\n';
	xml += '<D:getlastmodified/>\n';
	xml += '<D:lockdiscovery/>\n';
	xml += '</D:prop>\n';
	xml += '</D:propfind>\n';
	var xml_content=WebDav_Shared_PropfindSyncXML(path,xml);
	
	$("#WebdavSharedFileListInfo").empty();
	
	if(Shared_read_mode==0)
	{

		$("#webdav_Shared_Delete_Button").hide();
		$("#webdav_Shared_Upload_Button").show();
		$("#webdav_Shared_Mkdir_Button").show();

	}
	WebdavSharedFileListArray.length = 0;

	Shared_Path_Name_Flag=1;
	$("#deleteSharedAllWebdavFile").prop("checked", false);

	var FileSize_flag;

	//var login_text  = $(xml_content).find("response").text();
	while(1)
	{
		if(xml_content.indexOf("D:")!=-1)
		{
			xml_content=xml_content.replace("D:","");
		}
		else
		{
			break;
		}
	}
	var xmldoc=stringToXml(xml_content);
	$(xmldoc).find("response").each(function() {
		if(path=="/")
		{
			$("#webdav_Shared_Path_NoRoot").hide();
			$("#webdav_Shared_Path_Root").show();
			
			document.getElementById('webdav_Shared_Path_Root').innerHTML=jQuery.i18n.prop("webdav_Shared_Path_Root");
			
		}
		else
		{
			$("#webdav_Shared_Path_Root").hide();
			$("#webdav_Shared_Path_NoRoot").show();
			document.getElementById('webdav_Shared_Back_label').innerHTML=jQuery.i18n.prop("webdav_Back_label");
		}
			
		var FileName=$(this).find("href").text();
		FileName=FileName.replace(window.location.protocol + "//" + window.location.host+"/shared","");
		
		if(WebDav_Utf8_To_Char(FileName)==WebDav_Utf8_To_Char(path))
		{
			Shared_Path_Name=WebDav_Utf8_To_Char(FileName);
			/*
			if(Shared_Path_Name_Record!='/')
			{
				
				var FileNametempArray = new Array();
				FileNametempArray =Shared_Path_Name_Record.split("/");
				var length=FileNametempArray.length;
				var Shared_Path_Name_Record_temp='';
				for(var j=0;j<length-2;j++)
				{
					if(FileNametempArray[j]!='')
					{
						Shared_Path_Name_Record_temp=Shared_Path_Name_Record_temp+'/'+FileNametempArray[j];
					}
				}
				FileName=WebDav_Utf8_To_Char(FileName);
				FileName=FileName.replace(Shared_Path_Name_Record_temp,"");
			}
			*/
			var FileNameArray = new Array();
			FileNameArray =FileName.split("/");

			document.getElementById('webdav_Shared_Path_record').innerHTML=jQuery.i18n.prop("webdav_Shared_Path_Root");
			for(var i=0;i<FileNameArray.length;i++)
			{
				if(FileNameArray[i]!="")
				{
					document.getElementById('webdav_Shared_Path_record').innerHTML+=">"+WebDav_Utf8_To_Char(FileNameArray[i]);

				}
			}
			var zoom=document.getElementById('webdav_Shared_Path_record');
			//zoom.style.fontWeight="bold";
		}
		else
		{
			FileName=WebDav_Utf8_To_Char(FileName);
			FileName=FileName.replace(WebDav_Utf8_To_Char(path),"");
			
			if (path=="/" && FileName ==".gitignore") {
				return;
			}
			
			var FileSize;
			var FileType=$(this).find("getcontenttype").text();
			
			var FileTypeImage;
			if(FileType=="httpd/unix-directory")
			{
				FileSize="-";
				FileTypeImage="ico_webdav_directory.png"
			}
			else
			{					
				FileSize=$(this).find("getcontentlength").text();
				FileSize_flag=FileSize;
				if(parseInt(FileSize)<1024)
				{
					FileSize=FileSize+'B';
				}else if(parseInt(FileSize)<1048576)
				{
					var size=parseInt((parseInt(FileSize)/1024)*100);
					FileSize=size/100+'K';
				}
				else
				{
					var size=parseInt((parseInt(FileSize)/1048576)*100);
					FileSize=size/100+'M';
				}
				FileTypeImage=WebDav_GetImage_By_FileType(FileType);
				
			}

			var FileDate=$(this).find("getlastmodified").text();
			FileDate=WebDav_GetDate_By_DateStr(FileDate);
			
			var htmlText ;
			htmlText = "<tr style=\"cursor: pointer; background-color: rgb(255, 255, 255);\" id=\"" + FileName + "\">"
				   + "<td><div>"
				   +"<input align=\"right\" type=\"checkbox\" class=\"chk11 delCheckBox\" style=\"border:none;\"/>"
				   +"<img src=\"images/"+FileTypeImage+"\" align=\"right\"/>"
				   +"</div></td>"
				   + "<td onclick=\"WebDav_Shared_GetFileOnClick('"+FileType+"',\'"+FileName+"\')\"><span>"+FileName+"</span></td>"
				   + "<td><div><span>"+FileSize+"</span></div></td>"
				   + "<td><span>"+FileDate+"</span></td></tr>"

			WebdavSharedFileListArray.length=WebdavSharedFileListArray.length+1;
			var len;
			len=WebdavSharedFileListArray.length;
			WebdavSharedFileListArray[len-1]=FileName+"?"+FileSize+"?"+FileDate+"?"+FileType+"?"+FileTypeImage+"?"+FileSize_flag;
			  
			$("#WebdavSharedFileListInfo").append(htmlText);
			
			$(".delCheckBox:last").click(function() {
	            if ($(".delCheckBox:checked").length == $(".delCheckBox").length) {
	                $("#deleteSharedAllWebdavFile").prop("checked", true);
	            } 
				else {
	                $("#deleteSharedAllWebdavFile").prop("checked", false);
	            }
				
				if(Shared_read_mode==0)
				{
					if(Shared_Path_Name_Flag==1)
					{
						if ($(".delCheckBox:checked").length >= 1) {
							
							
							$("#webdav_Shared_Delete_Button").show();
							$("#webdav_Shared_Upload_Button").hide();
							$("#webdav_Shared_Mkdir_Button").hide();
		                    
		                } 
						else {
		                	
		                	$("#webdav_Shared_Delete_Button").hide();
		                	displayUploadButton(Shared_Path_Name);
							//$("#webdav_Shared_Upload_Button").show();
							//$("#webdav_Shared_Mkdir_Button").show();
		                }
					}
					else
					{
						if ($(".delCheckBox:checked").length >= 1) 
						{						
							$("#webdav_Shared_Delete_Button").show();
		                    
		                } 
						else 
						{
		                	
		                	$("#webdav_Shared_Delete_Button").hide();
		                }
					}
				}

					
	        });

		}
		displayUploadButton(Shared_Path_Name);

	});		

/*
	if(Shared_Order_Mode==1)
	{
		if(Shared_NameOrder_flag)
	    {
			Shared_NameOrder_flag=0;
	    }
		else
		{
			Shared_NameOrder_flag=1;
		}
		WebDav_Shared_NameOrderOnClick();
	}
	else if(Shared_Order_Mode==2)
	{
		
		if(Shared_SizeOrder_flag)
	    {
			Shared_SizeOrder_flag=0;
	    }
		else
		{
			Shared_SizeOrder_flag=1;
		}
		WebDav_Shared_SizeOrderOnClick();
	}
	else if(Shared_Order_Mode==3)
	{
		if(Shared_FileDateOrder_flag)
	    {
			Shared_FileDateOrder_flag=0;
	    }
		else
		{
			Shared_FileDateOrder_flag=1;
		}
		WebDav_Shared_FileDateOrderOnClick();
	}
	*/
}

function displayUploadButton(path)
{
	if (path != "/") {
		$("#webdav_Shared_Upload_Button").show();
		$("#webdav_Shared_Mkdir_Button").show();
	} else {
		$("#webdav_Shared_Upload_Button").hide();
		$("#webdav_Shared_Mkdir_Button").hide();
	}
	$("#webdav_Shared_Upload_Button").hover(function(){
		$("#webdavSharedUpload").css("background-color","#4babf5");
		$("#webdavSharedUpload").css("background-image","-moz-linear-gradient(center top , #4babf5, #4babf5)");
	},function(){
		$("#webdavSharedUpload").css("background-color","#9d9d9d");
		$("#webdavSharedUpload").css("background-image","-moz-linear-gradient(center top , #9d9d9d, #6c6c6c)");
	});
}


var Shared_Pause_flag=0;
var Shared_Cancel_flag=0;


function WebDav_Shared_Upload_Pause() 
{
	
	if(Shared_Pause_flag==0)
	{
		Shared_Pause_flag=1;
//		document.getElementById('webdavuploadschedule_pause').value="Continue";
		document.getElementById('webdavuploadschedule_pause').value = jQuery.i18n.prop("webdavuploadschedule_continue");
	}
	else
	{
		Shared_Pause_flag=0;
//		document.getElementById('webdavuploadschedule_pause').value="Pause";
		document.getElementById('webdavuploadschedule_pause').value = jQuery.i18n.prop("webdavuploadschedule_pause");
		WebDav_Shared_Upload();
	}	
}

function WebDav_Shared_Upload_Cancel() 
{
	Shared_Cancel_flag=1;
	if(Shared_Pause_flag==1)
	{
		WebDav_Shared_Upload();
	}
}

function WebDav_Shared_Upload_Change() 
{
	Shared_Pause_flag=0;
	Shared_Cancel_flag=0;
	var file = document.getElementById('WebdavSharedFileToUpload').files[0];
	if(file==undefined){
		return;
	}
		ShowDlg("webdavuploadscheduleDlg", 450, 150);
		document.getElementById('webdavuploadschedule_FileName').innerHTML = file.name;	
		document.getElementById('webdavuploadschedule_pause').value = jQuery.i18n.prop("webdavuploadschedule_pause");
		document.getElementById('webdavuploadscheduleDlgTitle').innerHTML=jQuery.i18n.prop("webdavuploadscheduleDlgTitle");	
		document.getElementById('upload_stcCancelView').value=jQuery.i18n.prop("mkdir_stcCancelView");

	WebDav_Shared_Upload();

}


var Shared_fromSize=0;
var Shared_ToSize=0;
var Shared_total_file_size=0;
function WebDav_Shared_Upload_Ondoing() 
{
	
	if(Shared_Cancel_flag==1)
	{
		var cancelfilename=document.getElementById('webdavuploadschedule_FileName').innerHTML;

		WebDav_Shared_Delete(cancelfilename);
		Shared_fromSize=0;
		Shared_ToSize=0;
		setTimeout("clear_upload_barview_function();",100);
		/*
		if(isBrowser()=='Firefox')
		{
			$("#webdav_Shared_Upload_Button").replaceWith("<span class='btnWrp' id='webdav_Shared_Upload_Button' style='width:86px;'><input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1260; filter:alpha(opacity:0);opacity: 0;'/><input type='button' id='webdavSharedUpload' value='Upload' style='width:86px;'/></span>");
			document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
			//$("#WebdavSharedFileToUpload").replaceWith("<input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1080px; filter:alpha(opacity:0);opacity: 0;' />");
		}else if(isBrowser()=='Chrome')
		{
			$("#webdav_Shared_Upload_Button").replaceWith("<span class='btnWrp' id='webdav_Shared_Upload_Button' style='width:86px;'><input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1260; filter:alpha(opacity:0);opacity: 0;'/><input type='button' id='webdavSharedUpload' value='Upload' style='width:86px;'/></span>");
			document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
			//$("#WebdavSharedFileToUpload").replaceWith("<input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1180px; filter:alpha(opacity:0);opacity: 0;' />");
		}
		else
		{
			$("#webdav_Shared_Upload_Button").replaceWith("<span class='btnWrp' id='webdav_Shared_Upload_Button' style='width:86px;'><input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1260; filter:alpha(opacity:0);opacity: 0;'/><input type='button' id='webdavSharedUpload' value='Upload' style='width:86px;'/></span>");
			document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
			//$("#WebdavSharedFileToUpload").replaceWith("<input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1180px; filter:alpha(opacity:0);opacity: 0;' />");
		}
		*/
		return;
	}
	if(Shared_Pause_flag==1)
	{
		return;
	}
	else
	{
		if(Shared_ToSize==Shared_total_file_size )
		{	
			Shared_fromSize=0;
			Shared_ToSize=0;
			document.getElementById("bar").style.width = 100 + "%"; 
			document.getElementById("bar").innerHTML = document.getElementById("bar").style.width;
			setTimeout("clear_upload_barview_function();",800);
			var pro_path=WebDav_chines_utf8(Shared_Path_Name);
			WebDav_Shared_PROPFIND(pro_path);
			/*
			if(isBrowser()=='Firefox')
			{
								
			    $("#webdav_Shared_Upload_Button").replaceWith("<span class='btnWrp' id='webdav_Shared_Upload_Button' style='width:86px;'><input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1260; filter:alpha(opacity:0);opacity: 0;'/><input type='button' id='webdavSharedUpload' value='Upload' style='width:86px;'/></span>");
				document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
				//$("#WebdavSharedFileToUpload").replaceWith("<input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1080px; filter:alpha(opacity:0);opacity: 0;' />");
			}else if(isBrowser()=='Chrome')
			{
				$("#webdav_Shared_Upload_Button").replaceWith("<span class='btnWrp' id='webdav_Shared_Upload_Button' style='width:86px;'><input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1260; filter:alpha(opacity:0);opacity: 0;'/><input type='button' id='webdavSharedUpload' value='Upload' style='width:86px;'/></span>");
				document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
				//$("#WebdavSharedFileToUpload").replaceWith("<input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1180px; filter:alpha(opacity:0);opacity: 0;' />");
			}
			else
			{
				$("#webdav_Shared_Upload_Button").replaceWith("<span class='btnWrp' id='webdav_Shared_Upload_Button' style='width:86px;'><input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1260; filter:alpha(opacity:0);opacity: 0;'/><input type='button' id='webdavSharedUpload' value='Upload' style='width:86px;'/></span>");
				document.getElementById('webdavSharedUpload').value = jQuery.i18n.prop("webdavUpload");
				//$("#WebdavSharedFileToUpload").replaceWith("<input type='file' name='WebdavSharedFileToUpload' id='WebdavSharedFileToUpload' style='position:absolute; width:80px;height:30px;left:1180px; filter:alpha(opacity:0);opacity: 0;' />");
			}
			*/
		}
		else
		{
			var bar_length;
			bar_length=Math.floor((Shared_ToSize/Shared_total_file_size)*100);
				document.getElementById("bar").style.width = bar_length + "%"; 
				document.getElementById("bar").innerHTML = document.getElementById("bar").style.width;
			WebDav_Shared_Upload();
		}
	}				

}


function WebDav_Shared_Upload() 
{
	
	var file = document.getElementById('WebdavSharedFileToUpload').files[0];
		if (window.FileReader )
		{
	  		if(file) 
	 		{ 	
	 			Shared_total_file_size=file.size;
	 			Shared_fromSize=Shared_ToSize;
	 			Shared_ToSize=Shared_ToSize+64 * 1024;
				if(Shared_ToSize>file.size)
				{
					Shared_ToSize=file.size;
				}
	 				
				var reader = new FileReader(); 	
				var blob;
				if(file.webkitSlice) 
				{
		     	 	blob = file.webkitSlice(Shared_fromSize, Shared_ToSize);
		   		}
		    	else if (file.mozSlice) 
		    	{
		      		blob = file.mozSlice(Shared_fromSize, Shared_ToSize );
		    	}
		    	else
		    	{
		    		blob=file.slice(Shared_fromSize,Shared_ToSize);
		    	}
				reader.onprogress=function(p)
				{
						
					if (p.loaded) {
					}
					else {
					}
				}
				reader.onloadend = function() 
		 		{ 
					if(isBrowser()=='IE'){
						WebDav_Shared_PutSyncXML_IE11(Shared_Path_Name+file.name,file.type,Shared_fromSize,Shared_ToSize,file.size,reader.result);
					}else{
						WebDav_Shared_PutSyncXML(Shared_Path_Name+file.name,file.type,Shared_fromSize,Shared_ToSize,file.size,reader.result);
					}
		 			if (reader.error) 
		 			{ 
					} 
					else 
					{
					}
		 		} 
			    if(isBrowser()=='IE')
	 			{ 			
	 				reader.readAsArrayBuffer(blob);
	 			}
	 			else
	 			{
	 				reader.readAsBinaryString(blob); 
	 			}						
	 		}
		}
		else
		{
			showAlert("lupdateBrowser");
			return;
		}

		
}

