<?php
	class SpellsListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant tous les sorts
		public function getAllSpells($_DB, $order){
			return $_DB->getAllSpells($order);
		}
	}
?>
