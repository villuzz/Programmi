sap.ui.define(["sap/ui/core/format/DateFormat"],function(e){"use strict";return{numberUnit:function(e){if(!e){return""}return parseFloat(e).toFixed(2)},isAddVisible:function(e){return e},isCancelVisible:function(e){return e},isSaveVisible:function(e){return e},isFilterVisible:function(e){return e},isFooterVisible:function(e){return e},projectStatusText:function(e){switch(e){case"O":return"On Time";case"W":return"Warning";case"D":return"Delayed";default:return""}},projectStatus:function(e){switch(e){case"O":return"Success";case"W":return"Warning";case"D":return"Error";default:return"Information"}},toFixed2:function(e){return parseFloat(e).toFixed(2)},dateToString:function(e){e=new Date(e);var t=e.getFullYear(),n=("0"+e.getMonth()).substr(-2),r=("0"+e.getDate()).substr(-2);return t+n+r+"000000"},parseValueToInt:function(e){return e!==undefined?parseInt(e,10):null},isNotZero:function(e){return(e!==undefined?parseInt(e,10):0)!==0},isNotNull:function(e){return e!==null},visibleVbeln:function(e){if(e===0||e===""||e===null||e===undefined){return false}else{return true}},DateSet:function(t){if(t===0||t===""||t==="00000000"||t===null||t===undefined){return""}else{var n=new Date;n.setMonth(t.substring(4,6)-1);n.setDate(t.substring(6,8));n.setFullYear(t.substring(0,4));var r={style:"medium"};var u=e.getDateInstance(r);return u.format(n)}}}});