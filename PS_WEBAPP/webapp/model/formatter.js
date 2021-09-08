sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},
			
			isAddVisible : function (addValue){
				return addValue;
			},
			
			isCancelVisible : function (cancelValue){
				return cancelValue;
			},
			
			isSaveVisible : function (saveValue){
				return saveValue;
			},
			
			isFilterVisible : function (filterValue){
				return filterValue;
			},
			
			isFooterVisible : function (footerValue) {
				return footerValue;
			},
			
			projectStatusText : function(sStatus) {
				switch( sStatus ) {
					case "O":
						return "On Time";
					case "W":
						return "Warning";
					case "D":
						return "Delayed";
					default:
						return "";
				}
			},
			
			projectStatus : function(sStatus) {
				switch( sStatus ) {
					case "O":
						return "Success";
					case "W":
						return "Warning";
					case "D":
						return "Error";
					default:
						return "Information";
				}
			},
			
			toFixed2 : function(sNumber) {
				return parseFloat(sNumber).toFixed(2);
			},
			
			/*
			 * Converts date to format yyyymmdd000000
			 * @param {Date|string} dDate
			 * @returns {string} Date in format yyyymmdd000000
			 */
			dateToString : function (dDate) {
				dDate = new Date(dDate);
				var yyyy = dDate.getFullYear(),
				    mm = ("0" + dDate.getMonth()).substr(-2),
				    dd = ("0" + dDate.getDate()).substr(-2);
				return yyyy + mm + dd + "000000";
			},
			
			/*
			 * Converts value to int
			 */
			parseValueToInt: function (dValue) {
				return dValue !== undefined ? parseInt(dValue, 10) : null;
			},
			
			/*
			 * Checks if the value is 0 or not
			 */
			isNotZero: function (dValue) {
				return ( dValue !== undefined ? parseInt(dValue, 10) : 0 ) !== 0;
			},
			
			/*
			 * Checks if the value is null
			 */
			isNotNull: function (dValue) {
				return dValue !== null;
			}
			
			
		};

	}
);