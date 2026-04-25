<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'AddSkillMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new AddSkillMan();

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);

	// Affichage
	$smarty->display('header.tpl');

	if(empty($_POST['filledField'])){		// Affichage du formaulaire de saisie
		// Recuperation de l Array des familles de competences
		$skillsFamiliesArray = $Manager->getAllSkillsFamilies($_DB);

		// Recuperation de l Array des competences
		$skillsArray = $Manager->getAllSkills($_DB);

		// Assignations Smarty
		$smarty->assign('skillsFamiliesArray', $skillsFamiliesArray);
		$smarty->assign('skillsArray', $skillsArray);

		// Affichage
		$smarty->display('add-skill.tpl');
	}else{									// Ajout de la nouvelle competence
		// Insertion de la nouvelle competence dans la DB
		$Manager->insertSkill($_DB, $_POST['name'], $_POST['skillFamilyId'], $_POST['childOfId']);

		$smarty->display('add-skill-done.tpl');
	}

	// Affichage
	$smarty->display('footer.tpl');

	exit();
