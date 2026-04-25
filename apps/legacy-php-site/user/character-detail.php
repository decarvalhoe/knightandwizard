<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_PrintManager.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'CharacterDetailMan.php');
	require_once('../'. P_DIR_FPDF . 'fpdf.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new CharacterDetailMan();

		// Recuperation des data a traiter
		$Character = $Manager->getCharacterById($_DB, $_GET['id']);

		// Definition du niveau et variables liees
		$Character->getMyLevel();

		// Verification de l appartenance du personnage
		$flag_CharacterIsMine = $Manager->checkCharacterOwner($_DB, $Character->id, $_SESSION['User']->id);

		// Actions de la page
		if($flag_CharacterIsMine == TRUE && isset($_POST['action'])){
			switch ($_POST['action']) {
				case 'print-character':
					$Manager->printCharacter($Character);

					break;
				default:
					break;
			}
		}else{
			// Recuperation du User possesseur du personnage
			$CharacterOwner = $Manager->getUserById($_DB, $Character->userId);

			// Assignations Smarty
			$smarty->assign('CharacterOwner', $CharacterOwner);
		}

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('Character', $Character);
		$smarty->assign('numberOfSkillsOnLeftColumn', round(count($Character->skills) / 2, 0, PHP_ROUND_HALF_UP));
		$smarty->assign('flag_CharacterIsMine', $flag_CharacterIsMine);

		// Affiches Smarty
		$smarty->display('header.tpl');
		$smarty->display('character-detail.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
