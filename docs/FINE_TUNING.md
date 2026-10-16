# Lyra AI — Continuous Improvement & Fine-Tuning Guide

This document describes how DriveLink keeps its AI assistant (Lyra) domain-locked, rate-limit protected, and continuously improving over time through feedback telemetry and dataset fine-tuning.

---

## 1. Domain Guardrail & Rate-Limit Protection

Free LLM tiers (e.g. Groq LLaMA / OpenAI OSS) impose strict **Requests Per Minute (RPM)** and **Tokens Per Minute (TPM)** limits. When visitors query general math, homework, trivia, or recipes, burning LLM tokens risks exhausting capacity for real vehicle and investor inquiries.

To protect capacity:
1. **Zero-Token Guardrail (`isOffTopicQuery`)**:
   - Intercepts math calculations (e.g., `2+2`, `15 * 4`, equations), general coding homework, recipes, weather, and general trivia directly in `api/chat.js` and `src/lib/chatbotKnowledge.ts`.
   - Returns a polite domain redirection in `<1ms` without calling the external LLM API.
   - **Cost**: 0 Groq tokens, 0 API quota used.
2. **Strict System Prompt Enforcement**:
   - In case borderline queries reach the LLM, the system prompt explicitly forbids solving math (`2+2=4`), homework, or general trivia.
   - Lyra maintains a professional, warm focus strictly on DriveLink.

---

## 2. Feedback Collection & Continuous Improvement Loop

In `src/components/ChatbotWidget.tsx`, every response from Lyra features subtle **👍 (Helpful)** and **👎 (Needs Improvement)** reaction buttons.

### How it works:
1. When a user clicks 👍 or 👎, an asynchronous telemetry payload is dispatched to `/api/chat`:
   ```json
   {
     "action": "feedback",
     "messageId": "msg_3",
     "query": "What is drv-mesh?",
     "reply": "drv-mesh is our peer-to-peer V2V layer...",
     "rating": "positive"
   }
   ```
2. Positive feedback tags high-quality completions as gold standard training targets.
3. Negative feedback flags incomplete, ambiguous, or misclassified queries for prompt refinement or knowledge expansion.

---

## 3. Exporting the Fine-Tuning Dataset

To generate an updated, ready-to-train dataset in OpenAI / Groq / HuggingFace chat format:

```bash
npm run export:dataset
```

This compiles:
- Canonical seed Q&A pairs covering V2V tech, the 4-layer ecosystem, team, roadmap, and hiring.
- Refusal and guardrail examples (e.g. math queries politely redirected).
- All runtime-collected positive feedback pairs.

The output is written to:
```text
dataset/finetune-drivelink.jsonl
```

### JSONL Sample:
```json
{"messages":[{"role":"system","content":"You are Lyra, DriveLink's intelligent AI assistant..."},{"role":"user","content":"What is drv-mesh?"},{"role":"assistant","content":"drv-mesh is DriveLink's core peer-to-peer V2V communication layer broadcasting vehicle intent in under 50ms."}]}
```

---

## 4. How to Fine-Tune on Groq or OpenAI

### With OpenAI:
```bash
openai api fine_tunes.create -t dataset/finetune-drivelink.jsonl -m gpt-4o-mini
```

### With Groq:
1. Upload `dataset/finetune-drivelink.jsonl` to your fine-tuning pipeline or HuggingFace LoRA trainer.
2. Once deployed, set your custom model identifier in Vercel environment variables:
   ```env
   GROQ_MODEL=your-org/drivelink-lyra-v1
   ```
3. `api/chat.js` will automatically prioritize your fine-tuned model before falling back to base models.
