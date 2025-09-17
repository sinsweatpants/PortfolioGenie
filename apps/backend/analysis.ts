import type { Portfolio, Project } from "@shared/schema";

export interface PerformanceReport {
  score: number;
  projectCount: number;
  averageDescriptionLength: number;
  hasLargeImages: boolean;
  customScriptBlocks: number;
  recommendations: string[];
}

export interface AccessibilityReport {
  score: number;
  missingAltTags: number;
  lowContrastPairs: number;
  headingIssues: number;
  notes: string[];
}

function wordsIn(text: string | null | undefined): number {
  if (!text) {
    return 0;
  }

  return text
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function analyzePerformance(portfolio: Portfolio, projects: Project[]): PerformanceReport {
  const projectCount = projects.length;
  const averageDescriptionLength =
    projectCount === 0
      ? 0
      : Math.round(
          projects.reduce((acc, project) => acc + wordsIn(project.description), 0) / projectCount,
        );

  const hasLargeImages = projects.some((project) => {
    if (!project.imageUrl) {
      return false;
    }
    return /original|large|full/i.test(project.imageUrl) || project.imageUrl.includes("?raw=true");
  });

  const customScriptBlocks = Array.isArray(portfolio.customization?.scripts)
    ? (portfolio.customization.scripts as unknown[]).length
    : 0;

  const recommendations: string[] = [];

  if (projectCount > 8) {
    recommendations.push("Consider lazy loading or splitting projects into categories to reduce initial load.");
  }

  if (averageDescriptionLength > 160) {
    recommendations.push("Trim project descriptions to keep them scannable and avoid large blocks of text.");
  }

  if (hasLargeImages) {
    recommendations.push("Optimize or convert large hero images to next-gen formats like WebP or AVIF.");
  }

  if (customScriptBlocks > 2) {
    recommendations.push("Review custom script blocks to ensure they are deferred or loaded asynchronously.");
  }

  const score = Math.max(
    40,
    100 - recommendations.length * 10 - (hasLargeImages ? 10 : 0) - Math.max(0, projectCount - 6) * 2,
  );

  return {
    score,
    projectCount,
    averageDescriptionLength,
    hasLargeImages,
    customScriptBlocks,
    recommendations,
  };
}

export function analyzeAccessibility(portfolio: Portfolio, projects: Project[]): AccessibilityReport {
  let missingAltTags = 0;
  let lowContrastPairs = 0;
  let headingIssues = 0;

  projects.forEach((project) => {
    if (project.imageUrl && !project.description) {
      missingAltTags += 1;
    }

    if (Array.isArray(project.tags) && project.tags.length === 0) {
      headingIssues += 1;
    }
  });

  const customization = (portfolio.customization || {}) as Record<string, any>;
  const palette = customization.colors as Record<string, string> | undefined;

  if (palette?.primary && palette?.background) {
    const contrast = estimateContrastRatio(palette.primary, palette.background);
    if (contrast < 4.5) {
      lowContrastPairs += 1;
    }
  }

  const notes: string[] = [];

  if (missingAltTags > 0) {
    notes.push("Add descriptive alt text to every project image to improve accessibility.");
  }

  if (lowContrastPairs > 0) {
    notes.push("Adjust primary and background colors to meet WCAG AA contrast ratio (4.5:1).");
  }

  if (headingIssues > 0) {
    notes.push("Ensure project sections follow a logical heading hierarchy (e.g., H2 for section titles).");
  }

  const score = Math.max(30, 100 - missingAltTags * 10 - lowContrastPairs * 15 - headingIssues * 5);

  return {
    score,
    missingAltTags,
    lowContrastPairs,
    headingIssues,
    notes,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (![3, 6].includes(normalized.length)) {
    return null;
  }

  const full = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  const value = parseInt(full, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const convert = (channel: number) => {
    const proportion = channel / 255;
    return proportion <= 0.03928 ? proportion / 12.92 : Math.pow((proportion + 0.055) / 1.055, 2.4);
  };

  return convert(r) * 0.2126 + convert(g) * 0.7152 + convert(b) * 0.0722;
}

function estimateContrastRatio(colorA: string, colorB: string): number {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);

  if (!a || !b) {
    return 1;
  }

  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);

  const brighter = Math.max(lumA, lumB) + 0.05;
  const darker = Math.min(lumA, lumB) + 0.05;

  return Number((brighter / darker).toFixed(2));
}
