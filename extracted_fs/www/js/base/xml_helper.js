
/*
 * MAP对象，实现MAP功能
 *
 * 接口：
 * size()     获取MAP元素个数
 * isEmpty()    判断MAP是否为空
 * clear()     删除MAP所有元素
 * put(key, value)   向MAP中增加元素（key, value) 
 * remove(key)    删除指定KEY的元素，成功返回True，失败返回False
 * get(key)    获取指定KEY的元素值VALUE，失败返回NULL
 * element(index)   获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
 * containsKey(key)  判断MAP中是否含有指定KEY的元素
 * containsValue(value) 判断MAP中是否含有指定VALUE的元素
 * values()    获取MAP中所有VALUE的数组（ARRAY）
 * keys()     获取MAP中所有KEY的数组（ARRAY）
 *
 * 例子：
 * var map = new Map();
 *
 * map.put("key", "value");
 * var val = map.get("key")
 * ……
 *
 */
function Map() {
    this.elements = new Array();
 
    //获取MAP元素个数
    this.size = function() {
        return this.elements.length;
    }

	
    //判断MAP是否为空
    this.isEmpty = function() {
        return (this.elements.length < 1);
    }
 
    //删除MAP所有元素
    this.clear = function() {
        this.elements = new Array();
    }
 
    //向MAP中增加元素（key, value) 
    this.put = function(_key, _value) {
        this.elements.push( {
            key : _key,
            value : _value
        });
    }
 
    //删除指定KEY的元素，成功返回True，失败返回False
    this.remove = function(_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    }

	//
	this.setKeyValue = function(_key,_value){
		for (i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == _key) {
                this.elements[i].value = _value;
				break;
            }
        }
	}
 
    //获取指定KEY的元素值VALUE，失败返回NULL
    this.get = function(_key) {
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    return this.elements[i].value;
                }
            }
        } catch (e) {
            return null;
        }
    }
 
    //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
    this.element = function(_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index];
    }

	    //获取指定索引的key，失败返回NULL
    this.getKey = function(_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index].key;
    }

		 //获取指定索引的value，失败返回NULL
    this.getValue = function(_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index].value;
    }
 
    //判断MAP中是否含有指定KEY的元素
    this.containsKey = function(_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    }
 
    //判断MAP中是否含有指定VALUE的元素
    this.containsValue = function(_value) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    }
 
    //获取MAP中所有VALUE的数组（ARRAY）
    this.values = function() {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    }
 
    //获取MAP中所有KEY的数组（ARRAY）
    this.keys = function() {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    }
 
	//copy map
	this.copy = function(){
		var _newMap = new Map();
		for(var i = 0; i < this.size(); ++i)
		{
			_newMap.put(this.element(i).key, this.element(i).value);
		}
		return _newMap;
	}

	//返回和_map中value不同的element,
	this.getChange = function(_map){
		var _newMap = new Map;
		for(var i = 0; i < this.size(); ++i)
		{
			var _value = _map.get(this.element(i).key); //获取相同key在_map中对应的value
			if(null == _value || undefined == _value) //_map中不存在
			{
				/*var errMsg = "Error: Key \"" + _map.element(i).key + "\" only exists on one map."
				alert(errMsg);
				return null;*/
				_newMap.put(this.element(i).key,this.element(i).value);
				continue;
			}
			if(_value != this.element(i).value)
			{
				_newMap.put(this.element(i).key,this.element(i).value);
			}
		}
		return _newMap;
	}


	//在头部增加element
	this.push_front = function(_key, _value){

        this.elements.splice(0,0, {
			key : _key,
            value : _value});	
	}
	
}



(function ($) {

    $.fn.XML_Operations = function () {
        var text='<?xml version="1.0" encoding="US-ASCII"?>';
        // Opera implicitly add the xml tag so no need to do it again.
        if(window.opera)
            text='';
        this.getXMLDOC = function () {

            var xmlDoc;
            if (window.DOMParser) {
                parser=new DOMParser();
                xmlDoc=parser.parseFromString("<RGW></RGW>","text/xml");
            } else { // Internet Explorer
                xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async="false";
                xmlDoc.loadXML("<RGW></RGW>");
            }
            return xmlDoc;
        }
        this.getXMLDOCVersion = function(text) {
            var xmlDoc;
            if (window.DOMParser) {
                parser=new DOMParser();
                xmlDoc=parser.parseFromString(text,"text/xml");
            } else { // Internet Explorer
                xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async="false";
                xmlDoc.loadXML(text);
            }
            return xmlDoc;
        }
        this.getInternetExplorerVersion = function() {
            var rv = -1; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat( RegExp.$1 );
            }
            return rv;
        }
        this.getXMLDocToString = function (oXML) {
            var xmlString="";

            if (window.ActiveXObject) {
                var ver = g_objXML.getInternetExplorerVersion();
                if ( ver > -1 ) {
                    if (ver <= 8.0)
                        xmlString = oXML.xml;
                    else
                        xmlString = (new XMLSerializer()).serializeToString(oXML);
                }
            } else {
                xmlString = (new XMLSerializer()).serializeToString(oXML);
            }
            return text + " " + xmlString;
        }
        this.createNode = function (xmlDoc,parent,element,value) {
            var newel=xmlDoc.createElement(element);
            if(value!=null) {
                var _value = xmlDoc.createTextNode(value);
                newel.appendChild(_value);
            }
            var _element=xmlDoc.getElementsByTagName(parent);
            _element[0].appendChild(newel);
            return xmlDoc;
        }

        this.createItemNode = function (xmlDoc,parent,element,value,index) {
            var newel=xmlDoc.createElement(element);
            if(value!=null) {
                // var _value = xmlDoc.createTextNode(value);
                //  newel.appendChild(_value);
                newel.setAttribute("index", index);
            }
            var _element=xmlDoc.getElementsByTagName(parent);

            _element[0].appendChild(newel);
            return xmlDoc;
        }
        this.createDeleteNode = function (xmlDoc,parent,element,value,index) {
            var newel=xmlDoc.createElement(element);
            if(value!=null) {
                var _value = xmlDoc.createTextNode(value);
                newel.appendChild(_value);
                newel.setAttribute("Delete", 1);
            }
            var _element=xmlDoc.getElementsByTagName(parent);

            _element[0].appendChild(newel);
            return xmlDoc;
        }

        this.childExist = function (xmlDoc,child) {
            var _element=xmlDoc.getElementsByTagName(child);
            if(_element[0]!=null)
                return true;
            else
                return false;
        }
       
		this.createXML = function(controlMap) {

            var xmlDoc = this.getXMLDOC(text);			
            for(var i=0; i<controlMap.size(); i++) {
                var j;
                if(controlMap.element(i)!=null) {
					var _key = controlMap.element(i).key;
					var _value = controlMap.element(i).value;
                    var token = _key.split("/");
                    for(j=0; j<token.length-1; j++)
                        if(!this.childExist(xmlDoc,token[j]))
                            xmlDoc =  this.createNode(xmlDoc,token[j-1],token[j],null);

                    if(token[j].indexOf("#index")!=-1) {
                        var cNode=token[j].substring(0,token[j].indexOf("#index"));
                        xmlDoc = this.createItemNode(xmlDoc,token[j-1],cNode,_value,i);
                    } else if(token[j].indexOf("#delete")!=-1) {
                        var deleteNode=token[j].substring(0,token[j].indexOf("#delete"));
                        xmlDoc = this.createDeleteNode(xmlDoc,token[j-1],deleteNode,_value,i);
                    } else {
                        xmlDoc = this.createNode(xmlDoc,token[j-1],token[j],_value);
                    }

                }
            }
            return xmlDoc;
        }        
      
        return this.each(function () {
        });
    }
})(jQuery);


function CreateXmlDocStr(controlMap){
	if(null == controlMap || undefined == controlMap){
		return "";
	}
	
	return $().XML_Operations().getXMLDocToString($().XML_Operations().createXML(controlMap));
}

