<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateLevelAssetMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateLevelAssetMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	// Si le formulaire a ete utilise...
	if(isset($_POST['update']) && $_POST['update'] == 'done'){
		// Update de l atout
		$Manager->updateAssetMergeLevel($_DB, $_GET['id'], $_POST['level'], $_POST['points'], $_POST['race-id'], $_POST['orientation-id'], $_POST['class-id'], $_POST['special-condition']);

		$smarty->display('asset-updated.tpl');
	}

	// Recuperations des data a traiter
	$assetMergeLevelArray = $Manager->getAssetMergeLevel($_DB, $_GET['id']);
	$assetArray = $Manager->getAsset($_DB, $assetMergeLevelArray['assetId']);
	$racesArray = $Manager->getAllRaces($_DB, 'name');
	$orientationsArray = $Manager->getAllOrientations($_DB);
	$classesArray = $Manager->getAllClasses($_DB);

	// Assignations Smarty
	$smarty->assign('assetMergeLevelArray', $assetMergeLevelArray);
	$smarty->assign('assetArray', $assetArray);
	$smarty->assign('racesArray', $racesArray);
	$smarty->assign('orientationsArray', $orientationsArray);
	$smarty->assign('classesArray', $classesArray);
	$smarty->assign('levelMax', 100);

	// Affichage
	$smarty->display('update-level-asset.tpl');
	$smarty->display('footer.tpl');

	exit();
