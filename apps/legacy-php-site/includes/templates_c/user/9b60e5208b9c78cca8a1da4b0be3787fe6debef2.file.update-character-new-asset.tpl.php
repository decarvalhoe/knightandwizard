<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 19:00:33
         compiled from "../includes/templates/user/update-character-new-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:17036655625c6278f0637d55-26838612%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '9b60e5208b9c78cca8a1da4b0be3787fe6debef2' => 
    array (
      0 => '../includes/templates/user/update-character-new-asset.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '17036655625c6278f0637d55-26838612',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6278f0696d36_11298751',
  'variables' => 
  array (
    'assetsArray' => 0,
    'asset' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6278f0696d36_11298751')) {function content_5c6278f0696d36_11298751($_smarty_tpl) {?><h2>Nouvel atout</h2>

<form action="update-character.php?update=done" method="post" class="form">
    <table>
    	<thead>
    		<tr>
    			<td></td>
    			<td>Nom</td>
                <td>Points</td>
				<td>Effet</td>
                <td>Activation</td>
				<td>Valeur</td>
    		</tr>
    	</thead>

    	<?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
    		<tr>
    			<td><input type="radio" name="asset-id" value="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
"/></td>
    			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>
</td>
    			<td>
                    <?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==2||$_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>
                        <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" value="0" min="0">
                        <?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>%<?php }?>
                    <?php }?>
                </td>
                <td><?php echo $_smarty_tpl->tpl_vars['asset']->value['effect'];?>
</td>
                <td><?php echo $_smarty_tpl->tpl_vars['asset']->value['activation'];?>
</td>
                <td><?php echo $_smarty_tpl->tpl_vars['asset']->value['value'];?>
</td>
    		</tr>
    	<?php } ?>
    </table>

    <br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="new-asset">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>