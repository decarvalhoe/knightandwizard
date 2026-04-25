<?php
	class PotionsListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant tous les sorts
		public function getAllPotions($_DB, $order){
			return $_DB->getAllPotions($order);
		}
	}
?>
