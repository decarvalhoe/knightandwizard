<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:41:16
         compiled from "../includes/templates/user/update-character-skill.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20294925435c6133bdd11842-21490438%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'f5191d37061712a4b948a0b06d34de4fabba2860' => 
    array (
      0 => '../includes/templates/user/update-character-skill.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20294925435c6133bdd11842-21490438',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6133bdd4d4c2_64525436',
  'variables' => 
  array (
    'skillArray' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6133bdd4d4c2_64525436')) {function content_5c6133bdd4d4c2_64525436($_smarty_tpl) {?><h1>Modification de compétence</h1>

<form action="update-character.php?update=done" method="post" class="form">

    <?php echo $_smarty_tpl->tpl_vars['skillArray']->value['name'];?>
 : <input type="number" name="skill-points" value="<?php echo $_smarty_tpl->tpl_vars['skillArray']->value['points'];?>
" min="0">

    <?php if ($_smarty_tpl->tpl_vars['skillArray']->value['isChildOf']==0&&$_smarty_tpl->tpl_vars['Character']->value->orientation['id']!=1){?>
        <br /><br />

        <input type="checkbox" name="isMain" <?php if ($_smarty_tpl->tpl_vars['skillArray']->value['isMain']==1){?>checked<?php }?> value="1"> Compétence primaire
    <?php }?>

    <br /><br />

    <input type="hidden" name="skill-id" value="<?php echo $_smarty_tpl->tpl_vars['skillArray']->value['id'];?>
">
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="skill">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>