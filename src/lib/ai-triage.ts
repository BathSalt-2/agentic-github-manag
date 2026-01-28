interface TriageAnalysis {
  suggestedLabels: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  comment: string
  reasoning: string
}

export async function analyzeIssueWithAI(
  title: string,
  body: string,
  repoName: string
): Promise<TriageAnalysis> {
  const promptText = `You are an expert GitHub issue triager. Analyze this issue and provide triage recommendations.

Repository: ${repoName}
Issue Title: ${title}
Issue Body: ${body || 'No description provided'}

Based on the issue title and description, provide:
1. Suggested labels (3-5 relevant labels like bug, feature, documentation, enhancement, good-first-issue, etc.)
2. Priority level (low, medium, high, or critical)
3. Category (one of: bug, feature-request, documentation, question, enhancement, maintenance)
4. A helpful comment to post on the issue that:
   - Thanks the user for filing the issue
   - Summarizes the issue in 1-2 sentences
   - Suggests next steps or asks clarifying questions if needed
   - Maintains a friendly, professional tone
5. Your reasoning for these decisions (2-3 sentences)

Return the result as a JSON object with properties: suggestedLabels (array), priority (string), category (string), comment (string), reasoning (string).`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const data = JSON.parse(response)
    
    return {
      suggestedLabels: data.suggestedLabels || [],
      priority: data.priority || 'medium',
      category: data.category || 'question',
      comment: data.comment || 'Thank you for filing this issue!',
      reasoning: data.reasoning || 'Analysis based on issue content'
    }
  } catch (error) {
    console.error('AI analysis failed:', error)
    throw new Error('Failed to analyze issue with AI')
  }
}

export async function batchAnalyzeIssues(
  issues: Array<{ title: string; body: string; repo: string }>
): Promise<TriageAnalysis[]> {
  const analyses = await Promise.all(
    issues.map(issue => analyzeIssueWithAI(issue.title, issue.body, issue.repo))
  )
  return analyses
}

export async function generateIssueResponse(
  issueTitle: string,
  issueBody: string,
  userQuestion: string
): Promise<string> {
  const promptText = `You are a helpful GitHub bot assistant. Generate a response to a user's question about their issue.

Issue Title: ${issueTitle}
Issue Body: ${issueBody}
User Question: ${userQuestion}

Generate a helpful, concise response that addresses the user's question. Be friendly and professional.`

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o-mini', false)
    return response
  } catch (error) {
    console.error('Failed to generate response:', error)
    return 'I apologize, but I was unable to generate a response at this time.'
  }
}
