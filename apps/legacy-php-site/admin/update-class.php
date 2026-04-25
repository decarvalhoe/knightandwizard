<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateClassMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateClassMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	// Si le formulaire a ete rempli...
	if(isset($_POST['update']) && $_POST['update'] == 'done'){
		// Update de la classe
		$Manager->updateClass($_DB, $_GET['id'], $_POST['name'], $_POST['orientation-id']);

		$smarty->display('class-updated.tpl');
	}

	// Recuperation de la classe a modifier
	$classArray = $Manager->getClassById($_DB, $_GET['id']);

	// Recuperation de l Array des orientations
	$orientationsArray = $Manager->getAllOrientations($_DB);

	// Assignations Smarty
	$smarty->assign('classArray', $classArray);
	$smarty->assign('orientationsArray', $orientationsArray);

	// Affichage
	$smarty->display('update-class.tpl');
	$smarty->display('footer.tpl');

	exit();
