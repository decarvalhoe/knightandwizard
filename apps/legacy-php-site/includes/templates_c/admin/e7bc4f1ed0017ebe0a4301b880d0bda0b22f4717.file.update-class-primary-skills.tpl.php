<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 15:53:29
         compiled from "../includes/templates/admin/update-class-primary-skills.tpl" */ ?>
<?php /*%%SmartyHeaderCode:13860637095b77d9e555ecd2-08258789%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'e7bc4f1ed0017ebe0a4301b880d0bda0b22f4717' => 
    array (
      0 => '../includes/templates/admin/update-class-primary-skills.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '13860637095b77d9e555ecd2-08258789',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b77d9e55b4985_06488472',
  'variables' => 
  array (
    'classArray' => 0,
    'primarySkills' => 0,
    'skill' => 0,
    'primarySkill' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b77d9e55b4985_06488472')) {function content_5b77d9e55b4985_06488472($_smarty_tpl) {?><h1>Ajout de compétences primaires à une classe</h1>

<h2>Classe : <?php echo $_smarty_tpl->tpl_vars['classArray']->value['name'];?>
</h2>

<form action="update-class-primary-skills.php?id=<?php echo $_smarty_tpl->tpl_vars['classArray']->value['id'];?>
" method="post" class="form">
    <?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['primarySkills']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
?>
        <?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>


        <input type="checkbox" name="<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
"
            <?php  $_smarty_tpl->tpl_vars['primarySkill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['primarySkill']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['classArray']->value['primarySkillsArray']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['primarySkill']->key => $_smarty_tpl->tpl_vars['primarySkill']->value){
$_smarty_tpl->tpl_vars['primarySkill']->_loop = true;
?>
                <?php if ($_smarty_tpl->tpl_vars['primarySkill']->value['id']==$_smarty_tpl->tpl_vars['skill']->value['id']){?>checked<?php }?>
            <?php } ?>
        >

        <br />
    <?php } ?>

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>