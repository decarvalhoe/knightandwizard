<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:25:12
         compiled from "../includes/templates/admin/update-email.tpl" */ ?>
<?php /*%%SmartyHeaderCode:15043961465e3fd05004af46-89467087%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '2cd5be53818e9c768873f816315e99efd4fee262' => 
    array (
      0 => '../includes/templates/admin/update-email.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '15043961465e3fd05004af46-89467087',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5e3fd050079ca5_18295499',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5e3fd050079ca5_18295499')) {function content_5e3fd050079ca5_18295499($_smarty_tpl) {?><h1>Email de mise à jour</h1>

<form action="update-email.php" method="post" class="form">
    Sujet : <input type="text" name="subject">

    <br /><br />

    Message : <textarea rows="4" cols="50" name="message"></textarea>

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Envoyer" />
</form>
<?php }} ?>