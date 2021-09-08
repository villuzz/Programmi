sap.ui.define([
		"sap/gantt/GanttChartWithTable",
		"epta/ps/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/gantt/def/cal/Calendar",
		"sap/gantt/def/cal/CalendarDefs",
		"sap/gantt/def/cal/TimeInterval",
		"sap/gantt/config/TimeHorizon",
		"sap/gantt/axistime/ProportionZoomStrategy",
		"sap/gantt/shape/Group",
		"sap/gantt/shape/Rectangle",
		"sap/gantt/shape/SelectedShape",
		"sap/gantt/shape/ext/Diamond",
		"sap/gantt/shape/ext/Triangle"
	], function (GanttChartWithTable, Formatter, JSONModel, Calendar, CalendarDefs, TimeInterval, TimeHorizon, ProportionZoomStrategy,
	Group, Rectangle, SelectedShape, Diamond, Triangle) {
		"use strict";
		
/**
 * More info at: https://sapui5.hana.ondemand.com/1.60.13/#/entity/sap.gantt.GanttChartContainer
 */
 
		return GanttChartWithTable.extend("epta.ps.ui5.gantt.GanttChartWithTable", {
			
			metadata : {
				properties : {
					ganttStartTime : { type : "any", defaultValue : new Date().setMonth(new Date().getMonth()-4) },
					ganttEndTime : { type : "any", defaultValue : new Date().setMonth(new Date().getMonth()+4) },
					showTitle  : { type : "boolean", defaultValue : false }
				}
			},
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
	
			init : function () {
				GanttChartWithTable.prototype.init.apply(this);
				// Initialize Gantt table
				this.setShapeDataNames(["top", "order", "relationship"]);
                this.setToolbarSchemes(this._createToolbarSchemes());
                this.setSelectionMode(sap.gantt.SelectionMode.None);
			},
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
			
			/**
			 * Method called to populate Gantt data.
			 * @public
			 * @param {string} sChannelId the ID of the channel
			 * @param {string} sEventId the ID of the event
			 * @param {object} oData the data object
			 */
			setData : function (oData) {
				this.setModel(new JSONModel(oData));
				this.bindAggregation("rows", {
                    path: "/root",
                    parameters: {
                        arrayNames: ["children"]
                    }
                });
                this.bindAggregation("relationships", {
                        path: "/root/relationships"
                    }
                );
                this.setAxisTimeStrategy(this._createZoomStrategy());
                this.setShapes(this._configShape());
                this.setGanttStartTime(oData.ganttStartTime);
                this.setGanttEndTime(oData.ganttEndTime);
                //this.setTimeAxis(this._createTimeAxis());
			},
			
			
	/* =========================================================== */
	/* private methods                                             */
	/* =========================================================== */
			
			/*
			 * Create ToolbarSchemes
			 * @private
			 * @returns {Array} aToolbarSchemes
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
						settings: new sap.gantt.config.SettingGroup({
							position: "R1",
							overflowPriority: sap.m.OverflowToolbarPriority.Low,
							items: sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS
						}),
						toolbarDesign: sap.m.ToolbarDesign.Transparent
					}),
					new sap.gantt.config.ToolbarScheme({
						key: "LOCAL_TOOLBAR"
					})
				];
				return aToolbarSchemes;
			},
	
			/*
			 * Configuration of Shape.
			 * @privat
			 * @returns {Array} aShapes
			 */
			_configShape: function () {
				
				var aShapes = [];
					
				sap.ui.define(["sap/gantt/shape/Group"], function (Group) {
					var RectangleGroup = Group.extend("sap.test.RectangleGroup");
			
					RectangleGroup.prototype.getRLSAnchors = function (oRawData, oObjectInfo) {
						var shapes = this.getShapes();
						var rectangleShapeClass;
						var _x, _y;
			
						for (var i in shapes) {
							if (shapes[i] instanceof sap.gantt.shape.Rectangle) {
								rectangleShapeClass = shapes[i];
							}
						}
			
						_x = rectangleShapeClass.getX(oRawData);
						_y = rectangleShapeClass.getY(oRawData, oObjectInfo) + rectangleShapeClass.getHeight() / 2;
			
						return {
							startPoint: {
								x: _x,
								y: _y,
								height: rectangleShapeClass.getHeight(oRawData)
							},
							endPoint: {
								x: _x + rectangleShapeClass.getWidth(oRawData),
								y: _y,
								height: rectangleShapeClass.getHeight(oRawData)
							}
						};
					};
			
					return RectangleGroup;
				}, true);
			
				sap.ui.define(["sap/gantt/shape/Rectangle"], function (Rectangle) {
					var shapeRectangle = Rectangle.extend("sap.test.shapeRectangle");
			
					shapeRectangle.prototype.getFill = function (oRawData) {
						switch (oRawData.level) {
							case "1": // yellow
								return "#ffe699";
							case "2": // orange
								return "#f8cbad";
							case "3": // red
								return "#ff0000";
							case "4": // turquoise
								return "#2d9d92";
							default: // blue
								return "#9bc2e6";
						}
					};
			
					return shapeRectangle;
				}, true);
			
				sap.ui.define(["sap/gantt/shape/SelectedShape"], function (SelectedShape) {
					var selectRectange = SelectedShape.extend("sap.test.selectRectange");
			
					selectRectange.prototype.getStroke = function (oRawData) {
						switch (oRawData.level) {
							case "1":
								return "#B57506";
							default:
								return "#156589";
						}
					};
					selectRectange.prototype.getStrokeWidth = function () {
						return 2;
					};
			
					return selectRectange;
				});
			
				var oOrderShape = new sap.gantt.config.Shape({
					key: "order",
					shapeDataName: "order",
					shapeClassName: "sap.test.RectangleGroup",
					selectedClassName: "sap.test.selectRectange",
					level: 5,
					shapeProperties: {
						time: "{startTime}",
						endTime: "{endTime}",
						height: 20,
						isDuration: true,
						enableDnD: "{enableDnD}",
						title: "{name}"
					},
					groupAggregation: [
						new sap.gantt.config.Shape({
							shapeClassName: "sap.test.shapeRectangle",
							selectedClassName: "sap.test.selectRectange",
							shapeProperties: {
								time: "{startTime}",
								endTime: "{endTime}",
								height: 20,
								isDuration: true,
								enableDnD: "{enableDnD}"
							}
						})
					]
				});
			
				var oHandOverShape = new sap.gantt.config.Shape({
					key: "handOver",
					shapeDataName: "handOver",
					shapeClassName: "sap.test.shapeRectangle",
					level: 5,
					shapeProperties: {
						time: "{handOverDate}",
						height: 35,
						width: 3,
						isDuration: false,
						enableDnD: false,
						title: "{name}"
					}
				});
			
				var oRelShape = new sap.gantt.config.Shape({
					key: "relationship",
					shapeDataName: "relationship",
					level: 30,
					shapeClassName: "sap.gantt.shape.ext.rls.Relationship",
					shapeProperties: {
						isDuration: false,
						lShapeforTypeFS: true,
						showStart: false,
						showEnd: true,
						stroke: "#848F94",
						strokeWidth: 1,
						type: "{relation_type}",
						fromObjectPath: "{fromObjectPath}",
						toObjectPath: "{toObjectPath}",
						fromDataId: "{fromDataId}",
						toDataId: "{toDataId}",
						fromShapeId: "{fromShapeId}",
						toShapeId: "{toShapeId}",
						id: "{guid}"
					}
				});
			
				aShapes = [oOrderShape, oHandOverShape, oRelShape];
				return aShapes;
				
			},
	
			/*
			 * Create TimeAxis
			 * @private
			 * @returns {Object} oTimeAxis
			 */
			_createTimeAxis: function () {
				var oTimeAxis = new sap.gantt.config.TimeAxis({
					planHorizon: new sap.gantt.config.TimeHorizon({
						startTime: this.getGanttStartTime(),
						endTime: this.getGanttEndTime()
					}),
					initHorizon: new sap.gantt.config.TimeHorizon({
	
					}),
					granularity: "1week",
					finestGranularity: "1day",
					coarsestGranularity: "1year",
					rate: 1
				});
	
				return oTimeAxis;
			},
			
			/*
			 * Create Zoom Strategy
			 * @private
			 * @returns {Object} oZoomStrategy
			 */
			_createZoomStrategy: function () {
				var oTimeLineOptions = {
					"1day": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							range: 50
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							pattern: "MMM yyyy, 'Week' ww"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							pattern: "EEE dd"
						}
					},
					"1week": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							pattern: "MMMM yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							pattern: "'W' w"
						}
					},
					"1month": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 12,
							pattern: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							pattern: "MMM"
						}
					}
/*
					"1quarter": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							pattern: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							pattern: "QQQ"
						}
					},
					"1year": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							pattern: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							pattern: "MM"
						}
					}
*/
				};
				
				
				return new ProportionZoomStrategy({
					totalHorizon: new TimeHorizon({
						startTime: this.getModel().getData().ganttStartTime,
						endTime: this.getModel().getData().ganttEndTime
					}),
					visibleHorizon: new TimeHorizon({
						startTime: this.getModel().getData().ganttStartTime,
						endTime: this.getModel().getData().ganttEndTime
					}),
					timeLineOptions: oTimeLineOptions,
					timeLineOption: oTimeLineOptions["1month"],
					coarsestTimeLineOption: oTimeLineOptions["1month"],
					finestTimeLineOption: oTimeLineOptions["1day"],
					zoomLevels: 10
				});
			},
			
			
	/* =========================================================== */
	/* renderer                                                    */
	/* =========================================================== */
			
        	renderer: {}
        	
			
		});

	}
);