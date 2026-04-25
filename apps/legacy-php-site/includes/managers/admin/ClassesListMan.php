<?php
	class ClassesListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant tous les sorts
		public function getAllClasses($_DB){
			// Recuperation de toutes les orientations
			$orientationsArray = $_DB->getAllOrientations();

			$fullClassesArray = array();

			foreach ($orientationsArray as $orientation) {
				$classesArray = $_DB->getClassesByOrientationId($orientation['id']);

				$finalClassesArray = array();

				// Ajout des atouts de classe
				foreach ($classesArray as $class) {
					$class['asset'] = $_DB->getAssetByClassId($class['id']);

					array_push($finalClassesArray, $class);
				}

				$orientation['classes'] = $finalClassesArray;

				array_push($fullClassesArray, $orientation);
			}

			return $fullClassesArray;
		}
	}
?>
