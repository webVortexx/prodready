const RESPONSES = [
  {
    pattern: /^kubectl get pods/i,
    output: `NAME                           READY   STATUS    RESTARTS   AGE
frontend-7f8d9c9bd6-abc12       1/1     Running   0          22m
api-79cd8f4b7c-hjklm           2/2     Running   0          22m`,
  },
  {
    pattern: /^kubectl get services/i,
    output: `NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
frontend     ClusterIP   10.96.0.12      <none>        80/TCP    22m
redis        ClusterIP   10.96.0.23      <none>        6379/TCP  22m`,
  },
  {
    pattern: /^kubectl get nodes/i,
    output: `NAME       STATUS   ROLES    AGE   VERSION
node-1     Ready    control-plane,worker   5d    v1.28.0
node-2     Ready    worker                5d    v1.28.0`,
  },
  {
    pattern: /^kubectl get deployments/i,
    output: `NAME       READY   UP-TO-DATE   AVAILABLE   AGE
frontend   1/1     1            1           22m`,
  },
  {
    pattern: /^kubectl get namespaces/i,
    output: `NAME              STATUS   AGE
default           Active   14d
kube-system       Active   14d
prod              Active   5d`,
  },
  {
    pattern: /^kubectl describe pod/i,
    output: `Name:         frontend-7f8d9c9bd6-abc12
Namespace:    default
Node:         node-1/192.168.1.12
Status:       Running
Containers:
  frontend:
    Image:  ghcr.io/example/frontend:latest
    Ready:  true
    State:  Running
    Started: 22 minutes ago`,
  },
  {
    pattern: /^kubectl describe svc/i,
    output: `Name:              frontend
Namespace:         default
Type:              ClusterIP
IP:                10.96.0.12
Port:              80/TCP
Selector:          app=frontend`,
  },
  {
    pattern: /^kubectl logs/i,
    output: `2026-05-07T14:12:01Z frontend INFO  Starting service...
2026-05-07T14:12:02Z frontend INFO  Connected to Redis
2026-05-07T14:12:03Z frontend INFO  Listening on port 8080`,
  },
  {
    pattern: /^kubectl exec/i,
    output: `Defaulting container name to frontend.
Use 'kubectl describe pod/frontend-7f8d9c9bd6-abc12 -n default' to see all of the containers in this pod.
$ ls /app
Dockerfile  dist  node_modules  src`,
  },
  {
    pattern: /^kubectl port-forward/i,
    output: `Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80`,
  },
  {
    pattern: /^kubectl apply/i,
    output: `deployment.apps/frontend configured
service/frontend unchanged`,
  },
  {
    pattern: /^kubectl delete/i,
    output: `deployment.apps "frontend" deleted
service "frontend" deleted`,
  },
  {
    pattern: /^kubectl scale/i,
    output: `deployment.apps/frontend scaled`,
  },
  {
    pattern: /^kubectl rollout status/i,
    output: `deployment "frontend" successfully rolled out`,
  },
  {
    pattern: /^kubectl rollout undo/i,
    output: `deployment.apps/frontend rolled back`,
  },
  {
    pattern: /^kubectl top nodes/i,
    output: `NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
node-1     120m         6%     1480Mi          24%
node-2     100m         5%     1350Mi          22%`,
  },
  {
    pattern: /^kubectl top pods/i,
    output: `NAME                          CPU(cores)   MEMORY(bytes)
frontend-7f8d9c9bd6-abc12       35m          120Mi
api-79cd8f4b7c-hjklm           48m          140Mi`,
  },
  {
    pattern: /^helm repo add/i,
    output: `"bitnami" has been added to your repositories`,
  },
  {
    pattern: /^helm repo update/i,
    output: `Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "bitnami" chart repository`,
  },
  {
    pattern: /^helm repo list/i,
    output: `NAME    URL
bitnami https://charts.bitnami.com/bitnami`,
  },
  {
    pattern: /^helm search repo/i,
    output: `NAME                    CHART VERSION   APP VERSION     DESCRIPTION
bitnami/nginx           13.2.27         1.20.0          Chart for NGINX`,
  },
  {
    pattern: /^helm install/i,
    output: `NAME: my-app
LAST DEPLOYED: Wed May  7 14:15:00 2026
NAMESPACE: default
STATUS: deployed
NOTES:
1. Get the application URL by running:
   kubectl get svc --namespace default`,
  },
  {
    pattern: /^helm upgrade/i,
    output: `Release "my-app" has been upgraded. Happy Helming!`,
  },
  {
    pattern: /^helm list/i,
    output: `NAME    NAMESPACE   REVISION   UPDATED                     STATUS    CHART           APP VERSION
my-app  default     2          2026-05-07 14:15:00        deployed  nginx-13.2.27   1.20.0`,
  },
  {
    pattern: /^helm status/i,
    output: `NAME: my-app
LAST DEPLOYED: Wed May  7 14:15:00 2026
NAMESPACE: default
STATUS: deployed
REVISION: 2`,
  },
  {
    pattern: /^helm get values/i,
    output: `replicaCount: 2
image:
  repository: nginx
  tag: 1.20.0`,
  },
  {
    pattern: /^helm get manifest/i,
    output: `---
# Source: nginx/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment`,
  },
  {
    pattern: /^helm history/i,
    output: `REVISION   UPDATED                     STATUS    CHART          APP VERSION
1          Wed May  7 14:12:00 2026    superseded nginx-13.2.26   1.19.0
2          Wed May  7 14:15:00 2026    deployed   nginx-13.2.27   1.20.0`,
  },
  {
    pattern: /^helm template/i,
    output: `# Source: nginx/templates/service.yaml
apiVersion: v1
kind: Service`,
  },
  {
    pattern: /^helm lint/i,
    output: `1 chart(s) linted, no failures`,
  },
  {
    pattern: /^helm rollback/i,
    output: `Rollback was a success. Release "my-app" has been rolled back.`,
  },
  {
    pattern: /^helm uninstall/i,
    output: `release "my-app" uninstalled`,
  },
  {
    pattern: /^terraform init/i,
    output: `Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!`,
  },
  {
    pattern: /^terraform fmt/i,
    output: `Formatted 3 file(s)`,
  },
  {
    pattern: /^terraform validate/i,
    output: `Success! The configuration is valid.`,
  },
  {
    pattern: /^terraform plan -out=/i,
    output: `Plan: 2 to add, 1 to change, 0 to destroy.

This plan was saved to: tfplan`,
  },
  {
    pattern: /^terraform plan/i,
    output: `Plan: 2 to add, 1 to change, 0 to destroy.

─────────────────────────────────────────────────────────────────────────────
Note: You didn't specify an "-out" parameter to save this plan, so Terraform
can't guarantee to perform exactly these actions when you apply.`,
  },
  {
    pattern: /^terraform apply/i,
    output: `aws_instance.web: Creating...
aws_instance.web: Creation complete after 12s
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.`,
  },
  {
    pattern: /^terraform destroy/i,
    output: `aws_instance.web: Destroying...
aws_instance.web: Destruction complete after 8s
Destroy complete! Resources: 1 destroyed.`,
  },
  {
    pattern: /^terraform state list/i,
    output: `aws_instance.web
aws_s3_bucket.static`,
  },
  {
    pattern: /^terraform state show/i,
    output: `# aws_instance.web:
resource "aws_instance" "web" {
  id           = "i-1234567890abcdef0"
  instance_type = "t3.micro"
}`,
  },
  {
    pattern: /^terraform state rm/i,
    output: `Removed aws_instance.web from the state file.`,
  },
  {
    pattern: /^terraform import/i,
    output: `aws_instance.web imported successfully!`,
  },
  {
    pattern: /^terraform workspace list/i,
    output: `* default
  staging
  prod`,
  },
  {
    pattern: /^terraform workspace new/i,
    output: `Created and switched to workspace "staging".`,
  },
  {
    pattern: /^terraform workspace select/i,
    output: `Switched to workspace "prod".`,
  },
  {
    pattern: /^terraform output/i,
    output: `db_password = "supersecret"
url = "https://app.example.com"`,
  },
  {
    pattern: /^promtool check config/i,
    output: `Checking prometheus.yml
  SUCCESS: 1 rule_files loaded
  SUCCESS: 0 errors found`,
  },
  {
    pattern: /^promtool check rules/i,
    output: `Checking rules.yml
  SUCCESS: 1 group found
  SUCCESS: 0 problems found`,
  },
  {
    pattern: /^promtool query instant/i,
    output: `up 1
`,
  },
  {
    pattern: /^dig /i,
    output: `; <<>> DiG 9.16.1-Ubuntu <<>> google.com
;; ANSWER SECTION:
google.com.  49 IN  A 142.250.72.14`,
  },
  {
    pattern: /^ip addr show/i,
    output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default
    inet 127.0.0.1/8 scope host lo`,
  },
  {
    pattern: /^ip route show/i,
    output: `default via 192.168.1.1 dev eth0
10.96.0.0/12 via 10.96.0.1 dev cni0`,
  },
  {
    pattern: /^ss -tulnp/i,
    output: `Netid  State   Recv-Q Send-Q Local Address:Port  Peer Address:Port
tcp    LISTEN  0      128    127.0.0.1:8080        0.0.0.0:*      users:("node",pid=1234,fd=21)`,
  },
  {
    pattern: /^traceroute/i,
    output: `traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets
 1  192.168.1.1  0.531 ms
 2  10.0.0.1     1.245 ms
 3  8.8.8.8     14.822 ms`,
  },
  {
    pattern: /^curl /i,
    output: `HTTP/1.1 200 OK
content-type: text/html; charset=UTF-8

<html>...OK...</html>`,
  },
  {
    pattern: /^kubectl get /i,
    output: `No exact mock exists for this resource yet, but the cluster query ran successfully.
You can add a more specific simulator entry for this command.`,
  },
  {
    pattern: /^helm /i,
    output: `Helm command accepted. This is a mocked response for learning and preview.
Add a specific simulator entry for the full command to get a richer output.`,
  },
  {
    pattern: /^terraform /i,
    output: `Terraform command accepted in simulation mode.
Add a more specific simulator rule for this command to see a realistic mocked response.`,
  },
];

export function getSimulatedResponse(command) {
  const normalized = String(command || "").trim();
  if (!normalized) {
    return { output: "Enter a command to simulate.", success: false };
  }

  // Validate syntax and spelling first
  const validationResult = validateCommandSyntax(normalized);
  if (!validationResult.valid) {
    return { output: validationResult.error, success: false };
  }

  const match = RESPONSES.find(entry => entry.pattern.test(normalized));
  if (match) {
    return { output: match.output, success: true };
  }

  return {
    output: `Simulated execution finished for:\n${normalized}\n\nThis is a demo response. Replace it with a real sandbox or backend if you want actual command behavior.`,
    success: true,
  };
}

function validateCommandSyntax(command) {
  const parts = command.split(/\s+/);
  const base = parts[0].toLowerCase();

  // Common misspellings - ONLY include wrong spellings, NOT correct ones
  const misspellings = {
    "kubctl": "kubectl",
    "kubectll": "kubectl",
    "helms": "helm",
    "terrafrom": "terraform",
    "terrform": "terraform",
    "terrafor": "terraform",
    "promtol": "promtool",
    "promtools": "promtool",
  };

  // Check if it's a misspelling
  if (misspellings[base]) {
    return {
      valid: false,
      error: `Error: command not found: '${base}'\nDid you mean '${misspellings[base]}'?`,
    };
  }

  // Valid base commands
  const validCommands = ["kubectl", "helm", "terraform", "promtool", "docker", "git", "dig", "curl", "ip", "ss", "traceroute"];
  
  // If command is not in valid list and not in misspellings, it's unknown
  if (!validCommands.includes(base)) {
    return {
      valid: false,
      error: `Error: command not found: '${base}'\nSupported tools: kubectl, helm, terraform, promtool, docker, git, dig, curl`,
    };
  }

  // kubectl validation
  if (base === "kubectl") {
    if (parts.length < 2) {
      return {
        valid: false,
        error: `Error: kubectl requires a command.\nUsage: kubectl [command]\nExamples: kubectl get, kubectl apply, kubectl delete`,
      };
    }
    const subcommand = parts[1].toLowerCase();
    const validSubcommands = [
      "get", "describe", "logs", "exec", "port-forward", "apply", "delete",
      "scale", "rollout", "top", "config", "cluster-info", "version", "auth"
    ];
    if (!validSubcommands.includes(subcommand)) {
      return {
        valid: false,
        error: `Error: unknown kubectl command '${subcommand}'.\nValid commands: get, describe, logs, exec, apply, delete, scale, rollout, etc.`,
      };
    }
    if (subcommand === "get" && parts.length < 3) {
      return {
        valid: false,
        error: `Error: kubectl get requires a resource type.\nUsage: kubectl get [RESOURCE]\nExamples: kubectl get pods, kubectl get services, kubectl get nodes`,
      };
    }
    if (subcommand === "describe" && parts.length < 3) {
      return {
        valid: false,
        error: `Error: kubectl describe requires a resource type.\nUsage: kubectl describe [RESOURCE] [NAME]\nExample: kubectl describe pod frontend-abc123`,
      };
    }
    if (subcommand === "logs" && parts.length < 3) {
      return {
        valid: false,
        error: `Error: kubectl logs requires a pod name.\nUsage: kubectl logs [POD_NAME]\nExample: kubectl logs frontend-abc123`,
      };
    }
  }

  // helm validation
  if (base === "helm") {
    if (parts.length < 2) {
      return {
        valid: false,
        error: `Error: helm requires a command.\nUsage: helm [command]\nExamples: helm install, helm upgrade, helm list`,
      };
    }
    const subcommand = parts[1].toLowerCase();
    const validSubcommands = [
      "install", "upgrade", "uninstall", "list", "status", "history",
      "rollback", "get", "repo", "search", "template", "lint", "delete"
    ];
    if (!validSubcommands.includes(subcommand)) {
      return {
        valid: false,
        error: `Error: unknown helm command '${subcommand}'.\nValid commands: install, upgrade, uninstall, list, status, rollback, etc.`,
      };
    }
    if ((subcommand === "install" || subcommand === "upgrade") && parts.length < 3) {
      return {
        valid: false,
        error: `Error: helm ${subcommand} requires a release name and chart.\nUsage: helm ${subcommand} [RELEASE] [CHART]\nExample: helm ${subcommand} my-app bitnami/nginx`,
      };
    }
  }

  // terraform validation
  if (base === "terraform") {
    if (parts.length < 2) {
      return {
        valid: false,
        error: `Error: terraform requires a command.\nUsage: terraform [command]\nExamples: terraform init, terraform plan, terraform apply`,
      };
    }
    const subcommand = parts[1].toLowerCase();
    const validSubcommands = [
      "init", "plan", "apply", "destroy", "validate", "fmt", "state",
      "import", "output", "workspace", "graph", "refresh", "taint"
    ];
    if (!validSubcommands.includes(subcommand)) {
      return {
        valid: false,
        error: `Error: unknown terraform command '${subcommand}'.\nValid commands: init, plan, apply, destroy, validate, fmt, state, etc.`,
      };
    }
  }

  // promtool validation
  if (base === "promtool") {
    if (parts.length < 2) {
      return {
        valid: false,
        error: `Error: promtool requires a command.\nUsage: promtool [command]\nExamples: promtool check config, promtool query instant`,
      };
    }
    const subcommand = parts[1].toLowerCase();
    const validSubcommands = ["check", "query", "rules", "tsdb"];
    if (!validSubcommands.includes(subcommand)) {
      return {
        valid: false,
        error: `Error: unknown promtool command '${subcommand}'.\nValid commands: check, query, rules, tsdb`,
      };
    }
  }

  // docker validation
  if (base === "docker") {
    if (parts.length < 2) {
      return {
        valid: false,
        error: `Error: docker requires a command.\nUsage: docker [command]\nExamples: docker run, docker build, docker push`,
      };
    }
    const subcommand = parts[1].toLowerCase();
    const validSubcommands = [
      "run", "build", "push", "pull", "ps", "images", "logs", "exec",
      "stop", "rm", "network", "volume", "compose"
    ];
    if (!validSubcommands.includes(subcommand)) {
      return {
        valid: false,
        error: `Error: unknown docker command '${subcommand}'.\nValid commands: run, build, push, pull, ps, images, logs, etc.`,
      };
    }
  }

  // git validation
  if (base === "git") {
    if (parts.length < 2) {
      return {
        valid: false,
        error: `Error: git requires a command.\nUsage: git [command]\nExamples: git clone, git commit, git push`,
      };
    }
    const subcommand = parts[1].toLowerCase();
    const validSubcommands = [
      "init", "clone", "add", "commit", "push", "pull", "branch", "checkout",
      "merge", "rebase", "stash", "log", "status", "reset", "revert"
    ];
    if (!validSubcommands.includes(subcommand)) {
      return {
        valid: false,
        error: `Error: unknown git command '${subcommand}'.\nValid commands: clone, commit, push, pull, branch, checkout, merge, etc.`,
      };
    }
  }

  // Check for common invalid flag patterns
  if (command.includes("--") && command.match(/--\s*$/)) {
    return {
      valid: false,
      error: `Error: incomplete flag. Flag cannot be empty.\nExample: --dry-run, --output=json, --namespace=default`,
    };
  }

  if (command.match(/--[a-z]+=\s*$/)) {
    return {
      valid: false,
      error: `Error: incomplete flag value. Provide a value after '='.\nExample: --output=json, --replicas=3`,
    };
  }

  return { valid: true };
}


export function inferSimulatorTool(command) {
  const trimmed = String(command || "").trim().toLowerCase();
  if (trimmed.startsWith("kubectl")) return "kubectl";
  if (trimmed.startsWith("helm")) return "helm";
  if (trimmed.startsWith("terraform")) return "terraform";
  if (trimmed.startsWith("promtool") || trimmed.startsWith("dig") || trimmed.startsWith("curl") || trimmed.startsWith("ip") || trimmed.startsWith("ss") || trimmed.startsWith("traceroute")) return "networking";
  return "generic";
}
