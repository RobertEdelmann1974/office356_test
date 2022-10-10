/**
 * generated secret
 * temporary key, works till 2022-10-01
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"D2A9F349-FCE4-40EE-8DEF-CAAE1D3238F8"}
 */
var clientSecret = '';

/**
 * client-id, generated by Azure unpon registration
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"0E4A69F2-5249-453C-88B2-4C69EBEDE3C5"}
 */
var clientId = '';

/**
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"8D4474D0-3C7C-4CFD-8829-B8A979B7629E"}
 */
var tenantId = '';
/**
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"B4AA653E-979B-44D4-B938-3CABAF41D18D"}
 */
var state = 'SecretSauce22';

/**
 * @type {String}
 *
 *
 * @properties={typeid:35,uuid:"672CE336-A320-4890-AED6-3947F74DD37C"}
 */
var idToken = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"38496EB7-FBF8-4D12-BE5B-018D0B95B0DB"}
 */
var accessToken = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1E8459C6-895C-4F57-891D-3857E82AAEDA"}
 */
var refreshToken = null;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"B9647A5C-4109-469B-A9ED-401E81726E52",variableType:93}
 */
var accessTokenExpiresOn = null;

/**
 * @type {plugins.oauth.OAuthService}
 *
 * @properties={typeid:35,uuid:"59BD1954-AB5D-48AF-BFC7-50793A4706DF",variableType:-4}
 */
var office365Service = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FA23DA16-3931-4041-876C-07C6582FDA5A"}
 */
var scope = 'openid\noffline_access\nhttps://graph.microsoft.com/.default';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"07580943-B218-48CA-A040-FD588D42C4A8"}
 */
var redirectUrl = 'http://localhost:8183/solutions/office365_test/m/onO365Authorize';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"25AFFA29-10C1-4204-A644-84B861ABCB7F"}
 */
var email_from = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7D8636AA-5802-4876-AA6A-692EAD5426F1"}
 */
var email_to = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"CE00DAFF-45AA-4CC3-97D5-10AE6E076A0C"}
 */
var email_subject = 'subject';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1D71BA3D-DF40-4593-93CE-CB5E3769EFE0"}
 */
var email_body = 'email_body';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"DAAAE5C5-2B89-4E96-B059-64ABFCDE508A"}
 */
var folderInfo = '';
	

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D06EE1DC-8B53-423B-B0DE-945B81DAEDD2"}
 */
var mailInfo = '';

/**
 * Using the OAuth-Service to get new refresh_token/access_token
 * @param result
 * @param auth_outcome
 *
 * @properties={typeid:24,uuid:"C2562FC9-FE8A-49A0-A983-1860D8559611"}
 */
function onO365Authorize(result, auth_outcome) {
	if (result) {
		//SUCCESS
		/** @type {plugins.oauth.OAuthService} */
		office365Service = auth_outcome;
		idToken = office365Service.getIdToken();
		accessToken = office365Service.getAccessToken()
		refreshToken = office365Service.getRefreshToken();
		accessTokenExpiresOn = new Date(new Date().getTime() + 1000 * office365Service.getAccessTokenLifetime());
		if (!accessToken) {
			application.output('could not get token from service.');
			return;
		}
	} else {
		//ERROR
		application.output("ERROR " + auth_outcome, LOGGINGLEVEL.ERROR);
	}
}

/**
 * the function that starts it all;
 * @properties={typeid:24,uuid:"F0FA5882-9310-41A1-9DAF-8DEC5C98D321"}
 */
function authO365_getCode() {
	var oauthOffice365 = plugins.oauth.serviceBuilder(clientId);
	oauthOffice365.clientSecret(clientSecret);
	oauthOffice365.defaultScope(scope.split('\n').join(' '));
	if (tenantId) {
		oauthOffice365.tenant(tenantId);
	}
	oauthOffice365.state(state)
	oauthOffice365.deeplink("onO365Authorize")
	oauthOffice365.callback(onO365Authorize, 30)
	oauthOffice365.responseMode('query');
	oauthOffice365.responseType('code');
	oauthOffice365.build(plugins.oauth.OAuthProviders.MICROSOFT_AD);
}

/**
 * When there's an existing (and valid) refresh_token you can get a
 * fresh set of access_token and refresh_token manually
 *
 * @properties={typeid:24,uuid:"FE798500-8CC0-4AE0-9C36-8871E2C3A8D6"}
 */
function refreshAccessToken() {
	if (!refreshToken) {
		return;
	}
	var httpClient = plugins.http.createNewHttpClient();
	var request = httpClient.createPostRequest('https://login.microsoftonline.com/common/oauth2/v2.0/token');
	request.addHeader('Content-Type', 'application/x-www-form-urlencoded');
	var bodyContent = 'client_id=' + clientId;
	bodyContent += '&grant_type=refresh_token';
	bodyContent += '&scope=' + scope.split('\n').join(' ');
	bodyContent += '&refresh_token=' + refreshToken;
	bodyContent += '&client_secret=' + clientSecret;
	request.setBodyContent(bodyContent);

	var start = new Date();
	var response = request.executeRequest();
	var statusCode = response.getStatusCode()
	if (statusCode != 200) {
		application.output('Error processing request, Statuscode ' + statusCode.toString() + '\n' + response.getResponseBody());
		return;
	} else {
		/** @type {{token_type: String, scope: String, expires_in: Number, ext_expires_in: Number, access_token: String, refresh_token: String, id_token: String}} */
		var accessTokenObject = JSON.parse(response.getResponseBody());
		accessToken = accessTokenObject.access_token;
		refreshToken = accessTokenObject.refresh_token;
		accessTokenExpiresOn = new Date(start.getTime() + accessTokenObject.expires_in * 1000);
		idToken = accessTokenObject.id_token;
	}
}

/**
 * @properties={typeid:24,uuid:"45BDC602-0FDF-4E92-9E8D-C39E11163768"}
 */
function sendMailGraph() {
	if (!accessToken) {
		return;
	}
	var httpClient = plugins.http.createNewHttpClient();
	var request = httpClient.createPostRequest('https://graph.microsoft.com/v1.0/me/sendMail');
	request.addHeader('Content-Type', 'application/json');
	request.addHeader('Authorization', accessToken)
	var sendObject = {
		message: {
			subject: email_subject,
			body: {
				contentType: 'Text',
				content: email_body
			},
			toRecipients: [{ emailAddress: { address: email_to } }],
			ccRecipients: [{ emailAddress: { address: 'robert.edelmann@gmail.com' } }]
		}, saveToSentItems: true
	}
	var bodyContent = JSON.stringify(sendObject)
	request.setBodyContent(bodyContent);
	var response = request.executeRequest();
	var statusCode = response.getStatusCode();
	application.output('Status: ' + statusCode + '\n'+response.getResponseBody());
}

/**
 * @properties={typeid:24,uuid:"54CAEE1A-ACEA-4383-9CCE-C27776DF8F8D"}
 */
function listMail() {
	mailInfo = 'not yet implemented.'
}

/**
 * @properties={typeid:24,uuid:"39239903-7FAC-436E-8FB3-47D8B8892291"}
 */
function listFoldersGraph() {
	folderInfo = '';
	if (!accessToken) {
		return;
	}
	var url = 'https://graph.microsoft.com/v1.0/me/mailFolders';
	do {
		var response = getGraphData(url);
		if (response) {
			var responseObject = JSON.parse(response);
			/** Array<{id: String, displayName: String, parentFolderId: String, childFolderCount: Number, unreadItemCount: Number, totalItemCount: Number, sizeInBytes: Number, isHidden: Boolean}> */
			var folderList = responseObject.value
			for (var indFolder = 0; indFolder < folderList.length; indFolder++) {
				folderInfo += folderList[indFolder].displayName + ' (' + folderList[indFolder].totalItemCount.toString() + ' entries, ' + folderList[indFolder].childFolderCount.toString() + ' subfolders)\n'
			}
			if (responseObject.hasOwnProperty('@odata.nextLink') && responseObject['@odata.nextLink']) {
				application.output('list goes on: ' + responseObject['@odata.nextLink']);
				url = responseObject['@odata.nextLink'];
			} else {
				break;
			}
		} else {
			break;
		}
	} while (true);
	application.output(folderInfo);
}

/**
 * @param {String} url
 * @return {String}
 * @properties={typeid:24,uuid:"69C9FDC8-7879-43B5-B467-73D5CB5BBD4C"}
 */
function getGraphData(url) {
	if (!url || !url.toLowerCase().startsWith('https://')) {
		return null;
	}
	var httpClient = plugins.http.createNewHttpClient();
	var request = httpClient.createGetRequest(url);
	request.addHeader('Content-Type', 'application/json');
	request.addHeader('Authorization', accessToken)
	var response = request.executeRequest();
	var statusCode = response.getStatusCode();
	if (statusCode >= 200 && statusCode <= 299) {
		application.output('\n************************\n'+response.getResponseBody()+'\n************************\n')
		return response.getResponseBody()
	} else {
		application.output('error fetching data. Statuscode: ' + response.getStatusCode() + '\n' + response.getResponseBody(),LOGGINGLEVEL.ERROR);
	}
	return null;
}