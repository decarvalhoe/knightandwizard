<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'admin/' . 'UpdateClassPrimarySkillsMan.php');

	// Instance de Smarty
	$smarty = new Smarty();
	$smarty->template_dir = '../' . P_DIR_TPL . 'admin/';
	$smarty->compile_dir = '../' . P_DIR_TPLC . 'admin/';

	// Instance des Managers
	$_DB = new _DBManager();
	$Manager = new UpdateClassPrimarySkillsMan();

	// Recuperation de la classe
	$classArray = $Manager->getClassById($_DB, $_GET['id']);

	// Récupération de toutes les compétences primaires
	$primarySkills = $Manager->getPrimarySkills($_DB);

	// Affichage
	$smarty->display('header.tpl');

	// Si le formulaire a ete rempli
	if(isset($_POST['filledField'])){
		// Recuperation de l ID max des competences
		$skillsIdMax = $Manager->getSkillsMaxId($_DB);

		// Passage des ID des skills dans une array
		$skillsArray = array();
		$skillId = 1;

		do {
			if(!empty($_POST[$skillId])){
				array_push($skillsArray, $skillId);
			}
			$skillId++;
		} while ($skillId <= $skillsIdMax);

		// Update des competences primaires de la classe
		$Manager->updateClassPrimarySkills($_DB, $_GET['id'], $skillsArray);
	}

	// Assignations Smarty
	$smarty->assign('DIR_SITE', DIR_SITE);
	$smarty->assign('classArray', $classArray);
	$smarty->assign('primarySkills', $primarySkills);

	// Affichage
	$smarty->display('update-class-primary-skills.tpl');
	$smarty->display('footer.tpl');

	exit();
