/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("epta.ps.views.project.fragments.purchaseRequisition.PurchaseRequisition", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.setModel(new JSONModel(), "_rda");
				this._initRDAModel();
			},
			
			/**
			 * Called before the page is rendered.
			 * @public
			 */
			onBeforeRendering : function () {
				this.getModel("layout").setProperty( "/footer/save", false );
				this.getModel("layout").setProperty( "/footer/cancel", false );
				this.getModel("layout").setProperty( "/footer/filter", true );
				this.getModel("layout").setProperty( "/footer/enabled", true );
			},
			
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
			
			/**
			 * Open the dialog with the form to create a new RDA
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleAddRDA : function (oEvent) {
				var self = this;
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oSelectedItem = _oContext[Object.keys(_oContext)[0]];
				var oSelectedItem = this._oSelectedItem.oModel.getProperty(this._oSelectedItem.sPath);
				
				// populate temporary model
				var oItem = JSON.parse(JSON.stringify(oSelectedItem));
				delete oItem.__metadata;
				delete oItem.Purchaserequisitionitem;
				try {
					oItem.CreatedBy = sap.ushell.Container.getService("UserInfo").getId();
				} catch(e) { }
				if( oItem.Unit === "" ) {
					oItem.Unit = "PC";
				}
				
				//oItem.NetValue = Number(Number("123.334").toFixed(2));
				this.getModel("_rda").setData(oItem);
				this.getModel("_rda").setProperty("/Counter",1);
				
				// set local variable for the dialog
				if (! this._oADialog) {
					this._oADialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.purchaseRequisition.fragments.DialogRDA", this);
					this.getView().addDependent(this._oADialog);
				}
				
				// reset local variable for the dialog
				this._oADialog.attachAfterClose(function(oEvent) {
					self._initRDAModel();
				});
				
				// open dialog
				this._oADialog.open();
			},
			
			/**
			 * Called to create the new RDA
			 * @public
			 * @param {sap.ui.base.Event}
			 */
			onRDACreate : function(oEvent) {
				var self = this;
				
				// prepare data
				var oDataRda = JSON.parse(JSON.stringify( this.getModel("_rda").getData() ));
				oDataRda.Creationdate = new Date();
				
				this.getView().setBusy(true);
				
				// create entity
				this.getService().getModel().create( "/PurReqSet", oDataRda, {
					success: function(oData) {
						// update local model
						var oModelData = self.getModel("PurReq").getData();
						oModelData.push(oDataRda);
						self.getModel("PurReq").setData(oModelData);
						
						self.getView().setBusy(false);
						// success popup dialog 
						self._onSuccessOrFailureDialog(oData, "{i18n>ui5Success}", "Success", "{i18n>ui5SuccessText}");
					},
					error: function(oError) {
						self.getView().setBusy(false);
						// error popup dialog
						self._onSuccessOrFailureDialog(oError, "{i18n>ui5Failure}", "Error", "{i18n>ui5FailureText}");
					}
				});
				
				this._oADialog.close();
				
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the new vendor
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpVendor : function(oEvent) {
				// set local variable for the dialog
				if (! this._oVDialog) {
					this._oVDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.purchaseRequisition.fragments.DialogVendor", this);
					this.getView().addDependent(this._oVDialog);
				}
				
				// reset local variable for the dialog
				this._oVDialog.attachAfterClose(function(oEvent) {
					oEvent.getSource().getContent()[0].removeSelections();
				});
				
				// open dialog
				this._oVDialog.open();
			},
			
			/**
			 * Enables search inside dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleSearchVendor : function(oEvent) {
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
			
			/**
			 * Called onSelectionChange click from Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSelectionChangeVendor: function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				this.getModel("_rda").setProperty("/Vendor", oContext.oModel.getProperty(oContext.sPath + "/ID"));
				this.getModel("_rda").setProperty("/VendorName", oContext.oModel.getProperty(oContext.sPath + "/Name"));
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the new currency
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpCurrency : function(oEvent) {
				// set local variable for the dialog
				if (! this._oCDialog) {
					this._oCDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.purchaseRequisition.fragments.DialogCurrency", this);
					this.getView().addDependent(this._oCDialog);
				}
				
				// reset local variable for the dialog
				this._oCDialog.attachAfterClose(function(oEvent) {
					oEvent.getSource().getContent()[0].removeSelections();
				});
				
				// open dialog
				this._oCDialog.open();
			},
			
			/**
			 * Enables search inside Currency Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleSearchCurrency : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Waers", FilterOperator.Contains, sQuery),
							new Filter("Ltext", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			/**
			 * Called onSelectionChange click from Currency Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSelectionChangeCurrency: function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				this.getModel("_rda").setProperty("/Currency", oContext.oModel.getProperty(oContext.sPath + "/Waers"));
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the new unity of measure
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpUoM : function(oEvent) {
				// set local variable for the dialog
				if (! this._oUDialog) {
					this._oUDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.purchaseRequisition.fragments.DialogUoM", this);
					this.getView().addDependent(this._oUDialog);
				}
				
				// reset local variable for the dialog
				this._oUDialog.attachAfterClose(function(oEvent) {
					oEvent.getSource().getContent()[0].removeSelections();
				});
				
				// open dialog
				this._oUDialog.open();
			},
			
			/**
			 * Enables search inside UoM Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleSearchUoM : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Msehi", FilterOperator.Contains, sQuery),
							new Filter("Msehl", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			/**
			 * Called onSelectionChange click from UoM Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSelectionChangeUoM: function(oEvent) {
				// get context
				var _oContext = oEvent.getParameter("listItem").oBindingContexts;
				var oContext = _oContext[Object.keys(_oContext)[0]];
				// get selected item
				this.getModel("_rda").setProperty("/Unit", oContext.oModel.getProperty(oContext.sPath + "/Msehi"));
			},
			
			
	/* =========================================================== */
	/* private methods                                             */
	/* =========================================================== */
			
			/**
			 * Initialize the model used to create a new activity
			 * @private
			 */
			_initRDAModel : function () {
				this.getModel("_rda").setData({});
			}
			
			
		});
	}
);