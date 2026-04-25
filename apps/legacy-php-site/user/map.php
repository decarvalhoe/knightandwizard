<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'MapMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new MapMan();

		// Recuperation des differente places de forum
		$forumPlacesArray = $Manager->getAllForumPlaces($_DB);

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('forumPlacesArray', $forumPlacesArray);
		$smarty->assign('imgPlacePath', '../' . P_DIR_IMG_PLACE);

		// Affiches Smarty
		$smarty->display('header.tpl');
		$smarty->display('map.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
