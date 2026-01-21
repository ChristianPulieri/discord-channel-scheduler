# Discord Channel Scheduler Bot

Bot per schedulare automaticamente l'apertura e chiusura dei permessi di scrittura su canali Discord.

---

## Funzionalità

- Blocca/sblocca automaticamente l'invio messaggi a orari specifici
- Supporto per giorni della settimana (es. solo lun-ven)
- Messaggi personalizzati per ogni canale
- Test manuale dei permessi
- Notifiche automatiche quando i permessi cambiano

---

## Comandi

### `/schedule-add`
Aggiunge una regola di scheduling automatico.

| Parametro | Obbligatorio | Descrizione |
|-----------|--------------|-------------|
| `canale` | ✅ | Il canale da gestire |
| `ruolo` | ✅ | Il ruolo a cui applicare la regola |
| `azione` | ✅ | `Sblocca` o `Blocca` |
| `orario` | ✅ | Orario in formato HH:MM (es. `14:00`) |
| `giorni` | ❌ | Giorni della settimana (default: tutti) |
| `descrizione` | ❌ | Nota per ricordare cosa fa la regola |

**Formato giorni:**
- `*` = tutti i giorni (default)
- `1-5` = lunedì - venerdì
- `6,0` = sabato e domenica
- `1,3,5` = lunedì, mercoledì, venerdì

**Esempi:**
```
/schedule-add canale:#chat ruolo:@Membri azione:Sblocca orario:08:00 giorni:1-5
/schedule-add canale:#chat ruolo:@Membri azione:Blocca orario:22:00 giorni:1-5
```

---

### `/schedule-message`
Imposta messaggi personalizzati per apertura/chiusura.

| Parametro | Obbligatorio | Descrizione |
|-----------|--------------|-------------|
| `canale` | ✅ | Il canale |
| `ruolo` | ✅ | Il ruolo |
| `messaggio_apertura` | ❌ | Messaggio quando si apre |
| `messaggio_chiusura` | ❌ | Messaggio quando si chiude |

**Variabili disponibili:**
- `{ruolo}` = menziona il ruolo
- `\n` = va a capo

**Esempio:**
```
/schedule-message canale:#🔥-falò ruolo:@Guardiano messaggio_apertura:🔥 **Il falò è acceso!**\nBenvenuti {ruolo}! messaggio_chiusura:💤 Il falò si spegne...\nA domani!
```

---

### `/schedule-list`
Mostra tutte le schedulazioni configurate.

```
/schedule-list
```

---

### `/schedule-remove`
Rimuove una schedulazione o una regola specifica.

| Parametro | Obbligatorio | Descrizione |
|-----------|--------------|-------------|
| `canale` | ✅ | Il canale |
| `ruolo` | ✅ | Il ruolo |
| `regola` | ❌ | Numero della regola (se vuoto, rimuove tutto) |

**Esempi:**
```
/schedule-remove canale:#chat ruolo:@Membri
/schedule-remove canale:#chat ruolo:@Membri regola:1
```

---

### `/schedule-toggle`
Abilita o disabilita una schedulazione senza eliminarla.

```
/schedule-toggle canale:#chat ruolo:@Membri
```

---

### `/permission-now`
Modifica i permessi immediatamente (per test).

| Parametro | Obbligatorio | Descrizione |
|-----------|--------------|-------------|
| `canale` | ✅ | Il canale |
| `ruolo` | ✅ | Il ruolo |
| `azione` | ✅ | `Sblocca` o `Blocca` |

**Esempio:**
```
/permission-now canale:#chat ruolo:@Membri azione:Sblocca
```

---

## Setup Completo (Esempio)

### Scenario
Canale `#🔥-falò-dei-guardiani` aperto dalle 14:00 alle 20:00, dal lunedì al venerdì, per il ruolo `@Guardiano`.

### Step 1: Aggiungi le regole
```
/schedule-add canale:#🔥-falò-dei-guardiani ruolo:@Guardiano azione:Sblocca orario:14:00 giorni:1-5
/schedule-add canale:#🔥-falò-dei-guardiani ruolo:@Guardiano azione:Blocca orario:20:00 giorni:1-5
```

### Step 2: Personalizza i messaggi
```
/schedule-message canale:#🔥-falò-dei-guardiani ruolo:@Guardiano messaggio_apertura:🔥 **Il falò è acceso!**\nBenvenuti {ruolo}, buona chiacchierata! messaggio_chiusura:💤 **Il falò si spegne...**\nA domani {ruolo}!
```

### Step 3: Verifica
```
/schedule-list
```

### Step 4: Testa manualmente
```
/permission-now canale:#🔥-falò-dei-guardiani ruolo:@Guardiano azione:Blocca
/permission-now canale:#🔥-falò-dei-guardiani ruolo:@Guardiano azione:Sblocca
```

---

## Variabili d'Ambiente (Railway)

| Variabile | Descrizione |
|-----------|-------------|
| `TOKEN` | Token del bot Discord |
| `GUILD_ID` | ID del server Discord |

---

## Note Tecniche

- **Timezone:** Europe/Rome
- **Permessi richiesti:** Manage Channels, Manage Roles, Send Messages
- **Il ruolo del bot deve essere più alto** del ruolo che vuoi gestire nella gerarchia del server

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| Bot offline | Controlla i log su Railway |
| Comandi non visibili | Riavvia il bot per registrare i comandi |
| Permessi non cambiano | Verifica che il bot abbia ruolo più alto |
| Errore "Missing Permissions" | Aggiungi i permessi al bot nelle impostazioni del canale |
