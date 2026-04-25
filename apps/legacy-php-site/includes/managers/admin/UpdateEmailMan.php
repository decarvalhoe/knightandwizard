<?php
	class UpdateEmailMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Envoi un email a tous les inscris a la newsletter d update du jeu
		public function sendGameUpdateEmail($_DB, $subject, $message){
			// Recuperation de la liste de tous les Users
			$UsersArray = $_DB->getAllUsers();

			// Envoi des emails
			foreach($UsersArray as $User){
				if($User->gameUpdateAlert == 1){	// Envoi de l email aux Users inscrit a la newsletter uniquement
					// Definition du destinataire
					$to      = $User->eMail;

					// Meta
					$headers = 'From: no-reply@knightandwizard.ch' . "\r\n" .
								'Reply-To: no-reply@knightandwizard.ch' . "\r\n" .
								'X-Mailer: PHP/' . phpversion();

					mail($to, $subject, $message, $headers);
				}
			}
		}
	}
?>
