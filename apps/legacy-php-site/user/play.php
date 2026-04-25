<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_CLASS . 'Place.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . '_DiceManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'PlayMan.php');
	require_once('../' . P_DIR_PHPMAILER . 'PHPMailerAutoload.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new PlayMan();

		// Actions
		if(!empty($_GET['action'])){
			switch ($_GET['action']) {
				// Renvoi les attributs d un personnage
				case 'get-json-character':
					// Recuperation du personnage
					$Character = $Manager->getCharacterById($_DB, $_SESSION['User']->id, $_GET['charId']);

					// Transmission du personnage en JSON
					echo(json_encode($Character));

					// Fin du script
					die();

				// Ajout de nouveau commentaire
				case 'new-comment':
					if(!empty($_POST['comment']) || $_POST['action-attribute'] != NULL || $_POST['mj-option-id'] != NULL){
						// Recuperation des specialisations
						$specialisationIdArray = array();

						if(count($_POST['specialisations']) > 0){
							foreach($_POST['specialisations'] as $specialisationId){
								array_push($specialisationIdArray, $specialisationId);
							}
						}

						// Enregistrement du nouveau commentaire dans la DB
						$Manager->saveComment($_DB, $_SESSION['User']->id, $_GET['place-id'], $_POST['character-id'], $_POST['comment'], $_POST['action-attribute'], $_POST['action-skill'], $specialisationIdArray, $_POST['difficulty'], $_POST['mj-option-id']);

						// Envoi d email aux autres joueurs pour les prevenir du nouveau message (sauf pour les lignes de dmarcation)
						if($_POST['mj-option-id'] == NULL){
							$Manager->sendNewPostEmail($_DB, $_GET['place-id'], $_POST['character-id']);
						}
					}
					break;

				// Placement d un personnage dans une place
				case 'place-character':
					if($_POST['character-id'] != NULL){
						$Manager->modifyCharacterPlace($_DB, $_SESSION['User']->id, $_POST['character-id'], $_GET['place-id']);
					}
					break;

				// Suppression d un commentaire
				case 'remove-post':
					$Manager->removePost($_DB, $_SESSION['User']->id, $_GET['post-id']);
					break;
			}
		}

		// Definition de la page courante du forum
		if(empty($_GET['page'])){
			$_GET['page'] = 1;
		}

		// Recuperation de tous les personnages present dans la place
		$PresentCharractersArray = $Manager->getCharactersByPlaceId($_DB, $_GET['place-id']);

		$iHavePresentCharacters = FALSE;

		// Verification qu au moins un personnage appartenant au joueur est present dans la place
		foreach ($PresentCharractersArray as $Charracter) {
			if($Charracter->userId == $_SESSION['User']->id){
				$iHavePresentCharacters = TRUE;
			}
		}

		// Recuperation de tous les personnage du joueur
		$MyCharactersArray = $Manager->getCharactersByUserId($_DB, $_SESSION['User']->id);

		// Recuperation des messages du lieu (pour la page courante)
		$commentsArray = $Manager->getCommentsArrayByForumPlaceId($_DB, $MyCharactersArray, $_GET['place-id'], $_GET['page']);

		// Recuperation du nombre total de post pour le lieu selectionne
		$totalComment = $Manager->countTotalCommentByForumPlaceId($_DB, $_GET['place-id']);

		// Definition du nombre de pages
		$nbrOfPages = $totalComment / NUM_POST_P_PAGE;
		$nbrOfPages = ceil($nbrOfPages);

		// Assignations Smarty
		$smarty->assign('DIR_SITE', DIR_SITE);
		$smarty->assign('placeId', $_GET['place-id']);
		$smarty->assign('Place', $Manager->getPlaceById($_DB, $_GET['place-id']));
		$smarty->assign('PresentCharractersArray', $PresentCharractersArray);
		$smarty->assign('iHavePresentCharacters', $iHavePresentCharacters);
		$smarty->assign('MyCharactersArray', $MyCharactersArray);
		$smarty->assign('commentsArray', $commentsArray);
		$smarty->assign('currentPage', $_GET['page']);

		// Affiches Smarty
		$smarty->display('header.tpl');
		$smarty->display('play.tpl');

		// Affichage du tourne-page
		if($nbrOfPages > 1){
			// Assignations Smarty
			$smarty->assign('i', 1);
			$smarty->assign('nbrOfPages', $nbrOfPages);

			// Affichages Smarty
			$smarty->display('comment-turn-page.tpl');
		}

		// Affiches Smarty
		$smarty->display('footer.tpl');

		exit();
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
