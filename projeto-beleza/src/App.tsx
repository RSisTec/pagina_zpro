// React é importado automaticamente no Vite
import logo from './assets/logo.png';
import ServicesGrid from './components/ServicesGrid';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-pink-50">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <img src={logo} alt="Beauty Studio Logo" className="h-32 mb-2" />
          <h1 className="text-3xl font-bold text-pink-700 text-center">Beauty Studio</h1>
          <p className="text-pink-500 text-center mt-2">Realce sua beleza natural com nossos serviços especializados</p>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold text-pink-800 mb-6 text-center">Nossos Serviços</h2>
        <ServicesGrid />
      </main>
      
      <footer className="bg-pink-200 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-pink-700">© 2024 Beauty Studio. Todos os direitos reservados.</p>
          <p className="text-pink-600 mt-2">Entre em contato para mais informações e agendamentos.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
