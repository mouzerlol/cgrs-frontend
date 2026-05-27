import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { SectionLabel } from '@/components/ui/SectionLabel';

interface PetitionHeaderProps {
  supporterCount: number;
  goal: number;
  isPetitionActive?: boolean;
}

const GOAL_PIP = 20;
const TOTAL_PIPS = 30;
const LOW_COUNT_THRESHOLD = 8;

export default function PetitionHeader({
  supporterCount,
  goal,
  isPetitionActive = true,
}: PetitionHeaderProps) {
  const signaturesPerPip = goal / GOAL_PIP;
  const rawFilledPips = Math.round(supporterCount / signaturesPerPip);
  const filledPips = supporterCount > 0 ? Math.max(1, rawFilledPips) : 0;
  const goalReached = supporterCount >= goal;
  const beyondGoal = Math.max(0, supporterCount - goal);
  const signaturesRemaining = Math.max(0, goal - supporterCount);
  const percentOfGoal = goal > 0 ? Math.round((supporterCount / goal) * 100) : 0;
  const showLowCountFraming = supporterCount < LOW_COUNT_THRESHOLD && !goalReached;

  return (
    <header className="mb-8">
      <SectionLabel as="p" className="mb-2">
        Petition
      </SectionLabel>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-forest leading-tight mb-4">
        Support the replacement of OAKS Property as our society manager
      </h1>
      <p className="font-body text-sm text-forest/70 mb-6">
        Organised by the{' '}
        <span className="font-medium text-forest">
          Coronation Gardens Residents Society Committee
        </span>
      </p>

      <div
        id="petition-meter"
        className="bg-forest-light rounded-xl p-5 md:p-6"
        role="meter"
        aria-valuenow={supporterCount}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label={`${supporterCount} of ${goal} signatures`}
      >
        {showLowCountFraming ? (
          <p className="font-display text-2xl md:text-3xl font-semibold text-bone leading-snug mb-6">
            Just starting.{' '}
            <span className="text-sage/80">Be one of the first to sign.</span>
          </p>
        ) : (
          <div className="flex items-baseline gap-2.5 mb-6">
            <span className="font-display text-4xl md:text-5xl font-semibold text-bone leading-none">
              {supporterCount.toLocaleString()}
            </span>
            <span className="font-body text-base md:text-lg text-sage/70">
              / {goal.toLocaleString()} signatures
            </span>
          </div>
        )}

        <div
          className="relative grid items-center pb-12"
          style={{ gridTemplateColumns: `repeat(${TOTAL_PIPS + 1}, 1fr)` }}
        >
          {Array.from({ length: GOAL_PIP }).map((_, i) => (
            <div
              key={i}
              style={{ transitionDelay: `${i * 30}ms` }}
              className={cn(
                'h-2.5 w-2.5 md:h-3 md:w-3 rounded-full justify-self-center transition-colors duration-300',
                i < filledPips ? 'bg-terracotta' : 'bg-bone/15'
              )}
            />
          ))}

          <div className="relative justify-self-center">
            <div className="h-5 w-px bg-bone/50" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center">
              <div className="text-[10px] font-mono text-bone/40 uppercase tracking-[0.2em] leading-none mb-1">
                Goal
              </div>
              <div className="text-sm font-semibold text-terracotta leading-none">
                {goalReached
                  ? `+${beyondGoal.toLocaleString()} beyond`
                  : showLowCountFraming
                    ? `${goal.toLocaleString()} target`
                    : `${signaturesRemaining.toLocaleString()} remaining`}
              </div>
            </div>
          </div>

          {Array.from({ length: TOTAL_PIPS - GOAL_PIP }).map((_, i) => {
            const pipIndex = GOAL_PIP + i;
            const filled = pipIndex < filledPips;
            return (
              <div
                key={pipIndex}
                style={{ transitionDelay: `${pipIndex * 30}ms` }}
                className={cn(
                  'h-2.5 w-2.5 md:h-3 md:w-3 rounded-full border justify-self-center transition-colors duration-300',
                  filled ? 'bg-terracotta border-terracotta' : 'bg-transparent border-bone/30'
                )}
              />
            );
          })}

          {/* Pinned to the grid's left edge so the label can't collide with the terracotta goal text */}
          {filledPips > 0 && (
            <div className="absolute top-0 left-0 pointer-events-none">
              <div className="h-5" aria-hidden="true" />
              <div className="mt-2 whitespace-nowrap">
                <div
                  className="text-[10px] font-mono uppercase tracking-[0.2em] leading-none mb-1 invisible"
                  aria-hidden="true"
                >
                  .
                </div>
                <div className="text-sm font-semibold text-bone leading-none">
                  {percentOfGoal}% of goal reached
                </div>
              </div>
            </div>
          )}
        </div>

        {isPetitionActive && (
          <div className="mt-4 pt-5 border-t border-bone/15 flex justify-center">
            <a
              href="#sign"
              className={cn(
                'group inline-flex items-center justify-center gap-2.5',
                'py-3 px-6 rounded-xl',
                'bg-terracotta hover:bg-terracotta-dark',
                'font-body text-sm font-semibold text-bone',
                'transition-all duration-[250ms] ease-out-custom',
                'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-light'
              )}
            >
              <span>Sign this petition</span>
              <Icon
                icon="lucide:arrow-down"
                width={16}
                height={16}
                className="transition-transform duration-300 ease-out-custom group-hover:translate-y-0.5"
              />
            </a>
          </div>
        )}
      </div>

      {!goalReached && (
        <p className="font-body text-sm text-forest/60 mt-3 text-center">
          This petition will close two weeks after we reach our goal of {goal.toLocaleString()} signatures.
        </p>
      )}
    </header>
  );
}
