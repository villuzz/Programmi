/*global location history */
sap.ui.define([
		"epta/ps/views/project/Project.controller",
		"sap/ui/model/json/JSONModel",
		"epta/ps/model/formatter",
		"epta/ps/model/models",
		'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
	], function (BaseController, JSONModel, formatter, models, exportLibrary, Spreadsheet) {
		"use strict";
		var EdmType = exportLibrary.EdmType;

		return BaseController.extend("epta.ps.views.project.fragments.projectPlan.ProjectPlan", {

	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Subscribe to data loaded event
				this.getEventBus().subscribe("_onProjectDetail", "read", this._onDataLoaded, this);
				this.getEventBus().subscribe("_onProjectDetail", "refresh", this._onDataLoaded, this);
				this.setModel(new JSONModel(), "_dprog");
				this._controller = this.getView().getControllerName();
				this.getView().byId("prpGanttChartContainer").addCustomToolbarItem(new sap.m.Toolbar({
					content: [
						new sap.m.Button({
							icon: "sap-icon://download",
							press: this.exportExcel.bind(this)
						}),
						new sap.m.ToolbarSpacer({ width: "10px" })
					]
				}));
			},
			
			/**
			 * Called before the page is rendered.
			 * @public
			 */
			onBeforeRendering : function () {
				this.getModel("layout").setProperty( "/footer/save", true );
				this.getModel("layout").setProperty( "/footer/cancel", true );
				this.getModel("layout").setProperty( "/footer/filter", false );
				this.getModel("layout").setProperty( "/footer/enabled", true );
			},
			exportSpreadsheet: function (settings, fnSuccess, fnFail) {
				return new sap.ui.export.Spreadsheet(settings)
					.build()
					.catch(fnFail ? fnFail.bind(this) : null)
					.then(fnSuccess ? fnSuccess.bind(this) : null);
			},
			exportExcel: function (oEvent) {

				var oSettings, oSheet;
				oSettings = {
					workbook: {
						columns: this.createColumnConfig(),
						hierarchyLevel: 'Level'
					},
					dataSource: this.aWBSActivityList,
					fileName: 'ProjectPlan.xlsx',
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
					label: 'Level',
					property: 'Wbselementhierarchylevel',
					type: EdmType.String
				});

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
					label: i18n.getText("tblSerialNo"),
					property: 'Serialno',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblNetwork"),
					property: 'Projectnetwork',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblActivity"),
					property: 'Networkactivity',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblActivityDescription"),
					property: 'Description',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblNetworkPredecessor"),
					property: 'NetworkPredecessor',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblActivityPredecessor"),
					property: 'ActivityPredecessor',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblUserStatus"),
					property: 'UserStatus',
					type: EdmType.String
				});
				aCols.push({
					label: 'Description',
					property: 'StatusText',
					type: EdmType.String
				});
				aCols.push({
					label: i18n.getText("tblWbsForecastDuration"),
					property: 'Forecastedduration',
					type: EdmType.Number
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
					label: i18n.getText("tblWbsBasicDuration"),
					property: 'Basicduration',
					type: EdmType.Number
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
				aCols.push({
					label: i18n.getText("tblWbsAddStartDate"),
					property: 'Addstartdate',
					type: EdmType.Date
				});
				aCols.push({
					label: i18n.getText("tblWbsAddFinishDate"),
					property: 'Addfinishdate',
					type: EdmType.Date
				});
				aCols.push({
					label: i18n.getText("tblAdvPostDate"),
					property: 'Freedefineddate1',
					type: EdmType.Date
				});
				aCols.push({
					label: i18n.getText("tblPoc"),
					property: 'Apoc',
					type: EdmType.Number
				});
				aCols.push({
					label: i18n.getText("tblWbsActualDate"),
					property: 'Datab',
					type: EdmType.Date
				});

				return aCols;
	
			},
			/**
			 * Called after the page is rendered.
			 * @public
			 */
			onAfterRendering : function() {
				// Jump Gantt view to today
				var oGanttChartWithTable = this.getView().byId("prpGanttChartContainer").getGanttCharts()[0];
				setTimeout(function() {
					oGanttChartWithTable.jumpToPosition(new Date());
				},1500);
			},
			
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
	
			/**
			 * This method is called as soon as an event is emitted on the channel '_onProjectDetail'.
			 * @public
			 * @param {string} sChannelId the ID of the channel
			 * @param {string} sEventId the ID of the event
			 * @param {object} oData the data object
			 */
			_onDataLoaded : function (sChannelId, sEventId, oData) {
				var self = this;
				var activitiesTree = "";
				// Structure activities array as a tree
				if( sEventId === "read" ) {
					activitiesTree = this._activitiesToTree(oData.NetworkActivity);
				} else if( sEventId === "refresh" ) {
					activitiesTree = this._activitiesToTree(oData);
				} else {
					return;
				}
				
				// sort array
				activitiesTree.root.children.sort(function(a,b){
					var res = 0;
					if( a.table.Wbselement > b.table.Wbselement ) { res = 1; }
					else if( a.table.Wbselement < b.table.Wbselement ) { res = -1; }
					else if( a.table.Wbselement === b.table.Wbselement ) {
						if( a.activity > b.activity ) { res = 1; }
						else { res = -1; }
					}
					return res;
				});
				
				// Set data to the Gantt
				this.getView().byId("prpGanttChartTable").setData(activitiesTree);
				
				// Jump Gantt view to today and refresh content
				var oGanttChartWithTable = this.getView().byId("prpGanttChartContainer").getGanttCharts()[0];
				setTimeout(function() {
					oGanttChartWithTable.jumpToPosition(new Date());
					self.getView().byId("prpGanttChartTable").rerender()
				},1500);
			},
			
			/**
			 * Called when a bar in the Gantt is moved
			 * @public
			 */
			handleShapeDragEnd : function (oEvent) {
				
				var ctxObj = oEvent.getParameter("sourceShapeData")[0].objectInfo.contextObj;
				
				var isBasicDates = (ctxObj.oModel.getProperty(ctxObj.sPath + "/id").indexOf("basic-") === 0);
				
				if( isBasicDates && ctxObj.oModel.getProperty(ctxObj.sPath + "/table/BasicstartdateLimit").setHours("00","00","00","000") > new Date(oEvent.getParameter("targetData").shapeTimestamp.startTime).setHours("00","00","00","000") ) {
					var dLimit = ctxObj.oModel.getProperty(ctxObj.sPath + "/table/BasicstartdateLimit");
					var sLimit = ( "00" + (dLimit.getDate()) ).substr(-2) + "/"
					           + ( "00" + (dLimit.getMonth() + 1) ).substr(-2) + "/"
					           + dLimit.getFullYear();
					this._onSuccessOrFailureDialog({}, "{i18n>ui5Warning}", "Warning", "{i18n>prpWarningDate}" + " (" + sLimit + ")" );
					return;
				}
				
				// time difference between end date and start date
				var timeDiff = ctxObj.oModel.getProperty(ctxObj.sPath + "/order/0/endTime") - ctxObj.oModel.getProperty(ctxObj.sPath + "/order/0/startTime");
				
				// update start time
				var startTime = new Date( new Date(oEvent.getParameter("targetData").shapeTimestamp.startTime).setHours("00","00","00","000") );
				this._updateTime(ctxObj.oModel, ctxObj.sPath, "/order/0/startTime", startTime);
				
				// update end time
				var endTime = new Date(startTime.getTime() + timeDiff );
				this._updateTime(ctxObj.oModel, ctxObj.sPath, "/order/0/endTime", endTime, isBasicDates);
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDateBasicStart : function(oEvent) {
				this.handleValueHelpDateBasic(oEvent, "Basicstartdate");
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDateBasicEnd : function(oEvent) {
				this.handleValueHelpDateBasic(oEvent, "Basicenddate");
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDateBasic : function(oEvent,sName) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				var oDialog = this["_oDialog" + sName];
				
				// set local variable for the dialog
				if (! oDialog) {
					oDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.projectPlan.fragments.Dialog" + sName, this);
					this.getView().addDependent(oDialog);
				}
				
				// reset local variable for the dialog
				oDialog.attachAfterClose(function() {
					oEvent.getSource().getContent().getContent()[0].removeAllSelectedDates();
				});
				
				// set date
				var date = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/" + sName);
				oDialog.getContent()[0].addSelectedDate( new sap.ui.unified.DateRange({
					startDate: date
				}));
				
				var dMinDate = new Date("1970-01-01");
				var dMaxDate = new Date("9999-12-31");
				if( sName === "Basicstartdate" ) {
					dMinDate = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/BasicstartdateLimit");
					dMaxDate = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/Basicenddate");
				} else if( sName === "Basicenddate" ) {
					dMinDate = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/Basicstartdate");
				}
				
				oDialog.getContent()[0].setMinDate(dMinDate);
				oDialog.getContent()[0].setMaxDate(dMaxDate);
				oDialog.getContent()[0].focusDate(date);
				
				// open dialog
				oDialog.open();
				
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDateAddStart : function(oEvent) {
				this.handleValueHelpDateAdd(oEvent, "Addstartdate");
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDateAddEnd : function(oEvent) {
				this.handleValueHelpDateAdd(oEvent, "Addfinishdate");
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpDateAdd : function(oEvent,sName) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oInputBinding = _oContext[Object.keys(_oContext)[0]];
				
				var oDialog = this["_oDialog" + sName];
				
				// set local variable for the dialog
				if (! oDialog) {
					oDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.projectPlan.fragments.Dialog" + sName, this);
					this.getView().addDependent(oDialog);
				}
				
				// reset local variable for the dialog
				oDialog.attachAfterClose(function() {
					oEvent.getSource().getContent().getContent()[0].removeAllSelectedDates();
				});
				
				// set date
				var date = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/" + sName);
				oDialog.getContent()[0].addSelectedDate( new sap.ui.unified.DateRange({
					startDate: date
				}));
				
				var dMinDate = new Date("1970-01-01");
				var dMaxDate = new Date("9999-12-31");
				//if( sName === "Addstartdate" ) {
				//	dMinDate = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/BasicstartdateLimit");
				//	dMaxDate = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/Addfinishdate");
				//} else 
				if( sName === "Addfinishdate" ) {
					dMinDate = this._oInputBinding.oModel.getProperty(this._oInputBinding.sPath + "/table/Addstartdate");
				}
				
				oDialog.getContent()[0].setMinDate(dMinDate);
				oDialog.getContent()[0].setMaxDate(dMaxDate);
				oDialog.getContent()[0].focusDate(date);
				
				// open dialog
				oDialog.open();
				
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogDateBasicStartSave : function(oEvent) {
				if( !this._oSelectedDate ) return;
				// update date
				var date = new Date( new Date(this._oSelectedDate).setHours("01","00","00","000") );
				this._updateTime(this._oInputBinding.oModel, this._oInputBinding.sPath, "/order/0/startTime", date, true);
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogDateBasicEndSave : function(oEvent) {
				if( !this._oSelectedDate ) return;
				// update date
				var date = new Date( new Date(this._oSelectedDate).setHours("01","00","00","000") );
				this._updateTime(this._oInputBinding.oModel, this._oInputBinding.sPath, "/order/0/endTime", date, true);
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogDateAddStartSave : function(oEvent) {
				if( !this._oSelectedDate ) return;
				// update date
				var date = new Date( new Date(this._oSelectedDate).setHours("01","00","00","000") );
				this._updateTime(this._oInputBinding.oModel, this._oInputBinding.sPath + "/children/0", "/order/0/startTime", date, false);
			},
			
			/**
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onDialogDateAddFinishSave : function(oEvent) {
				if( !this._oSelectedDate ) return;
				// update date
				var date = new Date( new Date(this._oSelectedDate).setHours("01","00","00","000") );
				this._updateTime(this._oInputBinding.oModel, this._oInputBinding.sPath + "/children/0", "/order/0/endTime", date, false);
			},
			
			/**
			 * Called on select date from calendar
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			onSelectDate : function (oEvent) {
				this._oSelectedDate = oEvent.getSource().getSelectedDates()[0].getProperty("startDate");
			},
			
			/**
			 * Method used to modfy the description of the activity
			 * @function
			 * @private
			 */
			onActivityDescModify : function(oEvent) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oSelectedContext = _oContext[Object.keys(_oContext)[0]];
				
				// set local variable for the dialog
				if (! this._oNoteDialog) {
					this._oNoteDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.projectPlan.fragments.DialogDescription", this);
					this.getView().addDependent(this._oNoteDialog);
				}
				
				this._oNoteDialog.getContent()[0].setValue( this._oSelectedContext.oModel.getProperty( this._oSelectedContext.sPath + "/table/Description") );
				
				// open dialog
				this._oNoteDialog.open();
				
			},
			
			/**
			 * Method used to save the description of the activity
			 * @function
			 * @private
			 */
			onActivityDescDialogSave : function(oEvent) {
				var self = this;
				// text
				var sDescription = oEvent.getSource().getContent()[0].getValue();
				// update model
				this._oSelectedContext.oModel.setProperty( this._oSelectedContext.sPath + "/table/Description", sDescription );
				// update service model
				this._handleChange( this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table"), { "Description": sDescription } );
/*
				this._addChange(
					this._controller,
					"Description",
					"/NetworkActivitySet(Projectnetwork='" + this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Projectnetwork") + "',"
						+ "Networkactivity='" + this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Networkactivity") + "',"
						+ "Wbselement='" + this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Wbselement") + "')",
					{ "Description": sDescription },
					this.getService()._sGroupUpdateId
				);
*/
			},
			
			/**
			 * Open the dialog with the list of records among which the user can choose the new responsible
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleValueHelpProgress : function(oEvent) {
				
				// get the binding of the source
				var _oContext = oEvent.getSource().getParent().oBindingContexts;
				this._oSelectedContext = _oContext[Object.keys(_oContext)[0]];
				this.getModel("_dprog").setProperty( "/progress", parseInt(this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Apoc"),10) );
				
				// set local variable for the dialog
				if (! this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("epta.ps.views.project.fragments.projectPlan.fragments.DialogProgress", this);
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
			onDialogProgressSave : function (oEvent) {
				var self = this;
				
				// text
				var sApoc = this.getModel("_dprog").getProperty("/progress").toString();
				// update model
				this._oSelectedContext.oModel.setProperty( this._oSelectedContext.sPath + "/table/Apoc", sApoc );
				// update service model
				this._handleChange( this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table"), { "Apoc": sApoc } );
/*
				this._addChange(
					this._controller,
					"Progress",
					"/NetworkActivitySet(Projectnetwork='" + this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Projectnetwork") + "',"
						+ "Networkactivity='" + this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Networkactivity") + "',"
						+ "Wbselement='" + this._oSelectedContext.oModel.getProperty(this._oSelectedContext.sPath + "/table/Wbselement") + "')",
					{ "Apoc": sApoc },
					this.getService()._sGroupUpdateId
				);
*/
			},
			
			/**
			 * Called when the basic duration is changed
			 * @public
			 * @param {sap.ui.base.Event} oEvent the event related to the selection
			 */
			handleChangeBasicDuration : function(oEvent) {
				var self = this;
				
				var oContext = oEvent.getSource().getParent().getBindingContext();
				var oData = oContext.oModel.getProperty(oContext.sPath + "/table");
				
				// update duration
				this._handleChange( oContext.oModel.getProperty(oContext.sPath + "/table"), {"Basicduration": oEvent.getParameter("value")} );
/*
				this._addChange(
					this._controller,
					"Basicduration",
					"/NetworkActivitySet(Projectnetwork='" + oContext.oModel.getProperty(oContext.sPath + "/table/Projectnetwork") + "',"
						+ "Networkactivity='" + oContext.oModel.getProperty(oContext.sPath + "/table/Networkactivity") + "',"
						+ "Wbselement='" + oContext.oModel.getProperty(oContext.sPath + "/table/Wbselement") + "')",
					{"Basicduration": oEvent.getParameter("value")},
					this.getService()._sGroupUpdateId
				);
*/
				
				this.getView().setBusy(true);
				var sBasicstart = oContext.oModel.getProperty(oContext.sPath + "/table/Basicstartdate").getFullYear() + "-"
					                + ( "00" + (oContext.oModel.getProperty(oContext.sPath + "/table/Basicstartdate").getMonth() + 1) ).substr(-2) + "-"
					                + ( "00" + (oContext.oModel.getProperty(oContext.sPath + "/table/Basicstartdate").getDate()) ).substr(-2)
					                + "T00:00:00";
				// update end date based on calendar
				this.getService().getCalendarDates({
					urlParameters: {
						"DateFrom": "datetime'" + oContext.oModel.getProperty(oContext.sPath + "/table/Basicstartdate").toISOString().substr(0,19) + "'",
						"Days": "'" + oEvent.getParameter("value") + "'"
					},
					success: function (oData) {
						debugger;
						self.getView().setBusy(false);
						self._updateTime(oContext.oModel, oContext.sPath, "/order/0/endTime", oData.DateTo);
					},
					error: function () {
						self.getView().setBusy(false);
					}
				});
				
			},
			
			
	/* =========================================================== */
	/* internal methods                                            */
	/* =========================================================== */

			
			/**
			 * Update time value
			 * @private
			 * @param {object} oModel
			 * @param {string} sPath
			 * @param {string} sPathSuffix
			 * @param {date} time
			 */
			_updateTime : function (oModel, sPath, sPathSuffix, time, bCalcDuration) {
				var self = this;
				
				var sPathDate = oModel.getProperty(sPath + sPathSuffix.substr(0,sPathSuffix.lastIndexOf("/")+1) + "type") + sPathSuffix.substr(sPathSuffix.lastIndexOf("/")+1).replace("Time","date");
				if( sPathDate === "Addenddate" ) sPathDate = "Addfinishdate";
				var oUpdate = JSON.parse("{\"" + sPathDate + "\":null}");
				
				// retrieve the correct path
				var sObjPath = sPath.substr(0, ( sPath.indexOf("/children/",15) > 0 ? sPath.indexOf("/children/",15) : sPath.length ) );
				
				// update Gantt date
				oModel.setProperty(sPath + sPathSuffix, time);
				// update table date
				var sTablePath = sObjPath + "/table/" + sPathDate;
				oModel.setProperty(sTablePath, oModel.getProperty(sPath + sPathSuffix) );
				
				// update service model
				oUpdate[sPathDate] = new Date( oModel.getProperty(sPath + sPathSuffix).getTime() - oModel.getProperty(sPath + sPathSuffix).getTimezoneOffset() * 60000 );
				
				// list of elements that can be updated
				var aUpdKeys = ["Description","Apoc","Basicduration","Basicstartdate","Basicenddate"];
				var isAddDates = false;
				if( sPathDate.substr(0,3) === "Add" ) {
					aUpdKeys = ["Addstartdate","Addfinishdate"];
					isAddDates = true;
				}
				this._handleChange( oModel.getProperty(sObjPath + "/table/"), oUpdate, aUpdKeys, isAddDates );
				
				// calculate duration
				if( bCalcDuration ) {
					
					this.getView().setBusy(true);
					var sBasicstart = oModel.getProperty(sPath + "/table/Basicstartdate").getFullYear() + "-"
					                + ( "00" + (oModel.getProperty(sPath + "/table/Basicstartdate").getMonth() + 1) ).substr(-2) + "-"
					                + ( "00" + (oModel.getProperty(sPath + "/table/Basicstartdate").getDate()) ).substr(-2)
					                + "T00:00:00";
					var sBasicend = oModel.getProperty(sPath + "/table/Basicenddate").getFullYear() + "-"
					              + ( "00" + (oModel.getProperty(sPath + "/table/Basicenddate").getMonth() + 1) ).substr(-2) + "-"
					              + ( "00" + (oModel.getProperty(sPath + "/table/Basicenddate").getDate()) ).substr(-2)
					              + "T00:00:00";
					// update duration based on calendar
					this.getService().getCalendarDates({
						urlParameters: {
							"DateFrom": "datetime'" + sBasicstart + "'",
							"DateTo": "datetime'" + sBasicend + "'"
						},
						success: function (oData) {
							self.getView().setBusy(false);
							oModel.setProperty(sPath + "/table/Basicduration", oData.Days);
							self._handleChange( oModel.getProperty(sPath + "/table"), {"Basicduration": oData.Days.toString()} );
						},
						error: function () {
							self.getView().setBusy(false);
						}
					});
					
				}
				
				// update gantt label
				var sTooltip = "";
				// start date
				sTablePath = sTablePath.replace( (sPathDate.indexOf("Add") === 0 ? "finish" : "end"), "start" );
				sTooltip = ("0" + oModel.getProperty(sTablePath).getDate() ).substr(-2) + "/" + ("0" + (oModel.getProperty(sTablePath).getMonth()+1) ).substr(-2);
				// end date
				sTablePath = sTablePath.replace( "start", (sPathDate.indexOf("Add") === 0 ? "finish" : "end") );
				sTooltip += " - " + ("0" + oModel.getProperty(sTablePath).getDate() ).substr(-2) + "/" + ("0" + (oModel.getProperty(sTablePath).getMonth()+1) ).substr(-2);
				// set tootltip to the shape
				setTimeout(function() {
					$("g[data-sap-gantt-row-id='" + oModel.getProperty(sPath + "/id") + "'] g title").html(sTooltip)
				},500);
				
			},
			
			/**
			 * Handle the change in the central storage for the later batch request 
			 */
			_handleChange: function(oData, oUpdate, aUpdKeys, isAddDates) {
				// list of elements that can be update
				debugger
				if( !aUpdKeys ) {
					aUpdKeys = ["Description","Apoc","Basicduration","Basicstartdate","Basicenddate"]; 
				}
				// TODO
				if( typeof isAddDates === "undefined" ) {
					isAddDates = false;
				}
				// var aUpdKeys = ["Description","Apoc","Basicduration","Basicstartdate","Basicenddate","Addstartdate","Addfinishdate"];
				// populate the update object
				aUpdKeys.forEach(function(sKey) {
					if( !oUpdate[sKey] ) {
						oUpdate[sKey] = oData[sKey];
						return;
					}
					
					if( sKey.substr(-4) !== "date" ) {
						oUpdate[sKey] = oUpdate[sKey].toString();
					}
				});
				
				// add the change for the batch process
				// in case of "Add" date the topic is different in order to handle the case
				this._addChange(
					this._controller,
					"PrjUpdate" + (isAddDates ? "_AddDates" : ""),
					"/NetworkActivitySet(Projectnetwork='" + oData.Projectnetwork + "',"
						+ "Networkactivity='" + oData.Networkactivity + "',"
						+ "Wbselement='" + oData.Wbselement + "')",
					oUpdate,
					this.getService()._sGroupUpdateId
				);
			},
			
			/*
			 * Unflattens an array to a dummy tree for the GANTT.
			 * @private
			 * @returns {object} oTree
			 */
			_activitiesToTree: function (aWBSActivityList) {
				
				// init the data model
				var oTree = models.createGanttBaseModel();
				
				// set the handover date
				var dHandoverDate = aWBSActivityList[0].Forecastedenddate || new Date().setHours("00","00","00","000");
				dHandoverDate = new Date(new Date(dHandoverDate).getTime() + new Date(dHandoverDate).getTimezoneOffset() * 60000);
				var dToday = new Date().setHours("00","00","00","000");
				// create the handover Gantt object
				var oHandover = [{
					"handOverDate": dHandoverDate,
					"level": "3",
					"name": ("00" + dHandoverDate.getDate()).substr(-2) + "/" + ("00" + (dHandoverDate.getMonth() + 1)).substr(-2)
				}];
				
				this.aWBSActivityList = aWBSActivityList;

				for (var i = 0; i < aWBSActivityList.length; i++ ) {
					
					var oActivity = aWBSActivityList[i];
					
					// evaluate the basic start date
					var dBasicstartdate = oActivity.Basicstartdate;
					if (dBasicstartdate) {
						dBasicstartdate = new Date(new Date(dBasicstartdate).getTime() + new Date(dBasicstartdate).getTimezoneOffset() * 60000);
					}
					// evaluate the basic end date
					var dBasicenddate = oActivity.Basicenddate;
					if (dBasicenddate) {
						dBasicenddate = new Date(new Date(dBasicenddate).getTime() + new Date(dBasicenddate).getTimezoneOffset() * 60000);
					}
					
					// evaluate the add start date
					if(!oActivity.Addstartdate) {
						oActivity.Addstartdate = oActivity.Basicstartdate || new Date(new Date( new Date().getTime() - 24*60*60*1000 ).setHours(0,0,0,0));
					}
					var dAddstartdate = oActivity.Addstartdate;
					if (dAddstartdate) {
						dAddstartdate = new Date(new Date(dAddstartdate).getTime() + new Date(dAddstartdate).getTimezoneOffset() * 60000);
					}
					// evaluate the add end date
					if(!oActivity.Addfinishdate) {
						oActivity.Addfinishdate = oActivity.Basicenddate || new Date(new Date( new Date().getTime()).setHours(0,0,0,0));
					}
					var dAddfinishdate = oActivity.Addfinishdate;
					if (dAddfinishdate) {
						dAddfinishdate = new Date(new Date(dAddfinishdate).getTime() + new Date(dAddfinishdate).getTimezoneOffset() * 60000);
					}
					
					// evaluate the forecast start date
					var dForecastedstartdate = oActivity.Forecastedstartdate;
					if (dForecastedstartdate) {
						dForecastedstartdate = new Date(new Date(dForecastedstartdate).getTime() + new Date(dForecastedstartdate).getTimezoneOffset() * 60000);
					}
					// evaluate the forecast end date
					var dForecastedenddate = oActivity.Forecastedenddate;
					if (dForecastedenddate) {
						dForecastedenddate = new Date(new Date(dForecastedenddate).getTime() + new Date(dForecastedenddate).getTimezoneOffset() * 60000);
					}
					
					// evaluate the actual start date
					var dActualstartdate = oActivity.Actualstartdate;
					if (dActualstartdate) {
						dActualstartdate = new Date(new Date(dActualstartdate).getTime() + new Date(dActualstartdate).getTimezoneOffset() * 60000);
					}
					// evaluate the actual finish date
					var dActualenddate = oActivity.Actualenddate;
					if (dActualenddate) {
						dActualenddate = new Date(new Date(dActualenddate).getTime() + new Date(dActualenddate).getTimezoneOffset() * 60000);
					}
					
					// set the lower limit for the basic start date
					if( oActivity.Networkactivity !== "" ) {
						oActivity.BasicstartdateLimit = aWBSActivityList.filter(function(d) {
							return d.Networkactivity === "0010" && d.Wbselement === oActivity.Wbselement;
						})[0].Basicstartdate;
					}
					
					// status of the activity
					oActivity.dealyStatus = "None";
					if( oActivity.Wbselementhierarchylevel === 3 && oActivity.Forecastedenddate && oActivity.Basicenddate  ) {
						oActivity.dealyStatus = oActivity.Basicenddate <= oActivity.Forecastedenddate ? "None" : "Error";
					}
					
					// set the WBS description
					var sWbsDescription = oActivity.Wbsdescription + ( oActivity.Description === "" ? "" : " - " + oActivity.Description );
					
					var oActivityItem = {
						"id": "basic-" + oActivity.Wbselement + oActivity.Networkactivity,
						"activity": oActivity.Projectnetwork + " " + oActivity.Networkactivity,
						"level": "01",
						"name": sWbsDescription,
						"tooltip": sWbsDescription,
						"table": oActivity,
						"children": [],
						"order": [],
						"handOver": oHandover
					};
					
					var sTooltip = "";
					
					// check basic dates before adding a line
					if ( oActivity.Basicstartdate && oActivity.Basicenddate ) {
						// tooltip for basic dates
						sTooltip = ("0" + dBasicstartdate.getDate() ).substr(-2) + "/" + ("0" + (dBasicstartdate.getMonth()+1) ).substr(-2);
						sTooltip += " - " + ("0" + dBasicenddate.getDate() ).substr(-2) + "/" + ("0" + (dBasicenddate.getMonth()+1) ).substr(-2);
						
						oActivityItem.order.push({
							"startTime": dBasicstartdate,
							"endTime": dBasicenddate,
							"level": "0",
							"name": sTooltip,
							"type": "Basic",
							"enableDnD": oActivity.Networkactivity !== "0010",
							"Projectnetwork": oActivity.Projectnetwork,
							"Networkactivity": oActivity.Networkactivity,
							"Wbselement": oActivity.Wbselement
						});
					}
					
					// check add dates before adding a child
					if ( oActivity.Addstartdate && oActivity.Addfinishdate && oActivity.Basicstartdate && oActivity.Networkactivity === "0010" && oActivity.Wbselementhierarchylevel === 3 ) {
						// tooltip for add dates
						sTooltip = ("0" + dAddstartdate.getDate() ).substr(-2) + "/" + ("0" + (dAddstartdate.getMonth()+1) ).substr(-2);
						sTooltip += " - " + ("0" + dAddfinishdate.getDate() ).substr(-2) + "/" + ("0" + (dAddfinishdate.getMonth()+1) ).substr(-2);
						
						// Add children to the activity item
						oActivityItem.children.push({
							"id": "add-" + oActivity.Wbselement + oActivity.Networkactivity,
							"level": "02",
							"name": sWbsDescription,
							"tooltip": sWbsDescription,
							"order": [{
								"startTime": dAddstartdate,
								"endTime": dAddfinishdate,
								"level": "4",
								"name": sTooltip,
								"type": "Add",
								"enableDnD": true,
								"Projectnetwork": oActivity.Projectnetwork,
								"Networkactivity": oActivity.Networkactivity,
								"Wbselement": oActivity.Wbselement
							}],
							"table": {},
							"handOver": oHandover
						});
						
					}
					
					// check forecast dates before adding a child
					if ( oActivity.Forecastedstartdate && oActivity.Forecastedenddate ) {
						// tooltip for forecast dates
						sTooltip = ("0" + dForecastedstartdate.getDate() ).substr(-2) + "/" + ("0" + (dForecastedstartdate.getMonth()+1) ).substr(-2);
						sTooltip += " - " + ("0" + dForecastedenddate.getDate() ).substr(-2) + "/" + ("0" + (dForecastedenddate.getMonth()+1) ).substr(-2);
						
						// Add children to the activity item
						oActivityItem.children.push({
							"id": "fcs-" + oActivity.Wbselement + oActivity.Networkactivity,
							"level": "02",
							"name": sWbsDescription,
							"tooltip": sWbsDescription,
							"order": [{
								"startTime": dForecastedstartdate,
								"endTime": dForecastedenddate,
								"level": "1",
								"name": sTooltip,
								"type": "Forecasted",
								"enableDnD": false
							}],
							"table": {},
							"handOver": oHandover
						});
						
					}
					
					// check actual dates before adding a child
					if ( dActualstartdate && dActualenddate ) {
						// tooltip for actual dates
						sTooltip = ("0" + dActualstartdate.getDate() ).substr(-2) + "/" + ("0" + (dActualstartdate.getMonth()+1) ).substr(-2);
						sTooltip += " - " + ("0" + dActualenddate.getDate() ).substr(-2) + "/" + ("0" + (dActualenddate.getMonth()+1) ).substr(-2);
						
						// Add children to the activity item
						oActivityItem.children.push({
							"id": "act-" + oActivity.Wbselement,
							"level": "02",
							"name": sWbsDescription,
							"tooltip": sWbsDescription,
							"order": [{
								"startTime": dActualstartdate,
								"endTime": dActualenddate,
								"level": "2",
								"name": sWbsDescription,
								"type": "Actual",
								"enableDnD": false
							}],
							"table": {},
							"handOver": oHandover
						});
					}
					
					// Add the activity item to the children's list
					oTree.root.children.push(oActivityItem);
					
					// If there is a predecessor for the current activity, the relationship is created
					if (oActivity.ActivityPredecessor) {
						 oTree.root.relationships.push({
							 "fromDataId": oActivity.Projectnetwork + " " + oActivity.ActivityPredecessor,
							 "fromObjectPath": oActivity.Projectnetwork + " " + oActivity.ActivityPredecessor,
							 "fromShapeId": "order",
							 "guid": "rel_"+ oActivity.ActivityPredecessor + "_" + oActivity.Networkactivity,
							 "relation_type": 1,
							 "style": 0,
							 "toDataId": oActivity.Projectnetwork + " " + oActivity.Networkactivity,
							 "toObjectPath": oActivity.Projectnetwork + " " + oActivity.Networkactivity,
							 "toShapeId": "order",
							 "tooltip": this.getResourceBundle().getText('relationship')
						 });
					}
					
					
					// Set the Gantt start time to fit the activities shown
					if ( dForecastedstartdate && dForecastedstartdate < oTree.ganttStartTime ) {
						oTree.ganttStartTime = dForecastedstartdate;
					}
					if ( dBasicstartdate && dBasicstartdate < oTree.ganttStartTime ) {
						oTree.ganttStartTime = dBasicstartdate;
					}
					if ( dActualstartdate && dActualstartdate < oTree.ganttStartTime ) {
						oTree.ganttStartTime = dActualstartdate;
					}
					
					// Set the Gantt end time to fit the activities shown
					if ( dForecastedenddate && dForecastedenddate > oTree.ganttEndTime ) {
						oTree.ganttEndTime = dForecastedenddate;
					}
					if ( dBasicenddate && dBasicenddate > oTree.ganttEndTime ) {
						oTree.ganttEndTime = dBasicenddate;
					}
					if ( dActualenddate && dActualenddate > oTree.ganttEndTime ) {
						oTree.ganttEndTime = dActualenddate;
					}
					
					
				}
				
				// Set the Gantt start date to the beginning of the month, while the Gantt end date to the end of the month
				oTree.ganttStartTime = formatter.dateToString( new Date(oTree.ganttStartTime.getFullYear(), oTree.ganttStartTime.getMonth() + 1, 1) );
				oTree.ganttEndTime = formatter.dateToString( new Date(oTree.ganttEndTime.getFullYear(), oTree.ganttEndTime.getMonth() + 3, 0) );
				
				return oTree; 
				
			}
			
		});
	}
);