import { AICandidateAction } from './aiDecisionEngine';

export interface AIDebugStep {
  id: string;
  turnNumber: number;
  timestamp: number;
  chosenAction: AICandidateAction;
  candidates: AICandidateAction[];
}

class AIDebugManager {
  private history: AIDebugStep[] = [];
  private isEnabled: boolean = false;

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public recordDecision(turnNumber: number, chosenAction: AICandidateAction, candidates: AICandidateAction[]) {
    const step: AIDebugStep = {
      id: `ai-step-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      turnNumber,
      timestamp: Date.now(),
      chosenAction,
      candidates: candidates.slice(0, 8) // Keep top 8 for inspection
    };

    this.history.unshift(step);
    if (this.history.length > 30) {
      this.history.pop();
    }
  }

  public getHistory(): AIDebugStep[] {
    return this.history;
  }

  public clear() {
    this.history = [];
  }
}

export const aiDebugManager = new AIDebugManager();
