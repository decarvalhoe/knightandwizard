<?php
	class Arena {
		public $id;
		public $name;
		public $description;
		public $arbitrator;

        //Constructeur de la classe
        public function __construct($_DB, $array) {
            $this->id = $array['id'];
            $this->name = $array['name'];
            $this->description = $array['description'];
            $this->setArbitrator($_DB, $array['arbitratorId']);
        }

		// Setter
		private function setArbitrator($_DB, $arbitratorId){
			$this->arbitrator = $_DB->getCharacterById($arbitratorId);
		}
    }
?>
