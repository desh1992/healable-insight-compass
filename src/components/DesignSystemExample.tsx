import React from 'react';
import { designSystemRules, evaluateDesignDecision } from '../lib/designSystem';
import { colors, spacing, typography, borderRadius } from '../lib/theme';

// Example component demonstrating design system principles
const DesignSystemExample: React.FC = () => {
  // State to track which principle is being viewed
  const [activePrinciple, setActivePrinciple] = React.useState<keyof typeof designSystemRules>('invisibleDesign');

  // Example of a design decision we might evaluate
  const designDecision = "Using subtle animations to guide users between states rather than abrupt changes";
  
  // Function to get all principles as an array of entries
  const getPrinciples = () => Object.entries(designSystemRules) as [keyof typeof designSystemRules, string][];

  return (
    <div
      style={{
        padding: spacing.lg,
        fontFamily: typography.fontFamily.base,
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ 
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.lg,
        color: colors.neutral[900],
      }}>
        Design System Principles
      </h1>
      
      <p style={{ 
        fontSize: typography.fontSize.md,
        lineHeight: typography.lineHeight.relaxed,
        marginBottom: spacing.xl,
        color: colors.neutral[700],
      }}>
        These principles guide our design decisions and help create a cohesive user experience.
        Select a principle to see how it's applied.
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl }}>
        {getPrinciples().map(([key, value]) => (
          <button
            key={key}
            onClick={() => setActivePrinciple(key)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: activePrinciple === key ? colors.primary.main : colors.neutral[100],
              color: activePrinciple === key ? colors.primary.contrast : colors.neutral[800],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>
      
      <div style={{
        padding: spacing.lg,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.lg,
        borderLeft: `4px solid ${colors.primary.main}`,
      }}>
        <h2 style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.md,
          color: colors.neutral[800],
        }}>
          {activePrinciple.replace(/([A-Z])/g, ' $1').trim()}
        </h2>
        <p style={{
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.default,
          color: colors.neutral[700],
          marginBottom: spacing.lg,
        }}>
          {designSystemRules[activePrinciple]}
        </p>
        
        <div style={{
          backgroundColor: colors.secondary.light,
          padding: spacing.md,
          borderRadius: borderRadius.md,
        }}>
          <h3 style={{
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.sm,
            color: colors.neutral[800],
          }}>
            Example Application
          </h3>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.neutral[700],
          }}>
            {evaluateDesignDecision(designDecision, activePrinciple)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemExample; 