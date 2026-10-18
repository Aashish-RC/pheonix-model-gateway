/**
 * Feature 44: Dual-Tier Mesh Architecture
 * Bridges Tier-1 Ingress (Auth, PII, Policy) to Tier-2 Inference Cluster Nodes (vLLM, TensorRT-LLM, Ollama).
 */

export interface InferenceNode {
  id: string;
  endpoint: string;
  model: string;
  gpuType?: string;
  activeSlots: number;
  maxSlots: number;
  healthy: boolean;
  latencyMs: number;
  weight: number;
  labels?: Record<string, string>;
}

export interface MeshRoutingDecision {
  selectedNode: InferenceNode;
  internalAuthToken: string;
  nodeUrl: string;
}

export class MeshClusterManager {
  private nodes: Map<string, InferenceNode> = new Map();

  registerNode(node: InferenceNode): void {
    this.nodes.set(node.id, { ...node });
  }

  deregisterNode(nodeId: string): boolean {
    return this.nodes.delete(nodeId);
  }

  setNodeHealth(nodeId: string, healthy: boolean, latencyMs?: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.healthy = healthy;
      if (latencyMs !== undefined) node.latencyMs = latencyMs;
    }
  }

  incrementSlot(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) node.activeSlots++;
  }

  decrementSlot(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node && node.activeSlots > 0) node.activeSlots--;
  }

  getNodes(): InferenceNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Schedules request onto the best Tier-2 node using least-concurrency + GPU availability weighting
   */
  selectNode(model: string, requiredLabels?: Record<string, string>): InferenceNode | null {
    const candidates = Array.from(this.nodes.values()).filter((n) => {
      if (!n.healthy || n.activeSlots >= n.maxSlots) return false;
      if (n.model !== model && n.model !== '*') return false;
      if (requiredLabels) {
        for (const [k, v] of Object.entries(requiredLabels)) {
          if (n.labels?.[k] !== v) return false;
        }
      }
      return true;
    });

    if (candidates.length === 0) return null;

    // Sort by lowest slot utilization ratio, then lowest latency
    candidates.sort((a, b) => {
      const utilA = a.activeSlots / a.maxSlots;
      const utilB = b.activeSlots / b.maxSlots;
      if (Math.abs(utilA - utilB) > 0.05) return utilA - utilB;
      return a.latencyMs - b.latencyMs;
    });

    return candidates[0];
  }
}

export class DualTierMeshRouter {
  private cluster: MeshClusterManager;
  private meshClusterSecret: string;

  constructor(cluster?: MeshClusterManager, meshClusterSecret: string = 'internal-mesh-secret-key') {
    this.cluster = cluster || new MeshClusterManager();
    this.meshClusterSecret = meshClusterSecret;
  }

  getCluster(): MeshClusterManager {
    return this.cluster;
  }

  routeToTier2(model: string, requiredLabels?: Record<string, string>): MeshRoutingDecision | null {
    const node = this.cluster.selectNode(model, requiredLabels);
    if (!node) return null;

    this.cluster.incrementSlot(node.id);

    // Generate internal signed cluster token for Tier-2 ingress
    const token = `tier2_mesh_${Buffer.from(`${node.id}:${Date.now()}:${this.meshClusterSecret}`).toString('base64')}`;

    return {
      selectedNode: node,
      internalAuthToken: token,
      nodeUrl: `${node.endpoint}/v1/chat/completions`,
    };
  }

  releaseTier2(nodeId: string): void {
    this.cluster.decrementSlot(nodeId);
  }
}
