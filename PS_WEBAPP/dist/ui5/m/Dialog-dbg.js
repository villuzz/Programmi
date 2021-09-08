sap.ui.define([
		"sap/m/Dialog",
		"epta/ps/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/m/Button",
		"sap/m/ToggleButton",
		"sap/m/Title",
		"sap/m/Toolbar",
		"sap/m/ToolbarSpacer"
	], function (Dialog, Formatter, JSONModel, Button, ToggleButton, Title, Toolbar, ToolbarSpacer) {
		"use strict";

		return Dialog.extend("epta.ps.ui5.m.Dialog", {
			
			metadata : {
				properties : {
					showPropagateButton : { type : "boolean", defaultValue : true },
					showSaveButton      : { type : "boolean", defaultValue : true },
					showClearButton     : { type : "boolean", defaultValue : false }
				},
				events : {
					"save"  : {},
					"clear" : {}
            	}
			},
			
			_bPropagate : false,
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			init : function () {
				Dialog.prototype.init.apply(this);
				
				var self = this;
				
				// rerender dialog after open
				this.attachAfterOpen(function() {
					self.rerender();	
				});
				
				// destroy the popup after closuse
				this.attachAfterClose(function() {
					// self.destroy();
				});
				
				// create custom header
				this.setCustomHeader(
					new Toolbar({
						content: [
							new ToolbarSpacer(),
							// set dialog title
							new Title({
								text: self.getTitle(),
								level: "H1"
							}),
							new ToolbarSpacer(),
							// add close button
							new Button({
								icon: "sap-icon://decline",
								press: function () {
									self._close();
								}
							})
						]
					})
				);
				
				// create 'Progagate' button
				this._oPropagateButton = new ToggleButton({
					text: "{i18n>ui5SaveAll}",
					visible: this.getShowPropagateButton(),
					press: function(oEvent) {
						self._bPropagate = oEvent.getSource().getPressed();
					}
				});
				this.addButton(this._oPropagateButton);
				
				// create 'Clear' button
				this._oClearButton = new Button({
					text: "{i18n>ui5Clear}",
					visible: this.getShowClearButton(),
					press: function () {
						self._clear();
					}
				})
				this.addButton( this._oClearButton );
				
				// create 'Save' button
				this._oSaveButton = new Button({
					text: "{i18n>ui5Save}",
					press: function () {
						self._save();
					},
					visible: this.getShowSaveButton()
				});
				this.addButton( this._oSaveButton );
				
			},
			
			onBeforeRendering: function() {
				Dialog.prototype.onBeforeRendering.apply(this);
				this._oPropagateButton.setVisible( this.getShowPropagateButton() );
				this._oPropagateButton.setPressed( this._bPropagate );
				this._oSaveButton.setVisible( this.getShowSaveButton() );
				this._oClearButton.setVisible( this.getShowClearButton() );
			},
			
			doClose : function() {
				this._close();
			},
			
			toPropagate : function() {
				return this._bPropagate;
			},
			
			
	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */
			
			// save button event handler
			_save : function (oEvent) {
				var self = this;
				jQuery.when( this.fireSave(oEvent) ).then(function () {
					self._close();	
				});
			},
			
			// clear button event handler
			_clear : function (oEvent) {
				var self = this;
				jQuery.when( this.fireClear(oEvent) ).then(function () {
					self._save();	
				});
			},
			
			// close button event handler
			_close : function () {
				this.getContent().forEach(function(oElement) {
					try{
						oElement.removeSelections();
					} catch(e) {}
				});
				this._oSelectedObject = {};
				this.close();
			},
			
			renderer: {}
        
    	});

	}
);