sap.ui.define([
		"sap/m/Table",
		"epta/ps/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/m/Button",
		"sap/m/Label",
		"sap/m/Toolbar",
		"sap/m/ToolbarSpacer"
	], function (Table, Formatter, JSONModel, Button, Label, Toolbar, ToolbarSpacer) {
		"use strict";

		return Table.extend("epta.ps.ui5.m.Table", {
			
			metadata : {
				properties : {
					showTitle  : { type : "boolean", defaultValue : false }
				}
			},
			
			init : function () {
				Table.prototype.init.apply(this);
				// init filter model
				this[ "_oFilterModel" + this.sId.substr( this.sId.lastIndexOf("-") ) ] = new JSONModel({
					"items": undefined,
					"filterItems": []
				});
			},
			
			onBeforeRendering : function (oEvent) {
				Table.prototype.onBeforeRendering.apply(this);
				this.addStyleClass("eptaTBL");
				if( typeof this[ "_oFilterModel" + this.sId.substr( this.sId.lastIndexOf("-") ) ].getProperty("/items") === "undefined"  ) {
					this[ "_oFilterModel" + this.sId.substr( this.sId.lastIndexOf("-") ) ].setProperty("/items", JSON.parse(JSON.stringify(this._getColumns())) );
				}
			},
			
			/**
			 * Get the list of columns with related binding path in table
			 * @return Array[]
			 */
			_getColumns : function() {
				var _aColsList = [];
				var aCols = this.getColumns();
				// check if the table is empty
				if( this.mAggregations.items === undefined || this.mAggregations.items.length === 0 ) {
					return [];
				}
				// loop over columns
				for( var i = 0; i < aCols.length ; i++ ) {
					// column name
					var sText = aCols[i].getAggregation("header").getProperty("text");
					// check if the name of the column is not empty tring
					if( sText === "" ) continue;
					// column data path
					var oBinding = this.mAggregations.items[0].mAggregations.cells[i].mBindingInfos;
					// pupulate list
					_aColsList.push({
						"key": oBinding[ Object.keys(oBinding)[0] ].binding.sPath,
						"text": aCols[i].getAggregation("header").getProperty("text")
					});
				}
				return _aColsList;
			},
			
			/*
				check if the string is null or blank
			*/
			isStringNullOrWhiteSpace: function(str) {
			    return str === undefined || str === null
			                             || typeof str !== 'string'
			                             || str.match(/^ *$/) !== null;
			},
			
			/*
			 * Creates p13nDialog with p13nFilterPanel inside
			 */
			openFilterDialog: function() {
				var self = this;
				
				var oDialog = this[ "_oDialog" + this.sId.substr( this.sId.lastIndexOf("-") ) ];
				var oFilterPanel = this[ "_oFilterPanel" + this.sId.substr( this.sId.lastIndexOf("-") ) ];
				
				
				if( typeof oDialog === "undefined" ) {
				
					// create filter panel
					oFilterPanel = new sap.m.P13nFilterPanel({
						"layoutMode": "Desktop", 
						"title": "{i18n>ui5Title}",
						"visible": true,
						"type": "filter"
					});
					// set model
					oFilterPanel.setModel( this[ "_oFilterModel" + this.sId.substr( this.sId.lastIndexOf("-") ) ], "filter");
					// bind items
					oFilterPanel.bindItems("filter>/items", new sap.m.P13nItem({
						"columnKey": "{filter>key}",
						"text": "{filter>text}"
					}));
					
					// bind filter items
					oFilterPanel.bindFilterItems("filter>/filterItems", new sap.m.P13nFilterItem({
						"key": "{filter>key}",
						"exclude": "{filter>exclude}",
						"columnKey": "{filter>columnKey}",
						"operation": "{filter>operation}",
						"value1": "{filter>value1}",
						"value2": "{filter>value2}"
					}));
					
					// attach handler for add/update/remove a filter item
					oFilterPanel.attachFilterItemChanged(this._onHandleFilterItem,this);
					
					oDialog =  new sap.m.P13nDialog({
						"initialVisiblePanelType": "filter",
						"ok": function(oEvent) {
							
							var	aFilters = [];
							var aFilterItems = JSON.parse( JSON.stringify( self[ "_oFilterModel" + self.sId.substr( self.sId.lastIndexOf("-") ) ].getProperty("/filterItems") ));
							
							for (var i = 0; i < aFilterItems.length; i++) {
								var oItem = aFilterItems[i];
								aFilters.push(new sap.ui.model.Filter({
									path: oItem.columnKey,
									operator: oItem.exclude === true ? sap.ui.model.FilterOperator.NE : aFilterItems[i].operation,
									value1: oItem.value1,
									value2: oItem.value2
								}));
							}
							
							self.getBinding("items").filter(aFilters);
							
							oDialog.close();
						},
						"cancel": function(oEvent){
							oDialog.close();
						},
						"showReset": false,
						"panels": oFilterPanel
					});
					
					this[ "_oDialog" + this.sId.substr( this.sId.lastIndexOf("-") ) ] = oDialog;
					this[ "_oFilterPanel" + this.sId.substr( this.sId.lastIndexOf("-") ) ] = oFilterPanel;
					
				}
				
				// open dialog
				oDialog.open();
			},
			
			_onHandleFilterItem: function(oEvent) {
				var oParameters = oEvent.getParameters();
				var oFilterItem = oEvent.getParameter("itemData");
				
				if( oParameters.reason === "added" ) {
					
					// add new item
					this[ "_oFilterModel" + this.sId.substr( this.sId.lastIndexOf("-") ) ].getProperty("/filterItems").push({
						"key": oParameters.key,
						"exclude": oFilterItem.exclude,
						"columnKey": oFilterItem.columnKey,
						"operation": oFilterItem.operation,
						"value1": isNaN(oFilterItem.value1) ? oFilterItem.value1 : Number(oFilterItem.value1),
						"value2": isNaN(oFilterItem.value2) ? oFilterItem.value2 : Number(oFilterItem.value2)
					});
					
				} else {
				
					var aFilterItems = this[ "_oFilterModel" + this.sId.substr( this.sId.lastIndexOf("-") ) ].getProperty("/filterItems");
					
					for (var i = 0; i < aFilterItems.length; i++) {
						if( aFilterItems[i].key === oParameters.key ) {
							// update item
							if( oParameters.reason === "updated" ) {
								aFilterItems[i].columnKey = oFilterItem.columnKey;
								aFilterItems[i].value1 = isNaN(oFilterItem.value1) ? oFilterItem.value1 : Number(oFilterItem.value1);
								aFilterItems[i].value2 = isNaN(oFilterItem.value2) ? oFilterItem.value2 : Number(oFilterItem.value2);
								aFilterItems[i].operation = oFilterItem.operation;
							}
							// remove item
							else if ( oParameters.reason === "removed" ) {
								aFilterItems.splice(i, 1);
							}
							
							break;
						}
					}
					
				}
				
			},
			
			
			renderer: {}
			
		});

	}
);