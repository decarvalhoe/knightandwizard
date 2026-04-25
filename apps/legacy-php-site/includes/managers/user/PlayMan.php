<?php
	class PlayMan{
		// Constructeur de la classe
		public function __construct(){
		}


		/*
		*	Privates
		*/

		//Verification que le personnage appartienne bien au joueur
		private function checkCharacterOwner($_DB, $characterId, $userId){
			//Verification que le personnage appartienne bien au joueur
			$Character = $_DB->getCharacterByIdAndUserId($characterId, $userId);

			if(!empty($Character)){
				$flag = 1;
			}else{
				$flag = 0;
			}

			return $flag;
		}


		/*
		*	Publics
		*/

		// Compte le nombre de post total dans une place
		public function countTotalCommentByForumPlaceId($_DB, $placeId){
			return $_DB->countTotalCommentByForumPlaceId($placeId);
		}

		// Renvoi une Array contenant toutes les places de Forum
		public function getAllForumPlaces($_DB){
			return $_DB->getAllPlaces();
		}

		// Renvoi un objet de type CharacterPlayer en fonction d un ID donne
		public function getCharacterById($_DB, $userId, $characterId){
			// Verification de possession du personnage
			$flag = $this->checkCharacterOwner($_DB, $characterId, $userId);

			if($flag == TRUE){
				// Modification de l'emplacement du personnage
				return $_DB->getCharacterById($characterId);
			}else{
				return 'error';
			}
		}

		// Renvoi une Array avec tout les Personnage joueurs d un user en fonction de son ID
		public function getCharactersByPlaceId($_DB, $placeId){
			return $_DB->getCharactersByPlaceId($placeId);
		}

		// Renvoi une Array avec tout les Personnage joueurs d un user en fonction de son ID
		public function getCharactersByUserId($_DB, $id){
			$CharactersArray = $_DB->getCharactersArrayByUserId($id);

			$FinalCharactersArray = array();

			foreach ($CharactersArray as $Character) {
				if($Character->status['id'] != 4 && $Character->status['id'] != 3){		// Filtre des personnages morts (4) et inactifs (3)
					array_push($FinalCharactersArray, $Character);
				}
			}

			return $FinalCharactersArray;
		}

		// Renvoi une Array contenant tous les commentaire pour un lieu defini par son ID
		public function getCommentsArrayByForumPlaceId($_DB, $MyCharactersArray, $forumPlaceId, $page){
			$commentsArray = $_DB->getCommentsArrayByForumPlaceId($forumPlaceId, $page);

			$CharactersArray = $_DB->getAllCharacters();

			$finalCommentsArray = array();

			foreach ($commentsArray as $comment) {
				foreach ($CharactersArray as $Character) {
					if($comment['characterId'] == $Character->id){
						$comment['Character'] = $Character;

						$comment['myPost'] = FALSE;

						foreach ($MyCharactersArray as $MyCharacter) {
							if($comment['Character']->id == $MyCharacter->id){
								$comment['myPost'] = TRUE;
							}
						}

						array_push($finalCommentsArray, $comment);
					}
				}
			}

			krsort($finalCommentsArray);

			return $finalCommentsArray;
		}

		// Renvoi une Place en fonction d'un ID donne
		public function getPlaceById($_DB, $id){
			return $_DB->getPlaceById($id);
		}

		// Modifie le lieu (place) d un personnage
		public function modifyCharacterPlace($_DB, $userId, $characterId, $placeId){
			// Verification de possession du personnage
			$flag = $this->checkCharacterOwner($_DB, $characterId, $userId);

			if($flag == TRUE){
				// Modification de l'emplacement du personnage
				$_DB->updateCharacterPlace($characterId, $placeId);
			}
		}

		// Supprime un poste en fonction d un ID donne
		public function removePost($_DB, $userId ,$postId){
			// Verification du posseseur du poste
			$post = $_DB->getCommentById($postId);
			$Character = $_DB->getCharacterByIdAndUserId($post['characterId'], $userId);

			if(!empty($post && $Character)){
				$_DB->removeCommentById($postId);
			}
		}

		// Enregistre un commentaire dans la DB
		public function saveComment($_DB, $userId, $forumPlaceId, $characterId, $comment, $actionAttribute, $actionSkillId, $actionSpecialisationIdArray, $difficulty, $mjOptionId){
			// Verification de possession du personnage
			$flag = $this->checkCharacterOwner($_DB, $characterId, $userId);

			if($flag == TRUE){
				// Encodage des characteres speciaux
				$comment = htmlspecialchars($comment, ENT_QUOTES);

				// Si une action de personnage a ete selectionnee, on ajoute la Ajout de l eventuelle ligne d action au commentaire
				if($actionAttribute != ''){
					// Instance du Manager
					$_Dice = new _DiceManager();

					// Definition du nombre de des du jet
					$nbrOfDices = 0;

					// Recuperation du personnage en vue du jet de des
					$Character = $_DB->getCharacterById($characterId);

					// Definition de l attribut choisi (en francais)
					switch ($actionAttribute) {
						case 'strength':
							$actionAttribute = 'Force';
							$nbrOfDices = $nbrOfDices + $Character->strength;
							break;
						case 'dexterity':
							$actionAttribute = 'Dextérité';
							$nbrOfDices = $nbrOfDices + $Character->dexterity;
							break;
						case 'stamina':
							$actionAttribute = 'Endurance';
							$nbrOfDices = $nbrOfDices + $Character->stamina;
							break;
						case 'aestheticism':
							$actionAttribute = 'Esthétisme';
							$nbrOfDices = $nbrOfDices + $Character->aestheticism;
							break;
						case 'charisma':
							$actionAttribute = 'Charisme';
							$nbrOfDices = $nbrOfDices + $Character->charisma;
							break;
						case 'empathy':
							$actionAttribute = 'Empathie';
							$nbrOfDices = $nbrOfDices + $Character->empathy;
							break;
						case 'intelligence':
							$actionAttribute = 'Intelligence';
							$nbrOfDices = $nbrOfDices + $Character->intelligence;
							break;
						case 'perception':
							$actionAttribute = 'Perception';
							$nbrOfDices = $nbrOfDices + $Character->perception;
							break;
						case 'reflexes':
							$actionAttribute = 'Réflexes';
							$nbrOfDices = $nbrOfDices + $Character->reflexes;
							break;
						default:
							break;
					}

					// Structuration de l affichage du jet (attribut)
					$comment = $comment . ' <hr><span class="play-sub-title">Action</span><br /><p>' . $actionAttribute;

					// Si une competence a ete choisie...
					if($actionSkillId != NULL){
						// Definition de la competences choisie
						foreach ($Character->skills as $skill) {
							if($actionSkillId == $skill['id']){
								$actionSkill = $skill;
								$nbrOfDices = $nbrOfDices + $skill['points'];
							}
						}

						// Structuration de l affichage du jet (competence)
						$comment = $comment . ' + ' . $actionSkill['name'];

						// Si une ou plusieurs specialisations ont ete choisies...
						if(count($actionSpecialisationIdArray) > 0){
							// Definition des specialisations choisies
							$specialisationArray = array();

							foreach ($actionSpecialisationIdArray as $specialisationId) {
								foreach ($Character->skills as $specialisation) {
									if($specialisationId == $specialisation['id']){
										array_push($specialisationArray, $specialisation);
										$nbrOfDices = $nbrOfDices + $specialisation['points'];
									}
								}
							}

							// Structuration de l affichage du jet (specialisations)
							foreach ($specialisationArray as $specialisation) {
								$comment = $comment . ' + ' . $specialisation['name'];
							}
						}
					}

					// Lancement des des
					$rollArray = $_Dice->rollD10($nbrOfDices, $difficulty);

					// Definition des reussites
					$success = $rollArray[0]['nbrOfSuccess'];

					if(is_numeric($rollArray[0]['nbrOfSuccess'])){
						$success = $success . 'R';
					}

					// Structuration de l affichage du jet (difficulte et reussites)
					$comment = $comment . ' (diff. ' . $difficulty . ') => ' . $success . '</p>';
				}else{
					if($mjOptionId != NULL){
						switch ($mjOptionId) {
							case 1:
								$comment = '<kw>demarcation-line</kw>';
								break;

							default:
								break;
						}
					}
				}

				$_DB->saveComment($forumPlaceId, $characterId, $comment);
			}
		}

		// Envoi un email a tous les joueur (sauf celui qui vient de commenter) pour les prevenir du nouveau post
		public function sendNewPostEmail($_DB, $placeId, $characterId){
			// Recuperation du personnage qui vient de poster
			$Character = $_DB->getCharacterById($characterId);

			// Recuperation du lieu du post
			$Place = $_DB->getPlaceById($placeId);

			// Recuperation de la liste de tous les Users
			$UsersArray = $_DB->getAllUsers();

			// Envoi des emails

			// Creation du PHPMailer
			$mail = new PHPMailer;

			// Set de l adresse d envoi
			$mail->setFrom('no-reply@knightandwizard.ch', 'Knight and Wizard');

			// Ajout des destinataires
			foreach($UsersArray as $User){
				if($User->id != $Character->userId && $User->newCommentAlert == 1){	// Clause pour ne pas envoyer l email au joueur qui vient de poster
					$mail->addAddress($User->eMail, 'joueur');
				}
			}

			$mail->Subject  = $Character->name . ' vient de poster dans ' . $Place->name;

			$mail->isHTML(true);

			// Corps du message HTML
			$mail->Body     = '

			<html>
				<body>
					<p>
						Nouveau post de : ' . $Character->name . '
					</p>

					<p>
						Lieu : <a href="http://knightandwizard.ch/user/play.php?place-id=' . $Place->id . '">' . $Place->name . '</a>
					</p>
				</body>
			</html>';

			// Envoi des messages
			$mail->Send();
		}
	}
?>
