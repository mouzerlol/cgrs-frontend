import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UtilityDock from '@/components/sections/UtilityDock';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';

const useFeatureFlag = vi.fn();
const useAllFeatureFlags = vi.fn();

vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: (id: string) => useFeatureFlag(id),
  useAllFeatureFlags: () => useAllFeatureFlags(),
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
  useFadeUpObserver: () => {},
  useStaggeredReveal: () => () => null,
}));

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => {
    const { fill: _f, sizes: _s, unoptimized: _u, ...rest } = props;
    return <img alt={alt as string} {...rest} />;
  },
}));

describe('UtilityDock', () => {
  beforeEach(() => {
    useFeatureFlag.mockImplementation((flagId: string) => {
      if (flagId === FEATURE_FLAG_IDS.HOME_UTILITY_DOCK) return true;
      return true;
    });
    useAllFeatureFlags.mockReturnValue({});
  });

  it('renders the dock when home.utility-dock is enabled', () => {
    render(<UtilityDock overlapHero={false} />);

    expect(screen.getByRole('link', { name: /Management Request/i })).toBeInTheDocument();
    expect(document.querySelector('.utility-dock')).toBeInTheDocument();
  });

  it('renders nothing when home.utility-dock is disabled', () => {
    useFeatureFlag.mockImplementation((flagId: string) => {
      if (flagId === FEATURE_FLAG_IDS.HOME_UTILITY_DOCK) return false;
      return true;
    });

    const { container } = render(<UtilityDock overlapHero={false} />);

    expect(container.firstChild).toBeNull();
  });
});
