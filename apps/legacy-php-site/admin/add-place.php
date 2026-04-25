<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddPlaceMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddPlaceMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');


	if(empty($_POST['filledField'])){		// Affichage du formaulaire de saisie
		// Recuperation des data a traiter
		$placesStatusArray = $Manager->getAllPlacesStatus($_DB);
		$PlacesArray = $Manager->getAllPlaces($_DB);

		// Assignations Smarty
		$smarty->assign('PlacesArray', $PlacesArray);
		$smarty->assign('placesStatusArray', $placesStatusArray);

		// Affichage
		$smarty->display('add-place.tpl');
	}else{											// Ajout du nouveau lieu
		// Insertion de la nouvelle competence dans la DB
		$Manager->insertPlace($_DB, $_POST['name'], $_POST['place-id'], $_POST['status-id'], $_POST['is-capital']);

		$smarty->display('add-place-done.tpl');
	}

	// Affichage
	$smarty->display('footer.tpl');

	exit();
