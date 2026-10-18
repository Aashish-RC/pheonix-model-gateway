import { describe, it, expect } from 'vitest';
import { MeshClusterManager, DualTierMeshRouter } from '../src/routing/mesh.js';

describe('Feature 44: Dual-Tier Mesh Architecture', () => {
  it('selects optimal Tier-2 inference node based on GPU utilization and model support', () => {
    const cluster = new MeshClusterManager();
    cluster.registerNode({
      id: 'node-h100-1',
      endpoint: 'http://vllm-node-1.internal:8000',
      model: 'meta-llama/Llama-3-70b-Instruct',
      gpuType: 'H100',
      activeSlots: 5,
      maxSlots: 10,
      healthy: true,
      latencyMs: 120,
      weight: 1.0,
    });

    cluster.registerNode({
      id: 'node-h100-2',
      endpoint: 'http://vllm-node-2.internal:8000',
      model: 'meta-llama/Llama-3-70b-Instruct',
      gpuType: 'H100',
      activeSlots: 1, // Much less utilized
      maxSlots: 10,
      healthy: true,
      latencyMs: 110,
      weight: 1.0,
    });

    const router = new DualTierMeshRouter(cluster);
    const decision = router.routeToTier2('meta-llama/Llama-3-70b-Instruct');

    expect(decision).not.toBeNull();
    expect(decision?.selectedNode.id).toBe('node-h100-2');
    expect(decision?.internalAuthToken).toContain('tier2_mesh_');
    expect(decision?.nodeUrl).toBe('http://vllm-node-2.internal:8000/v1/chat/completions');

    // Slot incremented
    expect(cluster.getNodes().find((n) => n.id === 'node-h100-2')?.activeSlots).toBe(2);

    // Release slot
    router.releaseTier2('node-h100-2');
    expect(cluster.getNodes().find((n) => n.id === 'node-h100-2')?.activeSlots).toBe(1);
  });

  it('skips unhealthy or saturated inference nodes', () => {
    const cluster = new MeshClusterManager();
    cluster.registerNode({
      id: 'node-saturated',
      endpoint: 'http://node.internal:8000',
      model: 'mistral-7b',
      activeSlots: 10,
      maxSlots: 10,
      healthy: true,
      latencyMs: 50,
      weight: 1.0,
    });

    const router = new DualTierMeshRouter(cluster);
    const decision = router.routeToTier2('mistral-7b');
    expect(decision).toBeNull();
  });
});
