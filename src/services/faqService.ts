// services/faqService.ts
import { getDatabase } from '@/lib/mongodb';
import { FAQDocument, CreateFAQInput, UpdateFAQInput } from '@/types/faq';
import { ObjectId } from 'mongodb';

export class FAQService {
  private static readonly COLLECTION_NAME = 'faqs';

  /**
   * Ottiene tutte le FAQ attive ordinate
   */
  static async getAllFAQs(locale?: 'it' | 'en'): Promise<FAQDocument[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      const faqs = await collection
        .find({ 'metadata.isActive': true })
        .sort({ order: 1 })
        .toArray();

      return faqs;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw new Error('Impossibile recuperare le FAQ');
    }
  }

  /**
   * Ottiene tutte le FAQ (incluse non attive) per admin
   */
  static async getAllFAQsAdmin(): Promise<FAQDocument[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      const faqs = await collection
        .find({})
        .sort({ order: 1 })
        .toArray();

      return faqs;
    } catch (error) {
      console.error('Error fetching FAQs for admin:', error);
      throw new Error('Impossibile recuperare le FAQ');
    }
  }

  /**
   * Ottiene una singola FAQ per ID
   */
  static async getFAQById(id: string): Promise<FAQDocument | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      const faq = await collection.findOne({ _id: new ObjectId(id) });
      return faq;
    } catch (error) {
      console.error('Error fetching FAQ by ID:', error);
      throw new Error('Impossibile recuperare la FAQ');
    }
  }

  /**
   * Crea una nuova FAQ
   */
  static async createFAQ(input: CreateFAQInput): Promise<string> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      // Se order non è specificato, metti alla fine
      let order = input.order;
      if (order === undefined) {
        const lastFAQ = await collection
          .find({})
          .sort({ order: -1 })
          .limit(1)
          .toArray();
        order = lastFAQ.length > 0 ? lastFAQ[0].order + 1 : 1;
      }

      const newFAQ: FAQDocument = {
        translations: {
          it: {
            question: input.questionIT,
            answer: input.answerIT,
            category: input.categoryIT,
          },
          en: {
            question: input.questionEN,
            answer: input.answerEN,
            category: input.categoryEN,
          },
        },
        order,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
      };

      const result = await collection.insertOne(newFAQ);
      return result.insertedId.toString();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw new Error('Impossibile creare la FAQ');
    }
  }

  /**
   * Aggiorna una FAQ esistente
   */
  static async updateFAQ(id: string, input: UpdateFAQInput): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      const updateData: any = {
        'metadata.updatedAt': new Date(),
      };

      // Aggiorna solo i campi forniti
      if (input.questionIT !== undefined) {
        updateData['translations.it.question'] = input.questionIT;
      }
      if (input.answerIT !== undefined) {
        updateData['translations.it.answer'] = input.answerIT;
      }
      if (input.categoryIT !== undefined) {
        updateData['translations.it.category'] = input.categoryIT;
      }
      if (input.questionEN !== undefined) {
        updateData['translations.en.question'] = input.questionEN;
      }
      if (input.answerEN !== undefined) {
        updateData['translations.en.answer'] = input.answerEN;
      }
      if (input.categoryEN !== undefined) {
        updateData['translations.en.category'] = input.categoryEN;
      }
      if (input.order !== undefined) {
        updateData.order = input.order;
      }
      if (input.isActive !== undefined) {
        updateData['metadata.isActive'] = input.isActive;
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new Error('FAQ non trovata');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw new Error('Impossibile aggiornare la FAQ');
    }
  }

  /**
   * Elimina una FAQ
   */
  static async deleteFAQ(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        throw new Error('FAQ non trovata');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw new Error('Impossibile eliminare la FAQ');
    }
  }

  /**
   * Riordina le FAQ
   */
  static async reorderFAQs(orderedIds: string[]): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      // Aggiorna l'ordine di ogni FAQ
      const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
          filter: { _id: new ObjectId(id) },
          update: { $set: { order: index + 1 } },
        },
      }));

      if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps);
      }
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      throw new Error('Impossibile riordinare le FAQ');
    }
  }

  /**
   * Toggle attiva/disattiva FAQ
   */
  static async toggleFAQActive(id: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection<FAQDocument>(this.COLLECTION_NAME);

      const faq = await collection.findOne({ _id: new ObjectId(id) });
      if (!faq) {
        throw new Error('FAQ non trovata');
      }

      const newActiveState = !faq.metadata.isActive;

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'metadata.isActive': newActiveState,
            'metadata.updatedAt': new Date(),
          },
        }
      );

      return newActiveState;
    } catch (error) {
      console.error('Error toggling FAQ active:', error);
      throw new Error('Impossibile modificare lo stato della FAQ');
    }
  }
}
