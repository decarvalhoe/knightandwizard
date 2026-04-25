<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:51:24
         compiled from "../includes/templates/user/skills-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:6588032835c6481a81e0912-07125452%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '393109999fc313d8031097348bfbbfdcf4d9f2f3' => 
    array (
      0 => '../includes/templates/user/skills-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '6588032835c6481a81e0912-07125452',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6481a823e7d7_66749476',
  'variables' => 
  array (
    'skillsArray' => 0,
    'skillsFamilyArray' => 0,
    'skill' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6481a823e7d7_66749476')) {function content_5c6481a823e7d7_66749476($_smarty_tpl) {?><h2>Liste des compétences</h2>

<?php  $_smarty_tpl->tpl_vars['skillsFamilyArray'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skillsFamilyArray']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skillsFamilyArray']->key => $_smarty_tpl->tpl_vars['skillsFamilyArray']->value){
$_smarty_tpl->tpl_vars['skillsFamilyArray']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skillsFamilyArray']->key;
?>
    <h3><?php echo $_smarty_tpl->tpl_vars['skillsFamilyArray']->value['0']['familyName'];?>
</h3>

    <?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsFamilyArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skill']->key;
?>
        <?php $_smarty_tpl->tpl_vars['i'] = new Smarty_Variable;$_smarty_tpl->tpl_vars['i']->step = 1;$_smarty_tpl->tpl_vars['i']->total = (int)ceil(($_smarty_tpl->tpl_vars['i']->step > 0 ? $_smarty_tpl->tpl_vars['skill']->value['level']+1 - (1) : 1-($_smarty_tpl->tpl_vars['skill']->value['level'])+1)/abs($_smarty_tpl->tpl_vars['i']->step));
if ($_smarty_tpl->tpl_vars['i']->total > 0){
for ($_smarty_tpl->tpl_vars['i']->value = 1, $_smarty_tpl->tpl_vars['i']->iteration = 1;$_smarty_tpl->tpl_vars['i']->iteration <= $_smarty_tpl->tpl_vars['i']->total;$_smarty_tpl->tpl_vars['i']->value += $_smarty_tpl->tpl_vars['i']->step, $_smarty_tpl->tpl_vars['i']->iteration++){
$_smarty_tpl->tpl_vars['i']->first = $_smarty_tpl->tpl_vars['i']->iteration == 1;$_smarty_tpl->tpl_vars['i']->last = $_smarty_tpl->tpl_vars['i']->iteration == $_smarty_tpl->tpl_vars['i']->total;?>
            &nbsp;&nbsp;&nbsp;&nbsp;
        <?php }} ?>

        <?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>


        <br />
    <?php } ?>
<?php } ?>
<?php }} ?>