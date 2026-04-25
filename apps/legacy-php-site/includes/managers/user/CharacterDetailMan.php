<?php
	class CharacterDetailMan{
		// Constructeur de la classe
		public function __construct(){
		}

		//Verification que le personnage appartienne bien au joueur
		public function checkCharacterOwner($_DB, $characterId, $userId){
			//Verification que le personnage appartienne bien au joueur
			$Character = $_DB->getCharacterByIdAndUserId($characterId, $userId);

			if($Character->id != ''){
				$flag = 'TRUE';
			}else{
				$flag = 'FALSE';
			}

			return $flag;
		}

		// Renvoi un objet Character en fonction d un ID donne
		public function getCharacterById($_DB, $id){
			return $_DB->getCharacterById($id);
		}

		// Renvoi un objet User en fonction d un ID donne
		public function getUserById($_DB, $id){
			return $_DB->getUserById($id);
		}

		// Imprime la feuille d un personnage
		public function printCharacter($Character){
			// Instance des Managers
			$_Printer = new _PrintManager();

			$_Printer->printCharacter($Character);
		}
	}
?>
