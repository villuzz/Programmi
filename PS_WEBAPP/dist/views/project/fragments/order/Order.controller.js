sap.ui.define(["epta/ps/views/project/Project.controller","sap/ui/model/json/JSONModel","epta/ps/model/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,o,r,a){"use strict";return e.extend("epta.ps.views.project.fragments.order.Order",{formatter:o,_oInputBinding:null,onInit:function(){this.setModel(new t,"_dprog");this._controller=this.getView().getControllerName()},onBeforeRendering:function(){this.getModel("layout").setProperty("/footer/save",false);this.getModel("layout").setProperty("/footer/cancel",false);this.getModel("layout").setProperty("/footer/filter",false);this.getModel("layout").setProperty("/footer/enabled",true)},callDisplayBilling:function(e){var t={target:{semanticObject:"ZVA03_WBS",action:"display"},params:{SalesOrder:e.getSource().getText()}};this.callTransaction(t)},callTransaction:function(e){var t=sap.ushell.Container.getService("CrossApplicationNavigation");var o=t&&t.hrefForExternal(e);t.toExternal({target:{shellHash:o}})}})});