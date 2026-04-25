<?php /* Smarty version Smarty-3.1.14, created on 2024-11-24 03:59:44
         compiled from "../includes/templates/user/dice-roller.tpl" */ ?>
<?php /*%%SmartyHeaderCode:6500328765c6008c4127c05-58034107%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '3fb0bdf2e6255209c3fef4a209da74cca4763eac' => 
    array (
      0 => '../includes/templates/user/dice-roller.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '6500328765c6008c4127c05-58034107',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6008c4139e29_27773259',
  'variables' => 
  array (
    'test' => 0,
    'numberOfD10' => 0,
    'difficultyD10' => 0,
    'numberOfD20' => 0,
    'difficultyD20' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6008c4139e29_27773259')) {function content_5c6008c4139e29_27773259($_smarty_tpl) {?><h1>Lanceur de d&egrave;s</h1>

<div id="dices-boxes-form">
    <div class="dice-box-form">
        <form action="dice-roller.php?" method="post" class="form">
        	<h2>D10 <?php echo $_smarty_tpl->tpl_vars['test']->value;?>
</h2>

            Nombre de d&egrave;s : <input type="number" name="number-of-d10" value="<?php echo $_smarty_tpl->tpl_vars['numberOfD10']->value;?>
" /><br />
            Difficult&eacute; : <input type="number" name="difficulty" value="<?php echo $_smarty_tpl->tpl_vars['difficultyD10']->value;?>
" /><br />

        	<br />

        	<input type="hidden" name="dice-type" value="d10">
        	<input type="submit" value="Jet" />
        </form>
    </div>

    <div class="last-dice-box-form">
        <form action="dice-roller.php" method="post" class="form">
        	<h2>D20</h2>

            Nombre de d&egrave;s : <input type="number" name="number-of-d20" value="<?php echo $_smarty_tpl->tpl_vars['numberOfD20']->value;?>
" /><br />
            Difficult&eacute; : <input type="number" name="difficulty" value="<?php echo $_smarty_tpl->tpl_vars['difficultyD20']->value;?>
" /><br />

        	<br />

        	<input type="hidden" name="dice-type" value="d20">
        	<input type="submit" value="Jet" />
        </form>
    </div>
</div>
<?php }} ?>