/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("epta.ps.views.project.fragments.resourceManagement.ResourceManagement", {

			formatter: formatter,
			
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.setModel(new JSONModel(), "_activity");
				this.setModel(new JSONModel(), "_activityPredecessors");
				this.setModel(new JSONModel(), "_networkPredecessors");
				this._initActivityModel();
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
			 * Open the dialog with the list of records among which the user can choose the new work center
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpWorkCenter : function(oEvent) {
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oWCDialog) {
					this._oWCDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.resourceManagement.fragments.DialogWorkCenter", this);
					this.getView().addDependent(this._oWCDialog);
				}
				
				// reset local variable for the dialog
				this._oWCDialog.attachAfterClose(function(oEvent) {
					oEvent.getSource().getContent()[0].removeSelections();
				});
				
				// open dialog
				this._oWCDialog.open();
				
			},
			
			/**
			 * Enables search inside dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleSearchWorkCenter : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("WorkCenter", FilterOperator.Contains, sQuery),
							new Filter("Description", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the new vendor
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpVendor : function(oEvent) {
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oVDialog) {
					this._oVDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.resourceManagement.fragments.DialogVendor", this);
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
			 * Open the dialog with the form to create a new activity
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleAddActivity : function (oEvent) {
				var self = this;
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oSelectedItem = _oContext[Object.keys(_oContext)[0]];
				var oSelectedItem = this._oSelectedItem.oModel.getProperty(this._oSelectedItem.sPath);
				
				// calculate new activity id
				var aActivityList = this.getModel("NetworkActivity").getData();
				var sNewActivity = "";
				
				var aNetworkPredecessorsList = [{"Network": "", "Description": ""}];
				var _aNetworkList = [];
				aActivityList.forEach(function(oActivity) {
					if( oActivity.Network !== "" && _aNetworkList.indexOf(oActivity.Network) < 0) {
						_aNetworkList.push(oActivity.Network);
					}
				});
				_aNetworkList.sort();
				_aNetworkList.forEach(function(network) {
					aNetworkPredecessorsList.push({
						"Network": network,
						"Description": self.getModel("NetworkActivity").getData().filter(d => d.Network === network)[0].Description
					});
				});
				
				// list of possible predecessors for the new activity
				var aActivityPredecessorsList = this._getActivityPredecessorsList(oSelectedItem.Network, oSelectedItem.Network);
				
				aActivityList.filter(function(oActivity) {
					return oActivity.Wbselement === oSelectedItem.Wbselement;
				}).forEach(function(d) {
					// calculate the new activity number
					sNewActivity = d.Networkactivity > sNewActivity ? d.Networkactivity : sNewActivity;
				});
				sNewActivity = ( "00" + (Number(sNewActivity)+1) ).substr(-4);
				
				// populate predecessors models
				this.getModel("_activityPredecessors").setData( aActivityPredecessorsList );
				this.getModel("_networkPredecessors").setData( aNetworkPredecessorsList );
				
				// populate temporary model
				var oActivity = JSON.parse(JSON.stringify(oSelectedItem));
				delete oActivity.BasicstartdateLimit;
				this.getModel("_activity").setData( oActivity );
				this.getModel("_activity").setProperty("/Apoc","0");
				this.getModel("_activity").setProperty("/ActivityPredecessor",oSelectedItem.Networkactivity);
				this.getModel("_activity").setProperty("/Networkactivity", sNewActivity);
				this.getModel("_activity").setProperty("/NetworkPredecessor", oSelectedItem.Projectnetwork);
				this.getModel("_activity").setProperty("/NetworkPredecessorDescription", this.getModel("NetworkActivity").getData().filter(d => d.Network === oSelectedItem.Projectnetwork)[0].Description);
				this.getModel("_activity").setProperty("/WorkCntr", "");
				this.getModel("_activity").setProperty("/VendorNo", "");
				
				// set local variable for the dialog
				if (! this._oADialog) {
					this._oADialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.resourceManagement.fragments.DialogActivity", this);
					this.getView().addDependent(this._oADialog);
				}
				
				// reset local variable for the dialog
				this._oADialog.attachAfterClose(function(oEvent) {
					self._initActivityModel();
				});
				
				// open dialog
				this._oADialog.open();
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the predecessor network for the new activity
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpNetworkPredecessor : function(oEvent) {
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oNPDialog) {
					this._oNPDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.resourceManagement.fragments.DialogNetworkPredecessor", this);
					this.getView().addDependent(this._oNPDialog);
				}
				
				// reset local variable for the dialog
				this._oNPDialog.attachAfterClose(function(oEvent) {
					oEvent.getSource().getContent()[0].removeSelections();
				});
				
				// open dialog
				this._oNPDialog.open();
				// filter data
				// this._oNPDialog.getSubHeader().getContent()[0].fireLiveChange();
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the predecessor activity for the new activity
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpActivityPredecessor : function(oEvent) {
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oAPDialog) {
					this._oAPDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.resourceManagement.fragments.DialogActivityPredecessor", this);
					this.getView().addDependent(this._oAPDialog);
				}
				
				// reset local variable for the dialog
				this._oAPDialog.attachAfterClose(function(oEvent) {
					oEvent.getSource().getContent()[0].removeSelections();
				});
				
				// open dialog
				this._oAPDialog.open();
				// filter data
				this._oAPDialog.getSubHeader().getContent()[0].fireLiveChange();
			},
			
			/**
			 * Enables search inside network predecessor dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleSearchNetworkPredecessor : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Network", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				} else {
					oFilter = new Filter({
						filters: [
							new Filter("Network", FilterOperator.NE, "")
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			/**
			 * Enables search inside activity predecessor dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleSearchActivityPredecessor : function(oEvent) {
				var sQuery = oEvent.getParameter("newValue");
				var oFilter = [];
				if( sQuery ) {
					oFilter = new Filter({
						filters: [
							new Filter("Networkactivity", FilterOperator.Contains, sQuery),
							new Filter("Description", FilterOperator.Contains, sQuery)
						],
						and: false
					});
				} else {
					oFilter = new Filter({
						filters: [
							new Filter("Networkactivity", FilterOperator.NE, "")
						],
						and: false
					});
				}
				
				var oBinding = oEvent.getSource().getParent().getParent().getContent()[0].getBinding("items");
				oBinding.filter([oFilter]);
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogSaveWorkCenter : function (oEvent) {
				var self = this;
				
				// update all records
				if( oEvent.getSource().toPropagate() ) {
					
					// for each element in table, update it if editable
					this.getModel("NetworkActivity").getData().forEach(function (oWBS) {
						
						if( oWBS.Networkactivity === "" ) return;
						
						// update local model
						oWBS.WorkCntr = self._oSelectedItem.WorkCenter;
						
						// update service model
						self._addChange(
							self._controller,
							"WorkCntr",
							"/NetworkActivitySet(Projectnetwork='" + oWBS.Projectnetwork + "',"
								+ "Networkactivity='" + oWBS.Networkactivity + "',"
								+ "Wbselement='" + oWBS.Wbselement + "')",
							{ "WorkCntr": self._oSelectedItem.WorkCenter },
							self.getService()._sGroupUpdateId
						);
						
					});
					// update data after modify
					this.getModel("NetworkActivity").refresh();
					
				}
				// update single record
				else {
					// update local model
					this._oInputBinding.oModel.setProperty(
						this._oInputBinding.sPath + "/WorkCntr",
						this._oSelectedItem.WorkCenter
					);
					
					// update service model
					this._addChange(
						this._controller,
						"WorkCntr",
						"/NetworkActivitySet(Projectnetwork='" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Projectnetwork") + "',"
							+ "Networkactivity='" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Networkactivity") + "',"
							+ "Wbselement='" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Wbselement") + "')",
						{ "WorkCntr": this._oSelectedItem.WorkCenter },
						this.getService()._sGroupUpdateId
					);
					
				}
				// save data
				// this.fireBatchSave();
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogSaveVendor : function (oEvent) {
				var self = this;
				
				// update all records
				if( oEvent.getSource().toPropagate() ) {
					
					// for each element in table, update it if editable
					this.getModel("NetworkActivity").getData().forEach(function (oWBS) {
						
						if( oWBS.Networkactivity === "" ) return;
						
						// update local model
						oWBS.VendorNo = self._oSelectedItem.ID;
						
						// update service model
						self._addChange(
							self._controller,
							"Vendor",
							"/NetworkActivitySet(Projectnetwork='" + oWBS.Projectnetwork + "',"
								+ "Networkactivity='" + oWBS.Networkactivity + "',"
								+ "Wbselement='" + oWBS.Wbselement + "')",
							{ "VendorNo": self._oSelectedItem.ID },
							self.getService()._sGroupUpdateId
						);
						
					});
					// update data after modify
					this.getModel("NetworkActivity").refresh();
					
				}
				// update single record
				else {
					// update local model
					this._oInputBinding.oModel.setProperty(
						this._oInputBinding.sPath + "/VendorNo",
						this._oSelectedItem.ID
					);
					
					// update service model
					this._addChange(
						this._controller,
						"Vendor",
						"/NetworkActivitySet(Projectnetwork='" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Projectnetwork") + "',"
							+ "Networkactivity='" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Networkactivity") + "',"
							+ "Wbselement='" + this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath+"/Wbselement") + "')",
						{ "VendorNo": this._oSelectedItem.ID },
						this.getService()._sGroupUpdateId
					);
					
				}
				// save data
				// this.fireBatchSave();
				
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogSaveNetworkPredecessor: function(oEvent) {
				var self = this;
				// update activity predecessor
				this.getModel("_activity").setProperty("/NetworkPredecessor", this._oSelectedItem.Network);
				this.getModel("_activity").setProperty("/NetworkPredecessorDescription", this.getModel("NetworkActivity").getData().filter(d => d.Network === self._oSelectedItem.Network)[0].Description);
				// retrieve the list of activities
				var aList = this._getActivityPredecessorsList( this.getModel("_activity").getProperty("/Network"), this.getModel("_activity").getProperty("/NetworkPredecessor") );
				this.getModel("_activityPredecessors").setData(aList);
				// set the default activity
				this._oSelectedItem = aList[0];
				this.onDialogSaveActivityPredecessor({});
			},
			
			/**
			 * Called onSave click from Dialog saving the model
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogSaveActivityPredecessor: function(oEvent) {
				var self = this;
				// update local activity model, but some keys
				var aEscapeKeys = ["__metadata", "Activity", "Apoc", "ActivityPredecessor", "BasicstartdateLimit", "Description", "Network", "Networkactivity", "NetworkPredecessor", "Projectnetwork", "Projectnetworkinternalid", "Projectnetworkobject", "UserStatus", "VendorNo", "Wbsdescription", "Wbselement", "Wbselementhierarchylevel", "Wbselementobject", "WorkCntr" ];
				Object.keys( this._oSelectedItem ).forEach(function(sKey) {
					if( aEscapeKeys.indexOf(sKey) < 0 ) {
						self.getModel("_activity").setProperty("/" + sKey, self._oSelectedItem[sKey]);
					}
				});
				// update activity predecessor
				this.getModel("_activity").setProperty("/ActivityPredecessor", this._oSelectedItem.Networkactivity);
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
			 * Called onSelectionChange click from Dialog
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onActivityCreate : function(oEvent) {
				var self = this;
				
				// prepare data
				var oDataActivity = JSON.parse(JSON.stringify( this.getModel("_activity").getData() ));
				oDataActivity.Basicstartdate = new Date(oDataActivity.Basicstartdate);
				oDataActivity.ActualStartDate = new Date(oDataActivity.ActualStartDate);
				oDataActivity.Forecastedstartdate = new Date(oDataActivity.Forecastedstartdate);
				oDataActivity.ActualFinishDate = new Date(oDataActivity.ActualFinishDate);
				oDataActivity.Forecastedenddate = new Date(oDataActivity.Forecastedenddate);
				oDataActivity.Basicenddate = new Date(oDataActivity.Basicenddate);
				oDataActivity.LatestStartDate = new Date(oDataActivity.LatestStartDate);
				oDataActivity.ConstraintStartDate = new Date(oDataActivity.ConstraintStartDate);
				oDataActivity.LatestFinishDate = new Date(oDataActivity.LatestFinishDate);
				oDataActivity.Datab = new Date(oDataActivity.Datab);
				oDataActivity.WorkCntr = "";
				oDataActivity.VendorNo = "";
				oDataActivity.Basicduration = oDataActivity.Basicduration.toString();
				delete oDataActivity.BasicstartdateLimit;
				delete oDataActivity.Freedefineddate1;
				delete oDataActivity.dealyStatus;
				delete oDataActivity.NetworkPredecessorDescription;
				delete oDataActivity.Addstartdate;
				delete oDataActivity.Addfinishdate;
				
				this.getView().setBusy(true);
				
				// create entity
				this.getService().getModel().create( "/NetworkActivitySet", oDataActivity, {
					success: function(oData){
						// update local model
						var oModelData = self.getModel("NetworkActivity").getData();
						oModelData.push(oDataActivity);
						self.getModel("NetworkActivity").setData(oModelData);
						
						self.getView().setBusy(false);
						// success popup dialog 
						self._onSuccessOrFailureDialog(oData, "{i18n>ui5Success}", "Success", "{i18n>ui5SuccessText}");
						// refresh data
						self.getEventBus().publish("_onProjectDetail", "refresh", self.getModel("NetworkActivity").getData());
					},
					error: function(oError) {
						self.getView().setBusy(false);
						// error popup dialog
						self._onSuccessOrFailureDialog(oError, "{i18n>ui5Failure}", "Error", "{i18n>ui5FailureText}");
					}
				});
				this._oADialog.close();
				
			},
			
			
	/* =========================================================== */
	/* private methods                                             */
	/* =========================================================== */
			
			/**
			 * Initialize the model used to create a new activity
			 * @private
			 */
			_initActivityModel : function () {
				this.getModel("_activity").setData({});
				this.getModel("_activityPredecessors").setData([]);
				this.getModel("_networkPredecessors").setData([]);
			},
			
			
			/**
			 * List of activities related to a network
			 * @private
			 */
			_getActivityPredecessorsList : function(sNetwork, sPredecessorNetwork) {
				
				// calculate new activity id
				var aActivityList = this.getModel("NetworkActivity").getData();
				
				// list of possible predecessors for the new activity
				var aPredecessorsList = [];
				
				// create a copy of the activity 0010 with empty number (in case the user wants no predecessor)
				if( sPredecessorNetwork !== "" ) {
					sNetwork = sPredecessorNetwork;
				}
				aActivityList.filter(function(oActivity) {
					return oActivity.Network === sNetwork && oActivity.Networkactivity === "0010";
				}).forEach(function(d,i) {
					if( i > 0 ) return;
					var a = JSON.parse(JSON.stringify(d));
					a.__metadata = "";
					a.Networkactivity = "";
					a.Activity = "";
					aPredecessorsList.push( a );
				});
				
				// list of activities 
				aActivityList.filter(function(oActivity) {
					return oActivity.Network === sPredecessorNetwork && sPredecessorNetwork !== "";
				}).forEach(function(d) {
					// populate the list of activities as possible predecessor
					aPredecessorsList.push( JSON.parse(JSON.stringify(d)) );
				});
				
				return aPredecessorsList;
				
			},
			
			/**
			 * Returning the editable level
			 * @private
			 */
			_isEditable : function (sActivity) {
				if ( sActivity === undefined || sActivity === "" ) {
					return false;
				}
				return true;
			}

		});
	}
);