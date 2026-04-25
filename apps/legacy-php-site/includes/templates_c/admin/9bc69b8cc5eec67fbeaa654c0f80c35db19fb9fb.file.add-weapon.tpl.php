<?php /* Smarty version Smarty-3.1.14, created on 2020-08-18 19:58:44
         compiled from "../includes/templates/admin/add-weapon.tpl" */ ?>
<?php /*%%SmartyHeaderCode:10349081245f3c16d43cbcc7-85267728%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '9bc69b8cc5eec67fbeaa654c0f80c35db19fb9fb' => 
    array (
      0 => '../includes/templates/admin/add-weapon.tpl',
      1 => 1597773387,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '10349081245f3c16d43cbcc7-85267728',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5f3c16d43da990_24685334',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5f3c16d43da990_24685334')) {function content_5f3c16d43da990_24685334($_smarty_tpl) {?><h1>Ajouter une arme</h1>

<form action="add-weapon.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Dommage : <input type="number" name="dammage" min="0">

    <br /><br />

    Jet de force :

    <select name="use-strength">
        <option value="1">Oui</option>
        <option value="0">Non</option>
    </select>

    <br /><br />

    Type de dégâts :

    <select name="dammage-type">
        <option value="P">Perforant</option>
        <option value="E">Energie</option>
        <option value="C">Contondant</option>
        <option value="T">Tranchant</option>
    </select>

    <br /><br />

    Difficulté : <input type="number" name="difficulty" min="1">

    <br /><br />

    Poids : <input type="number" name="weight" min="0" step="0.01"> (ex. 1, 1.2, 1.9, ...)

    <br /><br />

    Spécial : <textarea rows="4" cols="50" name="special"></textarea>

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>