<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_CLASS . 'Arena.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'FightMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new FightMan();

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('User', $_SESSION['User']);

		// Affiche de la page avec résultat de l'enregistrement
		$smarty->display('header.tpl');

		if(isset($_GET['arena-id'])){
			// Recuperation de l Arena
			$Arena = $Manager->getArenaById($_DB, $_GET['arena-id']);

			// Recuperation de mes personnages potentiellement participants
			$MyCharacterArray = $Manager->getMyCharactersAvailable($_DB, $_SESSION['User']->id, $_GET['arena-id']);

			// Assignations Smarty
			$smarty->assign('Arena', $Arena);
			$smarty->assign('MyCharacterArray', $MyCharacterArray);
		}

		// Actions
		switch ($_GET['action']) {
			case 'add-challenger':
				$Manager->addChallenger($_DB, $_GET['arena-id'], $_POST['character-id'], 1);

				break;

			default:
				break;
		}




// Recuperation des challengers de cette arena




		// Affiche de la page avec résultat de l'enregistrement
		$smarty->display('fight.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else{
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
