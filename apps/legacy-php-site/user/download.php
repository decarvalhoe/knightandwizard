<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('DNWLD_PATH', DIR_SITE . P_DIR_DWNLD);

		// Affiche de la page avec résultat de l'enregistrement
		$smarty->display('header.tpl');
		$smarty->display('download.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
