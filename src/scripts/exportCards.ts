import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

interface CardData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

async function exportCards() {
  try {
    const cardsRef = collection(db, 'cards');
    const querySnapshot = await getDocs(cardsRef);
    
    const cards: CardData[] = [];
    querySnapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data()
      } as CardData);
    });

    // Create the output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'exports');
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