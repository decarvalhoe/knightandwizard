<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 16:41:05
         compiled from "../includes/templates/user/update-character-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:11314039515c6278db9a9dd4-77452055%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b41aa063b82623061c37b1bac2dae9125b3a43a1' => 
    array (
      0 => '../includes/templates/user/update-character-asset.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '11314039515c6278db9a9dd4-77452055',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6278db9d4be9_36156312',
  'variables' => 
  array (
    'assetArray' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6278db9d4be9_36156312')) {function content_5c6278db9d4be9_36156312($_smarty_tpl) {?><h1>Modification d'atout</h1>

<form action="update-character.php?update=done" method="post" class="form">

    <?php echo $_smarty_tpl->tpl_vars['assetArray']->value['name'];?>
 : <input type="number" name="asset-points" value="<?php echo $_smarty_tpl->tpl_vars['assetArray']->value['points'];?>
" min="1">

    <br /><br />

    <input type="hidden" name="asset-id" value="<?php echo $_smarty_tpl->tpl_vars['assetArray']->value['id'];?>
">
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="asset">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>