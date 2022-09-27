/**
 * Callback function, receives informations after users accepts login via OAuth
 * has to be in scopes.globals of the main solution
 * information should be transferred to the correct scope via
 * scopes.office365.onO365Authorize(a,args);
 * @param a
 * @param args
 *
 * @properties={typeid:24,uuid:"D824F716-F42F-4525-8314-CBD408F3A547"}
 */
function onO365Authorize (a, args) {
	scopes.imap.onO365Authorize(a,args);
}