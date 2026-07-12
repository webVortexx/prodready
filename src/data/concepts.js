import { COLORS } from '../constants/colors.js';

// ─────────────────────────────────────────────────────────────
// Concepts — architecture diagrams + explainers.
// Self-contained: does NOT touch resourceInfo.js, ClusterTopology.jsx,
// or any other existing data. Rendered by ConceptDiagram.jsx /
// ConceptsViewer.jsx.
//
// Architecture node shape:
//   { id, label, sub, icon, color, x, y, detail?: { what, facts, why } }
// Connection shape:
//   { from, to, label?, dashed?, color? }
// ─────────────────────────────────────────────────────────────

export const ARCHITECTURE = [
  {
    id: "k8s-cluster",
    title: "Kubernetes Cluster",
    icon: "⬡",
    color: COLORS.cluster,
    intro: "A cluster splits into two planes with very different jobs: the control plane decides what should happen, and worker nodes make it happen. Every arrow below is a real API call or a real watch — click a component for what it actually does.",
    zones: [
      { id: "cp", label: "CONTROL PLANE", x: 3, y: 4, w: 94, h: 44 },
      { id: "wn", label: "WORKER NODE  ×N", x: 3, y: 54, w: 94, h: 43 },
    ],
    nodes: [
      {
        id: "apiserver", label: "API SERVER", sub: "kube-apiserver", icon: "◈", color: COLORS.external, x: 50, y: 15,
        detail: {
          what: "The front door to the entire cluster. Every read and write — kubectl, the scheduler, controllers, every kubelet — goes through the API server's REST interface. Nothing talks to etcd directly except the API server itself.",
          facts: [
            "Validates and admits every object (schema validation, admission webhooks) before it's persisted",
            "The only component with direct access to etcd",
            "Stateless — you can run several replicas behind a load balancer for HA",
          ],
          why: "Centralizing all access through one authenticated, audited, validated interface is what makes the whole declarative model safe — every other component just watches or writes through it.",
        },
      },
      {
        id: "etcd", label: "ETCD", sub: "cluster state store", icon: "▣", color: COLORS.pvc, x: 18, y: 36,
        detail: {
          what: "A distributed, strongly-consistent key-value store. It holds the entire desired and last-known state of the cluster — every object you've ever applied.",
          facts: [
            "Uses the Raft consensus algorithm; typically run as a 3 or 5 node cluster for quorum",
            "Only the API server reads/writes it directly",
            "Losing etcd (without backups) means losing the cluster's entire state",
          ],
          why: "It's the source of truth. If etcd disagrees with reality, controllers will keep reconciling until reality matches etcd — that's the whole reconciliation loop.",
        },
      },
      {
        id: "scheduler", label: "SCHEDULER", sub: "kube-scheduler", icon: "◔", color: COLORS.hpa, x: 50, y: 36,
        detail: {
          what: "Watches the API server for Pods that exist but have no node assigned yet, picks the best node for each one, and writes that decision back as a binding.",
          facts: [
            "Filters nodes by hard constraints first (resource requests, taints/tolerations, nodeSelector/affinity)",
            "Then scores the remaining candidates (spread, resource balance) and picks the best",
            "Only decides placement — it doesn't actually start anything, that's the kubelet's job",
          ],
          why: "Separating 'where should this run' from 'actually run it' is what lets scheduling policy evolve independently of node agents.",
        },
      },
      {
        id: "controllermgr", label: "CONTROLLER MANAGER", sub: "kube-controller-manager", icon: "↻", color: COLORS.configmap, x: 82, y: 36,
        detail: {
          what: "Runs a bundle of independent control loops — Deployment, ReplicaSet, Node, Endpoints/EndpointSlice, ServiceAccount controllers and more — each one watching the API server and nudging current state toward desired state.",
          facts: [
            "Each controller is a simple loop: observe → diff against desired state → act",
            "This is the reconciliation pattern every custom controller/operator in the ecosystem also follows",
            "If a Node stops reporting, the Node controller is what eventually marks its Pods for rescheduling",
          ],
          why: "This is 'declarative' made real — you never tell Kubernetes how to get to 3 replicas, you just say '3 replicas' and a controller keeps making it true.",
        },
      },
      {
        id: "kubelet", label: "KUBELET", sub: "node agent", icon: "◉", color: COLORS.deployment, x: 22, y: 68,
        detail: {
          what: "The agent that runs on every node. It watches the API server for Pods assigned to its node, and makes sure the containers described in each PodSpec are actually running and healthy.",
          facts: [
            "Talks to the container runtime through the Container Runtime Interface (CRI), not directly",
            "Runs liveness/readiness/startup probes and reports the results back as Pod status",
            "If a container fails a probe, the kubelet restarts it locally — it doesn't ask the control plane first",
          ],
          why: "It's the bridge between 'the API server says this Pod should exist' and an actual running process — the control plane never touches containers directly, only the kubelet does.",
        },
      },
      {
        id: "kubeproxy", label: "KUBE-PROXY", sub: "Service routing", icon: "⇄", color: COLORS.service, x: 50, y: 68,
        detail: {
          what: "Runs on every node and programs local networking rules (iptables or IPVS, depending on mode) so traffic sent to a Service's ClusterIP gets transparently routed to one of its healthy backing Pods.",
          facts: [
            "Watches Service and EndpointSlice objects on the API server to keep its rules current",
            "Doesn't proxy traffic through userspace in modern clusters — it programs the kernel's own packet rules, so the actual routing has near-zero overhead",
            "This is what makes a Service's virtual IP actually resolve to something reachable",
          ],
          why: "Pod IPs are ephemeral; kube-proxy is the mechanism that makes a stable Service IP actually reach whichever Pods are healthy right now.",
        },
      },
      {
        id: "runtime", label: "CONTAINER RUNTIME", sub: "containerd / CRI-O", icon: "▦", color: COLORS.node, x: 78, y: 68,
        detail: {
          what: "The software that actually pulls images and runs containers, invoked by the kubelet through the CRI.",
          facts: [
            "containerd and CRI-O are the two dominant CRI-compliant runtimes today",
            "Docker Engine itself is no longer used as the runtime (dockershim was removed in 1.24) — but images stay OCI-compatible either way",
          ],
          why: "Decoupling Kubernetes from any one container engine via the CRI is what let the ecosystem move off Docker Engine without breaking a single workload's image format.",
        },
      },
      { id: "poda", label: "POD", sub: "app container(s)", icon: "▸", color: COLORS.pod, x: 32, y: 92 },
      { id: "podb", label: "POD", sub: "app container(s)", icon: "▸", color: COLORS.pod, x: 68, y: 92 },
    ],
    connections: [
      { from: "apiserver", to: "etcd", label: "read/write state" },
      { from: "scheduler", to: "apiserver", label: "watch + bind" },
      { from: "controllermgr", to: "apiserver", label: "watch + reconcile" },
      { from: "apiserver", to: "kubelet", label: "pod specs · status" },
      { from: "kubeproxy", to: "apiserver", label: "watch services", dashed: true },
      { from: "kubelet", to: "runtime", label: "CRI" },
      { from: "kubelet", to: "poda" },
      { from: "kubelet", to: "podb" },
    ],
  },
  {
    id: "cicd-pipeline",
    title: "CI/CD Pipeline",
    icon: "▤",
    color: COLORS.hpa,
    intro: "The path from a commit to running production code, with the two decision points that actually matter: whether a human (or a policy) has to approve before production, and what happens automatically when a deploy turns out to be bad.",
    zones: [],
    nodes: [
      {
        id: "commit", label: "COMMIT", sub: "git push", icon: "◆", color: COLORS.textDim, x: 8, y: 22,
        detail: {
          what: "A developer pushes a commit or opens a pull request. This is the trigger for everything downstream.",
          facts: ["Branch protection + required PR review is the first quality gate, before any pipeline runs", "Trunk-based development (short-lived branches, frequent merges to main) keeps this loop fast"],
          why: "Everything in CI/CD is triggered off a change to source control — it's the single event the rest of the pipeline reacts to.",
        },
      },
      {
        id: "build", label: "BUILD", sub: "compile + image", icon: "⬡", color: COLORS.deployment, x: 30, y: 22,
        detail: {
          what: "CI (GitHub Actions, GitLab CI, Jenkins, etc.) checks out the code, compiles/bundles it, and builds a container image.",
          facts: ["Should produce one immutable, addressable artifact (an image digest) — the same artifact that gets tested is the one that gets deployed", "Layer caching is usually the biggest lever for build speed"],
          why: "Building once and promoting that exact artifact through every later stage is what guarantees 'it passed tests' actually describes what's running in production.",
        },
      },
      {
        id: "test", label: "TEST", sub: "unit · integration · scan", icon: "☑", color: COLORS.ok, x: 54, y: 22,
        detail: {
          what: "Automated tests run against the build artifact: unit tests, integration tests, and usually a static/security scan (dependency vulnerabilities, secret scanning, image CVE scan).",
          facts: ["A failing test here should hard-block the pipeline — nothing untested should reach a registry a deploy step can pull from", "Security scanning here is much cheaper than finding the same CVE in production"],
          why: "This is the last automated checkpoint before an artifact becomes deployable — it's the gate that makes 'merged to main' mean something.",
        },
      },
      {
        id: "registry", label: "REGISTRY", sub: "push image", icon: "▦", color: COLORS.node, x: 78, y: 22,
        detail: {
          what: "The tested image is pushed to a container registry (GHCR, ECR, GCR, Docker Hub, Artifactory) tagged with an immutable reference — usually the git SHA, not a mutable tag like `latest`.",
          facts: ["Immutable, content-addressable tags (digests) are what make rollback reliable — you're pointing at an exact known-good artifact, not a tag someone might overwrite", "This is also a natural point to sign images (cosign/Sigstore) for supply-chain verification"],
          why: "The registry is the handoff point between 'CI builds things' and 'CD deploys things' — everything after this reads from here, nothing rebuilds.",
        },
      },
      {
        id: "stage", label: "DEPLOY: STAGING", sub: "auto-deploy", icon: "▸", color: COLORS.external, x: 22, y: 72,
        detail: {
          what: "The image is automatically rolled out to a staging/pre-prod environment — often via GitOps (ArgoCD/Flux watching a manifests repo) rather than the CI pipeline pushing directly.",
          facts: ["Staging should mirror production's config shape closely enough that a pass there is meaningful", "Smoke tests or a synthetic check often run here before promotion is allowed"],
          why: "This is where you catch environment-specific issues (config, integration with real dependencies) that unit/integration tests in CI can't.",
        },
      },
      {
        id: "gate", label: "APPROVAL GATE", sub: "manual or policy", icon: "◔", color: COLORS.secret, x: 50, y: 72,
        detail: {
          what: "A checkpoint before production — either a human clicking approve, or an automated policy gate (all staging checks green, error budget healthy, outside a change freeze window).",
          facts: ["Not every team needs a human here — mature pipelines often replace it with automated policy checks plus progressive delivery instead", "This is the point where 'can deploy' and 'should deploy right now' get separated"],
          why: "It's the deliberate pause between 'this works' and 'this is live for every user' — the one point in the pipeline built for judgment, not just automation.",
        },
      },
      {
        id: "prod", label: "DEPLOY: PRODUCTION", sub: "rolling / canary", icon: "▸", color: COLORS.err, x: 78, y: 72,
        detail: {
          what: "The image is rolled out to production — as a full rolling update, or more cautiously as a canary (small % of traffic first) or blue/green (new version fully up, then traffic cut over).",
          facts: ["A rolling update with readiness probes is the K8s default — Kubernetes won't route traffic to a new Pod until it reports ready", "Canary/blue-green trade extra infrastructure complexity for a much smaller blast radius on a bad release"],
          why: "This is the step every other stage exists to protect — everything upstream is about making sure what lands here is safe.",
        },
      },
    ],
    connections: [
      { from: "commit", to: "build" },
      { from: "build", to: "test" },
      { from: "test", to: "registry" },
      { from: "registry", to: "stage", label: "pull image" },
      { from: "stage", to: "gate" },
      { from: "gate", to: "prod" },
      { from: "prod", to: "registry", label: "auto-rollback on failed health check", dashed: true, color: COLORS.err },
    ],
  },
];

// Explainer diagram nodes use the same shape but rarely need `detail` —
// the surrounding prose carries the explanation, so hover is enough.
export const EXPLAINERS = [
  {
    id: "dns",
    title: "DNS & Service Discovery",
    icon: "⌁",
    color: COLORS.external,
    tagline: "How a Pod finds \"my-svc\" without ever knowing an IP address",
    sections: [
      {
        heading: "Why this needs solving at all",
        body: "Pod IPs are not stable — a Pod that dies and gets recreated comes back with a different IP. If your code hardcoded another service's Pod IP, it would break on every restart. Kubernetes solves this the same way the rest of networked computing does: give things names, and resolve those names through DNS.",
      },
      {
        heading: "CoreDNS is the resolver",
        body: "Every cluster runs a cluster DNS server — CoreDNS by default — as Pods in kube-system, fronted by its own Service (conventionally at a fixed ClusterIP like 10.96.0.10). The kubelet configures every Pod's /etc/resolv.conf to point at that Service IP as its nameserver, plus a search list (<namespace>.svc.cluster.local, svc.cluster.local, cluster.local) so short names resolve inside the cluster.",
      },
      {
        heading: "What actually gets a DNS record",
        body: "Every Service gets an A/AAAA record at <service-name>.<namespace>.svc.cluster.local, resolving to its ClusterIP. A normal lookup for just \"my-svc\" from a Pod in the same namespace works because of the search list — Kubernetes appends the namespace and domain suffix automatically. Cross-namespace calls need at least <service-name>.<namespace>.",
      },
      {
        heading: "Headless Services are the exception worth knowing",
        body: "A Service created with clusterIP: None (a \"headless\" Service) skips the virtual IP entirely — its DNS name resolves directly to the IPs of all its healthy backing Pods. StatefulSets pair with headless Services for exactly this reason: each replica needs a stable, individually addressable identity (e.g. postgres-0.postgres.default.svc.cluster.local), not a load-balanced VIP.",
      },
    ],
    keyFacts: [
      "CoreDNS resolves Service names — it does not route the actual traffic, that's kube-proxy's job after the IP comes back",
      "dnsPolicy: ClusterFirst (the default) is what points a Pod at cluster DNS instead of the node's own resolver",
      "A Service's DNS name outlives any individual Pod behind it — that stability is the entire point",
    ],
    diagram: {
      nodes: [
        { id: "pod", label: "POD", sub: "app container", icon: "▸", color: COLORS.pod, x: 12, y: 50 },
        { id: "coredns", label: "COREDNS", sub: "kube-system", icon: "⌁", color: COLORS.external, x: 42, y: 20 },
        { id: "apiserver", label: "API SERVER", sub: "watches Services", icon: "◈", color: COLORS.textDim, x: 72, y: 20 },
        { id: "svc", label: "SERVICE", sub: "my-svc · ClusterIP", icon: "◈", color: COLORS.service, x: 42, y: 80 },
        { id: "kubeproxy", label: "KUBE-PROXY", sub: "DNAT to a Pod IP", icon: "⇄", color: COLORS.service, x: 72, y: 80 },
      ],
      connections: [
        { from: "pod", to: "coredns", label: "1. query my-svc" },
        { from: "coredns", to: "apiserver", label: "2. lookup", dashed: true },
        { from: "coredns", to: "svc", label: "3. return ClusterIP" },
        { from: "pod", to: "kubeproxy", label: "4. connect to ClusterIP", dashed: true },
        { from: "kubeproxy", to: "svc", label: "5. route to a Pod" },
      ],
    },
  },
  {
    id: "pods",
    title: "Pods",
    icon: "▸",
    color: COLORS.pod,
    tagline: "The atomic unit of Kubernetes — and why it isn't just \"a container\"",
    sections: [
      {
        heading: "What a Pod actually is",
        body: "A Pod is one or more containers that are guaranteed to be scheduled together on the same node, and share a network namespace and (optionally) storage. It's the smallest unit you can create in Kubernetes — you can't schedule a bare container, only a Pod.",
      },
      {
        heading: "What \"sharing a network namespace\" means in practice",
        body: "Every container in a Pod sees the same IP address and the same localhost. Two containers in one Pod can reach each other over 127.0.0.1 without any Service, DNS, or networking setup — but that also means they can't both bind the same port. Under the hood, the kubelet starts a hidden \"pause\" container first, whose only job is to hold that network namespace open so the real containers can join it and be restarted individually without the Pod losing its IP.",
      },
      {
        heading: "Why group containers at all instead of just running one per Pod",
        body: "Most Pods do only run one container — that's the common case. Multi-container Pods exist for tightly-coupled helpers that must live and die with the main container: a sidecar that ships logs or terminates TLS (e.g. a service-mesh proxy), or an init container that runs once before the main container starts (wait for a dependency, run a migration). The Pod boundary guarantees these are always co-scheduled and can talk over localhost — you couldn't get that guarantee from two independently-scheduled containers.",
      },
      {
        heading: "Pods are disposable — controllers are what make them durable",
        body: "A bare Pod has no self-healing behavior: if its node dies, the Pod is simply gone. That's why you almost never create Pods directly in production. A Deployment, StatefulSet, DaemonSet, or Job manages a desired count of Pods and recreates them — with new names and new IPs — whenever one disappears. The Pod is the unit of execution; the controller is the unit of durability.",
      },
    ],
    keyFacts: [
      "Containers in a Pod share network + IPC namespace by default, but not the PID namespace (unless shareProcessNamespace: true)",
      "Pod lifecycle phases: Pending → Running → Succeeded/Failed (Unknown if the control plane loses contact with the node)",
      "A Pod's IP is only stable for that Pod's lifetime — anything long-lived should address a Service, never a Pod IP directly",
    ],
    diagram: {
      nodes: [
        { id: "app", label: "APP CONTAINER", sub: "port 8080", icon: "▸", color: COLORS.pod, x: 30, y: 45 },
        { id: "sidecar", label: "SIDECAR", sub: "e.g. proxy / log shipper", icon: "◉", color: COLORS.configmap, x: 70, y: 45 },
        { id: "vol", label: "VOLUME", sub: "shared mount", icon: "▣", color: COLORS.pvc, x: 50, y: 85 },
      ],
      connections: [
        { from: "app", to: "sidecar", label: "localhost, shared network ns" },
        { from: "app", to: "vol", label: "mount" },
        { from: "sidecar", to: "vol", label: "mount" },
      ],
    },
  },
  {
    id: "networking",
    title: "Networking",
    icon: "⇄",
    color: COLORS.cluster,
    tagline: "The flat-network model, and how Services turn ephemeral Pod IPs into something you can actually depend on",
    sections: [
      {
        heading: "The one hard requirement: a flat, NAT-less Pod network",
        body: "Kubernetes doesn't ship its own networking implementation — it defines a requirement and delegates the implementation to a CNI (Container Network Interface) plugin (Calico, Cilium, Flannel, the AWS VPC CNI, and others). The requirement is strict: every Pod gets its own cluster-unique IP, and every Pod can reach every other Pod's IP directly, cluster-wide, without NAT. A Pod sees its own IP exactly the way every other Pod sees it. This is what makes the rest of the model — DNS, Services, NetworkPolicy — work the same way regardless of which CNI plugin is installed.",
      },
      {
        heading: "Why nothing should talk to a Pod IP directly",
        body: "Pod IPs are cheap and temporary — a rescheduled Pod gets a new one. A Service is a stable virtual IP (ClusterIP) plus a DNS name sitting in front of a dynamic set of Pod IPs, tracked as an EndpointSlice that's updated automatically as Pods come and go. kube-proxy runs on every node and programs kernel-level rules (iptables or IPVS) so that traffic to a Service's ClusterIP:port gets rewritten (DNAT) to one of the currently-healthy backing Pod IPs — that's the load-balancing step.",
      },
      {
        heading: "The Service types, and what each one is actually for",
        body: "ClusterIP (the default) is only reachable inside the cluster. NodePort opens the same Service on a static port on every node's own IP, reachable from outside. LoadBalancer asks the cloud provider to provision a real external load balancer in front of the Service. ExternalName is a pure DNS alias with no proxying at all. Ingress is a separate, higher-level object — not a Service type — that does HTTP(S) layer-7 routing (host/path rules, TLS termination) in front of one or more Services, usually via an Ingress controller like nginx.",
      },
      {
        heading: "Locking the open-by-default network down",
        body: "Out of the box, every Pod can reach every other Pod — the flat network has no segmentation. NetworkPolicy objects (enforced by the CNI plugin — not all of them support it) let you define allow-lists by label selector and port, which is the closest thing Kubernetes has to a per-Pod firewall.",
      },
    ],
    keyFacts: [
      "CNI plugin = pod-to-pod networking; kube-proxy = Service virtual-IP routing; these are two separate layers",
      "Ingress is not a Service type — it's an L7 router that sits in front of Services",
      "NetworkPolicy is deny-by-default only once you create one — with none defined, all Pod-to-Pod traffic is allowed",
    ],
    diagram: {
      nodes: [
        { id: "ingress", label: "INGRESS", sub: "L7 routing / TLS", icon: "⟶", color: COLORS.ingress, x: 50, y: 10 },
        { id: "svc", label: "SERVICE", sub: "ClusterIP", icon: "◈", color: COLORS.service, x: 50, y: 38 },
        { id: "podA", label: "POD", sub: "node-1 · 10.244.1.4", icon: "▸", color: COLORS.pod, x: 20, y: 72 },
        { id: "podB", label: "POD", sub: "node-2 · 10.244.2.7", icon: "▸", color: COLORS.pod, x: 50, y: 72 },
        { id: "podC", label: "POD", sub: "node-2 · 10.244.2.9", icon: "▸", color: COLORS.pod, x: 80, y: 72 },
      ],
      connections: [
        { from: "ingress", to: "svc", label: "external traffic" },
        { from: "svc", to: "podA", label: "DNAT", dashed: true },
        { from: "svc", to: "podB", label: "DNAT", dashed: true },
        { from: "svc", to: "podC", label: "DNAT", dashed: true },
      ],
    },
  },
];
