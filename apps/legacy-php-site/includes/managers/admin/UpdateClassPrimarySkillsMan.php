<?php
	class UpdateClassPrimarySkillsMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoie une Array contenant une classe en fonction d un ID donne
		public function getClassById($_DB, $classId){
			return $_DB->getClassById($classId);
		}

		// Renvoie une Array contenant toutes les competence primaires (sans mere)
		public function getPrimarySkills($_DB){
			return $_DB->getPrimarySkills();
		}

		// Renvoie le plus grand ID de la table skills
		public function getSkillsMaxId($_DB){
			return $_DB->getSkillsMaxId();
		}

		// Mets a jour les competences primaires liees a une classe
		public function updateClassPrimarySkills($_DB, $classId, $skillsIdArray){
			// Suppression des anciennes competences primaires de la classe
			$_DB->deleteClassPrimarySkills($classId);

			// Ajout des competences primaires selectionnees
			foreach ($skillsIdArray as $skillId){
				$_DB->insertSkillsMergeClasses($classId, $skillId);
			}
		}
	}
?>
