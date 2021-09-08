/*global location history */
sap.ui.define([
		"epta/ps/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("epta.ps.views.search.Search", {
			
			onInit : function() {
				this.getView().setModel(new JSONModel({
					"enable": false,
					"project": ""
				}), "footer");
			},
			
			onViewDetails : function(oEvent) {
				var sProjectId = this.getView().getModel("footer").getProperty("/project");
				
				if( typeof sProjectId === "undefined" ) {
					return;
				}
				
				// Navigate to detail page
				this.getRouter().navTo("project", {
					projectId: sProjectId
				});
			}
			
		});
	}
);