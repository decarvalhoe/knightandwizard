<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'AddCharacterMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new AddCharacterMan();

		// Recuperation et attribution des data
		if(isset($_POST['step'])){
			switch ($_POST['step']) {
				case '1':		// GENRE
					// Recuperation du genre
					$gender = $Manager->getGenderById($_DB, $_POST['genderId']);

					// Attribution du genre
					$_SESSION['Character']->gender = $gender;

					break;
				case '2':		// RACE
					// Recuperation de la race
					$race = $Manager->getRaceById($_DB, $_POST['raceId']);

					// Attribution de la race
					$_SESSION['Character']->race = $race;
					$_SESSION['Character']->assets = $race['assets'];

					// Atribution de la vitalite
					$_SESSION['Character']->vitality = $race['vitality'];
					$_SESSION['Character']->vitalityMax = $race['vitality'];

					// Atribution des facteurs de vitesse et de volonte
					$_SESSION['Character']->speedFactor = $race['speedFactor'];
					$_SESSION['Character']->willFactor = $race['willFactor'];

					break;
				case '3':		// ORIENTATION
					// Recuperation de l orientation
					$orientation = $Manager->getOrientationById($_DB, $_POST['orientationId']);

					// Attribution de l orientation
					$_SESSION['Character']->orientation = $orientation;

					break;
				case '4':		// CLASSE
					// Recuperation de la classe
					$class = $Manager->getClassById($_DB, $_POST['classId']);

					// Attribution de la classe
					$_SESSION['Character']->class = $class;

					break;
				case '5':		// ATTRIBUTS
					// Attribution du niveau
					$_SESSION['Character']->level = $_POST['level'];

					// Attribution ou recuperation des points d attributs
					if($_POST['random'] == 'TRUE'){		// Attribution aleatoire
						$_SESSION['Character'] = $Manager->setRandomAttributes($_SESSION['Character'], $_POST['level']);

						// Attribution des facteurs et vitalite "aleatoirement"
						if($_POST['level'] > 1){
							// Atribution de la vitalite "aleatoire"
							$_SESSION['Character']->vitalityMax = $Manager->setRandomVitality($_SESSION['Character'], $_POST['level']);
							$_SESSION['Character']->vitality = $_SESSION['Character']->vitalityMax;

							// Atribution du facteur de vitesse "aleatoire"
							$_SESSION['Character']->speedFactor = $Manager->setRandomSpeedFactor($_SESSION['Character'], $_POST['level']);

							// Attribution du facteur de volonte "aleatoire"
							$_SESSION['Character']->willFactor = $Manager->setRandomWillFactor($_SESSION['Character'], $_POST['level']);
						}
					}else{								// Attribution selon la saisie
						$_SESSION['Character']->strength = $_POST['strength'];
						$_SESSION['Character']->dexterity = $_POST['dexterity'];
						$_SESSION['Character']->stamina = $_POST['stamina'];
						$_SESSION['Character']->aestheticism = $_POST['aestheticism'];
						$_SESSION['Character']->charisma = $_POST['charisma'];
						$_SESSION['Character']->empathy = $_POST['empathy'];
						$_SESSION['Character']->intelligence = $_POST['intelligence'];
						$_SESSION['Character']->perception = $_POST['perception'];
						$_SESSION['Character']->reflexes = $_POST['reflexes'];
					}

					break;
				case '6':		// COMPETENCES
					// Attribution du niveau
					$_SESSION['Character']->level = $_POST['level'];

					if($_POST['random'] == 'TRUE'){		// Attribution aleatoire
						$skillsArray = $Manager->setRandomSkills($_DB, $_SESSION['Character']);
					}else{
						// Recuperation et attribution des points de competences
						$skillsIdMax = $Manager->getSkillsMaxId($_DB);

						$skillsArray = array();

						$skillId = 1;

						do{
							if(!empty($_POST[$skillId])){
								// Recuperation des data de la skill selectionnee
								$skillArray = $Manager->getSkillById($_DB, $skillId);

								// Attribution des points a la skill
								$skillArray['points'] = $_POST[$skillId];

								// Definition de la primarite de la skill
								if($_POST['mainSkill'] != $skillId){
									$skillArray['isMain'] = 0;
								}else{
									$skillArray['isMain'] = 1;
								}

								array_push($skillsArray, $skillArray);
							}

							// Incrementation  de l ID de la skill courante
							$skillId++;
						}while($skillId <= $skillsIdMax);
					}

					$_SESSION['Character']->skills = $skillsArray;

					break;
				case '7':		// SORTS
					// Attribution du niveau
					$_SESSION['Character']->level = $_POST['level'];

					if($_POST['random'] == 'TRUE'){		// Attribution aleatoire
						$spellsArray = $Manager->setRandomSpells($_DB, $_SESSION['Character']);
					}else{
						// Recuperation et/ou attribution des points de sorts
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
					}

					// Ajout des noms des sorts a l array des sorts
					$spellsArray = $Manager->addSpellsName($_DB, $spellsArray);

					$_SESSION['Character']->spells = $spellsArray;

					break;
				case '8':		// ATOUTS DE NIVEAUX
					// Si le personnage n a pas encore d atout, on lui attribue une array pour contenir ses atouts de niveaux
					if(!isset($_SESSION['Character']->assets)){
						$_SESSION['Character']->assets = array();
					}

					if($_POST['random'] == 'TRUE'){		// Attribution aleatoire
						$_SESSION['Character']->assets = $Manager->setRandomLevelAsset($_DB, $_SESSION['Character'], $_POST['levelProcessing']);
					}else{
						// Recuperation et attribution des points de competences
						$levelAssetsIdMax = $Manager->getAssetsMaxId($_DB);

						$levelAssetId = 1;

						// Ajout de l atout au personnage
						do{
							if($_POST['levelAssetId'] == $levelAssetId && $_POST['levelAssetId'] == TRUE){
								// Ajout de l atout de niveau au personnage
								$_SESSION['Character']->assets = $Manager->addCharacterAsset($_DB, $_SESSION['Character']->assets, $levelAssetId);
							}

							// Incrementation  de l ID de l atout courant
							$levelAssetId++;
						}while($levelAssetId <= $levelAssetsIdMax);
					}
					break;
				default:
					break;
			}
		}

		// Set ou incrementation du step de creation
		// Set de base de step
		if(!isset($_POST['step'])){
			$_POST['step'] = 1;
		// Incrementation du step dans le cadre d un step numerique
		}elseif(is_numeric($_POST['step'])){
			$_POST['step']++;

			// Skip du choix de sort pour les non-magiciens
			if($_POST['step'] == 7 && $_SESSION['Character']->orientation['name'] != 'Magicien'){
				$_POST['step']++;
			}

			// Etape des atouts de niveaux
			if($_POST['step'] >= 8){
				// Calcul du niveau du personnage (si ce n est pas deja fait)
				if(!isset($_SESSION['Character']->level)){
					$_SESSION['Character']->getMyLevel();
				}

				// Skip du choix des atouts de niveau si le personnage est de niveau 1
				if($_SESSION['Character']->level == 1){
					$_POST['step'] = 'last';
				}else{
					// Set de la variable du niveau a traiter pour les atouts de niveaux
					if(!isset($_POST['levelProcessing'])){
						$_POST['levelProcessing'] = 2;
					}else{
						$_POST['levelProcessing']++;
						$_POST['step'] = 8;

						if($_POST['levelProcessing'] > $_SESSION['Character']->level){
							$_POST['step'] = 'last';
						}
					}
				}
			}
		}

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('step', $_POST['step']);

		// Affiches Smarty
		$smarty->display('header.tpl');
		$smarty->display('add-character.tpl');

		// Etapes de creation du personnage
		switch ($_POST['step']){
			case '1':		// GENRE
				// Definition de l array de personnage en construction
				$characterArray = array('id' => '', 'userId' => $_SESSION['User']->id);

				// Creation et mise en session du personnage
				$_SESSION['Character'] = new CharacterPlayer($_DB, $characterArray);

				// Recuperation des genres
				$gendersArray = $Manager->getAllGenders($_DB);

				// Assignations Smarty
				$smarty->assign('gendersArray', $gendersArray);

				// Affichages Smarty
				$smarty->display('add-character-gender.tpl');

				break;
			case '2':		// RACE
				// Recuperation des races
				$racesArray = $Manager->getAvailableRaces($_DB, $_SESSION['Character']);

				// Assignations Smarty
				$smarty->assign('racesArray', $racesArray);

				// Affichages Smarty
				$smarty->display('add-character-race.tpl');

				break;
			case '3':		// ORIENTATION
				// Recuperation des orientations disponibles
				$orientationsArray = $Manager->getAvailableOrientations($_DB, $_SESSION['Character']);

				// Assignations Smarty
				$smarty->assign('orientationsArray', $orientationsArray);

				// Affichages Smarty
				$smarty->display('add-character-orientation.tpl');

				break;
			case '4':		// CLASSE
				// Recuperation des classes disponibles
				$classesArray = $Manager->getAvailableClasses($_DB, $_SESSION['Character']);

				// Assignations Smarty
				$smarty->assign('classesArray', $classesArray);

				// Affichages Smarty
				$smarty->display('add-character-class.tpl');

				break;
			case '5':		// ATTRIBUTS
				// Affichages Smarty
				$smarty->display('add-character-attributes.tpl');

				break;
			case '6':		// COMPETENCES
				// Recuperation des competences disponibles
				$skillsArray = $Manager->getAvailableSkills($_DB, $_SESSION['Character']);

				// Assignations Smarty
				$smarty->assign('skillsArray', $skillsArray);
				$smarty->assign('level', $_SESSION['Character']->level);

				// Affichages Smarty
				$smarty->display('add-character-skills.tpl');

				break;
			case '7':		// SORTS
				// Recuperation des sorts disponibles
				$spellsArray = $Manager->getAvailableSpells($_DB, $_SESSION['Character']);

				// Assignations Smarty
				$smarty->assign('spellsArray', $spellsArray);
				$smarty->assign('level', $_SESSION['Character']->level);

				// Affichages Smarty
				$smarty->display('add-character-spells.tpl');

				break;
			case '8':		// ATOUTS DE NIVEAU
				// Recuperation des atouts de niveau disponiblent pour le personnage
				$levelAssetsArray = $Manager->getAvailableLevelAssets($_DB, $_SESSION['Character'], $_POST['levelProcessing']);

				// Recuperation du niveau maximal d atout present dans la liste des atouts de niveau
				$levelMax = $Manager->getLevelMaxFromLevelAssetsArray($levelAssetsArray);

				// Assignations Smarty
				$smarty->assign('level', $_SESSION['Character']->level);
				$smarty->assign('levelAssetsArray', $levelAssetsArray);
				$smarty->assign('levelMax', $levelMax);
				$smarty->assign('levelProcessing', $_POST['levelProcessing']);

				// Affichages Smarty
				$smarty->display('add-character-assets.tpl');

				break;
			case 'last':	// NOM
				// Affichages Smarty
				$smarty->display('add-character-name.tpl');

				break;
			case 'save':	// SAUVEGARDE
				// Formatage du nom
				$_SESSION['Character']->name = $Manager->formatString($_POST['name']);

				// Sauvegarde du personnage dans la DB
				$Manager->saveCharacter($_DB, $_SESSION['Character']);

				// Affichages Smarty
				$smarty->display('add-character-saved.tpl');

				break;
		}

		// Affiches Smarty
		if($_POST['step'] != 'last' && $_POST['step'] != 'save'){
			$smarty->display('add-character-save.tpl');
		}
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
