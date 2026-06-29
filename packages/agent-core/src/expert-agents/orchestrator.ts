import type { ExpertCatalogEntry, ExpertSearchResult, ExpertSwarmPlan } from './types';
import { globalExpertSearchEngine } from './search';

export interface TaskAnalysis {
  readonly domains: readonly string[];
  readonly complexity: 'simple' | 'medium' | 'complex';
  readonly suggestedExpertCount: number;
}

export class UltraSwarmOrchestrator {
  addExpert(expert: ExpertCatalogEntry): void {
    globalExpertSearchEngine.addExpert(expert);
  }

  removeExpert(id: string): boolean {
    return globalExpertSearchEngine.removeExpert(id);
  }

  async analyzeTask(taskDescription: string): Promise<TaskAnalysis> {
    await globalExpertSearchEngine.initialize();

    // Extract potential domains by searching with keywords from the task
    const keywords = taskDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const domainSet = new Set<string>();
    const seenExperts = new Set<string>();

    // Search with the full description first
    const fullResults = globalExpertSearchEngine.search({ query: taskDescription, topK: 10 });
    for (const r of fullResults) {
      domainSet.add(r.expert.division);
      seenExperts.add(r.expert.id);
    }

    // Then search with individual keywords for broader coverage
    for (const keyword of keywords.slice(0, 5)) {
      const results = globalExpertSearchEngine.search({ query: keyword, topK: 3 });
      for (const r of results) {
        if (!seenExperts.has(r.expert.id)) {
          domainSet.add(r.expert.division);
          seenExperts.add(r.expert.id);
        }
      }
    }

    const domains = Array.from(domainSet);
    const complexity =
      domains.length > 3 ? 'complex' : domains.length > 1 ? 'medium' : 'simple';
    const suggestedExpertCount = complexity === 'complex' ? 5 : complexity === 'medium' ? 3 : 1;

    return { domains, complexity, suggestedExpertCount };
  }

  async buildSwarmPlan(
    taskDescription: string,
    expertIds?: readonly string[],
  ): Promise<ExpertSwarmPlan> {
    await globalExpertSearchEngine.initialize();

    let experts: ExpertSearchResult[];

    if (expertIds !== undefined && expertIds.length > 0) {
      // Explicit expert selection
      experts = expertIds
        .map((id) => {
          const expert = globalExpertSearchEngine.getExpertById(id);
          return expert !== undefined ? { expert, score: 1 } : undefined;
        })
        .filter((e): e is ExpertSearchResult => e !== undefined);
    } else {
      // Auto-select experts based on task analysis
      const analysis = await this.analyzeTask(taskDescription);
      experts = [];
      const seen = new Set<string>();

      for (const domain of analysis.domains) {
        const domainExperts = globalExpertSearchEngine.search({
          query: taskDescription,
          topK: 2,
          division: domain,
        });
        for (const e of domainExperts) {
          if (!seen.has(e.expert.id)) {
            experts.push(e);
            seen.add(e.expert.id);
          }
        }
      }

      // If we still don't have enough, do a broad search
      if (experts.length < analysis.suggestedExpertCount) {
        const broad = globalExpertSearchEngine.search({
          query: taskDescription,
          topK: analysis.suggestedExpertCount + 3,
        });
        for (const e of broad) {
          if (!seen.has(e.expert.id)) {
            experts.push(e);
            seen.add(e.expert.id);
          }
          if (experts.length >= analysis.suggestedExpertCount) break;
        }
      }
    }

    const strategy: ExpertSwarmPlan['strategy'] =
      experts.length > 3 ? 'mixed' : experts.length > 1 ? 'parallel' : 'sequential';

    const assignments = experts.map((result, index) => {
      const prev = experts[index - 1];
      return {
        expertId: result.expert.id,
        expertName: result.expert.name,
        emoji: result.expert.emoji,
        color: result.expert.color,
        prompt: this.buildExpertPrompt(result.expert, taskDescription, index),
        dependsOn: strategy === 'sequential' && index > 0 && prev !== undefined ? [prev.expert.id] : undefined,
      };
    });

    return {
      taskDescription,
      experts: assignments,
      strategy,
    };
  }

  private buildExpertPrompt(expert: ExpertCatalogEntry, taskDescription: string, index: number): string {
    const base = `You are ${expert.name} (${expert.emoji}).\n\n${expert.personaText.slice(0, 1500)}`;
    const context = index === 0
      ? `You have been summoned as part of an UltraSwarm to tackle this task:\n\n${taskDescription}\n\nFocus on your specific expertise and provide a detailed, high-quality contribution.`
      : `You are working alongside other experts on this task:\n\n${taskDescription}\n\nFocus on your specific expertise. Your work may build on or complement the work of other experts in the swarm.`;
    return `${base}\n\n---\n\n${context}`;
  }
}

export const globalUltraSwarmOrchestrator = new UltraSwarmOrchestrator();
