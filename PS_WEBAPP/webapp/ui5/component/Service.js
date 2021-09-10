sap.ui.define([
		"sap/ui/core/Component",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/odata/v2/ODataModel",
		"sap/ui/Device"
	], function(Component, JSONModel, ODataModel, Device) {
		"use strict";
		
		return Component.extend("epta.ps.ui5.component.Service", {
			
			_sGroupReadId : "read",
			_sGroupReadSearchId : "readSearch",
			_sGroupUpdateId : "update",
			_sGroupUpdateNoteId : "updateNote",
			_sGroupCreateId : "create",
			
			_oModel : undefined,
			_oChangeModel : undefined,
			
			_sVariantContainer : "",
			
			/**
			 * oData service object initialization
			 */
			initialize : function(oModel) {
				var self = this;
				this._oModel = oModel;
				
				this._oModel._handleError = function(oError, oRequest) {
					var mParameters = {}, /* fnHandler, */ sToken;
					var sErrorMsg = "The following problem occurred: " + oError.message;
					
					mParameters.message = oError.message;
					if (oError.response) {
						// Parse messages from the back-end
						this._parseResponse(oError.response, oRequest);
						sErrorMsg += oError.response.statusCode + "," +
						oError.response.statusText + "," +
						oError.response.body;
						//mParameters.statusCode = oError.response.statusCode;
						mParameters.statusCode = "404";
						mParameters.statusText = oError.response.statusText;
						mParameters.headers = oError.response.headers;
						// mParameters.responseText = oError.response.body;
						mParameters.responseText = "";
					}
					
					sap.ui.getCore().getEventBus().publish("_onODataModel", "error", {
						"type": "Error",
						"title": new Date().toString().substr(16,5) + " " + oRequest.requestUri,
						"message": JSON.parse(oError.response.body).error.message.value
					});
					
					return mParameters;
				};
				
				this._sVariantContainer = "";
				try {
					this._sVariantContainer = sap.ushell.Container.getService("UserInfo").getId();	
				} catch(e) {}
				
				// create group
				this._oModel.setDeferredGroups([this._sGroupReadId, this._sGroupReadSearchId, this._sGroupUpdateId, this._sGroupUpdateNoteId, this._sGroupCreateId]);
			},
			
			/**
			 * Return the oData Model
			 * @public
			 * @returns {sap.ui.model.odata.v2.ODataModel} oData Model
			 */
			getModel : function() {
				return this._oModel;
			},
			
			/**
			 * 
			 */
			saveData : function(args) {
				if ( typeof args.groupId === "undefined" ) {
					args.groupId = this._sGroupUpdateId;
				}
				// perform batch call
				this._oModel.submitChanges({
					groupId: args.groupId,
					success: function(oEvent){
						if ( typeof args.success === "function" ) { args.success(oEvent); }
					},
				    error: function(oEvent){
						if ( typeof args.error === "function" ) { args.error(oEvent); }
					}
				});
			},
			
			
	/* =========================================================== */
	/* OData Services - ZPS_WEBAPP_SRV                             */
	/* =========================================================== */
			
			readProjectSet : function(args) {
				
				var filters = [];
				
				// check input
				if ( typeof args.filters !== "undefined" ) {
					filters = args.filters;
				}
				
				// perform call
				this._oModel.read("/WBSProjectSet",{
					filters: filters,
					success: function(oEvent) {
						if ( typeof args.success === "function" ) { args.success(oEvent); }
					},
					error: function(oEvent) {
						if ( typeof args.error === "function" ) { args.error(oEvent); }
					}
				});
				
			},
			
			readProjectDataById : function(args) {
				
				// generate a unique id for the batch process
				var sGroup = this._sGroupReadId;
				
				// prepare call
				this._oModel.read("/WBSProjectSet('" + args.projectId + "')/ToHierarchy", {groupId: sGroup});
				this._oModel.read("/WBSProjectSet('" + args.projectId + "')/ToNetworkActivity", {groupId: sGroup});
				this._oModel.read("/WBSProjectSet('" + args.projectId + "')/ToProjectHeader", {groupId: sGroup});
				this._oModel.read("/WBSProjectSet('" + args.projectId + "')/ToWBSElementData", {groupId: sGroup});
				this._oModel.read("/WBSProjectSet('" + args.projectId + "')/ToPurReq", {groupId: sGroup});
				this._oModel.read("/zInstallationManager_VH", {groupId: sGroup});
				this._oModel.read("/zVendor_VH(p_posid='" + args.projectId.replace(/\./g,"") + "')/Set", {groupId: sGroup});
				this._oModel.read("/zWorkCenter_VH(p_posid='" + args.projectId.replace(/\./g,"") + "')/Set", {groupId: sGroup});
				this._oModel.read("/SearchUomSet", {groupId: sGroup});
				this._oModel.read("/SearchCurcSet", {groupId: sGroup});
				this._oModel.read("/ZINSTALLATIONMANAGER2_VH(poski='" + args.projectId + "')/Set", {groupId: sGroup});
				this._oModel.read("/OrderEOSSet('" + args.projectId + "')", {groupId: sGroup});

				
				// perform batch call
				this._oModel.submitChanges({
					groupId: sGroup,
					success: function(oEvent){
						if ( typeof args.success === "function" ) { args.success(oEvent); }
					},
				    error: function(oEvent){
						if ( typeof args.error === "function" ) { args.error(oEvent); }
					}
				});
				
			},
			
			readProjectHeaderDataById : function(args) {
				
				// generate a unique id for the batch process
				var sGroup = this._sGroupReadId;
				
				// prepare call
				this._oModel.read("/WBSProjectSet('" + args.projectId + "')/ToProjectHeader", {groupId: sGroup});
				
				// perform batch call
				this._oModel.submitChanges({
					groupId: sGroup,
					success: function(oEvent){
						if ( typeof args.success === "function" ) { args.success(oEvent); }
					},
				    error: function(oEvent){
						if ( typeof args.error === "function" ) { args.error(oEvent); }
					}
				});
				
			},
			
			readFilters : function(args) {
				// generate a unique id for the batch process
				var sGroup = this._sGroupReadSearchId;
				
				// prepare call
				this._oModel.read("/zWBSElement_VH", {groupId: sGroup});
				this._oModel.read("/zSoldTo_VH", {groupId: sGroup});
				this._oModel.read("/zShipTo_VH", {groupId: sGroup});
				this._oModel.read("/zSerialNumber_VH", {groupId: sGroup});
				this._oModel.read("/zInstallationManager_VH", {groupId: sGroup});
				this._oModel.read("/zSystemStatus_VH", {groupId: sGroup});
				this._oModel.read("/zUserStatus_VH", {groupId: sGroup});
				this._oModel.read("/zProjectManager_VH", {groupId: sGroup});
				this._oModel.read("/SearchStatSet", {groupId: sGroup});
				
				// perform batch call
				this._oModel.submitChanges({
					groupId: sGroup,
					success: function(oEvent){
						if ( typeof args.success === "function" ) { args.success(oEvent); }
					},
				    error: function(oEvent){
						if ( typeof args.error === "function" ) { args.error(oEvent); }
					}
				});
			},
			
			getCalendarDates : function(args) {
				
				// check input
				if ( typeof args.urlParameters === "undefined" ) {
					args.urlParameters = {}
				}
				
				args.urlParameters.Calendar = "'IT'"
				
				// perform call
				this._oModel.read("/GetDayDates", {
					urlParameters: args.urlParameters,
					success: function(oEvent) {
						if ( typeof args.success === "function" ) { args.success(oEvent); }
					},
					error: function(oEvent) {
						if ( typeof args.error === "function" ) { args.error(oEvent); }
					}
				});
			},
			
			
	/* =========================================================== */
	/* OData Services -                                            */
	/* =========================================================== */
			
			/**
			 * This method is to initialize the personalization container
			 * @param {Function} fnCallBack- the call back function with the array of variants
			 */
			initPersonalizationContainer : function(fnCallBack) {
				var self = this;
				
				if( this._oPersonalizationService ) {
					fnCallBack(true);
					return;
				}
				
				try {
					//get the personalization service of shell
					this._oPersonalizationService = sap.ushell.Container.getService("Personalization").getPersonalizationContainer(this._sVariantContainer);
					
					// save variants in personalization container
					this._oPersonalizationService.fail(function() {
						// call back function in case of fail
						fnCallBack(false);
					});
					
					this._oPersonalizationService.done(function(oPersonalizationContainer) {
						self._oPersonalizationContainer = oPersonalizationContainer;
						fnCallBack(true);
					}.bind(this));
					
				} catch(e) {
					fnCallBack(false);
				}
				
			},
			
			/**
			 * Retrieve the list of variants
			 * @param {String} sVariantContainer- Variant container name 
			 */
			getVariants : function() {
				var self = this;
				var aVariants = [];
				if( !this._oPersonalizationContainer || !this._oPersonalizationContainer.getVariantSet(this._sVariantContainer) ) {
					return aVariants;
				}
				this._oPersonalizationContainer.getVariantSet(this._sVariantContainer).getVariantKeys().forEach(function(sKey) {
					var oVariant = self._oPersonalizationContainer.getVariantSet(self._sVariantContainer)._oVariantMap.entries[sKey];
					aVariants.push({
						"key": oVariant._oVariantKey,
						"text": oVariant._oVariantName,
						"filters": JSON.parse(JSON.parse( oVariant._oItemMap.entries.Filter ))
					});
				});
				return aVariants;
			},
			
			/**
			 * This method is to save the variant
			 * @param {String} sVariantName- Variant name
			 * @param {Object} oFilterData- Filter data object-> consolidated filters in JSON
			 * @param {Function} fnCallBack- the call back function with the array of variants
			 */
			saveVariant : function(sVariantName, oFilterData, fnCallBack) {
				var oPersonalizationVariantSet ={};
				var oVariant = {};
				var sVariantKey = "";
				var sVariantContainer = this._sVariantContainer;
				
				// check if the current variant set exists, If not, add the new variant set to the container
				if (!(this._oPersonalizationContainer.containsVariantSet(sVariantContainer))) {
					this._oPersonalizationContainer.addVariantSet(sVariantContainer);
				}
				
				// get the variant set
				oPersonalizationVariantSet = this._oPersonalizationContainer.getVariantSet(sVariantContainer);
				
				//get if the variant exists or add new variant
				sVariantKey = oPersonalizationVariantSet.getVariantKeyByName(sVariantName);
				if (sVariantKey) {
					oVariant = oPersonalizationVariantSet.getVariant(sVariantKey);
				} else {
					oVariant = oPersonalizationVariantSet.addVariant(sVariantName);
				}
				if (oFilterData) {
					oVariant.setItemValue('Filter', JSON.stringify(oFilterData));
				}
				this._oPersonalizationContainer.save().fail(function() {
					//call callback fn with false
					fnCallBack(false);
				}).done(function() {
					//call call back with true
					fnCallBack(true);
				}.bind(this));
			}
			
			
		});

});