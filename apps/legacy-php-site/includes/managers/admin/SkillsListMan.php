<?php
	class SkillsListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant toutes les competences
		public function getAllSkills($_DB){
			$skillsFamiliesArray = $_DB->getAllSkillsFamilies();
			$skillsArray = array();

			foreach ($skillsFamiliesArray as $skillsFamily){
				// Recuperation de toutes les competences d une famille defini
				$familySkillsArray = $_DB->getSkillsBySkillsFamilyId($skillsFamily['id']);

				$newSkillArray = array();

				foreach ($familySkillsArray as $newSkill) {
					$newSkill['familyName'] = $skillsFamily['name'];

					array_push($newSkillArray, $newSkill);
				}

				array_push($skillsArray, $newSkillArray);
			}

			return $skillsArray;
		}
	}
?>
