<?php
	class CharactersMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi un Array avec tout les Personnage joueurs d un user en fonction de son ID
		public function getCharactersPlayersArrayByUserId($_DB, $id){
			return $_DB->getCharactersArrayByUserId($id);
		}
	}
?>
