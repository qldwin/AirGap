import { defineEventHandler, useSession } from 'h3';
import * as crypto from 'crypto';

// Configuration de session commune pour toute l'application
export const SESSION_CONFIG = {
  name: 'finantia-session',
  password: process.env.NUXT_SESSION_PASSWORD!,
  maxAge: 60 * 60 * 24 * 7, // 7 jours par défaut
  cookie: {
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
};

// Créer une interface pour le type de session afin d'éviter des erreurs de typage
interface SessionData {
  loggedIn?: boolean;
  user?: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
}

// Créer une session minimale pour utiliser en cas d'erreur
function createMinimalSession() {
  const sessionId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString('hex');
  
  return {
    id: sessionId,
    data: {
      loggedIn: false,
      user: { id: null, name: null, email: null }
    } as SessionData,
    update: async (data: Partial<SessionData>) => {
      console.log('Session factice mise à jour:', data);
      return Promise.resolve();
    },
    clear: async () => {
      console.log('Session factice effacée');
      return Promise.resolve();
    }
  };
}

// Middleware qui initialise la session pour chaque requête
export default defineEventHandler(async (event) => {
  try {
    // Initialiser une session avec la configuration commune
    let session;
    
    try {
      session = await useSession(event, SESSION_CONFIG);
      
      // S'assurer que la structure de données de session est correcte
      if (!session.data) {
        session.data = {};
      }
      
      if (!session.data.user) {
        session.data.user = { id: null, name: null, email: null };
      } else {
        // S'assurer que tous les champs requis existent
        session.data.user.id = session.data.user.id || null;
        session.data.user.name = session.data.user.name || null;
        session.data.user.email = session.data.user.email || null;
      }
      
    } catch (error) {
      console.warn('Erreur lors de la récupération de session, création d\'une session minimale:', error);
      // Créer une session minimale en cas d'échec
      session = createMinimalSession();
    }
    
    // Rendre la session disponible dans le contexte de l'événement
    event.context.session = session;
    
  } catch (error) {
    console.error('Erreur critique d\'initialisation de session:', error);
    
    // Créer un objet session minimal même en cas d'erreur critique
    event.context.session = createMinimalSession();
  }
}); 