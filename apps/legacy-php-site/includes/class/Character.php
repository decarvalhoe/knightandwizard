<?php
	class Character {
		public $gender;
		public $name;
		public $race;
		public $orientation;
		public $class;
		public $age;
		public $category;
		
		public $vitality;
		public $vitalityMax;
		public $speedFactor;
		public $willFactor;
		
		public $strength;
		public $dexterity;
		public $stamina;
		
		public $aestheticism;
		public $reflexes;
		public $perception;
		
		public $charisma;
		public $intelligence;
		public $empathy;
		
		public $mainSkillId;
		public $skills;
		
		public $spells;
		
        //Constructeur de la classe
        public function __construct($array) {
        }
		
		// Genere un nombre aleatoir Gaussien $m = moyenne, $s = ecart type
		public function randGauss($m, $s){
			$x = (float)rand()/(float)getrandmax();
			$y = (float)rand()/(float)getrandmax();
			
			$u = sqrt(-2 * log($x)) * cos(2 * pi() * $y);
			
			$randGauss = $u * $s + $m;
			
			// Formatage en nombre entier
			$randGauss = round($randGauss, '0');
			
			// Suppression des nombre negatifs
			if($randGauss < 0 || $randGauss == "-0"){
				$randGauss = 0;
			}
			
			return $randGauss;
		}
    }
?>
