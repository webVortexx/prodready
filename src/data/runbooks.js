import { COLORS } from '../constants/colors.js';

// ─────────────────────────────────────────────────────────────
// Runbooks — step-by-step incident response guides.
// Self-contained: does NOT touch commandSimulator.js, manifests.js,
// cheatsheets.js, or the Incident Simulator's data/state. Cross-links
// to the Incident Simulator (by simulatorId) and to each other (by
// runbook id) are just page-navigation hints consumed by the viewer.
//
// Step shape:
//   { id, title, commands: [{cmd, desc}], guidance, branches?: [
//       { when, note, jump?: { kind: "step"|"rootcause"|"runbook", ... } }
//   ]}
// Root cause shape:
//   { id, label, confirm, fix, crossRunbook?: runbookId }
// ─────────────────────────────────────────────────────────────

const CRASHLOOP_RUNBOOK = {
  id: "crashloop",
  title: "CrashLoopBackOff",
  subtitle: "A pod's container keeps restarting and never reaches Ready",
  icon: "↻",
  color: COLORS.configmap,
  severity: { label: "Sev2 — usually customer-facing", tone: COLORS.err },
  simulatorId: "crashloop",
  trigger: "Alert fires on restart count / crash-loop rate for a Deployment (e.g. a \"pod is crash looping\" rule on kube_pod_container_status_restarts_total), or a Service alert fires because it lost endpoints.",
  impact: "Every pod stuck in CrashLoopBackOff is a pod that can never pass its readiness probe, which means it never rejoins the Service's endpoint list. If enough replicas are affected, the Service has partial or zero capacity — users see connection errors or 502/503s, not a graceful failure.",
  symptoms: [
    "kubectl get pods shows STATUS: CrashLoopBackOff with RESTARTS climbing on every poll",
    "Service endpoints are empty or reduced (kubectl get endpoints)",
    "Dashboards show request errors or dropped capacity for the owning Deployment",
  ],
  immediateActions: [
    "If this Deployment just rolled out, roll back first and investigate after: kubectl rollout undo deploy/<name> -n <ns> — restoring traffic beats root-causing under pressure.",
    "If it's been stable for a while and only started crash-looping now, don't roll back blind — a bad rollback can make it worse. Go straight to Step 1.",
  ],
  steps: [
    {
      id: "1",
      title: "Confirm the blast radius",
      commands: [
        { cmd: "kubectl get pods -n <ns> -l app=<name>", desc: "Status + restart count for every replica" },
        { cmd: "kubectl get pods -n <ns> -o wide", desc: "Add node placement — useful if only some pods are affected" },
      ],
      guidance: "Note how many of the Deployment's replicas are affected and whether restart counts are still climbing. A single flapping pod points somewhere different than every replica going down together.",
      branches: [
        { when: "Every replica is crash-looping together", note: "Shared cause — bad rollout, bad config source, or a dependency all replicas need. Continue.", jump: { kind: "step", id: "2" } },
        { when: "Only one or two pods, the rest are healthy", note: "Check kubectl get pod -o wide for the affected pods' node(s) — if they share a node the healthy ones don't, suspect that node before the app. Still worth a describe.", jump: { kind: "step", id: "2" } },
      ],
    },
    {
      id: "2",
      title: "Get the exact failure reason from the pod itself",
      commands: [
        { cmd: "kubectl describe pod <pod> -n <ns>", desc: "Read the Events section and the container's State/Last State" },
        { cmd: "kubectl logs <pod> -n <ns> --previous", desc: "Logs from the crashed container, not the one currently restarting" },
      ],
      guidance: "The two fields that matter: the Waiting.Reason (why it hasn't started this attempt) and the Last State Terminated Reason + Exit Code (why the previous attempt died). --previous is the important flag here — without it you're reading the new container's near-empty startup log, not the crash.",
      branches: [
        { when: "Waiting reason: CreateContainerConfigError", note: "A referenced ConfigMap, Secret, or key doesn't exist. Jump to the fix.", jump: { kind: "rootcause", id: "cm" } },
        { when: "Last State Terminated — Reason: OOMKilled, Exit Code: 137", note: "This is a memory kill, not an application bug. The full diagnostic flow lives in the OOMKilled runbook.", jump: { kind: "runbook", id: "oomkill", stepId: "1" } },
        { when: "Terminated with a nonzero exit code, no OOM, log shows a stack trace / fatal error", note: "The app itself is crashing on startup. Jump to the fix.", jump: { kind: "rootcause", id: "appcrash" } },
        { when: "Status is actually ImagePullBackOff / ErrImagePull, not CrashLoopBackOff", note: "Different failure mode — the container never started at all, so there's no crash to diagnose. Check the image tag and registry auth instead; this runbook doesn't cover it.", jump: null },
      ],
    },
    {
      id: "3",
      title: "Apply the fix from the matching root cause below, then verify",
      commands: [
        { cmd: "kubectl get pods -n <ns> -l app=<name> -w", desc: "Watch restarts stop and READY reach N/N" },
        { cmd: "kubectl get endpoints <svc> -n <ns>", desc: "Confirm the Service has its full endpoint set back" },
      ],
      guidance: "Don't call it resolved off the first healthy poll — CrashLoopBackOff's backoff delay grows on each failure, so a pod can look briefly Running and then crash again on the next attempt. Watch for a couple of minutes past the point restarts stop climbing.",
    },
  ],
  rootCauses: [
    {
      id: "cm",
      label: "Missing or renamed ConfigMap / Secret",
      confirm: "kubectl get configmap,secret -n <ns> — the name referenced in the pod's volumes or env doesn't exist, or was renamed without updating the Deployment spec.",
      fix: "Recreate the ConfigMap/Secret with the expected name and keys, or update the Deployment to reference the correct name. Once the object exists, the kubelet mounts it on the next sync and the container starts.",
    },
    {
      id: "oom",
      label: "Container OOMKilled",
      confirm: "kubectl describe pod shows Reason: OOMKilled, Exit Code: 137.",
      fix: "See the OOMKilled runbook for the full diagnostic split (limit too low vs. leak vs. traffic spike vs. node pressure) — the fix depends on which of those it is.",
      crossRunbook: "oomkill",
    },
    {
      id: "appcrash",
      label: "Application crash on startup",
      confirm: "kubectl logs --previous shows an unhandled exception, a failed migration, a missing required env var, or a fatal config-parse error at boot.",
      fix: "If it's tied to a recent deploy, kubectl rollout undo deploy/<name> -n <ns> first to restore service, then fix the underlying bug (bad config value, missing env var, failed dependency check at startup) and redeploy. If a liveness probe is killing an otherwise-healthy slow-starting container, raise initialDelaySeconds/failureThreshold rather than treating it as an app bug.",
    },
  ],
  prevention: [
    "Validate in CI that every ConfigMap/Secret a manifest references actually exists in the target namespace before merge — a policy engine (e.g. Kyverno/OPA) can enforce this at apply time too.",
    "Roll out progressively (maxUnavailable tuning, or a canary/blue-green strategy) so a bad image or config takes down a fraction of replicas, not all of them at once.",
    "Keep liveness and readiness probes distinct — liveness should only check \"is this process alive,\" not deep dependency health, or one flaky dependency restarts every pod that depends on it.",
    "Alert on ConfigMap/Secret deletion or mutation via audit logging so a dropped object is caught before the next rollout, not after.",
  ],
};

const OOMKILL_RUNBOOK = {
  id: "oomkill",
  title: "OOMKilled",
  subtitle: "A container is repeatedly killed for exceeding its memory limit",
  icon: "▦",
  color: COLORS.secret,
  severity: { label: "Sev2 — often cascades downstream", tone: COLORS.err },
  simulatorId: "oomkill",
  trigger: "Alert on restart count or on container_memory_working_set_bytes tracking near the container's memory limit, or a downstream queue/consumer alert fires because a worker's Service lost endpoints.",
  impact: "Each OOM kill drops a replica's capacity for the seconds it takes to restart, and if it's cyclical, the pod may never accumulate enough consecutive healthy time to pass readiness. Downstream, anything relying on that workload (a queue, a batch pipeline, a request path) backs up or times out.",
  symptoms: [
    "kubectl get pods shows RESTARTS climbing with STATUS cycling through CrashLoopBackOff",
    "kubectl describe pod shows Last State: Terminated, Reason: OOMKilled, Exit Code: 137",
    "Downstream consumers/queues show growing backlog or timeouts against the affected Service",
  ],
  immediateActions: [
    "If only this workload is affected and a quick memory-limit bump is safe (headroom exists on the node), doing that buys breathing room while you find the real cause — but treat it as a mitigation, not a fix, until you know why usage grew.",
    "If multiple unrelated pods on the same node are also unhealthy, this may be node-level memory pressure rather than one container's limit — check Step 2 before touching any single Deployment's limits.",
  ],
  steps: [
    {
      id: "1",
      title: "Confirm the OOM signature",
      commands: [
        { cmd: "kubectl describe pod <pod> -n <ns>", desc: "Confirm Reason: OOMKilled and Exit Code: 137 in Last State" },
        { cmd: "kubectl get pod <pod> -n <ns> -o jsonpath='{.spec.containers[*].resources}'", desc: "Read the current memory requests/limits" },
      ],
      guidance: "Exit code 137 is 128 + SIGKILL(9) — the kernel's cgroup OOM killer terminated the process because it hit the container's memory limit. This is a hard kill; the container gets no chance to clean up or log a stack trace, so you won't find a reason in the app's own logs.",
      branches: [
        { when: "This pod is OOMKilled, other pods on the same node are unaffected", note: "Container-level: this specific container hit its own cgroup limit. Continue to Step 2.", jump: { kind: "step", id: "2" } },
        { when: "Several unrelated pods on the same node show Status: Evicted (not OOMKilled)", note: "That's a different mechanism — node-level memory pressure eviction, not a per-container limit kill. Skip to that root cause.", jump: { kind: "rootcause", id: "node" } },
      ],
    },
    {
      id: "2",
      title: "Characterize the usage pattern, not just the kill",
      commands: [
        { cmd: "kubectl top pod <pod> -n <ns>", desc: "Current memory snapshot vs. the limit from Step 1" },
        { cmd: "(dashboard) container_memory_working_set_bytes for this pod, last few hours", desc: "Shape of usage leading up to the kill" },
      ],
      guidance: "A single kubectl top snapshot only tells you where memory sits right now. The shape of usage over time is what actually distinguishes the root causes below — pull it from whatever metrics stack the cluster ships to (Prometheus/Grafana or equivalent).",
      branches: [
        { when: "Usage sits close to the limit even under normal, steady load", note: "The limit is undersized for this workload's real footprint.", jump: { kind: "rootcause", id: "undersized" } },
        { when: "Usage climbs steadily over the container's lifetime and resets on each restart (sawtooth)", note: "Classic memory-leak shape.", jump: { kind: "rootcause", id: "leak" } },
        { when: "Usage was fine, then spiked right before the kill, correlated with a deploy/traffic burst/large batch", note: "A one-off spike exceeded capacity, not a structural problem with the limit.", jump: { kind: "rootcause", id: "spike" } },
      ],
    },
    {
      id: "3",
      title: "Apply the fix from the matching root cause below, then verify",
      commands: [
        { cmd: "kubectl rollout status deploy/<name> -n <ns>", desc: "Confirm the updated pods are rolled out and Ready" },
        { cmd: "kubectl top pod -n <ns> -l app=<name>", desc: "Confirm steady-state usage now sits with real headroom under the limit, not pegged near it" },
      ],
      guidance: "\"Restarts stopped\" isn't enough on its own — a limit raised just far enough to survive today's load will OOM again the next time traffic grows. Confirm there's actual margin.",
    },
  ],
  rootCauses: [
    {
      id: "undersized",
      label: "Memory limit too low for steady-state usage",
      confirm: "kubectl top pod / dashboard shows usage consistently near the limit even without a leak or a spike.",
      fix: "Raise requests and limits based on observed p95/p99 usage plus real headroom — if a VPA (Vertical Pod Autoscaler) is running in recommendation mode, treat its numbers as a starting point, not gospel.",
    },
    {
      id: "leak",
      label: "Memory leak in the application",
      confirm: "Usage climbs monotonically over the container's lifetime and resets cleanly on restart — a sawtooth pattern in the metrics.",
      fix: "This needs an application-level fix (heap profiling, checking for unbounded caches/connection pools/event listeners that never release). A scheduled restart can mask the symptom short-term but is a stall, not a fix — say so explicitly when you use it as a mitigation.",
    },
    {
      id: "spike",
      label: "Traffic or payload spike exceeded capacity",
      confirm: "Usage was flat and healthy, then jumped sharply right before the kill, correlated with a deploy, a traffic burst, or an unusually large message/batch.",
      fix: "If it's recurring load growth, scale horizontally (HPA) rather than just raising the memory ceiling. If it's a small number of oversized requests/messages, add a size limit or backpressure at the edge instead of sizing every pod for the worst case.",
    },
    {
      id: "node",
      label: "Node-level memory pressure (not a container OOM kill)",
      confirm: "Multiple unrelated pods on the same node show Status: Evicted with a memory-pressure reason, rather than each hitting its own container-level OOMKilled. kubectl describe node <node> shows a MemoryPressure condition.",
      fix: "This is a node capacity problem, not one Deployment's limit — right-size the node pool, rebalance workloads across nodes, or find a noisy-neighbor pod without limits set that's starving the others. Raising one Deployment's memory limit won't fix this and can make node pressure worse.",
    },
  ],
  prevention: [
    "Set memory requests/limits from real observed usage (a percentile of actual traffic), not a guess — and revisit them as traffic grows.",
    "Run a VPA in recommendation mode (or review usage dashboards on a schedule) to catch limits drifting out of date before they cause a kill.",
    "Alert on containers sustained above ~80-90% of their memory limit, so undersized limits get caught before the kill, not after.",
    "Set resource requests on every pod in a namespace (enforced via a LimitRange or ResourceQuota) so one unbounded pod can't starve node memory out from under its neighbors.",
  ],
};

const HTTP5XX_RUNBOOK = {
  id: "http5xx",
  title: "Service returning 5xxs",
  subtitle: "Elevated error rate on a Service, ingress, or gateway",
  icon: "⊘",
  color: COLORS.ingress,
  severity: { label: "Sev1–Sev2 — directly customer-facing", tone: COLORS.err },
  simulatorId: null,
  trigger: "Alert on elevated 5xx rate (ingress/gateway metrics or a synthetic probe), or SLO error-budget burn-rate alert (see the SLO Budget calculator) crossing threshold.",
  impact: "Every 5xx is a failed user request. Depending on scope this ranges from a degraded feature to a full outage, and if callers retry aggressively on failure, error volume can amplify load on whatever's already struggling.",
  symptoms: [
    "Elevated 5xx rate in ingress/gateway access logs or dashboards",
    "Possibly paired with a latency spike as things start failing slow before they fail outright",
    "Synthetic/uptime checks failing, or user reports of error pages / failed requests",
  ],
  immediateActions: [
    "If this correlates with a very recent deploy to the affected Service, roll it back immediately: kubectl rollout undo deploy/<name> -n <ns> — restore service, root-cause after.",
    "If retries are visibly amplifying load on a struggling downstream (queue depth, DB connections climbing), consider shedding load or disabling the noisiest retrying caller before it makes things worse.",
  ],
  steps: [
    {
      id: "1",
      title: "Scope the blast radius",
      commands: [
        { cmd: "kubectl get ingress -n <ns>", desc: "Confirm which Services/routes are behind the affected ingress" },
        { cmd: "(dashboard) 5xx rate broken out by route/Service", desc: "Is this one Service or everything behind the gateway?" },
      ],
      guidance: "This is the single most useful triage question: one service degraded points at that service or its immediate dependency; everything degraded points at shared infrastructure.",
      branches: [
        { when: "Multiple unrelated Services are degraded at once", note: "Shared cause — the ingress controller itself, DNS, a cluster-wide dependency (shared DB/cache), or a platform-level rollout. Investigate the shared layer directly rather than any one Service's pods.", jump: { kind: "rootcause", id: "shared" } },
        { when: "Just one Service is affected", note: "Continue to check that Service's own health.", jump: { kind: "step", id: "2" } },
      ],
    },
    {
      id: "2",
      title: "Check whether the Service has healthy backends at all",
      commands: [
        { cmd: "kubectl get endpoints <svc> -n <ns>", desc: "Empty or reduced endpoint list means pods aren't passing readiness" },
        { cmd: "kubectl get pods -n <ns> -l app=<svc>", desc: "Are the pods even Ready?" },
      ],
      guidance: "5xxs from a Service with no healthy endpoints is really a pod-health problem wearing a routing symptom.",
      branches: [
        { when: "Endpoints are empty or reduced — pods aren't Ready", note: "This is a pod-health investigation now. Depending on what kubectl describe pod shows, follow the CrashLoopBackOff or OOMKilled runbook.", jump: { kind: "runbook", id: "crashloop", stepId: "2" } },
        { when: "Endpoints look full and healthy", note: "Routing to the app is fine — the 5xx is coming from within the request path itself. Continue.", jump: { kind: "step", id: "3" } },
      ],
    },
    {
      id: "3",
      title: "Find where in the chain the 5xx actually originates",
      commands: [
        { cmd: "(ingress/gateway access logs) filter by upstream status + backend", desc: "Is the proxy layer returning the 5xx, or is it passing through an app-generated status?" },
        { cmd: "kubectl logs <pod> -n <ns> --tail=200", desc: "App-level errors, stack traces, timeouts to a downstream" },
      ],
      guidance: "The exact code narrows this a lot: 502/503 usually means the proxy couldn't get a valid response from any backend at all; 504 means a backend was reachable but too slow; a 500 straight from the app is an application-level failure, not a routing one.",
      branches: [
        { when: "502/503 at the proxy layer, connections refused or no backend reachable", note: "Backend isn't accepting connections — could still be a readiness gap (recheck Step 2) or the app crashed its listener / is on the wrong port.", jump: { kind: "rootcause", id: "refusing" } },
        { when: "504 gateway timeout, backend is reachable but slow", note: "Check CPU throttling on the pod and latency on whatever it calls downstream.", jump: { kind: "rootcause", id: "slow" } },
        { when: "500 returned directly by the application", note: "App-level exception. Check logs for a stack trace and whether a recent deploy correlates.", jump: { kind: "rootcause", id: "appexception" } },
      ],
    },
    {
      id: "4",
      title: "Correlate with a recent change",
      commands: [
        { cmd: "kubectl rollout history deploy/<name> -n <ns>", desc: "Recent revisions and roughly when they landed" },
        { cmd: "kubectl get events -n <ns> --sort-by='.lastTimestamp'", desc: "Recent cluster-level events for this namespace" },
      ],
      guidance: "Almost every 5xx incident has a trigger: a deploy, a config or feature-flag change, a dependency's own incident, or a genuine traffic spike. Find which one before calling the root cause found.",
    },
    {
      id: "5",
      title: "Verify resolution",
      commands: [
        { cmd: "(dashboard) 5xx rate back to baseline", desc: "Confirm error rate, not just that alerting went quiet" },
        { cmd: "(SLO Budget calculator) burn rate back under 1.0x", desc: "Confirms the error budget is no longer draining faster than sustainable" },
      ],
      guidance: "A dropped alert doesn't always mean fixed — check the actual error rate and, if you're tracking one, the SLO burn rate.",
    },
  ],
  rootCauses: [
    {
      id: "shared",
      label: "Shared/cluster-level dependency or ingress problem",
      confirm: "Multiple unrelated Services are erroring at once — points away from any single Deployment.",
      fix: "Check the ingress controller's own health and recent changes, cluster DNS, and any dependency shared across services (a common DB, cache, or auth service). Fix at that shared layer; individual Service restarts won't help.",
    },
    {
      id: "refusing",
      label: "Backend refusing or unreachable connections",
      confirm: "Proxy logs show 502/503 with connection refused or no upstream available, but the Service has endpoints listed.",
      fix: "Check whether the app is actually listening on the port the Service expects, whether a recent change broke the listener, and re-verify readiness — a pod can be 'Ready' by a stale probe result briefly during a rollout.",
    },
    {
      id: "slow",
      label: "Backend too slow — downstream dependency or resource throttling",
      confirm: "504s at the proxy; kubectl top pod shows the container near its CPU limit, or app logs show timeouts calling a downstream dependency.",
      fix: "If it's CPU throttling, raise CPU limits/requests or scale out with HPA so latency doesn't cross the caller's timeout. If it's a downstream dependency, that dependency needs its own fix — mitigate with circuit breaking / backoff so its slowness doesn't cascade into your 5xxs.",
    },
    {
      id: "appexception",
      label: "Application-level exception",
      confirm: "500s originate from the app itself; logs show a stack trace or unhandled error, often right after a deploy.",
      fix: "If tied to a recent deploy, kubectl rollout undo deploy/<name> -n <ns> to restore service immediately, then fix the bug and redeploy. If it's an unhandled failure from a dependency call, add explicit error handling so a dependency hiccup degrades gracefully instead of 500ing.",
    },
  ],
  prevention: [
    "Progressive delivery (canary or blue/green) with automatic rollback on elevated error rate, so a bad deploy self-heals before it becomes a full incident.",
    "Circuit breakers, retries with backoff, and timeouts tuned to the dependency's real SLA — so one slow dependency doesn't cascade into 5xxs everywhere it's called from.",
    "Readiness probes that actually check the app's ability to serve traffic, so unhealthy pods are pulled from the Service before they generate errors, not after.",
    "Track error-budget burn rate (SLO Budget calculator) as a leading indicator, so a degrading trend is caught before it crosses into a paging incident.",
  ],
};

export const RUNBOOKS = [CRASHLOOP_RUNBOOK, OOMKILL_RUNBOOK, HTTP5XX_RUNBOOK];
