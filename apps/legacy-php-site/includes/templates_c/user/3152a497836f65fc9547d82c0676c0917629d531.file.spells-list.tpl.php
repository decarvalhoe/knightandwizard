<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:53:34
         compiled from "../includes/templates/user/spells-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8555440985c61c09f4bb500-89537364%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '3152a497836f65fc9547d82c0676c0917629d531' => 
    array (
      0 => '../includes/templates/user/spells-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8555440985c61c09f4bb500-89537364',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c61c09f50ebd2_97643015',
  'variables' => 
  array (
    'spellsListArray' => 0,
    'spell' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c61c09f50ebd2_97643015')) {function content_5c61c09f50ebd2_97643015($_smarty_tpl) {?><h1>Le Grand Grimoire</h1>

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

<table id="spells-list">
	<thead>
		<tr>
			<th style="width: 178px;">Nom</th>
			<th style="width: 97px;">Type</th>
            <th style="width: 50px;">Energie</th>
            <th style="width: 28px;">TI</th>
            <th style="width: 32px;">Diff.</th>
            <th style="width: 595px;">Effet</th>
			<th style="width: 43px;">Valeur</th>
		</tr>
	</thead>

	<tbody>
		<?php  $_smarty_tpl->tpl_vars['spell'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['spell']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['spellsListArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['spell']->key => $_smarty_tpl->tpl_vars['spell']->value){
$_smarty_tpl->tpl_vars['spell']->_loop = true;
?>
			<tr class="magic-spell-type-id-<?php echo $_smarty_tpl->tpl_vars['spell']->value['typeId'];?>
">
				<td><?php echo $_smarty_tpl->tpl_vars['spell']->value['name'];?>
</td>
	            <td style="text-align: center;">
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
	            <td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['spell']->value['energy'];?>
</td>
	            <td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['spell']->value['castingTime'];?>
</td>
	            <td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['spell']->value['difficulty'];?>
</td>
	            <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['effect'];?>
</td>
				<td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['spell']->value['value'];?>
</td>
			</tr>
		<?php } ?>
	</tbody>
</table>

<table id="header-fixed"></table>


	<script language=javascript>
		var tableOffset = $("#spells-list").offset().top;
		var $header = $("#spells-list > thead").clone();
		var $fixedHeader = $("#header-fixed").append($header);

		$(window).bind("scroll", function() {
		    var offset = $(this).scrollTop();

		    if (offset >= tableOffset && $fixedHeader.is(":hidden")) {
		        $fixedHeader.show();
		    }
		    else if (offset < tableOffset) {
		        $fixedHeader.hide();
		    }
		});
    </script>

<?php }} ?>