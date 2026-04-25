<h1>Email de mise à jour</h1>

<form action="update-email.php" method="post" class="form">
    Sujet : <input type="text" name="subject">

    <br /><br />

    Message : <textarea rows="4" cols="50" name="message"></textarea>

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Envoyer" />
</form>
