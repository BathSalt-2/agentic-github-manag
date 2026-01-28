interface GenerateTemplateParams {
  type: string
  description: string
  context?: string
  repoName?: string
}

interface IssueTemplate {
  title: string
  body: string
  labels: string[]
  assignees: string[]
  reasoning: string
}

const TEMPLATE_STRUCTURES = {
  bug: `## Description
[Brief description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- OS: [e.g., Windows 10, macOS 13, Ubuntu 22.04]
- Browser: [if applicable]
- Version: [application version]

## Additional Context
[Any other context about the problem]

## Screenshots
[If applicable, add screenshots to help explain the problem]`,

  feature: `## Feature Description
[Clear and concise description of the feature]

## Problem Statement
[What problem does this feature solve?]

## Proposed Solution
[Describe how you envision this feature working]

## Alternative Solutions
[Have you considered any alternative approaches?]

## Use Cases
[Describe specific scenarios where this feature would be valuable]

## Additional Context
[Any other context, mockups, or examples]`,

  documentation: `## Documentation Issue
[What documentation needs to be added or improved?]

## Current State
[What is currently documented, if anything?]

## Proposed Changes
[What should be documented or changed?]

## Target Audience
[Who is this documentation for? Beginners, advanced users, etc.]

## Related Resources
[Links to related documentation or discussions]`,

  performance: `## Performance Issue Description
[Brief description of the performance problem]

## Current Performance
[Describe current performance metrics]

## Expected Performance
[What performance level is expected?]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Environment
- OS: [operating system]
- Hardware: [relevant specs]
- Version: [application version]

## Profiling Data
[If available, include profiling results or metrics]

## Additional Context
[Any other relevant information]`,

  security: `## Security Concern

⚠️ **PLEASE REVIEW CAREFULLY BEFORE POSTING**
If this is a critical vulnerability, consider reporting it privately through GitHub Security Advisories.

## Issue Type
[Vulnerability, Security Enhancement, etc.]

## Description
[Describe the security concern]

## Potential Impact
[What could happen if this is exploited?]

## Steps to Reproduce (if applicable)
1. [First step]
2. [Second step]
3. [Third step]

## Proposed Solution
[How could this be mitigated?]

## Additional Context
[Any other relevant security information]`,

  question: `## Question
[Your question here]

## Context
[Provide context about what you're trying to do]

## What I've Tried
[Describe any attempts you've made to solve this]

## Environment (if relevant)
[Version, OS, browser, etc.]

## Additional Information
[Any other relevant details]`,
}

export async function generateIssueTemplate(params: GenerateTemplateParams): Promise<IssueTemplate> {
  const { type, description, context, repoName } = params

  const baseStructure = TEMPLATE_STRUCTURES[type as keyof typeof TEMPLATE_STRUCTURES] || TEMPLATE_STRUCTURES.bug

  const promptText = `You are an expert GitHub issue template generator. Based on the user's input, generate a comprehensive, well-structured issue that will help maintainers understand and address the problem or request effectively.

Issue Type: ${type}
User Description: ${description}
${context ? `Additional Context: ${context}` : ''}
${repoName ? `Repository: ${repoName}` : ''}

Base Template Structure:
${baseStructure}

Instructions:
1. Generate a clear, specific issue TITLE (not generic - make it descriptive of the actual problem/request)
2. Fill in the template sections with realistic, helpful content based on the user's description
3. Replace placeholder text with actual content that makes sense
4. If information is missing, use "[To be filled]" or reasonable defaults
5. Suggest 3-5 relevant labels (e.g., bug, enhancement, documentation, good-first-issue, priority:high, etc.)
6. Optionally suggest assignees if the context implies specific team ownership (can be empty array)
7. Provide reasoning for your template generation choices

Return the result as a JSON object with properties: title (string), body (string), labels (array of strings), assignees (array of strings), reasoning (string).

Make the title concise but specific - it should clearly communicate what the issue is about without reading the body.
Make the body comprehensive and well-structured using the template format.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const data = JSON.parse(response)
    
    return {
      title: data.title || 'Issue Title',
      body: data.body || baseStructure,
      labels: Array.isArray(data.labels) ? data.labels : [],
      assignees: Array.isArray(data.assignees) ? data.assignees : [],
      reasoning: data.reasoning || 'Template generated based on user input',
    }
  } catch (error) {
    console.error('Failed to generate issue template:', error)
    throw new Error('Failed to generate issue template with AI')
  }
}

export async function analyzeAndSuggestTemplate(
  title: string,
  partialBody: string
): Promise<{ suggestedType: string; confidence: number; reasoning: string }> {
  const promptText = `Analyze this partially written GitHub issue and suggest the best issue type.

Title: ${title}
Body (partial): ${partialBody}

Based on the content, determine:
1. The most appropriate issue type (bug, feature, documentation, performance, security, or question)
2. Your confidence level (0-100)
3. Brief reasoning for your choice

Return as JSON with properties: suggestedType (string), confidence (number 0-100), reasoning (string).`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const data = JSON.parse(response)
    
    return {
      suggestedType: data.suggestedType || 'question',
      confidence: data.confidence || 50,
      reasoning: data.reasoning || 'Based on content analysis',
    }
  } catch (error) {
    console.error('Failed to analyze issue:', error)
    return {
      suggestedType: 'question',
      confidence: 0,
      reasoning: 'Analysis failed',
    }
  }
}
