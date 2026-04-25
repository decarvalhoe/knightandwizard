<?php
	class ClassesListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant tous les sorts
		public function getAllClasses($_DB){
			$orientationsArray = $_DB->getAllOrientations();

			$fullClassesArray = array();

			foreach ($orientationsArray as $orientation) {
				$classesArray = $_DB->getClassesByOrientationId($orientation['id']);

				$orientation['classes'] = $classesArray;

				array_push($fullClassesArray, $orientation);
			}

			return $fullClassesArray;
		}
	}
?>
