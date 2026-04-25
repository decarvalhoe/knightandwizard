<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:19:08
         compiled from "../includes/templates/user/add-character-name.tpl" */ ?>
<?php /*%%SmartyHeaderCode:12632596695c698627290dc8-77672370%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'e8285c12fc3a6b014200d078f15d860723cd5964' => 
    array (
      0 => '../includes/templates/user/add-character-name.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '12632596695c698627290dc8-77672370',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6986272afac6_59259276',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6986272afac6_59259276')) {function content_5c6986272afac6_59259276($_smarty_tpl) {?><form action="add-character.php" method="post" class="form">
    <h2>Nom</h2>

    <input type="text" name="name">

    <br /><br />
    
    <input type="hidden" name="step" value="save">
    <input type="submit" value="Terminer" />
</form>
<?php }} ?>