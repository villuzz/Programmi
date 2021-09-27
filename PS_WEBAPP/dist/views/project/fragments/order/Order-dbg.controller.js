/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";
		
		return BaseController.extend("epta.ps.views.project.fragments.order.Order", {
			formatter: formatter,
			_oInputBinding: null,
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.setModel(new JSONModel(), "_dprog");
				this._controller = this.getView().getControllerName();
			},
			
			/**
			 * Called before the page is rendered.
			 * @public
			 */
			onBeforeRendering : function () {
				this.getModel("layout").setProperty( "/footer/save", false );
				this.getModel("layout").setProperty( "/footer/cancel", false );
				this.getModel("layout").setProperty( "/footer/filter", false );
				this.getModel("layout").setProperty("/footer/enabled", true);
			},
			callDisplayBilling: function (oEvent) {
				var url = {
					target: {
						semanticObject: "ZVA03_WBS",
						action: "display"
					},
					params: {
						"SalesOrder": oEvent.getSource().getText()
					}
				};
				this.callTransaction(url);
	
			},
			callTransaction: function (url) {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal(url));
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hashUrl
					}
				});
			}
	
		});
	}
);