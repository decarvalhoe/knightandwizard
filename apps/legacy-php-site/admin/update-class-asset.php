<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateClassAssetMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateClassAssetMan();

	// Recuperation de la classe
	$classArray = $Manager->getClassById($_DB, $_GET['id']);

	// Recuperation de l orientation de la class
	$orientationArray = $Manager->getOrientationById($_DB, $classArray['orientationId']);

	// Recuperation des atouts de classe
	$classesAssetsArray = $Manager->getAllClassesAssets($_DB);

	// Affichage
	$smarty->display('header.tpl');

	if(isset($_POST['filledField'])){
		// Update de l atout de la classe
		$Manager->updateClassAsset($_DB, $_GET['id'], $_POST['asset-id']);

		$smarty->display('class-asset-updated.tpl');
	}

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('classArray', $classArray);
	$smarty->assign('orientationArray', $orientationArray);
	$smarty->assign('assetsArray', $classesAssetsArray);

	// Affichage
	$smarty->display('update-class-asset.tpl');
	$smarty->display('footer.tpl');

	exit();
