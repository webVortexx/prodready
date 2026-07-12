# ProdReady

> Production-grade SRE, DevOps & Engineering reference — interactive, annotated, copy-ready.

**Live site → [webvortexx.github.io/prodready](https://webvortexx.github.io/prodready/)**

---

## What's inside

| Section | Contents |
|---|---|
| ⬡ Topology | Interactive live-resource map of a K8s cluster — Service → Deployment → Pods → ConfigMap/Secret/PVC |
| ▶ Simulator | Sandboxed kubectl/helm/terraform command runner with mocked, realistic output |
| ▲ Incidents | Scenario-driven troubleshooting — diagnose a real fault against a reacting topology, then ship the fix |
| ◔ SLO Budget | Error-budget calculator — target × window matrix plus live burn-rate math |
| ☸ Manifests | Annotated Kubernetes blueprints — Deployment, Service, ConfigMap, Secret, Ingress, HPA |
| ⌨ Cheatsheets | Copy-ready command references — kubectl, Docker, Git, Linux |
| ▤ Runbooks | Step-by-step incident response guides — diagnostic flow, decision branches, root causes and fixes |
| ◎ Concepts | Architecture diagrams (K8s cluster, CI/CD pipeline) + explainers on DNS, Pods, Networking |

Every manifest field has an inline annotation. Every cheatsheet command copies on click.

---

## Roadmap

- [x] Architecture diagrams — visual topology (K8s cluster, CI/CD pipeline)
- [x] Runbooks — step-by-step incident response guides
- [x] Concepts — explainers with diagrams (DNS, pods, networking)
- [ ] Interview prep — SRE/DevOps Q&A
- [ ] CI/CD pipelines — GitHub Actions, ArgoCD patterns
- [ ] Observability — Prometheus, Grafana, alerting

---

## Stack

- **React 18 + Vite 5** — zero config, fast HMR
- **No UI libraries** — pure CSS-in-JS, monospace throughout
- **GitHub Actions** — auto-deploys to GitHub Pages on every push to `main`
- **Hash router** — deep-linkable URLs (`#/manifests/deployment`)
- **Cmd+K search** — global command palette across all content

## Run locally

```bash
git clone https://github.com/webvortexx/prodready.git
cd prodready
npm install
npm run dev
# → http://localhost:5173/prodready/
```

## Contributing

This is a living reference. If you spot something wrong or missing — open an issue or PR.

---

Built for engineers, by an engineer. No ads, no tracking, no fluff.
