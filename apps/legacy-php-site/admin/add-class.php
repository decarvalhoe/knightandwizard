<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddClassMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddClassMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(empty($_POST['filledField'])){		// Affichage du formaulaire de saisie
		// Recuperation de l Array des orientations
		$orientationsArray = $Manager->getAllOrientations($_DB);

		// Assignations Smarty
		$smarty->assign('orientationsArray', $orientationsArray);

		// Affichage
		$smarty->display('add-class.tpl');
	}else{
										// Ajout de la nouvelle competence
		// Insertion de la nouvelle competence dans la DB
		$Manager->insertClass($_DB, $_POST['name'], $_POST['orientation-id']);

		// Affichage
		$smarty->display('add-class-done.tpl');
	}


	// Affichage
	$smarty->display('footer.tpl');

	exit();
