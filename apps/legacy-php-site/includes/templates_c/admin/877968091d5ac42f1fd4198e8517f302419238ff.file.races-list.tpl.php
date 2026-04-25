<?php /* Smarty version Smarty-3.1.14, created on 2025-12-12 15:02:39
         compiled from "../includes/templates/admin/races-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8397199895b2ffbac1a4077-33465293%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '877968091d5ac42f1fd4198e8517f302419238ff' => 
    array (
      0 => '../includes/templates/admin/races-list.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8397199895b2ffbac1a4077-33465293',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b2ffbac236127_00506818',
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
<?php if ($_valid && !is_callable('content_5b2ffbac236127_00506818')) {function content_5b2ffbac236127_00506818($_smarty_tpl) {?><h2>Bestiaire</h2>

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

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Catégorie</td>
			<td>Vitalité</td>
			<td>F. Vitesse</td>
			<td>F. Volonté</td>
			<td>Force max</td>
			<td>Dextérité max</td>
			<td>Endurance max</td>
			<td>Esthétisme max</td>
			<td>Charisme max</td>
			<td>Empathie max</td>
			<td>Intelligence max</td>
			<td>Perception max</td>
			<td>Reflexes max</td>
			<td>Atouts</td>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['race'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['race']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['racesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['race']->key => $_smarty_tpl->tpl_vars['race']->value){
$_smarty_tpl->tpl_vars['race']->_loop = true;
?>
		<tr>
			<td class="text-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['name'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['category'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['vitality'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['speedFactor'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['willFactor'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['strengthMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['dexterityMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['staminaMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['aestheticismMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['charismaMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['empathyMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['intelligenceMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['perceptionMax'];?>
</td>
			<td class="num-cell"><?php echo $_smarty_tpl->tpl_vars['race']->value['reflexesMax'];?>
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
						,&nbsp;
					<?php }?>

					<?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>


					<?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==2){?>
						<?php echo $_smarty_tpl->tpl_vars['asset']->value['points'];?>

					<?php }elseif($_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>
						<?php echo $_smarty_tpl->tpl_vars['asset']->value['points'];?>
 %
					<?php }?>
				<?php } ?>
			</td>
			<td><a href="update-race.php?id=<?php echo $_smarty_tpl->tpl_vars['race']->value['id'];?>
">Modifier</a></td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>