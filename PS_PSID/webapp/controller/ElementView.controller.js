sap.ui.define([
	"sap/ui/core/mvc/Controller",
	// 'sap/m/TablePersoController',
	// 'Z001/PS_PSID/resource/Service/DemoPersoService',
	"Z001/ZPS_PSID/formatter/LocalFormatter",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	'sap/ui/core/Popup',
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/ui/export/library',
	"sap/ui/export/Spreadsheet",
	'sap/ui/model/odata/v2/ODataModel',
	'sap/m/MessageView',
	'sap/m/Button',
	'sap/m/Bar',
	'sap/m/Text',
	'sap/m/Popover',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, LocalFormatter, MessageBox, JSONModel, Log, Popup, MessagePopover, MessageItem, exportLibrary, Spreadsheet, ODataModel, MessageView, Button, Bar, Text, Popover, Filter, FilterOperator
) {
	"use strict";
	// TablePersoController, DemoPersoService,
	var EdmType = exportLibrary.EdmType;
	var ExpandedIndexes = 0;

	return Controller.extend("Z001.ZPS_PSID.controller.ElementView", {

		LocalFormatter: LocalFormatter, //<-- Local project formatter
		Log: Log, //<-- Logger inherited by all child controllers

		onInit: function () {

			//definizione variabili
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel, 'LOCALPARAMS');

			var dataObject = [{
				"Stufe": 1
			}, {
				"Stufe": 2
			}, {
				"Stufe": 3
			}, {
				"Stufe": 4
			}];
			oModel = new JSONModel(dataObject);

			this.getView().setModel(oModel, 'StufeTable');

			oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPS_WBS_ELEMENT_SRV");
			sap.ui.getCore().setModel(oModel, "myModel");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this.routeMatched, this);

			// init and activate controller
			// this._oTPC = new TablePersoController({
			// 	table: this.byId("tableElement"),
			// 	componentName: "WBS_Element",
			// 	Caption: false,
			// 	persoService: DemoPersoService
			// }).activate();
			this.byId("fcl").setLayout("TwoColumnsMidExpanded");
			var dateRange = this.getView().byId('dataReq');
			dateRange.setDateValue(new Date());

			var that = this;
			var oMessageTemplate = new sap.m.MessageItem({
				type: '{severity}',
				title: '{code}',
				description: '{message}',
				subtitle: '{message}'
			});

			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});

			this.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});

			this.oDialog = new sap.m.Dialog({
				resizable: true,
				content: this.oMessageView,
				state: 'Success',
				beginButton: new sap.m.Button({
					press: function () {
						this.getParent().close();
					},
					text: "Close"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Text({
							text: "Result"
						})
					],
					contentLeft: [oBackButton]
				}),
				contentHeight: "300px",
				contentWidth: "900px",
				verticalScrolling: false
			});




			//Gestione Errori
			var MessageTemplateError = new MessageItem({
				type: '{type}',
				title: '{title}',
				description: '{description}',
				subtitle: '{subtitle}',
			});

			var BackButtonError = new Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.MessageError.navigateBack();
					that.PopoverError.focus();
					this.setVisible(false);
				}
			});


			var oModel = new JSONModel(),
				that = this;

			this.MessageError = new MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					BackButtonError.setVisible(true);
				},
				items: {
					path: "/",
					template: MessageTemplateError
				}
			});

			var oCloseButton = new Button({
				text: "Close",
				press: function () {
					that.PopoverError.close();
				}
			});

			var oVbox = new sap.m.VBox({ height: "100%", justifyContent: "Center" });
			oVbox.addItem(new sap.m.Text({ text: "Error Log" }));

			this.PopoverError = new Popover({
				placement: sap.m.PlacementType.Left,
				customHeader: new sap.m.Bar({
					contentMiddle: [oVbox],
					contentLeft: [BackButtonError]
				}),
				contentWidth: "440px",
				contentHeight: "440px",
				verticalScrolling: false,
				modal: true,
				content: [this.MessageError],
				footer: new Bar({ contentRight: oCloseButton }),
				resizable: true
			});
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel, "returnModel2");
		},
		onDataExport: function () {
			var listBinding = this.byId("tableElement").getBinding("rows");
			return listBinding.getLength() < 1 ? null : this.exportSpreadsheet({
				workbook: {
					columns: this.createColumnConfig(),
				},
				dataSource: {
					type: "OData",
					useBatch: true,
					serviceUrl: listBinding.getModel().sServiceUrl,
					headers: listBinding.getModel().getHeaders(),
					dataUrl: listBinding.getDownloadUrl(), // includes the $expand param.
					/*E.g.*/
					count: listBinding.getLength(),
					/*E.g.*/
					sizeLimit: 5,
				},
				worker: true // should be false if mock server or CSP enabled
			});
		},
		onDataExportPurch: function () {
			var listBinding = this.byId("tablePurchasing").getBinding("rows");
			return listBinding.getLength() < 1 ? null : this.exportSpreadsheet({
				workbook: {
					columns: this.createColumnConfigPurch(),
				},
				dataSource: {
					type: "OData",
					useBatch: true,
					serviceUrl: listBinding.getModel().sServiceUrl,
					headers: listBinding.getModel().getHeaders(),
					dataUrl: listBinding.getDownloadUrl(), // includes the $expand param.
					/*E.g.*/
					count: listBinding.getLength(),
					/*E.g.*/
					sizeLimit: 5,
				},
				worker: true // should be false if mock server or CSP enabled
			});
		},
		exportSpreadsheet: function (settings, fnSuccess, fnFail) {
			return new Spreadsheet(settings)
				.build()
				.catch(fnFail ? fnFail.bind(this) : null)
				.then(fnSuccess ? fnSuccess.bind(this) : null);
		},
		createColumnConfigPurch: function () {
			var i18n = this.getView().getModel("i18n").getResourceBundle();

			var aCols = [];
			aCols.push({
				label: i18n.getText("Banfn"),
				property: 'Banfn',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Bnfpo"),
				property: 'Bnfpo',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Eban_Txz01"),
				property: 'Eban_Txz01',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ekkn_Ebeln"),
				property: 'Ekkn_Ebeln',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ekkn_Ebelp"),
				property: 'Ekkn_Ebelp',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ekpo_Txz01"),
				property: 'Ekpo_Txz01',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Eindt"),
				property: 'Eindt',
				type: EdmType.String
			});
			return aCols;
		},
		createColumnConfig: function () {
			var i18n = this.getView().getModel("i18n").getResourceBundle();

			var aCols = [];

			aCols.push({
				label: i18n.getText("WBS_Element"),
				property: 'WBS_Element',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Stufe"),
				property: 'Stufe',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Description"),
				property: 'Description',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("KDKG1"),
				property: 'KDKG1',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("KDKG2"),
				property: 'KDKG2',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Project_User_Status"),
				property: 'Project_User_Status',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Responsible_No"),
				property: 'Responsible_No',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("VbelnB"),
				property: 'VbelnB',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("PosnrB"),
				property: 'PosnrB',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("FKSAA"),
				property: 'FKSAA',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("BillingType"),
				property: 'BillingType',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Material"),
				property: 'Material',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("RejReason"),
				property: 'RejReason',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("BillingNetwr"),
				property: 'BillingNetwr',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("BillingWaerk"),
				property: 'BillingWaerk',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Estrt"),
				property: 'Estrt',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Eende"),
				property: 'Eende',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Pstrt"),
				property: 'Pstrt',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Pende"),
				property: 'Pende',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Banfn"),
				property: 'Banfn',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Bnfpo"),
				property: 'Bnfpo',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Eban_Txz01"),
				property: 'Eban_Txz01',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ekkn_Ebeln"),
				property: 'Ekkn_Ebeln',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ekkn_Ebelp"),
				property: 'Ekkn_Ebelp',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ekpo_Txz01"),
				property: 'Ekpo_Txz01',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Eindt"),
				property: 'Eindt',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Auart"),
				property: 'Auart',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("VbelnQ"),
				property: 'VbelnQ',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("PosnrQ"),
				property: 'VbelnQ',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Matnr"),
				property: 'Matnr',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Arktx"),
				property: 'Arktx',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Usr00"),
				property: 'Usr00',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Stsma"),
				property: 'Usr00',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Kbetr"),
				property: 'Kbetr',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Netwr"),
				property: 'Kbetr',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Waerk"),
				property: 'Waerk',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Target_Margin"),
				property: 'Target_Margin',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Total_Margin"),
				property: 'Total_Margin',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Auart"),
				property: 'Auart',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("VbelnL"),
				property: 'VbelnL',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("PosnrL"),
				property: 'PosnrL',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Matnr"),
				property: 'Matnr',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Arktx"),
				property: 'Arktx',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Pstyv"),
				property: 'Arktx',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Abgru"),
				property: 'Abgru',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Creation_Dat"),
				property: 'Creation_Dat',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Zzlifdt"),
				property: 'Zzlifdt',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Zzliftime"),
				property: 'Zzlifdt',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Zzinsdate"),
				property: 'Zzlifdt',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Zzinstime"),
				property: 'Zzinstime',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Bstkd"),
				property: 'Bstkd',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Bstdk"),
				property: 'Bstdk',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Lifsk"),
				property: 'Lifsk',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Udate"),
				property: 'Udate',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Zzpwerks"),
				property: 'Zzpwerks',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Vstel"),
				property: 'Vstel',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Rcmid"),
				property: 'Rcmid',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ernam"),
				property: 'Ernam',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Status"),
				property: 'Status',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Reqmad"),
				property: 'Reqmad',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Apprmad"),
				property: 'Apprmad',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Ava_Status"),
				property: 'Ava_Status',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Lfsta"),
				property: 'Lfsta',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Gs_Status"),
				property: 'Gs_Status',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Vbfa_Vbeln"),
				property: 'Vbfa_Vbeln',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Vbfa_Posnn"),
				property: 'Vbfa_Posnn',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Xabln"),
				property: 'Xabln',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Sernr"),
				property: 'Sernr',
				type: EdmType.String
			});
			aCols.push({
				label: i18n.getText("Erdat"),
				property: 'Erdat',
				type: EdmType.String
			});
			return aCols;
		},

		onExpandFirstLevel: function () {
			var oTreeTable = this.byId("tableElement");
			oTreeTable.expandToLevel(4);
		},
		onCollapseAll: function () {
			var oTreeTable = this.byId("tableElement");
			oTreeTable.collapseAll();
		},
		handlePressOpenMenu: function (oEvent) {
			var oButton = oEvent.getSource();
			this.byId("Menu").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);

		},
		handlePressOpenMenuLayout: function (oEvent) {
			var oButton = oEvent.getSource();
			this.byId("MenuLayout").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuItems: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			// if (this.getView().getModel("LOCALPARAMS").getProperty("/Line").getParent().getCells()[1].getText() === "1") {
			// 	this.byId("mnCreateODV").setEnabled(true);
			// 	this.byId("mnAddWBS").setEnabled(true);
			// } else {
			// 	this.byId("mnCreateODV").setEnabled(false);
			// 	this.byId("mnAddWBS").setEnabled(false);
			// }
			if (!oEvent.getSource().getText().includes('Z')) {
				this.byId("mnItemRDA").setEnabled(false);
			} else if (this.getView().getModel("LOCALPARAMS").getProperty("/Line").getParent().getCells()[1].getText() === "2") {
				this.byId("mnItemRDA").setEnabled(true);
			} else {
				this.byId("mnItemRDA").setEnabled(false);
			}

			//Set Default Condition Group in WBS Element Creation
			this.byId('Group1').setSelectedKey(oButton.getBindingContext().getObject().KDKG1);
			this.byId('Group2').setSelectedKey(oButton.getBindingContext().getObject().KDKG2);

			this.byId("MenuItems").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuElement: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuElement").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},

		handlePressOpenMenuQuotation: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuQuotation").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuBilling: function (oEvent) {
			// openMenuBillingNo
			var line = oEvent.getSource().getBindingContext().getObject();
			if (line.VbelnB === "" || line.RejReason === '11') {
				this.byId("mnCreateBill").setEnabled(true);
				this.byId("mnDisBill").setEnabled(false);
			} else {
				this.byId("mnCreateBill").setEnabled(false);
				this.byId("mnDisBill").setEnabled(true);
			}

			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuBilling").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuLogistic: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuLogistic").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuAdvance: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuAdvance").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuPurOrd: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuPurOrd").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},
		handlePressOpenMenuPurReq: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			LocalParams.setProperty("/Line", oEvent.getSource());
			var oButton = oEvent.getSource();
			this.byId("MenuPurReq").open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
		},

		handleMenuPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mncj20n":
					this.callcj20n(oEvent);
					break;
				case "mncj02":
					this.callcj02(oEvent);
					break;


			}

		},

		handleMenuItemPress: function (oEvent) {

			var oItem = oEvent.getParameter("item");
			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnItemRDA":
					this.resumeRequest(oEvent);
					this.byId("DialogRequest").open();
					break;
				case "mnCreateODV":
					this.byId("DialogAuart").open();
					break;
				case "mnChangeWBS":
					this.callChangeWBS(oEvent);
					break;
				case "mnAddWBS":
					this.onPressCreate(this.getView().getModel("LOCALPARAMS").getProperty("/Line"));
					break;
				case "mnWBSCopy":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;

			}

		},
		handleMenuElementPress: function (oEvent) {

			var oItem = oEvent.getParameter("item");
			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnAddWBS":
					this.onPressCreate(this.getView().getModel("LOCALPARAMS").getProperty("/Line"));
					break;
				case "mnWBSCopy2":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		handleMenuFilterSortPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnFilter":
					this.onPressFilter(this.getView().getModel("LOCALPARAMS").getProperty("/Line"));
					break;

				case "mnSort":
					this.onPressSort(this.getView().getModel("LOCALPARAMS").getProperty("/Line"));
					break;
			}

		},
		sofilter: function (oEvent) {

			var filterProperty = '',
				filterValue = '',
				filterOperator = '';


			var oTreeTable = this.byId("tableElement");
			var rows = this.Filter.length;
			var trovato = "";
			if (oEvent.getParameters().column.getProperty("filterProperty") !== 'Livello') {
				if (rows !== 0) {
					for (var i = 0; i < rows; i++) {
						if (this.Filter[i].sPath === 'Livello') {
							trovato = "X";
							continue;
						}
					}
				}
			}

			if ((oEvent.getParameters().column.getProperty("filterProperty") === 'Livello' && oEvent.getParameters().value !== "") || trovato === 'X') {

				//Add other filter 
				if (oEvent.getParameters().column.getProperty("filterProperty") === 'Livello') {
					var columns = oTreeTable.getColumns();
					for (var i = 0; i < columns.length; i++) {
						if (columns[i].getFiltered()) {
							filterValue = columns[i].getFilterValue();
							filterOperator = sap.ui.model.FilterOperator.Contains;
							if (columns[i].getFilterType() !== null && filterValue != "") {
								if (columns[i].getFilterType().getName() === "Integer") {
									filterValue = parseFloat(filterValue);
									filterOperator = 'EQ';
								}
							}
							filterProperty = columns[i].getFilterProperty();

							this.Filter.push(new sap.ui.model.Filter({
								path: filterProperty,
								operator: filterOperator,
								value1: filterValue
							}));
							//applicare i filtri in piu
						}
					}
				}

				filterValue = oEvent.getParameters().value;
				filterOperator = sap.ui.model.FilterOperator.Contains;
				if (oEvent.getParameters().column.getProperty("filterType") !== null && filterValue != "") {
					if (oEvent.getParameters().column.getProperty("filterType").getName() === "Integer") {
						filterValue = parseFloat(filterValue);
						filterOperator = 'EQ';
					}
				}
				filterProperty = oEvent.getParameters().column.getProperty("filterProperty");

				var rows = this.Filter.length;
				var i = 0;
				var trovato = "";

				if (rows !== 0) {
					for (i = 0; i < rows; i++) {
						if (this.Filter[i].sPath === filterProperty) {
							this.Filter[i].oValue1 = filterValue;
							trovato = "X";
							if (filterValue === "") {
								this.Filter.splice(i, 1);
								rows = rows - 1;
							}
						}
					}
					if (trovato === "" && filterValue !== "") {
						this.Filter.push(new sap.ui.model.Filter({
							path: filterProperty,
							operator: filterOperator,
							value1: filterValue
						}));
					}
				}



				oTreeTable.bindRows({
					path: "/WbsElementSet",
					filters: this.Filter,
					parameters: {
						treeAnnotationProperties: {
							hierarchyLevelFor: 'Stufe',
							hierarchyNodeFor: 'NodeID',
							hierarchyParentNodeFor: 'ParentID',
							hierarchyDrillStateFor: 'DrillState'
						},
						operationMode: 'Server',
						useServersideApplicationFilters: true
					}
				});



			} else {
				this.onFilterInit(this.getView().byId("StProject").getSelectedItem(), this.getView().byId("Project").getSelectedItem());
				var oTreeTable = this.byId("tableElement");
				oTreeTable.bindRows({
					path: "/WbsElementSet",
					filters: this.Filter,
					parameters: {
						treeAnnotationProperties: {
							hierarchyLevelFor: 'Stufe',
							hierarchyNodeFor: 'NodeID',
							hierarchyParentNodeFor: 'ParentID',
							hierarchyDrillStateFor: 'DrillState'
						},
						operationMode: 'Client',
						useServersideApplicationFilters: true
					}
				});
				this.loadToggleState();
			}


		},
		handleMenuLayoutPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnLayoutChange":
					this.onListItems();
					break;
				case "mnLayoutDisplay":
					this.onUseSort();
					break;
				case "mnLayoutSave":
					this.onPressSave();
					break;
			}

		},

		handleMenuQuotationPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnDisQuot":
					this.callDisplayQuotation(oEvent);
					break;
				case "mnDisCopy":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		handleMenuBillingPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnDisBill":
					this.callDisplayBilling(oEvent);
					break;
				case "mnCreateBill":
					this.callAddBilling(oEvent);
					break;
				case "mnDisCopy3":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		handleMenuLogisticPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnDisLog":
					this.callDisplayBilling(oEvent);
					break;

				case "mnLogAdvance":
					this.callDisplayAdvance(true);
					break;
				case "mnDisCopy2":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		handleMenuPurReqPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnPurReq":
					this.callDisplayRequestRequisition(oEvent);
					break;
				case "mnPurCopy":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		handleMenuPurOrdPress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnPurOrd":
					this.callDisplayRequestOrder(oEvent);
					break;
				case "mnPurCopy2":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		handleMenuAdvancePress: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			if (oItem.getSubmenu()) {
				return;
			}
			switch (oItem.getId().split("-").pop()) {
				case "mnAdvance":
					this.callDisplayAdvance(false);
					break;
				case "mnAdvCopy":
					navigator.clipboard.writeText(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText());
					break;
			}

		},
		callcj20n: function (oEvent) {

			var url = {
				target: {
					semanticObject: "ZCJ20N",
					action: "create"
				},
				params: {
					// "WBS": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);

		},
		callcj02: function (oEvent) {
			var url = {
				target: {
					semanticObject: "ZCJ02_WBS",
					action: "change"
				},
				params: {}
			};
			this.callTransaction(url);
		},
		callChangeWBS: function (oEvent) {

			var url = {
				target: {
					semanticObject: "ZCJ02_WBS",
					action: "change"
				},
				params: {
					"WBS": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);

		},
		callDisplayAdvance: function (Order) {

			var request = '',
				order = '';
			if (Order) {
				request = '',
					order = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText();
			} else {
				request = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText(),
					order = '';
			}
			var url = {
				target: {
					semanticObject: "ZICC2N_WBS",
					action: "display"
				},
				params: {
					"Request": request,
					"Order": order
				}
			};
			this.callTransaction(url);

		},
		callDisplayRequestRequisition: function (oEvent) {

			var url = {
				target: {
					semanticObject: "ZME53N_WBS",
					action: "display"
				},
				params: {
					"Requisition": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);

		},
		callDisplayRequestOrder: function (oEvent) {

			var url = {
				target: {
					semanticObject: "ZME23N_WBS",
					action: "display"
				},
				params: {
					"Order": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);

		},
		callDisplayBilling: function (oEvent) {

			var url = {
				target: {
					semanticObject: "ZVA03_WBS",
					action: "display"
				},
				params: {
					"SalesOrder": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);

		},
		callAddBilling: function (oEvent) {

			this.getView().byId("AddBilling").setValue("");
			this.getView().byId("AddBilling").setValue(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject().Padre);
			// var ParentNode = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject().ParentID;
			// var items = this.getView().byId("tableElement").getRows();
			// var rows = items.length - 1;
			// if (ParentNode !== ""){
			// 	for (var i = rows; i >= 0; i--) {
			// 		var line = items[i].getBindingContext().getObject();
			// 		if( line.NodeID === ParentNode ){
			// 			if (line.VbelnB !== ""){
			// 				this.getView().byId("AddBilling").setValue(line.VbelnB);
			// 				break;
			// 			}else{
			// 				ParentNode = line.ParentID;
			// 			}
			// 		}
			// 	}
			// }

			this.getView().byId("AddBillingMatnr").setValue(this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject().MatnrL);
			this.getView().byId("AddBillingQty").setValue("1");
			var oDialog = this.byId("DialogAddBilling");
			oDialog.open();
		},
		onSaveBilling: function (oEvent) {

			var line = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject();
			this.Posid = line.WBS_Element;

			var obj = {};
			obj.Operation = 'CREABILL';
			obj.NodeID = line.NodeID;
			obj.WBS_Element = line.WBS_Element;
			obj.VbelnB = this.getView().byId("AddBilling").getValue();
			obj.Material = this.getView().byId("AddBillingMatnr").getValue();
			obj.Quantity = this.getView().byId("AddBillingQty").getValue();
			obj.KDKG1 = line.KDKG1;
			obj.KDKG2 = line.KDKG2;
			obj.Comp_code = line.Comp_code;
			obj.WBS_Padre = line.WBS_Padre;

			var myModel = sap.ui.getCore().getModel("myModel");

			myModel.create('/WbsElementSet', obj, {
				success: function (oData, oResponse) {
					this.onFilterHeader();
					// MessageBox.alert("Purchase Requisition " + oData.Number + " Created");
				}.bind(this),
				error: function (err, oResponse) {
					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
				}.bind(this)
			});

			this.byId("DialogAddBilling").close();
		},
		onCloseBilling: function (oEvent) {
			this.byId("DialogAddBilling").close();
		},
		callDisplayQuotation: function (oEvent) {

			var url = {
				target: {
					semanticObject: "ZVA23_WBS",
					action: "display"
				},
				params: {
					"Quotation": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);

		},
		callSalesOrderCreate: function (oEvent) {
			this.byId("DialogAuart").close();
			var header = this.getView().byId("table").getItems();
			var url = {
				target: {
					semanticObject: "ZVA01_WBS",
					action: "create"
				},
				params: {
					"OrderType": this.getView().byId("tableAuart").getSelectedItem().getText(),
					"SalesOrg": header[0].getBindingContext().getObject().Vkorg,
					"Channel": header[0].getBindingContext().getObject().Vtweg,
					"Division": header[0].getBindingContext().getObject().Spart,
					"SoldTo": header[0].getBindingContext().getObject().Soldto.split("-")[0],
					"ShipTo": header[0].getBindingContext().getObject().Shipto.split("-")[0],
					"WBS": this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText()
				}
			};
			this.callTransaction(url);
		},

		callRequestCreate: function (oEvent) {


			var obj = {};
			obj.Posid = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getText();
			obj.DocType = this.getView().byId("RqBsart").getSelectedKey();
			//obj.GLAcct = this.getView().byId("ReqGL").getValue();
			obj.ShortText = this.getView().byId("ReqText").getValue();
			//obj.MatGrp = this.getView().byId("RqMatGroup").getSelectedKey();
			obj.Quantity = this.getView().byId("rqQty").getValue();
			obj.Unit = this.getView().byId("prMeins").getSelectedKey();
			obj.DelivDate = this._formatDate(this.getView().byId('dataReq').getDateValue());
			//obj.DesVendor = this.getView().byId("prVendor").getSelectedKey();
			obj.ItemText = this.getView().byId("ReqValue").getValue();
			obj.Waers = this.getView().byId("prCurrency").getSelectedKey();
			obj.Asnum = this.getView().byId("prService").getSelectedKey();
			obj.KDKG1 = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject().KDKG1;


			var myModel = sap.ui.getCore().getModel("myModel");
			myModel.create('/PurchReqSet', obj, {
				success: function (oData, oResponse) {
					this.byId("DialogRequest").close();
					MessageBox.alert("Purchase Requisition " + oData.Number + " Created");
				}.bind(this),
				error: function (err, oResponse) {

					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
				}.bind(this)
			});

		},
		onSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var sComp_code = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject().Comp_code;
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("Vendor", FilterOperator.Contains, sTerm));
			}
			aFilters.push(new Filter("Comp_code", 'EQ', sComp_code));

			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		},


		callTransaction: function (url) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal(url));
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hashUrl
				}
			});
		},
		resumeRequest: function (oEvent) {

			var oBinding = this.byId("RqBsart").getBinding("items");
			if (oBinding.isSuspended()) {
				oBinding.resume();
			}

			var aFilters = [];
			var oFilter = '';

			oFilter = new sap.ui.model.Filter({
				path: 'Comp_code',
				operator: 'EQ',
				value1: this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject().Comp_code
			});
			aFilters.push(oFilter);

		/*	oBinding = this.byId("prVendor").getBinding("items");
			// apply filter settings
			oBinding.filter(aFilters);
			if (oBinding.isSuspended()) {
				oBinding.resume();
			} */
			oBinding = this.byId("prMeins").getBinding("items");
			if (oBinding.isSuspended()) {
				oBinding.resume();
			}
			oBinding = this.byId("prService").getBinding("items");
			if (oBinding.isSuspended()) {
				oBinding.resume();
			}
			oBinding = this.byId("prCurrency").getBinding("items");
			if (oBinding.isSuspended()) {
				oBinding.resume();
			}
		},
		onCloseBsart: function (oEvent) {
			this.byId("DialogRequest").close();
		},
		onCloseAuart: function (oEvent) {
			this.byId("DialogAuart").close();
		},
		onPressAdd: function (oEvent) {
			var obj = {};
			obj.Posid = this.Posid;
			var myModel = sap.ui.getCore().getModel("myModel");
			myModel.create('/WbsCreateSet', obj, {
				success: function (oData, oResponse) {
					var table = this.getView().getModel("WbsCreate").getData();
					obj.Posid = oData.Posid;
					obj.Kdkg1 = oData.Kdkg1;
					obj.Kdkg1Desc = oData.Kdkg1Desc;
					obj.Kdkg2 = oData.Kdkg2;
					obj.Kdkg2Desc = oData.Kdkg2Desc;
					obj.Material = '';
					obj.Quantity = '';
					obj.IsNotFirst = true;
					table.push(obj);
					var oModel = new JSONModel(table);
					this.getView().setModel(oModel, 'WbsCreate');
					// this.byId("DialogAdd").open();
				}.bind(this),
				error: function (err, oResponse) {
					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
				}.bind(this)
			});
		},
		onPressLoadCSV: function (e) {

			var fU = this.getView().byId("idLoadCSVFile");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];

			// Create a File Reader object
			var reader = new FileReader();

			reader.onload = function (e) {
				var strCSV = e.target.result;
				var arrCSV = strCSV.match(/[\w .]+(?=,?)/g);
				var columns = 2;
				var table = this.getView().getModel("WbsCreate").getData();
				var index = 0;
				var initialRow = table.length;

				if (initialRow == 1 && table[0].Material == '') {
					initialRow = 0;
				}

				for (var i = columns; arrCSV.length > i; i = i + columns) {

					var obj = {};

					index = ((i - columns) / columns) + initialRow;

					if (table[index] !== undefined) {

						table[index].Material = arrCSV[i];
						table[index].Quantity = arrCSV[i + 1];

					} else {

						obj.Posid = this.Posid;
						obj.Material = arrCSV[i];
						obj.Quantity = arrCSV[i + 1];
						obj.IsNotFirst = true;
						table.push(obj);
					}

				}

				var oModel = new JSONModel(table);
				this.getView().setModel(oModel, 'WbsCreate');

				fU.clear();

			}.bind(this).bind(fU);
			reader.readAsBinaryString(file);
		},
		onPressCreate: function (oEvent) {

			var obj = {};
			obj.Posid = oEvent.getBindingContext().getObject().WBS_Element;
			this.Posid = oEvent.getBindingContext().getObject().WBS_Element;
			this.Stufe = oEvent.getBindingContext().getObject().Stufe;
			var myModel = sap.ui.getCore().getModel("myModel");
			myModel.create('/WbsCreateSet', obj, {
				success: function (oData, oResponse) {
					var table = [];
					obj.Posid = oData.Posid;
					obj.Kdkg1 = oEvent.getBindingContext().getObject().KDKG1;
					obj.Kdkg1Desc = oData.Kdkg1Desc;
					obj.Kdkg2 = oEvent.getBindingContext().getObject().KDKG2;

					if (parseInt(obj.Kdkg2).toString() !== "NaN") {
						obj.Kdkg2 = parseInt(obj.Kdkg2).toString();
					}
					if (obj.Kdkg1 !== "" && obj.Kdkg1 !== "NaN") {
						obj.Kdkg1Vis = false;
					} else {
						obj.Kdkg1Vis = true;
					}
					if (obj.Kdkg2 !== "" && obj.Kdkg2 !== "NaN") {
						obj.Kdkg2Vis = false;
					} else {
						obj.Kdkg2Vis = true;
					}

					obj.Kdkg2Desc = oData.Kdkg2Desc;
					obj.Material = '';
					obj.Quantity = '';
					obj.IsNotFirst = false;
					table.push(obj);
					var oModel = new JSONModel(table);
					this.getView().setModel(oModel, 'WbsCreate');
					this.byId("DialogAdd").open();
				}.bind(this).bind(oEvent),
				error: function (err, oResponse) {

					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);

				}.bind(this)
			});
		},
		onSaveAdd: function (oEvent) {
			// this.getView().byId("tableCreate")

			var line = [];
			var oline = '';
			var items = this.getView().byId("tableCreate").getItems();
			var rows = items.length;
			var i = 0;
			if (rows !== 0) {
				for (i = 0; i < rows; i++) {
					oline = {
						"Posid": items[i].getCells()[0].getText(),
						"Kdkg1": items[0].getCells()[1].getValue(),
						"Kdkg2": items[0].getCells()[2].getValue(),
						"Material": items[i].getCells()[3].getValue(),
						"Quantity": items[i].getCells()[4].getValue()
					};
					line.push(oline);
				}
			}
			var json = {
				"Posid": this.Posid,
				"Kdkg1": items[0].getCells()[1].getValue(),
				"Kdkg1Desc": items[0].getCells()[1].getSelectedItem().getAdditionalText(),
				"Kdkg2": items[0].getCells()[2].getValue(),
				"Kdkg2Desc": items[0].getCells()[2].getSelectedItem().getAdditionalText(),
				"Stufe": this.Stufe,
				"toWBSItems": line
			};
			this.createModel = new JSONModel(json);
			this.getView().setModel(this.createModel, "createCollection");
			var oSOData = this.getView().getModel("createCollection").getData();
			sap.ui.core.BusyIndicator.show(0);
			var oModel = this.getOwnerComponent().getModel();
			var mParameters = {
				success: function (oData, response) {
					this.byId("DialogAdd").close();
					sap.ui.core.BusyIndicator.hide();
					var hdrMessageObject = JSON.parse(response.headers["sap-message"]);
					var oModel = new JSONModel(hdrMessageObject.details);
					this.getView().setModel(oModel, "returnModel");

					var items = this.getView().getModel("returnModel").getData();
					var rows = items.length;
					this.oDialog.setState("Success");
					for (var i = 0; i < rows; i++) {
						if (items[i].severity === 'success') {
							items[i].severity = 'Success';
						} else {
							items[i].severity = 'Error';
							this.oDialog.setState("Error");
						}
					}

					this.oMessageView.setModel(this.getView().getModel("returnModel"));
					this.oMessageView.navigateBack();
					this.oDialog.open();
				}.bind(this),
				error: function (oError) {

					sap.ui.core.BusyIndicator.hide();
					var responseObject = JSON.parse(oError.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
				}.bind(this)
			};
			oModel.create("/WbsCreateSet", oSOData, mParameters);

			this.onFilterHeader();

		},

		onCloseAdd: function (oEvent) {
			this.byId("DialogAdd").close();
		},

		onPressFullBanc: function (oEvent) {
			if (this.byId("fcl").getLayout() === "MidColumnFullScreen") {
				this.byId("fcl").setLayout("TwoColumnsMidExpanded");
				this.byId("ProjectTop").setVisible(false);
				this.byId("ProjectTopText").setVisible(false);
			} else {
				this.byId("fcl").setLayout("MidColumnFullScreen");
				this.byId("ProjectTop").setVisible(true);
				this.byId("ProjectTopText").setVisible(true);
			}

		},
		onPressDecline: function (oEvent) {
			// this.getView().byId("BtFullMat").setPressed(false);
			this.getView().byId("BtFullBanc").setPressed(false);
			// this.getView().byId("All_Batch").removeSelections(true);
			this.byId("fcl").setLayout("OneColumn");

		},

		_data: {
			"Quotation": false,
			"Billing": false,
			"Dates": false,
			"Logistic": false,
			"Purchasing": false,
			"Stufe": '',
			"Line": ''
		},

		routeMatched: function (oEvent) {
			this.getView().byId("prMeins").getModel().setSizeLimit(1000);
			this.getView().byId("prCurrency").getModel().setSizeLimit(500);
			this.getView().byId("prService").getModel().setSizeLimit(500);
			this.getView().byId("Project").getModel().setSizeLimit(500);
			this.getView().byId("StProject").getModel().setSizeLimit(500);
			this.getView().byId("StQuotation").getModel().setSizeLimit(500);
			this.getView().byId("DcQuotation").getModel().setSizeLimit(500);
			this.getView().byId("BillingType").getModel().setSizeLimit(500);
			this.getView().byId("Logistic").getModel().setSizeLimit(500);
			// this.getView().byId("OrdItemCat").getModel().setSizeLimit(500);
			this.getView().byId("CostConditionType").getModel().setSizeLimit(500);
			this.getView().byId("TargetMarginCondition").getModel().setSizeLimit(500);
			this.getView().byId("ActualMarginCondition").getModel().setSizeLimit(500);
			//this.getView().byId("RqMatGroup").getModel().setSizeLimit(500);
			this.getView().byId("prVendor").getModel().setSizeLimit(600);


			// this.Project = oEvent.getParameter("arguments").Project;
			// this.StProject = oEvent.getParameter("arguments").StProject;
			// var oTreeTable = this.byId("tableElement");
			// oTreeTable.bindRows({
			// 	path: "/WbsElementSet"
			// });
		},
		onSearch: function (oEvent) {
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel, "returnModel2");
			this.getView().byId("ProjectTop").setSelectedKey(this.getView().byId("Project").getSelectedKey());
			this.onResetFilter();
			this.onFilterHeader(oEvent);
		},
		onSearchRefresh: function (oEvent) {
			this.onResetFilter();
			this.onFilterHeader(oEvent);
		},
		onResetFilter: function () {
			//Reset filter and sort 
			var columns = this.byId("tableElement").getColumns();
			for (var i = 0; i < columns.length; i++) {
				columns[i].setSorted(false);
				if (columns[i].getFiltered()) {
					columns[i].filter("");
				}
			}
		},
		onFilterHeader: function (oEvent) {
			// if (this.byId("fcl").getLayout() === "TwoColumnsMidExpanded") {
			this.byId("fcl").setLayout("MidColumnFullScreen");
			this.getView().byId("BtFullBanc").setPressed(true);
			// this.getView().byId("BtFullBanc").setPressed(true);
			// }

			this.byId("ProjectTop").setVisible(true);
			this.byId("ProjectTopText").setVisible(true);

			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var SEL = this.getView().byId("Project").getSelectedItem();
			if (SEL === '') {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			SEL = this.getView().byId("StProject").getSelectedItem();
			if (SEL === '') {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			SEL = this.getView().byId("StQuotation").getSelectedItem();

			if (SEL === '') {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			var line = this.getView().byId("DcQuotation").getSelectedItems().length;
			if (line === 0) {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			line = this.getView().byId("BillingType").getSelectedItems().length;
			if (line === 0) {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			line = this.getView().byId("Logistic").getSelectedItems().length;
			if (line === 0) {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			// SEL = this.getView().byId("OrdItemCat").getSelectedItem();
			// if (SEL === '') {
			// 	MessageBox.error(i18n.getText("MsgError"));
			// 	return;
			// }
			SEL = this.getView().byId("CostConditionType").getSelectedItem();
			if (SEL === '') {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			SEL = this.getView().byId("TargetMarginCondition").getSelectedItem();
			if (SEL === '') {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			SEL = this.getView().byId("ActualMarginCondition").getSelectedItem();
			if (SEL === '') {
				MessageBox.error(i18n.getText("MsgError"));
				return;
			}
			this.goToHeader();
		},

		goToHeader: function (oEvent) {

			var oBinding = this.byId("table").getBinding("items"),
				aFilters = [];
			var oFilter = '';

			var SEL = this.getView().byId("Project").getSelectedItem();
			if (SEL !== null) {
				SEL = SEL.getKey();
				oFilter = new sap.ui.model.Filter({
					path: 'Pspid',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}
			SEL = this.getView().byId("StProject").getSelectedItem();
			if (SEL !== null) {
				SEL = SEL.getKey();
				oFilter = new sap.ui.model.Filter({
					path: 'Stsma',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}

			// apply filter settings
			oBinding.filter(aFilters);
			// resume
			if (oBinding.isSuspended()) {
				oBinding.resume();
			}
			// this.byId("mnCreateODV").setEnabled(true);
			this.onFilterItems(this.getView().byId("StProject").getSelectedItem(), this.getView().byId("Project").getSelectedItem());
			this.byId("fcl").setLayout("MidColumnFullScreen");
			// this.getView().byId("navCon").to(this.getView().byId("Page1"));
		},
		navTo: function (sViewName, mParameters) {
			this.getOwnerComponent().getRouter().navTo(sViewName, mParameters);
		},

		onPressBackBtn: function (oEvent) {
			// this.getOwnerComponent().getRouter().navTo("RouteProjectView");
			this.getView().byId("navCon").to(this.getView().byId("Page1"));
		},
		onPressBackBtn1: function (oEvent) {
			// this.getOwnerComponent().getRouter().navTo("RouteProjectView");
			this.getView().byId("navCon").to(this.getView().byId("PageSel"));
		},
		onStufePress: function (oEvent) {
			this.byId("DialogStufe").open();
		},
		onCloseStufe: function (oEvent) {
			this.byId("DialogStufe").close();
		},
		onSelStufe: function (oEvent) {
			// this.getView().byId("btStufe").setType('Emphasized');

			this.onFilterItems(this.getView().byId("StProject").getSelectedItem(), this.getView().byId("Project").getSelectedItem());
			this.byId("DialogStufe").close();
		},
		onFilterInit: function (stProject, Project) {
			var aFilters = [];
			var oFilter = '';
			if (Project !== null) {
				var SEL = Project.getKey(); //oEvent.getSource().getBindingContext().getObject().Pspid;
				oFilter = new sap.ui.model.Filter({
					path: 'Project_Definition',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}

			SEL = this.getView().byId("tableStufe").getSelectedItem();
			if (SEL !== null) {
				SEL = parseInt(SEL.getKey());
				oFilter = new sap.ui.model.Filter({
					path: 'Livello',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}

			if (stProject !== null) {
				SEL = stProject.getKey(); //oEvent.getSource().getBindingContext().getObject().Stsma;
				if (SEL !== '') {
					oFilter = new sap.ui.model.Filter({
						path: 'StProject',
						operator: 'EQ',
						value1: SEL
					});
					aFilters.push(oFilter);

				}
			}
			SEL = this.getView().byId("StQuotation").getSelectedItem();
			if (SEL !== null) {
				SEL = SEL.getKey();
				oFilter = new sap.ui.model.Filter({
					path: 'StQuotation',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			} // else { MessageBox.error(i18n.getText("MsgError")); return; }
			var items = this.getView().byId("DcQuotation").getSelectedItems();
			var rows = items.length;
			var i = 0;
			if (rows !== 0) {
				for (i = 0; i < rows; i++) {

					SEL = items[i].getKey();
					oFilter = new sap.ui.model.Filter({
						path: 'DcQuotation',
						operator: 'EQ',
						value1: SEL
					});
					aFilters.push(oFilter);
				}
			}
			items = this.getView().byId("BillingType").getSelectedItems();
			rows = items.length;
			if (rows !== 0) {
				for (i = 0; i < rows; i++) {

					SEL = items[i].getKey();
					oFilter = new sap.ui.model.Filter({
						path: 'BillingType',
						operator: 'EQ',
						value1: SEL
					});
					aFilters.push(oFilter);
				}
			}
			items = this.getView().byId("Logistic").getSelectedItems();
			rows = items.length;
			if (rows !== 0) {
				for (i = 0; i < rows; i++) {

					SEL = items[i].getKey();
					oFilter = new sap.ui.model.Filter({
						path: 'Logistic',
						operator: 'EQ',
						value1: SEL
					});
					aFilters.push(oFilter);
				}
			}

			// SEL = this.getView().byId("OrdItemCat").getSelectedItem();
			// if (SEL !== null) {
			// 	SEL = SEL.getKey();
			// 	oFilter = new sap.ui.model.Filter({
			// 		path: 'OrdItemCat',
			// 		operator: 'EQ',
			// 		value1: SEL
			// 	});
			// 	aFilters.push(oFilter);
			// }
			SEL = this.getView().byId("CostConditionType").getSelectedItem();
			if (SEL !== null) {
				SEL = SEL.getKey();
				oFilter = new sap.ui.model.Filter({
					path: 'CostConditionType',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}
			SEL = this.getView().byId("TargetMarginCondition").getSelectedItem();
			if (SEL !== null) {
				SEL = SEL.getKey();
				oFilter = new sap.ui.model.Filter({
					path: 'TargetMarginCondition',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}
			SEL = this.getView().byId("ActualMarginCondition").getSelectedItem();
			if (SEL !== null) {
				SEL = SEL.getKey();
				oFilter = new sap.ui.model.Filter({
					path: 'ActualMarginCondition',
					operator: 'EQ',
					value1: SEL
				});
				aFilters.push(oFilter);
			}
			this.Filter = aFilters;
		},
		onFilterItems: function (stProject, Project) {

			var oTreeTable = this.byId("tableElement");
			this.onFilterInit(stProject, Project);

			var aColumns = oTreeTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {

				var rows = this.Filter.length;
				var j = 0;
				var trovato = "";

				if (rows !== 0) {
					for (j = 0; j < rows; j++) {

						if (this.Filter[j].sPath === aColumns[i].getFilterProperty()) {
							trovato = "X";
						}
					}
					if (trovato === "X") {
						oTreeTable.filter(aColumns[i], null);
					}
				}

			}

			oTreeTable.bindRows({
				path: "/WbsElementSet",
				filters: this.Filter,
				parameters: {
					// countMode: "Inline",
					treeAnnotationProperties: {
						hierarchyLevelFor: 'Stufe',
						hierarchyNodeFor: 'NodeID',
						hierarchyParentNodeFor: 'ParentID',
						hierarchyDrillStateFor: 'DrillState'
					},
					operationMode: 'Client',
					useServersideApplicationFilters: true
				}
			});

		},
		onBeforeRebindTable: function (oEvent) {
			// this.onFilterHeader();
			//this.onFilterItems(this.getView().byId("StProject").getSelectedItem(), this.getView().byId("Project").getSelectedItem());
			//var oBindingParams = oEvent.getParameter("bindingParams");
			var oBindingParams = oEvent.getParameter("bindingParams");
			// oBindingParams.parameters.threshold = 50000;
			// oBindingParams.parameters.countMode = "Inline";
			// oBindingParams.parameters.operationMode = "Server";
			// oBindingParams.parameters.numberOfExpandedLevels = 1;
			// var oFilter = new sap.ui.model.Filter("NodeId", sap.ui.model.FilterOperator.EQ, this._oGUID);
			// oBindingParams.filters.push(oFilter);
			// this.addBindingListener(oBindingParams, "dataReceived", this._onBindingDataReceivedListener.bind(this));
		},
		onUseSort: function (oEvent) {
			var oBinding = this.byId("tableSort").getBinding("items");
			oBinding.filter().refresh();
			this.byId("DialogUseSort").open();
		},
		onCloseSortList: function (oEvent) {
			this.byId("DialogUseSort").close();
		},
		onUsePress: function (oEvent) {
			var items = this.getView().byId("tableElement").getColumns();
			var rows = items.length;
			var i = 0;
			for (i = 0; i < rows; i++) {
				items[i].setVisible(false);
			}
			var Start = 0;
			var End = this.getView().byId("tableElement").getColumns()[0].getId().length - 2;
			var StringInit = this.getView().byId("tableElement").getColumns()[0].getId().substring(Start, End);

			var oline = "";
			var Col = oEvent.getSource().getBindingContext().getObject().Col.split(";"),
				Pos = oEvent.getSource().getBindingContext().getObject().Pos.split(";");
			rows = Col.length;
			i = 0;
			for (i = 0; i < rows; i++) {
				Col[i] = StringInit + Col[i];
				oline = this.getView().byId(Col[i]);
				if (oline !== undefined) {
					this.getView().byId("tableElement").removeColumn(oline.getIndex());
					this.getView().byId("tableElement").insertColumn(oline, Pos[i]);
					this.getView().byId(Col[i]).setVisible(true);
				}
			}

			this.byId("DialogUseSort").close();
		},

		useSortVariant: function (layoutName) {

			if (layoutName === "") {
				return;
			}

			var items = this.getView().byId("tableElement").getColumns();
			var rows = items.length;
			var i = 0;
			for (i = 0; i < rows; i++) {
				items[i].setVisible(false);
			}
			var Start = 0;
			var End = this.getView().byId("tableElement").getColumns()[0].getId().length - 2;
			var StringInit = this.getView().byId("tableElement").getColumns()[0].getId().substring(Start, End);

			var oline = "";
			var Col = this.getView().getModel().oData["SortItemSet(\'" + layoutName + "\')"].Col.split(";"),
				Pos = this.getView().getModel().oData["SortItemSet(\'" + layoutName + "\')"].Pos.split(";");
			rows = Col.length;
			i = 0;
			for (i = 0; i < rows; i++) {
				Col[i] = StringInit + Col[i];
				oline = this.getView().byId(Col[i]);
				if (oline !== undefined) {
					this.getView().byId("tableElement").removeColumn(oline.getIndex());
					this.getView().byId("tableElement").insertColumn(oline, Pos[i]);
					this.getView().byId(Col[i]).setVisible(true);
				}
			}

		},

		onDeleteSortList: function (oEvent) {
			var delurl = "/SortItemSet(Name='" + oEvent.getSource().getBindingContext().getObject().Name + "')";
			var myModel = sap.ui.getCore().getModel("myModel");
			myModel.remove(delurl, {
				success: function (oData, oResponse) {
					var oBinding = this.byId("tableSort").getBinding("items");
					oBinding.filter().refresh();
				}.bind(this),
				error: function (err, oResponse) {

					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
				}.bind(this)
			});
		},
		onListItems: function (oEvent) {

			var items = this.getView().byId("tableElement").getColumns();
			var line = [];
			var oline = '';
			var rows = items.length;
			var i = 0;
			for (i = 0; i < rows; i++) {
				oline = {
					"Name": items[i].getLabel().getText(),
					"Id": items[i].getId(),
					"Pos": i,
					"Visible": items[i].getVisible()
				};
				line.push(oline);
			}
			var oModel = new JSONModel(line);
			this.getView().setModel(oModel, 'SortItems');
			this.byId("DialogListItems").open();

		},
		onSaveSortItems: function (oEvent) {
			var items = this.getView().getModel("SortItems").getData();
			var oline = '';
			var rows = items.length;
			var i = 0;
			for (i = 0; i < rows; i++) {
				oline = this.getView().byId(items[i].Id);
				this.getView().byId("tableElement").removeColumn(oline.getIndex());
				this.getView().byId("tableElement").insertColumn(oline, i);
				this.getView().byId(items[i].Id).setVisible(items[i].Visible);
			}
			this.byId("DialogListItems").close();
		},
		onCloseSortItems: function (oEvent) {
			this.byId("DialogListItems").close();
		},
		onUpPressed: function (oEvent) {
			var oCurrentIndex = oEvent.getSource().getBindingContext("SortItems").getPath().split("/").pop();
			if (oCurrentIndex > 0) {
				var items = this.getView().getModel("SortItems").getData();
				var line = [];
				var oline = '';
				var rows = items.length;
				var i = 0;
				for (i = 0; i < rows; i++) {

					if (oCurrentIndex - 1 == i) {
						oline = {
							"Name": items[i + 1].Name,
							"Id": items[i + 1].Id,
							"Pos": items[i + 1].Pos,
							"Visible": items[i + 1].Visible,
						};
						line.push(oline);
						oline = {
							"Name": items[i].Name,
							"Id": items[i].Id,
							"Pos": items[i].Pos,
							"Visible": items[i].Visible,
						};
						line.push(oline);
					} else if (oCurrentIndex != i) {
						oline = {
							"Name": items[i].Name,
							"Id": items[i].Id,
							"Pos": items[i].Pos,
							"Visible": items[i].Visible,
						};
						line.push(oline);
					}
				}
				var oModel = new JSONModel(line);
				this.getView().setModel(oModel, 'SortItems');
				this.getView().getModel('SortItems').refresh(true);
			}
		},
		onDownPressed: function (oEvent) {
			var oCurrentIndex = oEvent.getSource().getBindingContext("SortItems").getPath().split("/").pop();
			if (oCurrentIndex > 0) {
				var items = this.getView().getModel("SortItems").getData();
				var line = [];
				var oline = '';
				var rows = items.length;
				var i = 0;
				for (i = 0; i < rows; i++) {
					if (oCurrentIndex == i) {
						oline = {
							"Name": items[i + 1].Name,
							"Id": items[i + 1].Id,
							"Pos": items[i + 1].Pos,
							"Visible": items[i + 1].Visible,
						};
						line.push(oline);
						oline = {
							"Name": items[i].Name,
							"Id": items[i].Id,
							"Pos": items[i].Pos,
							"Visible": items[i].Visible,
						};
						line.push(oline);
					} else if (oCurrentIndex != i - 1) {
						oline = {
							"Name": items[i].Name,
							"Id": items[i].Id,
							"Pos": items[i].Pos,
							"Visible": items[i].Visible,
						};
						line.push(oline);
					}
				}
				var oModel = new JSONModel(line);
				this.getView().setModel(oModel, 'SortItems');
				this.getView().getModel('SortItems').refresh(true);
			}
		},

		onPressVariant: function (oEvent) {
			this.getView().byId("VariantName").setValue("");
			var oDialog = this.byId("DialogVariant");
			oDialog.open();
		},
		onSaveVariant: function (oEvent) {
			var obj = {};
			obj.Name = this.getView().byId("VariantName").getValue();
			if (obj.Name.includes(' ')) {
				MessageBox.alert('Space not permitted');
			} else {
				obj.Project = this.getView().byId("Project").getSelectedKey();
				obj.Stproject = this.getView().byId("StProject").getSelectedKey();
				obj.Stquotation = this.getView().byId("StQuotation").getSelectedKey();
				var items = this.getView().byId("DcQuotation").getSelectedKeys();
				if (items[0] !== undefined) {
					obj.Dcquotation1 = items[0];
				}
				if (items[1] !== undefined) {
					obj.Dcquotation2 = items[1];
				}
				if (items[2] !== undefined) {
					obj.Dcquotation3 = items[2];
				}
				if (items[3] !== undefined) {
					obj.Dcquotation4 = items[3];
				}
				if (items[4] !== undefined) {
					obj.Dcquotation5 = items[4];
				}
				items = this.getView().byId("BillingType").getSelectedKeys();
				if (items[0] !== undefined) {
					obj.Billingtype1 = items[0];
				}
				if (items[1] !== undefined) {
					obj.Billingtype2 = items[1];
				}
				if (items[2] !== undefined) {
					obj.Billingtype3 = items[2];
				}
				if (items[3] !== undefined) {
					obj.Billingtype4 = items[3];
				}
				if (items[4] !== undefined) {
					obj.Billingtype5 = items[4];
				}
				items = this.getView().byId("Logistic").getSelectedKeys();
				if (items[0] !== undefined) {
					obj.Logistic1 = items[0];
				}
				if (items[1] !== undefined) {
					obj.Logistic2 = items[1];
				}
				if (items[2] !== undefined) {
					obj.Logistic3 = items[2];
				}
				if (items[3] !== undefined) {
					obj.Logistic4 = items[3];
				}
				if (items[4] !== undefined) {
					obj.Logistic5 = items[4];
				}

				// obj.Orditemcat = this.getView().byId("OrdItemCat").getSelectedKey();
				obj.Costconditiontype = this.getView().byId("CostConditionType").getSelectedKey();
				obj.Targetmargincondition = this.getView().byId("TargetMarginCondition").getSelectedKey();
				obj.Actualmargincondition = this.getView().byId("ActualMarginCondition").getSelectedKey();

				//Save corrisponding layout
				obj.Layout = this.getView().byId("VariantLayout").getSelectedKey();

				var myModel = sap.ui.getCore().getModel("myModel");
				myModel.create('/Project_variantSet', obj, {
					success: function (oData, oResponse) { },
					error: function (err, oResponse) {

						var responseObject = JSON.parse(err.responseText);
						MessageBox.alert(responseObject.error.message.value);
						this.PopulateError('Error', responseObject.error.message.value);
					}.bind(this)
				});
				this.useSortVariant(obj.Layout);
				this.byId("DialogVariant").close();
			}
		},
		onListVariant: function (oEvent) {
			var oBinding = this.byId("tableVariant").getBinding("items");
			oBinding.filter().refresh();
			// this.getModel("/Project_variantSet").refresh();
			this.byId("DialogVariantList").open();
		},
		onPressSave: function (oEvent) {
			this.getView().byId("SortName").setValue("");
			var oDialog = this.byId("DialogSaveSort");
			oDialog.open();
		},
		onSaveSort: function (oEvent) {
			var obj = {};
			obj.Name = this.getView().byId("SortName").getValue();
			obj.Col = "";
			obj.Pos = "";
			var items = this.getView().byId("tableElement").getColumns();
			var rows = items.length;
			var i = 0;
			for (i = 0; i < rows; i++) {
				if (items[i].getVisible()) {
					obj.Col = obj.Col + items[i].getId().split("-").pop() + ";";
					obj.Pos = obj.Pos + i + ";";
				}
			}

			var myModel = sap.ui.getCore().getModel("myModel");
			myModel.create('/SortItemSet', obj, {
				success: function (oData, oResponse) { },
				error: function (err, oResponse) {

					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
				}.bind(this)
			});
			this.byId("DialogSaveSort").close();
		},
		onCloseSort: function (oEvent) {
			this.byId("DialogSaveSort").close();
		},
		onCloseVariantList: function (oEvent) {
			this.byId("DialogVariantList").close();
		},
		onDeleteVariantList: function (oEvent) {
			var delurl = "/Project_variantSet(Name='" + oEvent.getSource().getBindingContext().getObject().Name + "')";
			var myModel = sap.ui.getCore().getModel("myModel");
			myModel.remove(delurl, {
				success: function (oData, oResponse) {
					var oBinding = this.byId("tableVariant").getBinding("items");
					oBinding.filter().refresh();
				}.bind(this),
				error: function (err, oResponse) {
					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
				}
			});

		},
		onVariantPress: function (oEvent) {

			this.getView().byId("ProjectTop").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Project);
			this.getView().byId("Project").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Project);
			this.getView().byId("StProject").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Stproject);
			this.getView().byId("StQuotation").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Stquotation);
			// this.getView().byId("OrdItemCat").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Orditemcat);
			this.getView().byId("CostConditionType").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Costconditiontype);
			this.getView().byId("TargetMarginCondition").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Targetmargincondition);
			this.getView().byId("ActualMarginCondition").setSelectedKey(oEvent.getSource().getBindingContext().getObject().Actualmargincondition);

			var items = [];
			if (oEvent.getSource().getBindingContext().getObject().Dcquotation1 !== '') {
				var item = oEvent.getSource().getBindingContext().getObject().Dcquotation1;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Dcquotation2 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Dcquotation2;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Dcquotation3 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Dcquotation3;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Dcquotation4 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Dcquotation4;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Dcquotation5 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Dcquotation5;
				items.push(item);
			}
			this.getView().byId("DcQuotation").setSelectedKeys(items);

			items = [];
			if (oEvent.getSource().getBindingContext().getObject().Billingtype1 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Billingtype1;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Billingtype2 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Billingtype2;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Billingtype3 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Billingtype3;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Billingtype4 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Billingtype4;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Billingtype5 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Billingtype5;
				items.push(item);
			}
			this.getView().byId("BillingType").setSelectedKeys(items);

			items = [];
			if (oEvent.getSource().getBindingContext().getObject().Logistic1 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Logistic1;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Logistic2 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Logistic2;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Logistic3 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Logistic3;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Logistic4 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Logistic4;
				items.push(item);
			}
			if (oEvent.getSource().getBindingContext().getObject().Logistic5 !== '') {
				item = oEvent.getSource().getBindingContext().getObject().Logistic5;
				items.push(item);
			}
			this.getView().byId("Logistic").setSelectedKeys(items);

			this.useSortVariant(oEvent.getSource().getBindingContext().getObject().Layout);

			this.byId("DialogVariantList").close();
		},
		onCloseVariant: function (oEvent) {
			this.byId("DialogVariant").close();
		},
		onPressQuotation: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			if (LocalParams.getProperty("/Quotation") === true) {
				this.getView().byId("btQuotation").setType('Transparent');
				LocalParams.setProperty("/Quotation", false);
			} else {
				this.getView().byId("btQuotation").setType('Emphasized');
				LocalParams.setProperty("/Quotation", true);
			}

		},
		onPressBilling: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			if (LocalParams.getProperty("/Billing") === true) {
				this.getView().byId("btBilling").setType('Transparent');
				LocalParams.setProperty("/Billing", false);
			} else {
				this.getView().byId("btBilling").setType('Emphasized');
				LocalParams.setProperty("/Billing", true);
			}
		},
		onPressDates: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			if (LocalParams.getProperty("/Dates") === true) {
				this.getView().byId("btDates").setType('Transparent');
				LocalParams.setProperty("/Dates", false);
			} else {
				this.getView().byId("btDates").setType('Emphasized');
				LocalParams.setProperty("/Dates", true);
			}
		},
		onPressLogistic: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			if (LocalParams.getProperty("/Logistic") === true) {
				this.getView().byId("btLogistic").setType('Transparent');
				LocalParams.setProperty("/Logistic", false);
			} else {
				this.getView().byId("btLogistic").setType('Emphasized');
				LocalParams.setProperty("/Logistic", true);
			}
		},
		onPressPurchasing: function (oEvent) {
			var LocalParams = this.getView().getModel("LOCALPARAMS");
			if (LocalParams.getProperty("/Purchasing") === true) {
				this.getView().byId("btPurchasing").setType('Transparent');
				LocalParams.setProperty("/Purchasing", false);
			} else {
				this.getView().byId("btPurchasing").setType('Emphasized');
				LocalParams.setProperty("/Purchasing", true);
			}
		},
		_formatDate: function (date) {
			var d = new Date(date),
				month = '' + (d.getMonth() + 1),
				day = '' + d.getDate(),
				year = d.getFullYear();

			if (month.toString().length < 2) month = '0' + month;
			if (day.toString().length < 2) day = '0' + day;

			return [year, month, day].join('');
		},
		onPressExpand: function (oEvent) {
			if (oEvent.getSource().getExpanded() === false) {
				this.getView().byId("Posizione").setHeight("80%");
				this.getView().byId("Testata").setHeight("13%");
			} else {
				this.getView().byId("Posizione").setHeight("17%");
				this.getView().byId("Testata").setHeight("74%");
			}

		},

		loadToggleState: function () {

			this.byId("tableElement").expandToLevel(4);

		},

		setProjectySO: function (oEvent) {
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel, "returnModel2");
			this.getView().byId("Project").setSelectedKey(this.getView().byId("ProjectTop").getSelectedKey());
			this.onFilterHeader();
		},
		PopulateError: function (type, err, desc) {
			var aMockMessages = this.getView().getModel("returnModel2").getData();
			aMockMessages.push({
				type: type,
				title: err,
				description: desc,
				subtitle: (new Date()).toLocaleString(),
			});

			var oModel = new JSONModel(aMockMessages);
			this.getView().setModel(oModel, "returnModel2");
		},
		onInfoError: function (oEvent) {
			//this.PopulateError('Error', 'Errore Titolo');


			this.MessageError.setModel(this.getView().getModel("returnModel2"));
			this.MessageError.navigateBack();
			this.PopoverError.openBy(oEvent.getSource());
		},

		// 2 campi duration, campo 4 livello logistic order control 
		// campo altri Purchasing order or not 
		// campo altri Purchasing request or not 
		onChangeDate: function (oEvent) {
			this.date = oEvent.getParameter("newValue");
		},

		onChangeDuration: function (oEvent) {
			this.duration = oEvent.getParameter("newValue");
		},
		btnInsertDate: function (oEvent) {
			//inserisci date forecast 
			debugger
			var line = oEvent.getSource().getBindingContext().getObject();
			this.onSaveForecast(this.date, '', line)
		},
		btnInsertDuration: function (oEvent) {
			//inserisci Duration forecast 
			debugger
			var line = oEvent.getSource().getBindingContext().getObject();
			this.onSaveForecast('', this.duration, line)
		},
		onSaveForecast: function (Estrt, ForeDuration, line) {
			sap.ui.core.BusyIndicator.show(0);
			//var line = this.getView().getModel("LOCALPARAMS").getProperty("/Line").getBindingContext().getObject();
			this.Posid = line.WBS_Element;

			var obj = {};
			obj.Operation = 'MODIDATE';
			obj.Estrt = Estrt;
			obj.Eende = line.Eende;
			obj.ForeDuration = parseInt(ForeDuration);
			obj.NodeID = line.NodeID;
			obj.WBS_Element = line.WBS_Element;
			//obj.VbelnB = this.getView().byId("AddBilling").getValue();
			//obj.Material = this.getView().byId("AddBillingMatnr").getValue();
			//obj.Quantity = this.getView().byId("AddBillingQty").getValue();
			obj.KDKG1 = line.KDKG1;
			obj.KDKG2 = line.KDKG2;
			obj.Comp_code = line.Comp_code;
			obj.WBS_Padre = line.WBS_Padre;

			var myModel = sap.ui.getCore().getModel("myModel");

			myModel.create('/WbsElementSet', obj, {
				success: function (oData, oResponse) {
					//this.onFilterHeader();
					this.byId("tableElement").getModel().refresh(true);

					//this.byId("tableElement").refreshRows();
					sap.ui.core.BusyIndicator.hide();
					// MessageBox.alert("Purchase Requisition " + oData.Number + " Created");
				}.bind(this),
				error: function (err, oResponse) {
					var responseObject = JSON.parse(err.responseText);
					MessageBox.alert(responseObject.error.message.value);
					this.PopulateError('Error', responseObject.error.message.value);
					sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			});
		},
		btnOtherRequest: function (oEvent) {
			//Open DialogPurchasing
			var line = oEvent.getSource().getBindingContext().getObject();
			var aFilters = [];
			var oFilter = '';

			oFilter = new sap.ui.model.Filter({
				path: 'WBS_Element',
				operator: 'EQ',
				value1: line.WBS_Element
			});
			aFilters.push(oFilter);
			var oBinding = this.byId("tablePurchasing").getBinding("rows");
			// apply filter settings
			oBinding.filter(aFilters);
			/*if (oBinding.isSuspended()) {
				oBinding.resume();
			}*/
			this.byId("lblTitlePurchasing").setText(line.WBS_Element);
			this.byId("DialogPurchasing").open();
		},
		onExportPurchasing: function (oEvent) {
			//export DialogPurchasing
		},
		onClosePurchasing: function (oEvent) {
			//close DialogPurchasing
			this.byId("DialogPurchasing").close();
		},
		btnOtherLogistic: function (oEvent) {
			//Open DialogLogistic
			var line = oEvent.getSource().getBindingContext().getObject();
			var aFilters = [];
			var oFilter = '';

			oFilter = new sap.ui.model.Filter({
				path: 'WBS_Element',
				operator: 'EQ',
				value1: line.WBS_Element
			});
			aFilters.push(oFilter);

			var items = this.getView().byId("Logistic").getSelectedItems();
			var rows = items.length;
			if (rows !== 0) {
				for (var i = 0; i < rows; i++) {

					var SEL = items[i].getKey();
					oFilter = new sap.ui.model.Filter({
						path: 'Logistic',
						operator: 'EQ',
						value1: SEL
					});
					aFilters.push(oFilter);
				}
			}

			var oBinding = this.byId("tableLogistic").getBinding("rows");
			// apply filter settings
			oBinding.filter(aFilters);
			/*if (oBinding.isSuspended()) {
				oBinding.resume();
			}*/
			this.byId("lblTitleLogistic").setText(line.WBS_Element);
			this.byId("DialogLogistic").open();
		},
		onExportPurchasing: function (oEvent) {
			//export DialogLogistic
		},
		onCloseLogistic: function (oEvent) {
			//close DialogLogistic
			this.byId("DialogLogistic").close();
		},
	});

});