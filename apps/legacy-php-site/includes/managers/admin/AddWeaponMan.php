<?php
	class AddWeaponMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// AJoute un sort dans la DB
		public function insertWeapon($_DB, $name, $dammage, $useStrength, $dammageType, $difficulty, $weight, $special){
			$_DB->insertWeapon($name, $dammage, $useStrength, $dammageType, $difficulty, $weight, $special);
		}
	}
?>
