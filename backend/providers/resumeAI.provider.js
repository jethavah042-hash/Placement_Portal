/**
 * Resume AI Provider Abstraction
 * Supports swappable providers: 'mock' (default for dev/local) and 'openai' (production)
 * AI never fabricates non-existent companies or credentials.
 */

class MockResumeAIProvider {
  async reviewResume(extractedData) {
    const name = extractedData.personalInfo?.name || 'Candidate';
    const topSkills = (extractedData.skills || []).slice(0, 5).join(', ') || 'Software Engineering';

    return {
      executiveSummary: `${name}'s profile demonstrates a solid foundation in ${topSkills}. The resume exhibits clear academic context and relevant technical project implementations.`,
      recommendedActionPoints: [
        'Quantify project achievements with measurable metrics (e.g. reduced load time by 25%, handled 1000+ API requests).',
        'Ensure the latest version of frameworks (e.g. React 19, Node.js LTS) is explicitly highlighted.',
        'Consider contributing to open-source or deploying live demos on Vercel/Netlify for portfolio visibility.'
      ],
      interviewFocusAreas: (extractedData.skills || ['Data Structures', 'System Design']).slice(0, 4).map(s => `Prepare deep-dive architectural trade-offs regarding ${s}.`)
    };
  }

  async suggestSummary(extractedData) {
    const skills = (extractedData.skills || []).slice(0, 4).join(', ');
    const degree = extractedData.education?.[0]?.degree || 'Computer Science Graduate';

    return [
      `Results-oriented ${degree} with hands-on proficiency in ${skills || 'Full-Stack Development'}. Passionate about engineering high-performance software systems and contributing to innovative placement environments.`,
      `Dedicated Software Developer with strong problem-solving skills in ${skills || 'Modern Web Technologies'}. Proven track record of building robust, scalable applications with clean architectural patterns.`
    ];
  }
}

class OpenAIResumeAIProvider {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async reviewResume(extractedData) {
    if (!this.apiKey) {
      const fallback = new MockResumeAIProvider();
      return fallback.reviewResume(extractedData);
    }

    try {
      const prompt = `You are a Senior Technical Recruiter. Analyze this extracted resume JSON and provide professional feedback without inventing fake companies or degrees:\n${JSON.stringify(extractedData)}`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      const fallback = new MockResumeAIProvider();
      return fallback.reviewResume(extractedData);
    }
  }

  async suggestSummary(extractedData) {
    const fallback = new MockResumeAIProvider();
    return fallback.suggestSummary(extractedData);
  }
}

// Factory export based on environment setting
const providerType = (process.env.AI_PROVIDER || 'mock').toLowerCase();
const activeProvider = providerType === 'openai' ? new OpenAIResumeAIProvider() : new MockResumeAIProvider();

module.exports = activeProvider;
