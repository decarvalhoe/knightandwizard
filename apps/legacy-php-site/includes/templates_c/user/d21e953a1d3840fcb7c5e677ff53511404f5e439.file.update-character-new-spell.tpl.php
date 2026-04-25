<?php /* Smarty version Smarty-3.1.14, created on 2025-04-18 18:18:53
         compiled from "../includes/templates/user/update-character-new-spell.tpl" */ ?>
<?php /*%%SmartyHeaderCode:7390956085c8e57ff64e829-61392693%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd21e953a1d3840fcb7c5e677ff53511404f5e439' => 
    array (
      0 => '../includes/templates/user/update-character-new-spell.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '7390956085c8e57ff64e829-61392693',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c8e57ff6da4f8_95572820',
  'variables' => 
  array (
    'spellsArray' => 0,
    'spell' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c8e57ff6da4f8_95572820')) {function content_5c8e57ff6da4f8_95572820($_smarty_tpl) {?><h2>Nouveau sort</h2>

<form action="update-character.php?update=done" method="post" class="form">
    <table class="spells-table">
        <tr>
            <td>Nom</td>
			<td>Type</td>
            <td>Energie</td>
            <td>TI</td>
            <td>Diff.</td>
            <td>Effet</td>
        </tr>

        <?php  $_smarty_tpl->tpl_vars['spell'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['spell']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['spellsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['spell']->key => $_smarty_tpl->tpl_vars['spell']->value){
$_smarty_tpl->tpl_vars['spell']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['spell']->key;
?>
            <tr class="magic-spell-type-id-<?php echo $_smarty_tpl->tpl_vars['spell']->value['typeId'];?>
">
                <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['name'];?>
 : <input type="number" class="table-spell-input" name="<?php echo $_smarty_tpl->tpl_vars['spell']->value['id'];?>
" value="0" min="0"></td>
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
            </tr>
        <?php } ?>
    </table>

    <br /><br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="new-spell">
    <input type="submit" value="Terminer" />
</form>
<?php }} ?>