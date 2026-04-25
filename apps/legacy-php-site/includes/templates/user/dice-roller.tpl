<h1>Lanceur de d&egrave;s</h1>

<div id="dices-boxes-form">
    <div class="dice-box-form">
        <form action="dice-roller.php?" method="post" class="form">
        	<h2>D10 {$test}</h2>

            Nombre de d&egrave;s : <input type="number" name="number-of-d10" value="{$numberOfD10}" /><br />
            Difficult&eacute; : <input type="number" name="difficulty" value="{$difficultyD10}" /><br />

        	<br />

        	<input type="hidden" name="dice-type" value="d10">
        	<input type="submit" value="Jet" />
        </form>
    </div>

    <div class="last-dice-box-form">
        <form action="dice-roller.php" method="post" class="form">
        	<h2>D20</h2>

            Nombre de d&egrave;s : <input type="number" name="number-of-d20" value="{$numberOfD20}" /><br />
            Difficult&eacute; : <input type="number" name="difficulty" value="{$difficultyD20}" /><br />

        	<br />

        	<input type="hidden" name="dice-type" value="d20">
        	<input type="submit" value="Jet" />
        </form>
    </div>
</div>
