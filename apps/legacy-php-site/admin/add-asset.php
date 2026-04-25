<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddAssetMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddAssetMan();

	// Recuperation de la liste des orientations
	$orientationsArray = $Manager->getAllOrientations($_DB);

	// Recuperation de la liste des classes
	$classesArray = $Manager->getAllClasses($_DB);

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('orientationsArray', $orientationsArray);
	$smarty->assign('classesArray', $classesArray);

	// Affichage
	$smarty->display('header.tpl');

	// Si le les champs du formulaire ont ete remplis...
	if(!empty($_POST['filledField'])){		// Ajout du nouvel atout
		// Insertion de la nouvelle competence dans la DB
		$Manager->insertAsset($_DB, $_POST['name'], $_POST['effect'], $_POST['activation'], $_POST['unit-id'], $_POST['value'], $_POST['is-orientation-asset'], $_POST['orientation-id'], $_POST['is-class-asset'], $_POST['class-id']);

		// Affichage
		$smarty->display('add-asset-done.tpl');
	}

	// Affichage
	$smarty->display('add-asset.tpl');
	$smarty->display('footer.tpl');

	exit();
