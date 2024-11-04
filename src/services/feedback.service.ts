import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs,
  updateDoc,
  doc,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Feedback {
  email: string;
  feedback: string;
  page: string;
  createdAt: string;
  status: 'new' | 'read' | 'resolved';
}

const FEEDBACK_COLLECTION = 'feedback';

export const feedbackService = {
  async addFeedback(data: Omit<Feedback, 'createdAt' | 'status'>): Promise<void> {
    try {
      const feedbackRef = collection(db, FEEDBACK_COLLECTION);
      await addDoc(feedbackRef, {
        ...data,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  },

  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const feedbackRef = collection(db, FEEDBACK_COLLECTION);
      const q = query(feedbackRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Feedback, 'id'>)
      })) as Feedback[];
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  },

  async updateFeedbackStatus(
    feedbackId: string, 
    status: 'new' | 'read' | 'resolved'
  ): Promise<void> {
    try {
      const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      await updateDoc(feedbackRef, { status });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  },

  async getFeedbackByEmail(email: string): Promise<Feedback[]> {
    try {
      const feedbackRef = collection(db, FEEDBACK_COLLECTION);
      const q = query(
        feedbackRef, 
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Feedback, 'id'>)
      })) as Feedback[];
    } catch (error) {
      console.error('Error getting feedback by email:', error);
      return [];
    }
  }
};

export type { Feedback }; 