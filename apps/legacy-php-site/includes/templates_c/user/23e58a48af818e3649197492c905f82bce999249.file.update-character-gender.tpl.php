<?php /* Smarty version Smarty-3.1.14, created on 2019-09-16 13:06:05
         compiled from "../includes/templates/user/update-character-gender.tpl" */ ?>
<?php /*%%SmartyHeaderCode:14954338775d7f6c9d1402d4-85504288%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '23e58a48af818e3649197492c905f82bce999249' => 
    array (
      0 => '../includes/templates/user/update-character-gender.tpl',
      1 => 1539199739,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '14954338775d7f6c9d1402d4-85504288',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'gendersArray' => 0,
    'gender' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5d7f6c9d18bb78_02956091',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5d7f6c9d18bb78_02956091')) {function content_5d7f6c9d18bb78_02956091($_smarty_tpl) {?><h1>Modification du genre du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Genre :
    <select name="genderId">
        <?php  $_smarty_tpl->tpl_vars['gender'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['gender']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['gendersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['gender']->key => $_smarty_tpl->tpl_vars['gender']->value){
$_smarty_tpl->tpl_vars['gender']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['gender']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['gender']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['gender']->value['id']==$_smarty_tpl->tpl_vars['Character']->value->gender['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['gender']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="gender">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>