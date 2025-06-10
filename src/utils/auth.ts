
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    // Cargar usuario desde localStorage si existe
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  async login(email: string, password: string): Promise<AuthUser> {
    // Simulación de login - en producción usarías Supabase
    console.log('Attempting login:', email);
    
    // Simulación de validación
    if (email && password) {
      const user: AuthUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0]
      };
      
      this.currentUser = user;
      localStorage.setItem('authUser', JSON.stringify(user));
      return user;
    }
    
    throw new Error('Credenciales inválidas');
  }

  async register(email: string, password: string, name: string): Promise<AuthUser> {
    console.log('Attempting registration:', email, name);
    
    if (email && password && name) {
      const user: AuthUser = {
        id: Date.now().toString(),
        email,
        name
      };
      
      this.currentUser = user;
      localStorage.setItem('authUser', JSON.stringify(user));
      return user;
    }
    
    throw new Error('Datos de registro inválidos');
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('authUser');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
