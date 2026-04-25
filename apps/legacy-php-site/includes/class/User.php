<?php
	class User {
		public $id;
		public $name;
		public $eMail;
		public $password;
		public $newCommentAlert;
		public $gameUpdateAlert;

        //Constructeur de la classe
        public function __construct($_DB, $array) {
            $this->id = $array['id'];
            $this->name = $array['name'];
			$this->eMail = $array['eMail'];
			$this->password = $array['password'];
            $this->newCommentAlert = $array['newCommentAlert'];
            $this->gameUpdateAlert = $array['gameUpdateAlert'];
        }
    }
?>
