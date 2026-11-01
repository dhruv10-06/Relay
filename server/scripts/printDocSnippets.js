import { db } from '../models/db.js';

async function printDocSnippets() {
  const projects = await db.getProjects();
  const docs = await db.getDocuments(projects[0].id);

  for (const doc of docs) {
    console.log(`\n==================================================`);
    console.log(`DOCUMENT: ${doc.fileName}`);
    console.log(`==================================================`);
    console.log(doc.extractedText.slice(0, 800));
  }
}

printDocSnippets().catch(console.error);
