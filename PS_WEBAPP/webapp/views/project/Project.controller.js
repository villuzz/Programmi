/*global location*/
sap.ui.define([
		"epta/ps/ui5/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"epta/ps/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessagePopover",
		"sap/m/MessageItem",
		"sap/m/MessageToast",
		"sap/ui/core/ValueState",
		"sap/m/Dialog",
		"sap/m/DialogType",
		"sap/m/Button",
		"sap/m/ButtonType",
		"sap/m/Text"
	], function ( BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessagePopover, MessageItem, MessageToast, ValueState, Dialog, DialogType, Button, ButtonType, Text) {
		"use strict";
		var textAreaValue="";
		
		return BaseController.extend("epta.ps.views.project.Project", {
			formatter: formatter,
			metadata : {
				properties : {
					showTitle  : { type : "boolean", defaultValue : false }
				}
			},
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			_projectId : undefined,
			
			_changes : {},
			
			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var self = this;
				
				// attach the navigation event to the current page
				this.getRouter().getRoute("project").attachPatternMatched(this._onObjectMatched, this);
				// attach event handler for the population of the message popover
				this.getEventBus().subscribe("_onODataModel", "error", this._onODataModel, this);
				
				// create model for footer visibility
				this.setModel(new JSONModel({
					"footer": {
						"messages": 0,
						"cancel": false,
						"save": false,
						"filter": false,
						"enabled": true
					}
				}), "layout");
				
				// init model that contains changes to be sent to SAP through batch request
				this.setModel(new JSONModel(), "ChangeModel");
				
				// init message popover model
				this._oMsgModel = new JSONModel([]);
				
				// init message popover
				this._oMessagePopover = new MessagePopover({
					"items": {
						"path": "/",
						"template": new MessageItem({
							"type": "{type}",
							"title": "{title}",
							"description": "{description}",
							"subtitle": "{subtitle}"
						})
					},
					"beforeClose": function (oEvt) {
						// reset counter
						self.getModel("layout").setProperty("/footer/messages",0);
					}
				});
				this._oMessagePopover.setModel(this._oMsgModel);
				
			},
			
			onBeforeRendering : function () {
				// Initialize the models
				this.setModel(new JSONModel(), "Hierarchy");
				this.setModel(new JSONModel(), "NetworkActivity");
				this.setModel(new JSONModel(), "ProjectHeader");
				this.setModel(new JSONModel(), "WbselementData");
				this.setModel(new JSONModel(), "PurReq");
				this.setModel(new JSONModel(), "InstallationManager");
				this.setModel(new JSONModel(), "Vendor");
				this.setModel(new JSONModel(), "WorkCenter");
				this.setModel(new JSONModel(), "SearchUom");
				this.setModel(new JSONModel(), "SearchCurc");
				this.setModel(new JSONModel(), "InstallationManagerFilter");
				this.setModel(new JSONModel(), "OrderEOS");
				// Set busy indicator
				this.getView().setBusy(true);
			},

	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */

			/**
			 * Event handler for navigating back.
			 * If there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				// Emit an event to destroy all models created (if any)
				this.getEventBus().publish("_onNavBack", "clearModel", {});
				
				this.getRouter().navTo("search", true);
			},
			
			/**
			 * Method used to modfy the note
			 * @function
			 * @private
			 */
			onNoteModify : function(oEvent) {
				
				// set local variable for the dialog
				if (! this._oNoteDialog) {
					this._oNoteDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.fragments.DialogNote", this);
					this.getView().addDependent(this._oNoteDialog);
				}
				
				// open dialog
				this._oNoteDialog.open();
				
			},
			
			/**
			 * Method used to save the note
			 * @function
			 * @private
			 */
			onNoteDialogSave : function(oEvent) {
				// update service model
				this.getService().getModel().update(
					"/ProjectHeaderSet('" + this.getModel("ProjectHeader").getProperty("/Wbselement") + "')",
					{ "Longtext": this.getModel("ProjectHeader").getProperty("/Longtext") },
					{groupId: this.getService()._sGroupUpdateNoteId}
				);
				this.fireBatchSave(this.getService()._sGroupUpdateNoteId);
			},
			
			/**
			 * Event handler for selecting the page.
			 * @public
			 */
			onIconTabItemSelect : function(oEvent) {
				var oPanel = this.getView().byId("prjPanel");
				// Check if the panel is expanded and close it
				if( oPanel.getExpanded() ) {
					oPanel.setExpanded(false);
				}
				// Check if the tab bar is expanded; in case not, open the panel
				if( !oEvent.getSource().getExpanded() ) {
					oPanel.setExpanded(true);
				}
			},

			onConfirmDialog : function(oEvent) {
				var dialog = new sap.m.Dialog({
					title: "{i18n>ui5Confirm}",
					type: "Message",
					content: new sap.m.Text({ text: "{i18n>ui5ConfirmText}" }),
					// confirm
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "{i18n>ui5Submit}",
						press: function () {
							dialog.close();
						}
					}),
					// cancel
					endButton: new sap.m.Button({
						text: "{i18n>ui5Cancel}",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			},

			onBatchCancel : function(oEvent) {
				var self = this;
				//Creating Dialog
				var dialog = new sap.m.Dialog({
					title: "{i18n>ui5Confirm}",
					type: 'Message',
					content: new sap.m.Text({ text: "{i18n>ui5ConfirmText}" }),
					// confirm
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "{i18n>ui5Submit}",
						press: function () {
							self._onFooterCancel(self);
							// reset changes from service model
							if( Object.entries(self.getService().getModel().mDeferredRequests).length > 0 ) {
								self.getService().getModel().mDeferredRequests = {};
							}
							// refresh data
							self._refreshData(self._projectId);	
							// close dialog
							dialog.close();
						}
					}),
					// cancel
					endButton: new sap.m.Button({
						text: "{i18n>ui5Cancel}",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			},
			
			/*
			 * @_onFooterCancel
			 * @public
			   @function
			   Open the confirmation/denial dialog after the user pressed the footerSave button
			*/
			onBatchSave : function(oEvent) {
				var self = this;
				
				//Creating Dialog
				var dialog = new sap.m.Dialog({
					title: "{i18n>ui5Confirm}",
					type: "Message",
					content: new sap.m.Text({ text: "{i18n>ui5ConfirmText}" }),
					// confirm
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "{i18n>ui5Submit}",
						press: function () {
							
							// check pending changes
							if( Object.entries(sap.ui.getCore().byId("ZPS_WEBAPP---project").getController().getModel("ChangeModel").getData()).length === 0 ) {
								// close dialog
								dialog.close();
								return false;
							}
							
							self.fireBatchSave();
							dialog.close();
						}
					}),
					// cancel
					endButton: new sap.m.Button({
						text: "{i18n>ui5Cancel}",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			},
			
			/**
			 * Press the button save
			 */
			fireBatchSave : function(sGroupId) {
				var self = this;
				this.getView().setBusy(true);
				// flag to detect whether Apoc is updated
				var bApocUpdate = false;
				
				// create requests
				Object.keys( this.getModel("ChangeModel").getData() ).forEach(function(sController) {
					var aKeys = Object.keys( self.getModel("ChangeModel").getProperty("/" + sController) );
					if( sController === "epta.ps.views.project.fragments.projectPlan.ProjectPlan" ) {
						aKeys = Object.keys( self.getModel("ChangeModel").getProperty("/" + sController) ).sort();
					}
					aKeys.forEach(function(sKey) {
						var oData = self.getModel("ChangeModel").getProperty("/" + sController)[sKey]
						self.getService().getModel().update(oData.service, oData.data, {groupId: oData.groupId});
						// detect if Apoc is updated
						if( !bApocUpdate ) {
							bApocUpdate =  Object.keys( self.getModel("ChangeModel").getProperty("/" + sController)[sKey].data ).indexOf("Apoc") >= 0
						}
					});
				});
				
				// save data
				var args = {
					success: function (oData) { 
						self.getView().setBusy(false);
						// init response status
						var nStatus = 400;
						// update status with the real one
						try {
							if( oData.__batchResponses[0].response && oData.__batchResponses[0].response.statusCode ) {
								nStatus = parseInt(oData.__batchResponses[0].response.statusCode);
							} else if( oData.__batchResponses[0].__changeResponses && oData.__batchResponses[0].__changeResponses[0] ) {
								nStatus = parseInt(oData.__batchResponses[0].__changeResponses[0].statusCode || oData.__batchResponses[0].__changeResponses[0].response.statusCode);
							}
						} catch(e) {}
						// error popup dialog
						if( [200,202,204].indexOf( nStatus ) < 0 ) {
							self._onSuccessOrFailureDialog(oData, "{i18n>ui5Failure}", "Error", "{i18n>ui5FailureText}");
							// refresh data
							self._refreshData(self._projectId);	
						}
						// success popup dialog
						else {
							self._onSuccessOrFailureDialog(oData, "{i18n>ui5Success}", "Success", "{i18n>ui5SuccessText}");	
							// refresh data
							self.getEventBus().publish("_onProjectDetail", "refresh", self.getModel("NetworkActivity").getData());
						}
						// clean changes data
						self.getModel("ChangeModel").setData({});

						// check if the overall (header) percentage of completition has to be updated
						if( bApocUpdate ) {
							self._refreshDataHeader(self._projectId);
						}
						
					},
					error: function(oError) { 
						// reset busy indicator
						self.getView().setBusy(false);
						// error popup dialog
						self._onSuccessOrFailureDialog(oError, "{i18n>ui5Failure}", "Error", "{i18n>ui5FailureText}");
					}
				};
				if( sGroupId ) {
					args.groupId = sGroupId;
				}
				this.getService().saveData(args);
				
			},
			
			handleMessagePopoverPress: function (oEvent) {
				this._oMessagePopover.toggle(oEvent.getSource());
			},
			
			
			/**
			 * Opens the dialog to filter data in the table
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onTableFilter: function(oEvent) {
				try {
					// retrieve the content of the page and open the popup
					var oTabBar = this.getView().getContent()[0].getContent()[0].getFlexContent();
					var oTabBarItem = oTabBar.getItems().filter(function(oItem) { return oItem.sId === oTabBar.getSelectedKey(); })[0];
					oTabBarItem.getContent()[0].getContent()[0].getContent()[0].openFilterDialog();
				} catch(e) {}
				
			},
			
			/**
			 * Opens the message dialog to show details about the status
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onShowProgressInfo: function () {
				
				var sState = ValueState.Information;
				switch( this.getModel("ProjectHeader").getProperty("/Ontime") ) {
					case "O":
						sState = ValueState.Success;
						break;
					case "W":
						sState = ValueState.Warning;
						break;
					case "D":
						sState = ValueState.Error;
						break;
					default:
						return;
				}
				
				var sStateTitle = "";
				var sStateDesc = "";
				switch( this.getModel("ProjectHeader").getProperty("/Ontime") ) {
					case "O":
						sStateTitle = "{i18n>ui5Success}";
						sStateDesc = "{i18n>prgStatusOnTime}";
						break;
					case "W":
						sStateTitle = "{i18n>ui5Warning}";
						sStateDesc = "{i18n>prgStatusWarning}";
						break;
					case "D":
						sStateTitle = "{i18n>ui5Failure}";
						sStateDesc = "{i18n>prgStatusDelay}";
						break;
					default:
						return;
				}
				
				
				
				if (!this.oMessageDialog) {
					
					this.oMessageDialog = new Dialog({
						type: DialogType.Message,
						title: sStateTitle,
						state: sState,
						content: new Text({ text: sStateDesc }),
						beginButton: new Button({
							type: ButtonType.Emphasized,
							text: "OK",
							press: function () {
								this.oMessageDialog.close();
							}.bind(this)
						})
					});
					
				}
				
				this.oMessageDialog.open();
			},
			
	/* =========================================================== */
	/* internal methods                                            */
	/* =========================================================== */
			
			/**
			 * This method is called as soon as an event is emitted on the channel '_onODataModel'.
			 * @public
			 * @param {string} sChannelId the ID of the channel
			 * @param {string} sEventId the ID of the event
			 * @param {object} oData the data object
			 */
			_onODataModel : function (sChannelId, sEventId, oData) {
				this._oMsgModel.getData().push({
					"type": oData.type,
					"title": oData.title,
					"description": oData.message
				});
				this.getModel("layout").setProperty("/footer/messages", this.getModel("layout").getProperty("/footer/messages") + 1 );
				this._oMsgModel.refresh();
			},
			
			/**
			 * Add change to the local model
			 */
			_addChange : function(sController,sTopic,sService,oData,sGroupId) {
				var oChangeModel = this.getModel("ChangeModel");
				if( !oChangeModel.getProperty("/" + sController ) ) {
					oChangeModel.setProperty("/" + sController, {});
				}
				oChangeModel.getProperty("/" + sController)[sTopic + sService] = {
					service: sService,
					data: oData,
					groupId: sGroupId
				};
			},
			
			/**
			 * Message Toast to be shown on success
			 */
			_onSuccess : function() {
				sap.m.MessageToast.show("Saved", {
					duration: 3000,
					width: "10em",
					my: "center bottom",
					at: "center bottom",
					of: window,
					offset: "0 0",
					collision: "fit fit",
					onClose: null,
					autoClose: true,
					animationTimingFunction: "ease",
					animationDuration: 1000,
					closeOnBrowserNavigation: true
				});
			},
			
			/*
			 * @_onFooterCancel
			 * @private
			   @function
			   Executed when the user press footerCancel button
			*/
			_onFooterCancel : function (self){
				// reset changes from service model
				if(self.getService().getModel().hasPendingChanges() ) {
					var mChanges = self.getService().getModel().getPendingChanges();
					for (var i in mChanges) {
						self.getService().getModel().resetChanges(mChanges[i]);
					}
				}
				// refresh data
				self._refreshData(self._projectId);		
			},
			
			/**
			 * Binds the view to the object path.
			 * @function
			 * @private
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 */
			_onObjectMatched : function (oEvent) {
				this._projectId = oEvent.getParameter("arguments").projectId;
				// Get the ID of the project
				this._refreshData( oEvent.getParameter("arguments").projectId );
			},
			
			/**
			 * Refresh data for the target projet calling the OData service
			 * @function
			 * @private
			 * @param {string} sProjectId ID of the project
			 */
			_refreshData : function(sProjectId) {
				var self = this;
				this.getView().setBusy(true);
				debugger
				this.getService().readProjectDataById({
					projectId: sProjectId,
					success: function (oData) {
						var oResult = {
							"Hierarchy" : oData.__batchResponses[0].data.results,
							"NetworkActivity" : oData.__batchResponses[1].data.results,
							"ProjectHeader" : oData.__batchResponses[2].data,
							"WbselementData" : oData.__batchResponses[3].data.results,
							"PurReq" : oData.__batchResponses[4].data ? oData.__batchResponses[4].data.results : [],
							"InstallationManager" : oData.__batchResponses[5].data.results,
							"Vendor" : oData.__batchResponses[6].data.results,
							"WorkCenter" : oData.__batchResponses[7].data.results,
							"SearchUom" : oData.__batchResponses[8].data.results,
							"SearchCurc" : oData.__batchResponses[9].data.results,
							"InstallationManagerFilter" : oData.__batchResponses[10].data.results,
							"OrderEOS" : oData.__batchResponses[11].data.results,
						};
						self.getModel("Hierarchy").setData( oResult.Hierarchy );
						self.getModel("NetworkActivity").setData( self._prepareNetworkActivity(oResult.NetworkActivity) );
						self.getModel("ProjectHeader").setData( oResult.ProjectHeader );
						self.getModel("WbselementData").setData( self._prepareWBSelementData(oResult.WbselementData, oResult.Hierarchy) );
						self.getModel("PurReq").setData( oResult.PurReq );
						self.getModel("InstallationManager").setData( oResult.InstallationManager );
						self.getModel("Vendor").setData( oResult.Vendor );
						self.getModel("WorkCenter").setData( oResult.WorkCenter );
						self.getModel("SearchUom").setData( oResult.SearchUom );
						self.getModel("SearchCurc").setData( oResult.SearchCurc );
						self.getModel("InstallationManagerFilter").setData( oResult.InstallationManagerFilter );
						self.getModel("OrderEOS").setData( oResult.OrderEOS );
						self.getView().setBusy(false);
						self.getEventBus().publish("_onProjectDetail", "read", oResult);
					},
					error: function(oError) {
						// Reset busy indicator
						self.getView().setBusy(false);
					}
				});
				
			},
			
			/** ***************************************************************************************************************************************************************
			 * Refresh header data percentage of completition
			 * @function
			 * @private
			 * @param {string} sProjectId ID of the project
			 */
			_refreshDataHeader : function(sProjectId) {
				var self = this;
				this.getService().readProjectHeaderDataById({
					projectId: sProjectId,
					success: function (oData) {
						self.getModel("ProjectHeader").setProperty("/Percentheader", oData.__batchResponses[0].data.Percentheader);
					},
					error: function(oError) {
						// Reset busy indicator
						self.getView().setBusy(false);
					}
				});
				
			},
			
			/**
			 * Method used to evaluate the network activities
			 * @function
			 * @params {array} aNetworkActivity List of Nectwork activities
			 * @returns {array} List of Network activities
			 * @private
			 */
			_prepareNetworkActivity : function(aNetworkActivity) {
				
				for( var i = 0; i < aNetworkActivity.length; i++ ) {
					var oItem = aNetworkActivity[i];
					if( oItem.UserStatus && oItem.UserStatus.StatusId && ("CONF" === oItem.UserStatus.StatusId.substring(0,4) || "SCHE" === oItem.UserStatus.StatusId) ) {
						oItem.Freedefineddate1 = null;
					}
				}
				
				return aNetworkActivity;
			},
			
			/**
			 * Method used to merge WBS elements data and related hierarchy reference
			 * @function
			 * @params {array} aActivities List of WBS activities
			 * @params {array} aHierarchy WBS hierarchy structure
			 * @returns {array} List of WBS activities
			 * @private
			 */
			_prepareWBSelementData : function(aActivities, aHierarchy) {
				
				for( var i = 0; i < aActivities.length; i++ ) {
					
					// level 1 and 2 are always disabled
					if( aActivities[i].Wbselementhierarchylevel < 3 ) {
						aActivities[i].isAPEnabled = false;
					}
					
					// level 3
					if( aActivities[i].Wbselementhierarchylevel >= 3 ) {
						aActivities[i].isAPEnabled = aActivities[i].Enabled && ["RSPS","RIAM"].indexOf(aActivities[i].UserStatus.StatusId) < 0;
					}
					
					// add parent reference
					for( var j = 0; j < aHierarchy.length; j++ ) {
						if( aHierarchy[j].Wbselement === aActivities[i].Wbselement ) {
							aActivities[i].Wbselementparent = aHierarchy[j].Up;
							break;
						}
					}
					
					// update Freedefineddate1 based on the status
					if( "CONF" === aActivities[i].UserStatus.StatusId.substring(0,4) || "" === aActivities[i].UserStatus.StatusId ) {
						aActivities[i].isAPEnabled = true;
						aActivities[i].Freedefineddate1 = null;
					} else {
						aActivities[i].isAPEnabled = false;
					}
					
				}
				
				return aActivities;
			}
			
		});

	}
);