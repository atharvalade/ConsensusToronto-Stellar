import { fetchNewsWithGemini } from './geminiService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Fetching and analyzing latest news with Gemini...');
    const newsArticles = await fetchNewsWithGemini();
    
    // Create the output file path
    const outputPath = path.join(__dirname, 'news_data.json');
    
    // Save the news articles to a JSON file
    fs.writeFileSync(
      outputPath,
      JSON.stringify(newsArticles, null, 2),
      'utf8'
    );
    
    console.log(`Successfully fetched and analyzed ${newsArticles.length} news articles`);
    console.log(`Results saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error in news fetching process:', error);
  }
}

main(); 