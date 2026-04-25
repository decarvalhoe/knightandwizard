<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddPotionMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddPotionMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(empty($_POST['filled-field']) ||
	empty($_POST['name']) ||
	empty($_POST['effect']) ||
	empty($_POST['ingredients']) ||
	empty($_POST['value'])){				// Affichage du formaulaire de saisie
		// Affichage
		$smarty->display('add-potion.tpl');
	}else{									// Ajout de la nouvelle competence
		// Insertion de la nouvelle potion dans la DB
		$Manager->insertPotion($_DB, $_POST['name'], $_POST['effect'], $_POST['ingredients'], $_POST['recipe'], $_POST['value']);

		$smarty->display('add-potion-done.tpl');
		$smarty->display('add-potion.tpl');
	}

	// Affichage
	$smarty->display('footer.tpl');

	exit();
