# Discord Channel Scheduler Bot

Bot Discord per schedulare automaticamente i permessi di invio messaggi su canali specifici per determinati ruoli.

## Funzionalità

- Blocca/sblocca automaticamente l'invio messaggi a orari specifici
- Configurazione tramite file JSON o comandi slash
- Supporto per più canali e ruoli
- Timezone configurata su Europe/Rome

## Setup

### 1. Crea un Bot Discord

1. Vai su [Discord Developer Portal](https://discord.com/developers/applications)
2. Clicca "New Application" e dai un nome
3. Vai su "Bot" nel menu laterale
4. Clicca "Add Bot"
5. Copia il **TOKEN** (ti servirà dopo)
6. Abilita queste opzioni in "Privileged Gateway Intents":
   - SERVER MEMBERS INTENT (opzionale)
   - MESSAGE CONTENT INTENT (opzionale)

### 2. Invita il Bot nel tuo Server

1. Nel Developer Portal, vai su "OAuth2" > "URL Generator"
2. Seleziona gli scopes:
   - `bot`
   - `applications.commands`
3. Seleziona i permessi:
   - `Manage Channels`
   - `Manage Roles`
4. Copia l'URL generato e aprilo nel browser per invitare il bot

### 3. Ottieni gli ID necessari

1. Su Discord, vai in Impostazioni > Avanzate > Abilita "Modalità sviluppatore"
2. Clicca destro sul server > Copia ID (questo è il `guildId`)
3. Clicca destro su un canale > Copia ID (questo è il `channelId`)
4. Clicca destro su un ruolo > Copia ID (questo è il `roleId`)

### 4. Configura il Bot

Modifica `config.json`:

```json
{
  "token": "IL_TUO_TOKEN_DEL_BOT",
  "guildId": "ID_DEL_TUO_SERVER",
  "schedules": []
}
```

### 5. Installa e Avvia

```bash
npm install
npm start
```

## Comandi Slash

| Comando | Descrizione |
|---------|-------------|
| `/schedule-add` | Aggiunge una nuova regola di scheduling |
| `/schedule-list` | Mostra tutte le schedulazioni |
| `/schedule-remove` | Rimuove una schedulazione o regola |
| `/schedule-toggle` | Abilita/disabilita una schedulazione |
| `/permission-now` | Modifica i permessi immediatamente |

### Esempi

**Bloccare un canale alle 22:00 e sbloccarlo alle 8:00:**
```
/schedule-add canale:#chat-generale ruolo:@Membri azione:Blocca orario:22:00
/schedule-add canale:#chat-generale ruolo:@Membri azione:Sblocca orario:08:00
```

**Bloccare solo nei weekend:**
```
/schedule-add canale:#lavoro ruolo:@Team azione:Blocca orario:00:00 giorni:6
/schedule-add canale:#lavoro ruolo:@Team azione:Sblocca orario:00:00 giorni:1
```

## Formato Cron

Il campo `cron` usa il formato standard:
```
┌───────── minuti (0 - 59)
│ ┌─────── ore (0 - 23)
│ │ ┌───── giorno del mese (1 - 31)
│ │ │ ┌─── mese (1 - 12)
│ │ │ │ ┌─ giorno della settimana (0 - 6, 0 = Domenica)
│ │ │ │ │
* * * * *
```

**Esempi:**
- `0 22 * * *` - Ogni giorno alle 22:00
- `30 8 * * 1-5` - Alle 8:30 da lunedì a venerdì
- `0 0 * * 6` - Ogni sabato a mezzanotte

## Deployment

### Railway (Gratuito)

1. Crea un account su [Railway](https://railway.app)
2. Connetti il tuo repository GitHub
3. Aggiungi le variabili d'ambiente (se usi .env)
4. Deploy automatico!

### Render (Gratuito)

1. Crea un account su [Render](https://render.com)
2. Crea un nuovo "Background Worker"
3. Connetti il repository
4. Build command: `npm install`
5. Start command: `npm start`

### VPS/Server

```bash
# Con PM2 (consigliato)
npm install -g pm2
pm2 start src/index.js --name discord-scheduler
pm2 save
pm2 startup
```

## Troubleshooting

**Il bot non risponde ai comandi:**
- Verifica che il bot abbia i permessi necessari
- Controlla che il `guildId` sia corretto
- Riavvia il bot per registrare i comandi

**I permessi non cambiano:**
- Il ruolo del bot deve essere più alto del ruolo da gestire
- Verifica che il bot abbia il permesso "Gestisci Canali"

**Errore "Missing Permissions":**
- Vai nelle impostazioni del canale
- Verifica che il bot possa modificare i permessi del ruolo
