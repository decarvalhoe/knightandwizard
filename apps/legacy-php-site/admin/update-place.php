<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdatePlaceMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdatePlaceMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	// Si le formulaire a ete utilise...
	if(isset($_POST['update']) && $_POST['update'] == 'done'){
		// Update du lieu
		$Manager->updatePlace($_DB,
								$_GET['id'],
								$_POST['name'],
								$_POST['is-child-of'],
								$_POST['status-id'],
								$_POST['is-capital']);

		$smarty->display('place-updated.tpl');
	}

	// Recuperation du lieu a modifier
	$Place = $Manager->getPlaceById($_DB, $_GET['id']);

	// Recuperation ou definition du lieu mere
	if($Place->isChildOf != 0){
		$motherPlaceArray = $Manager->getPlaceById($_DB, $Place->isChildOf);
	}else{
		$motherPlaceArray = array('id' => 0, 'name' => 0, 'isChildOf' => 0, 'statusId' => 0, 'isCapital' => 0);
	}

	// Recuperation de tous les lieux existants
	$PlacesArray = $Manager->getAllPlaces($_DB);

	// Recuperation de tous les status de lieux
	$placesStatusArray = $Manager->getAllPlacesStatus($_DB);

	// Assignations Smarty
	$smarty->assign('Place', $Place);
	$smarty->assign('motherPlaceArray', $motherPlaceArray);
	$smarty->assign('PlacesArray', $PlacesArray);
	$smarty->assign('placesStatusArray', $placesStatusArray);

	// Affichage
	$smarty->display('update-place.tpl');
	$smarty->display('footer.tpl');

	exit();
