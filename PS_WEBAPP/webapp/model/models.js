sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device"
	], function (JSONModel, Device) {
		"use strict";

		return {
			
			_browserStorage : jQuery.sap.storage.Type.local,

	/* =========================================================== */
	/* applicaiton models                                          */
	/* =========================================================== */

			createDeviceModel : function () {
				var oModel = new JSONModel(Device);
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},
			
			createGanttBaseModel : function () {
				return {
					root: {
						id: "root",
						level: "root",
						children: [],
						relationships: []
					},
					ganttStartTime: new Date(),
					ganttEndTime: new Date()
				};
			},

	/* =========================================================== */
	/* browser storage                                             */
	/* =========================================================== */
	
			/**
			 * Method to write inside the storage of the browser
			 * @public
			 * @params {string} sKey The key of the object
			 * @params {object} oData The data to be stored
			 */ 
			setIntoStorage : function (sKey, oData) {
				// Get Storage object to use
				var oStorage = jQuery.sap.storage(this._browserStorage);
				var sData = JSON.stringify(oData);
				// Set data into Storage
				oStorage.put(sKey, sData);
			},
			
			/**
			 * Method to read from the storage of the browser
			 * @public
			 * @params {string} sKey The key of the object
			 * @return {object} The object stored
			 */
			getFromStorage : function (sKey) {
				// Get Storage object to use
				var oStorage = jQuery.sap.storage(this._browserStorage);
				var sData = oStorage.get(sKey);
				// Get data from Storage
				return JSON.parse(sData);
			},
			
			/**
			 * Method to remove data from the storage of the browser
			 * @public
			 * @params {string} sKey The key of the object
			 */
			removeFromStorage : function (sKey) {
				// Get Storage object to use
				var oStorage = jQuery.sap.storage(this._browserStorage);
				// Rmove data from Storage
				oStorage.remove(sKey);
			},
			
			/**
			 * Method to clear the whole storage of the browser
			 * @public
			 */
			clearStorageData : function () {
				// Get Storage object to use
				var oStorage = jQuery.sap.storage(this._browserStorage);
				// Clear Storage
				oStorage.clear();
			}

		};

	}
);