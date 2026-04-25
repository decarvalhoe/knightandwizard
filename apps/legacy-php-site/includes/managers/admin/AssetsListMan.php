<?php
	class AssetsListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array composee de tous les atouts
		public function getAllAssets($_DB){
			return $_DB->getAllAssets('name');
		}
	}
?>
