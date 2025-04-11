import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportCards() {
  try {
    const cardsRef = collection(db, 'cards');
    const querySnapshot = await getDocs(cardsRef);
    
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Create the output directory if it doesn't exist
    const outputDir = path.join(path.dirname(__dirname), '..', 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write the cards to a JSON file
    const outputPath = path.join(outputDir, 'cards_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2));
    
    console.log(`Successfully exported ${cards.length} cards to ${outputPath}`);
  } catch (error) {
    console.error('Error exporting cards:', error);
  }
}

exportCards(); 