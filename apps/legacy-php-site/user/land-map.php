<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'LandMapMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new LandMapMan();

		// Recuperation du pays courrant
		$Land = $Manager->getPlaceById($_DB, $_GET['id']);

		// Recuperation de toutes les villes et village
		$CitiesAndTownsArray = $Manager->getCitiesAndTownsByLandId($_DB, $_GET['id']);

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('imgFlagPath', '../' . P_DIR_IMG_FLAG);
		$smarty->assign('Land', $Land);
		$smarty->assign('CitiesAndTownsArray', $CitiesAndTownsArray);

		// Affichage Smarty
		$smarty->display('header.tpl');
		$smarty->display('land-map.tpl');

		switch ($Land->id) {
			case 9:									// Alteria
				// Affichage Smarty
				$smarty->display('alteria.tpl');
				break;

			case 8:									// Cortega
				// Affichage Smarty
				$smarty->display('cortega.tpl');
				break;

			default:
				break;
		}

		// Affichage Smarty
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
