<?php
	// Requires
	require_once('./config/define.php');
	require_once('./' . P_DIR_SMARTY . 'Smarty.class.php');

    // Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = './' . P_DIR_TPL . 'public/';
	$smarty->compile_dir = './' . P_DIR_TPLC . 'public/';

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affiche de la page avec résultat de l'enregistrement
	$smarty->display('header.tpl');
	$smarty->display('index.tpl');
	$smarty->display('footer.tpl');

    exit();
