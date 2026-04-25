<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'SuperUpdateMan.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new SuperUpdateMan();

	// Ajout des atouts de races pour tous les personnages existants
	//$Manager->addRacesAssetsToCharacters($_DB);

	// Ajout des atouts d orientation pour tous les personnages existants
	//$Manager->addOrientationsAssetsToCharacters($_DB);

	// Ajout des atouts de classe pour tout les personnages existants
	//$Manager->addClassesAssetsToCharacters($_DB);

	// Ajout des facteurs de vitesse, de volonte, de la vitalite et de la vitalite MAX pour tout les personnage existants
	//$Manager->addFactorsAndVitality($_DB);

	echo('Done');

	exit();
