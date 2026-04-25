<?php
	// Requires
	require_once('../config/define.php');
	require_once('../' . P_DIR_SMARTY . 'Smarty.class.php');
	require_once('../' . P_DIR_CLASS . 'User.php');
	require_once('../' . P_DIR_CLASS . 'Character.php');
	require_once('../' . P_DIR_CLASS . 'CharacterPlayer.php');
	require_once('../' . P_DIR_MAN . '_DBManager.php');
	require_once('../' . P_DIR_MAN . 'user/' . 'ForumMan.php');

	// Activation de la session
	session_start();

	if($_SESSION['User'] != NULL){
		// Instance de Smarty
		$smarty = new Smarty();
		$smarty->template_dir = '../' . P_DIR_TPL . 'user/';
		$smarty->compile_dir = '../' . P_DIR_TPLC . 'user/';

		// Instance des Managers
		$_DB = new _DBManager();
		$Manager = new ForumMan();

		// Affiches Smarty
		$smarty->display('header.tpl');

		// Recuperation des differente places de forum
		$forumPlacesArray = $Manager->getAllForumPlaces($_DB);

		// Assignations Smarty
		$smarty->assign('forumPlacesArray', $forumPlacesArray);

		if(empty($_GET['place-id'])){
			// Affiches Smarty
			$smarty->display('forum-choose-place.tpl');
		}else{
			if(!empty($_GET['action'])){
				switch ($_GET['action']) {
					case 'remove-post':
						$Manager->removePost($_DB, $_SESSION['User']->id, $_GET['post-id']);
						break;

					case 'place-character':
						$Manager->modifyCharacterPlace($_DB, $_SESSION['User']->id, $_POST['characterId'], $_GET['place-id']);
						break;
				}
			}else{
				if($_POST['newComment'] == TRUE && !empty($_POST['comment'])){
					$Manager->saveComment($_DB, $_GET['place-id'], $_POST['characterId'], $_POST['comment']);
				}
			}

			// Recuperation de tous les personnage du joueur
			$CharactersArray = $Manager->getCharactersPlayersArrayByUserId($_DB, $_SESSION['User']->id);

			// Recuperation de tous les personnages present dans la place
			$PresentCharractersArray = $Manager->getCharactersByPlaceId($_DB, $_GET['place-id']);

			// Recuperation des messages du lieu (pour la page courante)
			$commentsArray = $Manager->getCommentsArrayByForumPlaceId($_DB, $CharactersArray, $_GET['place-id'], $_GET['page']);

			// Recuperation du nombre total de post pour le lieu selectionne
			$totalComment = $Manager->countTotalCommentByForumPlaceId($_DB, $_GET['place-id']);

			// Definition du nombre de pages
			$nbrOfPages = $totalComment / NUM_POST_P_PAGE;
			$nbrOfPages = ceil($nbrOfPages);

			// Assignations Smarty
			$smarty->assign('DIR_SITE', DIR_SITE);
			$smarty->assign('CharactersArray', $CharactersArray);
			$smarty->assign('PresentCharractersArray', $PresentCharractersArray);
			$smarty->assign('commentsArray', $commentsArray);
			$smarty->assign('currentPage', $_GET['page']);
			$smarty->assign('placeId', $_GET['place-id']);

			// Affichages Smarty
			$smarty->display('forum-place.tpl');
			$smarty->display('forum.tpl');

			// Affichage du tourne-page
			if($nbrOfPages > 1){
				// Assignations Smarty
				$smarty->assign('i', 1);
				$smarty->assign('nbrOfPages', $nbrOfPages);

				// Affichages Smarty
				$smarty->display('forum-turn-page.tpl');
			}
		}

		// Affiches Smarty
		$smarty->display('footer.tpl');
	}else {
		// Renvois en page d accueil si la session User n est pas valide
		echo "<script>location.href='../index.php';</script>";
		exit();
	}
