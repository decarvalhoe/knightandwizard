<?php
	class AddSkillMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant toutes les famille de competences
		public function getAllSkillsFamilies($_DB){
			return $_DB->getAllSkillsFamilies();
		}

		// Renvoi une Array contenant toutes les competences
		public function getAllSkills($_DB){
			return $_DB->getAllSkills();
		}

		// Ajoute une competence dans la DB
		public function insertSkill($_DB, $name, $skillFamilyId, $childOfId){
			if($name != ''){
				if($childOfId != ''){
					// Recuperation de la competence mere (pour eviter les erreurs de saisie)
					$motherSkillArray = $_DB->getSkillById($childOfId);

					// Definition automatique de la famille de competence (identique a celle de la competence mere)
					$skillFamilyId = $motherSkillArray['familyId'];
				}

				// AJout de la competence dans la DB
				$_DB->insertSkill($name, $skillFamilyId, $childOfId);
			}
		}
	}
?>
