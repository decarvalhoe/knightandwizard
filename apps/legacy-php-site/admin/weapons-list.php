<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'Weapon.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'WeaponsListMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new WeaponsListMan();

	// Definition de l order de tri par defaut
	if(empty($_GET['order'])){
		$_GET['order'] = 'name';
	}

	$weaponsListArray = $Manager->getAllWeapons($_DB, $_GET['order']);

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('weaponsListArray', $weaponsListArray);

	// Affichage de la page
	$smarty->display('header.tpl');
	$smarty->display('weapons-list.tpl');
	$smarty->display('footer.tpl');

	exit();
