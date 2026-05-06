import { COLORS } from '../constants/colors.js';

export const RESOURCE_INFO = {
  cluster: {
    title: "Kubernetes Cluster",
    name: "production-cluster",
    what: "A Kubernetes cluster is a set of nodes (machines) that run containerized applications. It consists of a Control Plane (master) that manages the cluster and Worker Nodes that run your workloads.",
    concepts: [
      "Control Plane: API server, etcd, scheduler, controller manager",
      "Worker Nodes: Kubelet, kube-proxy, container runtime",
      "Namespace: Virtual cluster within the cluster for isolation",
      "etcd: Distributed key-value store for cluster state"
    ],
    why: "Clusters provide the foundation for container orchestration, enabling automatic deployment, scaling, and management of containerized applications.",
    yaml: `apiVersion: v1
kind: Config
metadata:
  name: cluster-config
cluster:
  name: production-cluster
  server: https://kubernetes.local:6443`,
    commands: [
      "kubectl cluster-info",
      "kubectl get nodes",
      "kubectl api-resources"
    ],
    practices: [
      "Use multiple control plane nodes for HA",
      "Set up cluster autoscaling",
      "Use namespaces for environment isolation"
    ]
  },
  ingress: {
    title: "Ingress",
    name: "nginx-ingress",
    what: "An Ingress is a Kubernetes resource that manages external HTTP/HTTPS access to services within the cluster. It provides routing rules based on hostnames and paths.",
    concepts: [
      "Ingress Controller: The implementation (nginx, traefik, envoy)",
      "Ingress Rules: Define path-based or host-based routing",
      "TLS Termination: HTTPS handling",
      "Annotations: Controller-specific configurations"
    ],
    why: "Ingress is the entry point for external traffic, enabling URL-based routing, SSL termination, and name-based virtual hosting.",
    yaml: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: my-app-svc
            port:
              number: 80`,
    commands: [
      "kubectl get ingress",
      "kubectl describe ingress my-app-ingress"
    ],
    practices: [
      "Use TLS certificates",
      "Set appropriate timeout values",
      "Configure health checks"
    ]
  },
  service: {
    title: "Service",
    name: "my-app-svc",
    what: "A Service is a stable network endpoint that exposes an application running on a set of Pods. It provides load balancing and service discovery.",
    concepts: [
      "Service Types: ClusterIP, NodePort, LoadBalancer, ExternalName",
      "Selector: Labels used to identify target pods",
      "DNS: Services get DNS names in format svc.namespace.svc.cluster.local",
      "Ports: port (service), targetPort (pod), nodePort (Node)"
    ],
    why: "Services enable stable network access to dynamic pods, handling load balancing and providing a stable endpoint even as pods are created/destroyed.",
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: my-app-svc
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: my-app
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP`,
    commands: [
      "kubectl get svc",
      "kubectl get endpoints",
      "kubectl describe svc my-app-svc"
    ],
    practices: [
      "Use named ports for clarity",
      "Set appropriate session affinity",
      "Configure proper targetPort"
    ]
  },
  deployment: {
    title: "Deployment",
    name: "my-app",
    what: "A Deployment provides declarative updates for Pods and ReplicaSets. It ensures the desired number of replicas are running and handles rolling updates and rollbacks.",
    concepts: [
      "ReplicaSet: Manages pod replicas",
      "Rolling Update: Gradual pod replacement with zero downtime",
      "Rollback: Revert to previous revision",
      "Strategy: RollingUpdate or Recreate"
    ],
    why: "Deployments enable declarative application management, ensuring your app stays running at the desired state and can be updated safely.",
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:1.0.0
        ports:
        - containerPort: 8080`,
    commands: [
      "kubectl rollout status deployment/my-app",
      "kubectl scale deployment/my-app --replicas=5",
      "kubectl rollout undo deployment/my-app"
    ],
    practices: [
      "Set resource requests/limits",
      "Configure liveness/readiness probes",
      "Use revision history for rollbacks"
    ]
  },
  pod: {
    title: "Pod",
    name: "my-app-7d9f8",
    what: "A Pod is the smallest deployable unit in Kubernetes, representing a single instance of a running process. It can contain one or more containers that share storage and network.",
    concepts: [
      "Pod Lifecycle: Pending → Running → Succeeded/Failed",
      "Container: Main app + optional sidecars",
      "Networking: Pods get unique IP, share port space",
      "Storage: Volumes mounted to containers"
    ],
    why: "Pods are the atomic unit of scheduling - they're created, scaled, and managed as a group through Deployments.",
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: my-app-7d9f8
  labels:
    app: my-app
spec:
  containers:
  - name: my-app
    image: my-app:1.0.0
    ports:
    - containerPort: 8080
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "500m"`,
    commands: [
      "kubectl logs my-app-7d9f8",
      "kubectl exec -it my-app-7d9f8 -- /bin/sh",
      "kubectl describe pod my-app-7d9f8"
    ],
    practices: [
      "Don't manage pods directly - use Deployments",
      "Set resource limits to prevent resource starvation",
      "Use health probes for reliability"
    ]
  },
  configmap: {
    title: "ConfigMap",
    name: "app-config",
    what: "A ConfigMap stores non-sensitive configuration data as key-value pairs or files. It's used to separate configuration from container images.",
    concepts: [
      "Data: Key-value configuration",
      "BinaryData: Binary content (base64 encoded)",
      "Mounting: As files or environment variables",
      "Immutability: Prevent accidental changes"
    ],
    why: "ConfigMaps allow you to externalize configuration, making applications portable across environments.",
    yaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  APP_NAME: "my-app"
  LOG_LEVEL: "info"
  database.properties: |
    host=db.example.com
    port=5432`,
    commands: [
      "kubectl get configmap",
      "kubectl describe configmap app-config"
    ],
    practices: [
      "Use immutable ConfigMaps for production",
      "Version ConfigMaps for rollback",
      "Mount as volumes for file-based config"
    ]
  },
  secret: {
    title: "Secret",
    name: "db-secret",
    what: "A Secret stores sensitive data like passwords, OAuth tokens, and SSH keys. Data is base64 encoded (not encrypted) by default.",
    concepts: [
      "Types: Opaque, kubernetes.io/tls, dockerconfigjson",
      "Encoding: Base64 (not encryption - use external secrets for encryption)",
      "Usage: Environment variables or volume mounts",
      "Security: Enable encryption at rest, use RBAC"
    ],
    why: "Secrets provide a secure way to inject sensitive data into pods without hardcoding them in images or YAML.",
    yaml: `apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: production
type: Opaque
stringData:
  username: admin
  password: changeme`,
    commands: [
      "kubectl get secret",
      "kubectl create secret generic db-secret --from-literal=password=secret",
      "kubectl describe secret db-secret"
    ],
    practices: [
      "Use external secret managers (Vault, AWS Secrets Manager)",
      "Enable encryption at rest in etcd",
      "Restrict secret access with RBAC"
    ]
  },
  pvc: {
    title: "PersistentVolumeClaim",
    name: "app-data-pvc",
    what: "A PVC is a request for storage by a user. It abstracts the underlying storage implementation from the pod.",
    concepts: [
      "StorageClass: Provisioner (gp2, standard, etc.)",
      "Access Modes: ReadWriteOnce, ReadOnlyMany, ReadWriteMany",
      "Binding: Dynamic provisioning or static binding",
      "Reclaim Policy: Retain, Delete, Recycle"
    ],
    why: "PVCs provide persistent storage that survives pod restarts, essential for databases and stateful applications.",
    yaml: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data-pvc
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard`,
    commands: [
      "kubectl get pvc",
      "kubectl describe pvc app-data-pvc"
    ],
    practices: [
      "Use appropriate storage class for performance needs",
      "Set appropriate storage size with growth in mind",
      "Use ReadWriteOnce for most workloads"
    ]
  }
};
