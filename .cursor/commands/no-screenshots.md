# Do Not Take Any Screenshots

## Overview
CRITICAL INSTRUCTION: Do NOT take, capture, or append any screenshots during development.

## Restrictions:
- Never use screenshot functionality
- Never capture visual output of applications
- Never include image attachments in responses
- Do not attempt to verify UI changes visually through screenshots

### Alternative Approaches:
Example: browser_evaluate(() => document.querySelector('.result').textContent) then verify the returned text matches expectations.

- Describe UI changes in text
- Use code comments to explain visual elements
- Provide detailed textual descriptions of expected visual output
- Reference specific HTML/CSS elements by their selectors or classes
- Use browser DevTools descriptions instead of visual captures

### Reason:
The current LLM model does not support image input. Screenshots will cause errors or be ignored by the model.

## When Frontend Changes Are Made:
- Describe the expected visual result in words
- List the specific components/elements that changed
- Explain the styling changes using CSS properties
- Confirm functionality through code review, not visual inspection

This rule applies to ALL frontend development work, including but not limited to:
- React/Vue/Angular components
- HTML/CSS changes
- UI debugging
- Layout modifications
- Styling updates