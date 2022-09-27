/**
 * generated secret
 * temporary key, works till 2022-10-01 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1CB2E8A7-9199-45EE-8499-FA37C60E2907"}
 */
var clientSecret = 'ZWt8Q~VS~HN_dE.Qrrmq4ymf-X5c0AesQBNgIcSf';

/**
 * client-id, generated by Azure unpon registration
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FCC332C7-04AD-4F61-99B0-3235A31802E3"}
 */
var clientId = '1c62cf99-7745-4589-8f89-55f084f4d2a4';
/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"78DC91AD-4FAE-4157-A287-4EBBAD6EDC71"}
 */
var state = 'SecretSauce22';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"01B91E4D-2CA9-4770-B569-8FCAC9694614"}
 */

var scope = 'openid offline_access https://graph.microsoft.com/mail.read';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C854E2A0-C0FF-4C00-B850-E7E736663A7C"}
 */
var redirectUrl = 'http://localhost:8183/solutions/office365_test/m/onO365Authorize';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C9E93C3A-0D2B-4288-A63C-CEF40FABE420"}
 */
var user_email = 'Robert.Edelmann@BauProCheck.de';
	
/**
 * Callback function, receives informations after users accepts login via OAuth
 * has to be in scopes.globals of the main solution
 * information should be transferred to the correct scope via
 * scopes.office365.onO365Authorize(a,args);
 * @param a
 * @param args
 *
 * @properties={typeid:24,uuid:"10911D41-B495-4CAF-AE65-C565B0211A8D"}
 */
function onO365Authorize (a, args) {
	if (args && args.hasOwnProperty('code') && args['code']) {
//		application.output('found code: ' + args['code']);
		getImapLoginToken(args['code']);
	}
}

/**
 * the function that starts it all; 
 * @properties={typeid:24,uuid:"1F64392F-2D0D-40BD-BF84-E49473A8EB4E"}
 */
function authO365_idToken() {
	var authURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
	authURL += 'client_id=' + clientId;
	authURL += '&response_type=code';
	authURL += '&redirect_uri=' + redirectUrl;
	authURL += '&response_mode=query';
	authURL += '&scope=' + scope;
	authURL += '&state='+state;
	application.output('URL: ' + authURL);
	application.showURL(authURL, '_blank');
}

/**
 * @param {String} code code from authorization
 * @properties={typeid:24,uuid:"B577C101-8EDD-46CB-8FA3-D6F673E3D73A"}
 */
function getImapLoginToken(code) {
	if (!code) {
		return;
	}
	var httpClient = plugins.http.createNewHttpClient();
	var request = httpClient.createPostRequest('https://login.microsoftonline.com/common/oauth2/v2.0/token');
	request.addHeader('Content-Type', 'application/x-www-form-urlencoded');
	var bodyContent = 'client_id='+clientId;
	bodyContent += '&scope=https://outlook.office365.com/.default';
	bodyContent += '&redirect_uri='+redirectUrl;
	bodyContent += '&grant_type=authorization_code';
	bodyContent += '&client_secret='+clientSecret;
	bodyContent += '&code=' + code;
	
	request.setBodyContent(bodyContent);
	var response = request.executeRequest();
	var statusCode = response.getStatusCode()
	if (statusCode != 200) {
		application.output('Error processing request, Statuscode ' + statusCode.toString() + '\n' + response.getResponseBody());
		return;
	} else {
//		application.output(response.getResponseBody());
		/** @type {{token_type: String, scope: String, expires_in: String, ext_expires_in: String, access_token: String, refresh_token: String, id_token: String}} */
		var imapLoginObject = JSON.parse(response.getResponseBody());
		if (imapLoginObject && imapLoginObject.hasOwnProperty('access_token') && imapLoginObject.access_token) {
			getImapInbox(imapLoginObject.access_token);
		}
	}
}

/**
 * uses the access_token to authenticate
 * @param {String} [accessToken]
 *
 * @properties={typeid:24,uuid:"66279104-70F9-4088-999A-AD0471CA2786"}
 */
function getImapInbox(accessToken) {
	if (!accessToken) {
		return;
	}
	var imapAccount = plugins.MailPro.ImapAccount('emailaccount', 'outlook.office365.com', user_email, accessToken);
	imapAccount.port = 993
	var props = {
		"mail.imap.fetchsize": java.lang.Integer.parseInt('1048576'),
		"mail.imaps.fetchsize": java.lang.Integer.parseInt('1048576'),
		"mail.imap.connectionpoolsize": "10",
		"mail.imaps.connectionpoolsize": "10",
		'mail.imaps.starttls.enable': true,
		'mail.imap.starttls.enable': true,
		"mail.imap.ssl.enable": true,
		"mail.imaps.ssl.enable": true,
		"mail.imap.auth.mechanisms": "XOAUTH2",
		"mail.imap.auth.plain.disable": true,
		"mail.imaps.auth.mechanisms": "XOAUTH2",
		"mail.imaps.auth.plain.disable": true
	};

	var rootFolder = imapAccount.connect(props);
	if (!rootFolder || !imapAccount.connected) {
		if (imapAccount.getLastError()) {
			throw imapAccount.getLastError();
		} else {
			return;
		}
	}
	var folder = imapAccount.getRootFolder()
	var subFolders = folder.getSubfolders();
	for (var iFolders = 0; iFolders < subFolders.length; iFolders++) {
		try {
			application.output(subFolders[iFolders].name + ' -> ' + subFolders[iFolders].getMessageCount().toString());
		} catch (e) {
			application.output('Error Accessing Folder: ' + e.name + ' -> ' + e.message + '\n' + e.stack,LOGGINGLEVEL.ERROR)
			break;
		}
	}
}