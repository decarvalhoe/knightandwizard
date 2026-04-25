<?php /* Smarty version Smarty-3.1.14, created on 2025-08-15 16:53:12
         compiled from "../includes/templates/admin/update-skill.tpl" */ ?>
<?php /*%%SmartyHeaderCode:4890079485b241235074212-76688465%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '16c219bc5640b0a991ba995a9f534e84bcb670ed' => 
    array (
      0 => '../includes/templates/admin/update-skill.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '4890079485b241235074212-76688465',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b2412350d3100_10299449',
  'variables' => 
  array (
    'skillArray' => 0,
    'skillsFamiliesArray' => 0,
    'skillsFamily' => 0,
    'skillsArray' => 0,
    'skill' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b2412350d3100_10299449')) {function content_5b2412350d3100_10299449($_smarty_tpl) {?><h1>Modifier une compétence</h1>

<form action="update-skill.php?id=<?php echo $_smarty_tpl->tpl_vars['skillArray']->value['id'];?>
" method="post" class="form">
    Nom : <input type="text" name="name" value="<?php echo $_smarty_tpl->tpl_vars['skillArray']->value['name'];?>
"><br />

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
" <?php if ($_smarty_tpl->tpl_vars['skillArray']->value['familyId']==$_smarty_tpl->tpl_vars['skillsFamily']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['skillsFamily']->value['name'];?>
</option>
        <?php } ?>
    </select><br />

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
" <?php if ($_smarty_tpl->tpl_vars['skillArray']->value['isChildOf']==$_smarty_tpl->tpl_vars['skill']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>
</option>
        <?php } ?>
    </select>



    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>