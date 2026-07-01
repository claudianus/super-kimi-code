import { truncateToWidth, type Component } from '@earendil-works/pi-tui';

import { STATUS_BULLET } from '#/tui/constant/symbols';
import { currentTheme } from '#/tui/theme/theme';

export type UltraworkModeMarkerState = 'active' | 'ended';

const ULTRAWORK_PIPELINE = 'UltraPlan -> UltraResearch -> UltraGoal -> UltraSwarm -> Integrate -> Verify -> Learn';
const ULTRAWORK_COMPACT_PIPELINE = 'UltraPlan>UltraResearch>UltraGoal>UltraSwarm>Integrate>Verify>Learn';
const ULTRAWORK_STAGE_STATUS = 'One Ultrawork: plan, research, team, integrate, verify, learn';
const ULTRAWORK_RESEARCH_STATUS = 'Research: local fallback + provider/MCP accelerators; verified sources only';
const ULTRAWORK_NEXT_ACTION = 'Next: Research + Swarm decision: ENGAGE|DEFER reason + value + owner';

export class UltraworkModeMarkerComponent implements Component {
  constructor(
    private readonly state: UltraworkModeMarkerState,
    private readonly taskDescription: string,
  ) {}

  invalidate(): void {}

  render(width: number): string[] {
    const safeWidth = Math.max(0, width);
    if (safeWidth <= 0) return [''];

    const token = this.state === 'ended' ? 'textDim' : 'success';
    const marker = currentTheme.boldFg(token, STATUS_BULLET);
    const label = currentTheme.boldFg(token, ultraworkMarkerLabel(this.state));
    const pipelineToken = this.state === 'ended' ? 'textDim' : 'primary';
    const pipelineText =
      `  ${ULTRAWORK_PIPELINE}`.length <= safeWidth
        ? `  ${ULTRAWORK_PIPELINE}`
        : `  ${ULTRAWORK_COMPACT_PIPELINE}`;
    const pipelineLine = currentTheme.fg(
      pipelineToken,
      truncateToWidth(pipelineText, safeWidth, '…'),
    );
    const stageStatusToken = this.state === 'ended' ? 'textDim' : 'text';
    const stageStatusLine = currentTheme.fg(
      stageStatusToken,
      truncateToWidth(`  ${ULTRAWORK_STAGE_STATUS}`, safeWidth, '…'),
    );
    const nextActionLine = currentTheme.fg(
      stageStatusToken,
      truncateToWidth(`  ${ULTRAWORK_NEXT_ACTION}`, safeWidth, '…'),
    );
    const researchLine = currentTheme.fg(
      stageStatusToken,
      truncateToWidth(`  ${ULTRAWORK_RESEARCH_STATUS}`, safeWidth, '…'),
    );
    const taskLine = currentTheme.fg('textDim', truncateToWidth(`  ${this.taskDescription}`, safeWidth, '…'));
    return [
      '',
      truncateToWidth(marker + label, safeWidth, '…'),
      pipelineLine,
      stageStatusLine,
      researchLine,
      nextActionLine,
      taskLine,
    ];
  }
}

function ultraworkMarkerLabel(state: UltraworkModeMarkerState): string {
  switch (state) {
    case 'active':
      return 'Ultrawork activated';
    case 'ended':
      return 'Ultrawork ended';
  }
}
