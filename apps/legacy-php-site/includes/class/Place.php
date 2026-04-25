<?php
	class Place {
		public $id;
		public $name;
		public $isChildOf;
		public $status;
		public $isCapital;

        //Constructeur de la classe
        public function __construct($_DB, $array) {
            $this->id = $array['id'];
            $this->name = $array['name'];
			$this->isChildOf = $array['isChildOf'];
			$this->setStatus($_DB, $array['statusId']);
            $this->isCapital = $array['isCapital'];
        }

		// Setter
		private function setStatus($_DB, $statusId){
			$this->status = $_DB->getPlaceStatusById($statusId);
		}
    }
?>
