<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateSpellMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateSpellMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(isset($_POST['update']) &&
	$_POST['update'] == 'done' &&
	isset($_POST['name']) &&
	isset($_POST['effect']) &&
	isset($_POST['type-id']) &&
	isset($_POST['value'])){
		// Update du sort
		$Manager->updateSpell($_DB, $_GET['id'], $_POST['name'], $_POST['effect'], $_POST['type-id'], $_POST['value']);

		$smarty->display('spell-updated.tpl');
	}

	// Recuperation du sort a modifier
	$spellArray = $Manager->getSpellById($_DB, $_GET['id']);

	// Assignations Smarty
	$smarty->assign('spellArray', $spellArray);

	// Affichage
	$smarty->display('update-spell.tpl');
	$smarty->display('footer.tpl');

	exit();
