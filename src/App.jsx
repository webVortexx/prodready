import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  bg:        "#080b0f",
  surface:   "#0d1117",
  elevated:  "#161b22",
  border:    "#1e2733",
  borderHi:  "#2d3748",
  text:      "#cdd9e5",
  textDim:   "#768390",
  textFaint: "#3d4f61",
  green:     "#3fb950",
  greenDim:  "#1a4a26",
  blue:      "#58a6ff",
  cyan:      "#39d3f0",
  orange:    "#e3643c",
  yellow:    "#e3b341",
  purple:    "#bc8cff",
  red:       "#f85149",
};

// ─── MANIFEST DATA ─────────────────────────────────────────────────
const manifests = [
  {
    id: "deployment", label: "Deployment", icon: "⬡", color: C.cyan,
    description: "Manages stateless app replicas with rolling updates & rollback",
    yaml: [
      { line: "apiVersion: apps/v1", note: "API group/version — use apps/v1 for Deployments" },
      { line: "kind: Deployment", note: "Resource type" },
      { line: "metadata:", note: null },
      { line: "  name: my-app", note: "Unique name within the namespace" },
      { line: "  namespace: production", note: "Logical cluster partition. Defaults to 'default'" },
      { line: "  labels:", note: "Key-value pairs for organizing/selecting resources" },
      { line: "    app: my-app", note: null },
      { line: "    version: \"1.0.0\"", note: null },
      { line: "  annotations:", note: "Non-identifying metadata (tool configs, docs)" },
      { line: "    kubernetes.io/change-cause: \"Initial deploy\"", note: null },
      { line: "    prometheus.io/scrape: \"true\"", note: "Enable Prometheus scraping" },
      { line: "spec:", note: null },
      { line: "  replicas: 3", note: "Number of desired pod instances" },
      { line: "  revisionHistoryLimit: 5", note: "Old ReplicaSets to retain for rollback" },
      { line: "  progressDeadlineSeconds: 600", note: "Max seconds for deployment to progress" },
      { line: "  selector:", note: "Must match template.metadata.labels" },
      { line: "    matchLabels:", note: null },
      { line: "      app: my-app", note: null },
      { line: "  strategy:", note: null },
      { line: "    type: RollingUpdate", note: "RollingUpdate | Recreate" },
      { line: "    rollingUpdate:", note: null },
      { line: "      maxSurge: 1", note: "Extra pods allowed above desired count during update" },
      { line: "      maxUnavailable: 0", note: "Pods that can be unavailable during update" },
      { line: "  template:", note: "Pod template — all pods use this spec" },
      { line: "    metadata:", note: null },
      { line: "      labels:", note: null },
      { line: "        app: my-app", note: "Must match spec.selector.matchLabels" },
      { line: "    spec:", note: null },
      { line: "      serviceAccountName: my-app-sa", note: "ServiceAccount for RBAC identity" },
      { line: "      terminationGracePeriodSeconds: 30", note: "Wait before force-killing" },
      { line: "      initContainers:", note: "Run to completion BEFORE main containers" },
      { line: "        - name: init-db", note: null },
      { line: "          image: busybox:1.35", note: null },
      { line: "          command: ['sh','-c','until nc -z db 5432; do sleep 2; done']", note: "Wait for DB readiness" },
      { line: "      containers:", note: null },
      { line: "        - name: my-app", note: null },
      { line: "          image: my-registry/my-app:1.0.0", note: "registry/image:tag" },
      { line: "          imagePullPolicy: Always", note: "Always | IfNotPresent | Never" },
      { line: "          ports:", note: null },
      { line: "            - name: http", note: null },
      { line: "              containerPort: 8080", note: "Port the container listens on" },
      { line: "              protocol: TCP", note: "TCP | UDP | SCTP" },
      { line: "          env:", note: "Direct environment variables" },
      { line: "            - name: NODE_ENV", note: null },
      { line: "              value: \"production\"", note: null },
      { line: "            - name: DB_PASSWORD", note: "Inject from Secret" },
      { line: "              valueFrom:", note: null },
      { line: "                secretKeyRef:", note: null },
      { line: "                  name: db-secret", note: null },
      { line: "                  key: password", note: null },
      { line: "          envFrom:", note: "Load ALL keys from ConfigMap/Secret as env vars" },
      { line: "            - configMapRef:", note: null },
      { line: "                name: app-config", note: null },
      { line: "          resources:", note: "CPU/memory requests & limits" },
      { line: "            requests:", note: "Minimum guaranteed resources" },
      { line: "              memory: \"128Mi\"", note: null },
      { line: "              cpu: \"100m\"", note: "100m = 0.1 CPU core" },
      { line: "            limits:", note: "Maximum allowed resources" },
      { line: "              memory: \"256Mi\"", note: null },
      { line: "              cpu: \"500m\"", note: null },
      { line: "          livenessProbe:", note: "Restart container if this fails" },
      { line: "            httpGet:", note: null },
      { line: "              path: /health", note: null },
      { line: "              port: 8080", note: null },
      { line: "            initialDelaySeconds: 15", note: "Wait before first probe" },
      { line: "            periodSeconds: 20", note: "Probe frequency" },
      { line: "            failureThreshold: 3", note: "Failures before restart" },
      { line: "          readinessProbe:", note: "Remove from Service endpoints if this fails" },
      { line: "            httpGet:", note: null },
      { line: "              path: /ready", note: null },
      { line: "              port: 8080", note: null },
      { line: "            initialDelaySeconds: 5", note: null },
      { line: "            periodSeconds: 10", note: null },
      { line: "          volumeMounts:", note: null },
      { line: "            - name: config-vol", note: null },
      { line: "              mountPath: /etc/config", note: "Where volume appears inside container" },
      { line: "          securityContext:", note: "Container-level security settings" },
      { line: "            runAsNonRoot: true", note: null },
      { line: "            runAsUser: 1000", note: null },
      { line: "            readOnlyRootFilesystem: true", note: null },
      { line: "      volumes:", note: null },
      { line: "        - name: config-vol", note: null },
      { line: "          configMap:", note: "Mount ConfigMap as files" },
      { line: "            name: app-config", note: null },
      { line: "      nodeSelector:", note: "Schedule only on nodes with these labels" },
      { line: "        kubernetes.io/os: linux", note: null },
      { line: "      affinity:", note: "Advanced scheduling rules" },
      { line: "        podAntiAffinity:", note: "Spread pods across nodes" },
      { line: "          preferredDuringSchedulingIgnoredDuringExecution:", note: null },
      { line: "            - weight: 100", note: null },
      { line: "              podAffinityTerm:", note: null },
      { line: "                topologyKey: kubernetes.io/hostname", note: null },
    ],
  },
  {
    id: "service", label: "Service", icon: "◈", color: C.blue,
    description: "Stable network endpoint to expose pods internally or externally",
    yaml: [
      { line: "apiVersion: v1", note: "Core API group — no prefix" },
      { line: "kind: Service", note: null },
      { line: "metadata:", note: null },
      { line: "  name: my-app-svc", note: null },
      { line: "  namespace: production", note: null },
      { line: "spec:", note: null },
      { line: "  type: ClusterIP", note: "ClusterIP | NodePort | LoadBalancer | ExternalName" },
      { line: "  selector:", note: "Routes traffic to pods matching these labels" },
      { line: "    app: my-app", note: null },
      { line: "  ports:", note: null },
      { line: "    - name: http", note: null },
      { line: "      protocol: TCP", note: null },
      { line: "      port: 80", note: "Port exposed by the Service" },
      { line: "      targetPort: 8080", note: "Port on the pod" },
      { line: "    - name: https", note: null },
      { line: "      port: 443", note: null },
      { line: "      targetPort: 8443", note: null },
      { line: "  sessionAffinity: None", note: "None | ClientIP (sticky sessions)" },
      { line: "  # clusterIP: None", note: "Headless — DNS returns pod IPs directly" },
      { line: "  # externalTrafficPolicy: Local", note: "Preserve client IP for LB/NodePort" },
    ],
  },
  {
    id: "configmap", label: "ConfigMap", icon: "⊞", color: C.yellow,
    description: "Store non-sensitive config as key-value pairs or files",
    yaml: [
      { line: "apiVersion: v1", note: null },
      { line: "kind: ConfigMap", note: null },
      { line: "metadata:", note: null },
      { line: "  name: app-config", note: null },
      { line: "  namespace: production", note: null },
      { line: "data:", note: "Key-value data (string values only)" },
      { line: "  APP_NAME: \"my-app\"", note: "Simple key-value pair" },
      { line: "  LOG_LEVEL: \"info\"", note: null },
      { line: "  MAX_CONNECTIONS: \"100\"", note: null },
      { line: "  app.properties: |", note: "Multi-line file content" },
      { line: "    server.port=8080", note: null },
      { line: "    spring.datasource.url=jdbc:postgresql://db:5432/mydb", note: null },
      { line: "  nginx.conf: |", note: null },
      { line: "    server {", note: null },
      { line: "      listen 80;", note: null },
      { line: "      location / { proxy_pass http://localhost:8080; }", note: null },
      { line: "    }", note: null },
      { line: "immutable: false", note: "true = no edits allowed (better perf at scale)" },
    ],
  },
  {
    id: "secret", label: "Secret", icon: "⬡", color: C.red,
    description: "Store sensitive data — passwords, tokens, TLS certs",
    yaml: [
      { line: "apiVersion: v1", note: null },
      { line: "kind: Secret", note: null },
      { line: "metadata:", note: null },
      { line: "  name: db-secret", note: null },
      { line: "  namespace: production", note: null },
      { line: "type: Opaque", note: "Opaque | kubernetes.io/tls | kubernetes.io/dockerconfigjson" },
      { line: "data:", note: "Values MUST be base64-encoded: echo -n 'val' | base64" },
      { line: "  username: bXl1c2Vy", note: "base64('myuser')" },
      { line: "  password: c3VwZXJzZWNyZXQ=", note: "base64('supersecret')" },
      { line: "stringData:", note: "Plain text — Kubernetes encodes automatically" },
      { line: "  api_key: \"plain-text-key-here\"", note: "Convenience field, merged with data on save" },
      { line: "# TLS Secret:", note: null },
      { line: "# type: kubernetes.io/tls", note: null },
      { line: "# data:", note: null },
      { line: "#   tls.crt: <base64-cert>", note: null },
      { line: "#   tls.key: <base64-key>", note: null },
      { line: "immutable: false", note: "true = must delete & recreate to change" },
    ],
  },
  {
    id: "ingress", label: "Ingress", icon: "⟶", color: C.purple,
    description: "HTTP/HTTPS routing rules from outside the cluster to Services",
    yaml: [
      { line: "apiVersion: networking.k8s.io/v1", note: null },
      { line: "kind: Ingress", note: null },
      { line: "metadata:", note: null },
      { line: "  name: my-app-ingress", note: null },
      { line: "  annotations:", note: "Controller-specific config" },
      { line: "    kubernetes.io/ingress.class: nginx", note: null },
      { line: "    nginx.ingress.kubernetes.io/ssl-redirect: \"true\"", note: null },
      { line: "    cert-manager.io/cluster-issuer: letsencrypt-prod", note: "Auto TLS via cert-manager" },
      { line: "spec:", note: null },
      { line: "  ingressClassName: nginx", note: "Preferred over annotation" },
      { line: "  tls:", note: null },
      { line: "    - hosts:", note: null },
      { line: "        - myapp.example.com", note: null },
      { line: "      secretName: myapp-tls-secret", note: "Secret with tls.crt and tls.key" },
      { line: "  rules:", note: null },
      { line: "    - host: myapp.example.com", note: "Hostname-based routing" },
      { line: "      http:", note: null },
      { line: "        paths:", note: null },
      { line: "          - path: /", note: null },
      { line: "            pathType: Prefix", note: "Prefix | Exact | ImplementationSpecific" },
      { line: "            backend:", note: null },
      { line: "              service:", note: null },
      { line: "                name: my-app-svc", note: null },
      { line: "                port:", note: null },
      { line: "                  number: 80", note: null },
    ],
  },
  {
    id: "hpa", label: "HPA", icon: "↔", color: C.orange,
    description: "Auto-scale replicas based on CPU, memory or custom metrics",
    yaml: [
      { line: "apiVersion: autoscaling/v2", note: "v2 for multi-metric support" },
      { line: "kind: HorizontalPodAutoscaler", note: null },
      { line: "metadata:", note: null },
      { line: "  name: my-app-hpa", note: null },
      { line: "spec:", note: null },
      { line: "  scaleTargetRef:", note: "The workload to scale" },
      { line: "    apiVersion: apps/v1", note: null },
      { line: "    kind: Deployment", note: null },
      { line: "    name: my-app", note: null },
      { line: "  minReplicas: 2", note: "Never scale below this" },
      { line: "  maxReplicas: 20", note: "Never scale above this" },
      { line: "  metrics:", note: null },
      { line: "    - type: Resource", note: null },
      { line: "      resource:", note: null },
      { line: "        name: cpu", note: null },
      { line: "        target:", note: null },
      { line: "          type: Utilization", note: null },
      { line: "          averageUtilization: 70", note: "Target 70% CPU utilization" },
      { line: "    - type: Resource", note: null },
      { line: "      resource:", note: null },
      { line: "        name: memory", note: null },
      { line: "        target:", note: null },
      { line: "          type: AverageValue", note: null },
      { line: "          averageValue: 200Mi", note: null },
      { line: "  behavior:", note: "Control scale speed" },
      { line: "    scaleDown:", note: null },
      { line: "      stabilizationWindowSeconds: 300", note: "Wait 5min before scaling down" },
      { line: "    scaleUp:", note: null },
      { line: "      stabilizationWindowSeconds: 0", note: "Scale up immediately" },
    ],
  },
];

// ─── CHEATSHEET DATA ───────────────────────────────────────────────
const cheatsheets = [
  {
    id: "kubectl", label: "kubectl", icon: "☸", color: C.cyan,
    description: "Essential kubectl commands for day-to-day cluster operations",
    sections: [
      {
        title: "Cluster Info",
        commands: [
          { cmd: "kubectl cluster-info", desc: "Show cluster endpoint info" },
          { cmd: "kubectl get nodes", desc: "List all nodes" },
          { cmd: "kubectl get nodes -o wide", desc: "Nodes with IPs, OS, kernel" },
          { cmd: "kubectl top nodes", desc: "CPU/memory usage per node" },
        ],
      },
      {
        title: "Workloads",
        commands: [
          { cmd: "kubectl get pods -A", desc: "All pods across all namespaces" },
          { cmd: "kubectl get pods -n <ns> -o wide", desc: "Pods with node placement" },
          { cmd: "kubectl describe pod <name>", desc: "Full pod details + events" },
          { cmd: "kubectl logs <pod> -c <container> -f", desc: "Follow container logs" },
          { cmd: "kubectl logs <pod> --previous", desc: "Logs from crashed container" },
          { cmd: "kubectl exec -it <pod> -- /bin/sh", desc: "Shell into a container" },
          { cmd: "kubectl top pods -n <ns>", desc: "CPU/memory per pod" },
        ],
      },
      {
        title: "Apply & Manage",
        commands: [
          { cmd: "kubectl apply -f manifest.yaml", desc: "Create or update resources" },
          { cmd: "kubectl delete -f manifest.yaml", desc: "Delete from manifest" },
          { cmd: "kubectl diff -f manifest.yaml", desc: "Preview changes before apply" },
          { cmd: "kubectl rollout status deploy/<name>", desc: "Watch rollout progress" },
          { cmd: "kubectl rollout undo deploy/<name>", desc: "Roll back to previous version" },
          { cmd: "kubectl scale deploy/<name> --replicas=5", desc: "Manually scale" },
          { cmd: "kubectl set image deploy/<n> app=img:tag", desc: "Update container image" },
        ],
      },
      {
        title: "Debugging",
        commands: [
          { cmd: "kubectl get events --sort-by='.lastTimestamp'", desc: "Recent cluster events" },
          { cmd: "kubectl get pod <name> -o yaml", desc: "Full resource YAML" },
          { cmd: "kubectl debug -it <pod> --image=busybox", desc: "Attach debug sidecar" },
          { cmd: "kubectl port-forward svc/<svc> 8080:80", desc: "Local tunnel to service" },
          { cmd: "kubectl cp <pod>:/path ./local", desc: "Copy files from pod" },
          { cmd: "kubectl auth can-i create pods", desc: "Check RBAC permissions" },
        ],
      },
    ],
  },
  {
    id: "docker", label: "Docker", icon: "◰", color: C.blue,
    description: "Docker CLI essentials — images, containers, networking, volumes",
    sections: [
      {
        title: "Images",
        commands: [
          { cmd: "docker build -t myapp:1.0 .", desc: "Build image from Dockerfile" },
          { cmd: "docker build --no-cache -t myapp .", desc: "Force fresh build" },
          { cmd: "docker images", desc: "List local images" },
          { cmd: "docker pull nginx:alpine", desc: "Pull image from registry" },
          { cmd: "docker push registry/myapp:1.0", desc: "Push to registry" },
          { cmd: "docker image prune -a", desc: "Remove all unused images" },
          { cmd: "docker inspect <image>", desc: "Full image metadata" },
        ],
      },
      {
        title: "Containers",
        commands: [
          { cmd: "docker run -d -p 8080:80 --name web nginx", desc: "Run detached with port map" },
          { cmd: "docker run --rm -it alpine /bin/sh", desc: "Interactive, auto-remove" },
          { cmd: "docker ps -a", desc: "All containers (including stopped)" },
          { cmd: "docker logs -f --tail=100 <ctr>", desc: "Follow last 100 log lines" },
          { cmd: "docker exec -it <ctr> bash", desc: "Shell into running container" },
          { cmd: "docker stop <ctr> && docker rm <ctr>", desc: "Stop and remove" },
          { cmd: "docker stats", desc: "Live CPU/memory for all containers" },
        ],
      },
      {
        title: "Networks & Volumes",
        commands: [
          { cmd: "docker network create mynet", desc: "Create a custom bridge network" },
          { cmd: "docker network ls", desc: "List networks" },
          { cmd: "docker volume create mydata", desc: "Create named volume" },
          { cmd: "docker volume ls", desc: "List volumes" },
          { cmd: "docker run -v mydata:/data nginx", desc: "Mount named volume" },
          { cmd: "docker run -v $(pwd):/app node", desc: "Mount host directory" },
        ],
      },
      {
        title: "Compose",
        commands: [
          { cmd: "docker compose up -d", desc: "Start all services detached" },
          { cmd: "docker compose down -v", desc: "Stop + remove containers & volumes" },
          { cmd: "docker compose logs -f <svc>", desc: "Follow service logs" },
          { cmd: "docker compose ps", desc: "Status of all services" },
          { cmd: "docker compose exec <svc> sh", desc: "Shell into service" },
          { cmd: "docker compose pull", desc: "Pull latest images" },
          { cmd: "docker compose build --no-cache", desc: "Rebuild all images" },
        ],
      },
    ],
  },
  {
    id: "git", label: "Git", icon: "⎇", color: C.orange,
    description: "Git commands for version control, branching and collaboration",
    sections: [
      {
        title: "Basics",
        commands: [
          { cmd: "git init && git remote add origin <url>", desc: "Init and link remote" },
          { cmd: "git clone <url> --depth=1", desc: "Shallow clone (faster)" },
          { cmd: "git status", desc: "Show working tree status" },
          { cmd: "git add -p", desc: "Interactively stage hunks" },
          { cmd: "git commit -m \"feat: message\"", desc: "Commit with message" },
          { cmd: "git push -u origin main", desc: "Push and set upstream" },
        ],
      },
      {
        title: "Branching",
        commands: [
          { cmd: "git checkout -b feature/my-feature", desc: "Create and switch branch" },
          { cmd: "git branch -d feature/done", desc: "Delete local branch" },
          { cmd: "git push origin --delete feature/done", desc: "Delete remote branch" },
          { cmd: "git merge --no-ff feature/x", desc: "Merge with explicit commit" },
          { cmd: "git rebase main", desc: "Rebase current branch onto main" },
          { cmd: "git cherry-pick <sha>", desc: "Apply specific commit" },
        ],
      },
      {
        title: "Undo & Fix",
        commands: [
          { cmd: "git reset --soft HEAD~1", desc: "Undo commit, keep changes staged" },
          { cmd: "git reset --hard HEAD~1", desc: "Undo commit, discard changes" },
          { cmd: "git revert <sha>", desc: "Safe undo via new commit" },
          { cmd: "git stash push -m \"wip\"", desc: "Stash with message" },
          { cmd: "git stash pop", desc: "Apply and drop latest stash" },
          { cmd: "git reflog", desc: "History of HEAD movements" },
        ],
      },
    ],
  },
  {
    id: "linux", label: "Linux", icon: "❯", color: C.green,
    description: "Linux/shell commands every SRE should know cold",
    sections: [
      {
        title: "Process & System",
        commands: [
          { cmd: "ps aux | grep <name>", desc: "Find process by name" },
          { cmd: "kill -9 <pid>", desc: "Force kill process" },
          { cmd: "lsof -i :<port>", desc: "Process using a port" },
          { cmd: "top / htop", desc: "Live process monitor" },
          { cmd: "systemctl status <svc>", desc: "Service status" },
          { cmd: "journalctl -u <svc> -f", desc: "Follow service logs" },
          { cmd: "uptime", desc: "Load averages + uptime" },
        ],
      },
      {
        title: "Disk & Files",
        commands: [
          { cmd: "df -h", desc: "Disk usage by filesystem" },
          { cmd: "du -sh /path/*", desc: "Directory sizes" },
          { cmd: "find / -name '*.log' -mtime +7", desc: "Files older than 7 days" },
          { cmd: "tail -f /var/log/syslog", desc: "Follow system log" },
          { cmd: "grep -r 'ERROR' /var/log/", desc: "Recursive search" },
          { cmd: "tar -czf archive.tar.gz /path", desc: "Create gzip tarball" },
        ],
      },
      {
        title: "Networking",
        commands: [
          { cmd: "ss -tulnp", desc: "All listening ports with PIDs" },
          { cmd: "curl -I https://example.com", desc: "HTTP headers only" },
          { cmd: "traceroute <host>", desc: "Trace network hops" },
          { cmd: "nslookup / dig <domain>", desc: "DNS lookup" },
          { cmd: "ip addr show", desc: "Network interfaces + IPs" },
          { cmd: "netstat -s", desc: "Network statistics" },
        ],
      },
    ],
  },
  {
    id: "helm", label: "Helm", icon: "⎈", color: C.purple,
    description: "Helm chart commands — install, upgrade, rollback and debug releases",
    sections: [
      {
        title: "Repo & Search",
        commands: [
          { cmd: "helm repo add bitnami https://charts.bitnami.com/bitnami", desc: "Add a chart repository" },
          { cmd: "helm repo update", desc: "Fetch latest charts from all repos" },
          { cmd: "helm repo list", desc: "List configured repos" },
          { cmd: "helm search repo nginx", desc: "Search charts in added repos" },
          { cmd: "helm search hub wordpress", desc: "Search Artifact Hub (public charts)" },
        ],
      },
      {
        title: "Install & Upgrade",
        commands: [
          { cmd: "helm install my-app bitnami/nginx", desc: "Install chart with release name" },
          { cmd: "helm install my-app ./mychart -f values.yaml", desc: "Install local chart with custom values" },
          { cmd: "helm install my-app bitnami/nginx --dry-run", desc: "Preview without installing" },
          { cmd: "helm upgrade my-app bitnami/nginx", desc: "Upgrade existing release" },
          { cmd: "helm upgrade --install my-app bitnami/nginx", desc: "Install if not exists, upgrade if does" },
          { cmd: "helm upgrade my-app ./chart --set image.tag=v2", desc: "Upgrade with inline value override" },
        ],
      },
      {
        title: "Inspect & Debug",
        commands: [
          { cmd: "helm list -A", desc: "All releases across all namespaces" },
          { cmd: "helm status my-app", desc: "Release status and last deployment info" },
          { cmd: "helm get values my-app", desc: "Values used in current release" },
          { cmd: "helm get manifest my-app", desc: "Rendered Kubernetes manifests" },
          { cmd: "helm history my-app", desc: "Release revision history" },
          { cmd: "helm template my-app ./chart", desc: "Render templates locally without installing" },
          { cmd: "helm lint ./chart", desc: "Check chart for errors" },
        ],
      },
      {
        title: "Rollback & Uninstall",
        commands: [
          { cmd: "helm rollback my-app 2", desc: "Roll back to revision 2" },
          { cmd: "helm rollback my-app 0", desc: "Roll back to previous revision" },
          { cmd: "helm uninstall my-app", desc: "Delete release and all its resources" },
          { cmd: "helm uninstall my-app --keep-history", desc: "Delete but keep history for rollback" },
        ],
      },
    ],
  },
  {
    id: "terraform", label: "Terraform", icon: "⬡", color: "#7b61ff",
    description: "Terraform CLI — init, plan, apply, state and workspace management",
    sections: [
      {
        title: "Core Workflow",
        commands: [
          { cmd: "terraform init", desc: "Initialize working dir, download providers" },
          { cmd: "terraform init -upgrade", desc: "Upgrade providers to latest allowed version" },
          { cmd: "terraform fmt", desc: "Format all .tf files to canonical style" },
          { cmd: "terraform validate", desc: "Check config syntax and internal consistency" },
          { cmd: "terraform plan", desc: "Preview changes without applying" },
          { cmd: "terraform plan -out=tfplan", desc: "Save plan to file for later apply" },
          { cmd: "terraform apply", desc: "Apply changes with confirmation prompt" },
          { cmd: "terraform apply tfplan", desc: "Apply a saved plan file (no prompt)" },
          { cmd: "terraform apply -auto-approve", desc: "Apply without confirmation (use with care)" },
          { cmd: "terraform destroy", desc: "Destroy all managed infrastructure" },
        ],
      },
      {
        title: "State",
        commands: [
          { cmd: "terraform show", desc: "Human-readable output of state or plan" },
          { cmd: "terraform state list", desc: "List all resources in state" },
          { cmd: "terraform state show aws_instance.web", desc: "Details of a specific resource" },
          { cmd: "terraform state mv A B", desc: "Rename/move resource in state" },
          { cmd: "terraform state rm aws_instance.web", desc: "Remove resource from state (keeps real infra)" },
          { cmd: "terraform import aws_instance.web i-1234567", desc: "Import existing infra into state" },
          { cmd: "terraform refresh", desc: "Sync state with real infrastructure" },
        ],
      },
      {
        title: "Workspaces",
        commands: [
          { cmd: "terraform workspace list", desc: "List all workspaces" },
          { cmd: "terraform workspace new staging", desc: "Create new workspace" },
          { cmd: "terraform workspace select prod", desc: "Switch to workspace" },
          { cmd: "terraform workspace show", desc: "Show current workspace" },
          { cmd: "terraform workspace delete staging", desc: "Delete a workspace" },
        ],
      },
      {
        title: "Debugging",
        commands: [
          { cmd: "terraform output", desc: "Print all output values" },
          { cmd: "terraform output db_password", desc: "Print specific output" },
          { cmd: "TF_LOG=DEBUG terraform apply", desc: "Enable verbose debug logging" },
          { cmd: "terraform graph | dot -Tsvg > graph.svg", desc: "Visualize dependency graph" },
          { cmd: "terraform force-unlock <lock-id>", desc: "Manually release a stuck state lock" },
          { cmd: "terraform providers", desc: "List providers required by config" },
        ],
      },
    ],
  },
  {
    id: "prometheus", label: "Prometheus", icon: "◎", color: C.orange,
    description: "PromQL queries and Prometheus CLI for metrics, alerts and debugging",
    sections: [
      {
        title: "PromQL Basics",
        commands: [
          { cmd: "up", desc: "Check which targets are up (1=up, 0=down)" },
          { cmd: "http_requests_total", desc: "Raw counter — all HTTP requests" },
          { cmd: "rate(http_requests_total[5m])", desc: "Per-second request rate over last 5min" },
          { cmd: "irate(http_requests_total[5m])", desc: "Instant rate — better for spikes" },
          { cmd: "increase(http_requests_total[1h])", desc: "Total increase over last 1 hour" },
          { cmd: "sum(rate(http_requests_total[5m])) by (job)", desc: "Rate grouped by job label" },
          { cmd: "topk(5, rate(http_requests_total[5m]))", desc: "Top 5 highest request rates" },
        ],
      },
      {
        title: "Resource Queries",
        commands: [
          { cmd: "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)", desc: "CPU usage % per node" },
          { cmd: "node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100", desc: "Available memory %" },
          { cmd: "(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100", desc: "Disk usage %" },
          { cmd: "container_memory_usage_bytes{namespace='prod'}", desc: "Memory usage by container in namespace" },
          { cmd: "rate(container_cpu_usage_seconds_total[5m])", desc: "CPU usage rate per container" },
        ],
      },
      {
        title: "HTTP & Errors",
        commands: [
          { cmd: "rate(http_requests_total{status=~'5..'}[5m])", desc: "5xx error rate" },
          { cmd: "sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m]))", desc: "Error ratio (use for SLO alerts)" },
          { cmd: "histogram_quantile(0.99, rate(http_duration_seconds_bucket[5m]))", desc: "p99 latency" },
          { cmd: "histogram_quantile(0.95, rate(http_duration_seconds_bucket[5m]))", desc: "p95 latency" },
          { cmd: "avg_over_time(up[1h]) < 0.99", desc: "Targets with availability below 99% in last hour" },
        ],
      },
      {
        title: "CLI & Management",
        commands: [
          { cmd: "curl http://localhost:9090/api/v1/targets", desc: "List all scrape targets via API" },
          { cmd: "curl http://localhost:9090/api/v1/alerts", desc: "List firing alerts" },
          { cmd: "curl http://localhost:9090/-/reload", desc: "Reload config without restart" },
          { cmd: "promtool check config prometheus.yml", desc: "Validate config file" },
          { cmd: "promtool check rules rules.yml", desc: "Validate alerting rules" },
          { cmd: "promtool query instant http://localhost:9090 'up'", desc: "Run instant query from CLI" },
        ],
      },
    ],
  },
  {
    id: "netlinux", label: "Networking", icon: "⇄", color: C.cyan,
    description: "Linux networking — interfaces, routing, DNS and traffic analysis",
    sections: [
      {
        title: "Interfaces & IP",
        commands: [
          { cmd: "ip addr show", desc: "All interfaces with IPs" },
          { cmd: "ip addr add 192.168.1.10/24 dev eth0", desc: "Assign IP to interface" },
          { cmd: "ip link set eth0 up / down", desc: "Bring interface up or down" },
          { cmd: "ip -s link show eth0", desc: "Interface stats (bytes, errors, drops)" },
          { cmd: "ethtool eth0", desc: "NIC speed, duplex, link status" },
          { cmd: "ip neigh show", desc: "ARP table — MAC to IP mappings" },
        ],
      },
      {
        title: "Routing",
        commands: [
          { cmd: "ip route show", desc: "Routing table" },
          { cmd: "ip route add 10.0.0.0/8 via 192.168.1.1", desc: "Add static route" },
          { cmd: "ip route del 10.0.0.0/8", desc: "Delete route" },
          { cmd: "ip route get 8.8.8.8", desc: "Which route would be used for this IP" },
          { cmd: "traceroute 8.8.8.8", desc: "Trace hops to destination" },
          { cmd: "mtr 8.8.8.8", desc: "Live traceroute with latency stats" },
        ],
      },
      {
        title: "Ports & Sockets",
        commands: [
          { cmd: "ss -tulnp", desc: "All listening TCP/UDP ports with process" },
          { cmd: "ss -tnp state established", desc: "All established TCP connections" },
          { cmd: "ss -s", desc: "Socket summary statistics" },
          { cmd: "lsof -i :8080", desc: "Process listening on port 8080" },
          { cmd: "lsof -i tcp -n -P", desc: "All TCP connections with PIDs" },
          { cmd: "netstat -an | grep ESTABLISHED | wc -l", desc: "Count established connections" },
        ],
      },
      {
        title: "DNS",
        commands: [
          { cmd: "dig google.com", desc: "Full DNS lookup with details" },
          { cmd: "dig google.com +short", desc: "Just the IP address" },
          { cmd: "dig @8.8.8.8 google.com", desc: "Query specific DNS server" },
          { cmd: "dig -x 8.8.8.8", desc: "Reverse DNS lookup" },
          { cmd: "dig google.com MX", desc: "Mail exchange records" },
          { cmd: "resolvectl status", desc: "Current DNS resolver config (systemd)" },
          { cmd: "cat /etc/resolv.conf", desc: "DNS server config file" },
        ],
      },
      {
        title: "Traffic Analysis",
        commands: [
          { cmd: "tcpdump -i eth0 port 80", desc: "Capture HTTP traffic on interface" },
          { cmd: "tcpdump -i any -w capture.pcap", desc: "Save all traffic to file" },
          { cmd: "tcpdump host 10.0.0.5", desc: "Traffic to/from specific host" },
          { cmd: "iperf3 -s / iperf3 -c <host>", desc: "Bandwidth test between two hosts" },
          { cmd: "nmap -sV -p 1-65535 <host>", desc: "Full port scan with service detection" },
          { cmd: "curl -w '%{time_total}' -o /dev/null -s https://example.com", desc: "Measure total HTTP response time" },
        ],
      },
    ],
  },
];

// ─── BUILD SEARCH INDEX ───────────────────────────────────────────
const searchIndex = [
  { type: "page", label: "Home", icon: "⌂", page: "home", sub: null },
  { type: "page", label: "Manifests", icon: "☸", page: "manifests", sub: null },
  { type: "page", label: "Cheatsheets", icon: "⌨", page: "cheatsheets", sub: null },
  ...manifests.map(m => ({
    type: "manifest", label: m.label, icon: m.icon, color: m.color,
    page: "manifests", manifestId: m.id, sub: m.description,
  })),
  ...manifests.flatMap(m =>
    m.yaml.filter(y => y.note).map(y => ({
      type: "field", label: y.line.trim(), icon: "·", color: m.color,
      page: "manifests", manifestId: m.id, sub: `${m.label} · ${y.note}`, note: y.note,
    }))
  ),
  ...cheatsheets.map(c => ({
    type: "cheatsheet", label: c.label, icon: c.icon, color: c.color,
    page: "cheatsheets", cheatsheetId: c.id, sub: c.description,
  })),
  ...cheatsheets.flatMap(c =>
    c.sections.flatMap(sec =>
      sec.commands.map(cmd => ({
        type: "command", label: cmd.cmd, icon: "❯", color: c.color,
        page: "cheatsheets", cheatsheetId: c.id,
        sub: `${c.label} · ${sec.title} · ${cmd.desc}`, cmd: cmd.cmd,
      }))
    )
  ),
];

function scoreMatch(item, query) {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const sub = (item.sub || "").toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (sub.includes(q)) return 40;
  return 0;
}

function runSearch(query) {
  if (!query.trim()) return [];
  return searchIndex
    .map(item => ({ item, score: scoreMatch(item, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(r => r.item);
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: `${C.green}35`, color: C.green, borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const TYPE_LABELS = {
  page: "Page", manifest: "Manifest", field: "YAML field",
  cheatsheet: "Cheatsheet", command: "Command",
};

// ─── CMD+K PALETTE ────────────────────────────────────────────────
function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery(""); setResults([]); setActiveIdx(0); setCopied(null);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    setResults(runSearch(query));
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[activeIdx];
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const handleSelect = useCallback((item) => {
    if (item.type === "command") {
      navigator.clipboard.writeText(item.cmd);
      setCopied(item.cmd);
      setTimeout(() => { setCopied(null); onClose(); }, 900);
      return;
    }
    onNavigate(item.page, item.manifestId, item.cheatsheetId);
    onClose();
  }, [onNavigate, onClose]);

  const handleKey = useCallback((e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) handleSelect(results[activeIdx]);
    if (e.key === "Escape") onClose();
  }, [results, activeIdx, handleSelect, onClose]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,11,15,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 620, maxWidth: "90vw", background: C.surface,
        border: `1px solid ${C.borderHi}`, borderRadius: 12,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        maxHeight: "60vh", animation: "paletteIn 0.15s cubic-bezier(.2,0,.1,1)",
      }}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ color: C.textFaint, fontSize: 15, lineHeight: 1 }}>⌕</span>
          <input ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search manifests, commands, fields..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontSize: 14, fontFamily: "inherit", caretColor: C.green }}
          />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>}
          <kbd style={{ fontSize: 10, color: C.textFaint, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
          {!query.trim() && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 16 }}>Quick jump</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[
                  { label: "Home", page: "home", icon: "⌂" },
                  { label: "Manifests", page: "manifests", icon: "☸" },
                  { label: "Cheatsheets", page: "cheatsheets", icon: "⌨" },
                ].map(p => (
                  <button key={p.page} onClick={() => { onNavigate(p.page); onClose(); }}
                    style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 16px", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "border-color 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}>
                    <span>{p.icon}</span><span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: C.textFaint, fontSize: 12 }}>
              No results for <span style={{ color: C.textDim }}>"{query}"</span>
            </div>
          )}
          {results.map((item, i) => {
            const isActive = i === activeIdx;
            const isCopied = copied === item.cmd;
            return (
              <div key={i} onClick={() => handleSelect(item)} onMouseEnter={() => setActiveIdx(i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: isActive ? `${C.green}10` : "transparent", borderLeft: `2px solid ${isActive ? C.green : "transparent"}`, cursor: "pointer", transition: "background 0.08s" }}>
                <span style={{ fontSize: 13, color: item.color || C.textDim, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.text, fontFamily: (item.type === "command" || item.type === "field") ? "'JetBrains Mono',monospace" : "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {highlight(item.label, query)}
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {highlight(item.sub, query)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {isCopied && <span style={{ fontSize: 10, color: C.green }}>✓ copied</span>}
                  <span style={{ fontSize: 9, color: item.color || C.textFaint, border: `1px solid ${(item.color || C.textFaint) + "40"}`, borderRadius: 3, padding: "1px 5px", letterSpacing: "0.04em" }}>
                    {item.type === "command" ? "copy" : TYPE_LABELS[item.type]}
                  </span>
                  {isActive && item.type !== "command" && <span style={{ fontSize: 10, color: C.textFaint }}>↵</span>}
                </div>
              </div>
            );
          })}
          {results.length > 0 && <div style={{ height: 8 }} />}
        </div>

        {/* Footer */}
        <div style={{ padding: "7px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 16, flexShrink: 0 }}>
          {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"], ["click command", "copy"]].map(([key, label]) => (
            <span key={key} style={{ fontSize: 10, color: C.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
              <kbd style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px", fontSize: 9 }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SYNTAX HIGHLIGHT ─────────────────────────────────────────────
function YamlLine({ text }) {
  if (text.trim().startsWith("#")) return <span style={{ color: "#546e7a", fontStyle: "italic" }}>{text}</span>;
  const ci = text.indexOf(":");
  if (ci === -1) return <span style={{ color: C.text }}>{text}</span>;
  const indent = text.match(/^(\s*)/)[1];
  const key = text.substring(indent.length, ci + 1);
  const val = text.substring(ci + 1);
  const valColor = val.includes('"') || val.includes("'") ? C.green : /^\s+\d/.test(val) ? C.orange : C.text;
  return (
    <>
      <span style={{ color: C.textFaint }}>{indent}</span>
      <span style={{ color: C.blue, fontWeight: 600 }}>{key}</span>
      <span style={{ color: valColor }}>{val}</span>
    </>
  );
}

// ─── MANIFEST VIEWER ──────────────────────────────────────────────
function ManifestViewer({ initialManifest }) {
  const [active, setActive] = useState(initialManifest || "deployment");
  const [hovered, setHovered] = useState(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { if (initialManifest) setActive(initialManifest); }, [initialManifest]);

  const cur = manifests.find(m => m.id === active);
  const lines = search ? cur.yaml.filter(l =>
    l.line.toLowerCase().includes(search.toLowerCase()) ||
    (l.note && l.note.toLowerCase().includes(search.toLowerCase()))
  ) : cur.yaml;

  const copy = () => {
    navigator.clipboard.writeText(cur.yaml.map(l => l.line).join("\n"));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", gap: 2, overflowX: "auto", borderBottom: `1px solid ${C.border}`, scrollbarWidth: "none", flexShrink: 0 }}>
        {manifests.map(m => (
          <button key={m.id} onClick={() => { setActive(m.id); setSearch(""); setHovered(null); }}
            style={{ background: active === m.id ? C.surface : "transparent", border: "none", borderBottom: active === m.id ? `2px solid ${m.color}` : "2px solid transparent", padding: "9px 14px", color: active === m.id ? m.color : C.textDim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", whiteSpace: "nowrap", transition: "color 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
            <span>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.elevated }}>
        <span style={{ fontSize: 11, color: C.textDim, flex: 1 }}>{cur.description}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 10px" }}>
          <span style={{ color: C.textFaint, fontSize: 11 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="filter fields..."
            style={{ background: "none", border: "none", outline: "none", color: C.text, fontSize: 11, width: 130, fontFamily: "inherit" }} />
        </div>
        <button onClick={copy} style={{ background: copied ? C.greenDim : C.surface, border: `1px solid ${copied ? C.green : C.border}`, borderRadius: 5, padding: "4px 12px", color: copied ? C.green : C.textDim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.2s" }}>
          {copied ? "✓ copied" : "⎘ copy"}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, lineHeight: 1.75 }}>
          <tbody>
            {lines.map((item, i) => {
              const isH = hovered === i;
              return (
                <tr key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  style={{ background: isH ? `${cur.color}0d` : "transparent", transition: "background 0.1s" }}>
                  <td style={{ width: 36, textAlign: "right", paddingRight: 14, color: C.textFaint, fontSize: 10, userSelect: "none", borderRight: `1px solid ${C.border}`, paddingLeft: 8, verticalAlign: "top", paddingTop: 1 }}>{i + 1}</td>
                  <td style={{ paddingLeft: 18, paddingRight: 12, whiteSpace: "pre", verticalAlign: "top" }}><YamlLine text={item.line} /></td>
                  <td style={{ paddingRight: 20, verticalAlign: "top", width: 300 }}>
                    {item.note && isH ? (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5, animation: "fadeIn 0.12s ease" }}>
                        <span style={{ color: cur.color, fontSize: 10, marginTop: 3 }}>◀</span>
                        <span style={{ fontSize: 10, color: C.textDim, background: C.elevated, border: `1px solid ${cur.color}40`, borderRadius: 4, padding: "2px 8px", lineHeight: 1.5 }}>{item.note}</span>
                      </div>
                    ) : item.note ? (
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: cur.color, opacity: 0.35, marginTop: 7 }} />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ height: 32 }} />
      </div>
      <div style={{ padding: "6px 16px", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textFaint, flexShrink: 0 }}>
        {lines.length} lines · hover annotated fields {search ? `· filtered: "${search}"` : ""}
      </div>
    </div>
  );
}

// ─── CHEATSHEET VIEWER ────────────────────────────────────────────
function CheatsheetViewer({ initialCheatsheet }) {
  const [active, setActive] = useState(initialCheatsheet || "kubectl");
  const [copied, setCopied] = useState(null);

  useEffect(() => { if (initialCheatsheet) setActive(initialCheatsheet); }, [initialCheatsheet]);

  const cur = cheatsheets.find(c => c.id === active);
  const copy = (cmd) => { navigator.clipboard.writeText(cmd); setCopied(cmd); setTimeout(() => setCopied(null), 1500); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", gap: 2, overflowX: "auto", borderBottom: `1px solid ${C.border}`, scrollbarWidth: "none", flexShrink: 0 }}>
        {cheatsheets.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            style={{ background: active === c.id ? C.surface : "transparent", border: "none", borderBottom: active === c.id ? `2px solid ${c.color}` : "2px solid transparent", padding: "9px 16px", color: active === c.id ? c.color : C.textDim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${C.border}`, background: C.elevated, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: C.textDim }}>{cur.description}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent`, padding: "20px 20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {cur.sections.map(sec => (
            <div key={sec.title} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 3, height: 14, background: cur.color, borderRadius: 2, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: cur.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{sec.title}</span>
              </div>
              <div>
                {sec.commands.map((c, i) => (
                  <div key={i} onClick={() => copy(c.cmd)}
                    style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "8px 14px", cursor: "pointer", gap: 10, borderBottom: i < sec.commands.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${cur.color}0d`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11.5, color: C.green, marginBottom: 2, wordBreak: "break-all" }}>{c.cmd}</div>
                      <div style={{ fontSize: 10.5, color: C.textDim, lineHeight: 1.4 }}>{c.desc}</div>
                    </div>
                    <span style={{ fontSize: 9, color: copied === c.cmd ? C.green : C.textFaint, flexShrink: 0, marginTop: 1 }}>{copied === c.cmd ? "✓" : "⎘"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────
function Home({ onNavigate }) {
  const stats = [
    { val: "6",   label: "Manifest Kinds" },
    { val: "8",   label: "Cheatsheets" },
    { val: "160+", label: "Commands" },
    { val: "100+", label: "Annotated Fields" },
  ];
  const cards = [
    { id: "manifests",   icon: "☸", color: C.cyan,  title: "Manifests",   desc: "Kubernetes resource blueprints with annotated fields. Deployment, Service, ConfigMap, Secret, Ingress, HPA and more.", badge: "6 kinds" },
    { id: "cheatsheets", icon: "⌨", color: C.green, title: "Cheatsheets", desc: "Command references for kubectl, Docker, Git, Linux, Helm, Terraform, Prometheus and Networking.", badge: "8 sheets" },
  ];
  return (
    <div style={{ padding: "48px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.green, border: `1px solid ${C.greenDim}`, borderRadius: 4, padding: "2px 8px" }}>v1.0</span>
          <span style={{ fontSize: 10, color: C.textFaint, letterSpacing: "0.12em", textTransform: "uppercase" }}>SRE · DevOps · Engineering</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: C.text, margin: "0 0 12px", letterSpacing: "-1px", lineHeight: 1.15, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
          Production-grade<br />
          <span style={{ color: C.green }}>knowledge, fast.</span>
        </h1>
        <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
          Interactive reference for engineers who build, deploy and operate production systems. No fluff — just annotated blueprints and copy-ready commands.
        </p>
      </div>

      <div style={{ display: "flex", gap: 1, marginBottom: 44, background: C.border, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "18px 20px", background: C.elevated, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.green, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.textFaint, marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 44 }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => onNavigate(card.id)}
            style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, cursor: "pointer", transition: "border-color 0.2s, transform 0.15s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `${card.color}08`, borderRadius: "0 10px 0 80px" }} />
            <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{card.title}</span>
              <span style={{ fontSize: 9, color: card.color, border: `1px solid ${card.color}50`, borderRadius: 3, padding: "1px 6px", letterSpacing: "0.05em" }}>{card.badge}</span>
            </div>
            <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
            <div style={{ marginTop: 16, fontSize: 11, color: card.color, display: "flex", alignItems: "center", gap: 4 }}>Open <span>→</span></div>
          </div>
        ))}
      </div>

      <div style={{ border: `1px dashed ${C.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 10, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Coming soon</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["Architecture Diagrams", "Runbooks", "Interview Prep", "Concepts", "CI/CD Pipelines", "Observability"].map(item => (
            <span key={item} style={{ fontSize: 11, color: C.textFaint, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 10px" }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
const NAV = [
  { id: "home",        label: "Home",        icon: "⌂", group: null },
  { id: "manifests",   label: "Manifests",   icon: "☸", group: "References" },
  { id: "cheatsheets", label: "Cheatsheets", icon: "⌨", group: "References" },
];

export default function ProdReady() {
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeManifest, setActiveManifest] = useState(null);
  const [activeCheatsheet, setActiveCheatsheet] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNavigate = useCallback((targetPage, manifestId, cheatsheetId) => {
    setPage(targetPage);
    if (manifestId) setActiveManifest(manifestId);
    if (cheatsheetId) setActiveCheatsheet(cheatsheetId);
  }, []);

  const groups = [
    { label: null,         items: NAV.filter(n => !n.group) },
    { label: "References", items: NAV.filter(n => n.group === "References") },
  ];
  const pageTitle = NAV.find(n => n.id === page)?.label || "Home";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg, fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", color: C.text }}>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={handleNavigate} />

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 52, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden" }}>
        <div style={{ padding: sidebarOpen ? "18px 16px 14px" : "18px 14px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 58, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, background: C.green, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, fontWeight: 800, color: C.bg }}>P</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>ProdReady</div>
              <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.1em" }}>SRE · DevOps · Dev</div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "10px 10px 4px" }}>
            <button onClick={() => setPaletteOpen(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textFaint, cursor: "pointer", fontSize: 11, fontFamily: "inherit", textAlign: "left", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <span style={{ fontSize: 12 }}>⌕</span>
              <span style={{ flex: 1 }}>Search...</span>
              <kbd style={{ fontSize: 9, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 4px" }}>⌘K</kbd>
            </button>
          </div>
        )}

        {!sidebarOpen && (
          <div style={{ padding: "8px 8px 4px" }}>
            <button onClick={() => setPaletteOpen(true)} title="Search (⌘K)"
              style={{ width: "100%", padding: "8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, cursor: "pointer", fontSize: 14, transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>⌕</button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 8px", scrollbarWidth: "none" }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 6 }}>
              {g.label && sidebarOpen && <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 8px 4px", whiteSpace: "nowrap" }}>{g.label}</div>}
              {g.items.map(item => {
                const isActive = page === item.id;
                return (
                  <button key={item.id} onClick={() => setPage(item.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "8px 10px" : "8px 12px", background: isActive ? `${C.green}15` : "transparent", border: "none", borderRadius: 6, color: isActive ? C.green : C.textDim, cursor: "pointer", fontSize: 12, fontFamily: "inherit", textAlign: "left", whiteSpace: "nowrap", transition: "background 0.12s, color 0.12s" }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.elevated; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: 14, flexShrink: 0, width: 16, textAlign: "center" }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                    {sidebarOpen && isActive && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: C.green }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 8px", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            {sidebarOpen ? "← collapse" : "→"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div style={{ height: 50, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, background: C.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: C.textFaint }}>prodready</span>
            <span style={{ color: C.textFaint, fontSize: 10 }}>/</span>
            <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{pageTitle.toLowerCase()}</span>
          </div>
          <button onClick={() => setPaletteOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textFaint, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <span>⌕</span><span>Search</span>
            <kbd style={{ fontSize: 9, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px", marginLeft: 2 }}>⌘K</kbd>
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {["home", "manifests", "cheatsheets"].map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: page === p ? C.elevated : "transparent", border: `1px solid ${page === p ? C.border : "transparent"}`, borderRadius: 5, padding: "3px 10px", color: page === p ? C.text : C.textFaint, cursor: "pointer", fontSize: 10, fontFamily: "inherit" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: page === "home" ? "auto" : "hidden" }}>
          {page === "home"        && <Home onNavigate={handleNavigate} />}
          {page === "manifests"   && <ManifestViewer initialManifest={activeManifest} />}
          {page === "cheatsheets" && <CheatsheetViewer initialCheatsheet={activeCheatsheet} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity:0; transform:translateX(-4px); } to { opacity:1; transform:translateX(0); } }
        @keyframes paletteIn { from { opacity:0; transform:translateY(-8px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input::placeholder { color: ${C.textFaint}; }
        kbd { font-family: inherit; }
      `}</style>
    </div>
  );
}