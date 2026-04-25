<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'UpdateCharacterMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new UpdateCharacterMan();

		// Recuperation du personnage
		if(!empty($_GET['id'])){
			$Character = $Manager->getCharacterById($_DB, $_GET['id']);
		}else{
			$Character = $Manager->getCharacterById($_DB, $_POST['character-id']);
		}

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('Character', $Character);
		$smarty->assign('flag_CharacterIsMine', 'TRUE');

		// Affichage Smarty
		$smarty->display('header.tpl');

		// Affichage des template de mise a jour du personnage
		if(!isset($_POST['update'])){
			switch ($_GET['update']){
				case 'asset':
					foreach ($Character->assets as $asset) {
						if($asset['id'] == $_GET['asset-id']){
							$assetArray = $asset;

							break;
						}
					}

					// Assignations Smarty
					$smarty->assign('assetArray', $assetArray);

					// Affichage Smarty
					$smarty->display('update-character-asset.tpl');

					break;
				case 'attribute':
					// Assignations Smarty
					$smarty->assign('attribute', $_GET['attribute']);

					// Affichage Smarty
					$smarty->display('update-character-attribute.tpl');

					break;
				case 'class':
					// Recuperation de la liste des orientations accessibles pour le personage
					$classesArray = $Manager->getAvailableClasses($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('classesArray', $classesArray);

					// Affichage Smarty
					$smarty->display('update-character-class.tpl');

					break;
				case 'energy-max':
					// Affichage Smarty
					$smarty->display('update-character-energy-max.tpl');

					break;
				case 'gender':
					// Recuperation de la liste des genre accessible pour un personage
					$gendersArray = $Manager->getAllGenders($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('gendersArray', $gendersArray);

					// Affichage Smarty
					$smarty->display('update-character-gender.tpl');

					break;
				case 'name':
					// Affichage Smarty
					$smarty->display('update-character-name.tpl');

					break;
				case 'new-asset':
					// Recuperation des atouts neutres accessible au personnage
					$availableNeutralAssetsArray = $Manager->getAvailableNeutralAssets($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('assetsArray', $availableNeutralAssetsArray);


					// Affichage Smarty
					$smarty->display('update-character-new-asset.tpl');

					break;
				case 'new-level-asset':
					// Recuperation des nouveaux atouts accessible au personnage
					$availableAssetsArray = $Manager->getAvailableAssets($_DB, $Character);

					// Definition du level max dans la liste d atouts courants
					$levelMax = $Manager->getLevelsAssetsMax($availableAssetsArray);

					// Assignations Smarty
					$smarty->assign('levelAssetsArray', $availableAssetsArray);
					$smarty->assign('levelMax', $levelMax);

					// Affichage Smarty
					$smarty->display('update-character-new-level-asset.tpl');

					break;
				case 'new-skill':
					$availableSkillsArray = $Manager->getAvailableSkills($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('skillsArray', $availableSkillsArray);

					// Affichage Smarty
					$smarty->display('update-character-new-skill.tpl');

					break;
				case 'new-spell':
					// Recuperation des nouveaux sorts accessible au personnage
					$availableSpellsArray = $Manager->getAvailableSpells($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('spellsArray', $availableSpellsArray);

					// Affichage Smarty
					$smarty->display('update-character-new-spell.tpl');

					break;
				case 'note':
					$Manager->updateCharacterNote($_DB, $_SESSION['User'], $Character->id, $_POST['note']);

					// Redirection sur la page de detail du persoonage
					echo "<script>location.href='./character-detail.php?id=" . $Character->id . "';</script>";
					exit();
				case 'orientation':
					// Recuperation de la liste des orientations accessibles pour le personage
					$orientationsArray = $Manager->getAvailableOrientations($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('orientationsArray', $orientationsArray);

					// Affichage Smarty
					$smarty->display('update-character-orientation.tpl');

					break;
				case 'profil-img':
					// Affichage Smarty
					$smarty->display('update-character-profil-img.tpl');

					break;
				case 'place':
					// Recuperation de la liste des places
					$PlacesArray = $Manager->getallPlaces($_DB);

					// Assignations Smarty
					$smarty->assign('PlacesArray', $PlacesArray);

					// Affichage Smarty
					$smarty->display('update-character-place.tpl');

					break;
				case 'race':
					// Recuperation de la liste des genre accessibles pour le personage
					$racesArray = $Manager->getAvailableRaces($_DB, $Character);

					// Assignations Smarty
					$smarty->assign('racesArray', $racesArray);

					// Affichage Smarty
					$smarty->display('update-character-race.tpl');

					break;
				case 'remove':
					// Suppression du personnage
					$Manager->deleteCharacter($_DB, $_SESSION['User'], $Character);

					// Renvois sur la page des personnages
					echo "<script>location.href='./characters.php';</script>";

					exit();

					break;
				case 'remove-asset':
					// Suppression de la competence du personnage
					$Manager->deleteCharacterAsset($_DB, $_SESSION['User'], $Character, $_GET['asset-id']);

					// Redirection sur la page de detail du persoonage
					echo "<script>location.href='./character-detail.php?id=" . $Character->id . "';</script>";

					exit();

					break;
				case 'remove-skill':
					// Suppression de la competence du personnage
					$Manager->deleteCharacterSkill($_DB, $_SESSION['User'], $Character, $_GET['skill-id']);

					// Redirection sur la page de detail du persoonage
					echo "<script>location.href='./character-detail.php?id=" . $Character->id . "';</script>";

					exit();

					break;
				case 'skill':					
					$skillArray = $Manager->getCharacterSkillById($_DB, $Character ,$_GET['skill-id'], $_SESSION['User']->id);
					
					// Assignations Smarty
					$smarty->assign('skillArray', $skillArray);

					// Affichage Smarty
					$smarty->display('update-character-skill.tpl');

					break;
				case 'speed-factor':
					// Affichage Smarty
					$smarty->display('update-character-speed-factor.tpl');

					break;
				case 'spell':
					// Recuperation des sorts du personnage
					$spellArray = $Manager->getCharacterSpellById($_DB, $Character ,$_GET['spell-id'], $_SESSION['User']->id);

					// Assignations Smarty
					$smarty->assign('spellArray', $spellArray);

					// Affichage Smarty
					$smarty->display('update-character-spell.tpl');

					break;
				case 'status':
					// Recuperation des status
					$statusArray = $Manager->getAllStatus($_DB);

					// Assignations Smarty
					$smarty->assign('statusArray', $statusArray);

					// Affichage Smarty
					$smarty->display('update-character-status.tpl');

					break;
				case 'vitality-max':
					// Affichage Smarty
					$smarty->display('update-character-vitality-max.tpl');

					break;
				case 'will-factor':
					// Affichage Smarty
					$smarty->display('update-character-will-factor.tpl');

					break;
			}
		}else{
			// Mise a jour du personnage dans la DB
			switch ($_POST['update']){
				case 'asset':
					$Manager->updateCharacterAsset($_DB, $_SESSION['User'], $Character->id, $_POST['asset-id'], $_POST['asset-points']);

					break;
				case 'attribute':
					$Manager->updateCharacterAttribute($_DB, $_SESSION['User'], $Character->id, $_POST['attribute-name'], $_POST['attribute-value']);

					break;
				case 'class':
					$Manager->updateCharacterClass($_DB, $_SESSION['User'], $Character->id, $_POST['classId']);

					break;
				case 'energy-max':
					$Manager->updateCharacterEnergyMax($_DB, $_SESSION['User'], $Character->id, $_POST['energy-max-points']);

					break;
				case 'gender':
					$Manager->updateCharacterGender($_DB, $_SESSION['User'], $Character->id, $_POST['genderId']);

					break;
				case 'name':
					$Manager->updateCharacterName($_DB, $_SESSION['User'], $Character->id, $_POST['newName']);

					break;
				case 'new-asset':
					// Definition des points de l atout
					if(isset($_POST[$_POST['asset-id'] . '-points'])){
						$assetPoints = $_POST[$_POST['asset-id'] . '-points'];
					}else{
						$assetPoints = 0;
					}

					$Manager->addCharacterAsset($_DB, $_SESSION['User'], $Character, $_POST['asset-id'], $assetPoints);

					break;
				case 'new-level-asset':
					$Manager->addCharacterLevelAsset($_DB, $_SESSION['User'], $Character, $_POST['asset-merge-level-id']);

					break;
				case 'new-skill':
					// Attribution ou recuperation des points de competence
					$skillsIdMax = $Manager->getSkillsMaxId($_DB);

					$skillsArray = array();

					$skillId = 1;

					do {
						if(!empty($_POST[$skillId])){
							$skillArray = $Manager->getSkillById($_DB, $skillId);

							$skillArray['points'] = $_POST[$skillId];
							$skillArray['isMain'] = 0;

							array_push($skillsArray, $skillArray);
						}
						$skillId++;
					} while ($skillId <= $skillsIdMax);

					// Ajout des points de competences au personnage
					$Manager->addCharacterSkills($_DB, $_SESSION['User'], $Character->id, $skillsArray);

					break;
				case 'new-spell':
					// Attribution ou recuperation des points de competence
					$spellsIdMax = $Manager->getSpellsMaxId($_DB);

					$spellsArray = array();

					$spellId = 1;

					do {
						if(!empty($_POST[$spellId])){
							$spellArray = array('id' => $spellId, 'points' => $_POST[$spellId]);

							array_push($spellsArray, $spellArray);
						}
						$spellId++;
					} while ($spellId <= $spellsIdMax);

					// Ajout des points de competences au personnage
					$Manager->addCharacterSpells($_DB, $_SESSION['User'], $Character->id, $spellsArray);

					break;
				case 'orientation':
					$Manager->updateCharacterOrientation($_DB, $_SESSION['User'], $Character->id, $_POST['orientationId']);

					break;
				case 'place':
					$Manager->updateCharacterPlace($_DB, $_SESSION['User'], $Character->id, $_POST['placeId']);

					break;
				case 'profil-img':
					$imgInfosArray = getimagesize($_FILES['characterProfilImg']['tmp_name']);

					// Verification que l image soit bien a la taille et dans le format requis
					if($imgInfosArray['0'] == CHAR_PROFIL_WIDTH && $imgInfosArray['1'] == CHAR_PROFIL_HEIGHT && $imgInfosArray['mime'] == 'image/jpeg'){
						// Suppression de l ancienne img si elle existe
						$file = '../' . P_DIR_IMG_CHAR_PROFIL . $Character->id . '.jpg';

						if (file_exists($file)){
						    unlink ($file);
						}

						// Enregistrement de l image dans le dossier d image de profil des persos
						$dir = '../' . P_DIR_IMG_CHAR_PROFIL . $Character->id . '.jpg';
						move_uploaded_file($_FILES['characterProfilImg']['tmp_name'], $dir);
					}

					break;
				case 'race':
					$Manager->updateCharacterRace($_DB, $_SESSION['User'], $Character->id, $_POST['raceId']);

					break;
				case 'skill':
					// Si la case a cocher de competence primaire n existe pas, on la cree avec un un set a 0
					if(!isset($_POST['isMain'])){
						$_POST['isMain'] == 0;
					}

					$Manager->updateCharacterSkill($_DB, $_SESSION['User'], $Character->id, $_POST['skill-id'], $_POST['skill-points'], $_POST['isMain']);

					break;
				case 'spell':
					$Manager->updateCharacterSpell($_DB, $_SESSION['User'], $Character->id, $_POST['spell-id'], $_POST['spell-points']);

					break;
				case 'status':
					$Manager->updateCharacterStatus($_DB, $_SESSION['User'], $Character->id, $_POST['status-id']);

					break;
				case 'speed-factor':
					$Manager->updateCharacterSpeedFactor($_DB, $_SESSION['User'], $Character->id, $_POST['speed-factor-points']);

					break;
				case 'vitality-max':
					$Manager->updateCharacterVitalityMax($_DB, $_SESSION['User'], $Character->id, $_POST['vitality-max-points']);

					break;
				case 'will-factor':
					$Manager->updateCharacterWillFactor($_DB, $_SESSION['User'], $Character->id, $_POST['will-factor-points']);

					break;
			}

			// Redirection sur la page de detail du persoonage
			echo "<script>location.href='./character-detail.php?id=" . $Character->id . "';</script>";
			exit();
		}

		// Affichages Smarty
		$smarty->display('footer.tpl');
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
