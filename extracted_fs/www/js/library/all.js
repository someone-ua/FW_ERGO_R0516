var Sort = (function () {
	var sort = {};
	sort.alphanumeric = function (a, b) {
		return (a == b) ? 0 : (a < b) ? -1 : 1
	};
	sort["default"] = sort.alphanumeric;
	sort.numeric_converter = function (separator) {
		return function (val) {
			if (typeof (val) == "string") {
				val = parseFloat(val.replace(/^[^\d\.]*([\d., ]+).*/g, "$1").replace(new RegExp("[^\\\d" + separator + "]", "g"),
					"").replace(/,/, ".")) || 0
			}
			return val || 0
		}
	};
	sort.numeric = function (a, b) {
		return sort.numeric.convert(a) - sort.numeric.convert(b)
	};
	sort.numeric.convert = sort.numeric_converter(".");
	sort.numeric_comma = function (a, b) {
		return sort.numeric_comma.convert(a) - sort.numeric_comma.convert(b)
	};
	sort.numeric_comma.convert = sort.numeric_converter(",");
	sort.ignorecase = function (a, b) {
		return sort.alphanumeric(sort.ignorecase.convert(a), sort.ignorecase.convert(b))
	};
	sort.ignorecase.convert = function (val) {
		if (val == null) {
			return ""
		}
		return ("" + val).toLowerCase()
	};
	sort.currency = sort.numeric;
	sort.currency_comma = sort.numeric_comma;
	sort.date = function (a, b) {
		return sort.numeric(sort.date.convert(a), sort.date.convert(b))
	};
	sort.date.fixYear = function (yr) {
		yr = +yr;
		if (yr < 50) {
			yr += 2000
		} else {
			if (yr < 100) {
				yr += 1900
			}
		}
		return yr
	};
	sort.date.formats = [{
		re: /(\d{2,4})-(\d{1,2})-(\d{1,2})/,
		f: function (x) {
			return (new Date(sort.date.fixYear(x[1]), +x[2], +x[3])).getTime()
		}
	}, {
		re: /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/,
		f: function (x) {
			return (new Date(sort.date.fixYear(x[3]), +x[1], +x[2])).getTime()
		}
	}, {
		re: /(.*\d{4}.*\d+:\d+\d+.*)/,
		f: function (x) {
			var d = new Date(x[1]);
			if (d) {
				return d.getTime()
			}
		}
	}];
	sort.date.convert = function (val) {
		var m, v, f = sort.date.formats;
		for (var i = 0, L = f.length; i < L; i++) {
			if (m = val.match(f[i].re)) {
				v = f[i].f(m);
				if (typeof (v) != "undefined") {
					return v
				}
			}
		}
		return 9999999999999
	};
	return sort
})();
var Table = (function () {
	function def(o) {
		return (typeof o != "undefined")
	}

	function hasClass(o, name) {
		return new RegExp("(^|\\s)" + name + "(\\s|$)").test(o.className)
	}

	function addClass(o, name) {
		var c = o.className || "";
		if (def(c) && !hasClass(o, name)) {
			o.className += (c ? " " : "") + name
		}
	}

	function removeClass(o, name) {
		var c = o.className || "";
		o.className = c.replace(new RegExp("(^|\\s)" + name + "(\\s|$)"), "$1")
	}

	function classValue(o, prefix) {
		var c = o.className;
		if (c.match(new RegExp("(^|\\s)" + prefix + "([^ ]+)"))) {
			return RegExp.$2
		}
		return null
	}

	function isHidden(o) {
		if (window.getComputedStyle) {
			var cs = window.getComputedStyle;
			return (isHidden = function (o) {
				return "none" == cs(o, null).getPropertyValue("display")
			})(o)
		} else {
			if (window.currentStyle) {
				return (isHidden = function (o) {
					return "none" == o.currentStyle["display"]
				})(o)
			}
		}
		return (isHidden = function (o) {
			return "none" == o.style["display"]
		})(o)
	}

	function getParent(o, a, b) {
		if (o != null && o.nodeName) {
			if (o.nodeName == a || (b && o.nodeName == b)) {
				return o
			}
			while (o = o.parentNode) {
				if (o.nodeName && (o.nodeName == a || (b && o.nodeName == b))) {
					return o
				}
			}
		}
		return null
	}

	function copy(o1, o2) {
		for (var i = 2; i < arguments.length; i++) {
			var a = arguments[i];
			if (def(o1[a])) {
				o2[a] = o1[a]
			}
		}
	}
	var table = {
		AutoStripeClassName: "table-autostripe",
		StripeClassNamePrefix: "table-stripeclass:",
		AutoSortClassName: "table-autosort",
		AutoSortColumnPrefix: "table-autosort:",
		AutoSortTitle: "Click to sort",
		SortedAscendingClassName: "table-sorted-asc",
		SortedDescendingClassName: "table-sorted-desc",
		SortableClassName: "table-sortable",
		SortableColumnPrefix: "table-sortable:",
		NoSortClassName: "table-nosort",
		AutoFilterClassName: "table-autofilter",
		FilteredClassName: "table-filtered",
		FilterableClassName: "table-filterable",
		FilteredRowcountPrefix: "table-filtered-rowcount:",
		RowcountPrefix: "table-rowcount:",
		FilterAllLabel: "Filter: All",
		AutoPageSizePrefix: "table-autopage:",
		AutoPageJumpPrefix: "table-page:",
		PageNumberPrefix: "table-page-number:",
		PageCountPrefix: "table-page-count:"
	};
	table.tabledata = {};
	table.uniqueId = 1;
	table.resolve = function (o, args) {
		if (o != null && o.nodeName && o.nodeName != "TABLE") {
			o = getParent(o, "TABLE")
		}
		if (o == null) {
			return null
		}
		if (!o.id) {
			var id = null;
			do {
				var id = "TABLE_" + (table.uniqueId++)
			} while (document.getElementById(id) != null);
			o.id = id
		}
		this.tabledata[o.id] = this.tabledata[o.id] || {};
		if (args) {
			copy(args, this.tabledata[o.id], "stripeclass", "ignorehiddenrows", "useinnertext", "sorttype", "col", "desc",
				"page", "pagesize")
		}
		return o
	};
	table.processTableCells = function (t, type, func, arg) {
		t = this.resolve(t);
		if (t == null) {
			return
		}
		if (type != "TFOOT") {
			this.processCells(t.tHead, func, arg)
		}
		if (type != "THEAD") {
			this.processCells(t.tFoot, func, arg)
		}
	};
	table.processCells = function (section, func, arg) {
		if (section != null) {
			if (section.rows && section.rows.length && section.rows.length > 0) {
				var rows = section.rows;
				for (var j = 0, L2 = rows.length; j < L2; j++) {
					var row = rows[j];
					if (row.cells && row.cells.length && row.cells.length > 0) {
						var cells = row.cells;
						for (var k = 0, L3 = cells.length; k < L3; k++) {
							var cellsK = cells[k];
							func.call(this, cellsK, arg)
						}
					}
				}
			}
		}
	};
	table.getCellIndex = function (td) {
		var tr = td.parentNode;
		var cells = tr.cells;
		if (cells && cells.length) {
			if (cells.length > 1 && cells[cells.length - 1].cellIndex > 0) {
				(this.getCellIndex = function (td) {
					return td.cellIndex
				})(td)
			}
			for (var i = 0, L = cells.length; i < L; i++) {
				if (tr.cells[i] == td) {
					return i
				}
			}
		}
		return 0
	};
	table.nodeValue = {
		"INPUT": function (node) {
			if (def(node.value) && node.type && ((node.type != "checkbox" && node.type != "radio") || node.checked)) {
				return node.value
			}
			return ""
		},
		"SELECT": function (node) {
			if (node.selectedIndex >= 0 && node.options) {
				return node.options[node.selectedIndex].text
			}
			return ""
		},
		"IMG": function (node) {
			return node.name || ""
		}
	};
	table.getCellValue = function (td, useInnerText) {
		if (useInnerText && def(td.innerText)) {
			return td.innerText
		}
		if (!td.childNodes) {
			return ""
		}
		var childNodes = td.childNodes;
		var ret = "";
		for (var i = 0, L = childNodes.length; i < L; i++) {
			var node = childNodes[i];
			var type = node.nodeType;
			if (type == 1) {
				var nname = node.nodeName;
				if (this.nodeValue[nname]) {
					ret += this.nodeValue[nname](node)
				} else {
					ret += this.getCellValue(node)
				}
			} else {
				if (type == 3) {
					if (def(node.innerText)) {
						ret += node.innerText
					} else {
						if (def(node.nodeValue)) {
							ret += node.nodeValue
						}
					}
				}
			}
		}
		return ret
	};
	table.tableHeaderIndexes = {};
	table.getActualCellIndex = function (tableCellObj) {
		if (!def(tableCellObj.cellIndex)) {
			return null
		}
		var tableObj = getParent(tableCellObj, "TABLE");
		var cellCoordinates = tableCellObj.parentNode.rowIndex + "-" + this.getCellIndex(tableCellObj);
		if (def(this.tableHeaderIndexes[tableObj.id])) {
			return this.tableHeaderIndexes[tableObj.id][cellCoordinates]
		}
		var matrix = [];
		this.tableHeaderIndexes[tableObj.id] = {};
		var thead = getParent(tableCellObj, "THEAD");
		var trs = thead.getElementsByTagName("TR");
		for (var i = 0; i < trs.length; i++) {
			var cells = trs[i].cells;
			for (var j = 0; j < cells.length; j++) {
				var c = cells[j];
				var rowIndex = c.parentNode.rowIndex;
				var cellId = rowIndex + "-" + this.getCellIndex(c);
				var rowSpan = c.rowSpan || 1;
				var colSpan = c.colSpan || 1;
				var firstAvailCol;
				if (!def(matrix[rowIndex])) {
					matrix[rowIndex] = []
				}
				var m = matrix[rowIndex];
				for (var k = 0; k < m.length + 1; k++) {
					if (!def(m[k])) {
						firstAvailCol = k;
						break
					}
				}
				this.tableHeaderIndexes[tableObj.id][cellId] = firstAvailCol;
				for (var k = rowIndex; k < rowIndex + rowSpan; k++) {
					if (!def(matrix[k])) {
						matrix[k] = []
					}
					var matrixrow = matrix[k];
					for (var l = firstAvailCol; l < firstAvailCol + colSpan; l++) {
						matrixrow[l] = "x"
					}
				}
			}
		}
		return this.tableHeaderIndexes[tableObj.id][cellCoordinates]
	};
	table.sort = function (o, args) {
		var t, tdata, sortconvert = null;
		if (typeof (args) == "function") {
			args = {
				sorttype: args
			}
		}
		args = args || {};
		if (!def(args.col)) {
			args.col = this.getActualCellIndex(o) || 0
		}
		args.sorttype = args.sorttype || Sort["default"];
		t = this.resolve(o, args);
		tdata = this.tabledata[t.id];
		if (args.re_sort) {
			tdata.desc = tdata.lastdesc
		} else {
			if (def(tdata.lastcol) && tdata.lastcol == tdata.col && def(tdata.lastdesc)) {
				tdata.desc = !tdata.lastdesc
			} else {
				tdata.desc = !!args.desc
			}
		}
		tdata.lastcol = tdata.col;
		tdata.lastdesc = !!tdata.desc;
		var sorttype = tdata.sorttype;
		if (typeof (sorttype.convert) == "function") {
			sortconvert = tdata.sorttype.convert;
			sorttype = Sort.alphanumeric
		}
		this.processTableCells(t, "THEAD", function (cell) {
			if (hasClass(cell, this.SortableClassName)) {
				removeClass(cell, this.SortedAscendingClassName);
				removeClass(cell, this.SortedDescendingClassName);
				if (tdata.col == table.getActualCellIndex(cell) && (classValue(cell, table.SortableClassName))) {
					addClass(cell, tdata.desc ? this.SortedAscendingClassName : this.SortedDescendingClassName)
				}
			}
		});
		var bodies = t.tBodies;
		if (bodies == null || bodies.length == 0) {
			return
		}
		var newSortFunc = (tdata.desc) ? function (a, b) {
			return sorttype(b[0], a[0])
		} : function (a, b) {
			return sorttype(a[0], b[0])
		};
		var useinnertext = !!tdata.useinnertext;
		var col = tdata.col;
		for (var i = 0, L = bodies.length; i < L; i++) {
			var tb = bodies[i],
				tbrows = tb.rows,
				rows = [];
			if (!hasClass(tb, table.NoSortClassName)) {
				var cRow, cRowIndex = 0;
				if (cRow = tbrows[cRowIndex]) {
					do {
						if (rowCells = cRow.cells) {
							var cellValue = (col < rowCells.length) ? this.getCellValue(rowCells[col], useinnertext) : null;
							if (sortconvert) {
								cellValue = sortconvert(cellValue)
							}
							rows[cRowIndex] = [cellValue, tbrows[cRowIndex]]
						}
					} while (cRow = tbrows[++cRowIndex])
				}
				rows.sort(newSortFunc);
				cRowIndex = 0;
				var displayedCount = 0;
				var f = [removeClass, addClass];
				if (cRow = rows[cRowIndex]) {
					do {
						tb.appendChild(cRow[1])
					} while (cRow = rows[++cRowIndex])
				}
			}
		}
		if (tdata.pagesize) {
			this.page(t)
		} else {
			if (tdata.stripeclass) {
				this.stripe(t, tdata.stripeclass, !!tdata.ignorehiddenrows)
			}
		}
	};
	table.filter = function (o, filters, args) {
		var cell;
		args = args || {};
		var t = this.resolve(o, args);
		var tdata = this.tabledata[t.id];
		if (!filters) {
			tdata.filters = null
		} else {
			if (filters.nodeName == "SELECT" && filters.type == "select-one" && filters.selectedIndex > -1) {
				filters = {
					"filter": filters.options[filters.selectedIndex].value
				}
			}
			if (filters.nodeName == "INPUT" && filters.type == "text") {
				filters = {
					"filter": "/^" + filters.value + "/"
				}
			}
			if (typeof (filters) == "object" && !filters.length) {
				filters = [filters]
			}
			for (var i = 0, L = filters.length; i < L; i++) {
				var filter = filters[i];
				if (typeof (filter.filter) == "string") {
					if (filter.filter.match(/^\/(.*)\/$/)) {
						filter.filter = new RegExp(RegExp.$1);
						filter.filter.regex = true
					} else {
						if (filter.filter.match(/^function\s*\(([^\)]*)\)\s*\{(.*)}\s*$/)) {
							filter.filter = Function(RegExp.$1, RegExp.$2)
						}
					}
				}
				if (filter && !def(filter.col) && (cell = getParent(o, "TD", "TH"))) {
					filter.col = this.getCellIndex(cell)
				}
				if ((!filter || !filter.filter) && tdata.filters) {
					delete tdata.filters[filter.col]
				} else {
					tdata.filters = tdata.filters || {};
					tdata.filters[filter.col] = filter.filter
				}
			}
			for (var j in tdata.filters) {
				var keep = true
			}
			if (!keep) {
				tdata.filters = null
			}
		}
		return table.scrape(o)
	};
	table.page = function (t, page, args) {
		args = args || {};
		if (def(page)) {
			args.page = page
		}
		return table.scrape(t, args)
	};
	table.pageJump = function (t, count, args) {
		t = this.resolve(t, args);
		return this.page(t, (table.tabledata[t.id].page || 0) + count, args)
	};
	table.pageNext = function (t, args) {
		return this.pageJump(t, 1, args)
	};
	table.pagePrevious = function (t, args) {
		return this.pageJump(t, -1, args)
	};
	table.scrape = function (o, args) {
		var col, cell, filterList, filterReset = false,
			filter;
		var page, pagesize, pagestart, pageend;
		var unfilteredrows = [],
			unfilteredrowcount = 0,
			totalrows = 0;
		var t, tdata, row, hideRow;
		args = args || {};
		t = this.resolve(o, args);
		tdata = this.tabledata[t.id];
		var page = tdata.page;
		if (def(page)) {
			if (page < 0) {
				tdata.page = page = 0
			}
			pagesize = tdata.pagesize || 25;
			pagestart = page * pagesize + 1;
			pageend = pagestart + pagesize - 1
		}
		var bodies = t.tBodies;
		if (bodies == null || bodies.length == 0) {
			return
		}
		for (var i = 0, L = bodies.length; i < L; i++) {
			var tb = bodies[i];
			for (var j = 0, L2 = tb.rows.length; j < L2; j++) {
				row = tb.rows[j];
				hideRow = false;
				if (tdata.filters && row.cells) {
					var cells = row.cells;
					var cellsLength = cells.length;
					for (col in tdata.filters) {
						if (!hideRow) {
							filter = tdata.filters[col];
							if (filter && col < cellsLength) {
								var val = this.getCellValue(cells[col]);
								if (filter.regex && val.search) {
									hideRow = (val.search(filter) < 0)
								} else {
									if (typeof (filter) == "function") {
										hideRow = !filter(val, cells[col])
									} else {
										hideRow = (val != filter)
									}
								}
							}
						}
					}
				}
				totalrows++;
				if (!hideRow) {
					unfilteredrowcount++;
					if (def(page)) {
						unfilteredrows.push(row);
						if (unfilteredrowcount < pagestart || unfilteredrowcount > pageend) {
							hideRow = true
						}
					}
				}
				row.style.display = hideRow ? "none" : ""
			}
		}
		if (def(page)) {
			if (pagestart >= unfilteredrowcount) {
				pagestart = unfilteredrowcount - (unfilteredrowcount % pagesize);
				tdata.page = page = pagestart / pagesize;
				for (var i = pagestart, L = unfilteredrows.length; i < L; i++) {
					unfilteredrows[i].style.display = ""
				}
			}
		}
		this.processTableCells(t, "THEAD", function (c) {
			((tdata.filters && def(tdata.filters[table.getCellIndex(c)]) && hasClass(c, table.FilterableClassName)) ?
				addClass : removeClass)(c, table.FilteredClassName)
		});
		if (tdata.stripeclass) {
			this.stripe(t)
		}
		var pagecount = Math.floor(unfilteredrowcount / pagesize) + 1;
		if (def(page)) {
			if (tdata.container_number) {
				tdata.container_number.innerHTML = page + 1
			}
			if (tdata.container_count) {
				tdata.container_count.innerHTML = pagecount
			}
		}
		if (tdata.container_filtered_count) {
			tdata.container_filtered_count.innerHTML = unfilteredrowcount
		}
		if (tdata.container_all_count) {
			tdata.container_all_count.innerHTML = totalrows
		}
		return {
			"data": tdata,
			"unfilteredcount": unfilteredrowcount,
			"total": totalrows,
			"pagecount": pagecount,
			"page": page,
			"pagesize": pagesize
		}
	};
	table.stripe = function (t, className, args) {
		args = args || {};
		args.stripeclass = className;
		t = this.resolve(t, args);
		var tdata = this.tabledata[t.id];
		var bodies = t.tBodies;
		if (bodies == null || bodies.length == 0) {
			return
		}
		className = tdata.stripeclass;
		var f = [removeClass, addClass];
		for (var i = 0, L = bodies.length; i < L; i++) {
			var tb = bodies[i],
				tbrows = tb.rows,
				cRowIndex = 0,
				cRow, displayedCount = 0;
			if (cRow = tbrows[cRowIndex]) {
				if (tdata.ignoreHiddenRows) {
					do {
						f[displayedCount++ % 2](cRow, className)
					} while (cRow = tbrows[++cRowIndex])
				} else {
					do {
						if (!isHidden(cRow)) {
							f[displayedCount++ % 2](cRow, className)
						}
					} while (cRow = tbrows[++cRowIndex])
				}
			}
		}
	};
	table.getUniqueColValues = function (t, col) {
		var values = {},
			bodies = this.resolve(t).tBodies;
		for (var i = 0, L = bodies.length; i < L; i++) {
			var tbody = bodies[i];
			for (var r = 0, L2 = tbody.rows.length; r < L2; r++) {
				values[this.getCellValue(tbody.rows[r].cells[col])] = true
			}
		}
		var valArray = [];
		for (var val in values) {
			valArray.push(val)
		}
		return valArray.sort()
	};
	table.auto = function (args) {
		var cells = [],
			tables = document.getElementsByTagName("TABLE");
		var val, tdata;
		if (tables != null) {
			for (var i = 0, L = tables.length; i < L; i++) {
				var t = table.resolve(tables[i]);
				tdata = table.tabledata[t.id];
				if (val = classValue(t, table.StripeClassNamePrefix)) {
					tdata.stripeclass = val
				}
				if (hasClass(t, table.AutoFilterClassName)) {
					table.autofilter(t)
				}
				if (val = classValue(t, table.AutoPageSizePrefix)) {
					table.autopage(t, {
						"pagesize": +val
					})
				}
				if ((val = classValue(t, table.AutoSortColumnPrefix)) || (hasClass(t, table.AutoSortClassName))) {
					table.autosort(t, {
						"col": (val == null) ? null : +val
					})
				}
				if (tdata.stripeclass && hasClass(t, table.AutoStripeClassName)) {
					table.stripe(t)
				}
			}
		}
	};
	table.autosort = function (t, args) {
		t = this.resolve(t, args);
		var tdata = this.tabledata[t.id];
		this.processTableCells(t, "THEAD", function (c) {
			var type = classValue(c, table.SortableColumnPrefix);
			if (type != null) {
				type = type || "default";
				c.title = c.title || table.AutoSortTitle;
				addClass(c, table.SortableClassName);
				c.onclick = Function("", "Table.sort(this,{'sorttype':Sort['" + type + "']})");
				if (args.col != null) {
					if (args.col == table.getActualCellIndex(c)) {
						tdata.sorttype = Sort['"+type+"']
					}
				}
			}
		});
		if (args.col != null) {
			table.sort(t, args)
		}
	};
	table.autopage = function (t, args) {
		t = this.resolve(t, args);
		var tdata = this.tabledata[t.id];
		if (tdata.pagesize) {
			this.processTableCells(t, "THEAD,TFOOT", function (c) {
				var type = classValue(c, table.AutoPageJumpPrefix);
				if (type == "next") {
					type = 1
				} else {
					if (type == "previous") {
						type = -1
					}
				}
				if (type != null) {
					c.onclick = Function("", "Table.pageJump(this," + type + ")")
				}
			});
			if (val = classValue(t, table.PageNumberPrefix)) {
				tdata.container_number = document.getElementById(val)
			}
			if (val = classValue(t, table.PageCountPrefix)) {
				tdata.container_count = document.getElementById(val)
			}
			return table.page(t, 0, args)
		}
	};
	table.cancelBubble = function (e) {
		e = e || window.event;
		if (typeof (e.stopPropagation) == "function") {
			e.stopPropagation()
		}
		if (def(e.cancelBubble)) {
			e.cancelBubble = true
		}
	};
	table.autofilter = function (t, args) {
		args = args || {};
		t = this.resolve(t, args);
		var tdata = this.tabledata[t.id],
			val;
		table.processTableCells(t, "THEAD", function (cell) {
			if (hasClass(cell, table.FilterableClassName)) {
				var cellIndex = table.getCellIndex(cell);
				var colValues = table.getUniqueColValues(t, cellIndex);
				if (colValues.length > 0) {
					if (typeof (args.insert) == "function") {
						func.insert(cell, colValues)
					} else {
						var sel = '<select onchange="Table.filter(this,this)" onclick="Table.cancelBubble(event)" class="' + table.AutoFilterClassName +
							'"><option value="">' + table.FilterAllLabel + "</option>";
						for (var i = 0; i < colValues.length; i++) {
							sel += '<option value="' + colValues[i] + '">' + colValues[i] + "</option>"
						}
						sel += "</select>";
						cell.innerHTML += "<br>" + sel
					}
				}
			}
		});
		if (val = classValue(t, table.FilteredRowcountPrefix)) {
			tdata.container_filtered_count = document.getElementById(val)
		}
		if (val = classValue(t, table.RowcountPrefix)) {
			tdata.container_all_count = document.getElementById(val)
		}
	};
	if (typeof (jQuery) != "undefined") {
		jQuery(table.auto)
	} else {
		if (window.addEventListener) {
			window.addEventListener("load", table.auto, false)
		} else {
			if (window.attachEvent) {
				window.attachEvent("onload", table.auto)
			}
		}
	}
	return table
})();

function pageWidth() {
	return window.innerWidth != null ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ?
		document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null
}

function pageHeight() {
	return window.innerHeight != null ? window.innerHeight : document.documentElement && document.documentElement.clientHeight ?
		document.documentElement.clientHeight : document.body != null ? document.body.clientHeight : null
}

function posLeft() {
	return typeof window.pageXOffset != "undefined" ? window.pageXOffset : document.documentElement && document.documentElement
		.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0
}

function posTop() {
	return typeof window.pageYOffset != "undefined" ? window.pageYOffset : document.documentElement && document.documentElement
		.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0
}

function getID(x) {
	return document.getElementById(x)
}

function scrollFix() {
	var obol = getID("ol");
	obol.style.top = posTop() + "px";
	obol.style.left = posLeft() + "px"
}

function sizeFix() {
	var obol = getID("ol");
	obol.style.height = pageHeight() + "px";
	obol.style.width = pageWidth() + "px"
}

function kp(e) {
	ky = e ? e.which : event.keyCode;
	if (ky == 88 || ky == 120) {
		CloseDlg()
	}
	return false
}

function inf(h) {
	tag = document.getElementsByTagName("iframe");
	for (i = tag.length - 1; i >= 0; i--) {
		tag[i].style.visibility = h
	}
	tag = document.getElementsByTagName("object");
	for (i = tag.length - 1; i >= 0; i--) {
		tag[i].style.visibility = h
	}
}

function ShowDlg(dlgID, wd, ht) {
	if(isiOS){
		$("body").css({
		        position: "fixed",
				width:"100%"
		    })
	}
	var h = "hidden";
	var b = "block";
	var p = "px";
	var obol = document.getElementById("ol");
	var obbxd = document.getElementById("mbd");
	obbxd.innerHTML = getID(dlgID).innerHTML;
	obol.style.display = b;
	if(typeof(wd)=='string'){
		wd = pageWidth()*parseInt(wd)*0.01;
	}
	if(typeof(ht)=='string'){
		ht = pageHeight()*parseInt(ht)*0.01;
	}
	var obbx = getID("mbox");


	obbx.style.width = wd + p;
	obbx.style.height = ht + p;
	inf(h);
	obbx.style.display = b;
	if ("IE6" == GetBrowserType()) {
		$("#mbd").bgiframe()
	}
	return false
}

function CloseDlg() {
	if(isiOS){
		$("body").css({
		        position: "static",
				width:"auto"
		    })
	}
	var v = "visible";
	var n = "none";
	getID("ol").style.display = n;
	getID("mbox").style.display = n;
	inf(v);
	document.onkeypress = "";
	clearTimeout(timeout)
}

function initmb() {
	var ab = "absolute";
	var f = "fixed";
	var n = "none";
	var obody = document.getElementsByTagName("body")[0];
	var frag = document.createDocumentFragment();
	var obol = document.createElement("div");
	obol.setAttribute("id", "ol");
	frag.appendChild(obol);
	var obbx = document.createElement("div");
	obbx.setAttribute("id", "mbox");
	var obl = document.createElement("span");
	obbx.appendChild(obl);
	var obbxd = document.createElement("div");
	obbxd.setAttribute("id", "mbd");
	obl.appendChild(obbxd);
	frag.insertBefore(obbx, obol.nextSibling);
	obody.insertBefore(frag, obody.firstChild);
	window.onscroll = scrollFix;
	window.onresize = sizeFix
};
$.download = function (url, data, method, callback) {
	var inputs = "";
	var iframeX;
	var downloadInterval;
	if (url) {
		if ($("#iframeX")) {
			$("#iframeX").remove()
		}
		iframeX = $('<iframe src="[removed]false;" name="iframeX" id="iframeX"></iframe>').appendTo("body").hide();
		if ($.support.msie) {
			downloadInterval = setInterval(function () {
				if (iframeX && iframeX[0].readyState !== "loading") {
					if (undefined != callback) {
						callback()
					}
					clearInterval(downloadInterval)
				}
			}, 23)
		} else {
			iframeX.load(function () {
				if (undefined != callback) {
					callback()
				}
			})
		}
		jQuery.each(data.split("&"), function () {
			var pair = this.split("=");
			inputs += '<input type="hidden" name="' + pair[0] + '" value="' + pair[1] + '" />'
		});
		$('<form action="' + url + '" method="' + (method || "post") + '" target="iframeX">' + inputs + "</form>").appendTo(
			"body").submit().remove()
	}
};
var hexcase = 0;
var b64pad = "";
var chrsz = 8;

function hex_md5(s) {
	return binl2hex(core_md5(str2binl(s), s.length * chrsz))
}

function b64_md5(s) {
	return binl2b64(core_md5(str2binl(s), s.length * chrsz))
}

function str_md5(s) {
	return binl2str(core_md5(str2binl(s), s.length * chrsz))
}

function hex_hmac_md5(key, data) {
	return binl2hex(core_hmac_md5(key, data))
}

function b64_hmac_md5(key, data) {
	return binl2b64(core_hmac_md5(key, data))
}

function str_hmac_md5(key, data) {
	return binl2str(core_hmac_md5(key, data))
}

function md5_vm_test() {
	return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72"
}

function core_md5(x, len) {
	x[len >> 5] |= 128 << ((len) % 32);
	x[(((len + 64) >>> 9) << 4) + 14] = len;
	var a = 1732584193;
	var b = -271733879;
	var c = -1732584194;
	var d = 271733878;
	for (var i = 0; i < x.length; i += 16) {
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;
		a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
		d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
		c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
		b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
		a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
		d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
		c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
		b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
		a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
		d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
		c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
		b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
		a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
		d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
		c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
		b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
		a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
		d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
		c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
		b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
		a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
		d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
		c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
		b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
		a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
		d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
		c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
		b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
		a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
		d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
		c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
		b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
		a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
		d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
		c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
		b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
		a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
		d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
		c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
		b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
		a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
		d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
		c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
		b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
		a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
		d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
		c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
		b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
		a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
		d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
		c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
		b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
		a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
		d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
		c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
		b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
		a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
		d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
		c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
		b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
		a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
		d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
		c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
		b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
		a = safe_add(a, olda);
		b = safe_add(b, oldb);
		c = safe_add(c, oldc);
		d = safe_add(d, oldd)
	}
	return Array(a, b, c, d)
}

function md5_cmn(q, a, b, x, s, t) {
	return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
}

function md5_ff(a, b, c, d, x, s, t) {
	return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function md5_gg(a, b, c, d, x, s, t) {
	return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function md5_hh(a, b, c, d, x, s, t) {
	return md5_cmn(b ^ c ^ d, a, b, x, s, t)
}

function md5_ii(a, b, c, d, x, s, t) {
	return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
}

function core_hmac_md5(key, data) {
	var bkey = str2binl(key);
	if (bkey.length > 16) {
		bkey = core_md5(bkey, key.length * chrsz)
	}
	var ipad = Array(16),
		opad = Array(16);
	for (var i = 0; i < 16; i++) {
		ipad[i] = bkey[i] ^ 909522486;
		opad[i] = bkey[i] ^ 1549556828
	}
	var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
	return core_md5(opad.concat(hash), 512 + 128)
}

function safe_add(x, y) {
	var lsw = (x & 65535) + (y & 65535);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 65535)
}

function bit_rol(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt))
}

function str2binl(str) {
	var bin = Array();
	var mask = (1 << chrsz) - 1;
	for (var i = 0; i < str.length * chrsz; i += chrsz) {
		bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32)
	}
	return bin
}

function binl2str(bin) {
	var str = "";
	var mask = (1 << chrsz) - 1;
	for (var i = 0; i < bin.length * 32; i += chrsz) {
		str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask)
	}
	return str
}

function binl2hex(binarray) {
	var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	var str = "";
	for (var i = 0; i < binarray.length * 4; i++) {
		str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 15) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) *
			8)) & 15)
	}
	return str
}

function binl2b64(binarray) {
	var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var str = "";
	for (var i = 0; i < binarray.length * 4; i += 3) {
		var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 255) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 255) <<
			8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 255);
		for (var j = 0; j < 4; j++) {
			if (i * 8 + j * 6 > binarray.length * 32) {
				str += b64pad
			} else {
				str += tab.charAt((triplet >> 6 * (3 - j)) & 63)
			}
		}
	}
	return str
}

function md5_js_loaded() {
	return true
};
