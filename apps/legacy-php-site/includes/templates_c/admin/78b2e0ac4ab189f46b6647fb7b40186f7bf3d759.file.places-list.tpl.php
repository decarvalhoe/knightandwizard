<?php /* Smarty version Smarty-3.1.14, created on 2020-06-22 19:00:03
         compiled from "../includes/templates/admin/places-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8495112865c59f1f7bab684-47389294%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '78b2e0ac4ab189f46b6647fb7b40186f7bf3d759' => 
    array (
      0 => '../includes/templates/admin/places-list.tpl',
      1 => 1590516481,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8495112865c59f1f7bab684-47389294',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c59f1f7c1fbf4_41059322',
  'variables' => 
  array (
    'PlacesArray' => 0,
    'Place' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c59f1f7c1fbf4_41059322')) {function content_5c59f1f7c1fbf4_41059322($_smarty_tpl) {?><h2>Liste des lieux</h2>

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Status</td>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['Place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Place']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['PlacesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Place']->key => $_smarty_tpl->tpl_vars['Place']->value){
$_smarty_tpl->tpl_vars['Place']->_loop = true;
?>
		<tr>
			<td><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
</td>
			<td>
                <?php if ($_smarty_tpl->tpl_vars['Place']->value->status['id']==1){?>
                    Pays
                <?php }elseif($_smarty_tpl->tpl_vars['Place']->value->status['id']==2){?>
                    Ville
                <?php }elseif($_smarty_tpl->tpl_vars['Place']->value->status['id']==3){?>
                    Village
                <?php }elseif($_smarty_tpl->tpl_vars['Place']->value->status['id']==4){?>
                    Lieu
				<?php }elseif($_smarty_tpl->tpl_vars['Place']->value->status['id']==5){?>
                    Montagne
                <?php }?>
            </td>
            <td>
                <a href="update-place.php?id=<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
" class="update-link">
                    modifier
                </a>
            </td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>