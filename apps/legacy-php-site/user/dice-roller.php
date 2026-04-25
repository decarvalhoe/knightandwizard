<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DiceManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'DiceRollerMan.php');
	require_once('../' . P_DIR_CLASS . 'User.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);

		// Affichage de la page
		$smarty->display('header.tpl');

		// Lancement des des
		if($_POST['dice-type'] == NULL){
			// Assignations Smarty
			$smarty->assign('difficultyD10', 7);
			$smarty->assign('difficultyD20', 12);
			$smarty->assign('numberOfD10', 1);
			$smarty->assign('numberOfD20', 1);

			// Affichage de la page
			$smarty->display('dice-roller.tpl');

		}else{
			$_Dice = new _DiceManager();
			$Manager = new DiceRollerMan();

			// Assignations Smarty
			$smarty->assign('diceType', $_POST['dice-type']);

			switch ($_POST['dice-type']) {
				case 'd10':
					// Lancement des des
					$dicesArray = $Manager->rollDices($_Dice, $_POST['dice-type'], $_POST['number-of-d10'], $_POST['difficulty']);

					// Assignations Smarty
					$smarty->assign('difficultyD10', $_POST['difficulty']);
					$smarty->assign('difficultyD20', 12);
					$smarty->assign('numberOfD10', $_POST['number-of-d10']);
					$smarty->assign('numberOfD20', 1);

					break;
				case 'd20':
					// Lancement des des
					$dicesArray = $Manager->rollDices($_Dice, $_POST['dice-type'], $_POST['number-of-d20'], $_POST['difficulty']);

					// Assignations Smarty
					$smarty->assign('difficultyD10', 7);
					$smarty->assign('difficultyD20', $_POST['difficulty']);
					$smarty->assign('numberOfD10', 1);
					$smarty->assign('numberOfD20', $_POST['number-of-d20']);

					break;
			}

			// Assignations Smarty
			$smarty->assign('dicesArray', $dicesArray);

			// Affichage de la page
			$smarty->display('dice-roller.tpl');
			$smarty->display('dices-result.tpl');
		}

		// Affichage de la page
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
