<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 10:01:35
         compiled from "../includes/templates/user/update-character-new-level-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20162069075e4bfd5d41d652-97941089%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '0ce85f268d49aee77b6e264975bc9bdb25ae6957' => 
    array (
      0 => '../includes/templates/user/update-character-new-level-asset.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20162069075e4bfd5d41d652-97941089',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5e4bfd5d4dd901_97484445',
  'variables' => 
  array (
    'k' => 0,
    'levelMax' => 0,
    'levelAssetsArray' => 0,
    'levelAsset' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5e4bfd5d4dd901_97484445')) {function content_5e4bfd5d4dd901_97484445($_smarty_tpl) {?><h2>Nouvel atout</h2>

<?php $_smarty_tpl->tpl_vars['k'] = new Smarty_variable(1, null, 0);?>

<form action="update-character.php?update=done" method="post" class="form">
    <?php while ($_smarty_tpl->tpl_vars['k']->value++<$_smarty_tpl->tpl_vars['levelMax']->value){?>
    	<h2>Niveau <?php echo $_smarty_tpl->tpl_vars['k']->value;?>
</h2>

        <table>
        	<thead>
        		<tr>
        			<td></td>
        			<td>Nom</td>
                    <td>Race</td>
                    <td>Orientation</td>
    				<td>Classe</td>
    				<td>Conditions spéciales</td>
    				<td>Effet</td>
        		</tr>
        	</thead>

        	<?php  $_smarty_tpl->tpl_vars['levelAsset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['levelAsset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['levelAssetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['levelAsset']->key => $_smarty_tpl->tpl_vars['levelAsset']->value){
$_smarty_tpl->tpl_vars['levelAsset']->_loop = true;
?>
                <?php if ($_smarty_tpl->tpl_vars['levelAsset']->value['level']==$_smarty_tpl->tpl_vars['k']->value){?>
            		<tr>
            			<td><input type="radio" name="asset-merge-level-id" value="<?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['assetMergeLevelId'];?>
"/></td>
            			<td>
                            <?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['name'];?>


                            <?php if ($_smarty_tpl->tpl_vars['levelAsset']->value['unitId']==2||$_smarty_tpl->tpl_vars['levelAsset']->value['unitId']==3){?>
                                : <?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['points'];?>
<?php if ($_smarty_tpl->tpl_vars['levelAsset']->value['unitId']==3){?>%<?php }?>
                            <?php }?>
                        </td>
                        <td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['race'];?>
</td>
                        <td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['orientation'];?>
</td>
                        <td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['class'];?>
</td>
                        <td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['specialCondition'];?>
</td>
                        <td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['effect'];?>
</td>
            		</tr>
                <?php }?>
        	<?php } ?>
        </table>

        <br />
    <?php }?>

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="new-level-asset">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>