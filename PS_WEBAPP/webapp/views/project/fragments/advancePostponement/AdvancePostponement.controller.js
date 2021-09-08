/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/format/DateFormat"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, DateTimeFormatter) {
		"use strict";
		
		return BaseController.extend("epta.ps.views.project.fragments.advancePostponement.AdvancePostponement", {
			
			formatter: formatter,
			_oSelectedItem: null,
			_oInputBinding: null,
			_aWbselementNotEditable: [],
			
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
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
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDate : function(oEvent) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.advancePostponement.fragments.Dialog", this);
					this.getView().addDependent(this._oDialog);
				}
				
				// reset local variable for the dialog
				this._oDialog.attachAfterClose(function() {
					oEvent.getSource().getContent().getContent()[0].removeAllSelectedDates();
				});
				
				// open dialog
				this._oDialog.open();
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogSave : function (oEvent) {
				var self = this;
				
				// update all records
				if( oEvent.getSource().toPropagate() ) {
					
					// for each element in table, update it if editable
					this.getModel("WbselementData").getData().forEach(function (oWBS) {
						
						if( oWBS.isAPEnabled && self._oInputBinding.oModel.getProperty( self._oInputBinding.sPath + "/Wbselementhierarchylevel" ) === oWBS.Wbselementhierarchylevel ) {
							// update local model
							oWBS.Freedefineddate1 = self._oSelectedItem;
							
							if( oWBS.Networkactivity !== "" ) {
								// update service model
								self._addChange(
									self._controller,
									"AdvPostDate",
									"/WBSElementDataSet('" + oWBS.Wbselement + "')",
									{ "Freedefineddate1": new Date(self._oSelectedItem.getTime() - self._oSelectedItem.getTimezoneOffset() * 60000) },
									self.getService()._sGroupUpdateId
								);
							}
						}
						
					});
					// update data after modify
					this.getModel("WbselementData").refresh();
					
				}
				// update single record
				else {
					// update local model
					this._oInputBinding.oModel.setProperty( this._oInputBinding.sPath + "/" + "Freedefineddate1", this._oSelectedItem );
					// update service model
					this._addChange(
						this._controller,
						"AdvPostDate",
						"/WBSElementDataSet('" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Wbselement") + "')",
						{ "Freedefineddate1": new Date(this._oSelectedItem.getTime() - this._oSelectedItem.getTimezoneOffset() * 60000) },
						this.getService()._sGroupUpdateId
					);
					
					// current element modified
					var oSelectedData = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath);
					// set the children wbs (level 4) as not editable
					if( oSelectedData.Wbselementhierarchylevel === 3 ) {
						for( var i = 0; i < this._oInputBinding.oModel.getData().length; i++ ) {
							if( this._oInputBinding.oModel.getProperty("/" + i + "/Wbselementparent") === oSelectedData.Wbselement ) {
								this._oInputBinding.oModel.setProperty("/" + i + "/isAPEnabled", false);
							}
						}
					}
					// set the parent wbs (level 3) as not editable
					else if( oSelectedData.Wbselementhierarchylevel === 4 ) {
						for( var j = 0; j < this._oInputBinding.oModel.getData().length; j++ ) {
							if( this._oInputBinding.oModel.getProperty("/" + j + "/Wbselement") === oSelectedData.Wbselementparent ) {
								this._oInputBinding.oModel.setProperty("/" + j + "/isAPEnabled", false);
								break;
							}
						}
					}
					
				}
				// save data
				// this.fireBatchSave();
				
			},
			
			/**
			 * Called on select date from calendar
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSelectDate : function (oEvent) {
				this._oSelectedItem = oEvent.getSource().getSelectedDates()[0].getProperty("startDate");
			},
			
			
	/* =========================================================== */
	/* private methods                                             */
	/* =========================================================== */
		
			_evaluateDateInput: function(Wbselement) {
				
				var isEditable = true;
				var oElement = this.getView().getModel("WbselementData").getData().filter(function(oItem) { return oItem.Wbselement === Wbselement; })[0];
				
				// level 1 and 2 are not editable
				if( oElement.Wbselementhierarchylevel <= 2 ) { return false; }
				
				// level 3
				if( oElement.Wbselementhierarchylevel === 3 ) {
					isEditable = oElement.isAPEnabled;
					// evalueate level 4
					if( oElement.isAPEnabled ) {
						var aChildren = this.getView().getModel("WbselementData").getData().filter(function(oItem) { return oItem.Wbselementparent === Wbselement; });
						for(var i = 0; i < aChildren.length; i++ ) {
							if( aChildren[i].Freedefineddate1 !== null || !aChildren[i].isAPEnabled ) {
								isEditable = false;
								break;
							}
						}
					}
					
				}
				
				// level 4
				if( oElement.Wbselementhierarchylevel === 4 ) {
					isEditable = oElement.isAPEnabled;
					// evaluate level 3
					if( oElement.isAPEnabled ) {
						var oParent = this.getView().getModel("WbselementData").getData().filter(function(oItem) { return oItem.Wbselement === oElement.Wbselementparent; })[0];
						isEditable = ( oParent.Freedefineddate1 === null && oParent.isAPEnabled );
					}
				}
				
				return isEditable;
			}
			
		});
	}
);