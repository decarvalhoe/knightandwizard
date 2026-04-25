<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateRaceMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateRaceMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	// Si le formulaire a ete utilise...
	if(isset($_POST['update']) && $_POST['update'] == 'done'){
		// Recuperation de l ID max des atouts
		$assetsIdMax = $Manager->getAssetsMaxId($_DB);

		// Passage des ID des atouts dans une array
		$assetsArray = array();
		$assetId = 1;

		do {
			if(!empty($_POST[$assetId])){
				//array_push($assetsIdArray, $assetId);

				$assetArray = array('id' => $assetId, 'points' => $_POST[$assetId . '-points']);

				array_push($assetsArray, $assetArray);
			}
			$assetId++;
		} while ($assetId <= $assetsIdMax);

		// Update de la race
		$Manager->updateRace($_DB,
								$_GET['id'],
								$_POST['name'],
								$_POST['category'],
								$_POST['vitality'],
								$_POST['speedFactor'],
								$_POST['willFactor'],
								$_POST['strengthMax'],
								$_POST['dexterityMax'],
								$_POST['staminaMax'],
								$_POST['charismaMax'],
								$_POST['aestheticismMax'],
								$_POST['empathyMax'],
								$_POST['intelligenceMax'],
								$_POST['perceptionMax'],
								$_POST['reflexesMax'],
								$assetsArray);

		$smarty->display('race-updated.tpl');
	}

	// Recuperation de la race a modifier
	$raceArray = $Manager->getRaceById($_DB, $_GET['id']);

	// Recuperation des atouts accessible aux races
	$assetsArray = $Manager->getRacesAssets($_DB);

	// Assignations Smarty
	$smarty->assign('raceArray', $raceArray);
	$smarty->assign('assetsArray', $assetsArray);

	// Affichage
	$smarty->display('update-race.tpl');
	$smarty->display('footer.tpl');

	exit();
