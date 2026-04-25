<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:41:01
         compiled from "../includes/templates/user/update-character-spell.tpl" */ ?>
<?php /*%%SmartyHeaderCode:9018310235cd43cb80a4613-17758686%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '9cd562ff0ce6639afcffde3b5b1d23b368c7bfa5' => 
    array (
      0 => '../includes/templates/user/update-character-spell.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '9018310235cd43cb80a4613-17758686',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5cd43cb8102b41_91266554',
  'variables' => 
  array (
    'spellArray' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5cd43cb8102b41_91266554')) {function content_5cd43cb8102b41_91266554($_smarty_tpl) {?><h1>Modification de sort</h1>

<form action="update-character.php?update=done" method="post" class="form">

    <?php echo $_smarty_tpl->tpl_vars['spellArray']->value['name'];?>
 : <input type="number" name="spell-points" value="<?php echo $_smarty_tpl->tpl_vars['spellArray']->value['points'];?>
" min="0">

    <br /><br />

    <input type="hidden" name="spell-id" value="<?php echo $_smarty_tpl->tpl_vars['spellArray']->value['id'];?>
">
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="spell">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>