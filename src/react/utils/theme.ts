/**
 * DEPRECATED LOCATION — kept only for backwards compatibility.
 *
 * All colors and theme styles now live in `src/theme/appTheme.ts`, which is the
 * single source of truth per Rule 9 of our code standards (see AGENTS.md).
 *
 * New code should import from `src/theme/appTheme.ts` directly:
 *
 *   import { appPalette, colors } from '@/theme/appTheme';
 *
 * This module simply re-exports that theme so existing importers keep working
 * while they are migrated.
 */
export { theme, muiTheme, classes, appPalette, colors, overlays, rankTierColors } from '../../theme/appTheme';
export type { DatamineTheme } from '../../theme/appTheme';
