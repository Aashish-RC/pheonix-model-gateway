import { CalculatedCost, ModelPricingTier, MultiUnitUsage } from '../types/telemetry.js';

export class PricingEngine {
  private static pricingTable: Map<string, ModelPricingTier> = new Map([
    // OpenAI models (Independent pricing data)
    ['gpt-4o', { model: 'gpt-4o', inputPer1k: 0.0025, outputPer1k: 0.01, cacheReadPer1k: 0.00125 }],
    ['gpt-4o-mini', { model: 'gpt-4o-mini', inputPer1k: 0.00015, outputPer1k: 0.0006, cacheReadPer1k: 0.000075 }],
    ['o1', { model: 'o1', inputPer1k: 0.015, outputPer1k: 0.06, reasoningPer1k: 0.06, cacheReadPer1k: 0.0075 }],
    ['o3-mini', { model: 'o3-mini', inputPer1k: 0.0011, outputPer1k: 0.0044, reasoningPer1k: 0.0044, cacheReadPer1k: 0.00055 }],
    
    // Anthropic Claude models
    ['claude-3-7-sonnet', { model: 'claude-3-7-sonnet', inputPer1k: 0.003, outputPer1k: 0.015, cacheReadPer1k: 0.0003, cacheWritePer1k: 0.00375 }],
    ['claude-3-5-sonnet', { model: 'claude-3-5-sonnet', inputPer1k: 0.003, outputPer1k: 0.015, cacheReadPer1k: 0.0003, cacheWritePer1k: 0.00375 }],
    ['claude-3-5-haiku', { model: 'claude-3-5-haiku', inputPer1k: 0.0008, outputPer1k: 0.004, cacheReadPer1k: 0.00008, cacheWritePer1k: 0.001 }],

    // Google Gemini models
    ['gemini-1.5-pro', { model: 'gemini-1.5-pro', inputPer1k: 0.00125, outputPer1k: 0.005, cacheReadPer1k: 0.0003125 }],
    ['gemini-1.5-flash', { model: 'gemini-1.5-flash', inputPer1k: 0.000075, outputPer1k: 0.0003, cacheReadPer1k: 0.00001875 }],
    ['gemini-2.0-flash', { model: 'gemini-2.0-flash', inputPer1k: 0.0001, outputPer1k: 0.0004, cacheReadPer1k: 0.000025 }],

    // Local / Self-hosted models (Zero cost)
    ['ollama', { model: 'ollama', inputPer1k: 0.0, outputPer1k: 0.0 }],
    ['llama.cpp', { model: 'llama.cpp', inputPer1k: 0.0, outputPer1k: 0.0 }],
    ['localai', { model: 'localai', inputPer1k: 0.0, outputPer1k: 0.0 }],
    ['llama3.2', { model: 'llama3.2', inputPer1k: 0.0, outputPer1k: 0.0 }]
  ]);

  public static registerTier(tier: ModelPricingTier): void {
    this.pricingTable.set(tier.model.toLowerCase(), tier);
  }

  public static getTier(model: string): ModelPricingTier {
    return this.pricingTable.get(model.toLowerCase()) || {
      model,
      inputPer1k: 0.001,
      outputPer1k: 0.002
    };
  }

  public static calculateCost(model: string, usage: MultiUnitUsage): CalculatedCost {
    const tier = this.getTier(model);

    const regularPromptTokens = Math.max(0, usage.promptTokens - usage.cachedPromptTokens);
    const promptCost = (regularPromptTokens / 1000) * tier.inputPer1k;
    
    const cacheRate = tier.cacheReadPer1k ?? tier.inputPer1k * 0.5;
    const cachedPromptCost = (usage.cachedPromptTokens / 1000) * cacheRate;
    const cacheDiscount = ((usage.cachedPromptTokens / 1000) * tier.inputPer1k) - cachedPromptCost;

    const completionCost = (usage.completionTokens / 1000) * tier.outputPer1k;
    const reasoningRate = tier.reasoningPer1k ?? tier.outputPer1k;
    const reasoningCost = (usage.reasoningTokens / 1000) * reasoningRate;

    const totalCost = promptCost + cachedPromptCost + completionCost + reasoningCost;

    return {
      currency: 'USD',
      promptCost: Number(promptCost.toFixed(6)),
      completionCost: Number(completionCost.toFixed(6)),
      reasoningCost: Number(reasoningCost.toFixed(6)),
      cacheDiscount: Number(Math.max(0, cacheDiscount).toFixed(6)),
      totalCost: Number(totalCost.toFixed(6))
    };
  }
}
