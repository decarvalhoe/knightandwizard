<?php
	class ForumMan{
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
			$totalOfComment = $_DB->countTotalCommentByForumPlaceId($placeId);

			return $totalOfComment;
		}

		// Renvoi une Array contenant toutes les places de Forum
		public function getAllForumPlaces($_DB){
			$forumPlacesArray = $_DB->getAllPlaces();

			return $forumPlacesArray;
		}

		// Renvoi une Array avec tout les Personnage joueurs d un user en fonction de son ID
		public function getCharactersByPlaceId($_DB, $placeId){
			$CharactersArray = $_DB->getCharactersByPlaceId($placeId);

			return $CharactersArray;
		}

		// Renvoi une Array avec tout les Personnage joueurs d un user en fonction de son ID
		public function getCharactersByUserId($_DB, $id){
			$CharactersPlayersArray = $_DB->getCharactersArrayByUserId($id);

			return $CharactersPlayersArray;
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
		public function saveComment($_DB, $forumPlaceId, $characterId, $comment){
			$comment = addslashes($comment);

			$_DB->saveComment($forumPlaceId, $characterId, $comment);
		}
	}
?>
