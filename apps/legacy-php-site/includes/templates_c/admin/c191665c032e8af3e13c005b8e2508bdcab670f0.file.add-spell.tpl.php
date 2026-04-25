<?php /* Smarty version Smarty-3.1.14, created on 2025-07-05 14:33:44
         compiled from "../includes/templates/admin/add-spell.tpl" */ ?>
<?php /*%%SmartyHeaderCode:2203983155aea13bd9a6c35-09656850%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'c191665c032e8af3e13c005b8e2508bdcab670f0' => 
    array (
      0 => '../includes/templates/admin/add-spell.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '2203983155aea13bd9a6c35-09656850',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5aea13bd9caf71_70930127',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5aea13bd9caf71_70930127')) {function content_5aea13bd9caf71_70930127($_smarty_tpl) {?><h1>Ajouter un sort</h1>

<form action="add-spell.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"></textarea>

    <br /><br />

    Type :
    <select name="type-id">
        <option value="1">Abjuration</option>
        <option value="2">Altération</option>
        <option value="3">Blanche</option>
        <option value="4">Divinatoire</option>
        <option value="5">Elémentaire</option>
        <option value="6">Enchantement</option>
        <option value="7">Illusion</option>
        <option value="8">Invocation</option>
        <option value="9">Naturelle</option>
        <option value="10">Nécromancie</option>
        <option value="11">Noire</option>
    </select>

    <br /><br />

    Value : <input type="number" name="value" min="1">

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>