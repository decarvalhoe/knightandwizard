<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddLevelAssetMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddLevelAssetMan();

	// Recuperation de la liste des atouts
	$assetsArray = $Manager->getAllAssets($_DB);

	// Recuperation de la liste des races
	$racesArray = $Manager->getAllRaces($_DB);

	// Recuperation de la liste des orientations
	$orientationsArray = $Manager->getAllOrientations($_DB);

	// Recuperation de la liste des classes
	$classesArray = $Manager->getAllClasses($_DB);

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('level', $_GET['level']);
	$smarty->assign('assetsArray', $assetsArray);
	$smarty->assign('racesArray', $racesArray);
	$smarty->assign('orientationsArray', $orientationsArray);
	$smarty->assign('classesArray', $classesArray);

	// Affichage
	$smarty->display('header.tpl');

	// Si le les champs du formulaire ont ete remplis...
	if(!empty($_POST['filledField'])){		// Ajout du nouvel atout de niveau
		// Insertion du nouvel atout de niveau dans la DB
		$Manager->insertLevelAsset($_DB, $_POST['asset-id'], $_GET['level'], $_POST['points'], $_POST['orientation-id'], $_POST['class-id'], $_POST['race-id'], $_POST['special-condition']);

		// Affichage
		$smarty->display('add-asset-done.tpl');
	}

	// Affichage
	$smarty->display('add-level-asset.tpl');
	$smarty->display('footer.tpl');

	exit();
