<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'Npc.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . '_DiceManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'FightAssistantMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance des managers
		$_DB = new _DBManager();
		$_Dice = new _DiceManager();
		$Manager = new FightAssistantMan();

		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Definition du DT courant
		if(isset($_POST['TD'])){
			if(isset($_POST['nextTD'])){
				// Recuperation du prochain DT
				$_POST['TD'] = $Manager->getNextTD($_POST['TD'], $_POST['nextTD']);

				foreach ($_SESSION['NpcArray'] as $Npc) {
					$Npc->roll = FALSE;
				}
			}else{
				$_POST['nextTD'] = '';
			}
		}else{
			$_POST['TD'] = 0;
			$_POST['nextTD'] = '';
		}

		// Recuperation de la liste de PNJ commun
		$NpcAvailableArray = $Manager->getAllNpc($_DB);

		// Gestion de l array de PNJ
		if(isset($_SESSION['NpcArray'])){
			// Si les PNJ agissent
			if(isset($_POST['action'])){
				switch ($_POST['action']) {
					case 'addNpc':			// Generation et ajout de PNJ commun a l Array des PNJ
						if($_POST['nbrOfNewNpc'] != 0){
							$nbrOfCurrentNpc = count($_SESSION['NpcArray']);

							$NpcToAddArray = $Manager->addNpc($_DB, $_POST['nbrOfNewNpc'], $_POST['NpcId'], $NpcAvailableArray, $nbrOfCurrentNpc);

							// Ajout des PNJ a l array des PNJ
							foreach ($NpcToAddArray as $Npc) {
								array_push($_SESSION['NpcArray'], $Npc);
							}

							$_SESSION['NpcArray'] = $Manager->updateNpcNextTurn($_SESSION['NpcArray'], $_POST['TD'], $_POST['nextTD']);
						}

						break;
					case 'stamina-roll':	// Modif des PNJ
						$_SESSION['NpcArray'] = $Manager->staminaRoll($_SESSION['NpcArray'], $_POST['npcName'], $_POST['TD'], $_POST['damage'], $_Dice);

						break;
					case 'update-character-element':	// Modif des PNJ
						$Manager->modifyNpc($_SESSION['NpcArray'], $_POST['TD'],$_POST['npcName'], $_POST['modified-character-element'], $_POST['modification']);

						break;
					case 'resetNpc':		// Reset de l array des PNJ
						$_SESSION['NpcArray'] = array();

						break;
					default:
						break;
				}
			}else{
				// lancement des D des PNJ
				$_SESSION['NpcArray'] = $Manager->rollNpcDices($_SESSION['NpcArray'], $_POST['TD'], $_Dice);

				// Mise a jour du prochain DT des PNJ
				$_SESSION['NpcArray'] = $Manager->updateNpcNextTurn($_SESSION['NpcArray'], $_POST['TD'], $_POST['nextTD']);
			}
		}else{
			$_SESSION['NpcArray'] = array();
		}

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('TD', $_POST['TD']);
		$smarty->assign('NpcAvailableArray', $NpcAvailableArray);
		$smarty->assign('NpcArray', $_SESSION['NpcArray']);

		// Affichage Smarty
		$smarty->display('header.tpl');
		$smarty->display('fight-assistant.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else{
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
