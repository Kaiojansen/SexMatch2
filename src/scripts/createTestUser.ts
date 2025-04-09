import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const createTestUser = async () => {
  const testUserId = 'test_user_123';
  const testPartnerCode = 'TEST123'; // Código fixo para facilitar os testes

  try {
    await setDoc(doc(db, 'users', testUserId), {
      partnerCode: testPartnerCode,
      partnerId: null,
      pendingPartner: null,
      email: 'test@example.com',
      createdAt: new Date()
    });
    
    console.log('Usuário de teste criado com sucesso!');
    console.log('Código do parceiro de teste:', testPartnerCode);
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
  }
};

createTestUser(); 