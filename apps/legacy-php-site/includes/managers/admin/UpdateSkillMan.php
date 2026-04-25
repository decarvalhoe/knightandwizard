<?php
	class UpdateSkillMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant une competence en fonction d un ID donne
		public function getSkillById($_DB, $id){
			return $_DB->getSkillById($id);
		}

		// Renvoi une array contenant toutes les famille de competences
		public function getAllSkillsFamilies($_DB){
			return $_DB->getAllSkillsFamilies();
		}

		// Renvoi une Array contenant toutes les competences
		public function getAllSkills($_DB){
			return $_DB->getAllSkills();
		}

		// Met a jour une competence en fonction d un ID donne
		public function updateSkill($_DB, $id, $name, $skillFamilyId, $childOfId){
			if($childOfId != ''){
				// Recuperation de la competence mere (pour eviter les erreurs de saisie)
				$motherSkillArray = $_DB->getSkillById($childOfId);

				// Definition automatique de la famille de competence (identique a celle de la competence mere)
				$skillFamilyId = $motherSkillArray['familyId'];
			}

			$_DB->updateSkill($id, $name, $skillFamilyId, $childOfId);
		}
	}
?>
