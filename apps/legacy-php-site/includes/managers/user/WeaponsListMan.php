<?php
	class WeaponsListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant tous les sorts
		public function getAllWeapons($_DB, $order){
			return $_DB->getAllWeapons($order);
		}
	}
?>
