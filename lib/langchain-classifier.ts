// /lib/langchain-classifier.ts

// OPTIONAL: Usage example for LangChain.js with OpenAI for email classification.
// Install: npm install langchain openai

/* Uncomment if you want to use LangChain.js classification */

// import { ChatOpenAI } from "langchain/chat_models/openai";
// import { PromptTemplate } from "langchain/prompts";
// import { StringOutputParser } from "langchain/schema/output_parser";
// 
// export async function classifyWithLangChain(emails: any[], openaiApiKey: string) {
//   // Minimal prompt template
//   const prompt = PromptTemplate.fromTemplate(`
// You are an email classification assistant. Classify each email into one of: Important, Promotions, Social, Marketing, Spam, General.
// Respond ONLY with a valid JSON array: [{{#each emails}} { "id": "{{this.id}}", "category": "" } {{/each}} ]
// Emails:
// {{#each emails}}
// id: {{this.id}}, subject: {{this.subject}}, snippet: {{this.snippet}}, body: {{this.body}}
// {{/each}}
// `);
// 
//   // Set up OpenAI model
//   const llm = new ChatOpenAI({
//     apiKey: openaiApiKey,
//     modelName: "gpt-4o",
//     temperature: 0,
//   });
// 
//   // Use output parser for strict JSON
//   const parser = new StringOutputParser();
// 
//   // Format prompt with emails
//   const input = await prompt.format({ emails });
// 
//   // Call model
//   const res = await llm.call([ { role: "user", content: input } ]);
// 
//   // Output: parse JSON
//   return parser.parse(res.content);
// }
