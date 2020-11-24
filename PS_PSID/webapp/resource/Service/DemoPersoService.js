sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		var DemoPersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: []
			},

			getPersData: function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			resetPersData: function () {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns: []
				};

				//set personalization
				this._oBundle = oInitialData;
				oDeferred.resolve();
				return oDeferred.promise();
			},
			// getGroup: function (oColumn) {
			// 	if (oColumn.getId().indexOf('productCol') != -1 ||
			// 		oColumn.getId().indexOf('supplierCol') != -1) {
			// 		return "Primary Group";
			// 	}
			// 	return "Secondary Group";
			// }
		};

		return DemoPersoService;

	});