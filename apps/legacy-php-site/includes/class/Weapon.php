<?php
	class Weapon {
		public $id;
		public $name;
		public $dammage;
		public $useStrength;
		public $dammageType;
		public $difficulty;
		public $weight;
		public $special;

        //Constructeur de la classe
        public function __construct($_DB, $array) {
            $this->id = $array['id'];
            $this->name = $array['name'];
            $this->dammage = $array['dammage'];
            $this->useStrength = $array['useStrength'];
            $this->dammageType = $array['dammageType'];
            $this->difficulty = $array['difficulty'];
            $this->weight = $array['weight'];
            $this->special = $array['special'];
        }
    }
?>
