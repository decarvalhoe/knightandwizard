<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'SpellsListMan.php');
	require_once('../' . P_DIR_CLASS . 'User.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new SpellsListMan();

		// Definition de l ordre de tri par defaut
		if(empty($_GET['order'])){
			$_GET['order'] = 'type_id';
		}

		$spellsListArray = $Manager->getAllSpells($_DB, $_GET['order']);

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('spellsListArray', $spellsListArray);

		// Affichage de la page
		$smarty->display('header.tpl');
		$smarty->display('spells-list.tpl');
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
