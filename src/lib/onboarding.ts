type Phase = 'welcome' | 'inventory' | 'dashboard' | 'done';

const PHASE_KEY = 'zakatinator-onboarding-phase';

export function getOnboardingPhase(): Phase {
  const raw = localStorage.getItem(PHASE_KEY);
  if (!raw) return 'welcome';
  if (raw === 'inventory' || raw === 'dashboard' || raw === 'done') return raw;
  return 'welcome';
}

export function setOnboardingPhase(phase: Phase) {
  localStorage.setItem(PHASE_KEY, phase);
}

export function isOnboardingComplete() {
  return getOnboardingPhase() === 'done';
}

