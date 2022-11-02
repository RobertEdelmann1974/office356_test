
/**
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"818233E8-8280-4278-ACB2-C5BD5F9F2A34"}
 */
function onLoad(event) {
	initTree();
}

/**
 * @properties={typeid:24,uuid:"784C2B36-55F0-417B-B832-59480735F445"}
 */
function initTree() {
	var ds = 'mem:folder_list';
	elements.tree.setTextDataprovider(ds, 'folder_name');
	elements.tree.setNRelationName(ds, 'folder_children');
	elements.tree.setChildSortDataprovider(ds, 'folder_name');
	elements.tree.setHasCheckBoxDataprovider(ds, 'has_checkbox');
	elements.tree.setCheckBoxValueDataprovider(ds, 'flag');
	elements.tree.setMethodToCallOnDoubleClick(ds,scopes.graph.infoFolder,folder_name)
}
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"37EEE365-8971-4891-9E52-BBD355655D86"}
 */
function onShow(firstShow, event) {
	refreshTree();
}


/**
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"B8C532A6-5D3F-405B-A700-DE39702A7A66"}
 */
function refreshTree() {
	elements.tree.removeAllRoots();
	if (foundset.find()) {
		foundset['parent_folder_id'] = '^=';
		foundset.sort('folder_name asc', true);
		foundset.search();
	}

	/**
	 * @param {JSFoundSet} fs
	 */
	function getLastRecord(fs) {
		var iteration = 200;
		while (true) {
			fs.getRecord(iteration);
			if (fs.getSize() < iteration) {
				break;
			}
			iteration += 200;
		}
	}
	
	/**
	 * @param {JSFoundSet} fs
	 */
	function iterateFs(fs) {
		for (var i = 1; i <= fs.getSize(); i++) {
			var record = fs.getRecord(i);
			if (utils.hasRecords(record['parent_folder_id'])) {
				getLastRecord(record['parent_folder_id']);
				iterateFs(record['parent_folder_id']);
			}
		}
	}
	
//	iterateFs(foundset);
	
	
	elements.tree.addRoots(foundset);
//	elements.tree.setNodeLevelVisible(1, false);
//	elements.tree.setNodeLevelVisible(1, true);
	elements.tree.refresh();
}