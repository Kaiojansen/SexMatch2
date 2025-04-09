import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOn03xMtJps0zoDcZsdPIe3kKFmk1Z0DE",
  authDomain: "sexmatch-d0bfe.firebaseapp.com",
  projectId: "sexmatch-d0bfe",
  storageBucket: "sexmatch-d0bfe.firebasestorage.app",
  messagingSenderId: "1065119815678",
  appId: "1:1065119815678:web:50a1b6f3a61cadfa7412af",
  measurementId: "G-QSLDCG7EX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createTestPartner = async () => {
  try {
    // Criar um usuário de teste
    const testUserId = 'test-user-123';
    const testPartnerCode = 'TEST123';
    
    await setDoc(doc(db, 'users', testUserId), {
      partnerCode: testPartnerCode,
      displayName: 'Usuário Teste',
      email: 'test@example.com',
      partnerId: null,
      pendingPartner: null,
      cardHistory: {},
    });

    // Adicionar algumas cartas de teste
    const testCards = [
      {
        id: 'card1',
        title: 'Jantar Romântico',
        description: 'Um jantar à luz de velas com música suave',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c834d2e4c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        category: 'romance'
      },
      {
        id: 'card2',
        title: 'Massagem Sensual',
        description: 'Uma massagem relaxante com óleos essenciais',
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        category: 'sensual'
      },
      {
        id: 'card3',
        title: 'Dança Íntima',
        description: 'Uma dança lenta e sensual apenas para vocês dois',
        imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        category: 'romance'
      }
    ];

    for (const card of testCards) {
      await setDoc(doc(db, 'cards', card.id), card);
    }

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('Código do parceiro:', testPartnerCode);
    console.log('ID do usuário:', testUserId);

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
};

createTestPartner(); 