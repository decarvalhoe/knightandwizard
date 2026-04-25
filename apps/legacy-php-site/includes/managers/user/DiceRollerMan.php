<?php
	class DiceRollerMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Lance des des
		public function rollDices($_Dice, $typeOfDice, $numberOfDices, $difficulty){
			switch ($typeOfDice) {
				case 'd10':
					$dicesArray = $_Dice->rollD10($numberOfDices, $difficulty);
					break;

				case 'd20':
					$dicesArray = $_Dice->rollD20($numberOfDices, $difficulty);
					break;
			}

			return $dicesArray;
		}
	}
?>
