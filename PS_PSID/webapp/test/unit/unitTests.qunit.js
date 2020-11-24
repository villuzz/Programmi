/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"Z001/PS_PSID/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});