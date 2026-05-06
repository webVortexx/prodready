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
      },
    ],
  },
];
