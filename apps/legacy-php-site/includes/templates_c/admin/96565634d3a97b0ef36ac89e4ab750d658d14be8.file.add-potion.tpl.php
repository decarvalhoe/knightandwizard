<?php /* Smarty version Smarty-3.1.14, created on 2019-07-29 18:38:50
         compiled from "../includes/templates/admin/add-potion.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8071470635d3f211a071410-84757983%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '96565634d3a97b0ef36ac89e4ab750d658d14be8' => 
    array (
      0 => '../includes/templates/admin/add-potion.tpl',
      1 => 1564418260,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8071470635d3f211a071410-84757983',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5d3f211a093da7_69364502',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5d3f211a093da7_69364502')) {function content_5d3f211a093da7_69364502($_smarty_tpl) {?><h1>Ajouter une potion</h1>

<form action="add-potion.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"></textarea>

    <br /><br />

    Ingrédients : <textarea rows="4" cols="50" name="ingredients"></textarea>

    <br /><br />

    Recette : <textarea rows="4" cols="50" name="recipe"></textarea>

    <br /><br />

    Value : <input type="number" name="value" min="1">

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>