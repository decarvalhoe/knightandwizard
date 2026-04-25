<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddWeaponMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddWeaponMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');


	if(empty($_POST['filled-field']) ||
	empty($_POST['name']) ||
	empty($_POST['dammage']) ||
	empty($_POST['dammage-type']) ||
	empty($_POST['difficulty']) ||
	empty($_POST['weight'])){				// Affichage du formaulaire de saisie
		// Affichage
		$smarty->display('add-weapon.tpl');
	}else{											// Ajout de la nouvelle competence
		// Insertion du nouveau sort dans la DB
		$Manager->insertWeapon($_DB, $_POST['name'], $_POST['dammage'], $_POST['use-strength'], $_POST['dammage-type'], $_POST['difficulty'], $_POST['weight'], $_POST['special']);

		$smarty->display('add-weapon-done.tpl');
		$smarty->display('add-weapon.tpl');
	}

	// Affichage
	$smarty->display('footer.tpl');

	exit();
