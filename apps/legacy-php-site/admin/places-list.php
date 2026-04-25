<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'PlacesListMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new PlacesListMan();

	// Recuperation de la liste complete des competences
	$PlacesArray = $Manager->getAllplaces($_DB);

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('PlacesArray', $PlacesArray);

	// Affichage
	$smarty->display('header.tpl');
	$smarty->display('places-list.tpl');
	$smarty->display('footer.tpl');

	exit();
