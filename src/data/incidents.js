import { COLORS } from '../constants/colors.js';

// ─────────────────────────────────────────────────────────────
// Incident Simulator — scenario data
// Self-contained: does NOT touch commandSimulator.js or its data.
// Each incident bundles a mini topology + a diagnosis checklist
// (regex-matched against typed commands) + a fix.
// ─────────────────────────────────────────────────────────────

const CRASHLOOP = {
  id: "crashloop",
  title: "CrashLoopBackOff",
  difficulty: "Beginner",
  color: COLORS.configmap,
  premise: "checkout-api pods keep restarting and never go Ready. Customers on the checkout page are seeing 503s.",
  resource: { kind: "Deployment", name: "checkout-api", namespace: "prod" },

  topology: {
    nodes: [
      { id: "svc",   label: "SERVICE",    icon: "◈", color: COLORS.service,    x: 50, y: 10, sub: "checkout-api · 3/3 endpoints", subBroken: "checkout-api · 0/3 endpoints" },
      { id: "deploy",label: "DEPLOYMENT", icon: "⬡", color: COLORS.deployment, x: 50, y: 34, sub: "checkout-api · 3/3 ready",       subBroken: "checkout-api · 0/3 ready" },
      { id: "pod1",  label: "POD",        icon: "▸", color: COLORS.pod,        x: 20, y: 58, sub: "1/1 Running",                   subBroken: "0/1 CrashLoopBackOff" },
      { id: "pod2",  label: "POD",        icon: "▸", color: COLORS.pod,        x: 50, y: 58, sub: "1/1 Running",                   subBroken: "0/1 CrashLoopBackOff" },
      { id: "pod3",  label: "POD",        icon: "▸", color: COLORS.pod,        x: 80, y: 58, sub: "1/1 Running",                   subBroken: "0/1 CrashLoopBackOff" },
      { id: "cm",    label: "CONFIGMAP",  icon: "⊞", color: COLORS.configmap,  x: 50, y: 86, sub: "checkout-cfg · present",        subBroken: "checkout-cfg · not found", root: true },
    ],
    connections: [
      { from: "svc", to: "deploy" },
      { from: "deploy", to: "pod1" }, { from: "deploy", to: "pod2" }, { from: "deploy", to: "pod3" },
      { from: "pod1", to: "cm" }, { from: "pod2", to: "cm" }, { from: "pod3", to: "cm" },
    ],
    unhealthy: ["svc", "deploy", "pod1", "pod2", "pod3", "cm"],
  },

  objectives: [
    {
      id: "check-pods",
      label: "Check pod status",
      hint: "kubectl get pods -n prod",
      match: /^kubectl\s+get\s+pods?\b/i,
      output:
`NAMESPACE   NAME                            READY   STATUS             RESTARTS   AGE
prod        checkout-api-7d9f8b6c9-4kxlp    0/1     CrashLoopBackOff   6          14m
prod        checkout-api-7d9f8b6c9-9zqwr    0/1     CrashLoopBackOff   6          14m
prod        checkout-api-7d9f8b6c9-mjs2t    0/1     CrashLoopBackOff   5          14m`,
      clue: "All 3 checkout-api pods are stuck in CrashLoopBackOff with rising restart counts — the container isn't starting cleanly.",
    },
    {
      id: "describe-pod",
      label: "Inspect a failing pod",
      hint: "kubectl describe pod checkout-api-7d9f8b6c9-4kxlp",
      match: /^kubectl\s+describe\s+pods?\b/i,
      output:
`Name:         checkout-api-7d9f8b6c9-4kxlp
Namespace:    prod
Status:       Pending

Volumes:
  config:
    Type:      ConfigMap
    Name:      checkout-cfg
    Optional:  false

Events:
  Type     Reason       Age                From     Message
  ----     ------       ----               ----     -------
  Warning  FailedMount  14m (x8 over 14m)  kubelet  MountVolume.SetUp failed for volume "config" : configmap "checkout-cfg" not found
  Warning  BackOff      2m (x40 over 13m)  kubelet  Back-off restarting failed container`,
      clue: 'The pod can\'t mount its config volume — ConfigMap "checkout-cfg" not found. That\'s why the container never starts.',
    },
    {
      id: "check-cm",
      label: "Confirm the ConfigMap is missing",
      hint: "kubectl get configmap -n prod",
      match: /^kubectl\s+get\s+(configmaps?|cm)\b/i,
      output:
`NAMESPACE   NAME               DATA   AGE
prod        kube-root-ca.crt   1      41d`,
      clue: "Confirmed — checkout-cfg does not exist in the prod namespace. Root cause identified.",
    },
  ],

  fix: {
    match: /^kubectl\s+(create|apply)\b.*(configmap|cm)\b/i,
    command: "kubectl create configmap checkout-cfg --from-literal=LOG_LEVEL=info -n prod",
    output: "configmap/checkout-cfg created",
    tooEarly: "Hold on — the root cause isn't confirmed yet. Work through the checklist on the left (check pods → describe pod → check configmaps) before applying a fix.",
    rootCause: "The checkout-api Deployment mounts a ConfigMap named checkout-cfg as a volume, but the ConfigMap was never created — most likely dropped from the last manifest apply, or renamed without updating the Deployment spec.",
    resolution: "Created the missing checkout-cfg ConfigMap. The kubelet mounts the volume on the next sync, the container starts cleanly, and all 3 pods pass their readiness probes — traffic resumes through the Service.",
  },
};

const OOMKILL = {
  id: "oomkill",
  title: "OOMKilled cascade",
  difficulty: "Intermediate",
  color: COLORS.secret,
  premise: "worker-queue pods are restarting repeatedly and the Service has lost endpoints. Downstream jobs are backing up.",
  resource: { kind: "Deployment", name: "worker-queue", namespace: "prod" },

  topology: {
    nodes: [
      { id: "client",label: "CLIENTS",    icon: "⬢", color: COLORS.external,   x: 50, y: 6,  sub: "job-scheduler · nominal",  subBroken: "job-scheduler · queue backing up" },
      { id: "svc",   label: "SERVICE",    icon: "◈", color: COLORS.service,    x: 50, y: 28, sub: "worker-queue · 3/3 endpoints", subBroken: "worker-queue · 0/3 endpoints" },
      { id: "deploy",label: "DEPLOYMENT", icon: "⬡", color: COLORS.deployment, x: 50, y: 50, sub: "mem limit 256Mi",           subBroken: "mem limit 64Mi", root: true },
      { id: "pod1",  label: "POD",        icon: "▸", color: COLORS.pod,        x: 20, y: 74, sub: "1/1 Running",              subBroken: "0/1 OOMKilled" },
      { id: "pod2",  label: "POD",        icon: "▸", color: COLORS.pod,        x: 50, y: 74, sub: "1/1 Running",              subBroken: "0/1 OOMKilled" },
      { id: "pod3",  label: "POD",        icon: "▸", color: COLORS.pod,        x: 80, y: 74, sub: "1/1 Running",              subBroken: "1/1 Running · flapping" },
    ],
    connections: [
      { from: "client", to: "svc" }, { from: "svc", to: "deploy" },
      { from: "deploy", to: "pod1" }, { from: "deploy", to: "pod2" }, { from: "deploy", to: "pod3" },
    ],
    unhealthy: ["client", "svc", "deploy", "pod1", "pod2", "pod3"],
  },

  objectives: [
    {
      id: "check-pods",
      label: "Check pod status",
      hint: "kubectl get pods -n prod",
      match: /^kubectl\s+get\s+pods?\b/i,
      output:
`NAMESPACE   NAME                            READY   STATUS      RESTARTS   AGE
prod        worker-queue-5c8f9d7b4-2plq7    0/1     OOMKilled   9          22m
prod        worker-queue-5c8f9d7b4-8hqxk    0/1     OOMKilled   8          22m
prod        worker-queue-5c8f9d7b4-wz310    1/1     Running     11         22m`,
      clue: "Two of three worker-queue pods are OOMKilled right now, and the third has already restarted 11 times — this is memory pressure, not a code crash.",
    },
    {
      id: "describe-pod",
      label: "Inspect a failing pod",
      hint: "kubectl describe pod worker-queue-5c8f9d7b4-2plq7",
      match: /^kubectl\s+describe\s+pods?\b/i,
      output:
`Name:         worker-queue-5c8f9d7b4-2plq7
Namespace:    prod

Containers:
  worker:
    State:        Waiting
      Reason:      CrashLoopBackOff
    Last State:    Terminated
      Reason:      OOMKilled
      Exit Code:   137
    Limits:
      memory:      64Mi
    Requests:
      memory:      64Mi

Events:
  Type     Reason      Age               From     Message
  ----     ------      ----              ----     -------
  Warning  OOMKilling  3m (x9 over 20m)  kubelet  Memory cgroup out of memory: killed process (worker), total-vm exceeded limit`,
      clue: "Exit code 137 confirms OOMKilled — the container's memory limit is only 64Mi, and the process exceeds it under normal load.",
    },
    {
      id: "check-endpoints",
      label: "Check Service endpoints",
      hint: "kubectl get endpoints worker-queue-svc -n prod",
      match: /^kubectl\s+(get\s+(endpoints|ep)\b|describe\s+(service|svc)\b)/i,
      output:
`NAME               ENDPOINTS   AGE
worker-queue-svc   <none>      22m`,
      clue: "worker-queue-svc has zero healthy endpoints — every pod keeps failing its readiness probe, so the Service can't route traffic anywhere. That's the cascading failure hitting the job scheduler.",
    },
  ],

  fix: {
    match: /^kubectl\s+(set\s+resources|patch)\b.*(deploy|deployment)\b/i,
    command: "kubectl set resources deployment/worker-queue -c=worker --limits=memory=256Mi --requests=memory=256Mi",
    output: "deployment.apps/worker-queue resource requirements updated",
    tooEarly: "Hold on — the root cause isn't confirmed yet. Work through the checklist on the left (check pods → describe pod → check endpoints) before applying a fix.",
    rootCause: "The worker-queue container's memory limit (64Mi) was set well below what the process needs under real load. The kernel OOM-kills the process every time usage crosses that ceiling, which restarts the container and repeatedly fails its readiness probe.",
    resolution: "Raised the memory limit to 256Mi and rolled the Deployment. Pods stop OOM-killing, pass their readiness probes, the Service regains healthy endpoints, and the job queue drains.",
  },
};

export const INCIDENTS = [CRASHLOOP, OOMKILL];

function normalize(raw) {
  return String(raw || "").trim().replace(/^k\b/, "kubectl");
}

function genericFallback(command) {
  const c = command.toLowerCase();
  if (c.includes("logs")) return "No unusual log output for this context — logs are quiet aside from the restarts already visible in `get pods`.";
  if (/^kubectl\s+get\b/.test(c)) return "No resources found matching this query in the current scenario.";
  if (/^kubectl\s+describe\b/.test(c)) return "No additional detail for this resource — try describing the pod that's actually failing.";
  if (/^kubectl\b/.test(c)) return "Command accepted. No new findings — try inspecting the resources shown in the topology panel.";
  return `command not recognized: ${command.split(" ")[0] || command}`;
}

/**
 * Evaluate a typed command against an incident's checklist + fix.
 * Returns one of:
 *   { type: "objective", objectiveId, output, clue }
 *   { type: "fix-attempt", command }
 *   { type: "generic", output }
 */
export function getIncidentResponse(incident, rawCommand) {
  const command = normalize(rawCommand);
  if (incident.fix.match.test(command)) {
    return { type: "fix-attempt", command: rawCommand.trim() };
  }
  for (const objective of incident.objectives) {
    if (objective.match.test(command)) {
      return { type: "objective", objectiveId: objective.id, output: objective.output, clue: objective.clue };
    }
  }
  return { type: "generic", output: genericFallback(command) };
}
