<h1>Mon compte</h1>

<h2>Alertes email</h2>

<form action="my-account.php" method="post" class="form">
    Nouveauté sur le jeu :

    <input type="radio" name="game-update-alert" value="1" {if $User->gameUpdateAlert == 1}checked="checked"{/if}> Activé
    &nbsp;
    <input type="radio" name="game-update-alert" value="0" {if $User->gameUpdateAlert == 0}checked="checked"{/if}> Désactivé

    <br /><br />

    Nouveau message sur le forum :

    <input type="radio" name="new-comment-alert" value="1" {if $User->newCommentAlert == 1}checked="checked"{/if}> Activé
    &nbsp;
    <input type="radio" name="new-comment-alert" value="0" {if $User->newCommentAlert == 0}checked="checked"{/if}> Désactivé

    <br /><br />

    <input type="hidden" name="action" value="update-user">
    <input type="submit" value="Enregistrer" />
</form>
