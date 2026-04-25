<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddSpellMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddSpellMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(empty($_POST['filled-field']) ||
	empty($_POST['name']) ||
	empty($_POST['effect']) ||
	empty($_POST['type-id']) ||
	empty($_POST['value'])){				// Affichage du formaulaire de saisie
		// Affichage
		$smarty->display('add-spell.tpl');
	}else{									// Ajout de la nouvelle competence
		// Insertion du nouveau sort dans la DB
		$Manager->insertSpell($_DB, $_POST['name'], $_POST['effect'], $_POST['type-id'], $_POST['value']);

		$smarty->display('add-spell-done.tpl');
		$smarty->display('add-spell.tpl');
	}

	// Affichage
	$smarty->display('footer.tpl');

	exit();
