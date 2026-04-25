<?php /* Smarty version Smarty-3.1.14, created on 2025-07-05 14:33:43
         compiled from "../includes/templates/admin/spells-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:1890212705b13b03ce792c4-38991141%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'bc1b0293ad38fda4a7712245f3338c382a3ae9f3' => 
    array (
      0 => '../includes/templates/admin/spells-list.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1890212705b13b03ce792c4-38991141',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b13b03cef50d1_09349721',
  'variables' => 
  array (
    'spellsListArray' => 0,
    'spell' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b13b03cef50d1_09349721')) {function content_5b13b03cef50d1_09349721($_smarty_tpl) {?><h1>Le Grand Grimoire</h1>

<form action="spells-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="name">nom</option>
		<option value="type_id">type de magie</option>
		<option value="energy">énergie</option>
		<option value="casting_time">TI</option>
		<option value="difficulty">difficulté</option>
        <option value="value">valeur</option>
    </select>

    <input type="submit" value="Trier" />
</form>

<br />

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Type</td>
            <td>Energie</td>
            <td>TI</td>
            <td>Diff.</td>
            <td>Effet</td>
			<td>Valeur</td>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['spell'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['spell']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['spellsListArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['spell']->key => $_smarty_tpl->tpl_vars['spell']->value){
$_smarty_tpl->tpl_vars['spell']->_loop = true;
?>
		<tr class="magic-spell-type-id-<?php echo $_smarty_tpl->tpl_vars['spell']->value['typeId'];?>
">
			<td><?php echo $_smarty_tpl->tpl_vars['spell']->value['name'];?>
</td>
            <td>
				<?php if ($_smarty_tpl->tpl_vars['spell']->value['typeId']==1){?>
					Abjuration
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==2){?>
					Altération
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==3){?>
					Blanche
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==4){?>
					Divinatoire
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==5){?>
					Elémentaire
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==6){?>
					Enchantement
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==7){?>
					Illusion
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==8){?>
					Invocation
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==9){?>
					Naturelle
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==10){?>
					Nécromancie
				<?php }elseif($_smarty_tpl->tpl_vars['spell']->value['typeId']==11){?>
					Noire
				<?php }?>
			</td>
            <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['energy'];?>
</td>
            <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['castingTime'];?>
</td>
            <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['difficulty'];?>
</td>
            <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['effect'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['spell']->value['value'];?>
</td>
			<td><a href="update-spell.php?id=<?php echo $_smarty_tpl->tpl_vars['spell']->value['id'];?>
">Modifier</a></td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>