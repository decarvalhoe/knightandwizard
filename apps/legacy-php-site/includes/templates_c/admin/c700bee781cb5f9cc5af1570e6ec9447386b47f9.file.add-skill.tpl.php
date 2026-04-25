<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 16:33:45
         compiled from "../includes/templates/admin/add-skill.tpl" */ ?>
<?php /*%%SmartyHeaderCode:7161279195a9c5681294524-81469534%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'c700bee781cb5f9cc5af1570e6ec9447386b47f9' => 
    array (
      0 => '../includes/templates/admin/add-skill.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '7161279195a9c5681294524-81469534',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5a9c56812dfe62_19027676',
  'variables' => 
  array (
    'skillsFamiliesArray' => 0,
    'skillsFamily' => 0,
    'skillsArray' => 0,
    'skill' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5a9c56812dfe62_19027676')) {function content_5a9c56812dfe62_19027676($_smarty_tpl) {?><h1>Ajouter une compétence</h1>

<form action="add-skill.php" method="post" class="form">
    Famille :
    <select name="skillFamilyId">
        <?php  $_smarty_tpl->tpl_vars['skillsFamily'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skillsFamily']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsFamiliesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skillsFamily']->key => $_smarty_tpl->tpl_vars['skillsFamily']->value){
$_smarty_tpl->tpl_vars['skillsFamily']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skillsFamily']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['skillsFamily']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['skillsFamily']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />

    Spécialisation de :
    <select name="childOfId">
        <option value="">Aucune</option>

        <?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skill']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />

    Nom : <input type="text" name="name">

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>