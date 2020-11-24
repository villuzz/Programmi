function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZPS_WBS_ELEMENT_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}