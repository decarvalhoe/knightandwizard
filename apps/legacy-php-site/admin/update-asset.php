<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateAssetMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateAssetMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	// Si le formulaire a ete utilise...
	if(isset($_POST['update']) && $_POST['update'] == 'done'){
		// Update de l atout
		$Manager->updateAsset($_DB, $_GET['id'], $_POST['name'], $_POST['effect'], $_POST['activation'], $_POST['unit-id'], $_POST['value'], $_POST['is-orientation-asset'], $_POST['is-class-asset']);

		$smarty->display('asset-updated.tpl');
	}

	// Recuperation du sort a modifier
	$assetArray = $Manager->getAssetById($_DB, $_GET['id']);

	// Assignations Smarty
	$smarty->assign('assetArray', $assetArray);

	// Affichage
	$smarty->display('update-asset.tpl');
	$smarty->display('footer.tpl');

	exit();
