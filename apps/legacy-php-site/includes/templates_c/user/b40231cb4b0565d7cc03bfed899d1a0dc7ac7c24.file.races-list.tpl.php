<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:50:36
         compiled from "../includes/templates/user/races-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:10235303405c626e6581e914-00481987%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b40231cb4b0565d7cc03bfed899d1a0dc7ac7c24' => 
    array (
      0 => '../includes/templates/user/races-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '10235303405c626e6581e914-00481987',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c626e658887e0_69599972',
  'variables' => 
  array (
    'order' => 0,
    'racesArray' => 0,
    'race' => 0,
    'k' => 0,
    'asset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c626e658887e0_69599972')) {function content_5c626e658887e0_69599972($_smarty_tpl) {?><h2>Bestiaire</h2>

<form action="races-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="category" <?php if ($_smarty_tpl->tpl_vars['order']->value=='category'){?>selected<?php }?>>catégorie</option>
		<option value="name" <?php if ($_smarty_tpl->tpl_vars['order']->value=='name'){?>selected<?php }?>>nom</option>
		<option value="vitality" <?php if ($_smarty_tpl->tpl_vars['order']->value=='vitality'){?>selected<?php }?>>vitalité</option>
		<option value="speed_factor" <?php if ($_smarty_tpl->tpl_vars['order']->value=='speed_factor'){?>selected<?php }?>>F. vitesse</option>
		<option value="will_factor" <?php if ($_smarty_tpl->tpl_vars['order']->value=='will_factor'){?>selected<?php }?>>F. volonté</option>
		<option value="strength_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='strength_max'){?>selected<?php }?>>force max.</option>
		<option value="dexterity_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='dexterity_max'){?>selected<?php }?>>dextérité max.</option>
		<option value="stamina_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='stamina_max'){?>selected<?php }?>>endurance max.</option>
		<option value="aestheticism_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='aestheticism_max'){?>selected<?php }?>>esthétisme max.</option>
		<option value="reflexes_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='reflexes_max'){?>selected<?php }?>>reflexes max.</option>
		<option value="charisma_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='charisma_max'){?>selected<?php }?>>charisme max.</option>
		<option value="empathy_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='empathy_max'){?>selected<?php }?>>empathie max.</option>
		<option value="intelligence_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='intelligence_max'){?>selected<?php }?>>intelligence max.</option>
		<option value="perception_max" <?php if ($_smarty_tpl->tpl_vars['order']->value=='perception_max'){?>selected<?php }?>>perception max.</option>
    </select>

    <input type="submit" value="Trier" />
</form>

<br />

<table id="races-list">
	<thead>
		<tr>
			<th style="width: 65px;">Nom</th>
			<th style="width: 63px;">Catégorie</th>
			<th style="width: 49px;">Vitalité</th>
			<th style="width: 47px;">F. Vitesse</th>
			<th style="width: 51px;">F. Volonté</th>
			<th style="width: 36px;">Force max</th>
			<th style="width: 61px;">Dextérité max</th>
			<th style="width: 70px;">Endurance max</th>
			<th style="width: 71px;">Esthétisme max</th>
			<th style="width: 63px;">Charisme max</th>
			<th style="width: 63px;">Empathie max</th>
			<th style="width: 78px;">Intelligence max</th>
			<th style="width: 70px;">Perception max</th>
			<th style="width: 54px;">Reflexes max</th>
			<th style="width: 182px;">Atouts</th>
		</tr>
	</thead>

	<tbody>
		<?php  $_smarty_tpl->tpl_vars['race'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['race']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['racesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['race']->key => $_smarty_tpl->tpl_vars['race']->value){
$_smarty_tpl->tpl_vars['race']->_loop = true;
?>
			<tr>
				<td class="text-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['name'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['category'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['vitality'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['speedFactor'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['willFactor'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['strengthMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['dexterityMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['staminaMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['aestheticismMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['charismaMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['empathyMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['intelligenceMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['perceptionMax'];?>
</td>
				<td class="num-cell" style="text-align: center;"><?php echo $_smarty_tpl->tpl_vars['race']->value['reflexesMax'];?>
</td>
				<td class="text-cell">
					<?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['race']->value['assets']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['asset']->key;
?>
						<?php if ($_smarty_tpl->tpl_vars['k']->value>0){?>
							<br />
						<?php }?>

						<?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>

					<?php } ?>
				</td>
			</tr>
		<?php } ?>
	</tbody>
</table>

<table id="header-fixed"></table>


	<script language=javascript>
		var tableOffset = $("#races-list").offset().top;
		var $header = $("#races-list > thead").clone();
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