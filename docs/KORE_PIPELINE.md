# KORE.AG — Instagram Content Pipeline
## Planejamento Completo

---

## Colunas do Kanban

| # | Coluna | Quem age | Como chega |
|---|--------|----------|------------|
| 1 | **Backlog** | Você | Manual — suas ideias brutas |
| 2 | **Write** | Claude (agente) | Auto: processa backlog OU pesquisa proativo se backlog vazio |
| 3 | **Pre-approved** | Você | Drag manual do Write |
| 4 | **Images** | Auto (Freepik) | Geração automática ao entrar em Pre-approved → move pra Images |
| 5 | **Rendering** | Auto (Kling) | Só vídeos — você arrasta do Images após aprovar os frames |
| 6 | **Video Review** | Você | Vídeo gerado, você assiste e aprova |
| 7 | **Approved** | Você | Foto/carrossel: drag do Images · Vídeo: drag do Video Review |
| 8 | **To Post** | Você | Drag do Approved — aqui você define data/hora de publicação |
| 9 | **Done** | Auto (Meta API) | Publicado no Instagram |

---

## Fluxo por Formato

### 📷 Foto
```
Backlog → Write → Pre-approved → Images (auto Freepik) → Approved → To Post → Done
```

### 🎴 Carrossel
```
Backlog → Write → Pre-approved → Images (auto Freepik, N slides) → Approved → To Post → Done
```

### 🎬 Vídeo
```
Backlog → Write → Pre-approved
  → Images (auto Freepik: frame_inicial + frame_final por cena)
  → [você aprova os frames no Images]
  → Rendering (drag → Kling gera cada cena → ffmpeg concatena)
  → Video Review (você assiste o vídeo final)
  → Approved → To Post → Done
```

---

## Triggers Automáticos por Coluna

| Ao entrar em | Trigger | Output |
|---|---|---|
| **Write** | `claude -p` expande ideia do Backlog (ou pesquisa proativo) | Card com copy, legenda, prompts |
| **Images** | Freepik Mystic gera imagens de cada slide/frame | `asset_urls[]` populado |
| **Rendering** | Kling gera cada cena → ffmpeg concatena | `video_url` no card |
| **Done** | Meta Graph API publica | `instagram_post_id` salvo |

---

## O Agente Claude (`claude -p`)

### Caso 1 — Backlog tem cards
1. Lê cada card do Backlog (`titulo`, `formato`, `angulo`, `vertical`, `descricao`)
2. Expande com copy completa, legenda, hashtags, prompts de imagem
3. Cria card expandido na coluna **Write**
4. Remove card do Backlog (já foi processado)

### Caso 2 — Backlog vazio (proativo)
1. Faz pesquisa de tendências do nicho via web search
2. Considera sazonalidade, datas comemorativas, contexto de mercado brasileiro
3. Gera 6 ideias distribuídas pelas verticais
4. Cria cards já expandidos direto em **Write**

---

## Prompt do Agente — Diretrizes

### Equilíbrio de Verticais
O agente deve distribuir ideias entre **todas** as verticais, sem concentrar em TI:
- **Marketing digital** (gestão de redes, tráfego pago, branding, SEO, copywriting, campanhas) — pelo menos 2 de 6
- **Desenvolvimento web e sistemas**
- **Rastreamento GPS de frotas**
- **Segurança eletrônica**
- **Consultoria em TI** — no máximo 1-2 de 6

Tom: direto, próximo, moderno. Falar a língua do dono de negócio brasileiro. Nunca corporativo ou robótico.

### Seleção de Modelos (Freepik)

| Referência | Quem é |
|---|---|
| `@Angelo` | Fundador da agência |
| `@Stefane` | Co-fundadora da agência |
| `@Angelo e @Stefane` | Os dois juntos no mesmo post |
| `nenhum` | Post puramente gráfico, sem presença humana |

**Regra de ouro:** Escolher pelo que torna o post mais **autêntico e humano**, não por estereótipo de gênero ou área.

- @Angelo pode aparecer em qualquer vertical — marketing, bastidores, lifestyle, humor, técnico
- @Stefane pode aparecer em qualquer vertical — tecnologia, resultados, autoridade, bastidores
- Os dois juntos funcionam para: bastidores da agência, casal empreendedor, celebração de resultado, rotina, tomada de decisão
- O campo `motivo_modelo` deve justificar a escolha em termos de storytelling, não de função

### Ângulos disponíveis
`educativo` · `autoridade` · `prova_social` · `curiosidade` · `dor` · `tendencia` · `bastidores`

---

## Geração de Vídeo (detalhe)

```
Por cena:
  frame_inicial_prompt → Freepik → frame_in.jpg
  frame_final_prompt   → Freepik → frame_out.jpg
  Kling API (img2img)  → frame_in + frame_out → cena_N.mp4

Concatenação:
  ffmpeg cena_1.mp4 + cena_2.mp4 + ... → video_final.mp4

→ vai para Video Review
```

### APIs de vídeo — opções

| API | Input | Qualidade | Custo aprox. |
|-----|-------|-----------|--------------|
| **Kling AI** ⭐ | img2img (frame in + out) | Movimento controlado | ~$0.14/cena |
| **Runway ML** | img + prompt | Mais criativo | ~$0.05/s |
| **Pika Labs** | img + prompt | Simples | Free tier |

Recomendação: **Kling** — os frames são gerados com composição precisa pelo Freepik, Kling respeita melhor o início e fim definidos.

---

## Schema PostgreSQL

```prisma
model Post {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  column    Column
  order     Int

  // Conteúdo base
  titulo         String
  formato        Formato   // foto | carrossel | video
  angulo         String
  vertical       String
  descricao      String?
  legenda        String?
  hashtags       String[]
  usa_modelo     String?   // "@Angelo" | "@Stefane" | "@Angelo e @Stefane" | "nenhum" | "voz off"
  motivo_modelo  String?   // justificativa de storytelling

  // Foto
  image_prompt    String?
  elementos_texto Json?
  layout          String?

  // Carrossel
  slides Json?   // Slide[]

  // Vídeo
  roteiro_completo String?
  cenas            Json?   // Cena[] com frame_inicial_prompt + frame_final_prompt

  // Assets gerados
  asset_urls String[]   // imagens (frames para vídeo)
  video_url  String?    // vídeo concatenado final

  // Publicação
  scheduled_at      DateTime?
  published_at      DateTime?
  instagram_post_id String?
}

enum Column {
  BACKLOG
  WRITE
  PRE_APPROVED
  IMAGES
  RENDERING      // só vídeos
  VIDEO_REVIEW   // só vídeos
  APPROVED
  TO_POST
  DONE
}

enum Formato {
  foto
  carrossel
  video
}
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + App Router |
| Drag & Drop | @hello-pangea/dnd |
| API Routes | Next.js Route Handlers |
| Agente IA | `claude -p` via `child_process.exec` |
| Imagens | Freepik Mystic API |
| Vídeo | Kling AI API |
| Concat | ffmpeg (fluent-ffmpeg) |
| Banco | PostgreSQL + Prisma ORM |
| Publish | Meta Graph API v21 |
| Deploy | Local dev → Docker (Hetzner) |

---

## Brand Kit Freepik

```
@img1    → logo KORE.AG (canto inferior direito, sempre presente)
@Angelo  → fundador (qualquer tema)
@Stefane → co-fundadora (qualquer tema)
```

Paleta: `#000000` · `#FFFFFF` · `#0066FF`
Estilo: dark mode · bold sans-serif · tech premium

---

## Pendências / Decisões Abertas

- [ ] Kling ou Runway para geração de vídeo?
- [ ] Storage: S3, Cloudflare R2 ou filesystem local no início?
- [ ] Cards do Backlog somem após virar Write, ou ficam como arquivo?
- [ ] To Post: publicar imediatamente ou sempre exigir data/hora?
- [ ] Colunas Rendering e Video Review: ocultar para posts foto/carrossel?
- [ ] Frequência do agente proativo: manual (botão) ou cron automático?
