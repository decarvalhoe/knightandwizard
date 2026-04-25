<?php /* Smarty version Smarty-3.1.14, created on 2024-11-10 15:19:19
         compiled from "../includes/templates/user/assets-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:10234168545c60658609d544-37459961%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '38b04a85d3586592ba7302abcd667483501d9521' => 
    array (
      0 => '../includes/templates/user/assets-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '10234168545c60658609d544-37459961',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6065860cf669_95681611',
  'variables' => 
  array (
    'assetsArray' => 0,
    'asset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6065860cf669_95681611')) {function content_5c6065860cf669_95681611($_smarty_tpl) {?><h2>Liste d'atouts</h2>

<a href="levels-assets-list.php">Atouts de niveaux</a>

<br />
<br />

<form action="assets-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="name">nom</option>
        <option value="value">valeur</option>
    </select>

    <input type="submit" value="Trier" />
</form>

<br />

<table>
	<thead>
		<tr>
			<th>Nom</th>
			<th>Effet</th>
			<th>Valeur</th>
			<th>Activation</th>
			<th>Type</th>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
		<tr>
			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['effect'];?>
</td>
            <td><?php echo $_smarty_tpl->tpl_vars['asset']->value['value'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['activation'];?>
</td>
			<td>
				<?php if ($_smarty_tpl->tpl_vars['asset']->value['isOrientationAsset']==1){?>
					Orientation
				<?php }elseif($_smarty_tpl->tpl_vars['asset']->value['isClassAsset']==1){?>
					Classe
				<?php }else{ ?>
					Neutre
				<?php }?>
			</td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>