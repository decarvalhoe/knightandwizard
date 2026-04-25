<?php
	// Requires
	require_once('./config/define.php');
	require_once('./' . P_DIR_MAN . '_DBManager.php');
	require_once('./' . P_DIR_MAN . 'public/' . 'LoginMan.php');
	require_once('./' . P_DIR_CLASS . 'User.php');
	require_once('./' . P_DIR_SMARTY . 'Smarty.class.php');

	// Destruction des eventuelles sessions
	if(isset($_SESSION['User'])){
		session_destroy();
	}

	// Activation de la session
	session_start();

    // Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = './' . P_DIR_TPL . 'public/';
	$smarty->compile_dir = './' . P_DIR_TPLC . 'public/';

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affiche de la page
	$smarty->display('header.tpl');

	if($_POST['filledField'] == TRUE){
		// Instance des managers
		$_DB = new _DBManager();
		$Manager = new LoginMan();

		// Identification et authentification de l utilisateur
		$User = $Manager->checkValidUser($_DB, $_POST['email'], $_POST['password']);

		if($User != NULL){
			// Mise en session de l utilisateur
			$_SESSION['User'] = $User;

			echo "<script>location.href='./user/index.php';</script>";

			exit();
		}else{
			// Assignations Smarty
			$smarty->assign('errorMsg', 'Login incorrect');

			// Affiche de la page
			$smarty->display('errorMsg.tpl');
		}
	}

	// Affiche de la page
	$smarty->display('login.tpl');
	$smarty->display('footer.tpl');

    exit();
