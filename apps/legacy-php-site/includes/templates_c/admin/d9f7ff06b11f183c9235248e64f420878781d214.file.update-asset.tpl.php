<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 17:29:15
         compiled from "../includes/templates/admin/update-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:18133503795b2b5de1ae3b73-03600243%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd9f7ff06b11f183c9235248e64f420878781d214' => 
    array (
      0 => '../includes/templates/admin/update-asset.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18133503795b2b5de1ae3b73-03600243',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b2b5de1b62667_79745439',
  'variables' => 
  array (
    'assetArray' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b2b5de1b62667_79745439')) {function content_5b2b5de1b62667_79745439($_smarty_tpl) {?><h1>Modifier un atout</h1>

<form action="update-asset.php?id=<?php echo $_smarty_tpl->tpl_vars['assetArray']->value['id'];?>
" method="post" class="form">
    Nom : <input type="text" name="name" value="<?php echo $_smarty_tpl->tpl_vars['assetArray']->value['name'];?>
">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"><?php echo $_smarty_tpl->tpl_vars['assetArray']->value['effect'];?>
</textarea>

    <br /><br />

    Activation :
    <select name="activation">
        <option value="0" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['activation']==0){?>selected<?php }?>>Permanent</option>
        <option value="1" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['activation']==1){?>selected<?php }?>>Ephémère</option>
    </select>

    <br /><br />

    Unité :
    <select name="unit-id">
        <option value="1" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==1){?>selected<?php }?>>Aucune</option>
        <option value="2" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==2){?>selected<?php }?>>Point</option>
        <option value="3" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==3){?>selected<?php }?>>%</option>
        <option value="4" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==4){?>selected<?php }?>>Niveau</option>
    </select>

    <br /><br />

    Valeur : <input type="number" name="value" value="<?php echo $_smarty_tpl->tpl_vars['assetArray']->value['value'];?>
">

    <br /><br />

    <input type="checkbox" name="is-orientation-asset" value="TRUE" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['isOrientationAsset']==1){?>checked<?php }?>> Atout d'orientation

    <br />

    <input type="checkbox" name="is-class-asset" value="TRUE" <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['isClassAsset']==1){?>checked<?php }?>> Atout de classe

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>