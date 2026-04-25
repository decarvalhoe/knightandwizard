<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 15:15:03
         compiled from "../includes/templates/user/update-character-speed-factor.tpl" */ ?>
<?php /*%%SmartyHeaderCode:3434251045d42c6fdb31e55-90810238%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '905f3884d72f29e3e465ad0a4a33e2b433ab8314' => 
    array (
      0 => '../includes/templates/user/update-character-speed-factor.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3434251045d42c6fdb31e55-90810238',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5d42c6fdb931c4_43108488',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5d42c6fdb931c4_43108488')) {function content_5d42c6fdb931c4_43108488($_smarty_tpl) {?><h2>Modification du facteur de vitesse</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Facteur de vitesse : <input type="number" name="speed-factor-points" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->speedFactor;?>
" min="1">

    <br /><br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="speed-factor">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>