sap.ui.define([
		"sap/m/Input",
		"sap/ui/core/IconPool",
		"sap/ui/Device"
	], function (Input, IconPool, Device) {
		"use strict";

		return Input.extend("epta.ps.ui5.m.Input", {
			
			metadata : {
				properties : {
					valueHeplIcon  : { type : "string", defaultValue : "value-help" }
				}
			},
			
			
	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */
			
			init : function () {
				Input.prototype.init.apply(this);
				//Input.prototype._getValueHelpIcon = this._getValueHelpIcon();
			},
			
			onBeforeRendering : function () {
				Input.prototype.onBeforeRendering.apply(this);
				// extend the default value help icon
				Input.prototype._getValueHelpIcon = this._getValueHelpIcon();
			},
			
			
	/* =========================================================== */
	/* private methods                                             */
	/* =========================================================== */
			
			/**
			 * Returns/Instantiates the value help icon control when needed.
			 *
			 * @private
			 * @returns {object} Value help icon of the input.
			 */
			_getValueHelpIcon : function () {
				var that = this,
					aEndIcons = this.getAggregation("_endIcon") || [],
					oValueStateIcon = aEndIcons[0];
		
				// for backward compatibility - leave this method to return the instance
				if (!oValueStateIcon && this.getEnabled()) {
					oValueStateIcon = this.addEndIcon({
						id: this.getId() + "-vhi",
						// use the icon defined by the user
						src: IconPool.getIconURI(this.getValueHeplIcon()),
						useIconTooltip: false,
						noTabStop: true,
						press: function (oEvent) {
							// if the property valueHelpOnly is set to true, the event is triggered in the ontap function
							if (!that.getValueHelpOnly()) {
								var oParent = this.getParent(),
									$input;
		
								if (Device.support.touch) {
									// prevent opening the soft keyboard
									$input = oParent.$('inner');
									$input.attr('readonly', 'readonly');
									oParent.focus();
									$input.removeAttr('readonly');
								} else {
									oParent.focus();
								}
		
								that.bValueHelpRequested = true;
								that.fireValueHelpRequest({ fromSuggestions: false });
							}
						}
					});
				}
		
				return oValueStateIcon;
			},
			
        	renderer: {}
        	
			
		});

	}
);