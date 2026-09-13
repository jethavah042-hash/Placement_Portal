exports.generateMockResponse = async (promptType, inputData) => {
  switch(promptType) {
    case 'resume-review':
      return {
        score: 85,
        suggestions: ["Expand on your project impact using quantifiable metrics.", "Ensure consistent bullet point pacing."]
      };
    case 'skill-gap':
      return {
        missingSkills: ["Docker", "Kubernetes", "Redis"],
        recommendedPaths: ["Complete a microservices crash course."]
      };
    default:
      return { message: "Mock provider generated a default response." };
  }
};
