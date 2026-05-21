# Content — 14 Topics

The agent reads from this content. Each topic has:
- `id` — used by the `navigate_to_topic` tool
- `label` — shown in the sidebar (can be tuned later)
- `beats` — paragraphs separated by `\n\n`. Each beat becomes one chat bubble synced to audio.
- `side_panel` — links and/or choice buttons that appear when the topic is active
- `sub_chapters` (optional) — for topics that have drill-down content

---

## 1. Quick Hello

**id:** `quick-hello`
**label:** Quick Hello

**Beats:**

What I have done over my career does not fit on an A4. Especially when the same role means different things to a founder, a hiring manager, and a recruiter.

So I built an AI agent that adapts. Which also happens to be the job I am applying for.

Pick a chapter on the left. Or just talk to me.

---

## 2. Why Open

**id:** `why-open`
**label:** Why Open

**Beats:**

The job description reads like a blueprint for what I am already building.

Voice agents, deployed in real conversations, watched in production. Without anyone paying me to do it yet.

My take on why AI matters now. We used to build interfaces out of buttons and forms, trying to guess what people wanted. Now we can ask them in their own language. We dig into the actual need, and give answers that sound human but are statistics underneath.

Open is doing that where it matters most. When a real customer is upset on the other end of the line.

**Side panel — optional clickable follow-ups:**

- "What would you do in the first weeks?" → navigates to `methodology`
- "What's your background?" → navigates to `looking-back`

---

## 3. The Methodology

**id:** `methodology`
**label:** How I work

**Beats:**

First I want to understand what is already there. Some desk research. Time inside the platform. Conversations with the people doing the job today.

Then I get those people in one room. Business, tech, customer service. We surface what each side knows. The goal is to find a shared language.

Out of that comes a shared vision. A north star everyone can point to.

Then I drill down. From the big picture into details. I make a rough draft. A wireframe. Something concrete enough that people can react to it. We test it. If we are heading the wrong way, more co-creation. If we are right, we refine.

Then we ship. Watch how customers actually use it. Refine again.

I can do most of this in Dutch, French, English, or some Spanish.

**Side panel:**

- "Tell me about a concrete case" → invites the listener to ask about a specific industry or project

---

## 4. Education and Learning

**id:** `education`
**label:** Education

**Beats:**

Mixed media art, then human-computer interaction.

The art training is where I learned to think in materials and composition. The HCI degree is where that became a discipline.

Since then I kept learning. Augmented reality. Data science. Machine learning. Voice. Dozens of courses. But the real learning came from sitting next to data scientists at a machine learning startup five years ago, and watching what happened to AI after that.

Voice agents of this quality are a recent phenomenon. They bring new opportunities. I am adapting to the medium as it forms. Gathering insights on every project I work on.

---

## 5. Logistics

**id:** `logistics`
**label:** Logistics

**Beats:**

Belgium. Two teenagers at home, so I am not relocating.

I have shipped real work with people I have never met in person. Remote is normal now.

Open to travel when it matters. Getting stakeholders in one room beats six video calls.

Available on a short timeframe.

---

## 6. AI Work — Earlier Era

**id:** `ai-earlier`
**label:** AI work, before LLMs

**Beats:**

Five years ago I worked at a machine learning startup. Six months sitting next to data scientists.

That is where I saw, for the first time, how fast this medium was moving. The models were doing things that would have been research papers a year earlier.

I did not see the LLM wave coming. I do not think most people did. But I had a closer view than most by the time it arrived.

**Side panel:**

- "Tell me a concrete story from that time" → invites ArcelorMittal anecdote

---

## 7. AI Work — Current Era

**id:** `ai-current`
**label:** AI work, today

**Beats:**

I work with AI daily. Mostly through Claude, with a knowledge graph I built around it. I use Wispr Flow to dictate instead of typing, because it is faster and lets me think out loud.

I have tested a few voice agent frameworks before settling on ElevenLabs. The devil is in the details. ElevenLabs gets closest to how a human actually sounds, and the framework around it is solid enough to build real things on. I am open to new technologies. I experiment. I analyse. But I will not settle for something that does not meet the bar.

I have also experimented with hosting local AI models like Mistral, and adding guardrails on top. I have not tuned weights myself. That is a layer I am looking forward to learning from data scientists.

I am also doing research at an early-phase startup. Digital product passports for circular economy.

**Side panel:**

- "See the four voice apps I built" → expands into chronological sub-list:
  - Voice-to-blockchain (first)
  - Talk to the product (second)
  - MoMuse (third)
  - This agent (fourth)
- Link: digital product passport research

---

## 8. The ArcelorMittal Story

**id:** `arcelormittal`
**label:** The "new friend"

**Beats:**

At ArcelorMittal I built the interface for a machine learning application that optimized production.

I made it human in the loop. So it became a tool for the operators, not a replacement for their job.

There was one operator who was very critical at the start. After two months in production, I interviewed him about the application. He told me it was his new friend. I asked why. He said it helped him organize his work every day, so his inspections were better now that he had time for them.

That is what I am trying to do across every project. Not replace people. Free them to do the part that matters.

**Side panel:**

- "What does human-in-the-loop mean to you?" → invites a deeper philosophy conversation

---

## 9. Voice-to-Blockchain

**id:** `voice-blockchain`
**label:** Voice to blockchain

**Beats:**

The first voice app I built. ElevenLabs hackathon in Ghent. We won.

The case study has the full story.

**Side panel:**

- Link: [Case study](#) *(static, to be created)*
- Link: [YouTube demo](https://www.youtube.com/watch?v=zgrckrKRArU)

---

## 10. Talk to the Product

**id:** `talk-to-product`
**label:** Talk to the product

**Beats:**

The second voice app. A repair assistant where you talk to the product itself.

After about ten seconds, having a conversation with the appliance just makes sense. That is the insight I keep coming back to. Voice removes the friction of the interface.

**Side panel:**

- Link: [Case study](#) *(static, to be created)*
- Link: [Live demo](https://talk-to-product.vercel.app/)
- Link: [YouTube walkthrough](https://www.youtube.com/watch?v=Rn5IxOwl5YU)

---

## 11. MoMuse

**id:** `momuse`
**label:** MoMuse

**Beats:**

The third voice app. MoMu Fashion Hackathon, Antwerp, November 2025. We built a voice-narrated 3D experience around an eighteenth-century Kasuri kimono.

The garment speaks differently depending on who is asking. Designer, historian, child. Same object, three different stories.

We won the Bloomsbury Fashion Central Prize.

**Side panel:**

- Link: [Case study](https://momuse.vercel.app/)
- Link: [90-second demo](https://www.youtube.com/embed/373BPfhEmuQ)
- Link: [GitHub repository](https://github.com/flybylow/momu)

---

## 12. The Agent You Are Talking To

**id:** `this-agent`
**label:** This agent

**Beats:**

The fourth voice app. The one you are talking to right now.

Built in React, with ElevenLabs Conversational AI underneath, and a knowledge graph behind it. Designed in a few days. Iterated by speaking to it and noticing where it stumbled.

The point of building this was to apply for the role using the medium of the role. A working sample, not a slide deck.

**Side panel:**

- Link: GitHub repository
- Link: write-up of how it was built

---

## 13. Looking Back

**id:** `looking-back`
**label:** Looking back

**Beats:**

I have worked across manufacturing, fashion, payments, government, social workplaces. Different industries, same job.

The job is sitting between the product and the person using it. Watching what works, what does not, and translating between them.

The medium changed. Desktop, mobile, augmented reality, AI. The job did not.

What I measure myself by is not the hours I put in. It is what changed in the real world because the work happened.

**Side panel:**

- "Want a specific industry example?" → invites a free-form question about an industry

---

## 14. Open Mic

**id:** `open-mic`
**label:** Open Mic

**Beats:**

Anything I have not covered. Ask me anything.

If I do not know the answer, I will say so. I can put you in touch with Ward directly.

**Side panel:**

- Button: "Connect to Ward on WhatsApp" → triggers `connect_to_ward` tool

---

## Data structure (suggested)

```ts
type Topic = {
  id: string
  label: string
  beats: string[]           // each beat is one bubble
  side_panel?: {
    links?: { label: string; url: string }[]
    choices?: { label: string; tool: string; args: object }[]
    prompts?: string[]      // free-form invitations
  }
  sub_chapters?: Topic[]    // optional drill-down
}

const topics: Topic[] = [/* ... */]
```

Load this into the ElevenLabs agent's knowledge base. The agent system prompt (file 03) explains how to route between topics using the `navigate_to_topic` tool.
