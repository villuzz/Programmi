/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"epta/ps/ui5/m/Dialog"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator,Dialog) {
		"use strict";

		return BaseController.extend("epta.ps.views.project.fragments.assignInstallationManager.AssignInstallationManager", {

			formatter: formatter,
			_oInputBinding: null,
			_oSelectedItem: null,
			
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.setModel(new JSONModel(), "_dresp");
				this._controller = this.getView().getControllerName();
			},
			
			/**
			 * Called before the page is rendered.
			 * @public
			 */
			onBeforeRendering : function () {
				this.getModel("layout").setProperty( "/footer/save", true );
				this.getModel("layout").setProperty( "/footer/cancel", true );
				this.getModel("layout").setProperty( "/footer/filter", false );
				this.getModel("layout").setProperty("/footer/enabled", true);
			},
			
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
			
			/**
			 * Open the dialog with the list of records among which the user can choose the new responsible
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpResponsible : function(oEvent) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.assignInstallationManager.fragments.DialogResponsible", this);
					this.getView().addDependent(this._oDialog);
				}
				
				// open dialog
				this._oDialog.open();
			},
			
			/**
			 * Handle the live search
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleLiveSearch : function(oEvent) {
				// build filter array
				var oFilter = {};
				var sQuery = oEvent.getParameter("newValue");
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("ID", FilterOperator.Contains, sQuery),
							new Filter("Name", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				} else {
					oFilter = [];
				}
				// filter binding
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter(oFilter);
			},
			
			/**
			 * Called onClear click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogClear: function(oEvent) {
				var self = this;
				var oBinding = oEvent.getSource().getContent()[0].getBinding("items");
				// try to select the predefined empty record
				this._oSelectedItem = oBinding.oModel.getData().filter(function(oItem){ return oItem.__metadata === ""; })[0];
				// set empty selected item
				if( !this._oSelectedItem ) {
					this._oSelectedItem = {};
					Object.keys( oBinding.oModel.getData()[0] ).forEach(function(oItem) {
					    self._oSelectedItem[oItem] = "";
					});
				}
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogSave : function (oEvent) {
				var self = this;
				
				// retrieve selection
				var oSelectedItem = this._oSelectedItem;
				
				if( oSelectedItem === null ) return;
				
				// update all records
				if( oEvent.getSource().toPropagate() ) {
					// for each element in table, update it if editable
					this.getModel("WbselementData").getData().forEach(function (oWBS) {
						
						if( self._isEditable(oWBS.Wbselementhierarchylevel) ) {
							// update local model
							oWBS.Responsibleperson = oSelectedItem.ID;
							oWBS.Responsiblepersonname = oSelectedItem.Name;
							
							// update service model
							self._addChange(
								self._controller,
								"Responsible",
								"/WBSElementDataSet('" + oWBS.Wbselement + "')",
								{ "Responsibleperson": oSelectedItem.ID, "Responsiblepersonname": oSelectedItem.Name },
								self.getService()._sGroupUpdateId
							);
							
						}
						
					});
					// update data after modify
					this.getModel("WbselementData").refresh();
					
				}
				// update single record
				else {
					
					// update local model
					this._oInputBinding.oModel.setProperty(
						this._oInputBinding.sPath + "/Responsibleperson",
						oSelectedItem.ID
					);
					this._oInputBinding.oModel.setProperty(
						this._oInputBinding.sPath + "/Responsiblepersonname",
						oSelectedItem.Name
					);
					
					// update service model
					self._addChange(
						this._controller,
						"Responsible",
						"/WBSElementDataSet('" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Wbselement") + "')",
						{ "Responsibleperson": oSelectedItem.ID, "Responsiblepersonname": oSelectedItem.Name },
						this.getService()._sGroupUpdateId
					);
					
				}
				// save data
				// this.fireBatchSave();
			},
			
			/**
			 * Called onSelectionChange click from Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSelectionChange: function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				this._oSelectedItem = oContext.oModel.getProperty(oContext.sPath);
			},
			
			
	/* =========================================================== */
	/* private methods                                             */
	/* =========================================================== */
			
			/**
			 * Returning the editable level
			 * @private
			 */
			_isEditable : function (nLevel) {
				return  nLevel === 3 || nLevel === 4;
			}
			
		});
	}
);