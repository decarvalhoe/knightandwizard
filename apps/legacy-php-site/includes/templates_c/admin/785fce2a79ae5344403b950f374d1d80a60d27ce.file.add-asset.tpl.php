<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:25:50
         compiled from "../includes/templates/admin/add-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:543896325b2a38e0efcf49-28331742%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '785fce2a79ae5344403b950f374d1d80a60d27ce' => 
    array (
      0 => '../includes/templates/admin/add-asset.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '543896325b2a38e0efcf49-28331742',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b2a38e0f18be6_38465059',
  'variables' => 
  array (
    'orientationsArray' => 0,
    'orientation' => 0,
    'classesArray' => 0,
    'class' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b2a38e0f18be6_38465059')) {function content_5b2a38e0f18be6_38465059($_smarty_tpl) {?><h1>Ajouter un atout</h1>

<form action="add-asset.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"></textarea>

    <br /><br />

    Activation :
    <select name="activation">
        <option value="0">Permanent</option>
        <option value="1">Ephémère</option>
    </select>

    <br /><br />

    Unité :
    <select name="unit-id">
        <option value="1">Aucune</option>
        <option value="2">Point</option>
        <option value="3">%</option>
        <option value="4">Niveau</option>
    </select>

    <br /><br />

    Valeur : <input type="number" name="value">

    <br /><br />

    <input type="checkbox" name="is-orientation-asset" value="TRUE"> Atout d'orientation

    <br />

    Orientation :
    <select name="orientation-id">
        <option value="">Aucune</option>

        <?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['orientationsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['orientation']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['orientation']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />
    <br />

    <input type="checkbox" name="is-class-asset" value="TRUE"> Atout de classe

    <br />

    Classe :
    <select name="class-id">
        <option value="">Aucune</option>

        <?php  $_smarty_tpl->tpl_vars['class'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['class']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['classesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['class']->key => $_smarty_tpl->tpl_vars['class']->value){
$_smarty_tpl->tpl_vars['class']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['class']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['class']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['class']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>