/**
 * Design System Rule Set
 * 
 * This file serves as a reference for the design principles that should be
 * followed throughout the application.
 */

export const designSystemRules = {
  // Core Principles
  invisibleDesign: "Prioritize seamless and intuitive user experiences. The design itself should feel natural and unobtrusive, minimizing user friction.",
  designThinking: "Base all design decisions on a deep understanding of user needs, emotions, and potential points of confusion or delight. Empathy is paramount.",
  formFollowsFunction: "Functionality must guide the design's form. Prioritize simplicity, clarity, and effectiveness in how the design works, ensuring it balances well with aesthetics.",
  observationLearning: "Continuously analyze successful designs to identify effective patterns, structural choices, color use, spacing, and emotional impact. Adapt and innovate based on these findings.",
  constraintsDriveCreativity: "Embrace minimalism and purposeful restraint. Use limitations as opportunities to drive focused, creative, and impactful design solutions.",
  intentionalDesign: "Ensure every design element and decision serves a clear purpose and aligns with the overall goals.",
  humanCentered: "Aim for designs that are holistic, sustainable, and driven by empathy, reflecting a human-centric approach."
};

// Application in practice - examples of how these principles translate to coding decisions
export const practicalApplications = {
  componentStructure: "Components should have a clear single responsibility and intuitive APIs",
  stateManagement: "State should be managed at the appropriate level, avoiding unnecessary complexity",
  accessibility: "All interfaces must be accessible to all users, regardless of ability",
  performance: "Components should be optimized for performance, avoiding unnecessary re-renders",
  responsiveness: "All layouts must be responsive and work well across device sizes",
  consistentNaming: "Naming conventions should be consistent and clearly communicate purpose"
};

// Export a helper to check if a design decision aligns with our principles
export const evaluateDesignDecision = (
  decision: string,
  principle: keyof typeof designSystemRules
): string => {
  return `Evaluating: "${decision}" against principle: ${principle}\n${designSystemRules[principle]}`;
}; 