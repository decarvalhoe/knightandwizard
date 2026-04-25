<?php
	class AddPotionMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// AJoute un sort dans la DB
		public function insertPotion($_DB, $name, $effect, $ingredients, $recipe, $value){
			$difficulty = round(2 * sqrt(sqrt(4 * $value)));

			$_DB->insertPotion($name, $effect, $ingredients, $recipe, $difficulty, $value);
		}
	}
?>
