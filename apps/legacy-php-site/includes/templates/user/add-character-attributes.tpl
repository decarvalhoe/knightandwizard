<form action="add-character.php" method="post" class="form">
    <h2>Attributs</h2>

    Force : <input type="number" name="strength" value="0" min="0"><br />
    Dextérité : <input type="number" name="dexterity" value="0" min="0"><br />
    Endurance : <input type="number" name="stamina" value="0" min="0"><br />

    <br />

    Esthétisme : <input type="number" name="aestheticism" value="0" min="0"><br />
    Charisme : <input type="number" name="charisma" value="0" min="0"><br />
    Empathie : <input type="number" name="empathy" value="0" min="0"><br />

    <br />

    Intelligence : <input type="number" name="intelligence" value="0" min="0"><br />
    Perception : <input type="number" name="perception" value="0" min="0"><br />
    Reflexes : <input type="number" name="reflexes" value="0" min="0"><br />

    <br />

    <input type="checkbox" name="random" value="TRUE"> Aléatoire | Niveau : <input type="number" name="level" value="1" min="1">

    <br /><br />

    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>
