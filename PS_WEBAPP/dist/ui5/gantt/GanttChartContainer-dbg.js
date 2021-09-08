sap.ui.define([
	"sap/gantt/GanttChartContainer",
	"epta/ps/model/formatter",
	"epta/ps/model/models",
	"sap/ui/model/json/JSONModel",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
], function (GanttChartContainer, formatter, models, JSONModel, exportLibrary, Spreadsheet) {
	"use strict";

	var EdmType = exportLibrary.EdmType;
	/**
	 * More info at: https://sapui5.hana.ondemand.com/1.60.13/#/entity/sap.gantt.GanttChartContainer
	 */

	return GanttChartContainer.extend("epta.ps.ui5.gantt.GanttChartContainer", {

		metadata: {
			properties: {
				showTitle: { type: "boolean", defaultValue: false }
			}
		},

		init: function () {
			GanttChartContainer.prototype.init.apply(this);
			// Initialize Gantt chart
			this.setLegendContainer(this._createLegendContainer());
			this.setToolbarSchemes(this._createToolbarSchemes());
			this.setContainerLayouts(this._createContainerLayouts());
			this.setContainerLayoutKey("epta.ps.gantt_layout");
			this.addCustomToolbarItem(this._createCustomToolbar());
		},

		onBeforeRendering: function () {
			var self = this;

			// Table related to the Gantt chart
			this._oTable = this.getAggregation("ganttCharts")[0].getAggregation("_selectionPanel");

			// Get data from the storage of the browser and initialize columns
			var aCols = [];
			if (models.getFromStorage(this._oTable.getId())) {
				aCols = models.getFromStorage(this._oTable.getId());
				aCols.forEach(function (oCol) {
					self._changeColumnVisibility(oCol);
				});
			}
		},


		/* =========================================================== */
		/* private methods                                             */
		/* =========================================================== */

		/*
		 * Create ToolbarSchemes
		 * @private
		 * @returns {array} aToolbarSchemes
		 */
		_createToolbarSchemes: function () {
			var aToolbarSchemes = [
				new sap.gantt.config.ToolbarScheme({
					key: "GLOBAL_TOOLBAR",
					customToolbarItems: new sap.gantt.config.ToolbarGroup({
						position: "R2",
						overflowPriority: sap.m.OverflowToolbarPriority.High
					}),
					timeZoom: new sap.gantt.config.ToolbarGroup({
						position: "R4",
						overflowPriority: sap.m.OverflowToolbarPriority.NeverOverflow
					}),
					/*
					legend: new sap.gantt.config.ToolbarGroup({
						position: "R3",
						overflowPriority: sap.m.OverflowToolbarPriority.Low
					}),
					*/
					toolbarDesign: sap.m.ToolbarDesign.Transparent
				}),
				new sap.gantt.config.ToolbarScheme({
					key: "LOCAL_TOOLBAR"
				})
			];
			return aToolbarSchemes;
		},

		/*
		 * Create ContainerLayouts
		 * @private
		 * @returns {array} aContainerLayouts
		 */
		_createContainerLayouts: function () {
			var aContainerLayouts = [
				new sap.gantt.config.ContainerLayout({
					key: "epta.ps.gantt_layout",
					text: "Gantt Layout",
					toolbarSchemeKey: "GLOBAL_TOOLBAR"
				})
			];
			return aContainerLayouts;
		},

		/*
		 * Create Legend
		 * @private
		 * @returns {object} oLegend
		 */
		_createLegendContainer: function () {
			var sSumTaskColor = "#FAC364";
			var sTasksColor = "#5CBAE5";
			var sRelColor = "#848F94";
			var sTextColor = sap.ui.getCore().getConfiguration().getTheme() === "sap_hcb" ? "white" : "";
			// TODO: replace with formatter.translate
			var sActivity = 'basicDates';
			// TODO: replace with formatter.translate
			var sLineUp = 'forecastDates';
			// TODO: replace with formatter.translate
			var sRelationship = 'relationship';
			var oLegend = new sap.gantt.legend.LegendContainer({
				legendSections: [
					new sap.m.Page({
						// TODO: replace with formatter.translate
						title: 'legend',
						content: [
							new sap.ui.core.HTML({
								content: "<div width='100%' height='50%' style='margin-top: 25px'><svg width='180px' height='160px'><g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25") + "' y='2' width='20' height='20' fill=" +
									sTasksColor + " style='stroke: " + sTasksColor + "; stroke-width: 2px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55") + "' y='16' font-size='0.875rem' fill=" +
									sTextColor + ">" + sActivity + "</text></g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25") + "' y='32' width='20' height='20' fill=" +
									sSumTaskColor + " style='stroke: " + sSumTaskColor + "; stroke-width: 2px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55") + "' y='46' font-size='0.875rem' fill=" +
									sTextColor + ">" + sLineUp + "</text></g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25") + "' y='72' width='20' height='1' fill=" +
									sRelColor + " style='stroke: " + sRelColor + "; stroke-width: 1px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55") + "' y='76' font-size='0.875rem' fill=" +
									sTextColor + ">" + sRelationship + "</text></g>" +
									"</g></g></svg></div>"
							})
						]
					})
				]
			});
			return oLegend;
		},

		/*
		 * Create CustomToolbar
		 * @private
		 * @returns {sap.m.Toolbar} Toolbar element
		 */
		_createCustomToolbar: function () {
			var self = this;
			// Create the toolbar
			return new sap.m.Toolbar({
				content: [
					new sap.m.ToolbarSeparator(),
					// Button to open the list of the colums belonging to the table
					new sap.m.Button({
						icon: "sap-icon://table-column",
						press: function () {
							// Create the popover only if it does not exists yet
							if (!self._popover) { self._createPopover(); }
							// set the model to the list
							self._popover.getContent()[0].setModel(new JSONModel(self._getColumns()));
							// Open popover
							self._popover.openBy(this);
						}
					}),
					new sap.m.ToolbarSpacer({ width: "10px" }),
					new sap.m.ToolbarSeparator()

				]
			});
		},
		exportSpreadsheet: function (settings, fnSuccess, fnFail) {
			return new sap.ui.export.Spreadsheet(settings)
				.build()
				.catch(fnFail ? fnFail.bind(this) : null)
				.then(fnSuccess ? fnSuccess.bind(this) : null);
		},
		exportExcel: function (oEvent) {
			//var Table = this._oTable.getModel().getData().root.children;

			var listBinding = this._oTable.getBinding("rows");
			return listBinding.getLength() < 1 ? null : this.exportSpreadsheet({
				workbook: {
					columns: this.createColumnConfig(),
					hierarchyLevel: "Level",
				},
				dataSource: {
					type: "OData",
					useBatch: true,
					serviceUrl: listBinding.getModel().sServiceUrl,
					headers: listBinding.getHeaders ? listBinding.getHeaders() : null,
					dataUrl: listBinding.getDownloadUrl ? listBinding.getDownloadUrl() : null,
					count: listBinding.getLength(),
					sizeLimit: 5,
				},
				worker: true
			});
			/*
						var aCols, oRowBinding, oSettings, oSheet, oTable;
			
						oTable = this._oTable;
						oRowBinding = oTable.getBinding('rows');
						aCols = this.createColumnConfig();
						oSettings = {
							workbook: {
								columns: aCols,
								hierarchyLevel: 'Level'
							},
							dataSource: oRowBinding,
							fileName: 'sample.xlsx',
							worker: false // We need to disable worker because we are using a MockServer as OData Service
						};
				
						oSheet = new Spreadsheet(oSettings);
						oSheet.build().finally(function() {
							oSheet.destroy();
						});
						
			*/
			//sap.ui.controller("epta.ps.views.project.fragments.projectPlan.ProjectPlan").exportExcel(oEvent);
		},

		createColumnConfig: function () {

			var i18n = this.getModel("i18n").getResourceBundle();

			var aCols = [];

			aCols.push({
				label: i18n.getText("tblWBE"),
				property: 'Wbselement',
				type: EdmType.String
			});

			return aCols;

		},

		/*
		 * Create Popover
		 * @private
		 */
		_createPopover: function () {
			var self = this;
			// Create the template of the list
			var oItemTemplate1 = new sap.m.StandardListItem({
				title: "{desc}",
				selected: {
					path: "visible"
				}
			});
			// Create the popover
			this._popover = new sap.m.Popover({
				placement: sap.m.PlacementType.Bottom,
				title: "{i18n>ui5GanttPopoverCols}",
				showHeader: true,
				verticalScrolling: true,
				horizontalScrolling: false,
				content: [
					// Add a list to the popover
					new sap.m.List({
						inset: true,
						mode: "MultiSelect",
						select: function (oEvent) {
							// Retrieve the selected item and change the visibility of the target column
							var oCtx = oEvent.getParameter("listItem").getBindingInfo("selected").binding.getContext();
							self._changeColumnVisibility(oCtx.oModel.getProperty(oCtx.sPath));
						}
					}).bindAggregation("items", "/", oItemTemplate1)
				]
			}).addStyleClass("eptaSettinsgsPopover");

		},

		/*
		 * Get the list of columns belonging to the table associated to the Gantt chart
		 * @private
		 * @returns {array} List of columns
		 */
		_getColumns: function () {
			var aCols = [];

			this._oTable.getColumns().forEach(function (oCol) {
				if (oCol.getAggregation("label").getProperty("text") !== "") {
					aCols.push({
						id: oCol.getId(),
						desc: oCol.getAggregation("label").getProperty("text"),
						visible: oCol.getVisible()
					});
				}
			});

			// Store data into browser storage
			models.setIntoStorage(this._oTable.getId(), aCols);

			return aCols;
		},

		/*
		 * Change the visibility of a specific column
		 * @private
		 * @param {object} Object related to the target column
		 */
		_changeColumnVisibility: function (oData) {
			// Filter the columns to find the target one
			var oColumn = this._oTable.getColumns().filter(function (oCol) {
				return oData.id === oCol.getId();
			})[0];

			// Change visibility settings
			if (oColumn) {
				oColumn.setVisible(oData.visible);
			}

			// Update browser storage data
			var aCols = models.getFromStorage(this._oTable.getId());
			for (var i = 0; i < aCols.length; i++) {
				if (!oColumn) {
					aCols.splice(i, 1);
					break;
				} else if (aCols[i].id === oData.id) {
					aCols[i].visible = oData.visible;
					break;
				}
			}
			models.setIntoStorage(this._oTable.getId(), aCols);
		},


		/* =========================================================== */
		/* renderer                                                    */
		/* =========================================================== */

		renderer: {}


	});

}
);