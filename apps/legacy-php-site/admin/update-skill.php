<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateSkillMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateSkillMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(isset($_POST['update']) &&
	$_POST['update'] == 'done' &&
	isset($_POST['name'])){
		// Update de la competence
		$Manager->updateSkill($_DB, $_GET['id'], $_POST['name'], $_POST['skillFamilyId'], $_POST['childOfId']);

		$smarty->display('skill-updated.tpl');
	}

	// Recuperation de la competence a modifier
	$skillArray = $Manager->getSkillById($_DB, $_GET['id']);

	// Recuperation de l Array des familles de competences
	$skillsFamiliesArray = $Manager->getAllSkillsFamilies($_DB);

	// Recuperation de l Array des competences
	$skillsArray = $Manager->getAllSkills($_DB);

	// Assignations Smarty
	$smarty->assign('skillArray', $skillArray);
	$smarty->assign('skillsFamiliesArray', $skillsFamiliesArray);
	$smarty->assign('skillsArray', $skillsArray);

	// Affichage
	$smarty->display('update-skill.tpl');
	$smarty->display('footer.tpl');

	exit();
