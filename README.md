# NEXUS — Agente Pessoal de IA
**Open Source · @sussegadin · v1.0**

Agente Android com Chat IA + Voz, Gestão de Rotina, Redes Sociais e suporte a múltiplos modelos.

---

## ✦ INSTALAR NO ANDROID SEM PC

### PASSO 1 — Criar conta no Expo (grátis)
1. Abra o Chrome no seu Android
2. Acesse: **https://expo.dev/signup**
3. Crie conta com seu email
4. Confirme o email

### PASSO 2 — Subir o código no GitHub
1. Acesse **https://github.com** (já logado como @sussegadin)
2. Toque em **"New repository"**
3. Nome: `nexus-agent` → **Create repository**
4. Na página do repo, toque **"uploading an existing file"**
5. Faça upload de TODOS os arquivos desta pasta (um por um ou zipado)
   - ⚠️ Mantenha a estrutura de pastas: `src/screens/`, `src/utils/`, etc.

> **Dica:** Use o app GitHub Mobile (Android) para facilitar o upload

### PASSO 3 — Conectar ao EAS Build
1. No celular, acesse: **https://expo.dev/accounts/[seu-usuario]/projects**
2. Toque em **"Create a project"**
3. Nome: `nexus-agent`
4. Vá em **Builds** → **"New Build"**
5. Conecte seu repositório GitHub
6. Profile: **preview** (isso gera APK, não AAB)
7. Toque **"Build"**

### PASSO 4 — Aguardar o build (5-15 minutos)
- O EAS compila na nuvem
- Você recebe notificação por email quando terminar

### PASSO 5 — Baixar e instalar o APK
1. Acesse o link do build no email
2. Toque **"Download APK"**
3. No Android: Configurações → Segurança → **"Fontes desconhecidas"** (ativar)
4. Abra o arquivo `.apk` baixado
5. Instalar → Abrir → **NEXUS ativado!** 🧠

---

## ✦ FUNCIONALIDADES

| Feature | Status |
|---------|--------|
| Chat com Claude (Anthropic) | ✅ |
| Voz → Texto (OpenAI Whisper) | ✅ |
| Texto → Voz (expo-speech) | ✅ |
| Gestão de Rotina Diária | ✅ |
| Ideias de Conteúdo para Redes | ✅ |
| Gerar Rotina com IA | ✅ |
| Refinar conteúdo com IA | ✅ |
| PT-BR / Español / English | ✅ |
| Troca de modelo (Sonnet/Opus/Haiku) | ✅ |
| Runway ML (Vídeo IA) | 🔜 v1.1 |
| Kling AI (Vídeo IA) | 🔜 v1.1 |

---

## ✦ API KEYS NECESSÁRIAS

| Serviço | Onde obter | Para quê |
|---------|-----------|----------|
| **Anthropic** (obrigatória) | console.anthropic.com | Chat + Geração de conteúdo |
| OpenAI (opcional) | platform.openai.com | Voz → Texto (Whisper) |
| Runway (v1.1) | app.runwayml.com | Geração de vídeo |
| Kling (v1.1) | klingai.com | Geração de vídeo |

---

## ✦ ESTRUTURA DO PROJETO

```
nexus-agent/
├── App.js                    # Entrada principal + navegação
├── app.json                  # Config Expo
├── eas.json                  # Config EAS Build (gera APK)
├── package.json              # Dependências
├── babel.config.js
└── src/
    ├── constants/
    │   └── theme.js          # Cores e estilos
    ├── utils/
    │   ├── api.js            # Claude, Whisper, Runway, Kling
    │   ├── storage.js        # Persistência local
    │   └── i18n.js           # PT/ES/EN
    └── screens/
        ├── SetupScreen.js    # Configuração inicial
        ├── HomeScreen.js     # Dashboard
        ├── ChatScreen.js     # Chat + Voz
        ├── SocialScreen.js   # Conteúdo para redes
        ├── RoutineScreen.js  # Tarefas e rotina
        └── SettingsScreen.js # Configurações
```

---

## ✦ CICLO DE DESENVOLVIMENTO

```
Você usa o app → Identifica melhorias → Traz relatório para Claude →
Claude atualiza o código → Você sobe no GitHub → EAS Build → Novo APK
```

---

## ✦ LICENÇA

MIT License — Open Source
Créditos: Gilmar (@sussegadin) + Claude (Anthropic)
