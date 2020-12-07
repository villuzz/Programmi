sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function (DateFormat) {
	"use strict";

	return {
		stripInitialChars: function (sInput, charToStrip) {
			return sInput !== undefined && sInput !== null ? sInput.replace(/^0+/, '') : sInput;
		},
		alphaOutput: function (sNumber) {
			return this.LocalFormatter.stripInitialChars(sNumber, "0");
		},
		ReasonVisibleVal: function (value) {
			if (value === '11' ) {
				return true;
			} else {
				return false;
			}
		},
		Visible: function (value) {
			if (value === '0.000' || value === undefined || value === null || value === "") {
				return false;
			} else {
				return true;
			}
		},
		DeleteZero: function (value) {
			if (value === '0.000' || value === undefined || value === null) {
				return '';
			} else {
				return value;
			}

		},
		TimeSetting: function (value) {
			if (value === 0 || value === "" || value === "000000" || value === null || value === undefined) {
				return "";
			} else {
				var h = value.substring(0, 2),
					min = value.substring(2, 4);
				return [h, min].join(':');
			}
		},
		addOne: function (value) {
			return value + 1;
		},
		DateSet: function (value) {
			if (value === 0 || value === "" || value === "00000000" || value === null || value === undefined) {
				return "";
			} else {
				var d = new Date();
				d.setMonth(value.substring(4, 6) - 1);
				d.setDate(value.substring(6, 8));
				d.setFullYear(value.substring(0, 4));
				var options = {
					style: 'medium'
				};
				var df = DateFormat.getDateInstance(options);
				return df.format(d);

			}
		},
		ControlVisible: function (val) {
			if (val > 2) {
				return true;
			} else {
				return false;
			}
		},
		DateVis: function (lvl) {
			if (lvl === 3) {
				return true;
			} else {
				return false;
			}
		},
		BillingVisibleVal: function (order, cGroupTab, stufe) {
			var level = stufe + 1;
			if (order === "") {
				if (level === 3 || level === 4 || (level === 2 && cGroupTab == "X")) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
	};
});