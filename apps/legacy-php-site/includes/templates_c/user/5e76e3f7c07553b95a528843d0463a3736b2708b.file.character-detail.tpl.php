<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:39:20
         compiled from "../includes/templates/user/character-detail.tpl" */ ?>
<?php /*%%SmartyHeaderCode:9202995175c6012b90eb530-93328965%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '5e76e3f7c07553b95a528843d0463a3736b2708b' => 
    array (
      0 => '../includes/templates/user/character-detail.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '9202995175c6012b90eb530-93328965',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6012b92292e9_91389652',
  'variables' => 
  array (
    'Character' => 0,
    'flag_CharacterIsMine' => 0,
    'k' => 0,
    'numberOfSkillsOnLeftColumn' => 0,
    'skill' => 0,
    'leftCol' => 0,
    'i' => 0,
    'asset' => 0,
    'spell' => 0,
    'CharacterOwner' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6012b92292e9_91389652')) {function content_5c6012b92292e9_91389652($_smarty_tpl) {?><h1><?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>
</h1>

<div id="character-detail-profil-img">
    <img class="painting" src="<?php echo $_smarty_tpl->tpl_vars['Character']->value->profilImg;?>
" alt="<?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>
" width="220" height="275"><br />

    <?php if ($_smarty_tpl->tpl_vars['flag_CharacterIsMine']->value=='TRUE'){?>
        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=profil-img" class="update-link">modifier</a>
    <?php }?>
</div>

<?php if ($_smarty_tpl->tpl_vars['flag_CharacterIsMine']->value=='TRUE'){?>
    <form action="character-detail.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
" method="post" class="form" target="_blank">
        <input type="hidden" name="action" value="print-character">
        <input type="submit" style="float:right" value="Imprimer" />
    </form>

    <br />

    <div>
        Status : <?php echo $_smarty_tpl->tpl_vars['Character']->value->status['name'];?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=status" class="update-link"><span class="glyphicon glyphicon-pencil"></span></a>

        <br />

        Lieux :

        <?php if ($_smarty_tpl->tpl_vars['Character']->value->place->id==0){?>
            Indisponible
        <?php }else{ ?>
            <a href="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->place->id;?>
">
                <?php echo $_smarty_tpl->tpl_vars['Character']->value->place->name;?>

            </a>
        <?php }?>

        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=place" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
    </div>

    <h2>Informations</h2>

    <div class="character-detail-2-col-left">
        Nom : <?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=name" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Sexe : <?php echo $_smarty_tpl->tpl_vars['Character']->value->gender['name'];?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=gender" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Race : <?php echo $_smarty_tpl->tpl_vars['Character']->value->race['name'];?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=race" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Orientation : <?php echo $_smarty_tpl->tpl_vars['Character']->value->orientation['name'];?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=orientation" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Classe : <?php echo $_smarty_tpl->tpl_vars['Character']->value->class['name'];?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=class" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Niveau : <?php echo $_smarty_tpl->tpl_vars['Character']->value->level;?>

    </div>

    <div class="character-detail-info-column-right">
        Vitalité : <?php echo $_smarty_tpl->tpl_vars['Character']->value->vitalityMax;?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=vitality-max" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        F. Vitesse : <?php echo $_smarty_tpl->tpl_vars['Character']->value->speedFactor;?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=speed-factor" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        F. Volonté : <?php echo $_smarty_tpl->tpl_vars['Character']->value->willFactor;?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=will-factor" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Energie : <?php echo $_smarty_tpl->tpl_vars['Character']->value->energyMax;?>


        &nbsp;

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=energy-max" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Points : <?php echo $_smarty_tpl->tpl_vars['Character']->value->levelPoints;?>
 / <?php echo $_smarty_tpl->tpl_vars['Character']->value->levelUpAt;?>

    </div>

    <br />

    <div id="character-detail-attributes">
        <h2>Attributs</h2>

        <div class="character-detail-3-col-left">
            Force : <?php echo $_smarty_tpl->tpl_vars['Character']->value->strength;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=strength" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Dextérité : <?php echo $_smarty_tpl->tpl_vars['Character']->value->dexterity;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=dexterity" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Endurance : <?php echo $_smarty_tpl->tpl_vars['Character']->value->stamina;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=stamina" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
        </div>

        <div class="character-detail-3-col-center">
            Esthétisme : <?php echo $_smarty_tpl->tpl_vars['Character']->value->aestheticism;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=aestheticism" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Charisme : <?php echo $_smarty_tpl->tpl_vars['Character']->value->charisma;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=charisma" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Empathie : <?php echo $_smarty_tpl->tpl_vars['Character']->value->empathy;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=empathy" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
        </div>

        <div class="character-detail-3-col-right">
            Intelligence : <?php echo $_smarty_tpl->tpl_vars['Character']->value->intelligence;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=intelligence" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Perception : <?php echo $_smarty_tpl->tpl_vars['Character']->value->perception;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=perception" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Réflexes : <?php echo $_smarty_tpl->tpl_vars['Character']->value->reflexes;?>

            &nbsp;
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=attribute&attribute=reflexes" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
        </div>
    </div>

    <div id="character-detail-skills">
        <h2>Compétences</h2>

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=new-skill" style="float:right"><button>Nouvelle compétence</button></a>

        <br />

        <?php $_smarty_tpl->tpl_vars['leftCol'] = new Smarty_variable(true, null, 0);?>

        <?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['Character']->value->skills; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skill']->key;
?>
            <?php if (($_smarty_tpl->tpl_vars['k']->value<$_smarty_tpl->tpl_vars['numberOfSkillsOnLeftColumn']->value||$_smarty_tpl->tpl_vars['skill']->value['isChildOf']!=0)&&$_smarty_tpl->tpl_vars['leftCol']->value==true){?>
                <div class="character-detail-2-col-left">
            <?php }else{ ?>
                <div class="character-detail-2-col-right">

                <?php $_smarty_tpl->tpl_vars['leftCol'] = new Smarty_variable(false, null, 0);?>
            <?php }?>

            <?php if ($_smarty_tpl->tpl_vars['skill']->value['isChildOf']!=0){?>
                <?php $_smarty_tpl->tpl_vars['i'] = new Smarty_variable(0, null, 0);?>

                <?php while ($_smarty_tpl->tpl_vars['i']->value++<$_smarty_tpl->tpl_vars['skill']->value['level']){?>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                <?php }?>
            <?php }?>

                <?php if ($_smarty_tpl->tpl_vars['skill']->value['isMain']==1){?><b><?php }?>

                <?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>
 : <?php echo $_smarty_tpl->tpl_vars['skill']->value['points'];?>


                <?php if ($_smarty_tpl->tpl_vars['skill']->value['isMain']==1){?></b><?php }?>

                &nbsp;

                <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=skill&skill-id=<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

                &nbsp;

                <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=remove-skill&skill-id=<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
" title="Supprimer">
                    <span class="glyphicon glyphicon-remove"></span>
                </a>

                <br />
            </div>
        <?php } ?>
    </div>

    <div id="character-detail-assets">
        <h2>Atouts</h2>

        <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=new-asset" style="float:right;"><button>Nouvel atout</button></a>

        <br /><br />

        <?php if ($_smarty_tpl->tpl_vars['Character']->value->level!='NA'){?>
            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=new-level-asset" style="float:right;"><button>Nouvel atout de niveau</button></a>

            <br />
        <?php }?>

        <?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['Character']->value->assets; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['asset']->key;
?>
            <?php if ($_smarty_tpl->tpl_vars['k']->value<2){?><div class="character-detail-asset-left"><?php }else{ ?><div class="character-detail-asset-right"><?php }?>
                <?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>


                <?php if ($_smarty_tpl->tpl_vars['asset']->value['points']!=0){?>
                    : <?php echo $_smarty_tpl->tpl_vars['asset']->value['points'];?>


                    <?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>
                        %
                    <?php }?>
                <?php }?>

                <?php if ($_smarty_tpl->tpl_vars['k']->value==0&&$_smarty_tpl->tpl_vars['Character']->value->orientation['id']!=1){?>
                    &nbsp;

                    <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=asset&asset-id=<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
                <?php }?>

                &nbsp;

                <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=remove-asset&asset-id=<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
" title="Supprimer">
                    <span class="glyphicon glyphicon-remove"></span>
                </a>
            </div>
        <?php } ?>
    </div>

    <?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['Character']->value->orientation['id'];?>
<?php $_tmp1=ob_get_clean();?><?php if ($_tmp1==1){?>
        <div id="character-detail-spells">
            <h2>Magie</h2>

            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=new-spell">Ajouter</a>

            <table class="spells-table">
                <thead>
                    <tr>
                        <th>Sort</th>
                        <th>Type</th>
                        <th>Energie</th>
                        <th>TI</th>
                        <th>Diff.</th>
                        <th>Effet</th>
                    </tr>
                </thead>

                <?php  $_smarty_tpl->tpl_vars['spell'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['spell']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['Character']->value->spells; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['spell']->key => $_smarty_tpl->tpl_vars['spell']->value){
$_smarty_tpl->tpl_vars['spell']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['spell']->key;
?>
                    <tr>
                        <td><?php echo $_smarty_tpl->tpl_vars['spell']->value['name'];?>
 : <?php echo $_smarty_tpl->tpl_vars['spell']->value['points'];?>
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
                        <td>
                            <a href="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=spell&spell-id=<?php echo $_smarty_tpl->tpl_vars['spell']->value['id'];?>
" class="update-link">modifier</a>
                        </td>
                    </tr>
                <?php } ?>
            </table>
        </div>
    <?php }?>

    <h2>Notes</h2>

    <form action="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=note" method="post" class="form">
        <textarea name="note" rows="6" cols="143"><?php echo $_smarty_tpl->tpl_vars['Character']->value->note;?>
</textarea>

        <br />

        <input type="submit" style="float:right" value="Noter" />
    </form>

    <br />

    <div class="delete-container">
        <a href="javascript:AlertIt();" class="delete-link">Supprimer ce personnage</a>
    </div>


    <script type="text/javascript">
        function AlertIt() {
            var answer = confirm ("Voulez-vous vraiment supprimer ce personnage ?")

            if (answer)
            window.location="update-character.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
&update=remove";
        }
    </script>
<?php }else{ ?>
    <h2>Informations</h2>

    <div class="character-detail-2-col-left">
        Lieux :

        <?php if ($_smarty_tpl->tpl_vars['Character']->value->place->id==0){?>
            Indisponible
        <?php }else{ ?>
            <a href="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->place->id;?>
">
                <?php echo $_smarty_tpl->tpl_vars['Character']->value->place->name;?>

            </a>

            <br />

            Esthétisme : <?php echo $_smarty_tpl->tpl_vars['Character']->value->aestheticism;?>

        <?php }?>
    </div>

    <div class="character-detail-2-col-right">
        Joueur : <?php echo $_smarty_tpl->tpl_vars['CharacterOwner']->value->name;?>

    </div>
<?php }?>
<?php }} ?>