<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:17:45
         compiled from "../includes/templates/user/add-character-save.tpl" */ ?>
<?php /*%%SmartyHeaderCode:2936197255c6985d281afa2-71375604%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '2af7d6ac90a2dc850db20caf50573e9a6eed9ba9' => 
    array (
      0 => '../includes/templates/user/add-character-save.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '2936197255c6985d281afa2-71375604',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6985d281ec01_10172664',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6985d281ec01_10172664')) {function content_5c6985d281ec01_10172664($_smarty_tpl) {?><br />

<form action="add-character.php" method="post" class="form">
    <input type="hidden" name="step" value="last">
    <input type="submit" value="Enregistrer" />
</form>
<?php }} ?>