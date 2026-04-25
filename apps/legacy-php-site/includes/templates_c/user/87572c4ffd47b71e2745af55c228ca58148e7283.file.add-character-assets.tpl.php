<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:18:59
         compiled from "../includes/templates/user/add-character-assets.tpl" */ ?>
<?php /*%%SmartyHeaderCode:4980323685c8d33d9dba840-57613260%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '87572c4ffd47b71e2745af55c228ca58148e7283' => 
    array (
      0 => '../includes/templates/user/add-character-assets.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '4980323685c8d33d9dba840-57613260',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c8d33d9e56f85_35495821',
  'variables' => 
  array (
    'levelProcessing' => 0,
    'k' => 0,
    'levelMax' => 0,
    'levelAssetsArray' => 0,
    'levelAsset' => 0,
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c8d33d9e56f85_35495821')) {function content_5c8d33d9e56f85_35495821($_smarty_tpl) {?><h2>Sélectionner un atouts de niveau <?php echo $_smarty_tpl->tpl_vars['levelProcessing']->value;?>
</h2>

<?php $_smarty_tpl->tpl_vars['k'] = new Smarty_variable(1, null, 0);?>

<form action="add-character.php" method="post" class="form">
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
            			<td><input type="radio" name="levelAssetId" value="<?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['id'];?>
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

    <input type="checkbox" name="random" value="TRUE"> Aléatoire

    <br /><br />

    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="hidden" name="levelProcessing" value="<?php echo $_smarty_tpl->tpl_vars['levelProcessing']->value;?>
">
    <input type="submit" value="Suivant" />
</form>
<?php }} ?>