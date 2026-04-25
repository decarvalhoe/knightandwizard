<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'CityMapMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new CityMapMan();

		// Recuperation de la ville courrante
		$City = $Manager->getPlaceById($_DB, $_GET['id']);

		// Recuperation de toutes les lieux de la villes
		$PlacesArray = $Manager->getPlacesByMotherId($_DB, $_GET['id']);

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('imgPlacePath', '../' . P_DIR_IMG_PLACE);
		$smarty->assign('City', $City);
		$smarty->assign('PlacesArray', $PlacesArray);

		// Affiches Smarty
		$smarty->display('header.tpl');
		$smarty->display('city-map.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
