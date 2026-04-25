<?php /* Smarty version Smarty-3.1.14, created on 2025-04-13 15:22:43
         compiled from "../includes/templates/user/potions-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20207507025c61d0d12acca2-41609296%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '53b1198d7cb0c761488abb9ddae64b2cc0c22def' => 
    array (
      0 => '../includes/templates/user/potions-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20207507025c61d0d12acca2-41609296',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c61d0d12de6c6_49654203',
  'variables' => 
  array (
    'potionsArray' => 0,
    'potion' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c61d0d12de6c6_49654203')) {function content_5c61d0d12de6c6_49654203($_smarty_tpl) {?><h1>Les potions</h1>

<form action="potions-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="name">nom</option>
		<option value="difficulty">difficulté</option>
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
			<th>Ingrédients</th>
			<th>Recette</th>
			<th>Difficulté</th>
			<th>Valeur</th>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['potion'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['potion']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['potionsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['potion']->key => $_smarty_tpl->tpl_vars['potion']->value){
$_smarty_tpl->tpl_vars['potion']->_loop = true;
?>
		<tr>
			<td><?php echo $_smarty_tpl->tpl_vars['potion']->value['name'];?>
</td>
            <td><?php echo $_smarty_tpl->tpl_vars['potion']->value['effect'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['potion']->value['ingredients'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['potion']->value['recipe'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['potion']->value['difficulty'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['potion']->value['value'];?>
</td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>