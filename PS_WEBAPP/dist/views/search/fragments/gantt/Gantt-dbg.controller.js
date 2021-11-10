/*global location history */
sap.ui.define([
		"epta/ps/views/search/Search.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"epta/ps/model/models",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"epta/ps/ui5/controller/ErrorHandler",
		'sap/ui/export/library',
		'sap/ui/export/Spreadsheet'
	], function (SearchController, JSONModel, formatter, models, Filter, FilterOperator, ErrorHandler, exportLibrary, Spreadsheet) {
		"use strict";
		var EdmType = exportLibrary.EdmType;
		return SearchController.extend("epta.ps.views.search.fragments.gantt.Gantt", {
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Subscribe to search event emitted by 'Filters' view
				this.getEventBus().subscribe("_onSearch", "start", this._onSearch, this);
				this.getEventBus().subscribe("_onSearch", "end", this._onSearch, this);
				debugger
				this.getView().byId("gntGanttChartContainer").addCustomToolbarItem(new sap.m.Toolbar({
					content: [
						new sap.m.Button({
							icon: "sap-icon://download",
							press: this.exportExcel.bind(this)
						}),
						new sap.m.ToolbarSpacer({ width: "10px" })
					]
				}));
				this.activitiesTree = [];
				
			},
			
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
			
			/**
			 * This method is called when a row of the Gantt table is selected.
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onRowSelectionChange : function (oEvent) {
				// Retrieve the context of the event
				debugger
				var oCtx = oEvent.getParameters().originEvent.getParameter("rowContext");
				
				// Check if the selection is empty
				if( !oCtx ) {
					this.getView().getModel("footer").setProperty("/project", "");
					this.getView().getModel("footer").setProperty("/enable", false);
					return;
				}
				
				// Check if the user is enabled to access the prohect
				if( oCtx.getModel().getProperty( oCtx.getPath() + "/table/FunctionEnabled" ) !== "X" ) {
					this.getView().getModel("footer").setProperty("/project", "");
					this.getView().getModel("footer").setProperty("/enable", false);
					return;
				}
				
				// Get the ID of the selected project
				var sProjectId = oCtx.getModel().getProperty( oCtx.getPath() + "/table/Wbselement" );
				
				this.getView().getModel("footer").setProperty("/project", sProjectId);
				this.getView().getModel("footer").setProperty("/enable", true);
				
			},
			
			/**
			 * Method used to modfy the note
			 * @function
			 * @private
			 */
			onNoteModify : function(oEvent) {
				
				// get context
				this._oSelectedContext = oEvent.getSource().getParent().getBindingContext();
				
				// set local variable for the dialog
				if (! this._oNoteDialog) {
					this._oNoteDialog = sap.ui.xmlfragment("epta.ps.views.search.fragments.gantt.fragments.DialogNote", this);
					this.getView().addDependent(this._oNoteDialog);
				}
				
				this._oNoteDialog.getContent()[0].setValue( this._oSelectedContext.oModel.getProperty( this._oSelectedContext.sPath + "/table/Longtext") );
				
				// open dialog
				this._oNoteDialog.open();
				
			},
			
			/**
			 * Method used to save the note
			 * @function
			 * @private
			 */
			onNoteDialogSave : function(oEvent) {
				var self = this;
				// text
				var sLongtext = oEvent.getSource().getContent()[0].getValue();
				// update model
				this._oSelectedContext.oModel.setProperty( this._oSelectedContext.sPath + "/table/Longtext", sLongtext );
				// update service model
				this.getService().getModel().update(
					"/WBSProjectSet('" + this._oSelectedContext.oModel.getProperty( this._oSelectedContext.sPath + "/table/Wbselement" ) + "')",
					{ "Longtext": sLongtext },
					{ groupId: this.getService()._sGroupUpdateNoteId}
				)
				this.getService().saveData({
					groupId: this.getService()._sGroupUpdateNoteId,
					success: function (oData) {
						//Success popup dialog 
						self._onSuccessOrFailureDialog(oData, "{i18n>ui5Success}", "Success", "{i18n>ui5Success}");
					},
					error: function(oError) { 
						//Failure popup dialog
						self._onSuccessOrFailureDialog(oError, "{i18n>ui5Failure}", "Error", "{i18n>ui5Failure}");
					}
				});
			},
			
			
	/* =========================================================== */
	/* internal methods                                            */
	/* =========================================================== */
			
			/**
			 * This method is called as soon as an event is emitted on the channel '_onSearch'.
			 * @public
			 * @param {string} sChannelId the ID of the channel
			 * @param {string} sEventId the ID of the event
			 * @param {object} oData the data object
			 */
			_onSearch : function (sChannelId, sEventId, oData) {
				
				// Set the busy indicator when the search starts
				if ( sEventId === "start" ) {
					this.getView().setBusy(true);
					return;
				}
				
				// Prepare the data model for the Gantt chart
				var oGanttModel = models.createGanttBaseModel();
				oData.results.forEach(function(oProject) {
					// test case to visualize the button to open text dialog
					// oProject.Longtext = oProject.Wbselement === "18.00042.2" ? "testo prova" : "";
					oGanttModel.root.children.push(oProject);
				});
				// Structure activities array as a tree
				var activitiesTree = this._activitiesToTree(oData.results);
				// Set data to the Gantt
				debugger
				this.activitiesTree = oData.results;

				this.getView().byId("gntGanttChartTable").setData(activitiesTree);
				
				// Hide the busy indicator
				this.getView().setBusy(false);
				
				// Jump Gantt view to today
				var oGanttChartWithTable = this.getView().byId("gntGanttChartContainer").getGanttCharts()[0];
				oGanttChartWithTable.jumpToPosition(new Date());
				
			},
			
			/*
			 * Unflattens an array to a dummy tree for the GANTT.
			 * @private
			 * @returns {object} oTree
			 */
			_activitiesToTree: function (aWBSList) {
				
				// init the data model
				var oTree = models.createGanttBaseModel();
				
				for (var i = 0; i < aWBSList.length; i++ ) {
					
					var oWBS = aWBSList[i];
					
					// evaluate the basic start date
					var dBasicstartdate = oWBS.Basicstartdate;
					if (dBasicstartdate) {
						dBasicstartdate = new Date(new Date(dBasicstartdate).getTime() + new Date(dBasicstartdate).getTimezoneOffset() * 60000);
					}
					// evaluate the basic end date
					var dBasicenddate = oWBS.Basicenddate;
					if (dBasicenddate) {
						dBasicenddate = new Date(new Date(dBasicenddate).getTime() + new Date(dBasicenddate).getTimezoneOffset() * 60000);
					}
					
					// evaluate the forecast start date
					var dForecastedstartdate = oWBS.Forecastedstartdate;
					if (dForecastedstartdate) {
						dForecastedstartdate = new Date(new Date(dForecastedstartdate).getTime() + new Date(dForecastedstartdate).getTimezoneOffset() * 60000);
					}
					// evaluate the forecast end date
					var dForecastedenddate = oWBS.Forecastedenddate;
					if (dForecastedenddate) {
						dForecastedenddate = new Date(new Date(dForecastedenddate).getTime() + new Date(dForecastedenddate).getTimezoneOffset() * 60000);
					}
					
					// set the WBS description
					var sWbsDescription = oWBS.Wbsdescription;
					
					var sTooltip = "";
					
					var oWBSItem = {
						"id": ("000" + i).substr(-3),
						"wbs": oWBS.Wbselement,
						"level": "01",
						"name": sWbsDescription,
						"tooltip": sWbsDescription,
						"table": oWBS,
						"children": [],
						"order": []
					};
					
					// check basic dates before adding a line
					if ( oWBS.Basicstartdate && oWBS.Basicenddate ) {
						// tooltip for basic dates
						sTooltip = ("0" + dBasicstartdate.getDate() ).substr(-2) + "/" + ("0" + (dBasicstartdate.getMonth()+1) ).substr(-2);
						sTooltip += " - " + ("0" + dBasicenddate.getDate() ).substr(-2) + "/" + ("0" + (dBasicenddate.getMonth()+1) ).substr(-2);
						
						oWBSItem.order.push({
							"startTime": dBasicstartdate,
							"endTime": dBasicenddate,
							"level": "0",
							"name": sTooltip
						});
					}
					
					// check forecast dates before adding a child
					if ( oWBS.Forecastedstartdate && oWBS.Forecastedenddate ) {
						// tooltip for forecast dates
						sTooltip = ("0" + dForecastedstartdate.getDate() ).substr(-2) + "/" + ("0" + (dForecastedstartdate.getMonth()+1) ).substr(-2);
						sTooltip += " - " + ("0" + dForecastedenddate.getDate() ).substr(-2) + "/" + ("0" + (dForecastedenddate.getMonth()+1) ).substr(-2);
						
						// Add children to the activity item
						oWBSItem.children.push({
							"id": oWBS.Wbselement,
							"level": "02",
							"name": sWbsDescription,
							"tooltip": sTooltip,
							"order": [{
								"startTime": dForecastedstartdate,
								"endTime": dForecastedenddate,
								"level": "1",
								"name": sTooltip
							}],
							"table": {
								"Longtext": ""
							}
						});
					}
					
					// add the wbs item to the children's list
					oTree.root.children.push(oWBSItem);
					
					// set the Gantt start time to fit the wbs shown
					if ( dForecastedstartdate && dForecastedstartdate < oTree.ganttStartTime ) {
						oTree.ganttStartTime = dForecastedstartdate;
					}
					if ( dBasicstartdate && dBasicstartdate < oTree.ganttStartTime ) {
						oTree.ganttStartTime = dBasicstartdate;
					}
					
					// set the Gantt end time to fit the wbs shown
					if ( dForecastedenddate && dForecastedenddate > oTree.ganttEndTime ) {
						oTree.ganttEndTime = dForecastedenddate;
					}
					if ( dBasicenddate && dBasicenddate > oTree.ganttEndTime ) {
						oTree.ganttEndTime = dBasicenddate;
					}
					
					
				}
				
				// Set the Gantt start date to the beginning of the month, while the Gantt end date to the end of the month
				oTree.ganttStartTime = formatter.dateToString( new Date(oTree.ganttStartTime.getFullYear(), oTree.ganttStartTime.getMonth() + 1, 1) );
				oTree.ganttEndTime = formatter.dateToString( new Date(oTree.ganttEndTime.getFullYear(), oTree.ganttEndTime.getMonth() + 3, 0) );
				
				return oTree; 
				
			},
			exportExcel: function (oEvent) {

				var oSettings, oSheet;
				oSettings = {
					workbook: {
						columns: this.createColumnConfig(),
						hierarchyLevel: 'Level'
					},
					dataSource: this.activitiesTree,
					fileName: 'ProjectManage.xlsx',
					worker: false // We need to disable worker because we are using a MockServer as OData Service
				};
		
				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function() {
					oSheet.destroy();
				});

			},
			createColumnConfig: function () {
	
				var i18n = this.getModel("i18n").getResourceBundle();
	
				var aCols = [];

				aCols.push({
					label: i18n.getText("tblWBE"),
					property: 'Wbselement',
					type: EdmType.String,
					width: '11em'
				});
	
				aCols.push({
					label: i18n.getText("tblWBEDescription"),
					property: 'Wbsdescription',
					type: EdmType.String,
					width: '20em'
				});
				aCols.push({
					label: i18n.getText("tblWbsForecastStartDate"),
					property: 'Forecastedstartdate',
					type: EdmType.Date
				});
				aCols.push({
					label: i18n.getText("tblWbsForecastFinishDate"),
					property: 'Forecastedenddate',
					type: EdmType.Date
				});

				aCols.push({
					label: i18n.getText("tblWbsBasicStartDate"),
					property: 'Basicstartdate',
					type: EdmType.Date
				});

				aCols.push({
					label: i18n.getText("tblWbsBasicFinishDate"),
					property: 'Basicenddate',
					type: EdmType.Date
				});


				return aCols;
	
			}
			
		});
	}
);