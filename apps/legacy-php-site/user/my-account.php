<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'MyAccountMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('User', $_SESSION['User']);

		// Affiches Smarty
		$smarty->display('header.tpl');

		if($_POST['action'] == 'update-user'){
			// Instance des Managers
			$_DB = new _DBManager();
			$Manager = new MyAccountMan();

			// Update de l abonnement a la newsletter des mise a jour du jeu
			if($_SESSION['User']->gameUpdateAlert != $_POST['game-update-alert']){
				$Manager->updateUserGameUpdateAlert($_DB, $_SESSION['User'], $_POST['game-update-alert']);
			}

			// Update de l abonnement a l alerte du forum
			if($_SESSION['User']->newCommentAlert != $_POST['new-comment-alert']){
				$Manager->updateUserNewCommentAlert($_DB, $_SESSION['User'], $_POST['new-comment-alert']);
			}

			// Mise a jour de la session du User
			$_SESSION['User'] = $Manager->getUserById($_DB, $_SESSION['User']->id);

			// Assignations Smarty
			$smarty->assign('User', $_SESSION['User']);

			// Affiches Smarty
			$smarty->display('my-account-updated.tpl');
		}

		// Affiches Smarty
		$smarty->display('my-account.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
