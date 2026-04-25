<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'RacesListMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new RacesListMan();

	// Definition de l ordre de tri par defaut
	if(empty($_GET['order'])){
		$_GET['order'] = 'name';
	}

	// Recuperation de la liste complete des races
	$racesArray = $Manager->getAllRaces($_DB, $_GET['order']);

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('racesArray', $racesArray);
	$smarty->assign('order', $_GET['order']);

	// Affichage
	$smarty->display('header.tpl');
	$smarty->display('races-list.tpl');
	$smarty->display('footer.tpl');

	exit();
