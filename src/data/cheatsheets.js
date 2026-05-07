import { COLORS } from '../constants/colors.js';

export const CHEATSHEETS = [
  {
    id: "kubectl",
    label: "kubectl",
    icon: "☸",
    color: COLORS.cyan,
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
          { cmd: "kubectl logs <pod> -f", desc: "Follow container logs" },
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
        ],
      },
      {
        title: "Debugging",
        commands: [
          { cmd: "kubectl get events --sort-by='.lastTimestamp'", desc: "Recent cluster events" },
          { cmd: "kubectl get pod <name> -o yaml", desc: "Full resource YAML" },
          { cmd: "kubectl port-forward svc/<svc> 8080:80", desc: "Local tunnel to service" },
          { cmd: "kubectl cp <pod>:/path ./local", desc: "Copy files from pod" },
          { cmd: "kubectl auth can-i create pods", desc: "Check RBAC permissions" },
        ],
      },
    ],
  },
  {
    id: "docker",
    label: "Docker",
    icon: "◰",
    color: COLORS.blue,
    description: "Docker CLI essentials — images, containers, networking, volumes",
    sections: [
      {
        title: "Images",
        commands: [
          { cmd: "docker build -t myapp:1.0 .", desc: "Build image from Dockerfile" },
          { cmd: "docker images", desc: "List local images" },
          { cmd: "docker pull nginx:alpine", desc: "Pull image from registry" },
          { cmd: "docker push registry/myapp:1.0", desc: "Push to registry" },
          { cmd: "docker image prune -a", desc: "Remove all unused images" },
        ],
      },
      {
        title: "Containers",
        commands: [
          { cmd: "docker run -d -p 8080:80 --name web nginx", desc: "Run detached with port map" },
          { cmd: "docker run --rm -it alpine /bin/sh", desc: "Interactive, auto-remove" },
          { cmd: "docker ps -a", desc: "All containers (including stopped)" },
          { cmd: "docker logs -f <ctr>", desc: "Follow container logs" },
          { cmd: "docker exec -it <ctr> bash", desc: "Shell into running container" },
          { cmd: "docker stop <ctr> && docker rm <ctr>", desc: "Stop and remove" },
        ],
      },
      {
        title: "Networks & Volumes",
        commands: [
          { cmd: "docker network create mynet", desc: "Create a custom bridge network" },
          { cmd: "docker network ls", desc: "List networks" },
          { cmd: "docker volume create mydata", desc: "Create named volume" },
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
        ],
      },
    ],
  },
  {
    id: "git",
    label: "Git",
    icon: "⎇",
    color: COLORS.orange,
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
          { cmd: "git merge --no-ff feature/x", desc: "Merge with explicit commit" },
          { cmd: "git rebase main", desc: "Rebase current branch onto main" },
        ],
      },
      {
        title: "Undo & Fix",
        commands: [
          { cmd: "git reset --soft HEAD~1", desc: "Undo commit, keep changes staged" },
          { cmd: "git reset --hard HEAD~1", desc: "Undo commit, discard changes" },
          { cmd: "git revert <sha>", desc: "Safe undo via new commit" },
          { cmd: "git stash push -m \"wip\"", desc: "Stash with message" },
          { cmd: "git reflog", desc: "History of HEAD movements" },
        ],
      },
    ],
  },
  {
    id: "linux",
    label: "Linux",
    icon: "❯",
    color: COLORS.green,
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
        ],
    ],
  },
  {
    id: "helm",
    label: "Helm",
    icon: "⎈",
    color: COLORS.purple,
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
    id: "terraform",
    label: "Terraform",
    icon: "⬡",
    color: "#7b61ff",
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
    id: "prometheus",
    label: "Prometheus",
    icon: "◎",
    color: COLORS.orange,
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
    id: "netlinux",
    label: "Networking",
    icon: "⇄",
    color: COLORS.cyan,
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
