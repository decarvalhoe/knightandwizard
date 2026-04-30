# D13 — Rôles & passation MJ↔PJ (dernier domaine Phase 1)

> Formalisation globale du pattern **mode arbitre** récurrent dans D1-D12 (humain libre / LLM contextuel / auto strict). Définition des 4 rôles canoniques (`player`, `human_gm`, `llm`, `auto`), de leurs pouvoirs/limites, des passations entre eux, des modes de session (multi-MJ, solo, async, no-MJ), et de l'audit/arbitrage. Tous traités en mode hybride règle vivante (pattern D), validés en batch par l'auteur.

**Sources** :
- D11 R-11.1, R-11.2, R-11.15 (architecture contrôle PNJ)
- D11 R-11.18 (personnalité PNJ pour LLM, modes mémoire)
- D9 R-9.34 (modes tour-par-tour vs temps réel)
- D7 R-7.20/21 (machine d'état mort/résurrection)
- Pattern transversal D1-D12 : presque toutes les règles ont un bloc « Application par mode arbitre »

**Décisions amont structurantes** :
- **R-11.1** : 4 contrôleurs canoniques `player | human_gm | llm | auto`.
- **R-11.2** : flag `is_player_character` mutable.
- **R-11.15** : hiérarchie + bascule + fallback + audit pour PNJ. **D13 généralise au PJ et à la session globale**.
- **Méta-principe règles vivantes** : tout est éditable, versionné, migrable.

---

## Partie A — Quatre rôles canoniques formalisés

### R-13.1 — Définition exhaustive des 4 rôles

**Décision Q-D13.1 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
role_player:
  description: "Joueur humain incarnant un PJ ou délégué de PNJ"
  decisions_allowed:
    - declare_action_for_pj
    - manage_pj_inventory
    - declare_action_for_delegated_pnj
    - vote_in_party_decisions
    - propose_narrative_actions
  decisions_forbidden:
    - alter_world_state_directly      # passe par le MJ
    - control_other_players_pjs       # sauf consentement
    - access_hidden_information       # MJ filtre
  permissions:
    - read_pj_full_state
    - read_party_state
    - read_visible_world
    - propose_dice_rolls
    - request_clarifications

role_human_gm:
  description: "Maître de jeu humain, responsable de la narration et des arbitrages"
  decisions_allowed:
    - all_world_state_changes
    - control_all_pnj
    - override_any_rule
    - resolve_ambiguities
    - declare_dice_outcomes
    - veto_player_action
    - bend_rules_for_narrative
  decisions_forbidden:
    - decide_player_pj_actions       # respect de l'agentivité du joueur
  permissions:
    - read_full_world_state
    - read_all_pj_states
    - edit_world
    - spawn_entities
    - delete_entities
    - alter_dice_rolls (with audit)

role_llm:
  description: "Agent LLM IA, contextuel et adaptatif"
  decisions_allowed:
    - control_assigned_pnj
    - apply_rules_strictly
    - propose_narrative_descriptions
    - resolve_minor_ambiguities
    - escalate_to_human_gm
  decisions_forbidden:
    - override_rules_without_escalation
    - decide_critical_narrative_beats     # boss death, world-shaking events
    - alter_pj_state_without_validation
  permissions:
    - read_assigned_pnj_full_state
    - read_world_relevant_to_assigned
    - propose_actions
    - flag_uncertainty

role_auto:
  description: "Script déterministe, IA tactique sans LLM"
  decisions_allowed:
    - apply_rules_strictly
    - select_action_by_priority      # R-11.17 IA tactique
    - decay_states_per_dt
    - fallback_when_others_unavailable
  decisions_forbidden:
    - resolve_ambiguities             # toujours fallback
    - alter_rules
    - generate_narrative
  permissions:
    - read_assigned_state_only
    - apply_deterministic_rules
```

#### Niveaux d'autorité (hiérarchie de surcharge)

```
human_gm > player > llm > auto
```

- `human_gm` peut surcharger toute décision de `player`, `llm`, `auto`.
- `player` peut accepter/refuser une action `llm`/`auto` qui le concerne directement.
- `llm` peut escalader à `human_gm` sur ambiguïté.
- `auto` ne décide jamais d'ambiguïté ; il fallback toujours.

**Statut** : 🟢 acté

---

## Partie B — Modes de session

### R-13.2 — Cinq modes de session canoniques

**Décision Q-D13.2 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
session_mode:
  classic_table:
    description: "Table papier classique : MJ humain + N joueurs"
    arbiters: { gm: human_gm, fallback: none }
    suitable_for: [in_person, voice_call]
  
  digital_human_gm:
    description: "Digital avec MJ humain assisté par LLM"
    arbiters: { gm: human_gm, assistant: llm, fallback: auto }
    suitable_for: [online, voice_call]
  
  digital_llm_gm:
    description: "MJ LLM principal, MJ humain en superviseur"
    arbiters: { gm: llm, supervisor: human_gm, fallback: auto }
    suitable_for: [online, async, solo]
  
  digital_auto_gm:
    description: "Tout déterministe, pour CI/test ou playthroughs minimaux"
    arbiters: { gm: auto, fallback: none }
    suitable_for: [test, ci, minimal_playthroughs]
  
  multiplayer_no_gm:
    description: "Tous PJ, pas de MJ, narration coopérative + LLM/auto pour résolutions"
    arbiters: { resolution: llm, mechanics: auto }
    suitable_for: [coop_storytelling]
```

**Statut** : 🟢 acté

### R-13.3 — Mode solo (1 joueur)

**Décision Q-D13.3 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
solo_mode:
  description: "1 joueur, 1 PJ, MJ géré par LLM ou auto"
  default_arbiter: llm
  fallback: auto
  features:
    - narrative_generation: llm
    - encounters_random: auto + llm validation
    - persistent_world_state: true
    - save_anywhere: true
  user_overrides:
    - can_force_human_gm_takeover: true        # joueur peut basculer en mode async où un MJ humain valide les décisions
    - can_dispute_llm_outcome: true            # joueur peut contester, force re-roll ou alternate path
```

**Statut** : 🟢 acté

### R-13.4 — Mode async (sessions étalées dans le temps)

**Décision Q-D13.4 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
async_mode:
  description: "Sessions étalées (1 action/jour, weekly check-in, etc.)"
  persistence:
    world_state: persisted
    pj_states: persisted
    pending_decisions: queued
  arbiter_availability:
    human_gm: intermittent
    llm: continuous (with rate limits)
    auto: continuous
  notifications:
    - new_decision_required: ping_to_player_or_gm
    - timeout_action: auto_resolve_with_llm     # si pas de réponse en X temps
  conflict_resolution:
    - same_dt_actions: queue_then_arbitrate_at_next_active_session
```

**Statut** : 🟢 acté

---

## Partie C — Passations entre rôles

### R-13.5 — Passation MJ humain → PJ (un PJ devient MJ temporaire)

**Décision Q-D13.5 (2026-04-25)** : choix D — hybride règle vivante.

Cas d'usage : interlude narratif où un PJ raconte un flashback ; séance solo où un PJ explore seul ; MJ rotatif où chaque session a un MJ différent.

```yaml
gm_to_pj_handoff:
  trigger: voluntary_or_scheduled
  scope: limited_scene | full_session | partial_authority
  duration: <duration>
  pj_temporary_powers:
    - control_some_pnj
    - declare_world_facts (within scope)
    - resolve_dice_for_others (within scope)
  pj_temporary_limits:
    - cannot_alter_pj_states_outside_scope
    - cannot_introduce_world_breaking_facts
    - decisions_subject_to_post_review by primary_gm
  audit_required: true
```

**Statut** : 🟢 acté

### R-13.6 — Passation PJ → MJ humain (PJ abandonné, possédé, mort)

**Décision Q-D13.6 (2026-04-25)** : choix D — hybride règle vivante.

Cas d'usage : joueur abandonne le jeu, PJ possédé temporairement par sort de Domination (D8), PJ mort sans résurrection (D7 R-7.20).

```yaml
pj_to_gm_handoff:
  triggers:
    - player_inactive: <duration>          # joueur inactif depuis N jours
    - player_quits: explicit
    - pj_dominated: spell_effect            # contrôle bascule au lanceur (player) ou GM si NPC
    - pj_dead_no_resurrection: D7_R-7.20
    - pj_unconscious_long: D7_t1_threshold
  destination_controller: human_gm | llm | auto    # selon mode session
  retention_options:
    - keep_pj_in_world_as_npc: true         # devient PNJ contrôlé par GM
    - retire_pj: archived                    # disparaît proprement
    - replace_pj: new_player_takes_over     # nouveau joueur reprend le PJ
```

**Statut** : 🟢 acté

### R-13.7 — Combinaisons hybrides (MJ humain + LLM coopératifs)

**Décision Q-D13.7 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
hybrid_gm_mode:
  description: "MJ humain et LLM travaillent ensemble"
  responsibility_split:
    human_gm:
      - pacing_and_dramatic_beats
      - boss_pnj_decisions
      - world_changing_events
      - rule_arbitrations
      - narrative_continuity
    llm:
      - mass_pnj_management
      - flavor_text_and_descriptions
      - dialogue_for_minor_pnj
      - random_encounter_resolution
      - rules_lookup_assistance
  escalation_protocol:
    - llm_uncertain_threshold: <0..1>     # confidence < threshold → escalate
    - escalation_format: structured_question_to_gm
    - gm_response_required_within: <duration>
    - timeout_fallback: auto
  audit_log:
    - all_llm_decisions: logged
    - all_gm_overrides: logged
    - reviewable_post_session: true
```

**Statut** : 🟢 acté

---

## Partie D — Mémoire et continuité (clôt backlog Q-D11.13)

### R-13.8 — Architecture technique de mémoire LLM (clôt Q-D11.13)

**Décision Q-D13.8 (2026-04-25)** : choix D — hybride règle vivante. **Clôt Q-D11.13**.

```yaml
llm_memory_architecture:
  modes: [none, session, persistent]      # rappel R-11.18
  
  storage_backends:
    structured_db:                          # pour stats, attitudes, événements numériques
      type: postgresql | sqlite | json_files
      schema: typed
    vector_store:                           # pour mémoire sémantique narrative
      type: pgvector | chroma | qdrant | local
      embedding_model: <ref>
    rolling_log:                            # log brut des derniers événements
      max_entries: <int>
      truncation: oldest_first | summarize_old
  
  retrieval_strategy:
    - on_pnj_action: query_relevant_memories(pnj_id, context, top_k=10)
    - on_gm_query: full_text_search OR vector_similarity
    - on_session_start: load_summary OR full_log
  
  summarization:
    trigger_at_n_events: <int>              # ex. 100 événements → résumé
    method: llm_summarize | manual_curation
    retain_originals: bool
  
  privacy:
    pj_can_review_their_pnj_memories: true
    pj_can_redact_sensitive_info: true
    gm_can_audit_all_memory: true
```

**Statut** : 🟢 acté

---

## Partie E — Triggers de bascule (clôt backlog Q-D11.15)

### R-13.9 — Catalogue exhaustif de triggers de bascule (clôt Q-D11.15)

**Décision Q-D13.9 (2026-04-25)** : choix D — hybride règle vivante. **Clôt Q-D11.15**.

```yaml
controller_switch_triggers:
  vitality_critical:
    condition: "entity.vitality / entity.vitality_max < 0.25"
    action: switch_to_llm                     # prendre une décision plus complexe
    applies_to: [auto_controlled_pnj]
    cooldown: 50_dt                            # éviter oscillation
  
  charm_or_domination:
    condition: "entity.has_status(['charmed', 'dominated'])"
    action: switch_to_caster_controller
    duration: status_duration
    revert_on: status_removed
  
  ko_or_dying:
    condition: "entity.state in ['unconscious', 'dying', 'dead']"
    action: switch_to_auto_no_action          # plus aucune action possible
  
  surrender:
    condition: "entity.has_status('surrendered')"
    action: switch_to_human_gm OR llm
    purpose: interrogation_negotiation
  
  player_inactive:
    condition: "player.last_action_at > now() - 7_days"
    action: switch_pj_to_llm OR human_gm     # selon mode session
  
  llm_unavailable:
    condition: "llm.status != available"
    action: cascade_fallback_to(human_gm, auto)
    notify_user: true
  
  human_gm_afk:
    condition: "human_gm.last_input > 10_minutes AND active_session"
    action: pause_session OR switch_to_llm
    notify: true
  
  scenario_scripted:
    condition: "scenario.trigger_active(<id>)"
    action: as_defined_by_scenario
  
  custom_rule:
    condition: <expr_user_defined>
    action: <action_user_defined>
```

**Statut** : 🟢 acté

---

## Partie F — Compagnons persistants (clôt backlog Q-D11.18)

### R-13.10 — Compagnons persistants : recrutement, partage, lien long terme (clôt Q-D11.18)

**Décision Q-D13.10 (2026-04-25)** : choix D — hybride règle vivante. **Clôt Q-D11.18**.

```yaml
companion:
  pnj_id: <ref>
  master: <pj_id>                           # le PJ qui l'a recruté
  bond_strength: <int>                       # 0-100
  recruited_at: <timestamp>
  recruited_via:
    - social_action: <ref R-11.19>          # ex. persuasion réussie
    - quest_outcome: <quest_id>
    - rescue: <event>
    - hire: { cost_pc: <int>, contract_duration: <duration> }
    - oath: { mutual_pact: <string> }
  loyalty_modifiers:
    - shared_xp: bool                         # le compagnon gagne XP avec le PJ
    - share_of_loot: <fraction>              # part du loot
    - obligations_to_master: [<obligation>]
    - obligations_of_master: [<obligation>]
  controller: player | llm | human_gm        # par défaut player du master
  parts_with:
    - on_master_betrayal
    - on_quest_completion (for quest-bound)
    - on_contract_expiry (for hired)
    - on_master_death
    - on_voluntary_choice
  evolution:
    - xp_transfer_limit: none              # limité seulement par l'XP libre du propriétaire
    - xp_transfer_cost_owner: true         # l'XP cédée n'est plus disponible pour l'évolution du propriétaire
    - level_up: standard_character_rules   # catégorie/race/classe propres au compagnon
    - death: standard_character_death      # mort définitive sauf résurrection applicable
    - bond_strength_increases_with: [shared_combat, fulfilled_obligations, gifts]
    - bond_strength_decreases_with: [neglect, abuse, betrayal]
    - loyalty_test_at_critical_moments: bool
```

**Différence avec familier (R-11.22)** : le compagnon est un PNJ pleinement autonome (souvent humanoïde), peut partir, négocier, contester, mourir comme un personnage indépendant et progresser par XP cédée sans limite fixe. Le familier est une créature liée magiquement au magicien, contrôlable plus directement et construite avec le budget D8 R-8.13.

**Statut** : 🟢 acté

---

## Partie G — Audit et arbitrage

### R-13.11 — Système d'audit transversal

**Décision Q-D13.11 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
audit_log:
  entries:
    - timestamp: <datetime>
      session_id: <id>
      actor: <player_id | gm_id | llm_session | auto_script>
      action_type: rule_application | dice_roll | arbitration | override | controller_switch | rule_modification
      target: <entity_id | rule_id>
      before_state: <snapshot>
      after_state: <snapshot>
      reason: <string>
      reviewable: bool
  retention:
    permanent: rule_modifications, controller_switches, arbitrations
    rolling_30_days: dice_rolls, action_resolutions
    on_request: full_session_replay
  access:
    players: own_actions_only
    human_gm: full_access
    admins: full_access + edit_rights
```

**Statut** : 🟢 acté

### R-13.12 — Arbitrage de conflits

**Décision Q-D13.12 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
conflict_resolution:
  conflict_types:
    - rule_interpretation: between_player_and_gm
    - dice_roll_dispute: cheating_or_error
    - controller_decision_dispute: llm_decision_contested_by_player
    - inter_player_pj_conflict: pvp_or_disagreement
  
  resolution_hierarchy:
    1. discussion_among_table
    2. gm_ruling                             # MJ humain tranche
    3. rule_lookup                            # consulter le moteur
    4. dice_arbitration                       # cas extrêmes : jet départage
    5. session_pause_for_admin_intervention   # si tout échoue
  
  recourse:
    - re_roll_dice: with_audit
    - retcon_event: requires_table_consensus
    - escalate_to_admin: for_systemic_issues
```

**Statut** : 🟢 acté

---

## Partie H — Onboarding et complexité progressive

### R-13.13 — Onboarding nouveaux joueurs et complexité graduelle

**Décision Q-D13.13 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
onboarding:
  difficulty_levels:
    novice:
      modes: [arcade for combat (R-9.26), arcade for inventory (R-10.23)]
      llm_assistance: high
      tutorial_active: true
      simplified_character_creation: true
    standard:
      modes: [standard everywhere]
      llm_assistance: on_demand
      tutorial_active: false
    expert:
      modes: [realistic everywhere]
      llm_assistance: minimal
      access_to: [admin_rules_editing, custom_atouts, rule_modifications]
  
  progressive_features:
    - unlock_at_session_3: tactical_states_full         # R-9.27 niveaux complexes
    - unlock_at_session_5: poisons_and_advanced_combat   # R-9.35, R-9.36
    - unlock_at_session_10: crafting_advanced            # R-10.20, R-10.21
    - unlock_at_session_15: legendary_items              # R-10.28
  
  documentation:
    in_game_glossary: true
    contextual_help: true
    rules_search: true
```

**Statut** : 🟢 acté

---

## Partie I — Cas limites

### R-13.14 — Cas limites et fallbacks ultimes

**Décision Q-D13.14 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
edge_cases:
  all_arbiters_unavailable:
    description: "Tous les MJ (humain+LLM+auto) inaccessibles"
    fallback: pause_session_persist_state
    notify: queue_alert_for_first_arbiter_back
  
  paradoxical_state:
    description: "État incohérent (PJ mort qui agit, item dupliqué)"
    fallback: rollback_to_last_consistent_state
    audit: critical_log_entry
  
  rule_conflict:
    description: "Deux règles vivantes en contradiction"
    fallback: most_recent_version_wins
    audit: flag_for_admin_review
  
  llm_hallucination:
    description: "LLM produit une réponse invalide ou contraire au catalogue"
    fallback: reject_response, retry_with_constrained_prompt OR fallback_to_auto
    audit: log_for_prompt_tuning
  
  server_outage:
    description: "Backend indisponible"
    fallback: local_cache_for_session, degraded_mode
    persistence: ensure_no_data_loss
  
  conflicting_player_actions:
    description: "Deux PJ veulent agir au même DT mutuellement exclusif"
    resolution: jet_d_initiative or reflex_opposition
    last_resort: dice_arbitration
```

**Statut** : 🟢 acté

---

## Partie J — Synthèse globale Phase 1

### R-13.15 — Pattern mode arbitre formalisé (clôture Phase 1)

**Décision Q-D13.15 (2026-04-25)** : choix D — formalisation du pattern récurrent.

Toute règle K&W qui mentionne « Application par mode arbitre » suit ce schéma canonique :

```yaml
rule_application:
  human_gm:
    - free_to_override
    - narrative_priority
    - can_bend_for_table_fun
  llm:
    - apply_strictly
    - propose_narrative_descriptions
    - escalate_uncertainties
    - respect_personality_profile
  auto:
    - strict_application
    - no_interpretation
    - fallback_to_human_gm_or_llm_on_ambiguity
  player:
    - has_agentivité_on_own_pj
    - can_dispute_llm_or_auto_decisions
    - cannot_override_rules
```

Ce pattern apparaît dans :
- D9 R-9.22, R-9.31, R-9.32, R-9.33, R-9.34 (combat)
- D10 R-10.18, R-10.19, R-10.20, R-10.21, R-10.22, R-10.23, R-10.24, R-10.25, R-10.26, R-10.27, R-10.28, R-10.29 (équipement)
- D11 R-11.15, R-11.16, R-11.17, R-11.18, R-11.19, R-11.20, R-11.21, R-11.22 (contrôle PNJ)
- D12 R-12.1 → R-12.13 (géographie/social/économie)
- D13 R-13.1 → R-13.15 (rôles)

**Statut** : 🟢 acté — Phase 1 complétée

---

## Partie K — Backlog D13

### Q-D13.16 — 🟡 Spec technique du moteur multi-arbitre (architecture logicielle)

**Contexte** : R-13.1 → R-13.7 actent le modèle conceptuel. Le **design technique** (modules, API, événements, queues) reste à concevoir en Phase 2.

**Clarifications attendues avant décision technique** :
- Frontière exacte entre moteur auto strict, assistant LLM, MJ humain et joueur.
- Hiérarchie d'autorité quand deux arbitres proposent des décisions concurrentes.
- File d'événements : ordre, priorité, rollback, pause, reprise, async.
- Modèle de persistance : état canonique, logs d'audit, brouillons, snapshots, export/import.
- API et contrats : actions joueur, décisions MJ, propositions LLM, résolutions auto.
- Limites LLM : ce qu'il peut suggérer, ce qu'il ne peut jamais modifier sans validation.
- Stratégie de conflit : désaccord règle vivante / règle canonique / arbitrage humain.
- Tests attendus : simulations déterministes, rejouabilité d'un tour, cas limites multi-joueurs.

### Q-D13.17 — 🟡 Format d'export/import des sessions (sauvegardes, partage)

**Contexte** : R-13.8 traite la mémoire ; mais le format de **sérialisation pour export/import** (sauvegarde, partage de campagne entre tables, fork de campagne) n'est pas tranché.

### Q-D13.18 — 🟡 Modération automatique (anti-griefing, anti-toxicité multi-joueurs)

**Contexte** : R-13.12 traite les conflits ludiques. La **modération sociale** (insultes, harassement, comportements abusifs) est à concevoir séparément.

### Q-D13.19 — 🟡 Permissions granulaires (sub-rôles dans `human_gm` : co-MJ, observateur, etc.)

**Contexte** : R-13.1 acte 4 rôles principaux. Mais des **sous-rôles** (co-MJ assistant, observateur silencieux, étudiant en formation) peuvent enrichir le modèle.

### Q-D13.20 — 🟡 Mode tournoi / compétitif (PJ vs PJ formalisé)

**Contexte** : R-13.2 mentionne `multiplayer_no_gm` mais le **PvP formalisé** (compétition de PJ, arène, joutes) n'est pas couvert.

### Q-D13.21 — 🟡 Intégration avec outils externes (Discord, Roll20, Foundry, etc.)

**Contexte** : interopérabilité avec les VTT existants — out of scope de la phase 1 mais à anticiper en backlog.

---

## Partie L — Questions ouvertes (rappel)

### Q-D13.1 → Q-D13.15 — toutes ✅ tranchées en lot (pattern D / hybride règle vivante)

L'auteur a indiqué « pareil » → batch validé. Les 15 règles structurantes (R-13.1 → R-13.15) couvrent l'architecture complète des rôles, modes, passations, mémoire (clôt Q-D11.13), triggers (clôt Q-D11.15), compagnons persistants (clôt Q-D11.18), audit, arbitrage, onboarding, cas limites, et formalisation finale du pattern mode arbitre.

**Backlog D13 (Q-D13.16 → Q-D13.21)** : 6 sujets pour Phase 2 (spec technique du moteur, format export/import, modération sociale, sous-rôles, mode tournoi, intégration outils externes).

---

## Phase 1 — clôture officielle

**13 domaines complétés** (D1 → D13). Référentiel de règles K&W canonisé, prêt pour Phase 2 (implémentation digitale).

| Domaine | Règles | Backlog |
|---|---:|---:|
| D1 Résolution | 40+ | — |
| D2 Attributs | 20+ | — |
| D3 Races | 8+ | — |
| D4 Orientations/Classes/Atouts | 9+ | — |
| D5 Compétences | 7+ | — |
| D6 Création perso | 11+ | — |
| D7 Progression | 22+ | — |
| D8 Magie | 20+ | restrictions fines d'atouts familiers |
| D9 Combat | 44 | 19 (Q-D9.33→53) |
| D10 Équipement | 12 | 15 (Q-D10.14→28) |
| D11 Contrôle PNJ | 8 | 10 (Q-D11.10→20) |
| D12 Géo/Social/Éco | 13 | 17 (Q-D12.14→30) |
| D13 Rôles & passation | 15 | 6 (Q-D13.16→21) |
| **Total** | **~230 règles canoniques** | **~70 entrées backlog** |
