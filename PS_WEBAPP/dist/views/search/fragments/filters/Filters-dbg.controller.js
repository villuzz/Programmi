/*global location history */
sap.ui.define([
		"epta/ps/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/Label',
		'sap/m/TextArea',
		'sap/m/MessageToast',
		"sap/m/MessageBox"
	], function (BaseController, JSONModel, Formatter, Filter, FilterOperator, Button, Dialog, Label, TextArea, MessageToast, MessageBox) {
		"use strict";
		
		return BaseController.extend("epta.ps.views.search.fragments.filters.Filters", {
			
			_oDialog : {
				"Wbselement": undefined,
				"SoldTo": undefined,
				"Serialno": undefined,
				"Responsibleperson": undefined,
				"Iammperson": undefined,
				"SystemStatus": undefined,
				"UserStatus": undefined,
				"SearchStat": undefined
			},
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// init variant model
				this.setModel(new JSONModel([]), "variants");
				
				// init filter model
				this.getView().setModel(new sap.ui.model.json.JSONModel({}), "_flt");
				this.onClearFilters();
			},
			
			onBeforeRendering : function () {
				var self = this;
				
				// initialize the models
				this.setModel(new JSONModel(), "Wbselement");
				this.setModel(new JSONModel(), "SoldTo");
				this.setModel(new JSONModel(), "ShipTo");
				this.setModel(new JSONModel(), "Serialno");
				this.setModel(new JSONModel(), "Responsibleperson");
				this.setModel(new JSONModel(), "Iammperson");
				this.setModel(new JSONModel(), "SystemStatus");
				this.setModel(new JSONModel(), "UserStatus");
				this.setModel(new JSONModel(), "SearchStat");
				// set busy indicator
				this.getView().setBusy(true);
				// populate filters
				this._refreshFilterData();
				
				// initialize variants data
				this.getService().initPersonalizationContainer(function(bResult) {
					self._updateVariantsList();
				});        
			},
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
			
			
			// ******************************************************
			// WBS ID dialog methods
			 
			handleValueHelpWbs : function(oEvent) {
				this._openDialog("Wbselement");
			},
			
			handleSearchWbs : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("WBSElement", FilterOperator.Contains, sQuery),
							new Filter("Description", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmWbs : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/Wbselement/key", oSelectedItem.WBSElement );
				this.getModel("_flt").setProperty( "/Wbselement/value", oSelectedItem.WBSElement );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			
			// ******************************************************
			// Sold To dialog methods
			
			handleValueHelpSoldTo : function(oEvent) {
				this._openDialog("SoldTo");
			},
			
			handleSearchSoldTo : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("ID", FilterOperator.Contains, sQuery),
							new Filter("Name", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmSoldTo : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/SoldTo/key", oSelectedItem.ID );
				this.getModel("_flt").setProperty( "/SoldTo/value", oSelectedItem.Name );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// Ship To dialog methods
			
			handleValueHelpShipTo : function(oEvent) {
				this._openDialog("ShipTo");
			},
			
			handleSearchShipTo : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("ID", FilterOperator.Contains, sQuery),
							new Filter("Name", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmShipTo : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/ShipTo/key", oSelectedItem.ID );
				this.getModel("_flt").setProperty( "/ShipTo/value", oSelectedItem.Name );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// Serial No dialog methods
			
			handleValueHelpSerialno : function(oEvent) {
				this._openDialog("Serialno");
			},
			
			handleSearchSerialno : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("SerialNumber", FilterOperator.Contains, sQuery),
							new Filter("eqktx", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmSerialno : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/Serialno/key", oSelectedItem.SerialNumber );
				this.getModel("_flt").setProperty( "/Serialno/value", oSelectedItem.eqktx );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// Project Manager dialog methods
			
			handleValueHelpResponsibleperson : function(oEvent) {
				this._openDialog("Responsibleperson");
			},
			
			handleSearchResponsibleperson : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("ID", FilterOperator.Contains, sQuery),
							new Filter("Name", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmResponsibleperson : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/Responsibleperson/key", oSelectedItem.ID );
				this.getModel("_flt").setProperty( "/Responsibleperson/value", oSelectedItem.Name );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// Installation Manager dialog methods
			
			handleValueHelpIammperson : function(oEvent) {
				this._openDialog("Iammperson");
			},
			
			handleSearchIammperson : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("ID", FilterOperator.Contains, sQuery),
							new Filter("Name", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmIammperson : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/Iammperson/key", oSelectedItem.ID );
				this.getModel("_flt").setProperty( "/Iammperson/value", oSelectedItem.Name );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// System Status dialog methods
			
			handleValueHelpSystemStatus : function(oEvent) {
				this._openDialog("SystemStatus");
			},
			
			handleSearchSystemStatus : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Status", FilterOperator.Contains, sQuery),
							new Filter("Description", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmSystemStatus : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/SystemStatus/key", oSelectedItem.Status );
				this.getModel("_flt").setProperty( "/SystemStatus/value", oSelectedItem.Description );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// User Status dialog methods
			
			handleValueHelpUserStatus : function(oEvent) {
				this._openDialog("UserStatus");
			},
			
			handleSearchUserStatus : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Status", FilterOperator.Contains, sQuery),
							new Filter("Description", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmUserStatus : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/UserStatus/key", oSelectedItem.Status );
				this.getModel("_flt").setProperty( "/UserStatus/value", oSelectedItem.Description );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			// Date dialog methods
			
			handleBasicStartDateChange : function(oEvent) {
				
			},
			
			// ******************************************************
			// Project Status dialog methods
			
			handleValueHelpSearchStat : function(oEvent) {
				this._openDialog("SearchStat");
			},
			
			handleSearchSearchStat : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Status", FilterOperator.Contains, sQuery),
							new Filter("Description", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			handleConfirmSearchStat : function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				var oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
				this.getModel("_flt").setProperty( "/SearchStat/key", oSelectedItem.Statusproject );
				this.getModel("_flt").setProperty( "/SearchStat/value", oSelectedItem.Descrstatus );
				// close dialog
				oEvent.getSource().getParent().doClose();
			},
			
			// ******************************************************
			
			
			/**
			 * Clear filters
			 */
			onClearFilters : function() {
				this.getModel("_flt").setData({
					"Wbselement": {
						"key": "",
						"value": ""
					},
					"SoldTo": {
						"key": "",
						"value": ""
					},
					"ShipTo": {
						"key": "",
						"value": ""
					},
					"Serialno": {
						"key": "",
						"value": ""
					},
					"Responsibleperson": { // project manager
						"key": "",
						"value": ""
					},
					"Iammperson": { // installation manager
						"key": "",
						"value": ""
					},
					"SystemStatus": {
						"key": "",
						"value": ""
					},
					"UserStatus": {
						"key": "",
						"value": ""
					},
					"SearchStat": {
						"key": "",
						"value": ""
					},
					"Basicstartdate": null,
					"BasicstartdateTo": null
				});
				
			//	this.getView().byId("fltVariant").clearSelection();
			//	this.getView().byId("fltVariant").setValue("");
			},
			
			/**
			 * This method is called when the search button is pressed.
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSearch : function (oEvent) {
				var self = this;
				//if(this.byId("fltVariant")._lastValue != "" && this.byId("fltVariant").getSelectedItem() == null) {
				//	return;
				//}
				// Emit the event related to the beginning of the search
				this.getEventBus().publish("_onSearch", "start", oEvent);
				
				// Close the filter form
				this.getView().byId("fltPanel").setExpanded(false);
				
				// create filters
				var oFilters = [];
				var key = "";
				var sFilerKey = "";
				
				// Wbselement
				key = "Wbselement";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key, FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// SoldTo
				key = "SoldTo";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key + "/PartnerId", FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// ShipTo
				key = "ShipTo";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key + "/PartnerId", FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// Serialno
				key = "Serialno";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key, FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// Responsibleperson
				key = "Responsibleperson";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key, FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// Iammperson
				key = "Iammperson";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key, FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// SystemStatus
				key = "SystemStatus";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key + "/StatusId", FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// UserStatus
				key = "UserStatus";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter(key + "/StatusId", FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// SearchStat
				key = "SearchStat";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key + "/key").trim();
				if( sFilerKey !== "" ) {
					oFilters.push(new Filter("Statusproject", FilterOperator.EQ, sFilerKey.toString()));
				}
				
				// Basicstartdate
				key = "Basicstartdate";
				sFilerKey = self.getView().getModel("_flt").getProperty("/" + key );
				var sFilerKeyTo = self.getView().getModel("_flt").getProperty("/" + key + "To" );
				if( sFilerKey && sFilerKeyTo ) {
					var dStart = new Date( sFilerKey.getTime() - sFilerKey.getTimezoneOffset() * 60000 );
					var dEnd = new Date( sFilerKeyTo.getTime() - sFilerKeyTo.getTimezoneOffset() * 60000 );
					oFilters.push(new Filter(key,FilterOperator.BT,dStart,dEnd));
				}
				
				// Perform a Get query on the model
				this.getService().readProjectSet({
					filters: oFilters,
					success: function (oData) {
						// Emit the event related to the end of the search
						self.getEventBus().publish("_onSearch", "end", oData);
					}
				});
				
			},
			
			onCloseVariantList: function (oEvent) {
				this.byId("DialogVariantList").close();
			},
			onListVariant: function (oEvent) {
				var oBinding = this.byId("tableVariant").getBinding("items");
				oBinding.filter().refresh();
				// this.getModel("/VariantSet").refresh();
				this.byId("DialogVariantList").open();
			},
			onCloseVariant: function (oEvent) {
				this.byId("DialogVariant").close();
			},
			onPressVariant: function (oEvent) {
				this.getView().byId("VariantName").setValue("");
				var oDialog = this.byId("DialogVariant");
				oDialog.open();
			},
			onSaveVariant: function (oEvent) {
				var obj = {};
				obj.Name = this.getView().byId("VariantName").getValue();
				if (obj.Name.includes(' ')) {
					MessageBox.alert('Space not permitted');
				} else if(obj.Name === "") {
					MessageBox.alert('Insert Name');
				} else {
					obj.Filter = JSON.stringify( this.getModel("_flt").getData() );
					var myModel = this.getService().getModel();
					myModel.create('/VariantSet', obj, {
						success: function (oData, oResponse) { },
						error: function (err, oResponse) {
							var responseObject = JSON.parse(err.responseText);
							MessageBox.alert(responseObject.error.message.value);
							this.PopulateError('Error', responseObject.error.message.value);
						}.bind(this)
					});
					this.byId("DialogVariant").close();
				}
			},
			onDeleteVariantList: function (oEvent) {
				var delurl = "/VariantSet(Name='" + oEvent.getSource().getBindingContext().getObject().Name + "')";
				var myModel = this.getService().getModel();
				myModel.remove(delurl, {
					success: function (oData, oResponse) {
						var oBinding = this.byId("tableVariant").getBinding("items");
						oBinding.filter().refresh();
					}.bind(this),
					error: function (err, oResponse) {
						var responseObject = JSON.parse(err.responseText);
						MessageBox.alert(responseObject.error.message.value);
					}
				});
	
			},
			onVariantPress: function (oEvent) {

				var selRow = JSON.parse(oEvent.getSource().getBindingContext().getObject().Filter);
				
				if(selRow.Basicstartdate !== null){
					selRow.Basicstartdate = new Date(selRow.Basicstartdate);
				} else {
					selRow.Basicstartdate = null;
				}
				if(selRow.BasicstartdateTo !== null){
					selRow.BasicstartdateTo = new Date(selRow.BasicstartdateTo);
				} else {
					selRow.BasicstartdateTo = null;
				}
				this.getModel("_flt").setData(selRow);
				

				/*var self = this;
				if( oEvent.mParameters.value === "" ) {
					return;
				}
				selRow.forEach(function(oItem) {
					//if( oItem.key === oEvent.getSource().getSelectedItem().getProperty("key") ) {
						if( oItem.filters.Basicstartdate !== "" ) {
							oItem.filters.Basicstartdate = oItem.filters.Basicstartdate.substr(0,10);
						}
						if( oItem.filters.BasicstartdateTo !== "" ) {
							oItem.filters.BasicstartdateTo = oItem.filters.BasicstartdateTo.substr(0,10);
						}
						self.getModel("_flt").setData(oItem.filters);
					//}
				});*/
				this.byId("DialogVariantList").close();
			},
			
			/**
			 * Open the dialog with the form to save a new variant
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSubmitDialog: function () {
				var self = this;
				
				// set local variable for the dialog
				if (! this._oADialog) {
					this._oADialog = sap.ui.xmlfragment("epta.ps.views.search.fragments.filters.fragments.DialogVariant", this);
					this.getView().addDependent(this._oADialog);
				}
				
				// reset local variable for the dialog
				this._oADialog.attachAfterClose(function(oEvent) {
					// refresh variants list
					self._updateVariantsList();
				});
				
				// open dialog
				this._oADialog.open();
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			/*onSaveVariant : function (oEvent) {
				var self = this;
				
				// variant name
				var sVariantName = oEvent.getSource().getContent()[0].getValue();
				
				if( sVariantName.trim() === "" ) return;
				
				// form di inserimento nome
				this.getService().saveVariant(
					sVariantName,
					JSON.stringify( this.getModel("_flt").getData() ),
					function(bStatus) {
						if( bStatus ) {
							self._onSuccessOrFailureDialog({}, "{i18n>ui5Success}", "Success", "{i18n>ui5Success}");
						} else {
							self._onSuccessOrFailureDialog({}, "{i18n>ui5Failure}", "Error", "{i18n>ui5Failure}");
						}
					}
				);
			},*/
			
			/**
			 * Called when a variant is selected
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onVariantSelect : function(oEvent) {
				var self = this;
				if( oEvent.mParameters.value === "" ) {
					return;
				}
				this.getModel("variants").getData().forEach(function(oItem) {
					if( oItem.key === oEvent.getSource().getSelectedItem().getProperty("key") ) {
						if( oItem.filters.Basicstartdate !== "" ) {
							oItem.filters.Basicstartdate = oItem.filters.Basicstartdate.substr(0,10);
						}
						if( oItem.filters.BasicstartdateTo !== "" ) {
							oItem.filters.BasicstartdateTo = oItem.filters.BasicstartdateTo.substr(0,10);
						}
						self.getModel("_flt").setData(oItem.filters);
					}
				});
			},
			
	/* =========================================================== */
	/* internal methods                                            */
	/* =========================================================== */
	
			_updateVariantsList : function() {
				this.getModel("variants").setData( this.getService().getVariants() );
			},
			
			_openDialog : function(sDialog) {
				// set local variable for the dialog
				if (! this._oDialog[sDialog]) {
					this._oDialog[sDialog] = sap.ui.xmlfragment("epta.ps.views.search.fragments.filters.fragments.Dialog" + sDialog, this);
					this.getView().addDependent(this._oDialog[sDialog]);
				}
				// open dialog
				this._oDialog[sDialog].open();
			},
			
			/**
			 * Refresh data related to filters
			 * @function
			 * @private
			 */
			_refreshFilterData : function() {
				var self = this;
				this.getView().setBusy(true);
				this.getService().readFilters({
					success: function (oData) {
						var oResult = {
							"Wbselement" : [{ CompanyCode: "", WBSElement: "", Description: "" }].concat( oData.__batchResponses[0].data.results ),
							"SoldTo" : [{ID: "", Name: "", PurchGrp: ""}].concat( oData.__batchResponses[1].data.results ),
							"ShipTo" : [{ID: "", Name: "", PurchGrp: ""}].concat( oData.__batchResponses[2].data.results ),
							"Serialno" : [{SerialNumber: "", eqktx: ""}].concat( oData.__batchResponses[3].data.results ),
							"Iammperson" : [{ID: "", Name: ""}].concat( oData.__batchResponses[4].data.results ),
							"SystemStatus" : [{ID: "", Status: "", Description: ""}].concat( oData.__batchResponses[5].data.results ),
							"UserStatus" : [{ID: "", Status: "", Description: ""}].concat( oData.__batchResponses[6].data.results ),
							"Responsibleperson" : [{ID: "", Name: ""}].concat( oData.__batchResponses[7].data.results ),
							"SearchStat" : [{Statusproject: "", Descrstatus: ""}].concat( oData.__batchResponses[8].data.results )
						};
						Object.keys(oResult).forEach(function(key){
							self.getModel(key).setData( oResult[key] );
						});
						
						self.getView().setBusy(false);
					},
					error: function(oError) {
						// Reset busy indicator
						self.getView().setBusy(false);
					}
				});
				
			},

		});
	}
);