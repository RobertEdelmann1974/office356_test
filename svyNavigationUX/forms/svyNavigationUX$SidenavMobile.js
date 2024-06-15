/**
 * @protected 
 * @properties={typeid:35,uuid:"24C319A0-0596-4FBA-AC1D-E0A3E08F2285",variableType:-4}
 */
var DEFAULT_SIDENAV_ACTIONS = {
	LOGOUT: "navbar-logout"
};

/**
 * @private
 * @properties={typeid:24,uuid:"D61BD41E-CE6B-430A-B51B-C771DD1405FE"}
 * @override
 */
function initNavigationForm() {
	// init the sidenav menu
	var menuItems = loadMenuItems();
	elements.sidenav.setRootMenuItems(menuItems);
}

/**
 * This method is called as part of then form's onLoad event.
 * Load the returned list of menu items into the sidenav menu of the template.
 * Override this method and return an Array of type servoyextra-sidenav.MenuItem (Array<servoyextra-sidenav.MenuItem>)
 * to initialize the sidenav menu with your own set of menu items.<br/>
 * Learn more on MenuItem and Sidenav https://github.com/Servoy/servoy-extra-components/wiki/Sidenav#menu-item
 * 
 * @return {Array<CustomType<servoyextra-sidenav.MenuItem>>}
 * @protected
 * 
 * @example <pre>
 * function loadMenuItems() {
 * 	var menuItems = [];
 *	
 *	\\ @type {CustomType&lt;servoyextra-sidenav.MenuItem&gt;} 
 *	var menuItem = new Object();
 *	menuItem.id = "yourFormName";
 *	menuItem.iconStyleClass = "fa fa-home";
 *	menuItem.text = "Home";
 *	menuItems.push(menuItem);
 *
 *	return menuItems;
 *}
 * </pre>
 * @properties={typeid:24,uuid:"685B7B8E-9CB9-4EF5-B363-713E9F88B801"}
 */
function loadMenuItems() {
	var menuItems = [];
	var menuItem;
	
	if (security.getUserName()) {
		// Logout
		menuItem = new Object();
		menuItem.id = "LOGOUT";
		menuItem.text = "LOGOUT"
		menuItem.iconStyleClass = "fas fa-sign-out-alt";
		menuItems.push(menuItem);
	}

    // return the menu items
	return menuItems;
}

/**
 * Returns the active formName which is the containedForm of the sidenav element
 * 
 * @return {String}
 * @public
 *
 * @properties={typeid:24,uuid:"6DEB91C0-1D7A-40FF-9E13-4BE9F73D9E96"}
 */
function getActiveFormName() {
	if (elements.content && elements.content.containedForm) {
		return elements.content.containedForm;
	} else {
		return null;
	}
}

/**
 * @private
 * @param {scopes.svyNavigation.NavigationEvent} event
 *
 * @properties={typeid:24,uuid:"2AFF8BE8-DA18-4E36-859C-8D2473C3959E"}
 * @override
 */
function onOpen(event) {

	/** @type {scopes.svyNavigation.NavigationItem} */
	var item = event.getNavigationItem();
	var formName = item.getFormName();
	
	// get the form instance
	var form = forms[formName];
	if (!form) {
		throw new scopes.svyExceptions.IllegalStateException('Cannot navigate to form because cannot find form instance ' + formName);
	}

	// show form
	elements.content.containedForm = formName;

	//  update the selected menu item for the main menu
	var menuId = getMenuItemID(item.getFormName());
	if (menuId) {
		elements.sidenav.setSelectedMenuItem(menuId, false, false);
	} else {
		elements.sidenav.setSelectedMenuItem(null, false, false);
	}
}

/**
 * Called whenever a menu item from the sidenav is selected with the JSEvent and the menuItemId clicked on.
 * 
 * @param {String} menuItemId
 * @param {JSEvent} event
 *
 * @return {boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"838EF5AF-505D-4B1A-8C1A-7948BCC14423"}
 */
function onMenuItemSelectedHandler(menuItemId, event) {
	var innerMenuItemSelected = onMenuItemSelected(menuItemId, event);
	
	if (innerMenuItemSelected === true) {
		elements.sidenav.open = false;
	}
	
	if(menuItemId === DEFAULT_SIDENAV_ACTIONS.LOGOUT){
		onLogout();
		return false;
	}

	if (innerMenuItemSelected === false) {
		return false;
	}

	// form to navigate too
	var formName = getMenuItemFormName(menuItemId)
	var form = forms[formName];

	// open the selected navigation item
	if (menuItemId && formName && form) {
		var menuItem = elements.sidenav.getMenuItem(menuItemId);

		var item = new scopes.svyNavigation.NavigationItem(formName, menuItem.text);
		return scopes.svyNavigation.open(item);
	}

	return true;
}

/**
 * Called as part of the onMenuItemSelectedHandler event
 * Called whenever a menu item from the sidenav is selected with the JSEvent and the menuItemId clicked on.
 * This method can be overriden to prevent the selection (.e.g check if user has permissions) or for handling specific menu options which will trigger a function (.e.g logout) instead of switching the visible form
 * Return false to stop the navigation and prevent the selection.
 * 
 * @protected
 * @param {String} menuItemId
 * @param {JSEvent} event
 *
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"322DB232-DB61-4640-AC08-BD3648B8EA2B"}
 */
function onMenuItemSelected(menuItemId, event) {
	return true;
}

/**
 * Override the method for a custom logout
 * @protected  
 * @properties={typeid:24,uuid:"B63854A5-185C-4416-9ACE-98BE7A752637"}
 */
function onLogout() {
	// test for svySecurity logout
	if (scopes['svySecurity']) {
		scopes['svySecurity'].logout();
	} else {
		security.logout();
	}
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"3934E573-1B4B-4684-89A3-13099C576904"}
 */
function onShow(firstShow, event) {
	if (firstShow) {
		// set first selection
		if (elements.content.containedForm) {
			var selectedItemID = getMenuItemID(elements.content.containedForm); 
			var selectedItem = elements.sidenav.getMenuItem(selectedItemID);
			if (selectedItem) {
				elements.sidenav.setSelectedMenuItem(selectedItemID, false, false);
			}
		}
	}
}

/**
 * @param {JSEvent} event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"302642E1-1526-42DC-8995-F3D5BDE0F66D"}
 */
function onActionToggleMenu(event) {
	elements.sidenav.open = !elements.sidenav.open
}
