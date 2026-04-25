<?php
	class MapMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant toutes les places de Forum
		public function getAllForumPlaces($_DB){
			$forumPlacesArray = $_DB->getPlacesByStatusId(4);

			return $forumPlacesArray;
		}
	}
?>
