/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";
		
		return BaseController.extend("epta.ps.views.project.fragments.progress.Progress", {
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
			handleValueHelpProgress : function(oEvent) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				this.getModel("_dprog").setProperty( "/progress", parseInt(this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/Apoc"),10) );
				
				// set local variable for the dialog
				if (! this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.progress.fragments.DialogProgress", this);
					this.getView().addDependent(this._oDialog);
				}
				
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
					this.getModel("NetworkActivity").getData().forEach(function (oWBS) {
						
						if( oWBS.Networkactivity !== "" ) {
							// update local model
							oWBS.Apoc = self.getModel("_dprog").getProperty("/progress");
							
							// update service model
							self._addChange(
								self._controller,
								"Progress",
								"/NetworkActivitySet(Projectnetwork='" + oWBS.Projectnetwork + "',"
									+ "Networkactivity='" + oWBS.Networkactivity + "',"
									+ "Wbselement='" + oWBS.Wbselement + "')",
								{ "Apoc": self.getModel("_dprog").getProperty("/progress").toString() },
								self.getService()._sGroupUpdateId
							);
						}
						
					});
					// update data after modify
					this.getModel("NetworkActivity").refresh();
					
				}
				// update single record
				else {
					
					// update local model
					this._oInputBinding.oModel.setProperty(
						this._oInputBinding.sPath + "/Apoc",
						this.getModel("_dprog").getProperty("/progress")
					);
					
					// update service model
					this._addChange(
						this._controller,
						"Progress",
						"/NetworkActivitySet(Projectnetwork='" + self._oInputBinding.oModel.getProperty(self._oInputBinding.sPath+"/Projectnetwork") + "',"
							+ "Networkactivity='" + self._oInputBinding.oModel.getProperty(self._oInputBinding.sPath+"/Networkactivity") + "',"
							+ "Wbselement='" + self._oInputBinding.oModel.getProperty(self._oInputBinding.sPath+"/Wbselement") + "')",
						{ "Apoc": self.getModel("_dprog").getProperty("/progress").toString() },
						this.getService()._sGroupUpdateId
					);
					
				}
				// save data
				// this.fireBatchSave();
			}
			
		});
	}
);