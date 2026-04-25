<?php /* Smarty version Smarty-3.1.14, created on 2025-07-05 14:50:16
         compiled from "../includes/templates/admin/update-spell.tpl" */ ?>
<?php /*%%SmartyHeaderCode:14899571675b13b2d8c57f93-98260425%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '84cbbf830c61871b60e8d288573353ebff128c75' => 
    array (
      0 => '../includes/templates/admin/update-spell.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '14899571675b13b2d8c57f93-98260425',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b13b2d8ca2198_19398084',
  'variables' => 
  array (
    'spellArray' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b13b2d8ca2198_19398084')) {function content_5b13b2d8ca2198_19398084($_smarty_tpl) {?><h1>Modifier un sort</h1>

<form action="update-spell.php?id=<?php echo $_smarty_tpl->tpl_vars['spellArray']->value['id'];?>
" method="post" class="form">
    Nom : <input type="text" name="name" value="<?php echo $_smarty_tpl->tpl_vars['spellArray']->value['name'];?>
">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"><?php echo $_smarty_tpl->tpl_vars['spellArray']->value['effect'];?>
</textarea>

    <br /><br />

    Type :
    <select name="type-id">
        <option value="1" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==1){?>selected<?php }?>>Abjuration</option>
        <option value="2" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==2){?>selected<?php }?>>Altération</option>
        <option value="3" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==3){?>selected<?php }?>>Blanche</option>
        <option value="4" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==4){?>selected<?php }?>>Divinatoire</option>
        <option value="5" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==5){?>selected<?php }?>>Elémentaire</option>
        <option value="6" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==6){?>selected<?php }?>>Enchantement</option>
        <option value="7" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==7){?>selected<?php }?>>Illusion</option>
        <option value="8" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==8){?>selected<?php }?>>Invocation</option>
        <option value="9" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==9){?>selected<?php }?>>Naturelle</option>
        <option value="10" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==10){?>selected<?php }?>>Nécromancie</option>
        <option value="11" <?php if ($_smarty_tpl->tpl_vars['spellArray']->value['typeId']==11){?>selected<?php }?>>Noire</option>
    </select>

    <br /><br />

    Valeur : <input type="number" name="value" min="1" value="<?php echo $_smarty_tpl->tpl_vars['spellArray']->value['value'];?>
">

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>