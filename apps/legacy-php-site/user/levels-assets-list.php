<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'LevelsAssetsListMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new LevelsAssetsListMan();

	// Recuperation de la liste complete des competences
	$levelsAssetsArray = $Manager->getAllLevelsAssets($_DB);

	// Recuperation du niveau max possedant un atout
	$levelMax = $Manager->getLevelMax($levelsAssetsArray);

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('levelsAssetsArray', $levelsAssetsArray);
	$smarty->assign('levelMax', $levelMax);

	// Affichage
	$smarty->display('header.tpl');
	$smarty->display('levels-assets-list.tpl');
	$smarty->display('footer.tpl');

	exit();
