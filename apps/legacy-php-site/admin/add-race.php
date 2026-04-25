<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddRaceMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddRaceMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	// Si le les champs du formulaire ont ete remplis...
	if(!empty($_POST['filledField'])){		// Ajout de la nouvelle race
		// Recuperation et/ou attribution des points de competence
		$assetsIdMax = $Manager->getAssetsMaxId($_DB);

		$assetsArray = array();
		$assetId = 1;

		do {
			if(!empty($_POST[$assetId])){
				$assetArray = array('id' => $assetId, 'points' => $_POST[$assetId . '-points']);

				array_push($assetsArray, $assetArray);
			}
			$assetId++;
		} while ($assetId <= $assetsIdMax);

		// Insertion de la nouvelle race dans la DB
		$Manager->insertRace($_DB, $_POST['name'], $_POST['category'], $_POST['vitality'],
								$_POST['speedFactor'], $_POST['willFactor'], $_POST['strengthMax'],
								$_POST['dexterityMax'], $_POST['staminaMax'], $_POST['charismaMax'],
								$_POST['aestheticismMax'], $_POST['empathyMax'], $_POST['intelligenceMax'],
								$_POST['perceptionMax'], $_POST['reflexesMax'], $assetsArray);

		// Affichage
		$smarty->display('add-race-done.tpl');
	}

	// Recuperation des atouts accessible aux races
	$assetsArray = $Manager->getRacesAssets($_DB);

	// Assignations Smarty
	$smarty->assign('assetsArray', $assetsArray);

	// Affichage
	$smarty->display('add-race.tpl');
	$smarty->display('footer.tpl');

	exit();
