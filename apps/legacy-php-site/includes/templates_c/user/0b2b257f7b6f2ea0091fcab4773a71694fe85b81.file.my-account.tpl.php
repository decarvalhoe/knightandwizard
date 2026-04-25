<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 18:07:18
         compiled from "../includes/templates/user/my-account.tpl" */ ?>
<?php /*%%SmartyHeaderCode:5381707365c6d42a1c23486-72765572%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '0b2b257f7b6f2ea0091fcab4773a71694fe85b81' => 
    array (
      0 => '../includes/templates/user/my-account.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '5381707365c6d42a1c23486-72765572',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6d42a1c4f953_88053781',
  'variables' => 
  array (
    'User' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6d42a1c4f953_88053781')) {function content_5c6d42a1c4f953_88053781($_smarty_tpl) {?><h1>Mon compte</h1>

<h2>Alertes email</h2>

<form action="my-account.php" method="post" class="form">
    Nouveauté sur le jeu :

    <input type="radio" name="game-update-alert" value="1" <?php if ($_smarty_tpl->tpl_vars['User']->value->gameUpdateAlert==1){?>checked="checked"<?php }?>> Activé
    &nbsp;
    <input type="radio" name="game-update-alert" value="0" <?php if ($_smarty_tpl->tpl_vars['User']->value->gameUpdateAlert==0){?>checked="checked"<?php }?>> Désactivé

    <br /><br />

    Nouveau message sur le forum :

    <input type="radio" name="new-comment-alert" value="1" <?php if ($_smarty_tpl->tpl_vars['User']->value->newCommentAlert==1){?>checked="checked"<?php }?>> Activé
    &nbsp;
    <input type="radio" name="new-comment-alert" value="0" <?php if ($_smarty_tpl->tpl_vars['User']->value->newCommentAlert==0){?>checked="checked"<?php }?>> Désactivé

    <br /><br />

    <input type="hidden" name="action" value="update-user">
    <input type="submit" value="Enregistrer" />
</form>
<?php }} ?>