<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateEmailMan.php');
	require_once('../' . P_DIR_CLASS . 'User.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateEmailMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(empty($_POST['filled-field']) ||
	empty($_POST['subject']) ||
	empty($_POST['message'])){				// Affichage du formaulaire de saisie
		// Affichage
		$smarty->display('update-email.tpl');
	}else{
		// Email aux joueurs
		$Manager->sendGameUpdateEmail($_DB, $_POST['subject'], $_POST['message']);

		$smarty->display('email-sended.tpl');
		$smarty->display('update-email.tpl');
	}

	// Affichage
	$smarty->display('footer.tpl');

	exit();
