<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 22:22:58
         compiled from "../includes/templates/user/weapons-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:2729197005f3d83c42a31f1-61440324%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '9e32dc2d386e2ea316efb0305c5bc743bcdaad68' => 
    array (
      0 => '../includes/templates/user/weapons-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '2729197005f3d83c42a31f1-61440324',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5f3d83c431ced7_99781376',
  'variables' => 
  array (
    'weaponsListArray' => 0,
    'Weapon' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5f3d83c431ced7_99781376')) {function content_5f3d83c431ced7_99781376($_smarty_tpl) {?><h1>Armes</h1>

<table id="weapons-list">
	<thead>
		<tr>
			<th style="width: 300px;">Nom</th>
			<th style="width: 50px;">D&eacute;g&acirc;ts</th>
            <th style="width: 50px;">Type</th>
            <th style="width: 50px;">Diff.</th>
            <th style="width: 50px;">Poids</th>
            <th style="width: 523px;">Sp&eacute;cial</th>
		</tr>
	</thead>

	<tbody>
		<?php  $_smarty_tpl->tpl_vars['Weapon'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Weapon']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['weaponsListArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Weapon']->key => $_smarty_tpl->tpl_vars['Weapon']->value){
$_smarty_tpl->tpl_vars['Weapon']->_loop = true;
?>
			<tr>
				<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->name;?>
</td>
				<td style="text-align: center;">
					<?php if ($_smarty_tpl->tpl_vars['Weapon']->value->useStrength==1){?>
						<?php if ($_smarty_tpl->tpl_vars['Weapon']->value->dammage>=1){?>
							F+<?php echo $_smarty_tpl->tpl_vars['Weapon']->value->dammage;?>

						<?php }else{ ?>
							F
						<?php }?>
					<?php }else{ ?>
						<?php echo $_smarty_tpl->tpl_vars['Weapon']->value->dammage;?>

					<?php }?>
				</td>
				<td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->dammageType;?>
</td>
				<td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->difficulty;?>
</td>
				<td style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->weight;?>
</td>
				<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->special;?>
</td>
			</tr>
		<?php } ?>
	</tbody>
</table>

<table id="header-fixed"></table>


	<script language=javascript>
		var tableOffset = $("#weapons-list").offset().top;
		var $header = $("#weapons-list > thead").clone();
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